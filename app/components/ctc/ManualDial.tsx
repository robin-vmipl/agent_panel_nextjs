"use client";

import { useState } from "react";
import { Phone, Loader2, AlertCircle } from "lucide-react";
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

  const validateIndianMobile = (number: string): boolean => {
    const cleaned = number.replace(/[^0-9]/g, "");
    return cleaned.length === 10 && /^[6-9][0-9]{9}$/.test(cleaned);
  };

  const getErrorMessage = (): string => {
    const cleaned = phonenumber.replace(/[^0-9]/g, "");
    if (!cleaned) return "";
    if (cleaned.length !== 10) return "Enter valid 10-digit number";
    if (!/^[6-9]/.test(cleaned)) return "Must start with 6, 7, 8 or 9";
    return "";
  };

  const handleManualDial = async () => {
    if (!agentConfig) {
      toast.error("Agent configuration not loaded");
      return;
    }

    if (!validateIndianMobile(phonenumber)) {
      toast.error("Enter valid 10-digit mobile (starts with 6-9)");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: "ManualDial",
        customer_number: phonenumber.replace(/[^0-9]/g, ""),
        agent_number: agentConfig.agent_number,
        vispl_id: agentConfig.vispl_id || "0",
      });

      await apiFetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/agent/click-to-call?${params.toString()}`,
      );

      toast.success(`Calling ${phonenumber.slice(-4)}...`);
      setPhonenumber("");
    } catch (error: any) {
      console.error("Manual dial failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    loading || !agentConfig || !validateIndianMobile(phonenumber);
  const errorMessage = getErrorMessage();

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-4 mb-6  ">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center shadow-lg">
          <Phone className="w-6 h-6 text-emerald-400" />
        </div>

        <div>
          <h2 className="text-3xl font-bold bg-linear-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent transition-all]">
            Manual Dial
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Quickly dial any 10-digit number manually
          </p>
        </div>
      </div>

      {/* MOBILE: Stacked Layout */}
      <div className="block lg:hidden">
        <div className="theme-surface backdrop-blur-xl border border-slate-700/50 rounded-3xl p-1 shadow-2xl">
          <div className="theme-panel rounded-3xl p-3 space-y-3">
            <div className="space-y-1">
              <input
                type="text"
                maxLength={10}
                className={`w-full px-6 py-5 bg-transparent border-2 ${
                  errorMessage ? "border-rose-500/50" : "border-transparent"
                } text-lg font-mono font-bold text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all rounded-2xl`}
                placeholder="Enter 10-digit number"
                value={phonenumber}
                onChange={(e) =>
                  setPhonenumber(e.target.value.replace(/[^0-9]/g, ""))
                }
                disabled={loading}
              />
              {errorMessage && (
                <p className="text-xs text-rose-400 flex items-center gap-1 pt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errorMessage}
                </p>
              )}
            </div>

            <button
              onClick={handleManualDial}
              disabled={isDisabled}
              className={`manual-dial-btn w-full py-5 px-8 font-bold text-lg flex items-center justify-center gap-3 rounded-2xl shadow-xl transition-all ${
                isDisabled
                  ? "bg-slate-800/70 text-slate-500 cursor-not-allowed"
                  : "bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 hover:shadow-emerald-500/50 hover:scale-[1.02] btn-gradient cursor-pointer"
              }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Phone className="w-5 h-5" />
              )}
              CALL
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP: Side-by-Side */}
      <div className="hidden lg:block">
        <div className="theme-surface backdrop-blur-xl border border-slate-700/50 rounded-3xl p-1 shadow-2xl">
          <div className="flex items-stretch theme-panel rounded-3xl overflow-hidden">
            <input
              type="text"
              maxLength={10}
              className={`flex-1 px-8 py-6 bg-transparent border-r-2 ${
                errorMessage ? "border-r-rose-500/50" : "border-r-slate-700/50"
              } text-xl font-mono font-bold text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`}
              placeholder="Enter 10-digit number"
              value={phonenumber}
              onChange={(e) =>
                setPhonenumber(e.target.value.replace(/[^0-9]/g, ""))
              }
              disabled={loading}
            />
            <button
              onClick={handleManualDial}
              disabled={isDisabled}
              className={`manual-dial-btn px-10 py-6 font-bold text-lg flex items-center gap-3 whitespace-nowrap transition-all shadow-xl ${
                isDisabled
                  ? "bg-slate-800/70 text-slate-500 cursor-not-allowed"
                  : "bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 hover:shadow-emerald-500/50 hover:scale-[1.02] btn-gradient cursor-pointer"
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
          {errorMessage && (
            <div className="px-8 pb-4 pt-2">
              <p className="text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errorMessage}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
