import React, { useState } from 'react';
import { AuthLayout } from './AuthLayout';
import { LoginForm } from './LoginForm';
import { PageLayout } from './PageLayout';
import { Dashboard } from './Dashboard';
import { Agents } from './Agents';
import { DeployNodeModal } from './DeployNodeModal';
import { Workflows } from './Workflows';
import { AuditLogs } from './AuditLogs';
import { OrchestratorChat } from './OrchestratorChat';
import { Settings } from './Settings';
import { NotificationsPanel } from './NotificationsPanel';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <AuthLayout title="Welcome to AgentLab" subtitle="Authenticate to access your operational workspace.">
        <LoginForm onSuccess={() => setIsAuthenticated(true)} />
      </AuthLayout>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'orchestrator': return <OrchestratorChat />;
      case 'agents': return <Agents />;
      case 'workflows': return <Workflows />;
      case 'audit': return <AuditLogs />;
      case 'settings': return <Settings />;
      default: return <div className="p-8 text-slate-400">View: {currentView} (Placeholder)</div>;
    }
  };

  return (
    <>
      <PageLayout 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onDeployClick={() => setIsDeployModalOpen(true)}
      >
        {renderView()}
      </PageLayout>
      <DeployNodeModal isOpen={isDeployModalOpen} onClose={() => setIsDeployModalOpen(false)} />
      <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </>
  );
};