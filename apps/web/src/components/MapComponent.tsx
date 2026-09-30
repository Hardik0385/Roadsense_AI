"use client";

import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface RoadSegment {
  id: string;
  name?: string;
  lat: number;
  lng: number;
  stress: number;
  status: string;
}

export default function MapComponent({ roadSegments, mapLayer = 'streets' }: { roadSegments: RoadSegment[], mapLayer?: 'dark' | 'satellite' | 'streets' | 'light' }) {
  const getStyle = () => {
    switch (mapLayer) {
      case 'dark': return 'mapbox/dark-v11';
      case 'satellite': return 'mapbox/satellite-v9';
      case 'light': return 'mapbox/light-v11';
      case 'streets':
      default: return 'mapbox/streets-v12';
    }
  };

  return (
    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url={`https://api.mapbox.com/styles/v1/${getStyle()}/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiaGFyZGlrMDM4NSIsImEiOiJjbXVvYW5oOTMwMnpnMnhyMGszbWVtNnhhIn0.3hfVkJxlNaDGBwJ9OJo6ag`}
        attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
      />
      {roadSegments.map(segment => {
        const isCritical = segment.stress > 80;
        const isHigh = segment.stress > 60;
        const isElevated = segment.stress > 40;
        const color = isCritical ? '#EF4444' : isHigh ? '#F97316' : isElevated ? '#EAB308' : '#22C55E';
        
        return (
          <CircleMarker 
            key={segment.id}
            center={[segment.lat, segment.lng]} 
            radius={isCritical ? 9 : isHigh ? 8 : 6}
            pathOptions={{ 
              color: color, 
              fillColor: color, 
              fillOpacity: isCritical ? 0.85 : 0.65,
              weight: 1.5
            }}
          >
            <Popup>
              <div className="text-slate-900 font-sans p-1">
                <strong className="text-sm">{segment.name && segment.name !== 'Unknown Road' ? segment.name : segment.id}</strong>
                <div className="text-xs text-gray-600 mt-1">
                  Status: <span className="font-semibold">{segment.status}</span><br/>
                  Stress Index: <span className="font-semibold">{segment.stress}/100</span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
