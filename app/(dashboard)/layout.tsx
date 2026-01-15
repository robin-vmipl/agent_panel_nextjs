"use client";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import CallWidget from "../components/ui/CallWidget";
import SipMount from "../components/ui/SipMount";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { useOffline } from "../utils/useOffline";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useOffline();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-linear-to-br from-background/70 to-background/70 text-foreground flex">
      {/* <div className="min-h-screen bg-linear-to-br from-slate-800/70 to-slate-900/70 text-foreground flex"> */}

      {/* SIDEBAR */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative">
          {children}
          <ErrorBoundary
            fallback={
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs">
                <span className="text-red-400">📞 SIP Error</span>
                <button
                  onClick={() => window.location.reload()}
                  className="ml-2 text-emerald-400 hover:text-emerald-300"
                >
                  Retry
                </button>
              </div>
            }
          >
            <SipMount />
          </ErrorBoundary>
          <ErrorBoundary fallback={null}>
            <CallWidget />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
