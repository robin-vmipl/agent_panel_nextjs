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
        className="p-3 bg-slate-800/50 hover:bg-slate-700/70 rounded-xl transition-all duration-200 shadow-lg flex items-center gap-2 text-sm"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Change theme"
      >
        {theme === "dark" ? (
          <Moon className="w-4 h-4" />
        ) : (
          <Sun className="w-4 h-4" />
        )}
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
