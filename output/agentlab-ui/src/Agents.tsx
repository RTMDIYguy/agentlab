import React, { useState, useEffect } from "react";
import { AgentCard, type AgentCardProps } from "./AgentCard";
import { AgentSlideOver } from "./AgentSlideOver";
import { fetchAgents } from "./services/api";

export const Agents: React.FC = () => {
  const [agents, setAgents] = useState<
    Omit<AgentCardProps, "onClick" | "onAction">[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AgentCardProps | null>(
    null
  );
  const [filter, setFilter] = useState<"all" | "active" | "idle" | "error">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadSwarm() {
      setIsLoading(true);
      try {
        const data = await fetchAgents();
        if (isMounted) {
          setAgents(data);
        }
      } catch (err) {
        console.error("[Agents] Failed to load agent swarm:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadSwarm();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAction = (
    action: "pause" | "restart" | "terminate",
    id: string
  ) => {
    if (action === "terminate") {
      setAgents(prev => prev.filter(a => a.id !== id));
      if (selectedAgent?.id === id) setSelectedAgent(null);
    } else {
      setAgents(prev =>
        prev.map(a => {
          if (a.id === id) {
            return {
              ...a,
              status: action === "pause" ? "idle" : "active",
            } as any;
          }
          return a;
        })
      );
      if (selectedAgent?.id === id) {
        setSelectedAgent(prev =>
          prev
            ? { ...prev, status: action === "pause" ? "idle" : "active" }
            : null
        );
      }
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesFilter = filter === "all" || agent.status === filter;
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500 relative">
      <header className="mb-2">
        <h1 className="font-poppins text-3xl font-semibold text-white tracking-tight mb-2">
          Agent Swarm
        </h1>
        <p className="font-inter text-sm text-slate-400">
          Monitor and manage your autonomous agents across the network.
        </p>
      </header>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-navy-900/50 p-4 rounded-xl border border-navy-800">
        <div className="relative w-full sm:w-64">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
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
            placeholder="Search agents..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-navy-950 border border-navy-700 rounded-lg text-white pl-10 pr-4 py-2 font-inter text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(["all", "active", "idle", "error"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-inter text-xs font-medium capitalize whitespace-nowrap transition-all ${
                filter === f
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                  : "bg-navy-950 text-slate-400 border border-navy-800 hover:border-navy-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-navy-900/30 rounded-2xl border border-navy-800/80">
          <div className="w-10 h-10 border-3 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mb-4" />
          <p className="text-slate-300 font-inter text-sm font-medium">
            Loading swarm nodes & telemetry...
          </p>
          <p className="text-slate-500 font-mono text-xs mt-1">
            Connecting to Cloud Run orchestrator
          </p>
        </div>
      ) : filteredAgents.length > 0 ? (
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
          <p className="text-slate-400 font-inter">
            No agents found matching your criteria.
          </p>
        </div>
      )}

      <AgentSlideOver
        agent={selectedAgent as any}
        onClose={() => setSelectedAgent(null)}
      />
    </div>
  );
};
