import React from "react";
import { Button } from "./Button";

interface DeployNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployNodeModal: React.FC<DeployNodeModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-navy-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-navy-900 border border-navy-800 rounded-2xl shadow-2xl overflow-hidden border-t-4 border-t-cyan-500 transform transition-all animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-navy-800/50">
          <div>
            <h2 className="font-poppins text-xl font-semibold text-white tracking-wide">
              Deploy New Node
            </h2>
            <p className="font-inter text-sm text-slate-400 mt-1">
              Configure and instantiate a new autonomous agent.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors focus:outline-none"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="font-inter text-xs font-semibold text-slate-300 uppercase">
              Agent Name
            </label>
            <input
              type="text"
              placeholder="e.g. Omega-Node-07"
              className="w-full bg-navy-950 border border-navy-700 rounded-md text-white px-4 py-3 font-inter text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 placeholder-slate-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-inter text-xs font-semibold text-slate-300 uppercase">
                Role / Specialty
              </label>
              <select className="w-full bg-navy-950 border border-navy-700 rounded-md text-white px-4 py-3 font-inter text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 appearance-none">
                <option>Data Synthesizer</option>
                <option>Code Reviewer</option>
                <option>Outreach Specialist</option>
                <option>Security Auditor</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-inter text-xs font-semibold text-slate-300 uppercase">
                Base Model
              </label>
              <select className="w-full bg-navy-950 border border-navy-700 rounded-md text-white px-4 py-3 font-inter text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 appearance-none">
                <option>Claude 3.5 Sonnet</option>
                <option>GPT-4o</option>
                <option>Llama 3 (70B)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-inter text-xs font-semibold text-slate-300 uppercase">
              System Prompt
            </label>
            <textarea
              rows={4}
              placeholder="Define the agent's core instructions and constraints..."
              className="w-full bg-navy-950 border border-navy-700 rounded-md text-white px-4 py-3 font-inter text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 placeholder-slate-600 resize-none"
            ></textarea>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-navy-950/50 p-6 border-t border-navy-800/50 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onClose} className="gap-2">
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Deploy Agent
          </Button>
        </div>
      </div>
    </div>
  );
};
