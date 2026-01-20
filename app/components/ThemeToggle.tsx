"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark";
const THEME_KEY = "theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [open, setOpen] = useState(false);

  // 🔄 Read theme from DOM (NOT default state)
  useEffect(() => {
    const current =
      (document.documentElement.getAttribute("data-theme") as Theme) || "dark";
    setTheme(current);
  }, []);

  // 🌗 Apply + persist theme
  useEffect(() => {
    if (!theme) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // ❌ Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement)?.closest(".theme-toggle-root")) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // 🚫 Avoid hydration mismatch
  if (!theme) return null;

  return (
    <div className="relative theme-toggle-root">
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 rounded-2xl bg-slate-800 text-white flex items-center gap-2"
      >
        {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
        Theme
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden z-50">
          <button
            onClick={() => setTheme("dark")}
            className="block w-full text-left px-4 py-2 hover:bg-slate-700"
          >
            Dark
          </button>
          <button
            onClick={() => setTheme("light")}
            className="block w-full text-left px-4 py-2 hover:bg-slate-700"
          >
            Light
          </button>
        </div>
      )}
    </div>
  );
}
