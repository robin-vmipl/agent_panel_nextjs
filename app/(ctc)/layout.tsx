"use client";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import CallWidget from "../components/ui/CallWidget";
import SipMountCTC from "../components/ui/SipMountCTC";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { useOffline } from "../utils/useOffline";

export default function CTCLayout({ children }: { children: React.ReactNode }) {
  useOffline();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-linear-to-br from-background/70 to-background/70 text-foreground flex">
      {/* <div className="flex min-h-screen bg-linear-to-br from-slate-800/70 to-slate-900/70 text-foreground"> */}

      {/*FIXED SIDEBAR */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/*MAIN CONTENT */}
      <div className="flex-1 min-h-screen overflow-y-auto">
        <Navbar
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        <main className="flex-1 p-8 relative">
          {children}

          {/*CTC SIP */}
          <ErrorBoundary
            fallback={<div className="text-yellow-400">SIP offline</div>}
          >
            <SipMountCTC />
          </ErrorBoundary>

          {/*SINGLE WEBPHONE UI */}
          <ErrorBoundary fallback={null}>
            <CallWidget />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
