import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Agent Portal",
  description:
    "Your agent dashboard — view stats, assigned campaigns, and call controls.",
};

export default function DashboardServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
