import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const TOKEN_DATA = [
  { time: "00:00", tokens: 1200 },
  { time: "04:00", tokens: 3000 },
  { time: "08:00", tokens: 8500 },
  { time: "12:00", tokens: 14200 },
  { time: "16:00", tokens: 11000 },
  { time: "20:00", tokens: 5400 },
  { time: "24:00", tokens: 2100 },
];

const RESOLUTION_DATA = [
  { name: "Success", value: 85, color: "#06b6d4" },
  { name: "Requires Human", value: 10, color: "#f59e0b" },
  { name: "Failed", value: 5, color: "#f43f5e" },
];

const RECENT_ALERTS = [
  {
    id: 1,
    time: "10 mins ago",
    level: "info",
    message:
      'Workflow "Lead Enrichment" completed successfully (142 leads processed).',
  },
  {
    id: 2,
    time: "1 hour ago",
    level: "warning",
    message: 'Agent "Beta-Node-02" approaching daily token limit (85%).',
  },
  {
    id: 3,
    time: "2 hours ago",
    level: "error",
    message: "API rate limit exceeded on HubSpot connector.",
  },
  {
    id: 4,
    time: "5 hours ago",
    level: "info",
    message: 'New workflow "Q3 Outreach" generated and approved by user.',
  },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="font-poppins text-3xl font-semibold text-white tracking-tight mb-2">
          Command Center
        </h1>
        <p className="font-inter text-sm text-slate-400">
          System-wide monitoring, resource utilization, and governance overview.
        </p>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-navy-900/40 backdrop-blur-md border border-navy-800 rounded-xl p-6 hover:border-cyan-500/30 transition-colors">
          <h3 className="font-inter text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            Active Agents
          </h3>
          <div className="flex items-end gap-3">
            <span className="font-poppins text-3xl font-semibold text-white">
              12
            </span>
            <span className="font-inter text-sm text-cyan-400 mb-1">/ 15</span>
          </div>
        </div>
        <div className="bg-navy-900/40 backdrop-blur-md border border-navy-800 rounded-xl p-6 hover:border-cyan-500/30 transition-colors">
          <h3 className="font-inter text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            Tasks (24h)
          </h3>
          <div className="flex items-end gap-3">
            <span className="font-poppins text-3xl font-semibold text-white">
              4,291
            </span>
            <span className="font-inter text-sm text-cyan-400 mb-1">+12%</span>
          </div>
        </div>
        <div className="bg-navy-900/40 backdrop-blur-md border border-navy-800 rounded-xl p-6 hover:border-cyan-500/30 transition-colors">
          <h3 className="font-inter text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            Token Usage (24h)
          </h3>
          <div className="flex items-end gap-3">
            <span className="font-poppins text-3xl font-semibold text-white">
              1.2M
            </span>
          </div>
        </div>
        <div className="bg-navy-900/40 backdrop-blur-md border border-navy-800 rounded-xl p-6 hover:border-cyan-500/30 transition-colors">
          <h3 className="font-inter text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            Est. Cost (MTD)
          </h3>
          <div className="flex items-end gap-3">
            <span className="font-poppins text-3xl font-semibold text-white">
              $42.80
            </span>
            <span className="font-inter text-sm text-amber-400 mb-1">
              On track
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-navy-900/40 backdrop-blur-md border border-navy-800 rounded-xl p-6">
          <h3 className="font-poppins text-lg font-medium text-slate-200 mb-6">
            System Activity (Tokens)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TOKEN_DATA}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={value => `${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    color: "#f8fafc",
                  }}
                  itemStyle={{ color: "#06b6d4" }}
                />
                <Area
                  type="monotone"
                  dataKey="tokens"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTokens)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-navy-900/40 backdrop-blur-md border border-navy-800 rounded-xl p-6 flex flex-col">
          <h3 className="font-poppins text-lg font-medium text-slate-200 mb-2">
            Resolution Status
          </h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={RESOLUTION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {RESOLUTION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    color: "#f8fafc",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            {RESOLUTION_DATA.map(entry => (
              <div
                key={entry.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-slate-400 font-inter">
                    {entry.name}
                  </span>
                </div>
                <span className="text-slate-200 font-mono">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Audit Log */}
      <div className="bg-navy-900/40 backdrop-blur-md border border-navy-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-poppins text-lg font-medium text-slate-200">
            Live Audit Feed
          </h3>
          <button className="text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors">
            View All Logs
          </button>
        </div>
        <div className="space-y-4">
          {RECENT_ALERTS.map(alert => (
            <div
              key={alert.id}
              className="flex items-start gap-4 p-4 rounded-lg bg-navy-950/50 border border-navy-800/50 hover:border-navy-700 transition-colors"
            >
              <div
                className={`mt-1 w-2 h-2 rounded-full shadow-lg ${
                  alert.level === "error"
                    ? "bg-rose-500 shadow-rose-500/50"
                    : alert.level === "warning"
                      ? "bg-amber-500 shadow-amber-500/50"
                      : "bg-cyan-500 shadow-cyan-glow"
                }`}
              ></div>
              <div className="flex-1">
                <p className="font-inter text-sm text-slate-300">
                  {alert.message}
                </p>
                <p className="font-mono text-xs text-slate-500 mt-1.5">
                  {alert.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
