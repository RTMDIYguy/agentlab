import React, { useState } from "react";

type SettingsTab = "general" | "apikeys" | "billing" | "security" | "team";

interface ApiKeyField {
  id: string;
  name: string;
  provider: string;
  value: string;
  masked: string;
  status: "connected" | "missing";
}

const INITIAL_KEYS: ApiKeyField[] = [
  {
    id: "openai",
    name: "OpenAI API Key",
    provider: "GPT-4o, GPT-4o-mini",
    value: "sk-proj-99214482910481239841",
    masked: "sk-proj-9921••••••••••••8941",
    status: "connected",
  },
  {
    id: "anthropic",
    name: "Anthropic API Key",
    provider: "Claude 3.7 Sonnet, Haiku",
    value: "sk-ant-api03-09418241928310",
    masked: "sk-ant-api03••••••••••••8310",
    status: "connected",
  },
  {
    id: "google",
    name: "Google AI / Vertex API Key",
    provider: "Gemini 1.5 Pro, Flash",
    value: "AIzaSyA8941049281726354819",
    masked: "AIzaSyA894••••••••••••4819",
    status: "connected",
  },
  {
    id: "hubspot",
    name: "HubSpot Private App Token",
    provider: "CRM Pipeline Sync",
    value: "pat-na1-89412-9841",
    masked: "pat-na1-8941••••••••••••9841",
    status: "connected",
  },
  {
    id: "apollo",
    name: "Apollo.io API Key",
    provider: "Lead Enrichment & Verification",
    value: "",
    masked: "Not configured",
    status: "missing",
  },
  {
    id: "m365",
    name: "Microsoft 365 Graph Client Secret",
    provider: "Finance Tracker & Calendar",
    value: "ms_sec_99182371982",
    masked: "ms_sec_9918••••••••••••7198",
    status: "connected",
  },
];

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("apikeys");
  const [apiKeys, setApiKeys] = useState<ApiKeyField[]>(INITIAL_KEYS);
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [monthlyLimit, setMonthlyLimit] = useState<number>(500);
  const [autoPauseSwarm, setAutoPauseSwarm] = useState<boolean>(true);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Security toggles
  const [piiRedaction, setPiiRedaction] = useState<boolean>(true);
  const [saifEnforcement, setSaifEnforcement] = useState<boolean>(true);
  const [retentionDays, setRetentionDays] = useState<string>("90");

  // General settings
  const [workspaceName, setWorkspaceName] = useState("URC / Tactix Swarm");
  const [defaultModel, setDefaultModel] = useState("gemini-1.5-pro");

  const toggleShowKey = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleKeyChange = (id: string, val: string) => {
    setApiKeys(prev =>
      prev.map(k => {
        if (k.id === id) {
          return {
            ...k,
            value: val,
            masked: val
              ? `${val.slice(0, 8)}••••••••${val.slice(-4)}`
              : "Not configured",
            status: val ? "connected" : "missing",
          };
        }
        return k;
      })
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveFeedback("Settings successfully persisted to runtime vault.");
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-poppins text-2xl font-bold text-white tracking-wide">
          Platform Settings
        </h1>
        <p className="font-inter text-sm text-slate-400 mt-1">
          Configure API credentials, runtime budget guardrails, security
          policies, and workspace parameters.
        </p>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left-hand Navigation Menu */}
        <div className="md:col-span-4 lg:col-span-3 space-y-1">
          <nav className="bg-navy-900 border border-navy-800 rounded-2xl p-2 space-y-1">
            {[
              {
                id: "general",
                label: "General",
                icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
              },
              {
                id: "apikeys",
                label: "API Keys & Providers",
                icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
              },
              {
                id: "billing",
                label: "Billing & Budget",
                icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                id: "security",
                label: "Security & Guardrails",
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
              },
              {
                id: "team",
                label: "Team & Access",
                icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
              },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-inter font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-navy-800 text-cyan-400 shadow-cyan-glow border border-navy-700"
                    : "text-slate-400 hover:text-slate-200 hover:bg-navy-950/60"
                }`}
              >
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
                    d={tab.icon}
                  />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right-hand Content Panel */}
        <div className="md:col-span-8 lg:col-span-9">
          <form
            onSubmit={handleSave}
            className="bg-navy-900 border border-navy-800 rounded-2xl p-6 md:p-8 space-y-6"
          >
            {/* Feedback Banner */}
            {saveFeedback && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-inter text-emerald-400 flex items-center gap-2">
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
                {saveFeedback}
              </div>
            )}

            {/* TAB: API Keys */}
            {activeTab === "apikeys" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-poppins text-lg font-semibold text-white">
                    Provider API Keys
                  </h3>
                  <p className="font-inter text-xs text-slate-400 mt-1">
                    Keys are stored securely and injected dynamically into
                    sandboxed agent runtimes.
                  </p>
                </div>

                <div className="space-y-4">
                  {apiKeys.map(keyItem => (
                    <div
                      key={keyItem.id}
                      className="bg-navy-950/70 p-4 rounded-xl border border-navy-800/80 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold font-poppins text-white">
                            {keyItem.name}
                          </span>
                          <span className="text-[11px] font-inter text-slate-500 ml-2">
                            ({keyItem.provider})
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                            keyItem.status === "connected"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {keyItem.status}
                        </span>
                      </div>

                      <div className="relative">
                        <input
                          type={showKeys[keyItem.id] ? "text" : "password"}
                          value={keyItem.value}
                          placeholder="Enter API Key..."
                          onChange={e =>
                            handleKeyChange(keyItem.id, e.target.value)
                          }
                          className="w-full bg-navy-900 border border-navy-700 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400 pr-20"
                        />
                        <button
                          type="button"
                          onClick={() => toggleShowKey(keyItem.id)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-inter text-slate-400 hover:text-cyan-400 transition-colors"
                        >
                          {showKeys[keyItem.id] ? "Hide" : "Reveal"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Billing & Budget */}
            {activeTab === "billing" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-poppins text-lg font-semibold text-white">
                    Swarm Budget & Spend Caps
                  </h3>
                  <p className="font-inter text-xs text-slate-400 mt-1">
                    Control maximum financial exposure and configure autonomic
                    pause triggers.
                  </p>
                </div>

                <div className="bg-navy-950/70 p-5 rounded-xl border border-navy-800/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold font-poppins text-white">
                        Hard Monthly Spend Cap
                      </div>
                      <div className="text-[11px] font-inter text-slate-400">
                        Total allowed LLM inference & scraping expenditure per
                        month.
                      </div>
                    </div>
                    <div className="font-mono text-lg font-bold text-cyan-400">
                      ${monthlyLimit}
                    </div>
                  </div>

                  <input
                    type="range"
                    min="50"
                    max="5000"
                    step="50"
                    value={monthlyLimit}
                    onChange={e => setMonthlyLimit(Number(e.target.value))}
                    className="w-full h-2 bg-navy-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>$50/mo</span>
                    <span>$2,500/mo</span>
                    <span>$5,000/mo</span>
                  </div>
                </div>

                <div className="bg-navy-950/70 p-5 rounded-xl border border-navy-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold font-poppins text-white">
                      Auto-Pause Swarm at 90% Threshold
                    </div>
                    <div className="text-[11px] font-inter text-slate-400">
                      Gracefully halt new cron triggers when expenditure exceeds
                      ${(monthlyLimit * 0.9).toFixed(0)}.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoPauseSwarm}
                      onChange={e => setAutoPauseSwarm(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-navy-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
              </div>
            )}

            {/* TAB: Security & Guardrails */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-poppins text-lg font-semibold text-white">
                    Governance & Guardrails
                  </h3>
                  <p className="font-inter text-xs text-slate-400 mt-1">
                    Manage data privacy, SAIF compliance policies, and audit
                    retention schedules.
                  </p>
                </div>

                <div className="bg-navy-950/70 p-5 rounded-xl border border-navy-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold font-poppins text-white">
                      Automatic PII Redaction
                    </div>
                    <div className="text-[11px] font-inter text-slate-400">
                      Filter SSNs, phone numbers, and private credentials before
                      sending to LLMs.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={piiRedaction}
                      onChange={e => setPiiRedaction(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-navy-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>

                <div className="bg-navy-950/70 p-5 rounded-xl border border-navy-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold font-poppins text-white">
                      SAIF Compliance Enforcement
                    </div>
                    <div className="text-[11px] font-inter text-slate-400">
                      Enforce Secure AI Framework zero-trust validation on
                      external tool execution.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saifEnforcement}
                      onChange={e => setSaifEnforcement(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-navy-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>

                <div className="bg-navy-950/70 p-5 rounded-xl border border-navy-800/80 space-y-2">
                  <div className="text-xs font-semibold font-poppins text-white">
                    Audit Log Retention Period
                  </div>
                  <select
                    value={retentionDays}
                    onChange={e => setRetentionDays(e.target.value)}
                    className="w-full bg-navy-900 border border-navy-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-inter"
                  >
                    <option value="30">30 Days (Standard Sandbox)</option>
                    <option value="60">60 Days</option>
                    <option value="90">
                      90 Days (Recommended for URC Operations)
                    </option>
                    <option value="365">
                      365 Days (Enterprise Compliance)
                    </option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB: General */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-poppins text-lg font-semibold text-white">
                    General Environment
                  </h3>
                  <p className="font-inter text-xs text-slate-400 mt-1">
                    System identifiers and runtime model preferences.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-poppins text-slate-300 font-medium">
                      Workspace Organization
                    </label>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={e => setWorkspaceName(e.target.value)}
                      className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-inter"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-poppins text-slate-300 font-medium">
                      Default Orchestrator Model
                    </label>
                    <select
                      value={defaultModel}
                      onChange={e => setDefaultModel(e.target.value)}
                      className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-inter"
                    >
                      <option value="gemini-1.5-pro">
                        Gemini 1.5 Pro (Default)
                      </option>
                      <option value="claude-3-7-sonnet">
                        Claude 3.7 Sonnet
                      </option>
                      <option value="gpt-4o">GPT-4o</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Team */}
            {activeTab === "team" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-poppins text-lg font-semibold text-white">
                    Team & Operator Roles
                  </h3>
                  <p className="font-inter text-xs text-slate-400 mt-1">
                    Authorized human operators with deployment privileges.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-navy-950/70 rounded-xl border border-navy-800 flex items-center justify-between text-xs font-inter">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-600 font-bold text-navy-950 flex items-center justify-center">
                        RM
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          Robert M. (You)
                        </div>
                        <div className="text-slate-500 font-mono text-[11px]">
                          Owner &bull; Full Admin Privileges
                        </div>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-mono text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Bar */}
            <div className="pt-4 border-t border-navy-800/80 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-navy-950 font-poppins font-semibold text-xs rounded-xl transition-all shadow-cyan-glow hover:shadow-cyan-glow-lg focus:outline-none"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
