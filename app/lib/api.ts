"use client";

import toast from "react-hot-toast";

interface ApiFetchOptions extends RequestInit {
  skipLogoutOn401?: boolean;
  showToast?: boolean;
  isCtcPage?: boolean;
}

let isHandlingLogout = false;

export async function apiFetch(url: string, options: ApiFetchOptions = {}) {
  const {
    skipLogoutOn401 = false,
    showToast = true,
    isCtcPage = false,
    ...fetchOptions
  } = options;

  const shouldShowToast = showToast && !isCtcPage;

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
    if (error?.name === "AbortError") throw error;

    if (shouldShowToast) toast.error("Unable to reach server.");
    throw new Error("Network error");
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {}

  if (res.status === 401) {
    if (!skipLogoutOn401 && !isHandlingLogout) {
      isHandlingLogout = true;

      if (shouldShowToast) toast.error("Session expired. Please login again.");

      document.cookie = "nextjs_auth_token=; path=/; max-age=0; SameSite=Lax";

      setTimeout(() => {
        window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/login`;
      }, 500);
    }

    throw new Error("Session expired");
  }

  if (!res.ok) {
    const message = data?.message || data?.error || "Something went wrong";
    if (shouldShowToast) toast.error(message);
    throw new Error(message);
  }

  return data;
}