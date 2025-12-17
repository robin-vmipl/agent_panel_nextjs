"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "../lib/auth";

const menuItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "My Performance", href: "/performance" },
  { name: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-[#043222] text-white flex flex-col">
      {/* Header */}
      <div className="p-6 text-2xl font-bold border-b border-white/10">
        Agent Panel
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-3 my-1 rounded-md text-center transition-all ${
              pathname === item.href ? "bg-[#11120D]" : "hover:bg-[#6B6A5A]/70"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <button
        onClick={logoutUser} // ✅ Use centralized logout
        className="mt-auto m-4 bg-[#11120D] hover:bg-[#6B6A5A] py-2 rounded-md transition"
      >
        Logout
      </button>
    </aside>
  );
}
