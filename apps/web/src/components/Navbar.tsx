import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { LogOut, Award } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="h-16 border-b border-white/10 bg-slate-950/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <span className="font-extrabold text-xl bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
          CareerPilot AI
        </span>
        <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
          Enterprise
        </span>
      </div>

      {user && (
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            <Award className="h-4 w-4 text-amber-400" />
            <span>Level {user.level}</span>
            <span className="text-slate-500">|</span>
            <span>{user.xp} XP</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
export default Navbar;
