"use client";

import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { logoutUser } from "@/app/lib/auth";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const didLogout = useRef(false);

  useEffect(() => {
    console.error("Dashboard crashed:", error);

    const message = error?.message?.toLowerCase() || "";

    const isAuthError =
      message.includes("session expired") ||
      message.includes("unauthorized") ||
      message.includes("401");

    if (isAuthError && !didLogout.current) {
      didLogout.current = true;

      toast.error("Session expired. Logging you out…");

      // Let toast render, then logout
      setTimeout(() => {
        window.dispatchEvent(new Event("nextjs:logout"));
        window.location.href = "/login";
      }, 1000);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="max-w-md text-center space-y-6">
        <h2 className="text-2xl font-black">Dashboard unavailable</h2>

        <p className="text-slate-400">
          Something went wrong while loading your dashboard.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition"
          >
            Retry
          </button>

          <button
            onClick={() => {
              if ((window as any).SIP_CALL_DATA?.callState === "answered") {
                toast.error("📞 End call before logout!");
                return;
              }
              logoutUser();
            }}
            className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
