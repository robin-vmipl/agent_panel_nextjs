"use client";

import toast from "react-hot-toast";

interface ApiFetchOptions extends RequestInit {
  /**
   * If true, don't trigger logout on 401.
   * Used for /me auth checks where 401 is expected.
   */
  skipLogoutOn401?: boolean;

  /**
   * If false, suppress toast errors (useful for silent polling)
   */
  showToast?: boolean;
}

let isHandlingLogout = false;

export async function apiFetch(
  url: string,
  options: ApiFetchOptions = {}
) {
  const {
    skipLogoutOn401 = false,
    showToast = true,
    ...fetchOptions
  } = options;

  /* 🌐 OFFLINE DETECTION */
  if (typeof window !== "undefined" && !navigator.onLine) {
    if (showToast) {
      toast.error("You are offline. Please check your internet connection.");
    }
    throw new Error("Offline");
  }

  let res: Response;

  try {
    res = await fetch(url, {
      ...fetchOptions,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });
  } catch (error) {
    if (showToast) {
      toast.error("Unable to reach server. Please try again.");
    }
    throw new Error("Network error");
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* ignore JSON parse errors */
  }

  /* 🔐 UNAUTHORIZED */
  if (res.status === 401) {
    if (!skipLogoutOn401 && !isHandlingLogout) {
      isHandlingLogout = true;

      if (showToast) {
        toast.error("Session expired. Please login again.");
      }

      try {
        window.dispatchEvent(new Event("nextjs:logout"));
      } finally {
        setTimeout(() => {
          window.location.href = "/login";
        }, 800);
      }
    }

    throw new Error("Session expired");
  }

  /* ❌ OTHER API ERRORS */
  if (!res.ok) {
    const message =
      data?.message || data?.error || "Something went wrong";

    if (showToast) {
      toast.error(message);
    }

    throw new Error(message);
  }

  /* ✅ SUCCESS */
  return data;
}
