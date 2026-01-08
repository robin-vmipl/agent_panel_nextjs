"use client";

import { useEffect } from "react";

const THEME_KEY = "theme";

export default function ThemeInitializer() {
  useEffect(() => {
    try {
      const t = localStorage.getItem(THEME_KEY) || "dark";
      document.documentElement.setAttribute("data-theme", t);
    } catch (e) {
      // ignore
    }
  }, []);

  return null;
}
