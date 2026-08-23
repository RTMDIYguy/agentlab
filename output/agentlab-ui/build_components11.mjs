import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.join(__dirname, 'src');

const files = {
  'CreateWorkflowModal.tsx': `
import React, { useState } from 'react';
import { Button } from './Button';

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateWorkflowModal: React.FC<CreateWorkflowModalProps> = ({ isOpen, onClose }) => {
  const [steps, setSteps] = useState([{ id: 1, action: '', agent: '' }]);

  if (!isOpen) return null;

  const addStep = () => {
    setSteps([...steps, { id: Date.now(), action: '', agent: '' }]);
  };

  const removeStep = (id: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter(s => s.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl bg-navy-900 border border-navy-800 rounded-2xl shadow-2xl overflow-hidden border-t-4 border-t-cyan-500 flex flex-col max-h-[90vh] transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-navy-800/50 shrink-0">
          <div>
            <h2 className="font-poppins text-xl font-semibold text-white tracking-wide">Create Workflow</h2>
            <p className="font-inter text-sm text-slate-400 mt-1">Design a new autonomous execution chain.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors focus:outline-none">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-inter text-xs font-semibold text-slate-300 uppercase">Workflow Name</label>
              <input type="text" placeholder="e.g. Content Generation Pipeline" className="w-full bg-navy-950 border border-navy-700 rounded-md text-white px-4 py-3 font-inter text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 placeholder-slate-600" />
            </div>
            <div className="space-y-2">
              <label className="font-inter text-xs font-semibold text-slate-300 uppercase">Trigger Event</label>
              <select className="w-full bg-navy-950 border border-navy-700 rounded-md text-white px-4 py-3 font-inter text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 appearance-none">
                <option>Manual Trigger</option>
                <option>Scheduled (CRON)</option>
                <option>Webhook / API</option>
                <option>Database Event</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-inter text-xs font-semibold text-slate-300 uppercase">Description</label>
            <input type="text" placeholder="Briefly describe what this workflow accomplishes..." className="w-full bg-navy-950 border border-navy-700 rounded-md text-white px-4 py-3 font-inter text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 placeholder-slate-600" />
          </div>

          {/* Steps Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800/50 pb-2">
              <label className="font-inter text-xs font-semibold text-cyan-400 uppercase tracking-widest">Execution Steps</label>
              <span className="text-xs text-slate-500 font-mono bg-navy-950 px-2 py-1 rounded border border-navy-800">{steps.length} Step{steps.length !== 1 ? 's' : ''}</span>
            </div>
            
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={step.id} className="relative flex gap-4 p-4 bg-navy-950/30 border border-navy-800/50 rounded-xl group hover:border-cyan-500/30 transition-colors">
                  <div className="flex flex-col items-center mt-1">
                    <div className="w-6 h-6 rounded-full bg-navy-900 text-cyan-400 flex items-center justify-center font-mono text-xs font-bold border border-cyan-500/30 shadow-cyan-glow">
                      {index + 1}
                    </div>
                    {index !== steps.length - 1 && <div className="w-px h-full bg-navy-800 mt-2"></div>}
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase tracking-wider">Action / Prompt</label>
                      <input type="text" placeholder="What should happen in this step?" className="w-full bg-navy-950 border border-navy-800 rounded-md text-white px-3 py-2.5 font-inter text-sm focus:outline-none focus:border-cyan-500 placeholder-slate-600 transition-colors" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase tracking-wider">Assigned Agent</label>
                      <select className="w-full bg-navy-950 border border-navy-800 rounded-md text-white px-3 py-2.5 font-inter text-sm focus:outline-none focus:border-cyan-500 appearance-none transition-colors">
                        <option>Alpha-Node-01</option>
                        <option>Beta-Node-02</option>
                        <option>Gamma-Node-03</option>
                        <option>Delta-Node-04</option>
                        <option>Epsilon-Node-05</option>
                        <option className="italic text-cyan-500">✨ Auto-assign best fit</option>
                      </select>
                    </div>
                  </div>

                  {steps.length > 1 && (
                    <button onClick={() => removeStep(step.id)} className="opacity-0 group-hover:opacity-100 absolute -right-2 -top-2 bg-navy-800 hover:bg-rose-500 text-slate-400 hover:text-white p-1.5 rounded-full border border-navy-700 transition-all shadow-lg focus:outline-none">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <Button variant="secondary" onClick={addStep} className="w-full border-dashed border-navy-700 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-400 py-3 mt-4 bg-navy-950/20">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Next Step
            </Button>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-navy-950/80 p-6 border-t border-navy-800/50 flex justify-end gap-3 shrink-0">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onClose} className="gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Save & Activate
          </Button>
        </div>
      </div>
    </div>
  );
};
  `,
  'Workflows.tsx': `
import React, { useState } from 'react';
import { WorkflowCard, type WorkflowCardProps } from './WorkflowCard';
import { WorkflowSlideOver } from './WorkflowSlideOver';
import { CreateWorkflowModal } from './CreateWorkflowModal';
import { Button } from './Button';

const DUMMY_WORKFLOWS: Omit<WorkflowCardProps, 'onClick'>[] = [
  { id: 'w1', name: 'Daily Lead Enrichment', description: 'Scrapes targeted company domains, finds key stakeholders, and enriches profiles using Apollo.', status: 'running', lastRun: '10 mins ago', successRate: '98.5%' },
  { id: 'w2', name: 'Automated Code QA', description: 'Pulls PRs from GitHub, reviews code against formatting guidelines, and posts comments.', status: 'paused', lastRun: '2 days ago', successRate: '99.1%' },
  { id: 'w3', name: 'Weekly Outreach Sequence', description: 'Drafts personalized email sequences for top 100 leads and pushes to HubSpot.', status: 'running', lastRun: '1 hour ago', successRate: '95.2%' },
  { id: 'w4', name: 'Security Vulnerability Scan', description: 'Scans infrastructure configurations and active repositories for critical CVEs.', status: 'failed', lastRun: '5 mins ago', successRate: '72.4%' },
];

export const Workflows: React.FC = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowCardProps | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500 relative">
      <header className="mb-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-poppins text-3xl font-semibold text-white tracking-tight mb-2">Automation Workflows</h1>
          <p className="font-inter text-sm text-slate-400">Manage and monitor your multi-agent execution chains.</p>
        </div>
        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)} className="gap-2 shadow-cyan-glow shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create Workflow
        </Button>
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

      <CreateWorkflowModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};
  `
};

Object.entries(files).forEach(([file, content]) => fs.writeFileSync(path.join(SRC_DIR, file), content.trim()));
console.log('Phase 3 Workflow Builder Modal created successfully!');
