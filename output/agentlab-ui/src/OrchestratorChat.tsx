import React, { useState, useRef, useEffect } from "react";
import {
  WorkflowProposalCard,
  type ProposedWorkflow,
} from "./WorkflowProposalCard";
import { sendOrchestratorMessage, deployWorkflow } from "./services/api";

export interface ChatMessage {
  id: string;
  sender: "user" | "system";
  timestamp: string;
  text?: string;
  proposal?: ProposedWorkflow;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "system",
    timestamp: "10:30 AM",
    text: "Hello Robert. I am your AgentLab Orchestrator connected directly to your PostgreSQL swarm runtime. Tell me what operational workflow or business pipeline you want automated, and I'll synthesize the multi-agent DAG architecture for your approval.",
  },
  {
    id: "msg-2",
    sender: "user",
    timestamp: "10:31 AM",
    text: "I need to build an automated workflow that enriches inbound leads from Bootstrapper Capital events and drafts personalized outreach with strict cost and PII guardrails.",
  },
  {
    id: "msg-3",
    sender: "system",
    timestamp: "10:31 AM",
    text: "I've structured an optimized 5-step DAG blueprint with Alpha-Node-01 for research, an inline PII redaction guardrail, and SDR-Writer-02 for personalized generation. Review the architecture below:",
    proposal: {
      id: "WFP-2026-08",
      name: "Autonomous Lead Enrichment & Outreach",
      description:
        "Ingests new inbound leads from Bootstrapper Capital roundtables, enriches contact signals, verifies deliverability, and drafts tailored founder introductions.",
      estimatedCostPerRun: 0.45,
      estimatedLatencySeconds: 12,
      triggerType: "Event / Inbound Webhook",
      guardrails: [
        "SAIF Verified",
        "Zero Data Retention Policy",
        "Daily Cost Cap: $10",
      ],
      steps: [
        {
          stepNumber: 1,
          type: "trigger",
          title: "Inbound Webhook",
          detail: "Bootstrapper Capital Roundtables Intake",
        },
        {
          stepNumber: 2,
          type: "agent",
          title: "Alpha-Node-01 (Researcher)",
          detail: "Search domain, identify decision makers & tech stack",
        },
        {
          stepNumber: 3,
          type: "guardrail",
          title: "PII & Security Redaction",
          detail: "Ensure GDPR & CCPA compliance filters pass",
        },
        {
          stepNumber: 4,
          type: "agent",
          title: "SDR-Writer-02 (Copywriter)",
          detail: "Draft personalized value proposition email",
        },
        {
          stepNumber: 5,
          type: "destination",
          title: "M365 CRM-Lite Pipeline",
          detail: "Sync records to active pipeline tracker",
        },
      ],
    },
  },
];

export const OrchestratorChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue.trim();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: userText,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Call live Node.js Express Orchestrator API
      const result = await sendOrchestratorMessage(userText);

      const reply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "system",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        text: result.reply,
        proposal: result.proposal,
      };

      setMessages(prev => [...prev, reply]);
    } catch (err) {
      console.error(
        "[OrchestratorChat] Error communicating with Orchestrator API:",
        err
      );
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "system",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        text: "An error occurred while connecting to the Orchestrator API. Swarm telemetry remains active in local mode.",
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDeployProposal = async (proposal: ProposedWorkflow) => {
    try {
      const deployRes = await deployWorkflow(proposal);
      const deployMsg: ChatMessage = {
        id: `msg-deploy-${Date.now()}`,
        sender: "system",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        text: `🚀 ${deployRes.message || `Workflow "${proposal.name}" successfully deployed to active runtime.`}`,
      };
      setMessages(prev => [...prev, deployMsg]);
    } catch (err) {
      console.error("[OrchestratorChat] Deploy error:", err);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setInputValue(text);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-navy-800/80 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-poppins text-2xl font-bold text-white tracking-wide">
              Orchestrator Command Chat
            </h1>
            <span className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Express API &bull; Active Swarm
            </span>
          </div>
          <p className="font-inter text-xs text-slate-400 mt-1">
            Natural language orchestration controller powering autonomous
            multi-agent pipelines.
          </p>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-5">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "system" && (
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 shadow-cyan-glow">
                ⚡
              </div>
            )}

            <div
              className={`max-w-2xl flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[11px] font-medium text-slate-400 font-inter">
                  {msg.sender === "user" ? "Operator" : "Orchestrator AI"}
                </span>
                <span className="text-[10px] text-slate-600 font-mono">
                  {msg.timestamp}
                </span>
              </div>

              {msg.text && (
                <div
                  className={`p-4 rounded-2xl text-sm font-inter leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-cyan-500 text-navy-950 font-medium rounded-tr-sm shadow-md"
                      : "bg-navy-900/90 text-slate-200 border border-navy-800 rounded-tl-sm shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
              )}

              {/* Render Workflow Proposal Card if returned by Orchestrator */}
              {msg.proposal && (
                <WorkflowProposalCard
                  proposal={msg.proposal}
                  onApprove={() => handleDeployProposal(msg.proposal!)}
                  onModify={id => setInputValue(`Modify blueprint ${id} to `)}
                />
              )}
            </div>

            {msg.sender === "user" && (
              <div className="w-8 h-8 rounded-xl bg-navy-800 border border-navy-700 text-slate-300 flex items-center justify-center font-mono text-xs font-semibold shrink-0 mt-0.5">
                UR
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono text-xs font-bold shrink-0 animate-pulse">
              ⚡
            </div>
            <div className="bg-navy-900/90 border border-navy-800 rounded-2xl rounded-tl-sm p-4 text-xs text-slate-400 font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              Synthesizing multi-agent DAG pipeline from Node.js runtime...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="pt-3 pb-2 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] text-slate-500 font-mono uppercase whitespace-nowrap">
          Suggested:
        </span>
        {[
          "Scrape website domains & enrich email leads",
          "Reconcile daily Stripe billing with M365",
          "Autonomous GitHub CI/CD QA review chain",
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSuggestionClick(chip)}
            className="text-xs font-inter px-3 py-1 rounded-full bg-navy-900/60 hover:bg-navy-800 border border-navy-800 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all whitespace-nowrap"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} className="relative mt-2">
        <div className="flex items-center gap-2 bg-navy-900/80 border border-navy-700 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/50 rounded-2xl p-2 transition-all">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Describe the workflow you want to construct or optimize..."
            disabled={isTyping}
            className="flex-1 bg-transparent border-none text-sm text-white placeholder-slate-500 font-inter px-3 py-2 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:bg-navy-800 text-navy-950 disabled:text-slate-600 font-poppins font-semibold text-xs transition-all shadow-cyan-glow disabled:shadow-none flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Synthesize</span>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};
