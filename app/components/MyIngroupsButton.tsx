"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import MyIngroupsModal from "./MyIngroupsModal";
import { apiFetch } from "../lib/api";
import { Users } from "lucide-react";

export default function MyIngroupsButton() {
  const [open, setOpen] = useState(false);
  const [ingroups, setIngroups] = useState<string[]>([]);
  const [status, setStatus] = useState("INACTIVE");

  const fetchIngoups = async () => {
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agent/my-ingroups`
      );

      if (data.status === "error") {
        toast.error(data.message || "Failed to fetch ingroups");
        return;
      }

      setIngroups(data.ingroups || []);
      setStatus(data.status || "INACTIVE");
      setOpen(true);
    } catch (err) {
      toast.error("Unable to fetch ingroups");
    }
  };

  return (
    <div className="relative group">
      {/*   GLASSMORPHISM BUTTON */}
      <button
        onClick={fetchIngoups}
        className="navbar-btn group relative overflow-hidden px-5 py-2.5 text-sm font-semibold rounded-2xl bg-linear-to-r from-slate-800/80 via-slate-700/70 to-slate-900/80 backdrop-blur-xl border border-slate-600/50 shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 hover:bg-linear-to-r hover:border-emerald-400/40 transition-all duration-400 flex items-center gap-2 text-slate-200 hover:text-white cursor-pointer"
      >
        {/* ✨ Shine effect */}
        <div className="absolute inset-0 bg-linear-to-r from-white/20 via-white/40 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 -skew-x-12" />

        <Users className="w-4 h-4 relative z-10" />
        <span className="relative z-10">Ingroups</span>
      </button>

      <MyIngroupsModal
        open={open}
        onClose={() => setOpen(false)}
        ingroups={ingroups}
        status={status}
      />
    </div>
  );
}
