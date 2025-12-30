"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../lib/api";
import { sipConnect, sipDisconnect } from "../lib/sipControls";

const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Tea Break", value: "TEA BREAK" },
  { label: "Lunch Break", value: "LUNCH BREAK" },
  { label: "Short Official Break", value: "SHORT OFFICIAL BREAK" },
  { label: "Training Break", value: "TRAINING BREAK" },
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
      toast.success("Status updated");
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const statusColor =
    currentStatus === "ACTIVE"
      ? "bg-green-600 hover:bg-green-700"
      : "bg-red-600 hover:bg-red-700";

  const isDisabled = isInCall || loading;
  const buttonStyle = isDisabled ? "bg-slate-700/60 opacity-70" : statusColor;

  return (
    <div className="relative">
      {/* 🔥 BUTTON WITH POINTER + DANCING ICON */}
      <button
        type="button"
        onClick={() => !isDisabled && setOpen(!open)}
        disabled={isDisabled}
        className={`text-white px-4 py-2 rounded-md text-sm font-medium transition-all hover:scale-105 pointer-events-auto ${buttonStyle} ${
          isDisabled ? "cursor-not-allowed" : "cursor-pointer"
        }`}
        title={
          isInCall ? "📞 Call in progress - End call first" : "Change Status"
        }
      >
        <span className="inline-flex items-center gap-1.5">
          {loading ? "Updating..." : currentStatus}
        </span>
      </button>

      {/* 🔥 SIMPLE DROPDOWN */}
      {open && !isInCall && (
        <div className="absolute right-0 mt-2 w-60 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 py-1">
          {STATUS_OPTIONS.map((statusOption) => {
            const isActive = statusOption.value === currentStatus;
            return (
              <button
                key={statusOption.value}
                type="button"
                disabled={isActive || loading}
                onClick={() => handleStatusChange(statusOption.value)}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-700 transition-all pointer-events-auto cursor-pointer hover:scale-[1.02] ${
                  isActive
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "text-gray-300"
                }`}
              >
                <span>{statusOption.label}</span>
                {isActive && <span className="ml-2 text-green-400">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
