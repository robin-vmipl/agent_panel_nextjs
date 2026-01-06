"use client";

import { useEffect } from "react";

export default function SipMountCTC() {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Remove existing SIP scripts
      document
        .querySelectorAll('script[src*="/sip/demo-1"]')
        .forEach((script) => {
          script.remove();
        });

      // Load CTC SIP
      const script = document.createElement("script");
      script.src = "/sip/demo-1-ctc.js";
      script.defer = true;
      script.id = "sip-ctc";
      document.body.appendChild(script);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
