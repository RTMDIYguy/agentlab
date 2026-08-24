import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.join(__dirname, "src");

const files = {
  "AgentCard.tsx": `
import React from 'react';
import { Button } from './Button';

export interface AgentCardProps {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'error';
  tasksCompleted: number;
  uptime: string;
  onClick?: () => void;
  onAction?: (action: 'pause' | 'restart' | 'terminate', id: string) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ id, name, role, status, tasksCompleted, uptime, onClick, onAction }) => {
  const statusColors = {
    active: 'bg-cyan-500 shadow-cyan-glow',
    idle: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
    error: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
  };
  
  const pulsing = status === 'active' ? 'animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75' : '';

  const handleActionClick = (e: React.MouseEvent, action: 'pause' | 'restart' | 'terminate') => {
    e.stopPropagation();
    if (onAction) onAction(action, id);
  };

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
      
      <div className="mt-auto grid grid-cols-2 gap-4 pt-5 pb-4 border-t border-navy-800/50">
        <div>
          <p className="font-inter text-[10px] text-slate-500 uppercase tracking-wider mb-1">Tasks</p>
          <p className="font-poppins text-sm font-medium text-slate-200">{tasksCompleted.toLocaleString()}</p>
        </div>
        <div>
          <p className="font-inter text-[10px] text-slate-500 uppercase tracking-wider mb-1">Uptime</p>
          <p className="font-poppins text-sm font-medium text-slate-200">{uptime}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-navy-800/50 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {status === 'active' ? (
          <button onClick={(e) => handleActionClick(e, 'pause')} className="px-3 py-1 text-xs font-medium text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 rounded-md transition-colors">Pause</button>
        ) : (
          <button onClick={(e) => handleActionClick(e, 'restart')} className="px-3 py-1 text-xs font-medium text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 rounded-md transition-colors">Restart</button>
        )}
        <button onClick={(e) => handleActionClick(e, 'terminate')} className="px-3 py-1 text-xs font-medium text-rose-400 bg-rose-400/10 hover:bg-rose-400/20 rounded-md transition-colors">Terminate</button>
      </div>
    </div>
  );
};
  `,
  "Agents.tsx": `
import React, { useState } from 'react';
import { AgentCard, AgentCardProps } from './AgentCard';
import { AgentSlideOver } from './AgentSlideOver';

const INITIAL_AGENTS: Omit<AgentCardProps, 'onClick' | 'onAction'>[] = [
  { id: '1', name: 'Alpha-Node-01', role: 'Data Synthesizer', status: 'active', tasksCompleted: 1492, uptime: '99.9%' },
  { id: '2', name: 'Beta-Node-02', role: 'Code Reviewer', status: 'idle', tasksCompleted: 843, uptime: '99.5%' },
  { id: '3', name: 'Gamma-Node-03', role: 'Outreach Specialist', status: 'active', tasksCompleted: 5021, uptime: '100%' },
  { id: '4', name: 'Delta-Node-04', role: 'Security Auditor', status: 'error', tasksCompleted: 120, uptime: '84.2%' },
  { id: '5', name: 'Epsilon-Node-05', role: 'Content Generator', status: 'active', tasksCompleted: 3450, uptime: '99.8%' },
];

export const Agents: React.FC = () => {
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<AgentCardProps | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'idle' | 'error'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAction = (action: 'pause' | 'restart' | 'terminate', id: string) => {
    if (action === 'terminate') {
      setAgents(prev => prev.filter(a => a.id !== id));
      if (selectedAgent?.id === id) setSelectedAgent(null);
    } else {
      setAgents(prev => prev.map(a => {
        if (a.id === id) {
          return { ...a, status: action === 'pause' ? 'idle' : 'active' } as any;
        }
        return a;
      }));
      // Update selected agent if it was the one modified
      if (selectedAgent?.id === id) {
        setSelectedAgent(prev => prev ? { ...prev, status: action === 'pause' ? 'idle' : 'active' } : null);
      }
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesFilter = filter === 'all' || agent.status === filter;
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          agent.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500 relative">
      <header className="mb-2">
        <h1 className="font-poppins text-3xl font-semibold text-white tracking-tight mb-2">Agent Swarm</h1>
        <p className="font-inter text-sm text-slate-400">Monitor and manage your autonomous agents across the network.</p>
      </header>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-navy-900/50 p-4 rounded-xl border border-navy-800">
        <div className="relative w-full sm:w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search agents..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-navy-950 border border-navy-700 rounded-lg text-white pl-10 pr-4 py-2 font-inter text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'active', 'idle', 'error'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={\`px-4 py-2 rounded-lg font-inter text-xs font-medium capitalize whitespace-nowrap transition-all \${
                filter === f 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                  : 'bg-navy-950 text-slate-400 border border-navy-800 hover:border-navy-600'
              }\`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map(agent => (
            <AgentCard 
              key={agent.id} 
              {...agent} 
              onClick={() => setSelectedAgent(agent as AgentCardProps)} 
              onAction={handleAction}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-navy-900/30 rounded-2xl border border-dashed border-navy-800">
          <p className="text-slate-400 font-inter">No agents found matching your criteria.</p>
        </div>
      )}
      
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
console.log("Phase 4 Filtering and Interactivity built successfully!");
