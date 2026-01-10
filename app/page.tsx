"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has auth cookie (via API call)
    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
          credentials: "include",
        });
        if (res.ok) {
          router.replace("/dashboard");
        } else {
          router.replace("/login");
        }
      } catch (e) {
        router.replace("/login");
      }
    };
    checkAuth();
  }, [router]);

  return null;
}
