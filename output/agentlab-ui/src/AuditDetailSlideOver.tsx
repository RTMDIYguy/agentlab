import React from 'react';

export interface AuditLogItem {
  id: string;
  timestamp: string;
  agentName: string;
  agentId: string;
  actionType: 'API Call' | 'Web Scrape' | 'Text Gen' | 'DB Query' | 'Code Exec' | 'Tool Call';
  workflowContext: string;
  workflowId: string;
  model: string;
  tokensUsed: number;
  promptTokens: number;
  completionTokens: number;
  cost: number;
  latencyMs: number;
  status: 'success' | 'error' | 'warning';
  requestPayload: string;
  responsePayload: string;
  policyChecks: {
    saifPassed: boolean;
    piiDetected: number;
    budgetThresholdPassed: boolean;
  };
  errorMessage?: string;
}

interface AuditDetailSlideOverProps {
  log: AuditLogItem | null;
  onClose: () => void;
}

export const AuditDetailSlideOver: React.FC<AuditDetailSlideOverProps> = ({ log, onClose }) => {
  if (!log) return null;

  const statusStyles = {
    success: {
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
      label: 'Success'
    },
    warning: {
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
      label: 'Warning'
    },
    error: {
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      dot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
      label: 'Failed'
    }
  };

  const currentStatus = statusStyles[log.status];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-40 transition-opacity" 
        onClick={onClose} 
      />

      {/* Slide-over Container */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-navy-900 border-l border-navy-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-navy-800/80 bg-navy-950/40">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${currentStatus.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
                {currentStatus.label}
              </span>
              <span className="font-mono text-xs text-cyan-400 bg-cyan-950/50 border border-cyan-800/50 px-2 py-0.5 rounded">
                {log.id}
              </span>
            </div>
            <h2 className="font-poppins text-lg font-semibold text-white tracking-wide">
              {log.actionType} &middot; <span className="text-cyan-300">{log.agentName}</span>
            </h2>
            <p className="font-inter text-xs text-slate-400 mt-0.5">
              Workflow: <span className="text-slate-300 font-medium">{log.workflowContext}</span> &middot; {log.timestamp}
            </p>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors focus:outline-none"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-navy-950/60 p-3.5 rounded-xl border border-navy-800/80">
              <div className="text-xs font-inter text-slate-400 mb-1">Latency</div>
              <div className="text-base font-mono font-semibold text-cyan-400">{log.latencyMs} ms</div>
            </div>

            <div className="bg-navy-950/60 p-3.5 rounded-xl border border-navy-800/80">
              <div className="text-xs font-inter text-slate-400 mb-1">Est. Cost</div>
              <div className="text-base font-mono font-semibold text-emerald-400">
                ${log.cost.toFixed(4)}
              </div>
            </div>

            <div className="bg-navy-950/60 p-3.5 rounded-xl border border-navy-800/80">
              <div className="text-xs font-inter text-slate-400 mb-1">Tokens</div>
              <div className="text-base font-mono font-semibold text-amber-400">
                {log.tokensUsed.toLocaleString()}
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                {log.promptTokens} in / {log.completionTokens} out
              </div>
            </div>

            <div className="bg-navy-950/60 p-3.5 rounded-xl border border-navy-800/80">
              <div className="text-xs font-inter text-slate-400 mb-1">Model</div>
              <div className="text-xs font-mono font-semibold text-white truncate" title={log.model}>
                {log.model}
              </div>
            </div>
          </div>

          {/* Governance & Policy Verification */}
          <div className="bg-navy-950/40 p-4 rounded-xl border border-navy-800/60 space-y-3">
            <h3 className="font-poppins text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Governance & Guardrails Check
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-inter">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-900/80 border border-navy-800">
                <span className="text-slate-400">SAIF Security</span>
                <span className={`font-mono font-medium ${log.policyChecks.saifPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {log.policyChecks.saifPassed ? '✓ Passed' : '✗ Flagged'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-900/80 border border-navy-800">
                <span className="text-slate-400">PII Redaction</span>
                <span className="font-mono font-medium text-cyan-400">
                  {log.policyChecks.piiDetected === 0 ? '0 Detections' : `${log.policyChecks.piiDetected} Redacted`}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-900/80 border border-navy-800">
                <span className="text-slate-400">Budget Limit</span>
                <span className={`font-mono font-medium ${log.policyChecks.budgetThresholdPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {log.policyChecks.budgetThresholdPassed ? '✓ Compliant' : '⚠ Near Cap'}
                </span>
              </div>
            </div>

            {log.errorMessage && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs font-mono text-rose-300">
                <span className="font-semibold uppercase tracking-wider text-rose-400 block mb-1">Execution Failure:</span>
                {log.errorMessage}
              </div>
            )}
          </div>

          {/* Raw Request Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-poppins text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Raw Prompt & Request Payload
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                {log.promptTokens} tokens
              </span>
            </div>
            <div className="bg-navy-950 border border-navy-800/80 rounded-xl p-4 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto max-h-60 whitespace-pre">
              {log.requestPayload}
            </div>
          </div>

          {/* Raw Response Payload */}
          <div className="space-y-2 pb-6">
            <div className="flex items-center justify-between">
              <h3 className="font-poppins text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Raw Execution Response
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                {log.completionTokens} tokens
              </span>
            </div>
            <div className="bg-navy-950 border border-navy-800/80 rounded-xl p-4 font-mono text-xs text-emerald-400/90 leading-relaxed overflow-x-auto max-h-60 whitespace-pre">
              {log.responsePayload}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
