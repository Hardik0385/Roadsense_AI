"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import FloatingAiAssistant from "@/components/FloatingAiAssistant";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <main className="min-h-screen w-full relative z-10">{children}</main>;
  }

  return (
    <>
      {/* Floating App Cockpit Shell with breathing margins */}
      <div className="flex h-screen w-full p-3.5 gap-3.5 relative z-10 box-border overflow-hidden">
        {/* Floating Sidebar */}
        <Sidebar />

        {/* Floating Main Content Area with Floating Top Bar */}
        <div className="flex-1 flex flex-col min-w-0 h-full gap-3.5 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto rounded-3xl bg-white/95 border border-slate-200/80 shadow-md shadow-slate-200/30">
            {children}
          </main>
        </div>
      </div>
      <FloatingAiAssistant />
    </>
  );
}
