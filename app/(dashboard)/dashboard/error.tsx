"use client";

import { logoutUser } from "@/app/lib/auth";
import { AlertTriangle, RefreshCcw, LogOut } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-800 text-white">
      <div className="relative max-w-md w-full mx-4 p-8 rounded-3xl theme-surface backdrop-blur-3xl border border-white/10 shadow-2xl ring-1 ring-white/5 text-center overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 via-teal-500/5 to-emerald-600/10 blur-2xl -z-10" />

        <div className="space-y-6 relative z-10">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>

          <h2 className="text-2xl font-black tracking-tight">
            Dashboard unavailable
          </h2>

          <p className="text-slate-400 text-sm leading-relaxed">
            Something went wrong while loading your dashboard.
            <br />
            You can retry or safely exit the session.
          </p>

          <div className="flex gap-4 justify-center pt-2">
            <button
              onClick={reset}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 transition shadow-lg hover:shadow-emerald-500/30 cursor-pointer"
            >
              <RefreshCcw className="w-4 h-4" />
              Retry
            </button>

            <button
              onClick={logoutUser}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-slate-700 hover:bg-slate-600 transition shadow-lg cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
