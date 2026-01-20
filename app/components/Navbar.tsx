"use client";
import { usePathname } from "next/navigation";
import StatusDropdown from "./StatusDropdown";
import MyIngroupsButton from "./MyIngroupsButton";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import ChangePasswordModal from "./ChangePasswordModal";
import { ChevronDown, Menu, ChevronLeft, User, Sun, Moon } from "lucide-react";
import NavbarCrmButton from "./NavbarCrmButton";
import { useAuth } from "@/app/contexts/AuthContext";
import { useModalContext } from "@/app/contexts/ModalContext";

export default function Navbar({
  onToggleMobileMenu,
}: {
  onToggleMobileMenu: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { openModal, closeModal, closeAllModals, openMenus } =
    useModalContext();
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [isMobileNavbarOpen, setIsMobileNavbarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("dark");
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const agentName = user?.full_name || user?.user || "Agent";
  const profilePic = user?.profilePic || "";

  // Memoized StatusDropdown - No re-renders from Profile
  const StatusDropdownWrapper = useCallback(
    () => (
      <div
        className={pathname === "/ctc" ? "pointer-events-none opacity-50" : ""}
      >
        <StatusDropdown />
      </div>
    ),
    [pathname],
  );

  const MemoizedStatusDropdown = useMemo(
    () => StatusDropdownWrapper,
    [StatusDropdownWrapper],
  );

  const pageTitleMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/ctc": "Outbound Calls",
  };

  const dynamicTitle = pageTitleMap[pathname] || "Dashboard";

  useEffect(() => {
    const theme = (localStorage.getItem("theme") ||
      document.documentElement.getAttribute("data-theme") ||
      "dark") as "light" | "dark";
    setCurrentTheme(theme);
  }, []);

  useEffect(() => {
    setIsMobileNavbarOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // 🔹 Click outside handler for profile menu (Desktop only)
  useEffect(() => {
    if (!profileOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
        closeModal("profileMenu");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen, closeModal]);

  // 🔹 Close profile menu when other modals open
  useEffect(() => {
    if (
      profileOpen &&
      (openMenus.has("statusDropdown") || openMenus.has("myIngroupsModal"))
    ) {
      setProfileOpen(false);
      closeModal("profileMenu");
    }
  }, [openMenus, profileOpen, closeModal]);

  const changeTheme = useCallback((theme: "light" | "dark") => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
      setCurrentTheme(theme);
    }
  }, []);

  // Event handlers with proper stopPropagation
  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!profileOpen) {
      closeAllModals();
      setProfileOpen(true);
      openModal("profileMenu");
    } else {
      setProfileOpen(false);
      closeModal("profileMenu");
    }
  };

  const handleMobileToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMobileNavbarOpen((prev) => !prev);
  };

  const handleOverlayClick = () => {
    setIsMobileNavbarOpen(false);
  };

  const handlePasswordClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // AUTO CLOSE MOBILE PROFILE ON PASSWORD CLICK
    setIsMobileNavbarOpen(false);
    setProfileOpen(false);
    setOpenPasswordModal(true);
  };

  const handleThemeClick =
    (theme: "light" | "dark") => (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      changeTheme(theme);
    };

  return (
    <>
      {isMobileNavbarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-65"
          onClick={handleOverlayClick}
        />
      )}

      <header className="h-20 bg-linear-to-b from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-3xl text-white flex items-center justify-between px-6 border-b border-slate-700/50 shadow-2xl sticky top-0 z-70">
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

        <div className="flex items-center gap-2 lg:gap-3 relative">
          {/* Mobile Dropdown - z-[75] */}
          <div className="lg:hidden">
            <button
              onClick={handleMobileToggle}
              className="p-3 bg-slate-800/50 hover:bg-slate-700/70 rounded-xl transition-all duration-200 shadow-lg flex items-center gap-2 group z-80"
            >
              <ChevronLeft className="w-5 h-5 rotate-180 group-hover:rotate-0 transition-transform duration-200" />
            </button>

            {isMobileNavbarOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-linear-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl z-75 py-3">
                <div className="px-3 space-y-2">
                  <div className="p-3 rounded-xl hover:bg-slate-700/50 transition-colors">
                    <NavbarCrmButton />
                  </div>

                  <div
                    className={`p-3 rounded-xl hover:bg-slate-700/50 transition-colors ${pathname === "/ctc" ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <MemoizedStatusDropdown />
                  </div>

                  <div className="p-3 rounded-xl hover:bg-slate-700/50 transition-colors">
                    <MyIngroupsButton />
                  </div>

                  <div className="px-4 my-2">
                    <div className="h-px bg-linear-to-r from-transparent via-slate-700/50 to-transparent" />
                  </div>

                  {/* MOBILE PROFILE WITH CHANGE PASSWORD */}
                  <div className="p-3 rounded-xl hover:bg-slate-700/50 transition-colors space-y-3">
                    <div className="flex items-center gap-3">
                      {profilePic ? (
                        <img
                          src={profilePic}
                          alt="Profile"
                          className="w-10 h-10 rounded-2xl object-cover border-2 border-emerald-400/40"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-linear-to-r from-slate-700 to-slate-600 rounded-2xl flex items-center justify-center text-white font-bold text-sm">
                          {agentName[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-white">
                          {agentName}
                        </div>
                        <div className="text-xs text-slate-400">Settings</div>
                      </div>
                    </div>

                    {/* MOBILE CHANGE PASSWORD BUTTON */}
                    <button
                      onClick={handlePasswordClick}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-slate-600/50 transition-all duration-200 text-left group text-white mb-3 border border-slate-700/50"
                    >
                      <User className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 shrink-0" />
                      <span className="font-medium">Change Password</span>
                    </button>

                    {/* Theme Section */}
                    <div className="pt-3 border-t border-slate-700/50 space-y-2">
                      <div className="text-xs text-slate-400 font-medium tracking-wider uppercase">
                        Theme
                      </div>

                      <button
                        onClick={handleThemeClick("dark")}
                        className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all duration-200 text-left group text-white ${
                          currentTheme === "dark"
                            ? "bg-emerald-500/20 border-2 border-emerald-400/40 ring-2 ring-emerald-400/30 shadow-lg"
                            : "hover:bg-slate-700/50"
                        }`}
                      >
                        <Moon
                          className={`w-4 h-4 shrink-0 ${currentTheme === "dark" ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-400"}`}
                        />
                        <span className="font-medium">Dark</span>
                        {currentTheme === "dark" && (
                          <div className="ml-auto w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-md animate-pulse" />
                        )}
                      </button>

                      <button
                        onClick={handleThemeClick("light")}
                        className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all duration-200 text-left group text-white ${
                          currentTheme === "light"
                            ? "bg-emerald-500/20 border-2 border-emerald-400/40 ring-2 ring-emerald-400/30 shadow-lg"
                            : "hover:bg-slate-700/50"
                        }`}
                      >
                        <Sun
                          className={`w-4 h-4 shrink-0 ${currentTheme === "light" ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-400"}`}
                        />
                        <span className="font-medium">Light</span>
                        {currentTheme === "light" && (
                          <div className="ml-auto w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-md animate-pulse" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <NavbarCrmButton />
            <MemoizedStatusDropdown />
            <MyIngroupsButton />

            <div
              className="relative"
              ref={profileMenuRef}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleProfileClick}
                className="navbar-profile-btn group bg-linear-to-r from-slate-800/70 to-slate-900/70 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-slate-600/50 shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 text-sm font-semibold"
              >
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-8 h-8 rounded-2xl object-cover border-2 border-emerald-400/40"
                  />
                ) : (
                  <div className="w-8 h-8 bg-linear-to-r from-slate-700 to-slate-600 rounded-2xl flex items-center justify-center text-white font-bold text-xs">
                    {agentName[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <span className="truncate max-w-28">{agentName}</span>
                <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
              </button>

              {profileOpen && (
                <div className="absolute top-full right-0 mt-2 w-60 bg-linear-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl z-100 py-3">
                  <button
                    onClick={handlePasswordClick}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-700/50 transition-all duration-200 text-left group text-white mb-2"
                  >
                    <User className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 shrink-0" />
                    <span className="font-medium">Change Password</span>
                  </button>

                  <div className="space-y-1">
                    <div className="px-4 py-1 text-xs text-slate-400 font-medium tracking-wider uppercase border-b border-slate-700/50 pb-2 mb-2">
                      Theme
                    </div>

                    <button
                      onClick={handleThemeClick("dark")}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 text-left group text-white ${
                        currentTheme === "dark"
                          ? "bg-emerald-500/20 border-2 border-emerald-400/40 ring-2 ring-emerald-400/30 shadow-lg"
                          : "hover:bg-slate-700/50"
                      }`}
                    >
                      <Moon
                        className={`w-5 h-5 shrink-0 transition-all ${currentTheme === "dark" ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-400"}`}
                      />
                      <span className="font-medium">Dark</span>
                      {currentTheme === "dark" && (
                        <div className="ml-auto w-3 h-3 bg-emerald-400 rounded-full shadow-md animate-pulse" />
                      )}
                    </button>

                    <button
                      onClick={handleThemeClick("light")}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 text-left group text-white ${
                        currentTheme === "light"
                          ? "bg-emerald-500/20 border-2 border-emerald-400/40 ring-2 ring-emerald-400/30 shadow-lg"
                          : "hover:bg-slate-700/50"
                      }`}
                    >
                      <Sun
                        className={`w-5 h-5 shrink-0 transition-all ${currentTheme === "light" ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-400"}`}
                      />
                      <span className="font-medium">Light</span>
                      {currentTheme === "light" && (
                        <div className="ml-auto w-3 h-3 bg-emerald-400 rounded-full shadow-md animate-pulse" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MODAL z-[999] - ALWAYS ON TOP */}
      <ChangePasswordModal
        open={openPasswordModal}
        onClose={() => setOpenPasswordModal(false)}
      />
    </>
  );
}
