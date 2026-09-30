"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Compass, SlidersHorizontal, Layers, Navigation } from 'lucide-react';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

export default function RoadIntelligencePage() {
  const [isClient, setIsClient] = useState(false);

  const [roadSegments, setRoadSegments] = useState<any[]>([]);
  const [mapLayer, setMapLayer] = useState<'streets' | 'light' | 'satellite' | 'dark'>('streets');
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'high'>('all');
  const [isLiveTracking, setIsLiveTracking] = useState(false);

  const fetchTraffic = async () => {
    const mod = await import('@/utils/trafficApi');
    const liveData = await mod.getLiveTrafficData();
    setRoadSegments(liveData);
  };

  useEffect(() => {
    setIsClient(true);
    fetchTraffic();
  }, []);

  useEffect(() => {
    if (!isLiveTracking) return;
    const interval = setInterval(() => {
      fetchTraffic();
    }, 30000); // Poll every 30 seconds when active
    return () => clearInterval(interval);
  }, [isLiveTracking]);

  const filteredSegments = roadSegments.filter(segment => {
    if (activeFilter === 'critical') return segment.stress > 80;
    if (activeFilter === 'high') return segment.stress > 60;
    return true;
  });

  const getLayerLabel = () => {
    switch (mapLayer) {
      case 'light': return 'Light Minimal';
      case 'satellite': return 'Satellite';
      case 'dark': return 'Dark Mode';
      case 'streets':
      default: return 'Light Streets';
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Top Header with high z-index and overflow-visible so dropdowns are never cut */}
      <div className="flex justify-between items-center p-6 bg-white/95 backdrop-blur-md border-b border-slate-200/90 relative z-[100] shadow-2xs">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1 flex items-center">
            <div className="p-2 bg-slate-100 text-slate-800 rounded-xl mr-3 shadow-2xs border border-slate-200">
              <Compass size={22} />
            </div>
            Full-Spectrum Road Intelligence
          </h2>
          <p className="text-slate-500 text-sm">Interactive geospatial analysis of network stress points and TomTom live traffic.</p>
        </div>
        <div className="flex space-x-3">
          {/* Map Layer Selector */}
          <div className="relative">
            <button 
              onClick={() => { setLayerMenuOpen(!layerMenuOpen); setFilterMenuOpen(false); }} 
              className="flex items-center px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold shadow-2xs transition-all hover:border-slate-300 active:scale-[0.98]"
            >
              <Layers size={16} className="mr-2 text-slate-700" /> {getLayerLabel()}
            </button>
            {layerMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-[5000] animate-in fade-in zoom-in-95 duration-150 p-1.5 space-y-1">
                <button onClick={() => {setMapLayer('streets'); setLayerMenuOpen(false);}} className={`w-full text-left px-3.5 py-2 text-sm rounded-xl transition-colors ${mapLayer === 'streets' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'}`}>Light Streets (Default)</button>
                <button onClick={() => {setMapLayer('light'); setLayerMenuOpen(false);}} className={`w-full text-left px-3.5 py-2 text-sm rounded-xl transition-colors ${mapLayer === 'light' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'}`}>Light Minimal</button>
                <button onClick={() => {setMapLayer('satellite'); setLayerMenuOpen(false);}} className={`w-full text-left px-3.5 py-2 text-sm rounded-xl transition-colors ${mapLayer === 'satellite' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'}`}>Satellite</button>
                <button onClick={() => {setMapLayer('dark'); setLayerMenuOpen(false);}} className={`w-full text-left px-3.5 py-2 text-sm rounded-xl transition-colors ${mapLayer === 'dark' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'}`}>Dark Mode</button>
              </div>
            )}
          </div>

          {/* Filters Selector */}
          <div className="relative">
            <button 
              onClick={() => { setFilterMenuOpen(!filterMenuOpen); setLayerMenuOpen(false); }} 
              className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-2xs border active:scale-[0.98] ${
                activeFilter !== 'all' 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-slate-900/10' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <SlidersHorizontal size={16} className={`mr-2 ${activeFilter !== 'all' ? 'text-white' : 'text-slate-500'}`} /> Filters
            </button>
            {filterMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-[5000] animate-in fade-in zoom-in-95 duration-150 p-1.5 space-y-1">
                <button onClick={() => {setActiveFilter('all'); setFilterMenuOpen(false);}} className={`w-full text-left px-3.5 py-2 text-sm rounded-xl transition-colors ${activeFilter === 'all' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'}`}>All Incidents</button>
                <button onClick={() => {setActiveFilter('critical'); setFilterMenuOpen(false);}} className={`w-full text-left px-3.5 py-2 text-sm rounded-xl transition-colors ${activeFilter === 'critical' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'}`}>Critical Only (&gt;80)</button>
                <button onClick={() => {setActiveFilter('high'); setFilterMenuOpen(false);}} className={`w-full text-left px-3.5 py-2 text-sm rounded-xl transition-colors ${activeFilter === 'high' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'}`}>High & Critical (&gt;60)</button>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsLiveTracking(!isLiveTracking)} 
            className={`flex items-center px-4 py-2.5 text-white font-semibold rounded-xl text-sm transition-all shadow-sm active:scale-[0.98] ${
              isLiveTracking 
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' 
                : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/15'
            }`}
          >
            <Navigation size={16} className={`mr-2 ${isLiveTracking ? 'animate-pulse text-amber-300' : ''}`} /> {isLiveTracking ? 'Tracking Active' : 'Live Tracking'}
          </button>
        </div>
      </div>
      
      {/* Map Viewport Area */}
      <div className="flex-1 relative bg-slate-100 z-0">
        {(isClient && roadSegments.length > 0) ? <MapComponent roadSegments={filteredSegments} mapLayer={mapLayer} /> : <div className="flex items-center justify-center h-full text-slate-500 font-medium">Loading Road Intelligence Map...</div>}
        
        {/* Map Overlay Controls */}
        <div className="absolute bottom-6 left-6 z-[400] bg-white/95 backdrop-blur-md border border-slate-200/90 p-4 rounded-2xl shadow-xl">
          <h4 className="text-slate-900 font-bold mb-3 text-xs uppercase tracking-wider">Stress Heatmap Legend</h4>
          <div className="space-y-2 text-xs font-semibold text-slate-700">
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-rose-500 mr-2 shadow-2xs"></div> &gt; 80 (Critical)</div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-orange-500 mr-2 shadow-2xs"></div> 60 - 80 (High)</div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-amber-500 mr-2 shadow-2xs"></div> 40 - 60 (Elevated)</div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-emerald-500 mr-2 shadow-2xs"></div> &lt; 40 (Normal)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
