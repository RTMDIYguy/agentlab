import React, { type ReactNode } from "react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";

interface PageLayoutProps {
  children: ReactNode;
  sidebarContent?: ReactNode;
  currentView?: string;
  onNavigate?: (view: string) => void;
  onOpenNotifications?: () => void;
  onDeployClick?: () => void;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  sidebarContent,
  currentView,
  onNavigate,
  onOpenNotifications,
  onDeployClick,
}) => (
  <div className="min-h-screen flex flex-col bg-navy-950 text-slate-200 font-inter antialiased selection:bg-cyan-500 selection:text-navy-900">
    <Navigation
      currentView={currentView}
      onNavigate={onNavigate}
      onOpenNotifications={onOpenNotifications}
      onDeployClick={onDeployClick}
    />
    <main className="flex-grow container mx-auto px-6 py-16 md:px-12 lg:px-24">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20">
        {sidebarContent && (
          <aside className="md:col-span-4 lg:col-span-3 flex flex-col space-y-8">
            {sidebarContent}
          </aside>
        )}
        <section
          className={`flex flex-col space-y-12 ${sidebarContent ? "md:col-span-8 lg:col-span-9" : "col-span-12"}`}
        >
          {children}
        </section>
      </div>
    </main>
    <Footer />
  </div>
);
