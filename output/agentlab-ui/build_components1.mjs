import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');

const files = {
  'Button.tsx': `
import React, { ButtonHTMLAttributes } from 'react';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary'; }
export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "inline-flex items-center justify-center px-5 py-2.5 font-inter text-sm font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-950 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";
  const variants = {
    primary: "bg-cyan-500 text-navy-950 border border-transparent hover:bg-cyan-400 hover:shadow-cyan-glow focus:ring-cyan-500",
    secondary: "bg-navy-800 text-white border border-navy-700 hover:border-cyan-400 hover:bg-navy-700 hover:shadow-cyan-glow focus:ring-cyan-500"
  };
  return <button className={\`\${baseStyles} \${variants[variant]} \${className}\`} {...props}>{children}</button>;
};
  `,
  'TopNavBadge.tsx': `
import React from 'react';
interface TopNavBadgeProps { unreadCount: number; hasCritical: boolean; onClick: () => void; }
export const TopNavBadge: React.FC<TopNavBadgeProps> = ({ unreadCount, hasCritical, onClick }) => (
  <button onClick={onClick} className="relative p-2 text-slate-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-navy-900 rounded-lg group">
    <svg className="w-5 h-5 transition-all duration-300 group-hover:drop-shadow-cyan-glow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
    {unreadCount > 0 && <span className={\`absolute top-0.5 right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold font-mono text-navy-950 border border-navy-900 transform translate-x-1/3 -translate-y-1/3 shadow-sm \${hasCritical ? 'bg-rose-500 shadow-rose-500/50' : 'bg-cyan-500 shadow-cyan-glow'}\`}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
  </button>
);
  `,
  'Navigation.tsx': `
import React from 'react';
import { TopNavBadge } from './TopNavBadge';
interface NavigationProps { currentView?: string; onNavigate?: (view: string) => void; onOpenNotifications?: () => void; }
const NAV_LINKS = [{ label: 'Dashboard', view: 'dashboard' }, { label: 'Agents', view: 'agents' }, { label: 'Workflows', view: 'workflows' }, { label: 'Settings', view: 'settings' }];
export const Navigation: React.FC<NavigationProps> = ({ currentView = 'dashboard', onNavigate = ()=>{}, onOpenNotifications = ()=>{} }) => (
  <nav className="sticky top-0 z-40 w-full bg-navy-900 border-b border-navy-800 backdrop-blur-md bg-opacity-90">
    <div className="container mx-auto px-6 md:px-12 lg:px-24 h-20 flex items-center justify-between">
      <div className="flex items-center gap-4 cursor-pointer group" onClick={() => onNavigate('dashboard')} role="button" tabIndex={0}>
        <div className="w-8 h-8 rounded-md bg-cyan-500 shadow-cyan-glow transition-all duration-300 group-hover:shadow-cyan-glow-lg"></div>
        <span className="font-poppins font-semibold text-xl text-white tracking-wide">AgentLab</span>
      </div>
      <div className="hidden md:flex items-center space-x-10">
        {NAV_LINKS.map(link => (
          <button key={link.view} onClick={() => onNavigate(link.view)} className={\`font-inter text-sm font-medium transition-all duration-300 ease-in-out focus:outline-none \${currentView === link.view ? 'text-cyan-400 drop-shadow-cyan-glow' : 'text-slate-400 hover:text-cyan-400 hover:drop-shadow-cyan-glow'}\`}>{link.label}</button>
        ))}
      </div>
      <div className="flex items-center gap-6">
        <TopNavBadge unreadCount={3} hasCritical={true} onClick={onOpenNotifications} />
        <button className="hidden sm:block font-inter text-sm font-medium text-white bg-navy-800 hover:bg-navy-700 px-5 py-2.5 rounded-lg transition-all duration-300 border border-navy-700 hover:border-cyan-400 hover:shadow-cyan-glow focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-navy-900">Deploy Node</button>
      </div>
    </div>
  </nav>
);
  `
};

Object.entries(files).forEach(([file, content]) => fs.writeFileSync(path.join(SRC_DIR, file), content.trim()));
