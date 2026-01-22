// utils/useAgentStatus.ts
"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { apiFetch } from "@/app/lib/api";

export function useAgentStatus() {
  const pathname = usePathname();

  useEffect(() => {
    const updateStatus = async () => {
      try {
        if (pathname.includes("/ctc")) {
          await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/ctc-visit`, {
            isCtcPage: true,
            showToast: false,
          });
        } else if (pathname === "/dashboard" || pathname === "/") {
          await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard-visit`);
        }
      } catch (error) {
        console.log("Status update failed:", error);
      }
    };

    updateStatus();
  }, [pathname]);
}
