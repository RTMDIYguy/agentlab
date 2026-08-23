import React, { type ReactNode } from 'react';
export const AuthLayout: React.FC<{children: ReactNode, title: string, subtitle: string}> = ({ children, title, subtitle }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-navy-950 relative overflow-hidden px-4 sm:px-6">
    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(theme(colors.navy.800)_1.5px,transparent_1.5px)] bg-[size:24px_24px]" />
    <div className="relative z-10 w-full max-w-md bg-navy-900/60 backdrop-blur-xl border border-navy-800 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex flex-col items-center pt-10 pb-6 px-8 border-b border-navy-800/50">
        <div className="flex items-center gap-3 mb-6"><div className="w-8 h-8 rounded-md bg-cyan-500 shadow-cyan-glow"></div><span className="font-poppins font-semibold text-xl text-white tracking-wide">AgentLab</span></div>
        <h1 className="font-poppins text-2xl font-semibold text-white tracking-tight text-center">{title}</h1>
        <p className="font-inter text-sm text-slate-400 text-center mt-2">{subtitle}</p>
      </div>
      <div className="px-8 py-8">{children}</div>
    </div>
  </div>
);