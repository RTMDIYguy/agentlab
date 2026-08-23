import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.join(__dirname, 'src');

const files = {
  'AgentCard.tsx': `
import React from 'react';

interface AgentCardProps {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'error';
  tasksCompleted: number;
  uptime: string;
}

export const AgentCard: React.FC<AgentCardProps> = ({ id, name, role, status, tasksCompleted, uptime }) => {
  const statusColors = {
    active: 'bg-cyan-500 shadow-cyan-glow',
    idle: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
    error: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
  };
  
  const pulsing = status === 'active' ? 'animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75' : '';

  return (
    <div className="flex flex-col p-6 bg-navy-900 border border-navy-800 rounded-xl hover:shadow-cyan-glow hover:border-cyan-500/30 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-poppins text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">{name}</h3>
          <p className="font-inter text-xs text-slate-400 mt-1">{role}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-inter text-xs font-medium text-slate-500 uppercase tracking-wider">{status}</span>
          <span className="relative flex h-3 w-3">
            {pulsing && <span className={pulsing}></span>}
            <span className={\`relative inline-flex rounded-full h-3 w-3 \${statusColors[status]}\`}></span>
          </span>
        </div>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-4 pt-5 border-t border-navy-800/50">
        <div>
          <p className="font-inter text-[10px] text-slate-500 uppercase tracking-wider mb-1">Tasks</p>
          <p className="font-poppins text-sm font-medium text-slate-200">{tasksCompleted.toLocaleString()}</p>
        </div>
        <div>
          <p className="font-inter text-[10px] text-slate-500 uppercase tracking-wider mb-1">Uptime</p>
          <p className="font-poppins text-sm font-medium text-slate-200">{uptime}</p>
        </div>
      </div>
    </div>
  );
};
  `,
  'Agents.tsx': `
import React from 'react';
import { AgentCard } from './AgentCard';

const DUMMY_AGENTS: React.ComponentProps<typeof AgentCard>[] = [
  { id: '1', name: 'Alpha-Node-01', role: 'Data Synthesizer', status: 'active', tasksCompleted: 1492, uptime: '99.9%' },
  { id: '2', name: 'Beta-Node-02', role: 'Code Reviewer', status: 'idle', tasksCompleted: 843, uptime: '99.5%' },
  { id: '3', name: 'Gamma-Node-03', role: 'Outreach Specialist', status: 'active', tasksCompleted: 5021, uptime: '100%' },
  { id: '4', name: 'Delta-Node-04', role: 'Security Auditor', status: 'error', tasksCompleted: 120, uptime: '84.2%' },
  { id: '5', name: 'Epsilon-Node-05', role: 'Content Generator', status: 'active', tasksCompleted: 3450, uptime: '99.8%' },
];

export const Agents: React.FC = () => (
  <div className="flex flex-col space-y-8 animate-in fade-in duration-500">
    <header className="mb-2">
      <h1 className="font-poppins text-3xl font-semibold text-white tracking-tight mb-2">Agent Swarm</h1>
      <p className="font-inter text-sm text-slate-400">Monitor and manage your autonomous agents across the network.</p>
    </header>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {DUMMY_AGENTS.map(agent => (
        <AgentCard key={agent.id} {...agent} />
      ))}
    </div>
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
      case 'agents': return <Agents />;
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
console.log('Phase 1 Agent Components built successfully!');
