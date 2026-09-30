"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Truck,
  CarFront, 
  Search, 
  Filter, 
  Radio, 
  RefreshCw, 
  CheckCircle2, 
  OctagonAlert, 
  Activity,
  GaugeCircle, 
  Cpu, 
  MapPin, 
  Navigation,
  Thermometer,
  BatteryCharging,
  Milestone,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

interface Vehicle {
  id: string;
  driver: string;
  city: string;
  model: string;
  speed: number;
  stress: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  engine_temp: number;
  fuel_battery: number;
  odometer: number;
  latitude: number;
  longitude: number;
  smartcar_connected: boolean;
  updated_at: string;
}

const CITIES = [
  'All Cities',
  'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 
  'Pune', 'Hyderabad', 'Kolkata', 'Ahmedabad', 
  'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 
  'Nagpur', 'Indore', 'Patna', 'Bhopal'
];

function VehiclesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inspectParam = searchParams.get('inspect');
  const cityParam = searchParams.get('city');
  const searchParam = searchParams.get('search');

  const [mounted, setMounted] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Selected vehicle for modal inspection
  const [inspectedVehicle, setInspectedVehicle] = useState<Vehicle | null>(null);

  const fetchVehicles = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/vehicles');
      const data = await res.json();
      if (data && Array.isArray(data.data) && data.data.length > 0) {
        setVehicles(data.data);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to fetch live vehicle telemetry', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    // Real-time live polling every 1.5 seconds for instantaneous telemetry updates
    const interval = setInterval(fetchVehicles, 1500);
    return () => clearInterval(interval);
  }, []);

  // Handle URL search params for instant deep-linking & auto-inspection
  useEffect(() => {
    if (cityParam) {
      const foundCity = CITIES.find(c => c.toLowerCase() === cityParam.toLowerCase());
      if (foundCity) setSelectedCity(foundCity);
    }
  }, [cityParam]);

  useEffect(() => {
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParam]);

  useEffect(() => {
    if (inspectParam && vehicles.length > 0) {
      const target = vehicles.find(v => v.id.toLowerCase() === inspectParam.toLowerCase());
      if (target) {
        setInspectedVehicle(target);
      }
    }
  }, [inspectParam, vehicles]);

  // Keep inspected vehicle refreshed with live telemetry
  useEffect(() => {
    if (inspectedVehicle && vehicles.length > 0) {
      const updated = vehicles.find(v => v.id === inspectedVehicle.id);
      if (updated) {
        setInspectedVehicle(updated);
      }
    }
  }, [vehicles]);

  // Filtered & Searched vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch = 
        v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.city.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCity = selectedCity === 'All Cities' || v.city.toLowerCase() === selectedCity.toLowerCase();
      const matchesStatus = selectedStatus === 'ALL' || v.status === selectedStatus;

      return matchesSearch && matchesCity && matchesStatus;
    });
  }, [vehicles, searchQuery, selectedCity, selectedStatus]);

  // Paginated vehicles
  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / itemsPerPage));
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(start, start + itemsPerPage);
  }, [filteredVehicles, currentPage]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const total = vehicles.length;
    const normalCount = vehicles.filter(v => v.status === 'NORMAL').length;
    const warningCount = vehicles.filter(v => v.status === 'WARNING').length;
    const criticalCount = vehicles.filter(v => v.status === 'CRITICAL').length;
    const avgSpeed = total > 0 ? Math.round(vehicles.reduce((a, b) => a + b.speed, 0) / total) : 0;
    const smartcarCount = vehicles.filter(v => v.smartcar_connected).length;

    return { total, normalCount, warningCount, criticalCount, avgSpeed, smartcarCount };
  }, [vehicles]);

  const handleConnectSmartcar = () => {
    window.open('http://localhost:3001/api/v1/smartcar/login', '_blank');
  };

  const handleCloseModal = () => {
    setInspectedVehicle(null);
    if (inspectParam) {
      const params = new URLSearchParams(window.location.search);
      params.delete('inspect');
      const newQuery = params.toString();
      router.replace(newQuery ? `/vehicles?${newQuery}` : '/vehicles', { scroll: false });
    }
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Fleet Telemetry & Vehicles</h2>
            <span className="flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
              Live Sync Active
            </span>
          </div>
          <p className="text-slate-500 text-sm">Real-time OBD-II telemetry and Smartcar IoT streaming across 16 Indian hubs</p>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchVehicles}
            className="flex items-center px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium shadow-2xs transition-all hover:border-slate-300"
          >
            <RefreshCw size={14} className="mr-2 text-slate-500" />
            Refresh
          </button>
          <button 
            onClick={handleConnectSmartcar}
            className="flex items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-sm shadow-sm transition-all active:scale-[0.98]"
          >
            <Cpu size={16} className="mr-2 text-emerald-400" />
            Connect Vehicle (Smartcar IoT)
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Total Connected Fleet</span>
            <div className="p-2 bg-slate-100 rounded-xl text-slate-800">
              <Truck size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.total} <span className="text-xs text-slate-400 font-normal">Vehicles</span></p>
          <p className="text-xs text-slate-400 mt-1">Across 16 Indian cities</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Normal Operation</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{stats.normalCount}</p>
          <p className="text-xs text-slate-400 mt-1">{stats.total > 0 ? Math.round((stats.normalCount / stats.total) * 100) : 0}% of fleet</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Elevated Stress</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <Activity size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600">{stats.warningCount}</p>
          <p className="text-xs text-slate-400 mt-1">High traffic corridors</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Critical Warnings</span>
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <OctagonAlert size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600">{stats.criticalCount}</p>
          <p className="text-xs text-slate-400 mt-1">Harsh braking / High stress</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Avg Fleet Speed</span>
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
              <GaugeCircle size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.avgSpeed} <span className="text-xs text-slate-400 font-normal">km/h</span></p>
          <p className="text-xs text-slate-400 mt-1">Live telemetry average</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center flex-1 min-w-[280px] bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-400 transition-all">
          <Search size={16} className="text-slate-400 mr-2.5 shrink-0" />
          <input 
            type="text" 
            placeholder="Search by Vehicle ID, Driver, Model, or City..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="bg-transparent border-none outline-none text-sm text-slate-800 w-full placeholder-slate-400 font-medium" 
          />
        </div>

        <div className="flex items-center gap-3">
          {/* City Filter */}
          <div className="flex items-center bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100/70 transition-colors">
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

          {/* Status Filter */}
          <div className="flex items-center bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100/70 transition-colors">
            <Filter size={14} className="text-slate-400 mr-2 shrink-0" />
            <select 
              value={selectedStatus} 
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="bg-transparent border-none outline-none text-slate-800 font-medium cursor-pointer pr-2"
            >
              <option value="ALL" className="bg-white text-slate-800">All Statuses</option>
              <option value="NORMAL" className="bg-white text-slate-800">Normal</option>
              <option value="WARNING" className="bg-white text-slate-800">Warning (Elevated)</option>
              <option value="CRITICAL" className="bg-white text-slate-800">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Fleet Vehicles Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden mb-6 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Vehicle ID & Model</th>
                <th className="p-4">Driver</th>
                <th className="p-4">City Hub</th>
                <th className="p-4">Live Speed</th>
                <th className="p-4">Engine Temp / Fuel</th>
                <th className="p-4">Stress Score</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Telemetry</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-slate-400">
                    <RefreshCw className="animate-spin inline-block mr-2 text-slate-900" size={18} />
                    Loading live connected fleet telemetry...
                  </td>
                </tr>
              ) : paginatedVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-slate-500 font-medium">
                    No vehicles found matching criteria "{searchQuery}" in {selectedCity}.
                  </td>
                </tr>
              ) : (
                paginatedVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-mono text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        {v.id}
                        {v.smartcar_connected && (
                          <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded-md font-sans font-semibold">
                            Smartcar IoT
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 font-medium">{v.model}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">{v.driver}</td>
                    <td className="p-4">
                      <span className="flex items-center text-slate-700 text-sm font-medium">
                        <MapPin size={13} className="text-rose-500 mr-1 shrink-0" />
                        {v.city}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {v.latitude.toFixed(3)}, {v.longitude.toFixed(3)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900">{v.speed}</span> <span className="text-xs text-slate-400 font-normal">km/h</span>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-slate-700 font-medium">
                        <span>{v.engine_temp}°C Temp</span>
                        <span className="text-slate-300 mx-1.5">•</span>
                        <span>{v.fuel_battery}% Fuel</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {v.odometer.toLocaleString()} km total
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full mr-3 overflow-hidden border border-slate-200/50">
                          <div 
                            className={`h-full ${
                              v.stress > 75 ? 'bg-rose-500' : v.stress > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`} 
                            style={{ width: `${Math.min(100, v.stress)}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-xs font-semibold text-slate-700">{v.stress}/100</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        v.status === 'CRITICAL' 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' 
                          : v.status === 'WARNING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setInspectedVehicle(v)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-900 text-slate-700 hover:text-white border border-slate-200/80 rounded-lg text-xs font-semibold transition-all shadow-2xs"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-slate-50/90 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div>
            Showing <span className="font-bold text-slate-800">{filteredVehicles.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredVehicles.length)}</span> of <span className="font-bold text-slate-800">{filteredVehicles.length}</span> vehicles
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 shadow-2xs transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-mono font-semibold text-slate-800 shadow-2xs">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 shadow-2xs transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Vehicle Inspection Modal - Rendered via Portal to document.body */}
      {inspectedVehicle && mounted && createPortal(
        <div className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 md:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={handleCloseModal}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200 shadow-2xs">
                <Truck size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {inspectedVehicle.id}
                  {inspectedVehicle.smartcar_connected && (
                    <span className="text-xs bg-slate-900 text-white px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                      <Cpu size={12} />
                      Smartcar Live
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">{inspectedVehicle.model} • Driver: <span className="font-semibold text-slate-700">{inspectedVehicle.driver}</span></p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 mb-5">
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <GaugeCircle size={14} className="text-slate-400" />
                  Live Speed
                </p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">{inspectedVehicle.speed} km/h</p>
              </div>
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Activity size={14} className="text-slate-400" />
                  Road Stress Index
                </p>
                <p className={`text-xl font-extrabold mt-1 ${inspectedVehicle.stress > 70 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {inspectedVehicle.stress}/100
                </p>
              </div>
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Thermometer size={14} className="text-amber-500" />
                  Engine Temp
                </p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">{inspectedVehicle.engine_temp}°C</p>
              </div>
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <BatteryCharging size={14} className="text-emerald-500" />
                  Fuel / Battery Level
                </p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">{inspectedVehicle.fuel_battery}%</p>
              </div>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 mb-5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Location Hub</span>
                <span className="font-semibold text-slate-800">{inspectedVehicle.city} Hub</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">GPS Coordinates</span>
                <span className="font-mono text-slate-700">{inspectedVehicle.latitude.toFixed(4)}, {inspectedVehicle.longitude.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Odometer Reading</span>
                <span className="font-mono font-semibold text-slate-800">{inspectedVehicle.odometer.toLocaleString()} km</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleConnectSmartcar}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <Cpu size={15} className="text-emerald-400" /> Direct Smartcar Sync
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
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <RefreshCw className="animate-spin text-slate-700" size={20} />
          <span>Loading Vehicle Fleet Operations...</span>
        </div>
      </div>
    }>
      <VehiclesContent />
    </Suspense>
  );
}
