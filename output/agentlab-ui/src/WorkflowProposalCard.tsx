import React, { useState } from "react";

export interface WorkflowStep {
  stepNumber: number;
  type: "trigger" | "agent" | "guardrail" | "destination";
  title: string;
  detail: string;
  agentId?: string;
}

export interface ProposedWorkflow {
  id: string;
  name: string;
  description: string;
  estimatedCostPerRun: number;
  estimatedLatencySeconds: number;
  triggerType: string;
  steps: WorkflowStep[];
  guardrails: string[];
}

interface WorkflowProposalCardProps {
  proposal: ProposedWorkflow;
  onApprove?: (proposalId: string) => void;
  onModify?: (proposalId: string) => void;
}

export const WorkflowProposalCard: React.FC<WorkflowProposalCardProps> = ({
  proposal,
  onApprove,
  onModify,
}) => {
  const [isApproved, setIsApproved] = useState(false);

  const handleApprove = () => {
    setIsApproved(true);
    if (onApprove) onApprove(proposal.id);
  };

  const getStepBadge = (type: WorkflowStep["type"]) => {
    switch (type) {
      case "trigger":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "agent":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "guardrail":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "destination":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    }
  };

  return (
    <div className="mt-3 w-full max-w-xl bg-navy-950 border border-cyan-500/40 rounded-2xl p-5 shadow-lg shadow-cyan-950/30 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-navy-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Autonomic Blueprint Proposal
            </span>
            <span className="text-xs font-mono text-slate-500">
              {proposal.id}
            </span>
          </div>
          <h3 className="font-poppins text-base font-semibold text-white tracking-wide">
            {proposal.name}
          </h3>
          <p className="font-inter text-xs text-slate-400 mt-1">
            {proposal.description}
          </p>
        </div>
      </div>

      {/* Workflow Step Pipeline */}
      <div className="my-4 space-y-2.5">
        <div className="text-[11px] font-poppins uppercase tracking-wider text-slate-400 font-medium">
          Execution Flow (DAG)
        </div>
        <div className="space-y-2">
          {proposal.steps.map(step => (
            <div
              key={step.stepNumber}
              className="flex items-center justify-between p-2.5 rounded-xl bg-navy-900/80 border border-navy-800/80 text-xs font-inter"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-navy-800 text-slate-300 font-mono text-[11px] flex items-center justify-center font-semibold">
                  {step.stepNumber}
                </span>
                <div>
                  <span className="text-white font-medium">{step.title}</span>
                  <span className="text-slate-400 text-[11px] ml-2">
                    ({step.detail})
                  </span>
                </div>
              </div>
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getStepBadge(step.type)}`}
              >
                {step.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics & Guardrails */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4 text-xs font-inter">
        <div className="bg-navy-900/60 p-2.5 rounded-xl border border-navy-800">
          <div className="text-[11px] text-slate-400">Est. Cost / Run</div>
          <div className="font-mono text-emerald-400 font-semibold mt-0.5">
            ~${proposal.estimatedCostPerRun.toFixed(2)}
          </div>
        </div>

        <div className="bg-navy-900/60 p-2.5 rounded-xl border border-navy-800">
          <div className="text-[11px] text-slate-400">Est. Latency</div>
          <div className="font-mono text-cyan-400 font-semibold mt-0.5">
            ~{proposal.estimatedLatencySeconds}s
          </div>
        </div>

        <div className="bg-navy-900/60 p-2.5 rounded-xl border border-navy-800 col-span-2 sm:col-span-1">
          <div className="text-[11px] text-slate-400">Guardrails</div>
          <div className="font-mono text-white text-[11px] mt-0.5 truncate">
            ✓ SAIF &bull; PII Filter
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy-800/80">
        {isApproved ? (
          <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium font-inter">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Approved & Deployed to Runtime
          </div>
        ) : (
          <>
            <button
              onClick={() => onModify && onModify(proposal.id)}
              className="px-4 py-2 text-xs font-inter font-medium text-slate-300 hover:text-white bg-navy-900 hover:bg-navy-800 border border-navy-700 rounded-xl transition-all"
            >
              Modify Request
            </button>
            <button
              onClick={handleApprove}
              className="px-5 py-2 text-xs font-inter font-medium text-navy-950 bg-cyan-400 hover:bg-cyan-300 font-semibold rounded-xl transition-all shadow-cyan-glow hover:shadow-cyan-glow-lg focus:outline-none"
            >
              Approve & Deploy
            </button>
          </>
        )}
      </div>
    </div>
  );
};
