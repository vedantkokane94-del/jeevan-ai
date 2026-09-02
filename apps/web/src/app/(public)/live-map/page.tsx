"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft, Shield, MapPin, Ambulance, Users, Heart,
  Hospital, AlertTriangle, Car, Eye, EyeOff, Layers,
  Activity, Search, ChevronDown
} from "lucide-react";

const DynamicMap = dynamic(() => import("@jeevan-ai/ui").then((mod) => mod.Map), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-ink-900 skeleton">Loading Kumbh Map Engine...</div>,
});

/* ─── Map Layer Definitions ─── */
interface MapLayer {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  enabled: boolean;
}

const DEFAULT_LAYERS: MapLayer[] = [
  { id: "zones", label: "Kumbh Zones", icon: MapPin, color: "bg-primary-600", enabled: true },
  { id: "medical", label: "Medical Camps", icon: Hospital, color: "bg-alert-600", enabled: true },
  { id: "ambulances", label: "Ambulances", icon: Ambulance, color: "bg-accent-600", enabled: true },
  { id: "volunteers", label: "Volunteers", icon: Users, color: "bg-success-600", enabled: false },
  { id: "police", label: "Police Posts", icon: Shield, color: "bg-blue-600", enabled: false },
  { id: "parking", label: "Parking", icon: Car, color: "bg-ink-600", enabled: false },
  { id: "heatmap", label: "Crowd Heatmap", icon: Activity, color: "bg-alert-700", enabled: false },
  { id: "corridors", label: "Emergency Corridors", icon: AlertTriangle, color: "bg-accent-700", enabled: false },
];

/* ─── Real Google Maps Reference Markers (Nashik & Trimbakeshwar Kumbh Area) ─── */
const ZONE_POINTS = [
  { id: "ramkund", latitude: 20.0063, longitude: 73.7925, title: "Ramkund Ghat — Critical Density", severity: "CRITICAL" as const },
  { id: "panchavati", latitude: 20.0078, longitude: 73.7945, title: "Panchavati / Kalaram — High Risk", severity: "HIGH" as const },
  { id: "kapaleshwar", latitude: 20.0068, longitude: 73.7932, title: "Kapaleshwar Mandir Sector", severity: "HIGH" as const },
  { id: "godavari", latitude: 20.0055, longitude: 73.7915, title: "Godavari Main Snan Ghat", severity: "HIGH" as const },
  { id: "tapovan", latitude: 20.0012, longitude: 73.8048, title: "Tapovan Main Camp & Sector", severity: "MEDIUM" as const },
  { id: "trimbak", latitude: 19.9322, longitude: 73.5302, title: "Trimbakeshwar Temple Sector", severity: "MEDIUM" as const },
  { id: "kushavarta", latitude: 19.9335, longitude: 73.5290, title: "Kushavarta Kund Trimbakeshwar", severity: "LOW" as const },
];

const MEDICAL_POINTS = [
  { id: "mc01", latitude: 20.0020, longitude: 73.7785, title: "Civil Hospital Nashik (Trauma Center)", severity: "LOW" as const },
  { id: "mc02", latitude: 20.0060, longitude: 73.7930, title: "MC-02 Ramkund Emergency Camp", severity: "HIGH" as const },
  { id: "mc03", latitude: 20.0082, longitude: 73.7950, title: "MC-03 Panchavati Aid Station", severity: "MEDIUM" as const },
  { id: "mc04", latitude: 20.0015, longitude: 73.8050, title: "MC-04 Tapovan Field Hospital", severity: "LOW" as const },
];

const AMBULANCE_POINTS = [
  { id: "amb08", latitude: 20.0035, longitude: 73.7820, title: "AMB-08 — Moving on Shortest Route", severity: "CRITICAL" as const },
  { id: "amb01", latitude: 20.0020, longitude: 73.7785, title: "AMB-01 — Civil Hospital Standby", severity: "LOW" as const },
  { id: "amb12", latitude: 20.0080, longitude: 73.7940, title: "AMB-12 — Panchavati Corridor", severity: "MEDIUM" as const },
];

const POLICE_POINTS = [
  { id: "pol01", latitude: 20.0065, longitude: 73.7920, title: "Ramkund Mission Control Outpost", severity: "HIGH" as const },
  { id: "pol02", latitude: 20.0075, longitude: 73.7940, title: "Panchavati Police Station", severity: "MEDIUM" as const },
  { id: "pol03", latitude: 19.9980, longitude: 73.7845, title: "CBS Transit Security Hub", severity: "LOW" as const },
  { id: "pol04", latitude: 19.9328, longitude: 73.5315, title: "Trimbakeshwar Control Post", severity: "MEDIUM" as const },
];

const PARKING_POINTS = [
  { id: "prk01", latitude: 20.0012, longitude: 73.8048, title: "Tapovan Mega Pilgrim Parking P1", severity: "LOW" as const },
  { id: "prk02", latitude: 20.0150, longitude: 73.7980, title: "Nilgiri Baug Bus & Vehicle Yard P2", severity: "LOW" as const },
  { id: "prk03", latitude: 19.9510, longitude: 73.8320, title: "Nashik Road Station Shuttle Yard P3", severity: "LOW" as const },
  { id: "prk04", latitude: 19.9300, longitude: 73.5380, title: "Trimbakeshwar Bypass Parking P4", severity: "LOW" as const },
];

