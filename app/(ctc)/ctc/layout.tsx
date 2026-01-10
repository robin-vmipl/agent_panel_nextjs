import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CTC — Agent Portal",
  description: "CTC tools and assigned campaigns for agents.",
};

export default function CTCServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
