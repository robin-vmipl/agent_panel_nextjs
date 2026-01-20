import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — Agent Portal",
  description:
    "Sign in to the Agent Portal to access your dashboard and call tools.",
};

export default function LoginServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              try {
                document.documentElement.setAttribute("data-theme", "dark");
              } catch (e) {}
            })();
          `,
        }}
      />
      {children}
    </>
  );
}
