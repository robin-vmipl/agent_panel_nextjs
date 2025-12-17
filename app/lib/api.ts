export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  // ❌ Unauthorized → force logout
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  // ❌ Any other API error
  if (!res.ok) {
    throw new Error(data?.message || "Something went wrong");
  }

  // ✅ Success
  return data;
}
