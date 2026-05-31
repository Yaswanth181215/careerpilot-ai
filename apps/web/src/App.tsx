import React, { useState } from 'react';
import { useAuth } from './context/AuthContext.js';
import { Layout } from './components/Layout.js';

// Import Pages
import Landing from './pages/Landing.js';
import Dashboard from './pages/Dashboard.js';
import MockInterview from './pages/MockInterview.js';
import CodingPlatform from './pages/CodingPlatform.js';
import ResumeAnalyzer from './pages/ResumeAnalyzer.js';
import LinkedInAnalyzer from './pages/LinkedInAnalyzer.js';
import CareerCoach from './pages/CareerCoach.js';
import LearningRoadmap from './pages/LearningRoadmap.js';
import Leaderboard from './pages/Leaderboard.js';
import MentorPlatform from './pages/MentorPlatform.js';
import AdminPanel from './pages/AdminPanel.js';

export const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">Loading Console Sessions...</span>
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard setCurrentTab={setCurrentTab} />;
      case 'interviews':
        return <MockInterview />;
      case 'coding':
        return <CodingPlatform />;
      case 'resume':
        return <ResumeAnalyzer />;
      case 'linkedin':
        return <LinkedInAnalyzer />;
      case 'coach':
        return <CareerCoach />;
      case 'roadmap':
        return <LearningRoadmap />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'mentor':
        return <MentorPlatform />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <Dashboard setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {renderActiveTab()}
    </Layout>
  );
};
export default App;
