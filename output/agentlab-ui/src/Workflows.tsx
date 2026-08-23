import React, { useState, useEffect } from 'react';
import { WorkflowCard, type WorkflowCardProps } from './WorkflowCard';
import { WorkflowSlideOver } from './WorkflowSlideOver';
import { CreateWorkflowModal } from './CreateWorkflowModal';
import { Button } from './Button';
import { fetchWorkflows } from './services/api';

export const Workflows: React.FC = () => {
  const [workflows, setWorkflows] = useState<Omit<WorkflowCardProps, 'onClick'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowCardProps | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadWorkflows() {
      setIsLoading(true);
      try {
        const data = await fetchWorkflows();
        if (isMounted) {
          setWorkflows(data);
        }
      } catch (err) {
        console.error('[Workflows] Failed to load workflows:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadWorkflows();
    return () => {
      isMounted = false;
    };
  }, []);

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

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-navy-900/30 rounded-2xl border border-navy-800/80">
          <div className="w-10 h-10 border-3 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mb-4" />
          <p className="text-slate-300 font-inter text-sm font-medium">Loading automation execution chains...</p>
          <p className="text-slate-500 font-mono text-xs mt-1">Fetching PostgreSQL DAG registries</p>
        </div>
      ) : workflows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map(wf => (
            <WorkflowCard 
              key={wf.id} 
              {...wf} 
              onClick={() => setSelectedWorkflow(wf as WorkflowCardProps)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-navy-900/30 rounded-2xl border border-dashed border-navy-800">
          <p className="text-slate-400 font-inter">No automation workflows found.</p>
        </div>
      )}

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