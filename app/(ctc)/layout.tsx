import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import CallWidget from "../components/ui/CallWidget";
import SipMountCTC from "../components/ui/SipMountCTC";

export default function CTCLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0b151d] text-white">
      {/* 🔥 FIXED SIDEBAR */}
      <Sidebar />

      {/* 🔥 MAIN CONTENT */}
      <div className="flex-1 min-h-screen overflow-y-auto">
        <Navbar />
        <main className="flex-1 p-8 relative">
          {children}

          {/* 🔥 CTC SIP */}
          <SipMountCTC />

          {/* 🔥 SINGLE WEBPHONE UI */}
          <CallWidget />
        </main>
      </div>
    </div>
  );
}
