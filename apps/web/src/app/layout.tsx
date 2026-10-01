import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "RoadSense AI — Connected Road Intelligence & Fleet Telemetry",
  description: "Real-time AI-powered road intelligence, smart traffic routing, and connected fleet telemetry across India.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/roadsense_logo_transparent.png', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: '/roadsense_logo_transparent.png',
  },
};

import AppShell from "@/components/AppShell";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800 selection:bg-emerald-500 selection:text-white relative overflow-hidden">
        {/* Soothing Ambient Green & Red / Rose Atmospheric Gradient Glow Orbs */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Emerald / Green Glow on Top-Left */}
          <div className="absolute -top-[12%] -left-[8%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-emerald-400/20 via-teal-300/15 to-transparent blur-3xl" />
          
          {/* Rose / Red Glow on Center-Right */}
          <div className="absolute top-[25%] -right-[12%] w-[58vw] h-[58vw] rounded-full bg-gradient-to-bl from-rose-500/18 via-red-400/12 to-transparent blur-3xl" />
          
          {/* Balanced Emerald-Ruby Aurora Glow at the Bottom */}
          <div className="absolute -bottom-[18%] left-[15%] w-[65vw] h-[55vw] rounded-full bg-gradient-to-tr from-emerald-500/15 via-teal-200/10 to-rose-400/15 blur-3xl" />
          
          {/* Subtle noise / mesh grid overlay for premium texture */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4)_0%,transparent_100%)] opacity-70" />
        </div>

        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
