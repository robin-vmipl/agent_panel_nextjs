"use client";

import { useState, useEffect } from "react";
import { Phone, Loader2, ChevronDown } from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import toast from "react-hot-toast";

export default function CTCPage() {
  const [phonenumber, setPhonenumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentConfig, setAgentConfig] = useState<any>(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "https://krph.csccloud.in/api";

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch(`${API_BASE}/agent/ctc-data`);
        setAgentConfig(data);
      } catch (error) {
        console.error("Agent data error:", error);
      }
    })();
  }, []);

  const handleMakeCall = async () => {
    if (!agentConfig || phonenumber.length !== 10) return;

    setLoading(true);
    const number = phonenumber.trim();

    try {
      const params = new URLSearchParams({
        action: "ManualDial",
        customer_number: number,
        agent_number: agentConfig.agent_number,
        vispl_id: agentConfig.vispl_id || "0",
      });

      await apiFetch(`${API_BASE}/agent/click-to-call?${params.toString()}`);
      toast.success("✅ Call initiated! Webphone ringing...");
      setPhonenumber("");
    } catch (error: any) {
      toast.error(error.message || "Call failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🔥 HEADER SPACING FOR NAVBAR */}
      {/* <div className="h-20" /> */}

      <div className="min-h-screen pb-12">
        {/* 🔥 MAIN CTC BAR - SINGLE ROW */}
        <div className="max-w-6xl mx-auto px-6 pt-6">
          <div className="bg-linear-to-r from-slate-900/95 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-1 shadow-2xl sticky top-6 z-20">
            <div className="flex items-stretch bg-slate-900/50 rounded-3xl overflow-hidden">
              {/* Input */}
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

              {/* Dial Button */}
              <button
                onClick={handleMakeCall}
                disabled={loading || phonenumber.length !== 10 || !agentConfig}
                className={`px-10 py-6 font-bold text-lg flex items-center gap-3 whitespace-nowrap transition-all shadow-xl ${
                  loading || phonenumber.length !== 10 || !agentConfig
                    ? "bg-slate-800/70 text-slate-500 cursor-not-allowed hover:scale-100"
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

          {/* 🔥 Agent Info */}
          <div className="flex justify-end mt-4 text-xs text-slate-400">
            Agent:{" "}
            <span className="font-mono font-semibold text-white ml-1">
              {agentConfig?.agent_number}
            </span>
          </div>
        </div>

        {/* 🔥 DATATABLE READY - EMPTY SPACE */}
        <div className="max-w-6xl mx-auto px-6 mt-12 space-y-8">
          {/* Future: Missed Calls Table */}
          <div className="h-96 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <ChevronDown className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <div className="space-y-1">
                <p className="text-lg font-medium">Missed Calls Table</p>
                <p className="text-sm">Coming soon...</p>
              </div>
            </div>
          </div>

          {/* Future: Auto Campaign Table */}
          <div className="h-96 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <ChevronDown className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <div className="space-y-1">
                <p className="text-lg font-medium">Auto Campaign Calls</p>
                <p className="text-sm">Coming soon...</p>
              </div>
            </div>
          </div>

          {/* Future: Assigned Calls Table */}
          <div className="h-96 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <ChevronDown className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <div className="space-y-1">
                <p className="text-lg font-medium">Assigned Calls</p>
                <p className="text-sm">Coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
