import { apiFetch } from "./api";

export async function logoutUser() {
  try {
    await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, { method: "POST" });
  } catch (err) {
    console.error("Logout failed", err);
  } finally {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
}
