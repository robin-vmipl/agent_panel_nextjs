"use client";

import { apiFetch } from "./api";
import toast from "react-hot-toast";

let didLogout = false;

export async function logoutUser() {
  if (didLogout) return;
  didLogout = true;

  try {
    await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
      method: "POST",
      skipLogoutOn401: true,
      showToast: false,
    });
  } catch {}

  document.cookie = "nextjs_auth_token=; path=/; max-age=0; SameSite=Lax";

  toast.success("Logged out successfully");

  setTimeout(() => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/login`;
  }, 500);
}