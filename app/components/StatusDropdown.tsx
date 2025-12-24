"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../lib/api";

const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Tea Break", value: "TEA BREAK" },
  { label: "Lunch Break", value: "LUNCH BREAK" },
  { label: "Short Official Break", value: "SHORT OFFICIAL BREAK" },
  { label: "Training Break", value: "TRAINING BREAK" },
];

export default function StatusDropdown() {
  const [currentStatus, setCurrentStatus] = useState("INACTIVE");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =========================
     FETCH CURRENT STATUS
  ==========================*/
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
      toast.error(err.message || "Failed to fetch current status");
    }
  };

  /* =========================
     INITIAL LOAD + POLLING
  ==========================*/
  useEffect(() => {
    fetchCurrentStatus();
    const interval = setInterval(fetchCurrentStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  /* =========================
     UPDATE STATUS
  ==========================*/
  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

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

      // backend now returns 'error' or message in consistent structure
      if (data.error) {
        toast.error(data.error); // ❌ show error
      } else {
        setCurrentStatus(data.updatedStatus || newStatus); // ✅ only update on success
        localStorage.setItem("agentStatus", data.updatedStatus || newStatus);
        toast.success(data.message || "Status updated");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     COLOR LOGIC
  ==========================*/
  const statusColor =
    currentStatus === "ACTIVE"
      ? "bg-green-600 hover:bg-green-700"
      : "bg-red-600 hover:bg-red-700";

  return (
    <div className="relative">
      {/* STATUS BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className={`text-white cursor-pointer px-4 py-2 rounded-md text-sm transition ${statusColor}`}
      >
        {loading ? "Updating..." : currentStatus}
      </button>

      {/* DROPDOWN */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-60 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50"
          id="UserStatusDropdown"
        >
          {STATUS_OPTIONS.map((s) => {
            const isActive = s.value === currentStatus;

            return (
              <button
                key={s.value}
                disabled={isActive || loading} // disable while loading
                onClick={() => handleStatusChange(s.value)}
                className={`w-full text-left px-4 py-2 text-sm transition
                  ${
                    isActive
                      ? "bg-gray-700 cursor-not-allowed text-gray-400"
                      : "hover:bg-gray-700"
                  }`}
              >
                {s.label}
                {isActive && " ✓"}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
