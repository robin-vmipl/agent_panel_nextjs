"use client";

import { usePathname } from "next/navigation";
import StatusDropdown from "./StatusDropdown";
import MyIngroupsButton from "./MyIngroupsButton";
import { useEffect, useState } from "react";
import ChangePasswordModal from "./ChangePasswordModal";
import { ChevronDown, User } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [agentName, setAgentName] = useState<string>("");
  const [profilePic, setProfilePic] = useState<string>("");
  const [openPasswordModal, setOpenPasswordModal] = useState(false);

  const pageTitleMap: Record<string, string> = {
    "/dashboard": "Dashboard",
  };

  const dynamicTitle =
    pageTitleMap[pathname] ||
    pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") ||
    "Dashboard";

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setAgentName(parsed.full_name || parsed.user);
      setProfilePic(parsed.profilePic || "");
    }
  }, []);

  return (
    <>
      {/* 🔥 GLASSMORPHISM NAVBAR */}
      <header className="h-20 bg-linear-to-b from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-3xl text-white flex items-center justify-between px-6 border-b border-slate-700/50 shadow-2xl shadow-emerald-500/10 sticky top-0 z-50">
        {/* 🔥 GLOWING TITLE */}
        <div className="flex items-center">
          <h1 className="text-xl font-black bg-linear-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-xl tracking-tight">
            {dynamicTitle}
          </h1>
        </div>

        {/* 🔥 CONTROLS + PROFILE */}
        <div className="flex items-center gap-4">
          <StatusDropdown />
          <MyIngroupsButton />

          {/* 🔥 BEAUTIFUL PROFILE BUTTON */}
          <button
            onClick={() => setOpenPasswordModal(true)}
            className="group relative overflow-hidden bg-linear-to-r from-slate-800/70 to-slate-900/70 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-slate-600/50 shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 hover:bg-linear-to-r hover:border-emerald-400/40 transition-all duration-400 flex items-center gap-3 text-sm font-semibold"
          >
            {/* ✨ Shine effect */}
            <div className="absolute inset-0 bg-linear-to-r from-white/20 via-white/40 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 -skew-x-12" />

            {profilePic ? (
              <img
                src={profilePic}
                alt="Profile"
                className="w-9 h-9 rounded-2xl object-cover border-2 border-emerald-400/50 shadow-lg ring-2 ring-emerald-500/20 group-hover:scale-110 group-hover:ring-emerald-400/40 transition-all duration-300"
              />
            ) : (
              <div className="w-9 h-9 bg-linear-to-br from-slate-700/80 to-slate-600/80 rounded-2xl flex items-center justify-center text-white font-black text-sm uppercase shadow-lg border-2 border-white/20 group-hover:bg-emerald-500/20 group-hover:border-emerald-400/40 transition-all duration-300 backdrop-blur-sm">
                {agentName[0]}
              </div>
            )}

            <span className="relative z-10 truncate max-w-32">{agentName}</span>
            <ChevronDown className="w-4 h-4 relative z-10 transition-transform duration-200 group-hover:rotate-180" />
          </button>
        </div>
      </header>

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={openPasswordModal}
        onClose={() => setOpenPasswordModal(false)}
      />
    </>
  );
}
