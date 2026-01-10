interface ApiFetchOptions extends RequestInit {
  /**
   * If true, don't trigger logout on 401.
   * Used for /me auth checks where 401 is expected when not logged in.
   */
  skipLogoutOn401?: boolean;
}

export async function apiFetch(url: string, options: ApiFetchOptions = {}) {
  const { skipLogoutOn401 = false, ...fetchOptions } = options;

  const res = await fetch(url, {
    ...fetchOptions,
    credentials: "include", // Include cookies in requests
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  // Unauthorized → clear cookie and force logout
  if (res.status === 401) {
    // Only trigger logout if this isn't an expected 401 (like /me check on login page)
    if (!skipLogoutOn401) {
      // Dispatch a global logout event so client state can be cleared centrally
      // Browser will clear the httpOnly cookie via Set-Cookie header from server
      try {
        window.dispatchEvent(new Event("nextjs:logout"));
      } catch (e) {
        // fallback
        window.location.href = "/login";
      }
    }
    throw new Error("Session expired");
  }

  // Any other API error
  if (!res.ok) {
    throw new Error(data?.message || "Something went wrong");
  }

  // ✅ Success
  return data;
}
