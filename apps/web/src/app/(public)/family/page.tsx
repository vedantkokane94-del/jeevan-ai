"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  ArrowLeft, Users, MapPin, Battery, Clock, Shield, 
  CheckCircle2, AlertTriangle, Phone, Plus, Activity,
  Navigation, Share2, WifiOff
} from "lucide-react";

const DynamicMap = dynamic(() => import("@jeevan-ai/ui").then((mod) => mod.Map), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-paper-200 skeleton" />,
});

interface FamilyMember { 
  id: string; name: string; status: "safe" | "emergency" | "offline"; 
  location: string; battery: number; lastSeen: string; avatar: string; 
  lat: number; lng: number; 
}

const family: FamilyMember[] = [
  { id: "1", name: "Papa", status: "safe", location: "Home — Panchavati", battery: 78, lastSeen: "2 min ago", avatar: "👨", lat: 20.0070, lng: 73.7915 },
  { id: "2", name: "Mummy", status: "safe", location: "Ramkund Ghat Area", battery: 45, lastSeen: "5 min ago", avatar: "👩", lat: 20.0059, lng: 73.7903 },
  { id: "3", name: "Dadi", status: "offline", location: "Last: Home — Panchavati", battery: 12, lastSeen: "35 min ago", avatar: "👵", lat: 20.0070, lng: 73.7915 },
  { id: "4", name: "Bhai", status: "safe", location: "Trimbakeshwar Temple", battery: 92, lastSeen: "Just now", avatar: "👦", lat: 19.9325, lng: 73.5311 },
];

const timeline = [
  { time: "10:15 AM", text: "Mummy arrived at Ramkund Ghat Area", type: "info" },
  { time: "10:02 AM", text: "Dadi's phone went offline (low battery)", type: "warning" },
  { time: "09:45 AM", text: "Bhai checked in at Trimbakeshwar Temple", type: "info" },
  { time: "09:30 AM", text: "All family members marked safe", type: "success" },
];

