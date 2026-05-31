import React, { useEffect, useState } from 'react';
import { ApiClient } from '../services/api.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { Award, Zap, Code, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface Stats {
  totalInterviews: number;
  totalCodingSolved: number;
  atsScore: number;
  placementReadinessScore: number;
  xp: number;
  level: number;
  streak: number;
}

interface DashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setCurrentTab }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [lineData, setLineData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await ApiClient.request('/dashboard/stats');
        setStats(data.stats);
        setRadarData(data.analytics.radarAnalytics);
        setLineData(data.analytics.monthlyProgress);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-800 rounded-2xl" />
          <div className="h-80 bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Upper header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Console</h1>
          <p className="text-slate-400 text-sm">Monitor metrics and placements readiness scores.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setCurrentTab('mentor')} className="flex items-center gap-2">
            <span>Find Mentor</span>
            <ArrowUpRight className="h-4 w-4" />
          </Button>
          <Button variant="primary" onClick={() => setCurrentTab('interviews')}>
            Start Mock Interview
          </Button>
        </div>
      </div>

      {/* Grid statistics summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-indigo-400 bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
            <Zap className="h-5 w-5" />
          </div>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Readiness Score</span>
          <span className="text-4xl font-extrabold">{stats?.placementReadinessScore}%</span>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-indigo-500 h-full" style={{ width: `${stats?.placementReadinessScore || 0}%` }} />
          </div>
        </Card>

        <Card className="flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-emerald-400 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
            <Code className="h-5 w-5" />
          </div>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Coding Challenges</span>
          <span className="text-4xl font-extrabold">{stats?.totalCodingSolved} Solved</span>
          <span className="text-xs text-slate-500 mt-2">Active practice rounds</span>
        </Card>

        <Card className="flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-amber-400 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
            <Award className="h-5 w-5" />
          </div>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Latest ATS Match</span>
          <span className="text-4xl font-extrabold">{stats?.atsScore}%</span>
          <span className="text-xs text-slate-500 mt-2">Resume evaluation match</span>
        </Card>

        <Card className="flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-purple-400 bg-purple-500/10 p-2 rounded-xl border border-purple-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Interviews Track</span>
          <span className="text-4xl font-extrabold">{stats?.totalInterviews} Pass</span>
          <span className="text-xs text-slate-500 mt-2">Completed evaluations</span>
        </Card>
      </div>

      {/* Visual Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="flex flex-col gap-4">
          <h2 className="text-lg font-bold">Skills Competency Breakdown</h2>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" radius="70%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                <Radar name="Candidate Profile" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="text-lg font-bold">XP Monthly Growth Curve</h2>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)' }} />
                <Line type="monotone" dataKey="XP" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
export default Dashboard;
