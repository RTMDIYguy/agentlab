import React, { useState } from "react";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  source: string;
  severity: "error" | "warning" | "info" | "success";
  isRead: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "PostgreSQL Timeout in Ledger Reconciler",
    description:
      "Auditor-Bot-9 encountered a read timeout connecting to read-only database host.",
    timestamp: "12m ago",
    source: "Ledger Reconciliation",
    severity: "error",
    isRead: false,
  },
  {
    id: "notif-2",
    title: "Scraper Approaching Rate Limit",
    description:
      "SDR-Scraper-02 received a 429 backoff warning from origin domain. Swarm throttled.",
    timestamp: "25m ago",
    source: "Founder Outreach Matrix",
    severity: "warning",
    isRead: false,
  },
  {
    id: "notif-3",
    title: "New Autonomic Workflow Blueprint Ready",
    description:
      "System Orchestrator synthesized DAG proposal WFP-2026-08 for lead enrichment.",
    timestamp: "42m ago",
    source: "Orchestrator Engine",
    severity: "info",
    isRead: false,
  },
  {
    id: "notif-4",
    title: "Lead Enrichment Batch Completed",
    description:
      "Alpha-Node-01 successfully enriched and verified 48 executive contacts.",
    timestamp: "2h ago",
    source: "Inbound Lead Enrichment",
    severity: "success",
    isRead: true,
  },
  {
    id: "notif-5",
    title: "Daily M365 Budget Audit Passed",
    description:
      "Total daily token spend is $14.28, remaining well below the $50.00 ceiling.",
    timestamp: "4h ago",
    source: "Governance Control",
    severity: "success",
    isRead: true,
  },
];

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS
  );
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredList = filterUnreadOnly
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const severityConfig = {
    error: {
      bg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
      dot: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]",
      icon: (
        <svg
          className="w-4 h-4 text-rose-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    warning: {
      bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
      icon: (
        <svg
          className="w-4 h-4 text-amber-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    info: {
      bg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
      dot: "bg-cyan-400 shadow-cyan-glow",
      icon: (
        <svg
          className="w-4 h-4 text-cyan-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    success: {
      bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
      icon: (
        <svg
          className="w-4 h-4 text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-navy-900 border-l border-navy-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-navy-800/80 bg-navy-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="font-poppins text-lg font-semibold text-white tracking-wide">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors focus:outline-none"
              aria-label="Close notifications"
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

          {/* Sub-bar Controls */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-navy-800/50 text-xs font-inter">
            <button
              onClick={() => setFilterUnreadOnly(prev => !prev)}
              className={`text-xs transition-colors ${filterUnreadOnly ? "text-cyan-400 font-medium" : "text-slate-400 hover:text-slate-200"}`}
            >
              {filterUnreadOnly ? "Showing unread only" : "Filter unread only"}
            </button>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* List of Notification Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredList.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs font-inter">
              No notifications to display.
            </div>
          ) : (
            filteredList.map(notif => {
              const cfg = severityConfig[notif.severity];

              return (
                <div
                  key={notif.id}
                  onClick={() => handleToggleRead(notif.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group relative ${
                    notif.isRead
                      ? "bg-navy-950/40 border-navy-800/60 opacity-75 hover:opacity-100 hover:bg-navy-950/70"
                      : "bg-navy-950/90 border-navy-800 shadow-md hover:border-cyan-500/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg border flex-shrink-0 ${cfg.bg}`}
                    >
                      {cfg.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-xs font-semibold font-poppins truncate ${notif.isRead ? "text-slate-300" : "text-white"}`}
                        >
                          {notif.title}
                        </h4>
                        {!notif.isRead && (
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`}
                          />
                        )}
                      </div>

                      <p className="text-xs text-slate-400 font-inter mt-1 leading-relaxed">
                        {notif.description}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-navy-800/40 text-[10px] font-mono text-slate-500">
                        <span>{notif.source}</span>
                        <span>{notif.timestamp}</span>
                      </div>
                    </div>

                    <button
                      onClick={e => handleDelete(notif.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                      aria-label="Dismiss notification"
                    >
                      <svg
                        className="w-3.5 h-3.5"
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
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-navy-800/80 bg-navy-950/40 text-center text-xs text-slate-500 font-inter">
          Real-time alert delivery enabled via WebSocket
        </div>
      </div>
    </>
  );
};
