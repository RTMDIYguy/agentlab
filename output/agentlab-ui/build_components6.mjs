import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.join(__dirname, "src");

const files = {
  "AgentSlideOver.tsx": `
import React from 'react';

interface AgentSlideOverProps {
  agent: { id: string; name: string; role: string; status: 'active' | 'idle' | 'error'; tasksCompleted: number; uptime: string } | null;
  onClose: () => void;
}

export const AgentSlideOver: React.FC<AgentSlideOverProps> = ({ agent, onClose }) => {
  if (!agent) return null;

  const statusColors = {
    active: 'bg-cyan-500 shadow-cyan-glow',
    idle: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
    error: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
  };
  const pulsing = agent.status === 'active' ? 'animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75' : '';

  return (
    <>
      <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-navy-900 border-l border-navy-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-navy-800/50">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="relative flex h-3 w-3">
                {pulsing && <span className={pulsing}></span>}
                <span className={\`relative inline-flex rounded-full h-3 w-3 \${statusColors[agent.status]}\`}></span>
              </span>
              <h2 className="font-poppins text-xl font-semibold text-white tracking-wide">{agent.name}</h2>
            </div>
            <p className="font-inter text-sm text-slate-400">{agent.role}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors focus:outline-none">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Metrics */}
          <div className="space-y-4">
            <h3 className="font-poppins text-sm font-medium text-slate-200 uppercase tracking-widest">Performance Metrics</h3>
            <div className="bg-navy-950/50 p-4 rounded-xl border border-navy-800/50 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-2"><span className="text-slate-400 font-inter">Success Rate</span><span className="text-cyan-400 font-mono">99.4%</span></div>
                <div className="w-full bg-navy-800 rounded-full h-1.5"><div className="bg-cyan-500 h-1.5 rounded-full shadow-cyan-glow" style={{ width: '99.4%' }}></div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2"><span className="text-slate-400 font-inter">Average Latency</span><span className="text-amber-400 font-mono">240ms</span></div>
                <div className="w-full bg-navy-800 rounded-full h-1.5"><div className="bg-amber-500 h-1.5 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" style={{ width: '24%' }}></div></div>
              </div>
            </div>
          </div>

          {/* System Prompt */}
          <div className="space-y-4">
            <h3 className="font-poppins text-sm font-medium text-slate-200 uppercase tracking-widest">System Instructions</h3>
            <div className="bg-navy-950 border border-navy-800 rounded-lg p-4 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto whitespace-pre">
{JSON.stringify({
  "role": agent.role,
  "objective": "Execute assigned workloads with zero defects.",
  "constraints": [
    "No external network calls",
    "Max tokens: 4096"
  ],
  "temperature": 0.2
}, null, 2)}
            </div>
          </div>

          {/* Activity Logs */}
          <div className="space-y-4 pb-6">
            <h3 className="font-poppins text-sm font-medium text-slate-200 uppercase tracking-widest">Live Terminal Logs</h3>
            <div className="bg-black border border-navy-800 rounded-lg p-4 font-mono text-xs text-green-400/90 leading-loose overflow-hidden">
              <div>[14:02:01.034] INFO: Agent heartbeat acknowledged.</div>
              <div>[14:02:45.991] <span className="text-cyan-400">EXEC</span>: Received payload block 0xA89F.</div>
              <div>[14:03:12.112] INFO: Processing constraints verified.</div>
              <div>[14:04:00.005] <span className="text-amber-400">WARN</span>: Memory threshold approaching 80%.</div>
              <div className="animate-pulse">_</div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
  `,
  "AgentCard.tsx": `
import React from 'react';

interface AgentCardProps {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'error';
  tasksCompleted: number;
  uptime: string;
  onClick?: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ id, name, role, status, tasksCompleted, uptime, onClick }) => {
  const statusColors = {
    active: 'bg-cyan-500 shadow-cyan-glow',
    idle: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
    error: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
  };
  
  const pulsing = status === 'active' ? 'animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75' : '';

  return (
    <div 
      onClick={onClick}
      className="flex flex-col p-6 bg-navy-900 border border-navy-800 rounded-xl hover:shadow-cyan-glow hover:border-cyan-500/30 transition-all duration-300 group cursor-pointer"
    >
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
  "Agents.tsx": `
import React, { useState } from 'react';
import { AgentCard } from './AgentCard';
import { AgentSlideOver } from './AgentSlideOver';

const DUMMY_AGENTS: React.ComponentProps<typeof AgentCard>[] = [
  { id: '1', name: 'Alpha-Node-01', role: 'Data Synthesizer', status: 'active', tasksCompleted: 1492, uptime: '99.9%' },
  { id: '2', name: 'Beta-Node-02', role: 'Code Reviewer', status: 'idle', tasksCompleted: 843, uptime: '99.5%' },
  { id: '3', name: 'Gamma-Node-03', role: 'Outreach Specialist', status: 'active', tasksCompleted: 5021, uptime: '100%' },
  { id: '4', name: 'Delta-Node-04', role: 'Security Auditor', status: 'error', tasksCompleted: 120, uptime: '84.2%' },
  { id: '5', name: 'Epsilon-Node-05', role: 'Content Generator', status: 'active', tasks: 3450, uptime: '99.8%' },
].map(a => ({ ...a, tasksCompleted: a.tasksCompleted || a.tasks || 0 })); // fix typo in dummy data

export const Agents: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<React.ComponentProps<typeof AgentCard> | null>(null);

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500 relative">
      <header className="mb-2">
        <h1 className="font-poppins text-3xl font-semibold text-white tracking-tight mb-2">Agent Swarm</h1>
        <p className="font-inter text-sm text-slate-400">Monitor and manage your autonomous agents across the network.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_AGENTS.map(agent => (
          <AgentCard key={agent.id} {...agent} onClick={() => setSelectedAgent(agent)} />
        ))}
      </div>
      
      <AgentSlideOver 
        agent={selectedAgent as any} 
        onClose={() => setSelectedAgent(null)} 
      />
    </div>
  );
};
  `,
};

Object.entries(files).forEach(([file, content]) =>
  fs.writeFileSync(path.join(SRC_DIR, file), content.trim())
);
console.log("Phase 2 Agent Components built successfully!");
