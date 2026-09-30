import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Map as MapIcon, 
  Car, 
  Settings, 
  Bell, 
  Search,
  ShieldAlert
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function App() {
  const [fleetStatus, setFleetStatus] = useState({
    eventsPerSecond: 0,
    activeIncidents: 0,
    processingLatencyMs: 0,
    kafkaLag: 0
  });

  const [connectionStatus, setConnectionStatus] = useState('CONNECTING');
  
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{role: string, content: string, confidence?: number}>>([
    { role: 'user', content: 'Why is ROAD-4821 critical?' },
    { role: 'assistant', content: '<strong>ROAD-4821</strong> is currently <strong>CRITICAL</strong> with a stress score of 91/100. The system observed 1,284 unique vehicles, a 312% increase in harsh braking, and a 187% increase in suspension anomalies over the last 15 minutes.', confidence: 94 }
  ]);

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return;
    
    const userMessage = { role: 'user', content: aiQuery };
    setChatHistory(prev => [...prev, userMessage]);
    setAiQuery('');
    setAiLoading(true);
    
    try {
      const res = await fetch('http://localhost:3001/api/v1/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        confidence: data.confidence
      }]);
    } catch (err) {
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: 'Failed to connect to AI grounding service.',
        confidence: 0
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    // Connect to the Fastify WS server
    const ws = new WebSocket('ws://localhost:3001/api/v1/live');
    
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
        }
      } catch (err) {
        console.error('Failed to parse WS message', err);
      }
    };

    return () => ws.close();
  }, []);

  const chartData = Array.from({ length: 20 }).map((_, i) => ({
    time: i,
    stress: Math.random() * 30 + 40
  }));

  // Mock critical road segments for the map
  const roadSegments = [
    { id: 'ROAD-4821', lat: 19.0760, lng: 72.8777, stress: 91, status: 'CRITICAL' },
    { id: 'ROAD-1092', lat: 19.0800, lng: 72.8800, stress: 65, status: 'ELEVATED' }
  ];

  return (
    <div className="flex h-screen bg-dark-900 text-gray-200">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-dark-700 bg-dark-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-dark-700">
          <ShieldAlert className="text-primary-500 mr-3" size={24} />
          <h1 className="text-xl font-bold tracking-wider text-white">RoadSense AI</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center px-4 py-3 text-sm rounded-lg bg-primary-600/10 text-primary-500 border border-primary-500/20">
            <Activity size={18} className="mr-3" /> Overview
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-sm rounded-lg hover:bg-dark-700 transition-colors">
            <MapIcon size={18} className="mr-3" /> Road Intelligence
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-sm rounded-lg hover:bg-dark-700 transition-colors">
            <Car size={18} className="mr-3" /> Vehicles
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-sm rounded-lg hover:bg-dark-700 transition-colors">
            <AlertTriangle size={18} className="mr-3" /> Incidents
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-dark-700 bg-dark-800/50">
          <div className="flex items-center bg-dark-900 border border-dark-700 rounded-md px-3 py-1.5 w-96">
            <Search size={16} className="text-gray-500 mr-2" />
            <input type="text" placeholder="Search vehicles, roads, incidents..." className="bg-transparent border-none outline-none text-sm w-full" />
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 relative text-gray-400 hover:text-white">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-medium text-white">
              HA
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Fleet Overview</h2>
              <p className="text-gray-400 text-sm">Real-time telemetry and road stress analysis</p>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className={`w-2 h-2 rounded-full ${connectionStatus === 'LIVE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span className={connectionStatus === 'LIVE' ? 'text-green-500' : 'text-red-500'}>
                {connectionStatus} • 100K Vehicles Connected
              </span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-5">
              <p className="text-gray-400 text-sm mb-1">Ingestion Rate</p>
              <p className="text-2xl font-bold text-white">{fleetStatus.eventsPerSecond.toLocaleString()} <span className="text-sm font-normal text-gray-500">events/sec</span></p>
            </div>
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-5">
              <p className="text-gray-400 text-sm mb-1">Active Incidents</p>
              <p className="text-2xl font-bold text-red-500">{fleetStatus.activeIncidents}</p>
            </div>
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-5">
              <p className="text-gray-400 text-sm mb-1">Processing Latency</p>
              <p className="text-2xl font-bold text-white">{fleetStatus.processingLatencyMs} <span className="text-sm font-normal text-gray-500">ms</span></p>
            </div>
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-5">
              <p className="text-gray-400 text-sm mb-1">Avg Road Stress</p>
              <p className="text-2xl font-bold text-yellow-500">28.4 <span className="text-sm font-normal text-gray-500">/ 100</span></p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            
            {/* Live Map */}
            <div className="col-span-2 bg-dark-800 border border-dark-700 rounded-xl p-5 flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Live Road Stress Map</h3>
              </div>
              <div className="flex-1 rounded-lg border border-dark-700 overflow-hidden relative z-0">
                <MapContainer center={[19.0760, 72.8777]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />
                  {roadSegments.map(segment => (
                    <CircleMarker 
                      key={segment.id}
                      center={[segment.lat, segment.lng]} 
                      radius={10}
                      pathOptions={{ color: segment.stress > 80 ? '#EF4444' : '#F59E0B', fillColor: segment.stress > 80 ? '#EF4444' : '#F59E0B', fillOpacity: 0.7 }}
                    >
                      <Popup>
                        <div className="text-dark-900 font-sans">
                          <strong>{segment.id}</strong><br/>
                          Status: {segment.status}<br/>
                          Stress: {segment.stress}/100
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            </div>

            {/* AI Assistant Chat Panel */}
            <div className="col-span-1 bg-dark-800 border border-dark-700 rounded-xl p-5 flex flex-col h-[500px]">
              <div className="flex items-center mb-4 text-primary-500">
                <Activity size={20} className="mr-2" />
                <h3 className="text-lg font-semibold text-white">AI Fleet Assistant</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                <div className="bg-dark-700/50 p-3 rounded-lg text-sm text-gray-300">
                  <p>How can I help you analyze the fleet today?</p>
                </div>
                
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={msg.role === 'user' ? "bg-primary-600/20 p-3 rounded-lg text-sm text-white ml-6" : "bg-dark-700/50 p-3 rounded-lg text-sm text-gray-300 mr-6 border-l-2 border-primary-500"}>
                    <p dangerouslySetInnerHTML={{ __html: msg.content }} />
                    {msg.confidence && <p className="text-xs text-primary-400 mt-2">Confidence: {msg.confidence}%</p>}
                  </div>
                ))}
                
                {aiLoading && (
                  <div className="bg-dark-700/50 p-3 rounded-lg text-sm text-gray-300 mr-6 border-l-2 border-primary-500 animate-pulse">
                    <p>Analyzing telemetry...</p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 border-t border-dark-700 pt-4">
                <input 
                  type="text" 
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiQuery()}
                  placeholder="Ask a question..." 
                  className="flex-1 bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500 text-white"
                />
                <button 
                  onClick={handleAiQuery}
                  disabled={aiLoading || !aiQuery.trim()}
                  className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Ask
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
