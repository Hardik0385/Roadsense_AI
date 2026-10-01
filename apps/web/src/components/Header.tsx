"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Search, 
  MapPin, 
  CarFront, 
  AlertTriangle, 
  LayoutDashboard, 
  Compass, 
  Layers, 
  X, 
  ArrowRight,
  Bot,
  Zap,
  Construction,
  OctagonAlert,
  Truck,
  Siren,
  Route,
  Activity
} from 'lucide-react';
import { getLiveIncidents, TrafficIncident } from '@/utils/trafficApi';

const CITIES = [
  'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 
  'Pune', 'Hyderabad', 'Kolkata', 'Ahmedabad', 
  'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 
  'Nagpur', 'Indore', 'Patna', 'Bhopal'
];

const QUICK_PAGES = [
  { name: 'Overview Dashboard', href: '/', icon: LayoutDashboard, desc: 'Executive KPIs & real-time telemetry charts' },
  { name: 'Road Intelligence Map', href: '/road-intelligence', icon: Compass, desc: 'Geospatial road stress map & layer controls' },
  { name: 'Fleet Telemetry & Vehicles', href: '/vehicles', icon: Truck, desc: '500 connected vehicle telemetry & Smartcar IoT' },
  { name: 'Incident Response Triage', href: '/incidents', icon: Siren, desc: 'Real-time disruptions & patrol triage' }
];

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<TrafficIncident[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch live fleet and TomTom incidents for instant universal search
  const loadSearchCache = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const [vehRes, incList] = await Promise.all([
        fetch(`${apiUrl}/api/v1/vehicles`).then(r => r.json()).catch(() => ({ data: [] })),
        getLiveIncidents().catch(() => [])
      ]);
      if (vehRes && Array.isArray(vehRes.data)) setVehicles(vehRes.data);
      if (Array.isArray(incList)) setIncidents(incList);
    } catch (e) {
      console.error('Failed to load search data cache', e);
    }
  };

  useEffect(() => {
    loadSearchCache();
  }, []);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(true);
        loadSearchCache();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const queryLower = searchQuery.toLowerCase().trim();

  // Matched Pages
  const matchedPages = useMemo(() => {
    return QUICK_PAGES.filter(p => 
      !queryLower || p.name.toLowerCase().includes(queryLower) || p.desc.toLowerCase().includes(queryLower)
    );
  }, [queryLower]);

  // Matched Cities
  const matchedCities = useMemo(() => {
    return CITIES.filter(city => 
      queryLower && city.toLowerCase().includes(queryLower)
    );
  }, [queryLower]);

  // Matched Vehicles
  const matchedVehicles = useMemo(() => {
    if (!queryLower) return [];
    return vehicles.filter(v => 
      v.id.toLowerCase().includes(queryLower) ||
      v.driver.toLowerCase().includes(queryLower) ||
      v.model.toLowerCase().includes(queryLower) ||
      v.city.toLowerCase().includes(queryLower)
    ).slice(0, 6);
  }, [queryLower, vehicles]);

  // Matched Incidents / Corridors
  const matchedIncidents = useMemo(() => {
    if (!queryLower) return [];
    return incidents.filter(inc => 
      inc.id.toLowerCase().includes(queryLower) ||
      inc.roadName.toLowerCase().includes(queryLower) ||
      inc.type.toLowerCase().includes(queryLower) ||
      inc.city.toLowerCase().includes(queryLower)
    ).slice(0, 6);
  }, [queryLower, incidents]);

  const handleSelectPage = (href: string) => {
    router.push(href);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleSelectCity = (city: string) => {
    router.push(`/vehicles?city=${encodeURIComponent(city)}`);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleSelectVehicle = (vehicleId: string) => {
    router.push(`/vehicles?inspect=${encodeURIComponent(vehicleId)}`);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleSelectIncident = (incidentId: string) => {
    router.push(`/incidents?inspect=${encodeURIComponent(incidentId)}`);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleKeyDownInput = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (matchedVehicles.length > 0) {
        handleSelectVehicle(matchedVehicles[0].id);
      } else if (matchedIncidents.length > 0) {
        handleSelectIncident(matchedIncidents[0].id);
      } else if (matchedCities.length > 0) {
        handleSelectCity(matchedCities[0]);
      } else if (matchedPages.length > 0) {
        handleSelectPage(matchedPages[0].href);
      } else {
        router.push(`/vehicles?search=${encodeURIComponent(searchQuery)}`);
        setIsOpen(false);
      }
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-xl relative z-[9999] shadow-lg shadow-slate-200/40 shrink-0">
      
      {/* Global Universal Search Bar */}
      <div ref={searchRef} className="relative w-full max-w-lg">
        <div 
          onClick={() => {
            setIsOpen(true);
            loadSearchCache();
          }}
          className={`flex items-center bg-slate-100/90 border rounded-xl px-3.5 py-2 transition-all cursor-text ${
            isOpen ? 'border-slate-900 ring-2 ring-slate-900/10 bg-white shadow-lg' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-100'
          }`}
        >
          <Search size={16} className="text-slate-400 mr-2.5 shrink-0" />
          <input 
            type="text" 
            placeholder="Search vehicles, drivers, road corridors, cities, incidents..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              setIsOpen(true);
              loadSearchCache();
            }}
            onKeyDown={handleKeyDownInput}
            className="bg-transparent border-none outline-none text-sm w-full text-slate-800 placeholder-slate-400" 
          />
          {searchQuery && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery('');
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5 mr-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown Spotlight */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-full bg-white/98 backdrop-blur-2xl border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden z-[10000] divide-y divide-slate-100 max-h-[520px] overflow-y-auto scrollbar-thin animate-in fade-in zoom-in-95 duration-100">
            
            {/* Matched Live Vehicles */}
            {matchedVehicles.length > 0 && (
              <div className="p-2">
                <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider px-3 py-1.5 flex items-center justify-between">
                  <span>Connected Fleet Units</span>
                  <span className="text-slate-400 font-normal">Tap to inspect telemetry</span>
                </div>
                <div className="space-y-1">
                  {matchedVehicles.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleSelectVehicle(v.id)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-slate-700 hover:bg-slate-100/90 hover:text-slate-900 transition-all group text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center shrink-0">
                          <Truck size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900">{v.id}</span>
                            <span className="text-slate-800 font-medium truncate">{v.driver}</span>
                          </div>
                          <div className="text-slate-400 text-[11px] truncate">{v.model} • {v.city} Hub</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          v.status === 'CRITICAL' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                          v.status === 'WARNING' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                          'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        }`}>
                          {v.speed} km/h • {v.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Live Incidents & Corridors */}
            {matchedIncidents.length > 0 && (
              <div className="p-2">
                <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider px-3 py-1.5 flex items-center justify-between">
                  <span>Live Corridors & Road Disruptions</span>
                  <span className="text-slate-400 font-normal">Tap to open triage details</span>
                </div>
                <div className="space-y-1">
                  {matchedIncidents.map((inc) => (
                    <button
                      key={inc.id}
                      onClick={() => handleSelectIncident(inc.id)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-slate-700 hover:bg-slate-100/90 hover:text-slate-900 transition-all group text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                          {inc.category === 'ROADWORKS' ? <Construction size={13} /> : inc.category === 'CLOSURE' ? <OctagonAlert size={13} /> : inc.category === 'ACCIDENT' ? <CarFront size={13} /> : <Route size={13} />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-rose-600">{inc.id}</span>
                            <span className="text-slate-800 font-medium truncate">{inc.roadName}</span>
                          </div>
                          <div className="text-slate-400 text-[11px] truncate">{inc.type} • {inc.city} Hub</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold text-[10px]">+{inc.delayMinutes}m delay</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Cities */}
            {matchedCities.length > 0 && (
              <div className="p-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                  16-City Metro Telemetry Hubs
                </div>
                <div className="grid grid-cols-2 gap-1 px-1">
                  {matchedCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleSelectCity(city)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-left"
                    >
                      <MapPin size={13} className="text-rose-500 shrink-0" />
                      <span className="font-medium">{city} Hub Telemetry</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Navigation Pages */}
            <div className="p-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                Pages & Workspaces
              </div>
              <div className="space-y-1">
                {matchedPages.map((page) => {
                  const Icon = page.icon;
                  return (
                    <button
                      key={page.href}
                      onClick={() => handleSelectPage(page.href)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors group text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
                          <Icon size={14} />
                        </div>
                        <div>
                          <span className="font-medium text-slate-800">{page.name}</span>
                          <div className="text-[11px] text-slate-400">{page.desc}</div>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* No matches fallback */}
            {queryLower && matchedPages.length === 0 && matchedCities.length === 0 && matchedVehicles.length === 0 && matchedIncidents.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400">
                No direct matches for "{searchQuery}". Press Enter to search live vehicles across India.
              </div>
            )}

            {/* Spotlight Footer */}
            <div className="p-3 bg-slate-50 px-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
              <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600 font-mono text-[10px] shadow-xs">Esc</kbd> to exit</span>
              <span className="flex items-center gap-1 text-slate-800 font-semibold">
                <Zap size={12} className="text-emerald-500" /> Universal RoadSense Spotlight
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Right Header Badges */}
      <div className="flex items-center space-x-4">
        <button className="p-2 relative text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
        </button>
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-emerald-400 border border-slate-800 shadow-2xs">
            HA
          </div>
          <div className="hidden sm:block text-left text-xs">
            <div className="font-semibold text-slate-800">Hardik Agrawal</div>
            <div className="text-[10px] text-slate-400">Fleet Operations Lead</div>
          </div>
        </div>
      </div>
    </header>
  );
}
