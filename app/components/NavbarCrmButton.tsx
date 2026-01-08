"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/app/lib/api";
import { ExternalLink, Loader2 } from "lucide-react";

export default function NavbarCrmButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showButton, setShowButton] = useState(false);
  const sipCallActive = useRef(false);

  const encryptStringData = (data: string | null): string | null => {
    if (!data) return null;
    try {
      return btoa(unescape(encodeURIComponent(data)));
    } catch {
      return null;
    }
  };

  const openCrmPortal = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agent/call_details`
      );
      const { call_details } = data;

      if (call_details) {
        const userID = encryptStringData(call_details.user || null);
        const uniqueID = encryptStringData(
          call_details.external_update_fields_data || null
        );
        const mobileNumber = encryptStringData(
          (call_details.external_transferconf || "").slice(-10)
        );
        const url = `https://pmfby.gov.in/krph/?userID=${userID}&uniqueID=${uniqueID}&mobileNumber=${mobileNumber}`;
        window.open(url, "_blank");
      }
    } catch (err: any) {
      setError("No active call");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 SIP GLOBAL DATA CHECK (NO DOM PARSING!)
  useEffect(() => {
    const checkSipStatus = () => {
      const sipData = (window as any).SIP_CALL_DATA;

      // Active call = ringing OR answered
      const newSipCallActive = sipData?.callState === "answered";

      if (newSipCallActive !== sipCallActive.current) {
        setShowButton(newSipCallActive);
        sipCallActive.current = newSipCallActive;
        console.log("📞 SIP Status:", sipData?.callState || "NO CALL");
      }
    };

    const interval = setInterval(checkSipStatus, 500);
    return () => clearInterval(interval);
  }, []);

  // HIDE BUTTON - SHOW PLACEHOLDER
  if (!showButton) {
    return (
      <div className="w-30 h-10 rounded-2xl animate-pulse opacity-30" />
    );
  }

  return (
    <button
      onClick={openCrmPortal}
      disabled={loading}
      className="group relative overflow-hidden bg-linear-to-r from-emerald-500/90 to-blue-600/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-emerald-400/50 shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-400 flex items-center gap-2 text-white font-semibold text-sm cursor-pointer"
    >
      <div className="absolute inset-0 bg-linear-to-r from-white/30 via-white/50 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 -skew-x-12" />
      <div className="relative z-10 flex items-center gap-2">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <ExternalLink className="w-4 h-4" />
            Open CRM
          </>
        )}
      </div>
    </button>
  );
}
