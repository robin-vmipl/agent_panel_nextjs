// lib/sipControls.ts
export const sipConnect = () => {
  console.log("📞 SIP: Connecting...");
  const connectBtn = document.getElementById(
    "connect"
  ) as HTMLButtonElement | null;
  if (connectBtn && !connectBtn.disabled) {
    connectBtn.click();
  }
};

export const sipDisconnect = () => {
  console.log("📴 SIP: Disconnecting...");
  const disconnectBtn = document.getElementById(
    "disconnect"
  ) as HTMLButtonElement | null;
  if (disconnectBtn && !disconnectBtn.disabled) {
    disconnectBtn.click();
  }
};
