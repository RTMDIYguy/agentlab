import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');

const files = {
  'Footer.tsx': `
import React from 'react';
const FOOTER_SECTIONS = { Platform: [{ label: 'System Overview', href: '#' }], Resources: [{ label: 'Documentation', href: '#' }], Company: [{ label: 'About SOE', href: '#' }] };
export const Footer: React.FC = () => (
  <footer className="w-full bg-navy-950 border-t border-navy-800 pt-20 pb-10 mt-auto">
    <div className="container mx-auto px-6 md:px-12 lg:px-24">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
        <div className="col-span-1 md:col-span-5 lg:col-span-4 flex flex-col space-y-6">
          <span className="font-poppins font-semibold text-xl text-white tracking-wide">AgentLab</span>
          <p className="font-inter text-sm text-slate-400 leading-relaxed max-w-sm">Startup Operational Excellence built into every interaction.</p>
        </div>
        <div className="col-span-1 md:col-span-7 lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-10">
          {Object.entries(FOOTER_SECTIONS).map(([category, links]) => (
            <div key={category} className="flex flex-col space-y-6"><h4 className="font-poppins font-medium text-sm text-white tracking-widest uppercase">{category}</h4>
              <ul className="flex flex-col space-y-4">{links.map(link => (<li key={link.label}><a href={link.href} className="font-inter text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-200">{link.label}</a></li>))}</ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  </footer>
);
  `,
  'PageLayout.tsx': `
import React, { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
interface PageLayoutProps { children: ReactNode; sidebarContent?: ReactNode; currentView?: string; onNavigate?: (view: string) => void; onOpenNotifications?: () => void; }
export const PageLayout: React.FC<PageLayoutProps> = ({ children, sidebarContent, currentView, onNavigate, onOpenNotifications }) => (
  <div className="min-h-screen flex flex-col bg-navy-950 text-slate-200 font-inter antialiased selection:bg-cyan-500 selection:text-navy-900">
    <Navigation currentView={currentView} onNavigate={onNavigate} onOpenNotifications={onOpenNotifications} />
    <main className="flex-grow container mx-auto px-6 py-16 md:px-12 lg:px-24">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20">
        {sidebarContent && <aside className="md:col-span-4 lg:col-span-3 flex flex-col space-y-8">{sidebarContent}</aside>}
        <section className={\`flex flex-col space-y-12 \${sidebarContent ? 'md:col-span-8 lg:col-span-9' : 'col-span-12'}\`}>{children}</section>
      </div>
    </main>
    <Footer />
  </div>
);
  `
};

Object.entries(files).forEach(([file, content]) => fs.writeFileSync(path.join(SRC_DIR, file), content.trim()));
