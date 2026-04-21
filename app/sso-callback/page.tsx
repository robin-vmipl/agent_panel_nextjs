"use client";

import { useEffect } from "react";

export default function SSOCallback() {
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/agent";

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    const handleSSO = async () => {
      if (!token) {
        window.location.href = `${BACKEND_URL}/login`;
        return;
      }

      try {
        // ✅ validate token + backend sets cookie
        const res = await fetch(
          `${API_URL}/me?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (!res.ok) {
          window.location.href = `${BACKEND_URL}/login`;
          return;
        }

        // clean URL
        window.history.replaceState({}, "", "/sso-callback");

        // go dashboard
        window.location.href = "/dashboard";
      } catch {
        window.location.href = `${BACKEND_URL}/login`;
      }
    };

    handleSSO();
  }, [API_URL, BACKEND_URL]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b151d]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
    </div>
  );
}
