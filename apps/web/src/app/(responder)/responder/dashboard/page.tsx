"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "../../../../contexts/AuthContext";
import { apiFetch } from "../../../../lib/api";
import { AlertTriangle, MapPin, Navigation, Clock, CheckCircle2, Shield, Search, ChevronRight, Activity, Phone } from "lucide-react";

// Dynamically import the Map component to avoid SSR issues with MapLibre
const DynamicMap = dynamic(() => import("@jeevan-ai/ui").then((mod) => mod.Map), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-paper-200 skeleton">Loading Live Map...</div>,
});

interface Location { longitude: number; latitude: number; }
interface IncidentRead { id: string; title: string; description: string; severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"; status: "NEW" | "DISPATCHED" | "RESPONDING" | "RESOLVED"; location: Location; created_at: string; }

export default function ResponderDashboard() {
  const { user, logout } = useAuth();
  const [incidents, setIncidents] = useState<IncidentRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"queue" | "map">("queue");

  const defaultCenter: [number, number] = [20.0059, 73.7903]; // Nashik

  useEffect(() => {
    async function fetchIncidents() {
      try {
        const data = await apiFetch<IncidentRead[]>("/incidents");
        setIncidents(data);
      } catch (error) {
        console.error("Failed to fetch incidents:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 15000); // Polling faster for responders
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const updated = await apiFetch<IncidentRead>(`/incidents/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? updated : inc)));
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  const activeIncident = incidents.find(i => i.status === "RESPONDING");
  const queue = incidents.filter(i => i.status === "NEW" || i.status === "DISPATCHED");

  const mapPoints = incidents.map(inc => ({
    id: inc.id, latitude: inc.location.latitude, longitude: inc.location.longitude,
    title: inc.title, severity: inc.severity,
  }));

  return (
    <div className="flex flex-col h-[100dvh] bg-surface-bg overflow-hidden" data-theme="paper">
      {/* Top Navbar */}
      <header className="glass z-30 px-4 py-3 flex items-center justify-between border-b border-surface-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm overflow-hidden p-0.5 border border-surface-border">
            <img src="/logo.png" alt="JEEVAN AI" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-display font-bold text-ink-900 leading-tight">Responder Hub</h1>
            <p className="text-xs text-primary-600 font-medium leading-tight">Unit R-17 • Active</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success-50 text-success-700 text-xs font-semibold border border-success-200">
            <span className="w-2 h-2 rounded-full bg-success-500 animate-sos-pulse" /> Online
          </div>
          <button onClick={() => logout()} className="text-xs text-ink-400 font-medium hover:text-ink-600">Exit</button>
        </div>
      </header>

      {/* Tabs (Mobile Only) */}
      <div className="md:hidden flex bg-paper-100 p-1 m-4 rounded-xl">
        <button onClick={() => setActiveTab("queue")} className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-all ${activeTab === "queue" ? "bg-white shadow-sm text-primary-600" : "text-ink-500"}`}>
          Incident Queue
        </button>
        <button onClick={() => setActiveTab("map")} className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-all ${activeTab === "map" ? "bg-white shadow-sm text-primary-600" : "text-ink-500"}`}>
          Live Map
        </button>
      </div>

      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Queue & Active Incident */}
        <section className={`w-full md:w-96 flex flex-col h-full bg-surface-bg border-r border-surface-border z-20 ${activeTab === "map" ? "hidden md:flex" : "flex"}`}>
          
          {/* Active Incident Banner */}
          {activeIncident ? (
            <div className="p-4 bg-ink-900 text-white shadow-lg shrink-0" data-theme="ink">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-1 bg-alert-600 text-white text-xs font-bold rounded flex items-center gap-1 animate-pulse">
                  <Activity className="w-3 h-3" /> ACTIVE RESPONSE
                </span>
                <span className="text-xs text-ink-300 font-mono">ID: {activeIncident.id.slice(0, 6).toUpperCase()}</span>
              </div>
              <h2 className="text-lg font-display font-bold mb-1">{activeIncident.title}</h2>
              <p className="text-sm text-ink-200 mb-4 line-clamp-2">{activeIncident.description}</p>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-ink-400 mb-0.5">ETA</p>
                  <p className="text-sm font-semibold text-primary-400 flex items-center gap-1"><Clock className="w-3 h-3" /> 4 min</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-ink-400 mb-0.5">Distance</p>
                  <p className="text-sm font-semibold text-ink-50 flex items-center gap-1"><Navigation className="w-3 h-3" /> 1.2 km</p>
                </div>
              </div>

              <div className="space-y-2">
                <button className="w-full h-12 rounded-xl bg-primary-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors">
                  <Navigation className="w-5 h-5" /> Start Navigation
                </button>
                <button 
                  onClick={() => handleStatusUpdate(activeIncident.id, "RESOLVED")}
                  className="w-full h-12 rounded-xl bg-ink-800 text-ink-200 font-semibold flex items-center justify-center gap-2 hover:bg-ink-700 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5" /> Mark Resolved
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-paper-100 border-b border-surface-border shrink-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink-600">
                <CheckCircle2 className="w-4 h-4 text-success-500" /> No active response. You are available.
              </div>
            </div>
          )}

          {/* Queue List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-ink-900 text-sm uppercase tracking-wide">Incident Queue</h3>
              <span className="w-6 h-6 rounded-full bg-paper-200 flex items-center justify-center text-xs font-bold text-ink-600">{queue.length}</span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-24 skeleton w-full" />)}
              </div>
            ) : queue.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8 text-success-500" />
                </div>
                <p className="text-sm text-ink-500 font-medium">Queue is clear.</p>
              </div>
            ) : (
              queue.map((inc) => (
                <div key={inc.id} className="card-elevated p-4 bg-white relative overflow-hidden group">
                  {inc.severity === "CRITICAL" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-alert-600" />}
                  {inc.severity === "HIGH" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-600" />}
                  
                  <div className="flex justify-between items-start mb-2 pl-2">
                    <h4 className="font-display font-bold text-ink-900 text-sm line-clamp-1 flex-1 pr-2">{inc.title}</h4>
                    <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.severity === "CRITICAL" ? "bg-alert-100 text-alert-700" :
                      inc.severity === "HIGH" ? "bg-accent-100 text-accent-700" : "bg-primary-100 text-primary-700"
                    }`}>
                      {inc.severity}
                    </span>
                  </div>
                  
                  <p className="text-xs text-ink-500 mb-4 pl-2 line-clamp-2">{inc.description}</p>
                  
                  <div className="flex items-center justify-between pl-2">
                    <div className="flex items-center gap-3 text-xs font-medium text-ink-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary-500" /> 3.1 km</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Just now</span>
                    </div>
                    {!activeIncident && (
                      <button 
                        onClick={() => handleStatusUpdate(inc.id, "RESPONDING")}
                        className="h-8 px-4 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors shadow-sm active:scale-95"
                      >
                        Accept
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right Panel: Map */}
        <section className={`flex-1 h-full relative ${activeTab === "queue" ? "hidden md:block" : "block"}`}>
          <DynamicMap center={defaultCenter} points={mapPoints} zoom={13} />
          {/* Overlay controls */}
          <div className="absolute top-4 right-4 z-10 space-y-2">
            <button className="w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center text-ink-600 hover:text-primary-600 transition-colors">
              <Navigation className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
