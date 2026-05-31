import React, { useState } from 'react';
import { ApiClient } from '../services/api.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Linkedin, Sparkles, Award, Lightbulb } from 'lucide-react';

export const LinkedInAnalyzer: React.FC = () => {
  const [profileText, setProfileText] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any | null>(null);

  const analyzeProfile = async () => {
    if (!profileText.trim()) return;
    setLoading(true);
    try {
      const data = await ApiClient.request('/career/linkedin/analyze', {
        method: 'POST',
        body: JSON.stringify({ profileText }),
      });
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">LinkedIn Profile Optimization</h1>
        <p className="text-slate-400 text-sm">Analyze and rewrite your LinkedIn headline and about copy for recruiter attraction.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 flex flex-col gap-6">
          <Card hoverable={false} className="flex flex-col gap-4">
            <h3 className="font-bold flex items-center gap-2">
              <Linkedin className="h-5 w-5 text-indigo-400" />
              <span>Paste Profile Content</span>
            </h3>
            <textarea
              value={profileText}
              onChange={(e) => setProfileText(e.target.value)}
              placeholder="Paste your current LinkedIn headline, about introduction, and skills summary here..."
              rows={8}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <Button onClick={analyzeProfile} disabled={loading || !profileText.trim()}>
              {loading ? 'Optimizing Profile...' : 'Analyze and Suggest'}
            </Button>
          </Card>
        </div>

        <div className="md:col-span-7 flex flex-col gap-6">
          {report ? (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <Card hoverable={false} className="text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Profile Score</span>
                  <h3 className="text-3xl font-extrabold text-indigo-400 mt-1">{report.linkedInScore}%</h3>
                </Card>
                <Card hoverable={false} className="text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Recruiter Attraction</span>
                  <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">{report.recruiterAttractionScore}%</h3>
                </Card>
              </div>

              <Card hoverable={false} className="flex flex-col gap-3">
                <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Suggested Headline Rewrite</span>
                </h4>
                <p className="text-sm font-semibold bg-white/5 border border-white/10 p-3 rounded-lg text-slate-200">
                  {report.headlineSuggestion}
                </p>
              </Card>

              <Card hoverable={false} className="flex flex-col gap-3">
                <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-indigo-400" />
                  <span>Suggested About Biography</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-white/5 border border-white/10 p-4 rounded-xl">
                  {report.aboutSuggestion}
                </p>
              </Card>

              <Card hoverable={false} className="flex flex-col gap-3">
                <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4 text-emerald-400" />
                  <span>Optimization Suggestions</span>
                </h4>
                <ul className="text-xs text-slate-300 flex flex-col gap-2">
                  {report.optimizationSuggestions.map((s: string, i: number) => (
                    <li key={i} className="list-disc ml-4 leading-relaxed">{s}</li>
                  ))}
                </ul>
              </Card>
            </div>
          ) : (
            <Card hoverable={false} className="flex flex-col items-center justify-center p-12 text-slate-500 border-dashed border-slate-800 h-full">
              <Linkedin className="h-12 w-12 text-slate-700 mb-3" />
              <p className="text-sm text-center">Paste profile contents to see optimization recommendations.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
export default LinkedInAnalyzer;
