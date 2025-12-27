// lib/sipBridge.ts

export const sipConnect = () => {
  const btn = document.getElementById("connect") as HTMLButtonElement | null;

  if (!btn) {
    console.warn("❌ SIP connect button not found");
    return;
  }

  if (!btn.disabled) {
    console.log("📞 SIP connecting...");
    btn.click();
  }
};

export const sipDisconnect = () => {
  const btn = document.getElementById("disconnect") as HTMLButtonElement | null;

  if (!btn) {
    console.warn("❌ SIP disconnect button not found");
    return;
  }

  if (!btn.disabled) {
    console.log("📴 SIP disconnecting...");
    btn.click();
  }
};
