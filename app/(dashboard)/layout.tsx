import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import CallWidget from "../components/ui/CallWidget";
import SipMount from "../components/ui/SipMount"; // demo-1.js

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0b151d] text-white">
      {/* 🔥 FIXED SIDEBAR */}
      <Sidebar />

      {/* 🔥 MAIN CONTENT */}
      <div className="flex-1 min-h-screen overflow-y-auto">
        <Navbar />
        <main className="flex-1 p-8 relative">
          {children}

          {/* 🔥 DASHBOARD SIP */}
          <SipMount />

          {/* 🔥 SINGLE WEBPHONE UI */}
          <CallWidget />
        </main>
      </div>
    </div>
  );
}
