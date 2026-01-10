import { apiFetch } from "./api";

export const logoutUser = async () => {
  try {
    await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/nextjs/logout`, {
      method: "POST",
    });
  } catch (e) {
    // ignore - still force client logout
  }

  try {
    window.dispatchEvent(new Event("nextjs:logout"));
  } catch (e) {
    window.location.href = "/login";
  }
};
