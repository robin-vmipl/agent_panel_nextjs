"use client";

import { X } from "lucide-react";

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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#1A1B16] text-white rounded-xl border border-white/10 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">My Ingroups</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3 max-h-87.5 overflow-y-auto">
          {ingroups.length === 0 ? (
            <p className="text-gray-400 text-sm">No record found!</p>
          ) : (
            ingroups.map((group, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-[#11120D] px-4 py-3 rounded-lg border border-white/10"
              >
                <p className="font-medium">{group}</p>

                <span
                  className={`text-xs px-3 py-1 rounded-full
                    ${
                      status === "ACTIVE"
                        ? "bg-green-600/20 text-green-400"
                        : "bg-red-600/20 text-red-400"
                    }`}
                >
                  {status}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md bg-[#6B6A5A] hover:bg-[#7A7968]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
