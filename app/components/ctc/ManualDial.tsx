"use client";

import { useState } from "react";
import { Phone, Loader2 } from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import toast from "react-hot-toast";

interface ManualDialProps {
  agentConfig: any;
  className?: string;
}

export default function ManualDial({
  agentConfig,
  className = "",
}: ManualDialProps) {
  const [phonenumber, setPhonenumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleManualDial = async () => {
    if (!agentConfig || phonenumber.length !== 10) {
      toast.error("Enter valid 10-digit number");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: "ManualDial",
        customer_number: phonenumber,
        agent_number: agentConfig.agent_number,
        vispl_id: agentConfig.vispl_id || "0",
      });

      await apiFetch(
        `https://krph.csccloud.in/api/agent/click-to-call?${params.toString()}`
      );
      toast.success(`Calling ${phonenumber.slice(-4)}...`);
      setPhonenumber("");
    } catch (error: any) {
      toast.error(error.message || "Call failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`bg-linear-to-r from-slate-900/95 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-1 shadow-2xl ${className}`}
    >
      <div className="flex items-stretch bg-slate-900/50 rounded-3xl overflow-hidden">
        <input
          type="text"
          maxLength={10}
          className="flex-1 px-8 py-6 bg-transparent border-0 text-xl font-mono font-bold text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          placeholder="Enter 10-digit number"
          value={phonenumber}
          onChange={(e) =>
            setPhonenumber(e.target.value.replace(/[^0-9]/g, ""))
          }
          disabled={loading}
        />
        <button
          onClick={handleManualDial}
          disabled={loading || phonenumber.length !== 10 || !agentConfig}
          className={`px-10 py-6 font-bold text-lg flex items-center gap-3 whitespace-nowrap transition-all shadow-xl ${
            loading || phonenumber.length !== 10 || !agentConfig
              ? "bg-slate-800/70 text-slate-500 cursor-not-allowed"
              : "bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 hover:shadow-emerald-500/50 hover:scale-[1.02] text-white"
          }`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Phone className="w-5 h-5" />
          )}
          DIAL
        </button>
      </div>
    </div>
  );
}
