"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import MyIngroupsModal from "./MyIngroupsModal";
import { apiFetch } from "../lib/api";

export default function MyIngroupsButton() {
  const [open, setOpen] = useState(false);
  const [ingroups, setIngroups] = useState<string[]>([]);
  const [status, setStatus] = useState("INACTIVE");

  const fetchIngoups = async () => {
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agent/my-ingroups`
      );

      if (data.status === "error") {
        toast.error(data.message || "Failed to fetch ingroups");
        return;
      }

      setIngroups(data.ingroups || []);
      setStatus(data.status || "INACTIVE");
      setOpen(true);
    } catch (err) {
      toast.error("Unable to fetch ingroups");
    }
  };

  return (
    <>
      <button
        onClick={fetchIngoups}
        className="px-4 py-2 text-sm rounded-md bg-[#6B6A5A] hover:bg-[#7A7968]"
      >
        My Ingroups
      </button>

      <MyIngroupsModal
        open={open}
        onClose={() => setOpen(false)}
        ingroups={ingroups}
        status={status}
      />
    </>
  );
}
