"use client";
import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/app/lib/api";

interface SipStatus {
  externalPark: string;
}

export function useSipStatus() {
  const [status, setStatus] = useState<SipStatus>({ externalPark: "" });

  const updateExternalPark = useCallback(
    async (flag: string) => {
      if (status.externalPark !== flag) {
        setStatus((prev) => ({ ...prev, externalPark: flag }));
        await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/update-park`, {
          method: "POST",
          body: JSON.stringify({ external_park: flag }),
          isCtcPage: true,
          showToast: false,
          skipLogoutOn401: true,
        });
      }
    },
    [status.externalPark],
  );

  useEffect(() => {
    const checkSipState = () => {
      const sipData = (window as any).SIP_CALL_DATA;
      if (!sipData?.callState) return;

      const ctcScript = Array.from(document.querySelectorAll("script")).some(
        (s: any) => s.src?.includes("demo-1-ctc"),
      );
      if (ctcScript) return;

      const callState = sipData.callState.toLowerCase();
      const flags = {
        answered: "P",
        ended: "S",
      };
      const flag = flags[callState as keyof typeof flags];

      if (flag) updateExternalPark(flag);
    };

    checkSipState();
    const interval = setInterval(checkSipState, 500);
    return () => clearInterval(interval);
  }, [updateExternalPark]);

  return status;
}
