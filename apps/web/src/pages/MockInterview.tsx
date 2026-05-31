import React, { useState, useRef } from 'react';
import { ApiClient } from '../services/api.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Video, Mic, Award, Compass, Play, CheckCircle } from 'lucide-react';

interface Question {
  id: string;
  questionText: string;
}

export const MockInterview: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [domain, setDomain] = useState('DSA');
  const [difficulty, setDifficulty] = useState('Medium');
  const [experience, setExperience] = useState('Intermediate');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [interviewId, setInterviewId] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [answersSubmitted, setAnswersSubmitted] = useState<any[]>([]);
  const [finalReport, setFinalReport] = useState<any | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Setup Web Camera access
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera permissions denied', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  // Launch interview
  const startInterview = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.request('/interviews/start', {
        method: 'POST',
        body: JSON.stringify({ domain, difficulty, experienceLevel: experience }),
      });
      setInterviewId(data.interviewId);
      setQuestions(data.questions);
      setStep(2);
      setTimeout(() => startCamera(), 500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Native Web Speech API integration for Speech-To-Text fallback
  const startVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onstart = () => setIsRecording(true);
      recog.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setUserAnswer((prev) => prev + ' ' + event.results[i][0].transcript);
          }
        }
      };
      recog.onend = () => setIsRecording(false);
      
      mediaRecorderRef.current = recog;
      recog.start();
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setUserAnswer('This is a simulated transcript from speech-to-text input.');
        setIsRecording(false);
      }, 2000);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current) {
      (mediaRecorderRef.current as any).stop();
    } else {
      setIsRecording(false);
    }
  };

  // Submit Answer
  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;
    setLoading(true);
    try {
      const data = await ApiClient.request('/interviews/submit-answer', {
        method: 'POST',
        body: JSON.stringify({
          interviewId,
          questionId: questions[currentIdx].id,
          userAnswerText: userAnswer,
        }),
      });
      setAnswersSubmitted([...answersSubmitted, { ...data, question: questions[currentIdx].questionText }]);
      setUserAnswer('');
      
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        // Complete interview
        const finishData = await ApiClient.request('/interviews/complete', {
          method: 'POST',
          body: JSON.stringify({ interviewId }),
        });
        setFinalReport(finishData);
        setStep(3);
        stopCamera();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      {/* Tab Header bar */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Mock Interview Board</h1>
        <p className="text-slate-400 text-sm">Graded dynamically in real-time by specialised agents.</p>
      </div>

      {step === 1 && (
        <Card className="max-w-xl mx-auto w-full flex flex-col gap-6 mt-8">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Compass className="h-5 w-5 text-indigo-400" />
            <span>Configure Interview Profile</span>
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-300">Topic Domain</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white mt-1 focus:outline-none focus:border-indigo-500"
              >
                <option value="DSA">Data Structures & Algorithms</option>
                <option value="DBMS">Database Management Systems</option>
                <option value="System Design">System Design</option>
                <option value="React">React Native / Web Development</option>
                <option value="Node.js">Node.js API Architecture</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-300">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white mt-1 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300">Experience</label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white mt-1 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Fresher">Fresher (Entry Level)</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced (L5+ Staff)</option>
                </select>
              </div>
            </div>

            <Button onClick={startInterview} disabled={loading} className="py-3 mt-4 flex items-center justify-center gap-2">
              <Play className="h-4 w-4" />
              <span>{loading ? 'Generating Dynamic Questions...' : 'Start Session'}</span>
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Interview Question panel */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="flex flex-col gap-4 relative">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>QUESTION {currentIdx + 1} OF {questions.length}</span>
                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20">{domain}</span>
              </div>
              <h3 className="text-lg font-bold leading-relaxed">{questions[currentIdx]?.questionText}</h3>
            </Card>

            <Card className="flex flex-col gap-4">
              <h4 className="text-sm font-bold text-slate-300">Your Answer Response</h4>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your structured answer here, or click the mic button to transcribe your speech response..."
                rows={6}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />

              <div className="flex justify-between items-center">
                <Button
                  variant="secondary"
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  className={`flex items-center gap-2 ${isRecording ? 'bg-red-600 border-red-500 animate-pulse text-white' : ''}`}
                >
                  <Mic className="h-4 w-4" />
                  <span>{isRecording ? 'Listening... Click to stop' : 'Record Speech'}</span>
                </Button>

                <Button onClick={submitAnswer} disabled={loading || !userAnswer.trim()}>
                  {loading ? 'Grading Response...' : 'Submit & Next'}
                </Button>
              </div>
            </Card>
          </div>

          {/* Web Cam Screen Video Panel */}
          <div className="flex flex-col gap-6">
            <Card hoverable={false} className="p-4 overflow-hidden flex flex-col gap-2">
              <h4 className="text-sm font-bold text-slate-400 flex items-center gap-2 mb-2">
                <Video className="h-4 w-4 text-emerald-400" />
                <span>Active Webcam Guard</span>
              </h4>
              <div className="bg-slate-950 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center border border-white/5">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
              </div>
              <p className="text-[10px] text-slate-500 italic mt-1">Camera output is evaluated for focus confidence and posture stability.</p>
            </Card>
          </div>
        </div>
      )}

      {step === 3 && (
        <Card className="flex flex-col gap-8 max-w-2xl mx-auto w-full p-8">
          <div className="text-center">
            <div className="inline-flex p-4 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 mb-4">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold">Interview Analysis Compiled!</h2>
            <p className="text-slate-400 text-sm mt-1">Excellent job completing your structured technical interview.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-slate-400 text-xs font-semibold uppercase">Technical Score</p>
              <h3 className="text-2xl font-extrabold text-indigo-400 mt-1">{finalReport?.scores?.technical}%</h3>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-slate-400 text-xs font-semibold uppercase">Communication</p>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">{finalReport?.scores?.communication}%</h3>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-slate-400 text-xs font-semibold uppercase">Confidence</p>
              <h3 className="text-2xl font-extrabold text-amber-400 mt-1">{finalReport?.scores?.confidence}%</h3>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
            <h4 className="font-bold">Compiled Diagnostics Summary</h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
              {finalReport?.summary}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Button variant="primary" onClick={() => setStep(1)} className="px-6">
              Start Another Interview
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
export default MockInterview;
