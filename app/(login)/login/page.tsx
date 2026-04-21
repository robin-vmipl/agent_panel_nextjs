"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser, isAuthenticated } = useAuth();

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/agent";

  // ✅ Already authenticated → go dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  // ✅ SSO token handler
  useEffect(() => {
    const token = searchParams.get("token");

    const handleSSO = async () => {
      // ❌ No token means user came directly → redirect to Laravel login
      if (!token) {
        try {
          // optional cleanup logout (silent)
          await fetch(`${API_URL}/logout`, {
            method: "POST",
            credentials: "include",
          });
        } catch {}

        // clear cookie just in case
        document.cookie = "nextjs_auth_token=; path=/; max-age=0; SameSite=Lax";

        window.location.href = `${BACKEND_URL}/login`;
        return;
      }

      try {
        // Laravel validates token + sets nextjs_auth_token cookie
        const res = await fetch(
          `${API_URL}/me?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (!res.ok) {
          window.location.href = `${BACKEND_URL}/login`;
          return;
        }

        await refreshUser();

        // remove token from URL
        window.history.replaceState({}, "", "/login");

        router.replace("/dashboard");
      } catch {
        window.location.href = `${BACKEND_URL}/login`;
      }
    };

    handleSSO();
  }, [searchParams, refreshUser, router, API_URL, BACKEND_URL]);

  // ✅ Always loader (no login UI)
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b151d]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
    </div>
  );
}
