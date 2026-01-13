import { apiFetch } from "./api";
import toast from "react-hot-toast";

let didLogout = false;

export const logoutUser = async () => {
  if (didLogout) return;
  didLogout = true;

  try {
    await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/nextjs/logout`, {
      method: "POST",
      skipLogoutOn401: true,
      showToast: false,
    });
  } catch {}

  window.dispatchEvent(new Event("nextjs:logout"));
  toast.success("You have been logged out");

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

