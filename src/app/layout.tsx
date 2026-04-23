import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Web3Provider } from "@/providers/Web3Provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Base Guild Helper",
  description: "Complete Base Guild roles on-chain",
  other: {
    "base:app_id": "69e9db121eb4a1de6a95852a",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
        <Web3Provider>{children}</Web3Provider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#4ade80", secondary: "#000" } },
            error: { iconTheme: { primary: "#f87171", secondary: "#000" } },
          }}
        />
      </body>
    </html>
  );
}
