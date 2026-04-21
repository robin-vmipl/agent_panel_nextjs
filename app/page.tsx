"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace("/dashboard");
      } else {
        window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/login`;
      }
    }
  }, [user, isLoading, router]);

  return null;
}
