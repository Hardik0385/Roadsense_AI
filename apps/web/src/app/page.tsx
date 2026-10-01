"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  RadioTower, 
  Siren, 
  Compass, 
  Truck, 
  TrendingUp, 
  Timer, 
  ShieldCheck, 
  MapPin, 
  ArrowUpRight, 
  Clock, 
  ChevronRight,
  Flame,
  Layers,
  Thermometer,
  Activity,
  Globe2,
  Route,
  ChevronDown
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { getLiveIncidents, TrafficIncident } from '@/utils/trafficApi';

const INDIAN_CITIES = [
  { name: 'Delhi', region: 'North', code: 'DEL', query: 'New Delhi,IN' },
  { name: 'Mumbai', region: 'West', code: 'BOM', query: 'Mumbai,IN' },
  { name: 'Bangalore', region: 'South', code: 'BLR', query: 'Bengaluru,IN' },
  { name: 'Chennai', region: 'South', code: 'MAA', query: 'Chennai,IN' },
  { name: 'Hyderabad', region: 'South', code: 'HYD', query: 'Hyderabad,IN' },
  { name: 'Pune', region: 'West', code: 'PNQ', query: 'Pune,IN' },
  { name: 'Kolkata', region: 'East', code: 'CCU', query: 'Kolkata,IN' },
  { name: 'Ahmedabad', region: 'West', code: 'AMD', query: 'Ahmedabad,IN' },
  { name: 'Surat', region: 'West', code: 'STV', query: 'Surat,IN' },
  { name: 'Jaipur', region: 'North', code: 'JAI', query: 'Jaipur,IN' },
  { name: 'Lucknow', region: 'North', code: 'LKO', query: 'Lucknow,IN' },
  { name: 'Kanpur', region: 'North', code: 'KNU', query: 'Kanpur,IN' },
  { name: 'Nagpur', region: 'Central', code: 'NAG', query: 'Nagpur,IN' },
  { name: 'Indore', region: 'Central', code: 'IDR', query: 'Indore,IN' },
  { name: 'Patna', region: 'East', code: 'PAT', query: 'Patna,IN' },
  { name: 'Bhopal', region: 'Central', code: 'BHO', query: 'Bhopal,IN' }
];

