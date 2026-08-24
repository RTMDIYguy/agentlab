import React from "react";
interface TopNavBadgeProps {
  unreadCount: number;
  hasCritical: boolean;
  onClick: () => void;
}
export const TopNavBadge: React.FC<TopNavBadgeProps> = ({
  unreadCount,
  hasCritical,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="relative p-2 text-slate-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-navy-900 rounded-lg group"
  >
    <svg
      className="w-5 h-5 transition-all duration-300 group-hover:drop-shadow-cyan-glow"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
    {unreadCount > 0 && (
      <span
        className={`absolute top-0.5 right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold font-mono text-navy-950 border border-navy-900 transform translate-x-1/3 -translate-y-1/3 shadow-sm ${hasCritical ? "bg-rose-500 shadow-rose-500/50" : "bg-cyan-500 shadow-cyan-glow"}`}
      >
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    )}
  </button>
);
