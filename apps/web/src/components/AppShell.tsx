"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import FloatingAiAssistant from "@/components/FloatingAiAssistant";
import { getSessionUser } from '@/utils/auth';
import { ShieldCheck, Lock } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';

  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const user = getSessionUser();
    const hasAuth = !!user;
    setIsAuthenticated(hasAuth);
    setIsLoading(false);

    if (!hasAuth && !isLoginPage) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (hasAuth && isLoginPage) {
      router.replace('/');
    }

    const handleAuthChange = () => {
      const activeUser = getSessionUser();
      const authed = !!activeUser;
      setIsAuthenticated(authed);
      if (!authed && window.location.pathname !== '/login') {
        router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      }
    };

    window.addEventListener('roadsense_auth_changed', handleAuthChange);
    return () => window.removeEventListener('roadsense_auth_changed', handleAuthChange);
  }, [pathname, isLoginPage, router]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 mb-3 shadow-xl animate-pulse">
          <ShieldCheck size={24} />
        </div>
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-xs text-slate-400 font-medium">Verifying RoadSense Security Token...</p>
      </div>
    );
  }

  // If on login page, render full screen auth card
  if (isLoginPage) {
    return <main className="min-h-screen w-full relative z-10">{children}</main>;
  }

  // If user is not authenticated on protected pages, block rendering and show redirecting prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3 shadow-xl animate-bounce">
          <Lock size={22} />
        </div>
        <h2 className="text-sm font-bold text-white mb-1">Access Restricted</h2>
        <p className="text-xs text-slate-400 font-medium mb-3">Please sign in to access the RoadSense Operations Console.</p>
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Authenticated Console Shell
  return (
    <>
      {/* Floating App Cockpit Shell with breathing margins */}
      <div className="flex h-screen w-full p-3.5 gap-3.5 relative z-10 box-border overflow-hidden bg-slate-950/5">
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
