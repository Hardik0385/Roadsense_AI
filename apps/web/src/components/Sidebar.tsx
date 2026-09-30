"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Siren, Compass, CarFront, Radar, RadioTower } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'Road Intelligence', href: '/road-intelligence', icon: Compass },
    { name: 'Vehicles', href: '/vehicles', icon: CarFront },
    { name: 'Incidents', href: '/incidents', icon: Siren },
  ];

  return (
    <aside className="w-64 h-full rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-xl flex flex-col shadow-lg shadow-slate-200/40 z-20 shrink-0 overflow-hidden">
      {/* Brand Header - Clickable Link to Home, Non-selectable, Transparent Circular Emblem */}
      <Link
        href="/"
        className="h-16 flex items-center px-4 border-b border-slate-200/70 bg-gradient-to-r from-slate-50/50 via-white/50 to-slate-50/30 shrink-0 select-none cursor-pointer hover:bg-slate-50/80 transition-colors group"
      >
        <div className="w-12 h-12 rounded-full overflow-hidden mr-3 shadow-md shadow-slate-900/20 shrink-0 border border-slate-800/80 bg-transparent flex items-center justify-center">
          <img
            src="/roadsense_logo.jpg"
            alt="RoadSense AI Logo"
            draggable={false}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-none"
          />
        </div>
        <div className="min-w-0 flex items-center gap-1.5 select-none">
          <h1 className="text-base font-extrabold tracking-tight text-slate-900 whitespace-nowrap group-hover:text-slate-700 transition-colors">
            RoadSense
          </h1>
          <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-md font-mono shadow-2xs">
            AI
          </span>
        </div>
      </Link>

      <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3.5 py-2.5 text-sm rounded-xl font-medium transition-all ${isActive
                ? 'bg-slate-900 text-white font-semibold shadow-md shadow-slate-900/15'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
            >
              <Icon size={18} className={`mr-3 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Hub Grounding Telemetry Badge */}
      <div className="p-3 m-3 rounded-2xl bg-slate-50/90 border border-slate-200/90 text-xs shadow-2xs shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
            <RadioTower size={13} className="text-emerald-600" />
            Live Network Stream
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </span>
        </div>
        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
          16 Indian Hubs · 500 Fleet Units · TomTom Live
        </p>
      </div>
    </aside>
  );
}
