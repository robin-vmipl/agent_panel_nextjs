import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { AuthProvider } from "@/app/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agent Panel",
  description: "Agent Panel Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* 🌗 THEME INIT — runs before React & before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var theme = localStorage.getItem("theme") || "dark";
                  document.documentElement.setAttribute("data-theme", theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: {
              background: "#020617",
              color: "#f8fafc",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          }}
        />

        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
