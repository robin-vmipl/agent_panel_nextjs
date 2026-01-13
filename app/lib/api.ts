"use client";

import toast from "react-hot-toast";

interface ApiFetchOptions extends RequestInit {
  /**
   * If true, don't trigger logout on 401.
   * Used for /me auth checks where 401 is expected.
   */
  skipLogoutOn401?: boolean;

  /**
   * If false, suppress toast errors (CTC page, silent polling)
   * If true, show toasts (Dashboard, user actions)
   */
  showToast?: boolean;

  /**
   * NEW: CTC page - Never show toasts
   */
  isCtcPage?: boolean;
}

let isHandlingLogout = false;

export async function apiFetch(
  url: string,
  options: ApiFetchOptions = {}
) {
  const {
    skipLogoutOn401 = false,
    showToast = true,
    isCtcPage = false, // 🔥 NEW: CTC SILENT MODE
    ...fetchOptions
  } = options;

  // 🔥 SMART TOAST LOGIC
  const shouldShowToast = showToast && !isCtcPage;

  /* 🌐 OFFLINE DETECTION */
  if (typeof window !== "undefined" && !navigator.onLine) {
    if (shouldShowToast) {
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
  } catch (error: any) {
  // 🔕 Ignore fetch aborts (route change, logout, RSC reload)
      if (error?.name === "AbortError") {
        throw error;
      }

      if (shouldShowToast) {
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

      if (shouldShowToast) {
        toast.error("Session expired. Please login again.");
      }

      try {
        window.dispatchEvent(new Event("nextjs:logout"));
      } finally {
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/login"
        ) {
          setTimeout(() => {
            window.location.href = "/login";
          }, 800);
        }
      }
    }

    throw new Error("Session expired");
  }

  /*  API ERRORS (400, 422, 500, etc.) */
  if (!res.ok) {
    const message = data?.message || data?.error || "Something went wrong";

    // 🔥 NO TOASTS - Let caller handle (CTC UI, Dashboard lists)
    if (shouldShowToast) {
      toast.error(message);
    }

    throw new Error(message);
  }

  /* ✅ SUCCESS */
  return data;
}
