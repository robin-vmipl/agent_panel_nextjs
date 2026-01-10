"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

let offlineToastShown = false;

export function useOffline() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const onOffline = () => {
      setIsOffline(true);

      if (!offlineToastShown) {
        toast.error("You are offline", {
          id: "offline-toast",
          icon: "📡",
        });
        offlineToastShown = true;
      }
    };

    const onOnline = () => {
      setIsOffline(false);
      offlineToastShown = false;

      toast.success("Back online", {
        id: "online-toast",
        icon: "✅",
      });
    };

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);

    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return { isOffline };
}
