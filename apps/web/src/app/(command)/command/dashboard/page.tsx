"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "../../../../contexts/AuthContext";
import { apiFetch } from "../../../../lib/api";
import { useWebsocket } from "../../../../hooks/useWebsocket";
import { 
  Activity, Shield, AlertTriangle, Users, MapPin, Radio, 
  Brain, BarChart3, CloudRain, Thermometer, Layers, Clock, 
  CheckCircle2, XCircle, Search, Settings, HeartPulse, Video
} from "lucide-react";

const DynamicMap = dynamic(() => import("@jeevan-ai/ui").then((mod) => mod.Map), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-ink-900 skeleton">Loading Tactical Grid...</div>,
});

interface CrowdDensityPrediction { sector_id: string; current_density: number; predicted_density_15m: number; threshold: number; status: string; }

export default function CommandCenterDashboard() {
  const { user } = useAuth();
  const { lastMessage, isConnected } = useWebsocket<unknown>("/ws/incidents");
  const [liveIncidents, setLiveIncidents] = useState<unknown[]>([]);
  const [densityMetrics, setDensityMetrics] = useState<CrowdDensityPrediction[]>([]);

  const defaultCenter: [number, number] = [20.0059, 73.7903]; // Nashik

  useEffect(() => {
    if (lastMessage) {
      // Defer state update to avoid synchronous React 18 strict mode warnings
      setTimeout(() => {
        setLiveIncidents((prev) => [lastMessage, ...prev].slice(0, 30));
      }, 0);
    }
  }, [lastMessage]);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const data = await apiFetch<CrowdDensityPrediction[]>("/analytics/crowd-density");
        setDensityMetrics(data);
      } catch (err) {}
    }
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 15000);
    return () => clearInterval(interval);
  }, []);

  // Use simulation data if no real data
  const mockDensity: CrowdDensityPrediction[] = [
    { sector_id: "Ramkund (Z1)", current_density: 45000, predicted_density_15m: 52000, threshold: 50000, status: "critical" },
    { sector_id: "Panchavati (Z2)", current_density: 28000, predicted_density_15m: 31000, threshold: 40000, status: "warning" },
    { sector_id: "Trimbakeshwar (Z3)", current_density: 15000, predicted_density_15m: 16000, threshold: 30000, status: "safe" },
  ];
  
  const displayMetrics = densityMetrics.length > 0 ? densityMetrics : mockDensity;

  return (
    <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative bg-ink-950">
      
      {/* Top Status Bar */}
      <header className="h-16 bg-ink-950 border-b border-ink-800 flex items-center justify-between px-6 shrink-0 z-10 shadow-lg">
        <div className="flex items-center gap-6">
          <h1 className="font-display font-bold text-white tracking-widest text-lg flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-white flex items-center justify-center overflow-hidden p-0.5 shrink-0">
              <img src="/logo.png" alt="JEEVAN AI" className="w-full h-full object-contain" />
            </div>
            MISSION CONTROL
          </h1>
          <div className="h-6 w-px bg-ink-800" />
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-success-500 animate-sos-pulse" : "bg-alert-500"}`} />
            <span className={isConnected ? "text-success-400 font-bold tracking-wider" : "text-alert-400 font-bold tracking-wider"}>
              {isConnected ? "SATCOM LINK ACTIVE" : "LINK OFFLINE"}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-ink-400 tracking-wider">
            <Clock className="w-3.5 h-3.5" /> {new Date().toISOString().replace("T", " ").slice(0, 19)} UTC
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-ink-900 border border-ink-800 text-xs font-mono text-ink-300">
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-primary-400" /> 1.2M LIVE</span>
            <div className="w-px h-4 bg-ink-700" />
            <span className="flex items-center gap-1.5"><Thermometer className="w-4 h-4 text-accent-500" /> 34°C</span>
          </div>
          <button className="w-10 h-10 rounded-lg bg-ink-900 border border-ink-800 flex items-center justify-center text-ink-400 hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Dynamic Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto lg:overflow-hidden">
        
        {/* Left Column: Intelligence & Predictors */}
        <div className="lg:col-span-3 flex flex-col border-r border-ink-800 bg-ink-950/50 backdrop-blur overflow-y-auto no-scrollbar z-10">
          
          <div className="p-4 border-b border-ink-800 bg-ink-900/20">
            <h2 className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Brain className="w-3 h-3" /> Predictive Intelligence
            </h2>
            
            {/* AI Recommendation Card */}
            <div className="card-elevated bg-ink-950 border border-alert-900/50 shadow-glow-alert p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-alert-500 animate-pulse" />
              <div className="flex items-center gap-2 text-[10px] font-mono text-alert-500 mb-2 tracking-widest font-bold">
                <AlertTriangle className="w-3.5 h-3.5" /> CRITICAL ESCALATION
              </div>
              <h3 className="text-sm font-display font-bold text-white mb-2">Ramkund (Z1) Overcrowding</h3>
              <p className="text-[11px] text-ink-300 mb-4 leading-relaxed font-mono">Prediction: Density will exceed safe threshold by 24% in next 12 minutes. High risk of stampede.</p>
              
              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-[10px] text-ink-400 font-mono">
                  <span>AI CONFIDENCE</span>
                  <span className="text-alert-400 font-bold">96.8%</span>
                </div>
                <div className="w-full bg-ink-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-alert-500 h-1.5 rounded-full shadow-glow-alert" style={{ width: "96.8%" }} />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[9px] text-ink-500 font-mono font-bold">RECOMMENDED TACTICAL ACTIONS:</p>
                <button className="w-full h-9 rounded bg-alert-600 hover:bg-alert-500 text-white text-xs font-bold transition-colors flex items-center justify-between px-3 shadow-md">
                  <span>1. Reroute Entry Gates</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
                <button className="w-full h-9 rounded bg-ink-800 hover:bg-ink-700 text-ink-200 text-xs font-bold transition-colors flex items-center justify-between px-3">
                  <span>2. Dispatch Crowd Control Unit</span>
                  <Users className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Crowd Density Gauges */}
          <div className="p-4 flex-1">
            <h2 className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-3 h-3" /> Live Sector Telemetry
            </h2>
            <div className="space-y-5">
              {displayMetrics.map(m => (
                <div key={m.sector_id}>
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-xs font-mono text-ink-300 font-medium">{m.sector_id}</span>
                    <span className={`text-[10px] font-mono font-bold ${m.predicted_density_15m > m.threshold ? "text-alert-400" : m.current_density > m.threshold * 0.7 ? "text-accent-400" : "text-primary-400"}`}>
                      {m.current_density.toLocaleString()} <span className="text-ink-600">/ {m.threshold.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="w-full bg-ink-900 rounded-full h-2 overflow-hidden border border-ink-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${m.predicted_density_15m > m.threshold ? "bg-alert-500 shadow-glow-alert" : m.current_density > m.threshold * 0.7 ? "bg-accent-500" : "bg-primary-500"}`}
                      style={{ width: `${Math.min((m.current_density / m.threshold) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Global Tactical Map */}
        <div className="lg:col-span-6 flex flex-col relative bg-ink-900">
          <div className="absolute inset-0 grayscale invert contrast-150 hue-rotate-180 brightness-[0.8] saturate-50">
            <DynamicMap center={defaultCenter} zoom={14} className="h-full w-full" />
          </div>
          
          {/* Map Overlays */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <div className="px-3 py-2 rounded-lg bg-ink-950/90 backdrop-blur border border-alert-900/50 shadow-glow-alert text-xs font-mono text-white flex items-center gap-2">
              <span className="live-dot-alert" style={{width: 8, height: 8}} /> 
              <span className="text-alert-400 font-bold">14 ACTIVE SOS INCIDENTS</span>
            </div>
          </div>
          
          <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-end">
            <div className="flex gap-2 bg-ink-950/80 backdrop-blur p-1 rounded-lg border border-ink-800">
              <button className="px-4 py-1.5 rounded bg-ink-800 text-[10px] font-bold text-white tracking-widest">TACTICAL</button>
              <button className="px-4 py-1.5 rounded hover:bg-ink-800 text-[10px] font-bold text-ink-400 tracking-widest transition-colors">HEATMAP</button>
              <button className="px-4 py-1.5 rounded hover:bg-ink-800 text-[10px] font-bold text-ink-400 tracking-widest transition-colors">CCTV</button>
            </div>
            
            <button className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-glow-primary hover:scale-105 transition-transform">
              <TargetIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Column: Fleet & Incident Feed */}
        <div className="lg:col-span-3 flex flex-col border-l border-ink-800 bg-ink-950/50 backdrop-blur overflow-y-auto no-scrollbar z-10">
          
          {/* Resource Readiness */}
          <div className="p-4 border-b border-ink-800 bg-ink-900/20 shrink-0">
            <h2 className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <HeartPulse className="w-3 h-3" /> Fleet Status
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-ink-900 border border-ink-800 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-success-500" />
                <div className="text-2xl font-display font-bold text-white mb-1">42</div>
                <div className="text-[9px] text-ink-400 font-mono tracking-widest uppercase mb-1">Ambulances</div>
                <div className="inline-block px-1.5 py-0.5 rounded bg-success-500/10 text-[9px] text-success-400 font-bold tracking-widest">68% AVAIL</div>
              </div>
              <div className="p-3 rounded-lg bg-ink-900 border border-ink-800 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-accent-500" />
                <div className="text-2xl font-display font-bold text-white mb-1">115</div>
                <div className="text-[9px] text-ink-400 font-mono tracking-widest uppercase mb-1">Responders</div>
                <div className="inline-block px-1.5 py-0.5 rounded bg-accent-500/10 text-[9px] text-accent-400 font-bold tracking-widest">41% AVAIL</div>
              </div>
            </div>
          </div>

          {/* Live Incident Feed */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-[300px]">
            <div className="p-4 border-b border-ink-800 bg-ink-950 shrink-0 flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-[10px] font-bold text-ink-500 uppercase tracking-widest flex items-center gap-2">
                <Radio className="w-3 h-3" /> Live Event Log
              </h2>
              <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
              {/* Mock Incidents if WS is empty */}
              <div className="p-3 bg-alert-950/30 rounded-lg border border-alert-900/50 animate-fade-in-down">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-alert-400 font-bold bg-alert-500/10 px-1.5 py-0.5 rounded">SOS-9921</span>
                  <span className="text-[10px] font-mono text-ink-500">10:42:15</span>
                </div>
                <p className="text-xs text-ink-200 font-medium">Medical Emergency (Cardiac)</p>
                <p className="text-[10px] text-ink-400 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Godavari Ghat, Sector 4</p>
                <div className="mt-2 flex gap-2">
                  <button className="h-6 px-2 rounded bg-ink-800 text-[9px] font-bold text-white hover:bg-ink-700">DISPATCH AMB</button>
                </div>
              </div>

              <div className="p-3 bg-ink-900/50 rounded-lg border border-ink-800 animate-fade-in-down" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-primary-400 font-bold bg-primary-500/10 px-1.5 py-0.5 rounded">SYS-INFO</span>
                  <span className="text-[10px] font-mono text-ink-500">10:38:02</span>
                </div>
                <p className="text-xs text-ink-200 font-medium">Drone Unit D-04 battery low, returning to base.</p>
              </div>
              
              <div className="p-3 bg-accent-950/30 rounded-lg border border-accent-900/50 animate-fade-in-down" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-accent-400 font-bold bg-accent-500/10 px-1.5 py-0.5 rounded">CROWD-WARN</span>
                  <span className="text-[10px] font-mono text-ink-500">10:35:55</span>
                </div>
                <p className="text-xs text-ink-200 font-medium">Density threshold reached at Gate 2.</p>
              </div>

              {liveIncidents.map((msg, i) => (
                <div key={`ws-${i}`} className="p-3 bg-ink-900 rounded-lg border border-ink-800 break-words animate-fade-in-down">
                  <span className="text-[10px] font-mono text-primary-500 block mb-1">[{new Date().toLocaleTimeString()}]</span>
                  <span className="text-xs text-ink-300 font-mono">{JSON.stringify(msg)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function TargetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
