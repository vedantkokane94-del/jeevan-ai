"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Zap, MapPin, Navigation, Settings2, Clock, AlertTriangle, Play, Pause, ArrowRight } from "lucide-react";

const DynamicMap = dynamic(() => import("@jeevan-ai/ui").then((mod) => mod.Map), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-ink-900 skeleton">Loading Routing Engine...</div>,
});

export default function SmartCorridors() {
  const [activeCorridor, setActiveCorridor] = useState<string>("c1");
  const [isRouting, setIsRouting] = useState(true);

  const defaultCenter: [number, number] = [20.0059, 73.7903]; // Nashik

  const corridors = [
    { id: "c1", name: "Alpha Corridor", from: "Godavari Ghat", to: "Civil Hospital", eta: "4m 12s", status: "optimal", traffic: "low" },
    { id: "c2", name: "Bravo Corridor", from: "Trimbakeshwar", to: "Base Camp A", eta: "12m 45s", status: "degraded", traffic: "high" },
    { id: "c3", name: "Charlie Corridor", from: "Ramkund", to: "Sector 4 Med", eta: "8m 30s", status: "rerouting", traffic: "blocked" },
  ];

  return (
    <div className="flex-1 flex h-[100dvh] overflow-hidden relative" data-theme="ink">
      
      {/* Sidebar Controls */}
      <div className="w-80 lg:w-96 flex flex-col bg-ink-950 border-r border-ink-800 shrink-0 z-10 shadow-2xl relative">
        <div className="p-5 border-b border-ink-800 bg-ink-950">
          <h2 className="text-sm font-display font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent-500" /> Smart Corridors
          </h2>
          <p className="text-[10px] text-ink-400 font-mono mt-1 leading-relaxed">Dynamic Green Corridor management for high-priority emergency routing.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold text-ink-500 uppercase tracking-widest flex items-center gap-2">
              <Navigation className="w-3 h-3" /> Active Corridors
            </h3>
            <button 
              onClick={() => setIsRouting(!isRouting)}
              className={`p-1.5 rounded-lg ${isRouting ? "bg-accent-500/20 text-accent-400" : "bg-ink-800 text-ink-400"}`}
            >
              {isRouting ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>

          <div className="space-y-3">
            {corridors.map((c, i) => (
              <button 
                key={c.id}
                onClick={() => setActiveCorridor(c.id)}
                className={`w-full card-elevated p-4 text-left border transition-all animate-slide-in-bottom ${activeCorridor === c.id ? "border-accent-500 bg-accent-950/20 shadow-glow-accent" : "border-ink-800 bg-ink-900 hover:border-ink-600"}`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-display font-bold text-sm ${activeCorridor === c.id ? "text-accent-400" : "text-white"}`}>{c.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${c.status === 'optimal' ? 'bg-success-500/20 text-success-400' : c.status === 'degraded' ? 'bg-alert-500/20 text-alert-400' : 'bg-primary-500/20 text-primary-400'}`}>
                    {c.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-ink-300 font-medium mb-1">
                  <span className="truncate flex-1">{c.from}</span>
                  <ArrowRight className="w-3 h-3 text-ink-600 shrink-0" />
                  <span className="truncate flex-1 text-right">{c.to}</span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-800">
                  <div className="flex items-center gap-1.5 text-[10px] text-ink-400 font-mono">
                    <Clock className="w-3 h-3 text-accent-500" /> ETA {c.eta}
                  </div>
                  <div className="text-[10px] text-ink-500 font-bold uppercase flex items-center gap-1">
                    {c.traffic === "high" && <AlertTriangle className="w-3 h-3 text-alert-500" />}
                    Traffic: {c.traffic}
                  </div>
                </div>
              </button>
            ))}
          </div>

        </div>

        <div className="p-5 border-t border-ink-800 bg-ink-950 shrink-0">
          <button className="w-full h-12 rounded-xl bg-accent-600 hover:bg-accent-500 text-white font-bold tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent-600/20">
            <Settings2 className="w-4 h-4" /> GENERATE NEW ROUTE
          </button>
        </div>
      </div>

      {/* Main Map View */}
      <div className="flex-1 flex flex-col relative bg-ink-900">
        
        {/* Map Layer */}
        <div className="absolute inset-0 grayscale invert contrast-125 hue-rotate-180 brightness-[0.7] saturate-50">
          <DynamicMap center={defaultCenter} zoom={15} className="h-full w-full" />
        </div>

        {/* Mock Corridor Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
           {/* Simulate a glowing path on the map */}
           <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
             {activeCorridor === "c1" && (
                <path d="M 300 400 Q 400 300 500 450 T 700 200" fill="none" stroke="#22d3ee" strokeWidth="8" strokeLinecap="round" className="animate-pulse" style={{ filter: "drop-shadow(0 0 12px rgba(34, 211, 238, 0.8))" }} />
             )}
             {activeCorridor === "c2" && (
                <path d="M 200 600 Q 350 400 450 500 T 800 300" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 8px rgba(245, 158, 11, 0.8))" }} />
             )}
             {activeCorridor === "c3" && (
                <path d="M 400 200 Q 300 350 500 550" fill="none" stroke="#ef4444" strokeWidth="6" strokeDasharray="10 10" strokeLinecap="round" className="animate-pulse" />
             )}
           </svg>
        </div>

        <div className="absolute top-4 right-4 z-20 w-72 card-elevated p-4 bg-ink-950/90 backdrop-blur border-ink-800 animate-slide-in-right">
          <h3 className="text-xs font-semibold text-ink-300 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-accent-500" /> Route Optimizer
          </h3>
          <p className="text-[10px] font-mono text-ink-400 leading-relaxed mb-4">
            AI has synchronized 14 traffic signals along <span className="text-accent-400 font-bold">{corridors.find(c => c.id === activeCorridor)?.name}</span>. Predicted time savings: <span className="text-success-400 font-bold">12m 30s</span>.
          </p>
          <div className="h-2 w-full bg-ink-800 rounded-full overflow-hidden">
             <div className="h-full bg-accent-500 shadow-glow-accent animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>

      </div>

    </div>
  );
}
