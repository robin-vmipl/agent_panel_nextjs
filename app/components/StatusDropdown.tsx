"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../lib/api";
import { sipConnect, sipDisconnect } from "../lib/sipControls";
import { ChevronDown, Circle } from "lucide-react";

const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE", color: "emerald" },
  { label: "Tea Break", value: "TEA BREAK", color: "amber" },
  { label: "Lunch Break", value: "LUNCH BREAK", color: "orange" },
  {
    label: "Short Official Break",
    value: "SHORT OFFICIAL BREAK",
    color: "purple",
  },
  { label: "Training Break", value: "TRAINING BREAK", color: "indigo" },
] as const;

export default function StatusDropdown() {
  const [currentStatus, setCurrentStatus] = useState("INACTIVE");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isInCall, setIsInCall] = useState(false);

  // 🔥 CHECK CALL STATUS
  useEffect(() => {
    const checkCallStatus = () => {
      const callDiv = document.querySelector("#callpick-detail") as HTMLElement;
      const hangupDiv = document.querySelector("#hangup_div") as HTMLElement;
      const isCallDetailVisible = callDiv && !callDiv.hasAttribute("hidden");
      const isHangupVisible =
        hangupDiv && !hangupDiv.classList.contains("d-none");
      setIsInCall(isCallDetailVisible || isHangupVisible);
    };
    const interval = setInterval(checkCallStatus, 500);
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentStatus = async () => {
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agent/get-status`
      );
      if (data?.status) {
        setCurrentStatus(data.status);
        localStorage.setItem("agentStatus", data.status);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch status");
    } finally {
      setInitialized(true);
    }
  };

  useEffect(() => {
    fetchCurrentStatus();
  }, []);

  useEffect(() => {
    if (!initialized) return;
    const timer = setTimeout(() => {
      if (currentStatus === "ACTIVE") {
        sipConnect();
        const statusElement = document.getElementById("sipStatus");
        if (statusElement) {
          statusElement.textContent = "REGISTERED";
          statusElement.className = "text-xs text-emerald-400";
        }
      } else {
        sipDisconnect();
        const statusElement = document.getElementById("sipStatus");
        if (statusElement) {
          statusElement.textContent = "Disconnected";
          statusElement.className = "text-xs text-red-400";
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [currentStatus, initialized]);

  const handleStatusChange = async (newStatus: string) => {
    if (isInCall) {
      toast.error("Cannot change status during active call!");
      setOpen(false);
      return;
    }
    if (newStatus === currentStatus || loading) return;
    setLoading(true);
    setOpen(false);
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agent/update-status`,
        {
          method: "POST",
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setCurrentStatus(newStatus);
      localStorage.setItem("agentStatus", newStatus);
      toast.success("Status updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const option =
      STATUS_OPTIONS.find((opt) => opt.value === status) || STATUS_OPTIONS[0];
    return {
      color: option.color,
      bg:
        status === "ACTIVE"
          ? "from-emerald-500/20 to-emerald-600/20"
          : "from-slate-800/70 to-slate-900/70",
      text: status === "ACTIVE" ? "text-emerald-400" : "text-slate-300",
      ring: status === "ACTIVE" ? "ring-emerald-500/40" : "ring-slate-600/40",
    };
  };

  const currentConfig = getStatusConfig(currentStatus);
  const isDisabled = isInCall || loading;

  return (
    <div className="relative group">
      {/* 🔥 MAIN BUTTON - GLASSMORPHISM */}
      <button
        type="button"
        onClick={() => !isDisabled && setOpen(!open)}
        disabled={isDisabled}
        className={`relative overflow-hidden px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02] backdrop-blur-xl border-2 shadow-2xl ${
          isDisabled
            ? "bg-slate-800/60 border-slate-700/50 opacity-70 cursor-not-allowed"
            : `${currentConfig.bg} ${currentConfig.ring} border-emerald-500/30 hover:border-emerald-400/50 hover:shadow-emerald-500/30 ${currentConfig.text}`
        }`}
        title={
          isInCall ? "📞 Call in progress - End call first" : "Change Status"
        }
      >
        {/* 🔥 BACKGROUND SHINE */}
        {/* 🔥 MAIN BUTTON - LESS SPACING */}
        <div
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-white/20 shadow-lg ${
            currentStatus === "ACTIVE"
              ? "bg-emerald-400 shadow-emerald-400/50"
              : "bg-slate-500 shadow-slate-500/50"
          }`}
        />

        <div className="relative z-10 flex items-center gap-2.5 pl-8">
          <span className="font-bold tracking-wide">
            {loading ? "Updating..." : currentStatus.replace(/_/g, " ")}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* 🔥 DROPDOWN - EYE CATCHING */}
      {open && !isInCall && (
        <div className="absolute right-0 mt-3 w-72 bg-linear-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-3xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-slate-900/50 z-100 animate-in slide-in-from-top-2 duration-200 overflow-hidden">
          {/* 🔥 DROPDOWN GLOW */}
          <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 via-transparent to-blue-500/5 rounded-2xl blur-xl animate-pulse -z-10 pointer-events-none" />

          <div className="p-2 space-y-1">
            {STATUS_OPTIONS.map((option) => {
              const isActive = option.value === currentStatus;
              const config = getStatusConfig(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={isActive || loading}
                  onClick={() => handleStatusChange(option.value)}
                  className={`group relative w-full text-left p-4 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden flex items-center gap-3 hover:scale-[1.02] ${
                    isActive
                      ? "bg-linear-to-r from-emerald-500/30 to-emerald-600/30 border-2 border-emerald-500/50 text-emerald-300 shadow-emerald-500/40 cursor-default"
                      : "hover:bg-linear-to-r hover:from-slate-700/50 hover:to-slate-800/50 text-slate-300 hover:text-white hover:border-slate-500/50 border border-transparent"
                  }`}
                >
                  {/* 🔥 OPTION SHINE */}
                  <div className="absolute inset-0 bg-linear-to-r from-emerald-400/0 via-white/20 to-transparent opacity-0 group-hover:opacity-100 rounded-xl -skew-x-12 -translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700" />

                  <div
                    className={`w-3 h-3 rounded-full shrink-0 shadow-sm border-2 border-white/20 ${
                      isActive
                        ? "bg-emerald-400 shadow-emerald-400/50"
                        : "bg-slate-600/50 group-hover:bg-emerald-400/50"
                    }`}
                  />

                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-sm truncate ${
                        isActive
                          ? "bg-linear-to-r from-emerald-300 to-emerald-400 bg-clip-text text-transparent"
                          : ""
                      }`}
                    >
                      {option.label}
                    </p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium opacity-75">
                      {option.value}
                    </p>
                  </div>

                  {isActive && (
                    <div className="ml-auto w-5 h-5 bg-linear-to-r from-emerald-400 to-emerald-500 rounded-lg shadow-lg flex items-center justify-center text-white font-bold text-xs drop-shadow-md animate-pulse">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
