"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const THEME_KEY = "theme";
type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [open, setOpen] = useState(false);
  // Start with a deterministic default so server and initial client render match.
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // On mount, read the persisted theme and apply it.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY) as Theme | null;
      if (stored) setTheme(stored);
    } catch (e) {
      // ignore
    }
    setMounted(true);
  }, []);

  // Whenever theme changes, persist and apply to document.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest || !target.closest(".theme-toggle-root")) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="relative theme-toggle-root">
      <button
        onClick={() => setOpen(!open)}
        className="group relative overflow-hidden px-4 py-2.5 text-sm font-semibold rounded-2xl bg-linear-to-r from-slate-800/80 via-slate-700/70 to-slate-900/80 backdrop-blur-xl border border-slate-600/50 shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-400 flex items-center gap-2 text-slate-200 hover:text-white cursor-pointer"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Change theme"
      >
        <div className="absolute inset-0 bg-linear-to-r from-white/10 via-white/20 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 -skew-x-12" />

        {theme === "dark" ? (
          <Moon className="w-4 h-4 relative z-10" />
        ) : (
          <Sun className="w-4 h-4 relative z-10" />
        )}
        <span className="relative z-10">Theme</span>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-44 bg-linear-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl z-75 py-2">
          <div className="flex flex-col">
            <button
              onClick={() => setTheme("dark")}
              className="text-left px-4 py-2 hover:bg-slate-700/50 transition-colors"
            >
              Dark
            </button>
            <button
              onClick={() => setTheme("light")}
              className="text-left px-4 py-2 hover:bg-slate-700/50 transition-colors"
            >
              Light
            </button>
            {/* Only Dark and Light supported */}
          </div>
        </div>
      )}
    </div>
  );
}
