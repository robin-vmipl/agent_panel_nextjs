"use client";
import { usePathname } from "next/navigation";
import StatusDropdown from "./StatusDropdown";
import MyIngroupsButton from "./MyIngroupsButton";
import { useEffect, useState } from "react";
import ChangePasswordModal from "./ChangePasswordModal";
import { ChevronDown, Menu, ChevronLeft } from "lucide-react";
import NavbarCrmButton from "./NavbarCrmButton";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/app/contexts/AuthContext";

export default function Navbar({
  onToggleMobileMenu,
}: {
  onToggleMobileMenu: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [isMobileNavbarOpen, setIsMobileNavbarOpen] = useState(false);

  //   STATUSDROPDOWN WRAPPER - DISABLE ON CTC
  const StatusDropdownWrapper = () => (
    <div
      className={pathname === "/ctc" ? "pointer-events-none opacity-50" : ""}
    >
      <StatusDropdown />
    </div>
  );

  const pageTitleMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/ctc": "Outbound Calls",
  };

  const dynamicTitle = pageTitleMap[pathname] || "Dashboard";

  const agentName = user?.full_name || user?.user || "Agent";
  const profilePic = user?.profilePic || "";

  // Close mobile navbar on route change
  useEffect(() => {
    setIsMobileNavbarOpen(false);
  }, [pathname]);

  return (
    <>
      {/*   NAVBAR OVERLAY - Mobile Only */}
      {isMobileNavbarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-65"
          onClick={() => setIsMobileNavbarOpen(false)}
        />
      )}

      <header className="h-20 bg-linear-to-b from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-3xl text-white flex items-center justify-between px-6 border-b border-slate-700/50 shadow-2xl sticky top-0 z-70">
        {/* Left: Hamburger + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-3 bg-slate-800/50 hover:bg-slate-700/70 rounded-xl transition-all duration-200 shadow-lg z-80 shrink-0"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black bg-linear-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
            {dynamicTitle}
          </h1>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 lg:gap-3 relative">
          {/*   MOBILE: Breadcrumb Dropdown */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileNavbarOpen(!isMobileNavbarOpen)}
              className="p-3 bg-slate-800/50 hover:bg-slate-700/70 rounded-xl transition-all duration-200 shadow-lg flex items-center gap-2 group z-80"
            >
              <ChevronLeft className="w-5 h-5 rotate-180 group-hover:rotate-0 transition-transform duration-200" />
            </button>

            {/*   MOBILE NAVBAR DROPDOWN */}
            {isMobileNavbarOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-linear-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl z-75 py-3">
                <div className="px-3 space-y-2">
                  {/* NavbarCrmButton */}
                  <div className="p-3 rounded-xl hover:bg-slate-700/50 transition-colors">
                    <NavbarCrmButton />
                  </div>

                  {/*   STATUSDROPDOWN WRAPPER - DISABLED ON CTC */}
                  <div
                    className={`p-3 rounded-xl hover:bg-slate-700/50 transition-colors ${
                      pathname === "/ctc" ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <StatusDropdownWrapper />
                  </div>

                  {/* MyIngroupsButton */}
                  <div className="p-3 rounded-xl hover:bg-slate-700/50 transition-colors">
                    <MyIngroupsButton />
                  </div>

                  {/* Theme toggle (mobile) */}
                  <div className="p-3 rounded-xl hover:bg-slate-700/50 transition-colors">
                    <ThemeToggle />
                  </div>

                  {/* Divider */}
                  <div className="px-4 my-2">
                    <div className="h-px bg-linear-to-r from-transparent via-slate-700/50 to-transparent" />
                  </div>

                  {/* Profile */}
                  <button
                    onClick={() => {
                      setIsMobileNavbarOpen(false);
                      setOpenPasswordModal(true);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/50 transition-all duration-200 text-slate-300 hover:text-white group"
                  >
                    {profilePic ? (
                      <img
                        src={profilePic}
                        alt="Profile"
                        className="w-10 h-10 rounded-2xl object-cover border-2 border-emerald-400/40"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-linear-to-br from-slate-700 to-slate-600 rounded-2xl flex items-center justify-center text-white font-bold text-sm">
                        {agentName[0] || "?"}
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <span className="font-medium block">
                        {agentName || "Profile"}
                      </span>
                      <span className="text-xs text-slate-500">Settings</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/*   DESKTOP: Show All Controls Inline */}
          <div className="hidden lg:flex items-center gap-3">
            <NavbarCrmButton />

            {/*   STATUSDROPDOWN WRAPPER - DISABLED ON CTC */}
            <StatusDropdownWrapper />

            <MyIngroupsButton />
            <ThemeToggle />

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
                <div className="w-8 h-8 bg-linear-to-r from-slate-700 to-slate-600 rounded-2xl flex items-center justify-center text-white font-bold text-xs">
                  {agentName[0] || "?"}
                </div>
              )}
              <span className="truncate max-w-30">{agentName}</span>
              <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
            </button>
          </div>
        </div>
      </header>

      <ChangePasswordModal
        open={openPasswordModal}
        onClose={() => setOpenPasswordModal(false)}
      />
    </>
  );
}
