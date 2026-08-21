import React from 'react';
const METRICS_DATA = [{ id: 'm1', label: 'Active Agents', value: '24', delta: '+3', trend: 'positive' }, { id: 'm2', label: 'Tasks Completed', value: '1,492', delta: '+12%', trend: 'positive' }];
const AGENTS_DATA = [{ id: 'a1', name: 'Alpha-Node-01', task: 'Processing NLP...', status: 'active' }, { id: 'a2', name: 'Beta-Node-02', task: 'Awaiting workload...', status: 'idle' }];
export const Dashboard: React.FC = () => (
  <div className="flex flex-col space-y-8">
    <header className="mb-8"><h1 className="font-poppins text-3xl font-semibold text-white tracking-tight mb-2">Workspace Overview</h1><p className="font-inter text-sm text-slate-400">Monitor your agent swarm in real-time.</p></header>
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {METRICS_DATA.map(m => (
        <div key={m.id} className="bg-navy-900/40 backdrop-blur-md border border-navy-800 rounded-xl p-6 hover:border-cyan-500/50 hover:shadow-cyan-glow group transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-4"><h3 className="font-inter text-sm font-medium text-slate-400">{m.label}</h3><span className="font-inter text-xs font-semibold px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-400">{m.delta}</span></div>
          <div className="font-poppins text-4xl font-semibold text-white">{m.value}</div>
        </div>
      ))}
    </section>
    <section className="grid grid-cols-1 gap-4">
      <h2 className="font-poppins text-lg font-medium text-slate-200 mb-2">Agent Swarm Status</h2>
      {AGENTS_DATA.map(a => (
        <div key={a.id} className="flex flex-col p-5 bg-navy-900 border border-navy-800 rounded-xl hover:shadow-cyan-glow hover:border-cyan-500/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-poppins text-sm font-medium text-slate-200">{a.name}</h4>
            <div className="flex items-center gap-2">
              <span className="font-inter text-xs text-slate-500 capitalize">{a.status}</span>
              <span className="relative flex h-3 w-3">{a.status === 'active' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>}<span className={`relative inline-flex rounded-full h-3 w-3 ${a.status === 'active' ? 'bg-cyan-500' : 'bg-amber-500'}`}></span></span>
            </div>
          </div>
          <div className="font-inter text-xs text-slate-400">{a.task}</div>
        </div>
      ))}
    </section>
  </div>
);