import React, { useState, useMemo } from "react";
import {
  AuditDetailSlideOver,
  type AuditLogItem,
} from "./AuditDetailSlideOver";

const INITIAL_AUDIT_DATA: AuditLogItem[] = [
  {
    id: "TRC-90412",
    timestamp: "2026-08-22 10:22:15",
    agentName: "Alpha-Node-01",
    agentId: "agt_alpha_01",
    actionType: "API Call",
    workflowContext: "Inbound Lead Enrichment",
    workflowId: "wf_lead_enrich_01",
    model: "gemini-1.5-pro",
    tokensUsed: 1420,
    promptTokens: 1120,
    completionTokens: 300,
    cost: 0.0028,
    latencyMs: 384,
    status: "success",
    requestPayload: JSON.stringify(
      {
        endpoint: "https://api.hunter.io/v2/domain-search",
        method: "POST",
        body: {
          domain: "bootstrapcapital.io",
          seniority: ["founder", "executive"],
          limit: 10,
        },
      },
      null,
      2
    ),
    responsePayload: JSON.stringify(
      {
        status: 200,
        data: {
          emails_found: 8,
          domain: "bootstrapcapital.io",
          verification_confidence: 0.96,
        },
      },
      null,
      2
    ),
    policyChecks: {
      saifPassed: true,
      piiDetected: 0,
      budgetThresholdPassed: true,
    },
  },
  {
    id: "TRC-90413",
    timestamp: "2026-08-22 10:21:40",
    agentName: "Coder-Agent-07",
    agentId: "agt_coder_07",
    actionType: "Code Exec",
    workflowContext: "Auto-Refactor & Test Suite",
    workflowId: "wf_ci_cd_deploy",
    model: "claude-3-7-sonnet",
    tokensUsed: 4580,
    promptTokens: 3800,
    completionTokens: 780,
    cost: 0.0214,
    latencyMs: 1420,
    status: "success",
    requestPayload: `// Proposed test payload\nimport { describe, it, expect } from 'vitest';\nimport { validatePayload } from '../src/security';\n\ndescribe('Security Guardrails', () => {\n  it('should reject malformed unicode escape payloads', () => {\n    expect(() => validatePayload('\\\\uXXXX')).toThrow();\n  });\n});`,
    responsePayload: `✓ 12 tests passed across 3 suites\nDuration: 412ms\nExit Code: 0 (Success)`,
    policyChecks: {
      saifPassed: true,
      piiDetected: 0,
      budgetThresholdPassed: true,
    },
  },
  {
    id: "TRC-90414",
    timestamp: "2026-08-22 10:19:12",
    agentName: "SDR-Scraper-02",
    agentId: "agt_sdr_02",
    actionType: "Web Scrape",
    workflowContext: "Founder Outreach Matrix",
    workflowId: "wf_outreach_matrix",
    model: "gpt-4o-mini",
    tokensUsed: 2150,
    promptTokens: 1850,
    completionTokens: 300,
    cost: 0.0011,
    latencyMs: 820,
    status: "warning",
    requestPayload: JSON.stringify(
      {
        targetUrl: "https://news.ycombinator.com/item?id=3918231",
        selector: ".comment-tree .athing",
        extractFields: ["author", "body", "timestamp"],
      },
      null,
      2
    ),
    responsePayload: JSON.stringify(
      {
        itemsScraped: 42,
        rateLimitWarning:
          "Approaching origin server rate limit (90/100 requests/min)",
        retryAfterSeconds: 4,
      },
      null,
      2
    ),
    policyChecks: {
      saifPassed: true,
      piiDetected: 1,
      budgetThresholdPassed: true,
    },
  },
  {
    id: "TRC-90415",
    timestamp: "2026-08-22 10:15:04",
    agentName: "Workflow-Planner-04",
    agentId: "agt_planner_04",
    actionType: "Text Gen",
    workflowContext: "Autonomous Task Router",
    workflowId: "wf_task_router",
    model: "gemini-1.5-pro",
    tokensUsed: 3120,
    promptTokens: 2500,
    completionTokens: 620,
    cost: 0.0062,
    latencyMs: 910,
    status: "success",
    requestPayload: `System Prompt: You are the Workflow Orchestrator for URC.\nTask: Route incoming founder intake request to CRM continuity pipeline and draft calendar invite.`,
    responsePayload: JSON.stringify(
      {
        decision: "CONTINUITY_WORKSHOP_INTAKE",
        confidence: 0.98,
        suggestedAgents: ["agt_sdr_02", "agt_calendar_01"],
        nextStepDeadline: "2026-08-22T17:00:00Z",
      },
      null,
      2
    ),
    policyChecks: {
      saifPassed: true,
      piiDetected: 0,
      budgetThresholdPassed: true,
    },
  },
  {
    id: "TRC-90416",
    timestamp: "2026-08-22 10:11:33",
    agentName: "Auditor-Bot-9",
    agentId: "agt_audit_09",
    actionType: "DB Query",
    workflowContext: "Ledger Reconciliation",
    workflowId: "wf_fin_reconcile",
    model: "gpt-4o",
    tokensUsed: 890,
    promptTokens: 750,
    completionTokens: 140,
    cost: 0.0044,
    latencyMs: 195,
    status: "error",
    requestPayload: `SELECT transaction_id, amount, status FROM ledger_entries WHERE client_id = 'URC_CLIENT_881' AND reconciled = false;`,
    responsePayload: `ERROR: connection to database host "postgres-internal-ro:5432" timed out after 5000ms`,
    errorMessage:
      "PostgreSQL connection timeout during read-only ledger reconciliation query.",
    policyChecks: {
      saifPassed: false,
      piiDetected: 0,
      budgetThresholdPassed: true,
    },
  },
  {
    id: "TRC-90417",
    timestamp: "2026-08-22 10:04:18",
    agentName: "Alpha-Node-01",
    agentId: "agt_alpha_01",
    actionType: "Tool Call",
    workflowContext: "Inbound Lead Enrichment",
    workflowId: "wf_lead_enrich_01",
    model: "gemini-1.5-pro",
    tokensUsed: 1820,
    promptTokens: 1520,
    completionTokens: 300,
    cost: 0.0036,
    latencyMs: 440,
    status: "success",
    requestPayload: JSON.stringify(
      {
        tool: "ghprojectmanagement.create_issue",
        parameters: {
          title: "[Auto-Sync] Sync lead pipeline to M365 Finance Control",
          labels: ["automated", "operations"],
        },
      },
      null,
      2
    ),
    responsePayload: JSON.stringify(
      {
        issueNumber: 142,
        htmlUrl: "https://github.com/RTMDIYguy/agentlab/issues/142",
        state: "open",
      },
      null,
      2
    ),
    policyChecks: {
      saifPassed: true,
      piiDetected: 0,
      budgetThresholdPassed: true,
    },
  },
];

