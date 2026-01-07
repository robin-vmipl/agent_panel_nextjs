"use client";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import CallWidget from "../components/ui/CallWidget";
import SipMount from "../components/ui/SipMount";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b151d] text-white flex">
      {/* 🔥 SIDEBAR */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* 🔥 MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative">
          {children}
          <SipMount />
          <CallWidget />
        </main>
      </div>
    </div>
  );
}