const VOLUNTEER_POINTS = [
  { id: "vol01", latitude: 20.0062, longitude: 73.7928, title: "Volunteer Post 1 — Ramkund Ghat Assistance", severity: "LOW" as const },
  { id: "vol02", latitude: 20.0079, longitude: 73.7948, title: "Volunteer Post 2 — Kalaram Temple Crowd Flow", severity: "LOW" as const },
  { id: "vol03", latitude: 20.0015, longitude: 73.8052, title: "Volunteer Post 3 — Tapovan Lost & Found Booth", severity: "LOW" as const },
];

export default function LiveMapPage() {
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [showLayers, setShowLayers] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const toggleLayer = useCallback((id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l));
  }, []);

  const enabledLayers = layers.filter(l => l.enabled);

  // Combine points based on active layers
  const getActivePoints = useCallback(() => {
    const points: typeof ZONE_POINTS = [];
    if (layers.find(l => l.id === "zones")?.enabled) points.push(...ZONE_POINTS);
    if (layers.find(l => l.id === "medical")?.enabled) points.push(...MEDICAL_POINTS);
    if (layers.find(l => l.id === "ambulances")?.enabled) points.push(...AMBULANCE_POINTS);
    if (layers.find(l => l.id === "police")?.enabled) points.push(...POLICE_POINTS);
    if (layers.find(l => l.id === "parking")?.enabled) points.push(...PARKING_POINTS);
    if (layers.find(l => l.id === "volunteers")?.enabled) points.push(...VOLUNTEER_POINTS);
    return points;
  }, [layers]);

  return (
    <div className="h-[100dvh] flex flex-col bg-ink-950" data-theme="ink">

      {/* ═══════ HEADER ═══════ */}
      <header className="glass-dark z-30 px-3 sm:px-4 py-2 flex items-center justify-between shrink-0 border-b border-ink-800 gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/emergency" className="w-8 h-8 rounded-lg bg-ink-900 border border-ink-800 flex items-center justify-center" id="back-button">
            <ArrowLeft className="w-4 h-4 text-ink-300" />
          </Link>
          <div>
            <h1 className="text-sm font-display font-bold text-white flex items-center gap-1.5 leading-none">
              <Layers className="w-4 h-4 text-primary-500" />
              Live Kumbh Map
            </h1>
            <p className="text-[9px] text-ink-400 font-mono mt-0.5">{enabledLayers.length} active layers</p>
          </div>
        </div>

        {/* Live Status Indicators Integrated in Header (Visible on Mobile & Desktop, NO Map Overlap) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-ink-900 border border-ink-800 text-[10px] sm:text-[11px] font-mono text-white flex items-center gap-1 sm:gap-1.5">
            <span className="live-dot" style={{ width: 6, height: 6 }} />
            LIVE • Nashik Kumbh
          </div>

          <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-ink-900 border border-ink-800 text-[10px] sm:text-[11px] font-mono flex items-center gap-1 sm:gap-1.5">
            <span className="live-dot-alert" style={{ width: 6, height: 6 }} />
            <span className="text-alert-400 font-bold">{ZONE_POINTS.filter(z => z.severity === "CRITICAL" || z.severity === "HIGH").length}</span>
            <span className="text-ink-300">High Risk</span>
          </div>
        </div>

        {/* Layers Dropdown Toggle */}
        <button
          onClick={() => setShowLayers(!showLayers)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink-900 border border-ink-800 text-xs font-semibold text-ink-300 hover:text-white transition-colors shrink-0"
          id="layers-toggle"
        >
          <Layers className="w-3.5 h-3.5 text-primary-400" />
          Layers ({enabledLayers.length})
          <ChevronDown className={`w-3 h-3 transition-transform ${showLayers ? "rotate-180" : ""}`} />
        </button>
      </header>

      {/* ═══════ LAYER CONTROLS ═══════ */}
      {showLayers && (
        <div className="absolute top-14 right-4 z-40 w-64 card-elevated bg-ink-950/95 backdrop-blur border-ink-800 p-3 animate-slide-in-bottom shadow-2xl">
          <p className="text-[10px] text-ink-400 font-mono uppercase tracking-wider mb-3">Toggle Map Layers</p>
          <div className="space-y-1">
            {layers.map(layer => (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${layer.enabled ? "bg-ink-800/80 text-white" : "text-ink-400 hover:bg-ink-900"}`}
                id={`layer-${layer.id}`}
              >
                <div className={`w-7 h-7 rounded-lg ${layer.enabled ? layer.color : "bg-ink-800"} flex items-center justify-center transition-colors`}>
                  <layer.icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="flex-1 font-medium text-xs">{layer.label}</span>
                {layer.enabled ? (
                  <Eye className="w-3.5 h-3.5 text-primary-400" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-ink-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══════ MAP ═══════ */}
      <div className="flex-1 relative">
        <DynamicMap
          center={[20.0050, 73.7900]}
          zoom={14}
          theme="satellite"
          showAmbulanceRoute={true}
          points={getActivePoints()}
          className="h-full w-full"
          onPointClick={(id) => setSelectedZone(id)}
        />

        {/* Bottom Right Layer Legend (Separated on bottom-right to avoid bottom-left HUD overlap) */}
        <div className="absolute bottom-3 right-3 z-10 flex gap-1.5 max-w-[50vw] sm:max-w-md overflow-x-auto no-scrollbar pointer-events-auto">
          {enabledLayers.map(layer => (
            <div key={layer.id} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ink-950/90 backdrop-blur border border-ink-800 text-[10px] text-ink-300 font-medium shrink-0 shadow-lg">
              <div className={`w-2 h-2 rounded-full ${layer.color}`} />
              {layer.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
