import React from 'react';
import { TopNavBadge } from './TopNavBadge';

interface NavigationProps { 
  currentView?: string; 
  onNavigate?: (view: string) => void; 
  onOpenNotifications?: () => void;
  onDeployClick?: () => void;
}

const NAV_LINKS = [
  { label: 'Dashboard', view: 'dashboard' }, 
  { label: 'Orchestrator', view: 'orchestrator' },
  { label: 'Agents', view: 'agents' }, 
  { label: 'Workflows', view: 'workflows' }, 
  { label: 'Audit Logs', view: 'audit' },
  { label: 'Settings', view: 'settings' }
];

export const Navigation: React.FC<NavigationProps> = ({ 
  currentView = 'dashboard', 
  onNavigate = ()=>{}, 
  onOpenNotifications = ()=>{},
  onDeployClick = ()=>{}
}) => (
  <nav className="sticky top-0 z-40 w-full bg-navy-900 border-b border-navy-800 backdrop-blur-md bg-opacity-90">
    <div className="container mx-auto px-6 md:px-12 lg:px-24 h-20 flex items-center justify-between">
      <div className="flex items-center gap-4 cursor-pointer group" onClick={() => onNavigate('dashboard')} role="button" tabIndex={0}>
        <div className="w-8 h-8 rounded-md bg-cyan-500 shadow-cyan-glow transition-all duration-300 group-hover:shadow-cyan-glow-lg"></div>
        <span className="font-poppins font-semibold text-xl text-white tracking-wide">AgentLab</span>
      </div>
      <div className="hidden md:flex items-center space-x-10">
        {NAV_LINKS.map(link => (
          <button 
            key={link.view} 
            onClick={() => onNavigate(link.view)} 
            className={`font-inter text-sm font-medium transition-all duration-300 ease-in-out focus:outline-none ${currentView === link.view ? 'text-cyan-400 drop-shadow-cyan-glow' : 'text-slate-400 hover:text-cyan-400 hover:drop-shadow-cyan-glow'}`}
          >
            {link.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-6">
        <TopNavBadge unreadCount={3} hasCritical={true} onClick={onOpenNotifications} />
        <button 
          onClick={onDeployClick}
          className="hidden sm:block font-inter text-sm font-medium text-white bg-navy-800 hover:bg-navy-700 px-5 py-2.5 rounded-lg transition-all duration-300 border border-navy-700 hover:border-cyan-400 hover:shadow-cyan-glow focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-navy-900"
        >
          Deploy Node
        </button>
      </div>
    </div>
  </nav>
);