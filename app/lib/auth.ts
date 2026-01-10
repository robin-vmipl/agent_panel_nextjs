import { apiFetch } from "./api";
import toast from "react-hot-toast";

export const logoutUser = async () => {
  try {
    // ✅ Clear server-side session
    await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/nextjs/logout`, {
      method: "POST",
      showToast: false, // suppress toast for smooth logout
    });
  } catch (e) {
    console.warn("Server logout failed, forcing client logout", e);
  }

  // ✅ Clear client-side state
  try {
    window.dispatchEvent(new Event("nextjs:logout"));
  } catch (e) {
    console.warn("Event dispatch failed, redirecting manually", e);
    window.location.href = "/login";
  } finally {
    toast.success("You have been logged out");
    window.location.href = "/login";
  }
};
