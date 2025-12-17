"use client";

import { usePathname } from "next/navigation";
import StatusDropdown from "./StatusDropdown";
import MyIngroupsButton from "./MyIngroupsButton";
import { useEffect, useState } from "react";
import ChangePasswordModal from "./ChangePasswordModal";

export default function Navbar() {
  const pathname = usePathname();
  const [agentName, setAgentName] = useState<string>("");
  const [profilePic, setProfilePic] = useState<string>("");
  const [openPasswordModal, setOpenPasswordModal] = useState(false);

  const pageTitleMap: Record<string, string> = {
    "/dashboard": "Dashboard",
  };

  const dynamicTitle =
    pageTitleMap[pathname] ||
    pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") ||
    "Dashboard";

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      const parsed = JSON.parse(user);
      setAgentName(parsed.full_name || parsed.user); // Use proper name if available
      setProfilePic(parsed.profilePic || "");
    }
  }, []);

  return (
    <>
      <header className="h-16 bg-[#2E4B30] text-white flex items-center justify-between px-6 border-b border-white/10">
        <h1 className="text-lg font-semibold capitalize">{dynamicTitle}</h1>

        <div className="flex items-center gap-4">
          <StatusDropdown />
          <MyIngroupsButton />

          {/* Profile Badge */}
          <div
            className="flex items-center gap-2 bg-[#11120D] px-3 py-1 rounded-full cursor-pointer"
            onClick={() => setOpenPasswordModal(true)}
          >
            {profilePic ? (
              <img
                src={profilePic}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border-2 border-green-500"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white uppercase">
                {agentName[0]}
              </div>
            )}
            <span className="text-sm font-medium">{agentName}</span>
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={openPasswordModal}
        onClose={() => setOpenPasswordModal(false)}
      />
    </>
  );
}
