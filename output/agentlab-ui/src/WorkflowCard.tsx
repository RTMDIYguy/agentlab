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
        <span className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${statusStyles[status]}`}>
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