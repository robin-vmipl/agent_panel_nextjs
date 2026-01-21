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
    <div className="flex h-screen w-full flex-col lg:flex-row">
      {/*SIDEBAR */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/*MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* NAVBAR - Sticky inside scrollable area */}
        <Navbar
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* CONTENT - Scrollable area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 relative bg-linear-to-br from-background/70 to-background/70">
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
