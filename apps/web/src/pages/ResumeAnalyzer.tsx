import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { UploadCloud, CheckCircle, AlertTriangle, Lightbulb, FileText, Loader2 } from 'lucide-react';

export const ResumeAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Load latest analysis if exists
    const fetchLatest = async () => {
      try {
        const data = await ApiClient.request('/resumes/latest');
        setAnalysis(data.resume);
      } catch {
        // No resume uploaded yet
      }
    };
    fetchLatest();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg('');
    }
  };

  const uploadResume = async () => {
    if (!file) return;
    setLoading(true);
    setErrorMsg('');
    setAnalysis(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const data = await ApiClient.request('/resumes/analyze', {
        method: 'POST',
        body: formData,
      });
      setAnalysis(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'File upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Resume & ATS Analyzer</h1>
        <p className="text-slate-400 text-sm">Upload CV PDF to calculate keyword matches and identify profile errors.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Upload Column */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <Card hoverable={false} className="flex flex-col gap-4 text-center">
            <h3 className="font-bold">Upload Document</h3>
            <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-2xl p-6 transition-all relative cursor-pointer flex flex-col items-center gap-3">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <UploadCloud className="h-10 w-10 text-slate-500" />
              <div className="text-xs text-slate-400">
                {file ? (
                  <span className="text-indigo-400 font-semibold">{file.name}</span>
                ) : (
                  <span>Drag & Drop PDF or click to browse</span>
                )}
              </div>
            </div>

            {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}

            <Button onClick={uploadResume} disabled={loading || !file} className="py-2.5 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing CV...</span>
                </>
              ) : (
                <span>Scan Resume</span>
              )}
            </Button>
          </Card>
        </div>

        {/* Diagnostic Results Column */}
        <div className="md:col-span-8 flex flex-col gap-6">
          {analysis ? (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* ATS Gauge Card */}
              <Card hoverable={false} className="flex justify-between items-center bg-indigo-950/20 border-indigo-500/20">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-indigo-400" />
                  <div>
                    <h4 className="font-bold text-base">{analysis.fileName || 'Uploaded Resume'}</h4>
                    <p className="text-xs text-slate-500">Evaluated score matching market criteria</p>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">ATS Score</span>
                  <h3 className="text-4xl font-extrabold text-indigo-400">{analysis.atsScore}%</h3>
                </div>
              </Card>

              {/* Skills badges */}
              <Card hoverable={false} className="flex flex-col gap-3">
                <h4 className="text-sm font-bold text-slate-300">Extracted Key Competencies</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.skills && analysis.skills.map((s: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 bg-white/5 border border-white/10 text-xs font-medium rounded-lg text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>
              </Card>

              {/* Strengths & Weaknesses details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card hoverable={false} className="flex flex-col gap-4">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4" />
                    <span>Identified Strengths</span>
                  </h4>
                  <ul className="text-xs text-slate-300 flex flex-col gap-2.5">
                    {analysis.strengths && analysis.strengths.map((str: string, idx: number) => (
                      <li key={idx} className="list-disc ml-4">{str}</li>
                    ))}
                  </ul>
                </Card>

                <Card hoverable={false} className="flex flex-col gap-4">
                  <h4 className="text-sm font-bold text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    <span>ATS Deficiencies</span>
                  </h4>
                  <ul className="text-xs text-slate-300 flex flex-col gap-2.5">
                    {analysis.weaknesses && analysis.weaknesses.map((w: string, idx: number) => (
                      <li key={idx} className="list-disc ml-4">{w}</li>
                    ))}
                  </ul>
                </Card>
              </div>

              {/* Suggestions */}
              <Card hoverable={false} className="flex flex-col gap-3">
                <h4 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4" />
                  <span>Improvement Roadmap Steps</span>
                </h4>
                <ul className="text-xs text-slate-300 flex flex-col gap-2.5">
                  {analysis.suggestions && analysis.suggestions.map((s: string, idx: number) => (
                    <li key={idx} className="list-disc ml-4 leading-relaxed">{s}</li>
                  ))}
                </ul>
              </Card>
            </div>
          ) : (
            <Card hoverable={false} className="flex flex-col items-center justify-center p-12 text-slate-500 border-dashed border-slate-800">
              <FileText className="h-12 w-12 text-slate-700 mb-3" />
              <p className="text-sm">No resume analysis data loaded. Upload a document to start scanning.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
export default ResumeAnalyzer;
