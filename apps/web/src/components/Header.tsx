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
  Activity,
  LogOut,
  User,
  ShieldCheck,
  LogIn,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { getLiveIncidents, TrafficIncident } from '@/utils/trafficApi';
import { getSessionUser, updateSessionUser, clearSessionUser, UserProfile } from '@/utils/auth';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  clearAllNotifications, 
  RoadSenseNotification 
} from '@/utils/notifications';

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
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Notification Center States
  const [notifications, setNotifications] = useState<RoadSenseNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Profile Editor Modal States
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editDept, setEditDept] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<TrafficIncident[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentUser(getSessionUser());
    setNotifications(getNotifications());

    const handleAuthChange = () => {
      setCurrentUser(getSessionUser());
    };

    const handleNotifsChange = () => {
      setNotifications(getNotifications());
    };

    window.addEventListener('roadsense_auth_changed', handleAuthChange);
    window.addEventListener('roadsense_notifications_updated', handleNotifsChange);

    return () => {
      window.removeEventListener('roadsense_auth_changed', handleAuthChange);
      window.removeEventListener('roadsense_notifications_updated', handleNotifsChange);
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleOpenEditProfile = () => {
    if (currentUser) {
      setEditName(currentUser.name || '');
      setEditRole(currentUser.role || 'Fleet Operations Lead');
      setEditDept(currentUser.department || 'National Command Center');
    }
    setIsUserMenuOpen(false);
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    const updated = updateSessionUser({
      name: editName.trim(),
      role: editRole.trim() || 'Operations Officer',
      department: editDept.trim() || 'Indian Corridor Logistics'
    });
    if (updated) {
      setCurrentUser(updated);
    }
    setIsEditProfileOpen(false);
  };

  const handleLogout = () => {
    clearSessionUser();
    setIsUserMenuOpen(false);
    router.push('/login');
  };

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

      {/* Right Header Badges & Auth Profile */}
      <div className="flex items-center space-x-3.5">
        
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifMenuRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 relative text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Operations & Dispatch Alerts"
          >
            <Bell size={18} />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 bg-rose-500 text-white font-bold text-[9px] rounded-full ring-2 ring-white animate-pulse">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200/90 rounded-2xl shadow-2xl shadow-slate-300/60 p-3 z-[10003] animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Operations & Unit Dispatches</span>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded-full">
                      {notifications.filter(n => !n.read).length} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <button 
                    onClick={() => markAllAsRead()}
                    className="text-emerald-600 hover:text-emerald-700 hover:underline font-semibold"
                  >
                    Mark read
                  </button>
                  <span className="text-slate-300">•</span>
                  <button 
                    onClick={() => clearAllNotifications()}
                    className="text-slate-400 hover:text-slate-600 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto space-y-2 pr-0.5">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <CheckCircle2 size={24} className="mx-auto text-emerald-500/70 mb-2" />
                    All operational corridors clear. No pending unit alerts.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markAsRead(notif.id);
                        if (notif.incidentId) {
                          setIsNotifOpen(false);
                          router.push(`/incidents?inspect=${encodeURIComponent(notif.incidentId)}`);
                        }
                      }}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        notif.read 
                          ? 'bg-slate-50/70 border-slate-100 text-slate-600 hover:bg-slate-100/80' 
                          : 'bg-emerald-50/40 border-emerald-200/80 text-slate-800 hover:bg-emerald-50 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          notif.type === 'dispatch' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {notif.type === 'dispatch' ? <Siren size={15} /> : <AlertTriangle size={15} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-slate-900 truncate">{notif.title}</p>
                            <span className="text-[10px] text-slate-400 shrink-0 font-medium">{notif.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug line-clamp-2">
                            {notif.message}
                          </p>
                          {notif.city && (
                            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-500">
                              <MapPin size={11} className="text-rose-500 shrink-0" />
                              <span className="font-semibold text-slate-700">{notif.city}</span>
                              {notif.roadName && <span className="text-slate-400">· {notif.roadName}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Notification Footer */}
              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 px-1">
                <Link 
                  href="/incidents" 
                  onClick={() => setIsNotifOpen(false)}
                  className="text-slate-800 font-bold hover:text-emerald-600 flex items-center gap-1"
                >
                  <span>Open Incident Dispatch Console</span>
                  <ArrowRight size={12} />
                </Link>
                <span className="text-[10px] text-emerald-600 font-mono">LIVE SYNC</span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Right Corner */}
        {currentUser ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 pl-2.5 border-l border-slate-200 hover:opacity-85 transition-opacity text-left cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-emerald-400 border border-slate-800 shadow-2xs group-hover:ring-2 group-hover:ring-emerald-500/30 transition-all">
                {currentUser.avatarInitials}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-semibold text-slate-800 group-hover:text-slate-900">{currentUser.name}</div>
                <div className="text-[10px] text-emerald-600 font-medium">{currentUser.role}</div>
              </div>
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/50 p-2 z-[10002] animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 bg-slate-50 rounded-xl mb-1.5 border border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80 uppercase tracking-wider">
                      {currentUser.role}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      via {currentUser.provider.toUpperCase()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleOpenEditProfile}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 rounded-lg transition-colors text-left"
                >
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>Edit Name & Operational Post</span>
                </button>

                <Link
                  href="/login"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <User size={14} className="text-slate-500" />
                  <span>Switch Account / Sign In</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left mt-1"
                >
                  <LogOut size={14} className="text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
          >
            <LogIn size={13} className="text-emerald-400" />
            <span>Sign In</span>
          </Link>
        )}
      </div>

      {/* Edit Profile & Post Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-[10006] animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Edit Operator Profile & Post</h3>
                  <p className="text-[11px] text-slate-400">Displayed in top right console header</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditProfileOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Display Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Hardik Agrawal"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operational Post / Designation
                </label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  placeholder="Fleet Operations Lead / NHAI Dispatcher"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {['Fleet Operations Lead', 'NHAI Incident Dispatcher', 'IoT Telematics Lead', 'Highway Patrol Commander'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setEditRole(role)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 transition-colors text-slate-600"
                    >
                      + {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department / Organization
                </label>
                <input
                  type="text"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  placeholder="National Operations Center"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                >
                  Save & Update Header
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
