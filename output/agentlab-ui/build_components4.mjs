import fs from 'fs';
import path from 'path';
const SRC_DIR = path.join(process.cwd(), 'src');

const files = {
  'AuthLayout.tsx': `
import React, { ReactNode } from 'react';
export const AuthLayout: React.FC<{children: ReactNode, title: string, subtitle: string}> = ({ children, title, subtitle }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-navy-950 relative overflow-hidden px-4 sm:px-6">
    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(theme(colors.navy.800)_1.5px,transparent_1.5px)] bg-[size:24px_24px]" />
    <div className="relative z-10 w-full max-w-md bg-navy-900/60 backdrop-blur-xl border border-navy-800 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex flex-col items-center pt-10 pb-6 px-8 border-b border-navy-800/50">
        <div className="flex items-center gap-3 mb-6"><div className="w-8 h-8 rounded-md bg-cyan-500 shadow-cyan-glow"></div><span className="font-poppins font-semibold text-xl text-white tracking-wide">AgentLab</span></div>
        <h1 className="font-poppins text-2xl font-semibold text-white tracking-tight text-center">{title}</h1>
        <p className="font-inter text-sm text-slate-400 text-center mt-2">{subtitle}</p>
      </div>
      <div className="px-8 py-8">{children}</div>
    </div>
  </div>
);
  `,
  'LoginForm.tsx': `
import React, { useState } from 'react';
import { Button } from './Button';
export const LoginForm: React.FC<{onSuccess: () => void}> = ({ onSuccess }) => (
  <form onSubmit={(e) => { e.preventDefault(); onSuccess(); }} className="flex flex-col space-y-5">
    <div className="flex flex-col space-y-2">
      <label className="font-inter text-xs font-semibold text-slate-300 uppercase">Email Address</label>
      <input type="email" required className="w-full bg-navy-950 border border-navy-700 rounded-md text-white px-4 py-3 font-inter text-sm focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20" />
    </div>
    <div className="flex flex-col space-y-2">
      <label className="font-inter text-xs font-semibold text-slate-300 uppercase">Password</label>
      <input type="password" required className="w-full bg-navy-950 border border-navy-700 rounded-md text-white px-4 py-3 font-inter text-sm focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20" />
    </div>
    <Button variant="primary" type="submit" className="w-full py-3">Authenticate</Button>
  </form>
);
  `,
  'App.tsx': `
import React, { useState, useEffect } from 'react';
import { AuthLayout } from './AuthLayout';
import { LoginForm } from './LoginForm';
import { PageLayout } from './PageLayout';
import { Dashboard } from './Dashboard';

export const AppContext = React.createContext({ currentView: 'dashboard', onNavigate: (view: string) => {}, onOpenNotifications: () => {} });

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  if (!isAuthenticated) {
    return <AuthLayout title="Welcome to AgentLab" subtitle="Authenticate to access your operational workspace."><LoginForm onSuccess={() => setIsAuthenticated(true)} /></AuthLayout>;
  }

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <Dashboard />;
      default: return <div className="p-8 text-slate-400">View: {currentView} (Placeholder)</div>;
    }
  };

  return (
    <AppContext.Provider value={{ currentView, onNavigate: setCurrentView, onOpenNotifications: () => setIsNotificationsOpen(true) }}>
      <PageLayout currentView={currentView} onNavigate={setCurrentView} onOpenNotifications={() => setIsNotificationsOpen(true)}>
        {renderView()}
      </PageLayout>
    </AppContext.Provider>
  );
};
  `
};
Object.entries(files).forEach(([file, content]) => fs.writeFileSync(path.join(SRC_DIR, file), content.trim()));
