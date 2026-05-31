import React from 'react';
import {
  LayoutDashboard,
  Video,
  Code2,
  FileText,
  Linkedin,
  Compass,
  Map,
  Trophy,
  Users2,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { user } = useAuth();

  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'interviews', label: 'AI Mock Interviews', icon: Video },
    { id: 'coding', label: 'Coding Sandbox', icon: Code2 },
    { id: 'resume', label: 'Resume Analyzer', icon: FileText },
    { id: 'linkedin', label: 'LinkedIn Optimization', icon: Linkedin },
    { id: 'coach', label: 'AI Career Coach', icon: Compass },
    { id: 'roadmap', label: 'Learning Roadmap', icon: Map },
    { id: 'leaderboard', label: 'Leaderboards', icon: Trophy },
    { id: 'mentor', label: 'Mentor Platform', icon: Users2 },
  ];

  const adminLink = { id: 'admin', label: 'Admin Dashboard', icon: Sliders };

  return (
    <aside className="w-64 bg-slate-950 border-r border-white/10 flex flex-col justify-between py-6 shrink-0 h-[calc(100vh-64px)] sticky top-16 z-30">
      <div className="flex flex-col gap-1.5 px-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = currentTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setCurrentTab(link.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{link.label}</span>
            </button>
          );
        })}

        {(user?.role === 'Admin' || user?.role === 'Super Admin') && (
          <button
            onClick={() => setCurrentTab('admin')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border border-indigo-500/20 mt-4 ${
              currentTab === 'admin'
                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500'
                : 'text-indigo-400 hover:text-white hover:bg-indigo-500/10'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>{adminLink.label}</span>
          </button>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
