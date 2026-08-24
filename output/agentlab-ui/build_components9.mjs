import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.join(__dirname, "src");

const files = {
  "WorkflowCard.tsx": `
import React from 'react';

export interface WorkflowCardProps {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'paused' | 'failed';
  lastRun: string;
  successRate: string;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({ name, description, status, lastRun, successRate }) => {
  const statusStyles = {
    running: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    paused: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    failed: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  return (
    <div className="flex flex-col p-6 bg-navy-900 border border-navy-800 rounded-xl hover:shadow-cyan-glow hover:border-cyan-500/30 transition-all duration-300 group cursor-pointer h-full">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-poppins text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">{name}</h3>
        <span className={\`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border \${statusStyles[status]}\`}>
          {status}
        </span>
      </div>
      <p className="font-inter text-sm text-slate-400 mb-6 flex-grow">{description}</p>
      
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-navy-800/50 mt-auto">
        <div>
          <p className="font-inter text-[10px] text-slate-500 uppercase tracking-wider mb-1">Last Run</p>
          <p className="font-poppins text-sm font-medium text-slate-200">{lastRun}</p>
        </div>
        <div>
          <p className="font-inter text-[10px] text-slate-500 uppercase tracking-wider mb-1">Success Rate</p>
          <p className="font-poppins text-sm font-medium text-slate-200">{successRate}</p>
        </div>
      </div>
    </div>
  );
};
  `,
  "Workflows.tsx": `
import React from 'react';
import { WorkflowCard } from './WorkflowCard';

const DUMMY_WORKFLOWS = [
  { id: 'w1', name: 'Daily Lead Enrichment', description: 'Scrapes targeted company domains, finds key stakeholders, and enriches profiles using Apollo.', status: 'running' as const, lastRun: '10 mins ago', successRate: '98.5%' },
  { id: 'w2', name: 'Automated Code QA', description: 'Pulls PRs from GitHub, reviews code against formatting guidelines, and posts comments.', status: 'paused' as const, lastRun: '2 days ago', successRate: '99.1%' },
  { id: 'w3', name: 'Weekly Outreach Sequence', description: 'Drafts personalized email sequences for top 100 leads and pushes to HubSpot.', status: 'running' as const, lastRun: '1 hour ago', successRate: '95.2%' },
  { id: 'w4', name: 'Security Vulnerability Scan', description: 'Scans infrastructure configurations and active repositories for critical CVEs.', status: 'failed' as const, lastRun: '5 mins ago', successRate: '72.4%' },
];

export const Workflows: React.FC = () => {
  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500 relative">
      <header className="mb-2">
        <h1 className="font-poppins text-3xl font-semibold text-white tracking-tight mb-2">Automation Workflows</h1>
        <p className="font-inter text-sm text-slate-400">Manage and monitor your multi-agent execution chains.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_WORKFLOWS.map(wf => (
          <WorkflowCard key={wf.id} {...wf} />
        ))}
      </div>
    </div>
  );
};
  `,
  "App.tsx": `
import React, { useState } from 'react';
import { AuthLayout } from './AuthLayout';
import { LoginForm } from './LoginForm';
import { PageLayout } from './PageLayout';
import { Dashboard } from './Dashboard';
import { Agents } from './Agents';
import { DeployNodeModal } from './DeployNodeModal';
import { Workflows } from './Workflows';

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
      case 'workflows': return <Workflows />;
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
  `,
};

Object.entries(files).forEach(([file, content]) =>
  fs.writeFileSync(path.join(SRC_DIR, file), content.trim())
);
console.log("Phase 1 Workflows Components built successfully!");
