"use client";

import StatusDropdown from "./StatusDropdown";
import MyIngroupsButton from "./MyIngroupsButton";

export default function Navbar() {
  return (
    <header className="h-16 bg-[#2E4B30] text-white flex items-center justify-between px-6 border-b border-white/10">
      {/* Left */}
      <h1 className="text-lg font-semibold"></h1>

      {/* Right */}
      <div className="flex items-center gap-4">
        <StatusDropdown />
        <MyIngroupsButton />
      </div>
    </header>
  );
}
