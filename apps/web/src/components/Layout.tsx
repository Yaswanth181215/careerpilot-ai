import React from 'react';
import Navbar from './Navbar.js';
import Sidebar from './Sidebar.js';

interface LayoutProps {
  children: React.ReactNode;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentTab, setCurrentTab }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
        <main className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
};
export default Layout;
