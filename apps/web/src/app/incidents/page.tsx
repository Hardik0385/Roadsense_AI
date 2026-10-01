"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Siren,
  Construction,
  OctagonAlert,
  Route,
  RadioReceiver,
  Clock, 
  MapPin, 
  Truck, 
  Search, 
  Filter, 
  RefreshCw, 
  ShieldAlert, 
  Activity,
  Timer,
  CheckCircle2, 
  SendHorizonal, 
  Maximize2,
  X,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TrafficIncident, getLiveIncidents } from '@/utils/trafficApi';
import { addDispatchNotification } from '@/utils/notifications';

const CITIES = [
  'All Cities',
  'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 
  'Pune', 'Hyderabad', 'Kolkata', 'Ahmedabad', 
  'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 
  'Nagpur', 'Indore', 'Patna', 'Bhopal'
];

function IncidentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inspectParam = searchParams.get('inspect');
  const cityParam = searchParams.get('city');
  const searchParam = searchParams.get('search');

  const [mounted, setMounted] = useState(false);
  const [incidents, setIncidents] = useState<TrafficIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Interactive state: dispatched incidents
  const [dispatchedIncidents, setDispatchedIncidents] = useState<Record<string, { unit: string; time: string }>>({});
  const [dispatchToast, setDispatchToast] = useState<{ unitId: string; roadName: string } | null>(null);
  
  // Inspect Modal
  const [inspectedIncident, setInspectedIncident] = useState<TrafficIncident | null>(null);

  const fetchIncidents = async () => {
    try {
      const data = await getLiveIncidents();
      setIncidents(data);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to fetch live TomTom incidents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    // Refresh live TomTom incident data every 10 seconds
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, []);

  // Sync URL search params for deep linking and auto modal open
  useEffect(() => {
    if (cityParam) {
      const foundCity = CITIES.find(c => c.toLowerCase() === cityParam.toLowerCase());
      if (foundCity) {
        setSelectedCity(foundCity);
        setCurrentPage(1);
      }
    }
  }, [cityParam]);

  useEffect(() => {
    if (searchParam) {
      setSearchQuery(searchParam);
      setCurrentPage(1);
    }
  }, [searchParam]);

  useEffect(() => {
    if (inspectParam && incidents.length > 0) {
      const target = incidents.find(i => 
        i.id.toLowerCase() === inspectParam.toLowerCase() || 
        i.id.toLowerCase().includes(inspectParam.toLowerCase()) ||
        inspectParam.toLowerCase().includes(i.id.toLowerCase())
      );
      if (target) {
        setInspectedIncident(target);
      }
    }
  }, [inspectParam, incidents]);

  const handleDispatch = (inc: TrafficIncident) => {
    const unitId = `PATROL-UNIT-${Math.floor(Math.random() * 80 + 101)}`;
    setDispatchedIncidents(prev => ({
      ...prev,
      [inc.id]: { unit: unitId, time: 'Just now' }
    }));

    // Trigger global notification bell update
    addDispatchNotification({
      incidentId: inc.id,
      roadName: inc.roadName,
      city: inc.city,
      unitId: unitId,
      type: inc.type
    });

    // Show instant toast feedback
    setDispatchToast({ unitId, roadName: inc.roadName });
    setTimeout(() => {
      setDispatchToast(null);
    }, 4500);
  };

  const handleCloseModal = () => {
    setInspectedIncident(null);
    if (inspectParam) {
      const params = new URLSearchParams(window.location.search);
      params.delete('inspect');
      const newQuery = params.toString();
      router.replace(newQuery ? `/incidents?${newQuery}` : '/incidents', { scroll: false });
    }
  };

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const matchesSearch = 
        inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.roadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.city.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCity = selectedCity === 'All Cities' || inc.city.toLowerCase() === selectedCity.toLowerCase();
      const matchesCategory = selectedCategory === 'ALL' || inc.category === selectedCategory;
      const matchesSeverity = selectedSeverity === 'ALL' || inc.severity === selectedSeverity;

      return matchesSearch && matchesCity && matchesCategory && matchesSeverity;
    });
  }, [incidents, searchQuery, selectedCity, selectedCategory, selectedSeverity]);

  // Paginated incidents
  const totalPages = Math.max(1, Math.ceil(filteredIncidents.length / itemsPerPage));
  const paginatedIncidents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredIncidents.slice(start, start + itemsPerPage);
  }, [filteredIncidents, currentPage]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = incidents.length;
    const criticalCount = incidents.filter(i => i.severity === 'CRITICAL').length;
    const highCount = incidents.filter(i => i.severity === 'HIGH').length;
    const mediumCount = incidents.filter(i => i.severity === 'MEDIUM').length;
    const roadworksCount = incidents.filter(i => i.category === 'ROADWORKS').length;
    const totalDelayedVehicles = incidents.reduce((sum, i) => sum + i.vehiclesAffected, 0);

    return { total, criticalCount, highCount, mediumCount, roadworksCount, totalDelayedVehicles };
  }, [incidents]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ROADWORKS': return <Construction size={14} className="text-amber-500" />;
      case 'CLOSURE': return <OctagonAlert size={14} className="text-rose-500" />;
      case 'ACCIDENT': return <Siren size={14} className="text-rose-600" />;
      default: return <Route size={14} className="text-orange-500" />;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1680px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Incident Response Triage</h2>
            <span className="flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse mr-2"></span>
              Live TomTom Telemetry
            </span>
          </div>
          <p className="text-slate-500 text-sm">Real-time road disruptions, bottlenecks & construction zones across 16 Indian hubs</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-2 px-3.5 rounded-lg text-xs font-semibold flex items-center transition-all ${
                viewMode === 'GRID' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid size={15} className="mr-1.5" /> Grid
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-2 px-3.5 rounded-lg text-xs font-semibold flex items-center transition-all ${
                viewMode === 'TABLE' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List size={15} className="mr-1.5" /> Table
            </button>
          </div>

          <button 
            onClick={fetchIncidents}
            className="flex items-center px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium shadow-2xs transition-all hover:border-slate-300"
          >
            <RefreshCw size={14} className="mr-2 text-slate-500" />
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5 mb-8">
        <div 
          onClick={() => { setSelectedSeverity('ALL'); setCurrentPage(1); }}
          className={`bg-white border rounded-2xl p-4 md:p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer ${
            selectedSeverity === 'ALL' ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Total Live Incidents</span>
            <div className="p-2 bg-slate-100 rounded-xl text-slate-800">
              <ShieldAlert size={16} />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-slate-900">{stats.total.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Across 16 Indian cities</p>
        </div>

        <div 
          onClick={() => { setSelectedSeverity(selectedSeverity === 'CRITICAL' ? 'ALL' : 'CRITICAL'); setCurrentPage(1); }}
          className={`bg-white border rounded-2xl p-4 md:p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer ${
            selectedSeverity === 'CRITICAL' ? 'border-rose-600 ring-2 ring-rose-600/20' : 'border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Critical Severity</span>
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <Siren size={16} />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-rose-600">{stats.criticalCount}</p>
          <p className="text-xs text-slate-400 mt-1">High delays & closures</p>
        </div>

        <div 
          onClick={() => { setSelectedSeverity(selectedSeverity === 'HIGH' ? 'ALL' : 'HIGH'); setCurrentPage(1); }}
          className={`bg-white border rounded-2xl p-4 md:p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer ${
            selectedSeverity === 'HIGH' ? 'border-orange-600 ring-2 ring-orange-600/20' : 'border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>High Priority Jams</span>
            <div className="p-2 bg-orange-50 rounded-xl text-orange-600">
              <Route size={16} />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-orange-600">{stats.highCount}</p>
          <p className="text-xs text-slate-400 mt-1">Heavy congestion points</p>
        </div>

        <div 
          onClick={() => { setSelectedCategory(selectedCategory === 'ROADWORKS' ? 'ALL' : 'ROADWORKS'); setCurrentPage(1); }}
          className={`bg-white border rounded-2xl p-4 md:p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer ${
            selectedCategory === 'ROADWORKS' ? 'border-amber-600 ring-2 ring-amber-600/20' : 'border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Road Works & Repairs</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <Construction size={16} />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-amber-600">{stats.roadworksCount}</p>
          <p className="text-xs text-slate-400 mt-1">Active construction zones</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-5 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Delayed Fleet Vehicles</span>
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
              <Truck size={16} />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-slate-900">{stats.totalDelayedVehicles.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Estimated impacted units</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-5 mb-8 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center flex-1 min-w-[300px] bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-400 transition-all">
          <Search size={16} className="text-slate-400 mr-3 shrink-0" />
          <input 
            type="text" 
            placeholder="Search by Road name, Corridor, City, or Incident ID..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="bg-transparent border-none outline-none text-sm text-slate-800 w-full placeholder-slate-400 font-medium" 
          />
        </div>

        <div className="flex items-center flex-wrap gap-3">
          {/* Severity Quick Filter Pills */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 gap-1 text-xs font-semibold">
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map(sev => (
              <button
                key={sev}
                onClick={() => { setSelectedSeverity(sev); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedSeverity === sev 
                    ? 'bg-slate-900 text-white shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {sev === 'ALL' ? 'All Priorities' : sev.charAt(0) + sev.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* City Filter */}
          <div className="flex items-center bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-100/70 transition-colors">
            <MapPin size={14} className="text-slate-400 mr-2 shrink-0" />
            <select 
              value={selectedCity} 
              onChange={(e) => { setSelectedCity(e.target.value); setCurrentPage(1); }}
              className="bg-transparent border-none outline-none text-slate-800 font-medium cursor-pointer pr-2"
            >
              {CITIES.map(city => (
                <option key={city} value={city} className="bg-white text-slate-800">
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-100/70 transition-colors">
            <Filter size={14} className="text-slate-400 mr-2 shrink-0" />
            <select 
              value={selectedCategory} 
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="bg-transparent border-none outline-none text-slate-800 font-medium cursor-pointer pr-2"
            >
              <option value="ALL" className="bg-white text-slate-800">All Categories</option>
              <option value="JAM" className="bg-white text-slate-800">Traffic Jams & Bottlenecks</option>
              <option value="ROADWORKS" className="bg-white text-slate-800">Road Works</option>
              <option value="CLOSURE" className="bg-white text-slate-800">Road Closures</option>
              <option value="ACCIDENT" className="bg-white text-slate-800">Collisions & Breakdowns</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-16 text-center text-slate-500 flex flex-col items-center justify-center shadow-2xs">
          <RefreshCw className="animate-spin text-slate-900 mb-3" size={32} />
          <p className="text-slate-900 font-bold text-base">Fetching real-time TomTom telemetry across 16 cities...</p>
          <p className="text-xs text-slate-400 mt-1">Aggregating active construction sites, road closures, and traffic jams</p>
        </div>
      ) : viewMode === 'GRID' ? (
        /* Spacious Card Grid View */
        <div>
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Showing <span className="text-slate-900 font-mono font-extrabold">{filteredIncidents.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="text-slate-900 font-mono font-extrabold">{Math.min(currentPage * itemsPerPage, filteredIncidents.length)}</span> of <span className="text-slate-900 font-mono font-extrabold">{filteredIncidents.length}</span> Active Disruptions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedIncidents.map(inc => {
              const isDispatched = !!dispatchedIncidents[inc.id];
              return (
                <div 
                  key={inc.id} 
                  className="bg-white border border-slate-200/90 rounded-3xl p-6 hover:border-slate-300 hover:shadow-lg transition-all duration-200 shadow-2xs group flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Clean ID Badge, Severity Pill & Timestamp */}
                    <div className="flex items-center justify-between gap-3 mb-3.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100/90 border border-slate-200/80 px-2.5 py-1 rounded-lg truncate" title={inc.id}>
                          {inc.id.length > 20 ? `${inc.id.slice(0, 16)}...` : inc.id}
                        </span>
                        <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded-full border ${
                          inc.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' :
                          inc.severity === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {inc.severity}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 flex items-center font-mono font-medium shrink-0">
                        <Clock size={12} className="mr-1 text-slate-400"/> {inc.timeAgo}
                      </span>
                    </div>

                    {/* Category Label */}
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold mb-2">
                      {getCategoryIcon(inc.category)}
                      <span className="truncate">{inc.type}</span>
                    </div>

                    {/* Road Title with comfortable breathing room */}
                    <h4 className="text-slate-900 font-extrabold text-base mb-4 leading-snug line-clamp-2 min-h-[44px] group-hover:text-slate-700 transition-colors" title={inc.roadName}>
                      {inc.roadName}
                    </h4>
                    
                    {/* Telemetry metadata card with spacious padding */}
                    <div className="space-y-2.5 text-xs text-slate-600 mb-5 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center font-semibold text-slate-800">
                          <MapPin size={13} className="mr-1.5 text-rose-500 shrink-0"/> {inc.city} Hub
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">{inc.location}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/70">
                        <span className="flex items-center font-medium text-slate-700">
                          <Truck size={13} className="mr-1.5 text-purple-600 shrink-0"/> {inc.vehiclesAffected} vehicles impacted
                        </span>
                        <span className="text-amber-700 font-bold bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-md">
                          +{inc.delayMinutes}m delay
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  {isDispatched ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-700">
                      <span className="flex items-center font-bold">
                        <CheckCircle2 size={14} className="mr-1.5 text-emerald-600" />
                        {dispatchedIncidents[inc.id].unit} En Route
                      </span>
                      <span className="text-[11px] text-emerald-600 font-semibold">Active Patrol</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2.5 pt-1">
                      <button 
                        onClick={() => handleDispatch(inc)}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]"
                      >
                        <SendHorizonal size={13} /> Dispatch Unit
                      </button>
                      <button 
                        onClick={() => setInspectedIncident(inc)}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold rounded-xl text-xs transition-colors border border-slate-200/80"
                      >
                        Details
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredIncidents.length === 0 && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-16 text-center text-slate-500 flex flex-col items-center justify-center shadow-2xs">
              <Route size={36} className="mb-3 text-slate-400 opacity-60" />
              <p className="text-slate-900 font-bold text-base">No incidents matching your filters</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting the search query or selecting 'All Cities' / 'All Priorities'.</p>
            </div>
          )}

          {/* Pagination Footer */}
          {filteredIncidents.length > 0 && (
            <div className="mt-8 bg-white border border-slate-200/90 rounded-2xl px-5 py-3.5 flex items-center justify-between text-xs text-slate-500 font-medium shadow-2xs">
              <div>
                Showing page <span className="font-bold text-slate-900">{currentPage}</span> of <span className="font-bold text-slate-900">{totalPages}</span> ({filteredIncidents.length} total incidents)
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 shadow-2xs transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 shadow-2xs">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 shadow-2xs transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Incident ID & Type</th>
                  <th className="p-4">Corridor / Road</th>
                  <th className="p-4">City Hub</th>
                  <th className="p-4">Delay & Distance</th>
                  <th className="p-4">Impacted Units</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Status / Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {filteredIncidents.slice(0, 50).map(inc => {
                  const isDispatched = !!dispatchedIncidents[inc.id];
                  return (
                    <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80 text-xs">
                          {inc.id.length > 20 ? `${inc.id.slice(0, 18)}...` : inc.id}
                        </span>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1.5 font-medium">
                          {getCategoryIcon(inc.category)}
                          {inc.type}
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-900 max-w-xs truncate">{inc.roadName}</td>
                      <td className="p-4">
                        <span className="text-slate-800 font-semibold">{inc.city}</span>
                        <div className="text-[11px] font-mono text-slate-400">{inc.location}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-amber-700 font-bold">+{inc.delayMinutes} min</span>
                        <div className="text-xs text-slate-400">{(inc.lengthMeters / 1000).toFixed(1)} km zone</div>
                      </td>
                      <td className="p-4 font-mono text-slate-700 font-semibold">{inc.vehiclesAffected} vehicles</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          inc.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' :
                          inc.severity === 'HIGH' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {inc.severity}
                        </span>
                      </td>
                      <td className="p-4">
                        {isDispatched ? (
                          <span className="text-xs text-emerald-700 font-semibold flex items-center">
                            <CheckCircle2 size={14} className="mr-1 text-emerald-600" />
                            {dispatchedIncidents[inc.id].unit}
                          </span>
                        ) : (
                          <button 
                            onClick={() => handleDispatch(inc)}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all shadow-2xs"
                          >
                            Dispatch
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Incident Detail Modal - Rendered via Portal to document.body */}
      {inspectedIncident && mounted && createPortal(
        <div className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 md:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={handleCloseModal}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-2xs">
                {inspectedIncident.category === 'ROADWORKS' ? (
                  <Construction size={24} />
                ) : inspectedIncident.category === 'CLOSURE' ? (
                  <OctagonAlert size={24} />
                ) : inspectedIncident.category === 'ACCIDENT' ? (
                  <Siren size={24} />
                ) : (
                  <Route size={24} />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="font-mono">{inspectedIncident.id.slice(0, 18)}...</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-md font-semibold ${
                    inspectedIncident.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-orange-50 text-orange-700 border border-orange-200'
                  }`}>
                    {inspectedIncident.severity} Priority
                  </span>
                </h3>
                <p className="text-xs text-slate-500">{inspectedIncident.type} • {inspectedIncident.city} Hub</p>
              </div>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 mb-5">
              <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">Road Corridor</p>
              <p className="text-slate-900 font-bold text-sm">{inspectedIncident.roadName}</p>
              <p className="font-mono text-xs text-slate-500 mt-1 flex items-center">
                <MapPin size={12} className="text-rose-500 mr-1.5" />
                Coordinates: {inspectedIncident.location}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5 mb-6">
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Timer size={13} className="text-amber-500" />
                  Estimated Travel Delay
                </p>
                <p className="text-xl font-extrabold text-amber-600 mt-1">+{inspectedIncident.delayMinutes} mins</p>
              </div>
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Activity size={13} className="text-rose-500" />
                  Corridor Stress Index
                </p>
                <p className="text-xl font-extrabold text-rose-600 mt-1">{inspectedIncident.stress}/100</p>
              </div>
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Truck size={13} className="text-purple-600" />
                  Impacted Vehicles
                </p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">{inspectedIncident.vehiclesAffected} units</p>
              </div>
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Route size={13} className="text-slate-800" />
                  Affected Distance
                </p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">{(inspectedIncident.lengthMeters / 1000).toFixed(2)} km</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  handleDispatch(inspectedIncident);
                  handleCloseModal();
                }}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <SendHorizonal size={14} /> Dispatch Emergency Patrol
              </button>
              <button 
                onClick={handleCloseModal}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors border border-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Floating Live Dispatch Alert */}
      {dispatchToast && (
        <div className="fixed bottom-6 right-6 z-[10005] bg-slate-900 text-white px-5 py-3.5 rounded-2xl border border-emerald-500/40 shadow-2xl shadow-black/60 flex items-center gap-3.5 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 animate-pulse">
            <Siren size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <span>🚨 Unit Dispatched: {dispatchToast.unitId}</span>
              <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/30">ACTIVE</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 max-w-xs truncate">
              En route to {dispatchToast.roadName}. Live notification dispatched to top bar.
            </p>
          </div>
          <button 
            onClick={() => setDispatchToast(null)}
            className="text-slate-400 hover:text-white p-1 ml-1"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function IncidentsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <RefreshCw className="animate-spin text-slate-700" size={20} />
          <span>Loading Incident Management Console...</span>
        </div>
      </div>
    }>
      <IncidentsContent />
    </Suspense>
  );
}