export const AuditLogs: React.FC = () => {
  const [logs] = useState<AuditLogItem[]>(INITIAL_AUDIT_DATA);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "success" | "error" | "warning"
  >("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredLogs = useMemo(() => {
    return logs.filter(item => {
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchesAction =
        actionFilter === "all" || item.actionType === actionFilter;
      const matchesSearch =
        item.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.workflowContext
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.model.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesAction && matchesSearch;
    });
  }, [logs, statusFilter, actionFilter, searchQuery]);

  const summaryStats = useMemo(() => {
    const totalCost = logs.reduce((acc, l) => acc + l.cost, 0);
    const totalTokens = logs.reduce((acc, l) => acc + l.tokensUsed, 0);
    const successCount = logs.filter(l => l.status === "success").length;
    const passRate = ((successCount / logs.length) * 100).toFixed(1);
    return { totalCost, totalTokens, passRate, count: logs.length };
  }, [logs]);

  const statusBadge = (status: AuditLogItem["status"]) => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
            Success
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
            Warning
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
            Failed
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Telemetry Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-poppins text-2xl font-bold text-white tracking-wide">
              Audit Logs & Governance
            </h1>
            <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs px-2.5 py-0.5 rounded-full font-mono">
              Live Feed
            </span>
          </div>
          <p className="font-inter text-sm text-slate-400 mt-1">
            Real-time LLM trace monitoring, security guardrails, token
            consumption, and cost telemetry.
          </p>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-navy-900 border border-navy-800/80 p-5 rounded-2xl">
          <div className="text-xs font-inter text-slate-400 mb-1">
            Today's Inference Spend
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-400">
            ${summaryStats.totalCost.toFixed(4)}
          </div>
          <div className="text-[11px] font-inter text-slate-500 mt-1">
            100% within daily cap ($50.00)
          </div>
        </div>

        <div className="bg-navy-900 border border-navy-800/80 p-5 rounded-2xl">
          <div className="text-xs font-inter text-slate-400 mb-1">
            Total Tokens Processed
          </div>
          <div className="font-mono text-2xl font-bold text-cyan-400">
            {summaryStats.totalTokens.toLocaleString()}
          </div>
          <div className="text-[11px] font-inter text-slate-500 mt-1">
            Across 4 active models
          </div>
        </div>

        <div className="bg-navy-900 border border-navy-800/80 p-5 rounded-2xl">
          <div className="text-xs font-inter text-slate-400 mb-1">
            Policy Guardrail Pass Rate
          </div>
          <div className="font-mono text-2xl font-bold text-white">
            {summaryStats.passRate}%
          </div>
          <div className="text-[11px] font-inter text-emerald-400 mt-1">
            ✓ SAIF security active
          </div>
        </div>

        <div className="bg-navy-900 border border-navy-800/80 p-5 rounded-2xl">
          <div className="text-xs font-inter text-slate-400 mb-1">
            Logged Executions
          </div>
          <div className="font-mono text-2xl font-bold text-amber-400">
            {summaryStats.count} Traces
          </div>
          <div className="text-[11px] font-inter text-slate-500 mt-1">
            Filtered from buffer
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-navy-900/60 p-4 rounded-2xl border border-navy-800/60">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by Agent, Workflow, Model, or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-navy-950 border border-navy-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center bg-navy-950 p-1 rounded-xl border border-navy-800 text-xs font-inter">
            {(["all", "success", "warning", "error"] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  statusFilter === status
                    ? "bg-navy-800 text-cyan-400 font-medium shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="bg-navy-950 border border-navy-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400 font-inter"
          >
            <option value="all">All Action Types</option>
            <option value="API Call">API Call</option>
            <option value="Web Scrape">Web Scrape</option>
            <option value="Text Gen">Text Gen</option>
            <option value="DB Query">DB Query</option>
            <option value="Code Exec">Code Exec</option>
            <option value="Tool Call">Tool Call</option>
          </select>
        </div>
      </div>

      {/* Dense Audit Logs Table */}
      <div className="bg-navy-900 border border-navy-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-navy-800/80 bg-navy-950/60 text-[11px] font-poppins uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-5">Timestamp / ID</th>
                <th className="py-3.5 px-5">Agent</th>
                <th className="py-3.5 px-5">Action Type</th>
                <th className="py-3.5 px-5">Workflow Context</th>
                <th className="py-3.5 px-5">Tokens</th>
                <th className="py-3.5 px-5">Cost</th>
                <th className="py-3.5 px-5">Latency</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/40 text-xs font-inter">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-slate-500 font-inter"
                  >
                    No execution records match your active search filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedLog(item)}
                    className="hover:bg-navy-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-5">
                      <div className="font-mono text-slate-300">
                        {item.timestamp.split(" ")[1]}
                      </div>
                      <div className="font-mono text-[10px] text-cyan-500">
                        {item.id}
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-medium text-white group-hover:text-cyan-300 transition-colors">
                        {item.agentName}
                      </span>
                      <div className="text-[10px] font-mono text-slate-500">
                        {item.model}
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span className="bg-navy-950 px-2.5 py-1 rounded-md text-slate-300 font-mono text-[11px] border border-navy-800">
                        {item.actionType}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-slate-300 font-medium">
                      {item.workflowContext}
                    </td>

                    <td className="py-4 px-5 font-mono text-slate-300">
                      {item.tokensUsed.toLocaleString()}
                    </td>

                    <td className="py-4 px-5 font-mono font-medium text-emerald-400">
                      ${item.cost.toFixed(4)}
                    </td>

                    <td className="py-4 px-5 font-mono text-slate-400">
                      {item.latencyMs}ms
                    </td>

                    <td className="py-4 px-5">{statusBadge(item.status)}</td>

                    <td className="py-4 px-5 text-right">
                      <button className="text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all">
                        <svg
                          className="w-4 h-4 inline"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      <AuditDetailSlideOver
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
};
