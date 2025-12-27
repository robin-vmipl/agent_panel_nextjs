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

  // ✅ STATUS → SIP + SIP STATUS SYNC
  useEffect(() => {
    if (!initialized) return;

    const timer = setTimeout(() => {
      if (currentStatus === "ACTIVE") {
        sipConnect();
        // ✅ UPDATE CallWidget SIP status
        const statusElement = document.getElementById("sipStatus");
        if (statusElement) {
          statusElement.textContent = "REGISTERED";
          statusElement.className = "text-xs text-emerald-400";
        }
      } else {
        sipDisconnect();
        // ✅ UPDATE CallWidget SIP status
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

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={loading}
        className={`text-white px-4 py-2 rounded-md text-sm font-medium ${statusColor} transition-colors`}
      >
        {loading ? "Updating..." : currentStatus}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 py-1">
          {STATUS_OPTIONS.map((statusOption) => {
            const isActive = statusOption.value === currentStatus;
            return (
              <button
                key={statusOption.value}
                type="button"
                disabled={isActive || loading}
                onClick={() => handleStatusChange(statusOption.value)}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-700 transition-colors ${
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
