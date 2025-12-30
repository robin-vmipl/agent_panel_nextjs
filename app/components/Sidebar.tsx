"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "../lib/auth";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const menuItems = [{ name: "Dashboard", href: "/dashboard" }];

export default function Sidebar() {
  const pathname = usePathname();
  const [isInCall, setIsInCall] = useState(false);

  useEffect(() => {
    const checkCallStatus = () => {
      const callDiv = document.querySelector("#callpick-detail") as HTMLElement;
      const hangupDiv = document.querySelector("#hangup_div") as HTMLElement;
      const isCallDetailVisible = callDiv && !callDiv.hasAttribute("hidden");
      const isHangupVisible =
        hangupDiv && !hangupDiv.classList.contains("d-none");
      setIsInCall(isCallDetailVisible || isHangupVisible);
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

  const logoutStyle = isInCall
    ? "bg-slate-700/60 opacity-70"
    : "bg-[#11120D] hover:bg-[#6B6A5A]";

  return (
    <aside className="w-64 h-screen bg-[#0a1d2c] text-white flex flex-col">
      {/* Logo */}
      <div className="p-2 font-extrabold text-center border-b border-white/10">
        <img src="/logo.png" alt="Logo" className="mx-auto h-12 w-auto" />
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-3 my-1 rounded-md text-center transition-all pointer-events-auto cursor-pointer hover:scale-[1.02] ${
              pathname === item.href ? "bg-[#1A1B16]" : "hover:bg-[#6B6A5A]/70"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* 🔥 LOGOUT WITH DANCING ICON */}
      <button
        onClick={handleLogout}
        disabled={isInCall}
        className={`mt-auto m-4 py-2 rounded-md transition-all font-medium flex items-center justify-center gap-2 pointer-events-auto hover:scale-105 ${logoutStyle} ${
          isInCall ? "cursor-not-allowed" : "cursor-pointer"
        }`}
        title={isInCall ? "📞 End call before logout" : "Logout"}
      >
        <span>Logout</span>
      </button>
    </aside>
  );
}
