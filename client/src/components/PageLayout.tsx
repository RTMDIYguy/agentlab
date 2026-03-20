import { ReactNode } from "react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />
      <main className={`flex-1 ${className}`}>{children}</main>
      <Footer />
    </div>
  );
}
