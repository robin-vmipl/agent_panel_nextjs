"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "../lib/auth";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Activity, Phone, LogOut, Menu, X } from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: Activity },
  { name: "Click to Call", href: "/ctc", icon: Phone },
];

export default function Sidebar({
  isMobileOpen,
  onClose,
}: {
  isMobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [isInCall, setIsInCall] = useState(false);
  const [agentStatus, setAgentStatus] = useState("INACTIVE");

  //  AGENT STATUS + CALL STATUS
  useEffect(() => {
    const checkStatus = () => {
      // Agent status from localStorage (updated by StatusDropdown)
      const status = localStorage.getItem("agentStatus") || "INACTIVE";
      setAgentStatus(status);

      // Call status
      const sipData = (window as any).SIP_CALL_DATA;
      setIsInCall(
        sipData?.callState === "ringing" || sipData?.callState === "answered",
      );
    };

    checkStatus(); // Initial check
    const interval = setInterval(checkStatus, 1000); // 1s sync
    return () => clearInterval(interval);
  }, []);

  const handleMenuClick = (href: string) => {
    if (isInCall) {
      toast.error("📞 End call before switching pages!", {
        id: "sidebar-call-block",
      });
      return false;
    }

    //  CTC BLOCK - STATUS NOT ACTIVE
    if (href === "/ctc" && agentStatus !== "ACTIVE") {
      toast.error("Activate status from Dashboard first!", {
        id: "sidebar-ctc-block",
      });
      return false;
    }

    onClose();
    return true;
  };

  const handleLogout = () => {
    if (isInCall) {
      toast.error("End call before logout!", { id: "sidebar-logout-block" });
      return;
    }

    if (pathname === "/ctc") {
      toast.error("Cannot logout while on CTC page!", {
        id: "sidebar-logout-ctc-block",
      });
      return;
    }

    logoutUser();
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-45"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          w-64 h-screen lg:h-screen theme-surface
          border-r border-slate-700/50 shadow-2xl flex flex-col
          fixed inset-y-0 left-0 z-50
          lg:static lg:z-auto lg:translate-x-0 lg:mt-0
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          transition-transform duration-300 ease-in-out
        `}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-700/50 shrink-0 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-12 w-auto mx-auto lg:mx-0"
          />
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-700/50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            //  DISABLE CTC WHEN NOT ACTIVE + CALL
            const isCtcItem = item.href === "/ctc";
            const isDisabled =
              isInCall || (isCtcItem && agentStatus !== "ACTIVE");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  if (isDisabled && !handleMenuClick(item.href)) {
                    e.preventDefault();
                  }
                }}
                className={`group flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 w-full ${
                  isActive
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold"
                    : isDisabled
                      ? "opacity-60 cursor-not-allowed text-slate-400 bg-slate-800/50 border border-slate-600/30"
                      : "text-slate-300 hover:bg-slate-700/50 hover:text-white hover:border-slate-500/50 border border-transparent"
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive
                      ? "text-emerald-400"
                      : isDisabled
                        ? "text-slate-400"
                        : "group-hover:text-emerald-400 text-slate-300"
                  }`}
                />
                <span className="truncate flex-1">
                  {item.name}
                  {isCtcItem && agentStatus !== "ACTIVE" && (
                    <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full font-mono">
                      OFF
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-6 border-t border-slate-700/50 shrink-0">
          <button
            onClick={handleLogout}
            disabled={isInCall || pathname === "/ctc"}
            className={`logout-btn w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
              isInCall || pathname === "/ctc"
                ? "bg-slate-700/60 opacity-70 cursor-not-allowed text-slate-400"
                : "bg-slate-800 hover:bg-slate-700 border border-slate-600/50 hover:shadow-slate-500/20 text-white cursor-pointer"
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
