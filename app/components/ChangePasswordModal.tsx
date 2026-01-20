"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../lib/api";
import { X, AlertCircle } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // VALIDATION FUNCTIONS
  const isCurrentPasswordValid = () => !!currentPassword.trim();
  const isStrongPassword = (password: string) => {
    if (!password || password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[!@#$%^&*]/.test(password)) return false;
    return true;
  };

  const getNewPasswordError = () => {
    if (!newPassword.trim()) return "New password is required";
    if (!isStrongPassword(newPassword))
      return "Password must be 8+ chars, 1 uppercase, 1 number, 1 special char";
    return "";
  };

  const getConfirmPasswordError = () => {
    if (!confirmPassword.trim()) return "Confirm password is required";
    if (newPassword !== confirmPassword) return "Passwords do not match";
    return "";
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // CURRENT PASSWORD REQUIRED CHECK
    if (!isCurrentPasswordValid()) {
      toast.error("Current password is required");
      return;
    }

    // STRONG PASSWORD CHECKS
    const newPassError = getNewPasswordError();
    if (newPassError) {
      toast.error(newPassError);
      return;
    }

    const confirmPassError = getConfirmPasswordError();
    if (confirmPassError) {
      toast.error(confirmPassError);
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
            current_password: currentPassword.trim(),
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
      // toast.error(err.message || "Failed to update password");
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentError = !isCurrentPasswordValid()
    ? "Current password is required"
    : "";
  const newError = getNewPasswordError();
  const confirmError = getConfirmPasswordError();

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 backdrop-blur-sm bg-black/20 z-40 lg:hidden" />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-300">
        <div className="modal-content bg-linear-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-2xl w-full max-w-md mx-auto rounded-3xl border border-slate-700/50 shadow-2xl shadow-slate-900/50 p-8 space-y-8 relative overflow-hidden animate-float pointer-events-auto">
          <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 via-transparent to-purple-500/5 rounded-3xl blur-xl animate-pulse pointer-events-none -z-10" />

          <div className="relative z-10 text-center">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12 bg-slate-900/90 hover:bg-slate-800/90 border-2 border-slate-600/50 rounded-3xl flex items-center justify-center shadow-2xl hover:shadow-slate-500/30 hover:scale-105 transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed z-60 group lg:hidden"
              title="Close"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300 group-hover:text-white transition-colors" />
            </button>

            <div className="flex flex-col items-center space-y-4 pt-12 relative z-10">
              <div className="w-20 h-20 mx-auto bg-linear-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl border-4 border-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                <svg
                  className="w-12 h-12 text-white drop-shadow-lg"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>

              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-300">
                  Change Password
                </h2>
                <p className="text-slate-400 text-sm mt-1 font-medium tracking-wide">
                  Secure your account with a new password
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleChangePassword}
            className="space-y-6 relative z-20"
          >
            {/* CURRENT PASSWORD */}
            <div className="relative group">
              <input
                type={showPassword.current ? "text" : "password"}
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`w-full h-14 px-5 py-3 rounded-2xl bg-white/5 backdrop-blur-sm border-2 text-white font-medium text-lg placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-300 group-hover:border-slate-600/70 relative z-30 peer ${
                  currentError
                    ? "border-rose-500/70 focus:border-rose-500/60 focus:ring-rose-500/20"
                    : "border-slate-700/50 focus:border-emerald-500/60 focus:ring-emerald-500/20"
                }`}
                required
              />
              <label className="absolute -top-3 left-3 px-2 text-xs font-bold bg-slate-900 text-emerald-400 shadow-sm z-40">
                Current Password
              </label>
              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => ({
                    ...prev,
                    current: !prev.current,
                  }))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-all p-1 hover:scale-110 z-40"
              >
                {showPassword.current ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                )}
              </button>
              {/* CURRENT PASSWORD ERROR */}
              {currentError && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {currentError}
                </p>
              )}
            </div>

            {/* NEW PASSWORD */}
            <div className="relative group">
              <input
                type={showPassword.new ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full h-14 px-5 py-3 rounded-2xl bg-white/5 backdrop-blur-sm border-2 text-white font-medium text-lg placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-300 group-hover:border-slate-600/70 relative z-30 peer ${
                  newError
                    ? "border-rose-500/70 focus:border-rose-500/60 focus:ring-rose-500/20"
                    : "border-slate-700/50 focus:border-emerald-500/60 focus:ring-emerald-500/20"
                }`}
                required
              />
              <label className="absolute -top-3 left-3 px-2 text-xs font-bold bg-slate-900 text-blue-400 shadow-sm z-40">
                New Password
              </label>
              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => ({ ...prev, new: !prev.new }))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-all p-1 hover:scale-110 z-40"
              >
                {showPassword.new ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                )}
              </button>
              {/* NEW PASSWORD ERROR */}
              {newError && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {newError}
                </p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="relative group">
              <input
                type={showPassword.confirm ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full h-14 px-5 py-3 rounded-2xl bg-white/5 backdrop-blur-sm border-2 text-white font-medium text-lg placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-300 group-hover:border-slate-600/70 relative z-30 peer ${
                  confirmError
                    ? "border-rose-500/70 focus:border-rose-500/60 focus:ring-rose-500/20"
                    : "border-slate-700/50 focus:border-emerald-500/60 focus:ring-emerald-500/20"
                }`}
                required
              />
              <label className="absolute -top-3 left-3 px-2 text-xs font-bold bg-slate-900 text-purple-400 shadow-sm z-40">
                Confirm Password
              </label>
              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => ({
                    ...prev,
                    confirm: !prev.confirm,
                  }))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-all p-1 hover:scale-110 z-40"
              >
                {showPassword.confirm ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                )}
              </button>
              {/* CONFIRM PASSWORD ERROR */}
              {confirmError && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {confirmError}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 relative z-20">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 h-14 px-6 rounded-2xl bg-linear-to-r from-slate-700/80 to-slate-800/80 hover:from-slate-600/80 hover:to-slate-700/80 border-2 border-slate-600/50 text-white font-bold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl shadow-lg backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-4 focus:ring-slate-500/30 relative z-30"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  loading || !!currentError || !!newError || !!confirmError
                }
                className="flex-1 h-14 px-6 rounded-2xl bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 border-2 border-emerald-500/60 text-white font-black text-lg uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl shadow-emerald-500/30 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-500/40 relative z-30"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Updating...
                  </span>
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
