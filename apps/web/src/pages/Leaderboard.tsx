import React, { useEffect, useState } from 'react';
import { ApiClient } from '../services/api.js';
import { Card } from '../components/ui/Card.js';
import { Trophy, Star, Shield, Award, Users2 } from 'lucide-react';

interface LeaderboardUser {
  _id: string;
  name: string;
  role: string;
  xp: number;
  level: number;
  streak: number;
}

export const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [scope, setScope] = useState<'Global' | 'College' | 'Department'>('Global');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await ApiClient.request('/admin/users'); // fallback to admin list for mock XP ranking
        const sorted = (response.users || []).sort((a: any, b: any) => b.xp - a.xp);
        setUsers(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Ecosystem Leaderboards</h1>
          <p className="text-slate-400 text-sm">Compete on XP rankings across Global, College, and Department scopes.</p>
        </div>
        <div className="flex gap-1.5 bg-slate-900 border border-slate-700 rounded-xl p-1 shrink-0">
          {(['Global', 'College', 'Department'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                scope === s ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Podium Display (Top 3 Users) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card hoverable={false} className="flex flex-col items-center justify-center p-8 bg-indigo-950/10 border-indigo-500/20 text-center gap-4 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-24 h-24 bg-indigo-500/10 rounded-full blur-xl" />
            <Trophy className="h-12 w-12 text-amber-400 animate-bounce" />
            <div>
              <h3 className="font-bold text-slate-100">Top Performer</h3>
              <p className="text-[10px] text-indigo-400 font-bold uppercase mt-0.5 tracking-wider">{scope} Rank #1</p>
            </div>
            
            {users[0] ? (
              <div className="flex flex-col gap-1">
                <span className="text-lg font-black text-white">{users[0].name}</span>
                <span className="text-xs text-slate-400 font-medium">Level {users[0].level} ({users[0].xp} XP)</span>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Finding top rank user...</p>
            )}
          </Card>

          <Card hoverable={false} className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-4 w-4 text-emerald-400" />
              <span>Badge Rewards System</span>
            </h4>
            <div className="flex flex-col gap-3 mt-1.5">
              {[
                { name: 'Interview Master', desc: 'Complete 5 graded mock interview sessions' },
                { name: 'DSA Expert', desc: 'Solve 10 complex coding rounds' },
                { name: 'Career Accelerator', desc: 'Achieve a CV ATS Score of 85+' },
              ].map((badge, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <Star className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">{badge.name}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Global Ranks Grid Table */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <Card hoverable={false} className="p-0 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-900/50 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-300">Competitor Leaderboard</h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Users2 className="h-4 w-4 text-slate-400" />
                <span>{users.length} Active Candidates</span>
              </div>
            </div>

            <div className="flex flex-col divide-y divide-white/5 max-h-[480px] overflow-y-auto">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-6 py-4 h-16 bg-slate-900/10 animate-pulse" />
                ))
              ) : users.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-6 text-center">No ranked candidates found.</p>
              ) : (
                users.map((item, idx) => (
                  <div key={item._id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-4">
                      {/* Rank Index */}
                      <span className={`font-black text-sm shrink-0 w-6 ${
                        idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-700' : 'text-slate-500'
                      }`}>
                        #{idx + 1}
                      </span>
                      {/* Avatar */}
                      <div className="h-9 w-9 rounded-full bg-indigo-600/15 border border-indigo-500/25 flex items-center justify-center font-bold text-xs text-indigo-400">
                        {item.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">{item.name}</h4>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Level {item.level}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="text-sm font-black text-slate-200">{item.xp} XP</p>
                        <p className="text-[10px] text-indigo-400 font-semibold">{item.streak} day streak 🔥</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default Leaderboard;
