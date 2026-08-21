import React, { useState, useEffect } from 'react';
import { AuthLayout } from './AuthLayout';
import { LoginForm } from './LoginForm';
import { PageLayout } from './PageLayout';
import { Dashboard } from './Dashboard';

export const AppContext = React.createContext({ currentView: 'dashboard', onNavigate: (view: string) => {}, onOpenNotifications: () => {} });

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  if (!isAuthenticated) {
    return <AuthLayout title="Welcome to AgentLab" subtitle="Authenticate to access your operational workspace."><LoginForm onSuccess={() => setIsAuthenticated(true)} /></AuthLayout>;
  }

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <Dashboard />;
      default: return <div className="p-8 text-slate-400">View: {currentView} (Placeholder)</div>;
    }
  };

  return (
    <AppContext.Provider value={{ currentView, onNavigate: setCurrentView, onOpenNotifications: () => setIsNotificationsOpen(true) }}>
      <PageLayout currentView={currentView} onNavigate={setCurrentView} onOpenNotifications={() => setIsNotificationsOpen(true)}>
        {renderView()}
      </PageLayout>
    </AppContext.Provider>
  );
};