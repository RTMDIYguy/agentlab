import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.join(__dirname, 'src');

const files = {
  'WorkflowSlideOver.tsx': `
import React from 'react';
import { WorkflowCardProps } from './WorkflowCard';
import { Button } from './Button';

interface WorkflowSlideOverProps {
  workflow: WorkflowCardProps | null;
  onClose: () => void;
}

export const WorkflowSlideOver: React.FC<WorkflowSlideOverProps> = ({ workflow, onClose }) => {
  if (!workflow) return null;

  const statusStyles = {
    running: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    paused: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    failed: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  return (
    <>
      <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-navy-900 border-l border-navy-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-navy-800/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="font-poppins text-2xl font-semibold text-white tracking-wide">{workflow.name}</h2>
              <span className={\`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border \${statusStyles[workflow.status]}\`}>
                {workflow.status}
              </span>
            </div>
            <p className="font-inter text-sm text-slate-400 leading-relaxed">{workflow.description}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors focus:outline-none">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-navy-950/50 p-4 rounded-xl border border-navy-800/50">
              <p className="font-inter text-[10px] text-slate-500 uppercase tracking-wider mb-1">Last Run</p>
              <p className="font-poppins text-lg font-medium text-slate-200">{workflow.lastRun}</p>
            </div>
            <div className="bg-navy-950/50 p-4 rounded-xl border border-navy-800/50">
              <p className="font-inter text-[10px] text-slate-500 uppercase tracking-wider mb-1">Success Rate</p>
              <p className="font-poppins text-lg font-medium text-cyan-400">{workflow.successRate}</p>
            </div>
            <div className="bg-navy-950/50 p-4 rounded-xl border border-navy-800/50">
              <p className="font-inter text-[10px] text-slate-500 uppercase tracking-wider mb-1">Avg Duration</p>
              <p className="font-poppins text-lg font-medium text-slate-200">2m 14s</p>
            </div>
          </div>

          {/* Assigned Agents */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-poppins text-sm font-medium text-slate-200 uppercase tracking-widest">Assigned Agents</h3>
              <Button variant="secondary" className="!py-1.5 !px-3 !text-xs">Manage</Button>
            </div>
            <div className="bg-navy-950/50 rounded-xl border border-navy-800/50 divide-y divide-navy-800/50">
              <div className="p-4 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-cyan-glow"></div>
                  <div>
                    <p className="font-inter text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">Alpha-Node-01</p>
                    <p className="font-inter text-xs text-slate-500">Data Synthesizer</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-mono">Step 1</span>
              </div>
              <div className="p-4 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-cyan-glow"></div>
                  <div>
                    <p className="font-inter text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">Gamma-Node-03</p>
                    <p className="font-inter text-xs text-slate-500">Outreach Specialist</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-mono">Step 2</span>
              </div>
            </div>
          </div>

          {/* Execution History */}
          <div className="space-y-4 pb-6">
            <h3 className="font-poppins text-sm font-medium text-slate-200 uppercase tracking-widest">Recent Executions</h3>
            <div className="bg-black border border-navy-800 rounded-lg p-4 font-mono text-xs leading-loose overflow-x-auto whitespace-pre">
              <div className="flex gap-4">
                <span className="text-slate-500">10 mins ago</span>
                <span className="text-green-400">[SUCCESS]</span>
                <span className="text-slate-300">Execution #4092 completed in 1m 45s. Processed 120 items.</span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-500">1 hour ago </span>
                <span className="text-green-400">[SUCCESS]</span>
                <span className="text-slate-300">Execution #4091 completed in 2m 12s. Processed 154 items.</span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-500">2 hours ago</span>
                <span className={workflow.status === 'failed' ? "text-rose-400" : "text-green-400"}>
                  {workflow.status === 'failed' ? "[FAILED] " : "[SUCCESS]"}
                </span>
                <span className="text-slate-300">
                  {workflow.status === 'failed' 
                    ? "Execution #4090 failed at Step 2: Timeout waiting for Alpha-Node-01 response." 
                    : "Execution #4090 completed in 1m 58s. Processed 98 items."}
                </span>
              </div>
            </div>
          </div>

        </div>
        
        {/* Footer Actions */}
        <div className="bg-navy-950/50 p-6 border-t border-navy-800/50 flex justify-end gap-3 mt-auto">
          {workflow.status === 'running' ? (
            <Button variant="secondary" className="text-amber-400 hover:text-amber-400 hover:border-amber-400/50">Pause Workflow</Button>
          ) : (
             <Button variant="secondary" className="text-cyan-400 hover:text-cyan-400 hover:border-cyan-400/50">Start Workflow</Button>
          )}
          <Button variant="primary">Edit Configuration</Button>
        </div>
      </div>
    </>
  );
};
  `,
  'WorkflowCard.tsx': `
import React from 'react';

export interface WorkflowCardProps {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'paused' | 'failed';
  lastRun: string;
  successRate: string;
  onClick?: () => void;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({ name, description, status, lastRun, successRate, onClick }) => {
  const statusStyles = {
    running: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    paused: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    failed: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  return (
    <div 
      onClick={onClick}
      className="flex flex-col p-6 bg-navy-900 border border-navy-800 rounded-xl hover:shadow-cyan-glow hover:border-cyan-500/30 transition-all duration-300 group cursor-pointer h-full"
    >
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
  'Workflows.tsx': `
import React, { useState } from 'react';
import { WorkflowCard, WorkflowCardProps } from './WorkflowCard';
import { WorkflowSlideOver } from './WorkflowSlideOver';

const DUMMY_WORKFLOWS: Omit<WorkflowCardProps, 'onClick'>[] = [
  { id: 'w1', name: 'Daily Lead Enrichment', description: 'Scrapes targeted company domains, finds key stakeholders, and enriches profiles using Apollo.', status: 'running', lastRun: '10 mins ago', successRate: '98.5%' },
  { id: 'w2', name: 'Automated Code QA', description: 'Pulls PRs from GitHub, reviews code against formatting guidelines, and posts comments.', status: 'paused', lastRun: '2 days ago', successRate: '99.1%' },
  { id: 'w3', name: 'Weekly Outreach Sequence', description: 'Drafts personalized email sequences for top 100 leads and pushes to HubSpot.', status: 'running', lastRun: '1 hour ago', successRate: '95.2%' },
  { id: 'w4', name: 'Security Vulnerability Scan', description: 'Scans infrastructure configurations and active repositories for critical CVEs.', status: 'failed', lastRun: '5 mins ago', successRate: '72.4%' },
];

export const Workflows: React.FC = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowCardProps | null>(null);

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500 relative">
      <header className="mb-2">
        <h1 className="font-poppins text-3xl font-semibold text-white tracking-tight mb-2">Automation Workflows</h1>
        <p className="font-inter text-sm text-slate-400">Manage and monitor your multi-agent execution chains.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_WORKFLOWS.map(wf => (
          <WorkflowCard 
            key={wf.id} 
            {...wf} 
            onClick={() => setSelectedWorkflow(wf as WorkflowCardProps)}
          />
        ))}
      </div>

      <WorkflowSlideOver 
        workflow={selectedWorkflow} 
        onClose={() => setSelectedWorkflow(null)} 
      />
    </div>
  );
};
  `
};

Object.entries(files).forEach(([file, content]) => fs.writeFileSync(path.join(SRC_DIR, file), content.trim()));
console.log('Phase 2 Workflows Slide-over built successfully!');