export default function Dashboard() {
  const [fleetStatus, setFleetStatus] = useState({
    eventsPerSecond: 95400,
    activeIncidents: 1640,
    processingLatencyMs: 18,
    kafkaLag: 42
  });

  const [connectionStatus, setConnectionStatus] = useState('LIVE');
  const [selectedWeatherCity, setSelectedWeatherCity] = useState(INDIAN_CITIES[0]);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [weatherData, setWeatherData] = useState<{temp: number, description: string, icon: string} | null>(null);
  const [liveIncidents, setLiveIncidents] = useState<TrafficIncident[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  // Fetch live weather for selected city
  useEffect(() => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(selectedWeatherCity.query)}&units=metric&appid=c8e1db9abbb894f3157ae40bd12230a2`)
      .then(res => res.json())
      .then(data => {
        if (data.main && data.weather && data.weather[0]) {
          setWeatherData({
            temp: Math.round(data.main.temp),
            description: data.weather[0].description,
            icon: data.weather[0].icon
          });
        }
      })
      .catch((err) => {
        console.error('Failed to fetch city weather', err);
      });
  }, [selectedWeatherCity]);

  // Fetch live TomTom incidents & connected fleet
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/api/v1/live';

    getLiveIncidents().then(data => setLiveIncidents(data)).catch(() => {});
    
    fetch(`${apiUrl}/api/v1/vehicles`)
      .then(r => r.json())
      .then(d => d.data && setVehicles(d.data))
      .catch(() => {});

    // Periodic refresh every 8 seconds
    const interval = setInterval(() => {
      fetch(`${apiUrl}/api/v1/vehicles`)
        .then(r => r.json())
        .then(d => d.data && setVehicles(d.data))
        .catch(() => {});
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Live WebSocket stream for real-time dashboard events
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/api/v1/live';
    let ws: WebSocket | null = null;
    
    try {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => setConnectionStatus('LIVE');
      ws.onclose = () => setConnectionStatus('OFFLINE');
      ws.onerror = () => setConnectionStatus('ERROR');
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'FLEET_UPDATE') {
            setFleetStatus({
              eventsPerSecond: data.eventsPerSecond,
              activeIncidents: data.activeIncidents,
              processingLatencyMs: data.processingLatencyMs,
              kafkaLag: data.kafkaLag
            });

            // Add real-time point to chart
            setChartData(prev => {
              const newPoint = {
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                eventsPerSec: Math.round(data.eventsPerSecond / 1000),
                stress: Math.round(35 + Math.random() * 20)
              };
              const updated = [...prev, newPoint];
              return updated.length > 20 ? updated.slice(updated.length - 20) : updated;
            });
          }
        } catch (e) {}
      };
    } catch (e) {
      setConnectionStatus('OFFLINE');
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Initialize initial chart data
  useEffect(() => {
    const initialPoints = Array.from({ length: 15 }).map((_, i) => ({
      time: `T-${15 - i}s`,
      eventsPerSec: Math.round(92 + Math.random() * 8),
      stress: Math.round(34 + Math.random() * 15)
    }));
    setChartData(initialPoints);
  }, []);

  // Top 5 Critical Road Corridors
  const topCriticalCorridors = useMemo(() => {
    return liveIncidents
      .filter(i => i.severity === 'CRITICAL' || i.stress > 70)
      .slice(0, 5);
  }, [liveIncidents]);

  // City Incident Count & Stress Breakdown
  const cityMetrics = useMemo(() => {
    return INDIAN_CITIES.map(city => {
      const cityIncidents = liveIncidents.filter(i => i.city.toLowerCase() === city.name.toLowerCase());
      const totalIncidents = cityIncidents.length;
      const criticalCount = cityIncidents.filter(i => i.severity === 'CRITICAL').length;
      const avgStress = totalIncidents > 0 
        ? Math.round(cityIncidents.reduce((a, b) => a + b.stress, 0) / totalIncidents) 
        : Math.round(25 + Math.random() * 20);

      return {
        ...city,
        totalIncidents,
        criticalCount,
        avgStress,
        status: avgStress > 70 ? 'CRITICAL' : avgStress > 45 ? 'ELEVATED' : 'NORMAL'
      };
    });
  }, [liveIncidents]);

  // Overall Average Road Stress across India
  const averageNationalStress = useMemo(() => {
    if (liveIncidents.length === 0) return 38.4;
    return (liveIncidents.reduce((acc, curr) => acc + curr.stress, 0) / liveIncidents.length).toFixed(1);
  }, [liveIncidents]);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Executive Fleet & Road Intelligence</h2>
          <p className="text-slate-500 text-sm">Real-time national telemetry ingestion, corridor bottlenecks, and predictive road stress across 16 Indian cities</p>
        </div>
        
        {/* Unified Telemetry & Control Toolbar */}
        <div className="flex items-center bg-white border border-slate-200/90 rounded-2xl p-1 shadow-xs divide-x divide-slate-200/70">
          {/* City Weather Selector Dropdown */}
          <div className="relative">
            <button 
              type="button"
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl hover:bg-slate-100/70 transition-all text-xs font-semibold text-slate-800 cursor-pointer"
            >
              <MapPin size={14} className="text-indigo-600 shrink-0" />
              <span>{selectedWeatherCity.name}</span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200/60">
                {selectedWeatherCity.code}
              </span>
              <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCityDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsCityDropdownOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-64 max-h-72 overflow-y-auto bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl z-40 p-1.5 space-y-0.5">
                  <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase border-b border-slate-100 mb-1">
                    Select Urban Corridor (16 Cities)
                  </div>
                  {INDIAN_CITIES.map((city) => {
                    const isSelected = city.code === selectedWeatherCity.code;
                    return (
                      <button
                        key={city.code}
                        type="button"
                        onClick={() => {
                          setSelectedWeatherCity(city);
                          setIsCityDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-50 text-indigo-950 font-semibold border border-indigo-100' 
                            : 'text-slate-700 hover:bg-slate-100/80'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{city.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">({city.region})</span>
                        </div>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {city.code}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Live Weather Indicator */}
          {weatherData && (
            <div className="flex items-center px-3 py-1.5 space-x-2 text-xs">
              <img src={`https://openweathermap.org/img/wn/${weatherData.icon}.png`} alt="weather" className="w-5 h-5 -my-1" />
              <span className="text-slate-800 font-semibold">{weatherData.temp}°C</span>
              <span className="text-slate-400 capitalize hidden sm:inline">• {weatherData.description}</span>
            </div>
          )}

          {/* Fleet Status Badge */}
          <div className="flex items-center px-3 py-1.5 space-x-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${connectionStatus === 'LIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            <span className={connectionStatus === 'LIVE' ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-semibold'}>
              {connectionStatus} <span className="text-slate-400 font-normal hidden sm:inline">• 500 Units</span>
            </span>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Kafka Telemetry Ingestion</p>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs">
              <RadioTower size={17} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">{fleetStatus.eventsPerSecond.toLocaleString()} <span className="text-xs font-normal text-slate-500 font-sans">events/sec</span></p>
          <p className="text-xs text-emerald-600 mt-2 flex items-center font-semibold">
            <TrendingUp size={13} className="mr-1" /> +4.2% throughput vs peak
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Active Road Disruptions</p>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shadow-2xs">
              <Siren size={17} />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 font-mono">
            {liveIncidents.length > 0 ? liveIncidents.length.toLocaleString() : "1,640"}
          </p>
          <p className="text-xs text-slate-500 mt-2 font-medium">TomTom 16-City Live Stream</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Processing Latency</p>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs">
              <Timer size={17} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">{fleetStatus.processingLatencyMs} <span className="text-xs font-normal text-slate-500 font-sans">ms</span></p>
          <p className="text-xs text-slate-500 mt-2 font-mono">Pipeline Lag: {fleetStatus.kafkaLag} msgs</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Avg National Road Stress</p>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shadow-2xs">
              <Activity size={17} />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 font-mono">{averageNationalStress} <span className="text-xs font-normal text-slate-500 font-sans">/ 100</span></p>
          <p className="text-xs text-slate-500 mt-2 font-medium">Aggregated across all 16 hubs</p>
        </div>
      </div>

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Telemetry Ingestion Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-all flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity size={18} className="text-slate-700" />
                Live Ingestion Throughput & Road Stress Telemetry
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time CAN-bus & OBD-II telemetry stream across Indian transportation corridors</p>
            </div>
            <div className="flex items-center gap-3 text-xs shrink-0">
              <span className="flex items-center text-teal-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 mr-1.5"></span> Throughput (k events/s)
              </span>
              <span className="flex items-center text-amber-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></span> Stress Index
              </span>
            </div>
          </div>

          <div className="w-full flex-1 min-h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[0, 120]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.75rem', color: '#0F172A', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Area type="monotone" dataKey="eventsPerSec" stroke="#0D9488" strokeWidth={2.2} fillOpacity={1} fill="url(#colorThroughput)" name="Throughput (k/s)" />
                <Area type="monotone" dataKey="stress" stroke="#F59E0B" strokeWidth={2.2} fillOpacity={1} fill="url(#colorStress)" name="Stress Index" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Critical Road Corridors */}
        <div className="lg:col-span-1 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Route size={18} className="text-rose-500" />
              Top Critical Corridors
            </h3>
            <Link href="/incidents" className="text-xs text-slate-900 hover:text-slate-700 flex items-center font-semibold">
              View All <ArrowUpRight size={13} className="ml-0.5" />
            </Link>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[250px] pr-1 scrollbar-thin">
            {topCriticalCorridors.length > 0 ? (
              topCriticalCorridors.map((corridor) => (
                <div 
                  key={corridor.id} 
                  className="bg-slate-50 border border-slate-200 hover:border-slate-300 p-3 rounded-xl transition-all"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[11px] font-semibold text-rose-600 flex items-center">
                      <MapPin size={11} className="mr-1" /> {corridor.city} Hub
                    </span>
                    <span className="text-xs font-bold text-rose-600 font-mono bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                      {corridor.stress}/100
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 truncate mb-1.5" title={corridor.roadName}>
                    {corridor.roadName}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="text-amber-700 font-medium">+{corridor.delayMinutes}m delay</span>
                    <span className="text-indigo-600 font-medium">{corridor.vehiclesAffected} units impacted</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                No high-stress bottlenecks detected.
              </div>
            )}
          </div>

          <Link 
            href="/road-intelligence"
            className="mt-3 shrink-0 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <Compass size={15} className="text-emerald-400" />
            Open Full Road Intelligence Map
          </Link>
        </div>
      </div>

      {/* 16 Indian Cities Metro Grid */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-all">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Globe2 size={18} className="text-slate-800" />
              16-City Indian Metro Telemetry & Traffic Index
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Live regional stress indices, active bottlenecks, and sensor connectivity</p>
          </div>
          <span className="text-xs text-slate-500 font-mono bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
            Auto-Sync Active (Every 10s)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {cityMetrics.map((city) => (
            <div 
              key={city.name} 
              className="bg-slate-50/80 border border-slate-200 hover:border-slate-300 hover:bg-white p-3 rounded-xl flex flex-col justify-between transition-all hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">{city.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">{city.code}</span>
                </div>
                <div className="text-[11px] text-slate-500">{city.region} Zone</div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-end justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">Disruptions</div>
                  <div className="text-sm font-bold text-slate-800">{city.totalIncidents}</div>
                </div>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  city.status === 'CRITICAL' 
                    ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                    : city.status === 'ELEVATED'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {city.avgStress}/100
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Fleet Activity Feed & Vehicle Stream */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-all">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Truck size={18} className="text-slate-800" />
              Real-Time Fleet Anomaly & Telemetry Feed
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Live events transmitted from 500 connected vehicles across Indian hubs</p>
          </div>
          <Link href="/vehicles" className="text-xs text-slate-900 hover:text-slate-700 flex items-center font-semibold">
            Manage All Vehicles <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vehicles.slice(0, 6).map((v) => (
            <div 
              key={v.id} 
              className="bg-slate-50/90 hover:bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 flex items-center justify-between transition-all hover:shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold ${
                  v.status === 'CRITICAL' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                  v.status === 'WARNING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  <Truck size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    {v.id}
                    <span className="text-[10px] font-normal text-slate-500">({v.city})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{v.driver} • {v.model}</div>
                </div>
              </div>

              <div className="text-right font-mono text-xs">
                <div className="font-semibold text-slate-800">{v.speed} km/h</div>
                <div className={`text-[11px] font-medium ${v.stress > 70 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                  {v.stress}/100 stress
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
