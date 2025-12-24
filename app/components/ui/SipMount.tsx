"use client";

import { useEffect } from "react";

export default function SipMount() {
  useEffect(() => {
    const timer = setTimeout(() => {
      const script = document.createElement("script");
      script.src = "/sip/demo-1.js";
      script.defer = true;
      document.body.appendChild(script);

      // Cleanup
      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  return null; // no visible UI
}
