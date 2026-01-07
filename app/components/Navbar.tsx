"use client";
import { usePathname } from "next/navigation";
import StatusDropdown from "./StatusDropdown";
import MyIngroupsButton from "./MyIngroupsButton";
import { useEffect, useState } from "react";
import ChangePasswordModal from "./ChangePasswordModal";
import { ChevronDown, Menu } from "lucide-react";
import NavbarCrmButton from "./NavbarCrmButton";

export default function Navbar({
  onToggleMobileMenu,
}: {
  onToggleMobileMenu: () => void;
}) {
  const pathname = usePathname();
  const [agentName, setAgentName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [openPasswordModal, setOpenPasswordModal] = useState(false);

  const pageTitleMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/ctc": "Outbound Calls",
  };

  const dynamicTitle = pageTitleMap[pathname] || "Dashboard";

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setAgentName(parsed.full_name || parsed.user || "");
      setProfilePic(parsed.profilePic || "");
    }
  }, []);

  return (
    <>
      <header className="h-20 bg-linear-to-b from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-3xl text-white flex items-center justify-between px-6 border-b border-slate-700/50 shadow-2xl sticky top-0 z-60">
        {/* Left: Hamburger + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-3 bg-slate-800/50 hover:bg-slate-700/70 rounded-xl transition-all duration-200 shadow-lg z-70 shrink-0"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black bg-linear-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
            {dynamicTitle}
          </h1>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          <NavbarCrmButton />
          <StatusDropdown />
          <MyIngroupsButton />

          <button
            onClick={() => setOpenPasswordModal(true)}
            className="group bg-linear-to-r from-slate-800/70 to-slate-900/70 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-slate-600/50 shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 text-sm font-semibold"
          >
            {profilePic ? (
              <img
                src={profilePic}
                alt="Profile"
                className="w-8 h-8 rounded-2xl object-cover border-2 border-emerald-400/40"
              />
            ) : (
              <div className="w-8 h-8 bg-linear-to-br from-slate-700 to-slate-600 rounded-2xl flex items-center justify-center text-white font-bold text-xs">
                {agentName[0] || "?"}
              </div>
            )}
            <span className="truncate max-w-30 hidden sm:inline">
              {agentName}
            </span>
            <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180 ml-1" />
          </button>
        </div>
      </header>

      <ChangePasswordModal
        open={openPasswordModal}
        onClose={() => setOpenPasswordModal(false)}
      />
    </>
  );
}
