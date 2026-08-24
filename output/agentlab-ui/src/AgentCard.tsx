import React from "react";

export interface AgentCardProps {
  id: string;
  name: string;
  role: string;
  status: "active" | "idle" | "error";
  tasksCompleted: number;
  uptime: string;
  onClick?: () => void;
  onAction?: (action: "pause" | "restart" | "terminate", id: string) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  id,
  name,
  role,
  status,
  tasksCompleted,
  uptime,
  onClick,
  onAction,
}) => {
  const statusColors = {
    active: "bg-cyan-500 shadow-cyan-glow",
    idle: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]",
    error: "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]",
  };

  const pulsing =
    status === "active"
      ? "animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"
      : "";

  const handleActionClick = (
    e: React.MouseEvent,
    action: "pause" | "restart" | "terminate"
  ) => {
    e.stopPropagation();
    if (onAction) onAction(action, id);
  };

  return (
    <div
      onClick={onClick}
      className="flex flex-col p-6 bg-navy-900 border border-navy-800 rounded-xl hover:shadow-cyan-glow hover:border-cyan-500/30 transition-all duration-300 group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-poppins text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
            {name}
          </h3>
          <p className="font-inter text-xs text-slate-400 mt-1">{role}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-inter text-xs font-medium text-slate-500 uppercase tracking-wider">
            {status}
          </span>
          <span className="relative flex h-3 w-3">
            {pulsing && <span className={pulsing}></span>}
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${statusColors[status]}`}
            ></span>
          </span>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-4 pt-5 pb-4 border-t border-navy-800/50">
        <div>
          <p className="font-inter text-[10px] text-slate-500 uppercase tracking-wider mb-1">
            Tasks
          </p>
          <p className="font-poppins text-sm font-medium text-slate-200">
            {tasksCompleted.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="font-inter text-[10px] text-slate-500 uppercase tracking-wider mb-1">
            Uptime
          </p>
          <p className="font-poppins text-sm font-medium text-slate-200">
            {uptime}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-navy-800/50 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {status === "active" ? (
          <button
            onClick={e => handleActionClick(e, "pause")}
            className="px-3 py-1 text-xs font-medium text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 rounded-md transition-colors"
          >
            Pause
          </button>
        ) : (
          <button
            onClick={e => handleActionClick(e, "restart")}
            className="px-3 py-1 text-xs font-medium text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 rounded-md transition-colors"
          >
            Restart
          </button>
        )}
        <button
          onClick={e => handleActionClick(e, "terminate")}
          className="px-3 py-1 text-xs font-medium text-rose-400 bg-rose-400/10 hover:bg-rose-400/20 rounded-md transition-colors"
        >
          Terminate
        </button>
      </div>
    </div>
  );
};
