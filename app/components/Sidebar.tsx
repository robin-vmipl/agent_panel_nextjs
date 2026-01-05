"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "../lib/auth";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Activity, User, Clock, Settings, LogOut } from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: Activity },
  // { name: "Click to Call", href: "/ctc", icon: Activity },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isInCall, setIsInCall] = useState(false);

  useEffect(() => {
    const checkCallStatus = () => {
      const sipData = (window as any).SIP_CALL_DATA;
      // 🔥 Use SIP states directly
      setIsInCall(
        sipData?.callState === "ringing" || sipData?.callState === "answered"
      );
    };
    const interval = setInterval(checkCallStatus, 500);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    if (isInCall) {
      toast.error("📞 End call before logout!");
      return;
    }
    logoutUser();
  };

  return (
    <>
      {/* 🔥 FIXED SIDEBAR OVERLAY - MOBILE */}
      <div className="lg:hidden fixed inset-0 bg-black/50 z-99 backdrop-blur-sm" />

      {/* 🔥 FIXED SIDEBAR */}
      <aside className="w-64 h-screen bg-linear-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl flex flex-col fixed z-100 lg:z-50 lg:relative transform -translate-x-full lg:translate-x-0 transition-transform duration-300">
        <div className="p-3 border-b border-white/10 shrink-0">
          <div className="text-center">
            <img
              src="/logo.png"
              alt="Logo"
              className="mx-auto h-12 w-auto mb-3"
            />
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive
                      ? "text-emerald-400"
                      : "group-hover:text-emerald-400"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/10 shrink-0">
          <button
            onClick={handleLogout}
            disabled={isInCall}
            className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200  ${
              isInCall
                ? "bg-slate-700/60 opacity-70 cursor-not-allowed"
                : "bg-slate-800 hover:bg-slate-700 border border-slate-600/50 hover:shadow-slate-500/20 cursor-pointer"
            }`}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
