"use client";

import { useEffect } from "react";

export default function SipMount() {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Remove existing SIP scripts
      document
        .querySelectorAll('script[src*="/sip/demo-1"]')
        .forEach((script) => {
          script.remove();
        });

      // Load dashboard SIP
      const script = document.createElement("script");
      script.src = "/sip/demo-1.js";
      script.defer = true;
      script.id = "sip-dashboard";
      document.body.appendChild(script);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
