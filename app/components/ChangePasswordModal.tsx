"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const user = localStorage.getItem("user");
    if (!user) {
      toast.error("Session expired. Please login again.");
      return;
    }

    const { user: agentId } = JSON.parse(user);

    setLoading(true);
    try {
      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agent/update-password/${agentId}`,
        {
          method: "POST",
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
            new_password_confirmation: confirmPassword,
          }),
        }
      );

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message || "Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#11120D] p-8 rounded-xl w-150 max-w-full space-y-6">
        <h2 className="text-2xl font-semibold">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-4 rounded bg-[#254B33] text-white outline-none"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-4 rounded bg-[#254B33] text-white outline-none"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-4 rounded bg-[#254B33] text-white outline-none"
          />

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded bg-gray-600 hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