export default function FamilySafety() {
  const [showMap, setShowMap] = useState(false);

  const safeCount = family.filter(m => m.status === "safe").length;
  
  const mapPoints = family.map(m => ({
    id: m.id,
    latitude: m.lat,
    longitude: m.lng,
    title: m.name,
    severity: (m.status === "emergency" ? "CRITICAL" : m.status === "offline" ? "HIGH" : "LOW") as "CRITICAL" | "HIGH" | "LOW"
  }));

  return (
    <div className="min-h-[100dvh] flex flex-col bg-surface-bg" data-theme="paper">
      <header className="glass sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-surface-border">
        <div className="flex items-center gap-3">
          <Link href="/emergency" className="w-9 h-9 rounded-xl bg-paper-200 flex items-center justify-center text-ink-600 hover:bg-paper-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-display font-bold text-ink-900 leading-tight">Family Safety</h1>
            <p className="text-[10px] text-ink-400 font-mono">{safeCount}/{family.length} members safe</p>
          </div>
        </div>
        <button className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100 transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {/* ═══════ MINI MAP REVEAL ═══════ */}
      <div className={`w-full transition-all duration-500 ease-in-out relative overflow-hidden bg-ink-950 ${showMap ? "h-48 opacity-100" : "h-0 opacity-0"}`}>
        {showMap && (
          <>
            <DynamicMap center={[20.0059, 73.7903]} zoom={12} points={mapPoints} theme="dark" />
            <div className="absolute top-2 left-2 px-2 py-1 rounded bg-ink-900/80 backdrop-blur border border-ink-800 text-[10px] text-white font-mono flex items-center gap-1.5">
              <span className="live-dot" style={{width:6, height:6}}/> Live Tracker
            </div>
          </>
        )}
      </div>

      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        
        {/* Actions Row */}
        <div className="flex gap-2 mb-5">
          <button 
            onClick={() => setShowMap(!showMap)}
            className={`flex-1 h-11 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${showMap ? "bg-primary-600 text-white" : "bg-white border border-paper-300 text-ink-700 shadow-sm hover:border-primary-300"}`}
          >
            <MapPin className="w-4 h-4" /> {showMap ? "Hide Map" : "View Map"}
          </button>
          <button className="flex-1 h-11 rounded-xl bg-white border border-paper-300 text-ink-700 shadow-sm text-xs font-semibold flex items-center justify-center gap-2 hover:border-primary-300 transition-colors">
            <CheckCircle2 className="w-4 h-4 text-success-500" /> Check In
          </button>
        </div>

        {/* Alert for offline member */}
        <div className="card-elevated p-4 mb-6 flex flex-col gap-3 bg-accent-50 border-accent-200 animate-slide-in-bottom">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center shrink-0">
                <WifiOff className="w-5 h-5 text-accent-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-accent-900">Dadi is offline</p>
                <p className="text-xs text-accent-700 mt-0.5">Last seen 35 min ago</p>
              </div>
            </div>
            <span className="px-2 py-1 rounded bg-accent-100 text-[10px] font-bold text-accent-800 tracking-wider">LOW BATTERY</span>
          </div>
          <div className="flex gap-2 mt-1">
             <a href="tel:+919999999999" className="flex-1 h-9 rounded-lg bg-accent-600 flex items-center justify-center text-white text-xs font-semibold gap-1.5 shadow-sm">
               <Phone className="w-3.5 h-3.5" /> Call
             </a>
             <button className="flex-1 h-9 rounded-lg bg-white border border-accent-200 flex items-center justify-center text-accent-700 text-xs font-semibold gap-1.5 shadow-sm">
               <Navigation className="w-3.5 h-3.5" /> Route to Last Known
             </button>
          </div>
        </div>

        {/* Family Members */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wide">Family Circle</h2>
          <button className="text-[10px] font-bold text-primary-600 uppercase flex items-center gap-1">
            <Share2 className="w-3 h-3" /> Share Group Info
          </button>
        </div>
        
        <div className="space-y-3 mb-8">
          {family.map((m, i) => (
            <div key={m.name} className={`card-elevated p-4 animate-slide-in-bottom ${m.status === "emergency" ? "border-alert-300 ring-2 ring-alert-100 bg-alert-50/50" : m.status === "offline" ? "opacity-75 bg-paper-100 border-paper-200" : ""}`} style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-sm border border-paper-200">{m.avatar}</div>
                  <div>
                    <h3 className="font-display font-bold text-ink-900 text-sm flex items-center gap-1.5">
                      {m.name}
                      {m.status === "safe" && <CheckCircle2 className="w-3.5 h-3.5 text-success-500" />}
                      {m.status === "offline" && <WifiOff className="w-3 h-3 text-ink-400" />}
                      {m.status === "emergency" && <AlertTriangle className="w-3.5 h-3.5 text-alert-500 animate-pulse" />}
                    </h3>
                    <p className="text-xs text-ink-500 mt-0.5 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3 h-3" /> {m.lastSeen}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold ${m.battery < 20 ? "bg-alert-100 text-alert-700" : "bg-success-50 text-success-700"}`}>
                   <Battery className="w-3 h-3" /> {m.battery}%
                </div>
              </div>
              
              <div className="p-2.5 rounded-lg bg-paper-100/50 border border-paper-200 flex items-center gap-2">
                <MapPin className={`w-4 h-4 shrink-0 ${m.status === "safe" ? "text-primary-500" : "text-ink-400"}`} />
                <span className="text-xs text-ink-700 font-medium truncate">{m.location}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Activity Timeline */}
        <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-4">Recent Activity</h2>
        <div className="space-y-0 px-2">
          {timeline.map((t, i) => (
            <div key={i} className="flex gap-4 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-2.5 h-2.5 rounded-full mt-1 ${t.type === "warning" ? "bg-accent-500 ring-2 ring-accent-100" : t.type === "success" ? "bg-success-500" : "bg-primary-400"}`} />
                {i < timeline.length - 1 && <div className="w-px h-full bg-paper-300 min-h-[36px] my-1" />}
              </div>
              <div className="pb-5">
                <p className="text-sm font-medium text-ink-800">{t.text}</p>
                <p className="text-[10px] text-ink-400 font-mono mt-1">{t.time}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
