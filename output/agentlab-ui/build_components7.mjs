import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.join(__dirname, 'src');

const files = {
  'DeployNodeModal.tsx': `
import React from 'react';
import { Button } from './Button';

interface DeployNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployNodeModal: React.FC<DeployNodeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-navy-900 border border-navy-800 rounded-2xl shadow-2xl overflow-hidden border-t-4 border-t-cyan-500 transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-navy-800/50">
          <div>
            <h2 className="font-poppins text-xl font-semibold text-white tracking-wide">Deploy New Node</h2>
            <p className="font-inter text-sm text-slate-400 mt-1">Configure and instantiate a new autonomous agent.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors focus:outline-none">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="font-inter text-xs font-semibold text-slate-300 uppercase">Agent Name</label>
            <input type="text" placeholder="e.g. Omega-Node-07" className="w-full bg-navy-950 border border-navy-700 rounded-md text-white px-4 py-3 font-inter text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 placeholder-slate-600" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-inter text-xs font-semibold text-slate-300 uppercase">Role / Specialty</label>
              <select className="w-full bg-navy-950 border border-navy-700 rounded-md text-white px-4 py-3 font-inter text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 appearance-none">
                <option>Data Synthesizer</option>
                <option>Code Reviewer</option>
                <option>Outreach Specialist</option>
                <option>Security Auditor</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-inter text-xs font-semibold text-slate-300 uppercase">Base Model</label>
              <select className="w-full bg-navy-950 border border-navy-700 rounded-md text-white px-4 py-3 font-inter text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 appearance-none">
                <option>Claude 3.5 Sonnet</option>
                <option>GPT-4o</option>
                <option>Llama 3 (70B)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-inter text-xs font-semibold text-slate-300 uppercase">System Prompt</label>
            <textarea rows={4} placeholder="Define the agent's core instructions and constraints..." className="w-full bg-navy-950 border border-navy-700 rounded-md text-white px-4 py-3 font-inter text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 placeholder-slate-600 resize-none"></textarea>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-navy-950/50 p-6 border-t border-navy-800/50 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onClose} className="gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Deploy Agent
          </Button>
        </div>
      </div>
    </div>
  );
};
  `,
  'Navigation.tsx': `
import React from 'react';
import { TopNavBadge } from './TopNavBadge';

interface NavigationProps { 
  currentView?: string; 
  onNavigate?: (view: string) => void; 
  onOpenNotifications?: () => void;
  onDeployClick?: () => void;
}

const NAV_LINKS = [
  { label: 'Dashboard', view: 'dashboard' }, 
  { label: 'Agents', view: 'agents' }, 
  { label: 'Workflows', view: 'workflows' }, 
  { label: 'Settings', view: 'settings' }
];

export const Navigation: React.FC<NavigationProps> = ({ 
  currentView = 'dashboard', 
  onNavigate = ()=>{}, 
  onOpenNotifications = ()=>{},
  onDeployClick = ()=>{}
}) => (
  <nav className="sticky top-0 z-40 w-full bg-navy-900 border-b border-navy-800 backdrop-blur-md bg-opacity-90">
    <div className="container mx-auto px-6 md:px-12 lg:px-24 h-20 flex items-center justify-between">
      <div className="flex items-center gap-4 cursor-pointer group" onClick={() => onNavigate('dashboard')} role="button" tabIndex={0}>
        <div className="w-8 h-8 rounded-md bg-cyan-500 shadow-cyan-glow transition-all duration-300 group-hover:shadow-cyan-glow-lg"></div>
        <span className="font-poppins font-semibold text-xl text-white tracking-wide">AgentLab</span>
      </div>
      <div className="hidden md:flex items-center space-x-10">
        {NAV_LINKS.map(link => (
          <button 
            key={link.view} 
            onClick={() => onNavigate(link.view)} 
            className={\`font-inter text-sm font-medium transition-all duration-300 ease-in-out focus:outline-none \${currentView === link.view ? 'text-cyan-400 drop-shadow-cyan-glow' : 'text-slate-400 hover:text-cyan-400 hover:drop-shadow-cyan-glow'}\`}
          >
            {link.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-6">
        <TopNavBadge unreadCount={3} hasCritical={true} onClick={onOpenNotifications} />
        <button 
          onClick={onDeployClick}
          className="hidden sm:block font-inter text-sm font-medium text-white bg-navy-800 hover:bg-navy-700 px-5 py-2.5 rounded-lg transition-all duration-300 border border-navy-700 hover:border-cyan-400 hover:shadow-cyan-glow focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-navy-900"
        >
          Deploy Node
        </button>
      </div>
    </div>
  </nav>
);
  `,
  'PageLayout.tsx': `
import React, { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';

interface PageLayoutProps { 
  children: ReactNode; 
  sidebarContent?: ReactNode; 
  currentView?: string; 
  onNavigate?: (view: string) => void; 
  onOpenNotifications?: () => void;
  onDeployClick?: () => void;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  sidebarContent, 
  currentView, 
  onNavigate, 
  onOpenNotifications,
  onDeployClick
}) => (
  <div className="min-h-screen flex flex-col bg-navy-950 text-slate-200 font-inter antialiased selection:bg-cyan-500 selection:text-navy-900">
    <Navigation 
      currentView={currentView} 
      onNavigate={onNavigate} 
      onOpenNotifications={onOpenNotifications}
      onDeployClick={onDeployClick}
    />
    <main className="flex-grow container mx-auto px-6 py-16 md:px-12 lg:px-24">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20">
        {sidebarContent && <aside className="md:col-span-4 lg:col-span-3 flex flex-col space-y-8">{sidebarContent}</aside>}
        <section className={\`flex flex-col space-y-12 \${sidebarContent ? 'md:col-span-8 lg:col-span-9' : 'col-span-12'}\`}>{children}</section>
      </div>
    </main>
    <Footer />
  </div>
);
  `,
  'App.tsx': `
import React, { useState } from 'react';
import { AuthLayout } from './AuthLayout';
import { LoginForm } from './LoginForm';
import { PageLayout } from './PageLayout';
import { Dashboard } from './Dashboard';
import { Agents } from './Agents';
import { DeployNodeModal } from './DeployNodeModal';

export const AppContext = React.createContext({ currentView: 'dashboard', onNavigate: (view: string) => {}, onOpenNotifications: () => {} });

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  if (!isAuthenticated) {
    return <AuthLayout title="Welcome to AgentLab" subtitle="Authenticate to access your operational workspace."><LoginForm onSuccess={() => setIsAuthenticated(true)} /></AuthLayout>;
  }

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <Dashboard />;
      case 'agents': return <Agents />;
      default: return <div className="p-8 text-slate-400">View: {currentView} (Placeholder)</div>;
    }
  };

  return (
    <AppContext.Provider value={{ currentView, onNavigate: setCurrentView, onOpenNotifications: () => setIsNotificationsOpen(true) }}>
      <PageLayout 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onDeployClick={() => setIsDeployModalOpen(true)}
      >
        {renderView()}
      </PageLayout>
      <DeployNodeModal isOpen={isDeployModalOpen} onClose={() => setIsDeployModalOpen(false)} />
    </AppContext.Provider>
  );
};
  `
};

Object.entries(files).forEach(([file, content]) => fs.writeFileSync(path.join(SRC_DIR, file), content.trim()));
console.log('Phase 3 Deploy Node Modal built successfully!');
