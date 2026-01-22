"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useModalContext } from "@/app/contexts/ModalContext";

interface Props {
  open: boolean;
  onClose: () => void;
  ingroups: string[];
  status: string;
}

export default function MyIngroupsModal({
  open,
  onClose,
  ingroups,
  status,
}: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { closeModal } = useModalContext();

  // 🔹 Click outside handler
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
        closeModal("myIngroupsModal");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose, closeModal]);

  if (!open) return null;

  return (
    <div
      ref={modalRef}
      onClick={(e) => e.stopPropagation()}
      className="modal-dropdown absolute right-0 top-full mt-3 w-80 bg-linear-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-3xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-slate-900/50 z-100 animate-in slide-in-from-top-2 duration-200 overflow-hidden max-h-[80vh]"
    >
      {/*   DROPDOWN GLOW */}
      <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 via-transparent to-blue-500/5 rounded-2xl blur-xl animate-pulse -z-10 pointer-events-none" />

      {/*   HEADER */}
      <div className="relative z-10 p-4 border-b border-slate-700/30 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-black text-slate-300">My InGroups</h2>
          <p className="text-xs text-slate-500 font-medium tracking-wide">
            Active groups ({ingroups.length})
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/70 border border-slate-700/50 hover:border-slate-600/50 text-slate-400 hover:text-slate-200 transition-all duration-200 hover:scale-105 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/*   CONTENT - SCROLLABLE - FIXED HEIGHT */}
      <div className="relative z-20 max-h-100 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600/50 scrollbar-track-slate-900/20 p-4 space-y-3">
        {ingroups.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 mx-auto mb-4 bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-600/50 flex items-center justify-center shadow-md">
              <svg
                className="w-6 h-6 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-300 mb-1">
              No Groups
            </h3>
            <p className="text-sm text-slate-500">No ingroups assigned yet</p>
          </div>
        ) : (
          ingroups.map((group, index) => (
            <div
              key={index}
              className="group relative 
                  bg-linear-to-r from-emerald-500/15 to-blue-500/15      
                  backdrop-blur-xl 
                  hover:from-slate-400/60 hover:to-slate-400/60           
                  border border-emerald-500/40 
                  hover:border-slate-700/50 
                  p-4 rounded-xl shadow-lg 
                  hover:shadow-slate-900/30 
                  hover:-translate-y-0.5 
                  transition-all duration-300 
                  cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-r from-emerald-400/0 via-white/10 to-transparent opacity-0 group-hover:opacity-100 rounded-xl -skew-x-12 -translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-300 truncate max-w-55">
                    {group}
                  </h4>
                  <p className="text-xs text-slate-600 uppercase tracking-wider font-medium">
                    Group #{index + 1}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-md ${
                    status === "ACTIVE"
                      ? "bg-linear-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/25"
                      : "bg-linear-to-r from-rose-500/20 to-pink-500/20 text-rose-400 border border-rose-500/40 shadow-rose-500/25"
                  }`}
                >
                  {status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/*   FOOTER */}
      <div className="relative z-20 p-4 border-t border-slate-700/30">
        <button
          onClick={onClose}
          className="w-full h-12 px-6 rounded-2xl bg-linear-to-r from-slate-800/80 to-slate-900/80 hover:from-slate-700/80 hover:to-slate-800/80 border border-slate-600/50 hover:border-slate-500/70 text-slate-300 hover:text-white font-semibold shadow-lg hover:shadow-slate-500/30 hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
}
