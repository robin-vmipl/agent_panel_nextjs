import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import CallWidget from "../components/ui/CallWidget";
import SipMount from "../components/ui/SipMount";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0b151d] text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-8 relative">
          {children}

          {/* 🔑 SIP MUST MOUNT FIRST */}
          <SipMount />

          {/* 🔑 UI CONTROLLER */}
          <CallWidget />
        </main>
      </div>
    </div>
  );
}
