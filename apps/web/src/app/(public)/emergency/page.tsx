"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Siren, Hospital, Mic, HeartPulse, Droplets, Users,
  ShieldAlert, Phone, ChevronRight,
  MapPin, Clock, Shield, Activity, Thermometer,
  AlertTriangle, Wifi, WifiOff, Navigation,
  Radio, Heart, Search as SearchIcon, Map as MapIcon
} from "lucide-react";

/* ─── Simulated Live Data ─── */
const KUMBH_ZONES = ["Ramkund", "Panchavati", "Godavari Ghat", "Trimbakeshwar", "Kushavarta"] as const;
type CrowdLevel = "Low" | "Moderate" | "High" | "Critical";

interface LiveStatus {
  zone: string;
  crowdLevel: CrowdLevel;
  temperature: number;
  medicalRisk: "Low" | "Moderate" | "High";
  activeAlerts: number;
  pilgrimsNearby: string;
  nearestAmbulance: string;
  nearestMedCamp: string;
  etaMinutes: number;
}

function useSimulatedLiveData(): LiveStatus {
  const [data, setData] = useState<LiveStatus>({
    zone: "Ramkund",
    crowdLevel: "High",
    temperature: 34,
    medicalRisk: "Moderate",
    activeAlerts: 3,
    pilgrimsNearby: "2.4L",
    nearestAmbulance: "AMB-08",
    nearestMedCamp: "MC-04",
    etaMinutes: 3,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        temperature: 32 + Math.floor(Math.random() * 5),
        activeAlerts: 2 + Math.floor(Math.random() * 4),
        etaMinutes: 2 + Math.floor(Math.random() * 4),
      }));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return data;
}

/* ─── Service Cards Data ─── */
const services = [
  { href: "/hospitals", icon: Hospital, title: "Hospital Finder", desc: "AI-recommended", color: "bg-primary-600" },
  { href: "/voice", icon: Mic, title: "Voice SOS", desc: "Hindi, Marathi, English", color: "bg-accent-600" },
  { href: "/first-aid", icon: HeartPulse, title: "First Aid", desc: "Help until help arrives", color: "bg-success-600" },
  { href: "/blood", icon: Droplets, title: "Blood Network", desc: "Find donors", color: "bg-alert-700" },
  { href: "/family", icon: Users, title: "Family Safety", desc: "Track loved ones", color: "bg-primary-700" },
  { href: "/kumbh-pulse", icon: Activity, title: "Kumbh Pulse", desc: "Live dashboard", color: "bg-ink-600" },
  { href: "/live-map", icon: MapIcon, title: "Live Map", desc: "Interactive zones", color: "bg-emerald-600" },
  { href: "/lost-person", icon: SearchIcon, title: "Lost Person", desc: "Find & report", color: "bg-purple-600" },
];

/* ─── Crowd Level Color Map ─── */
function crowdColor(level: CrowdLevel) {
  switch (level) {
    case "Critical": return "text-alert-600 bg-alert-50";
    case "High": return "text-accent-700 bg-accent-50";
    case "Moderate": return "text-primary-600 bg-primary-50";
    case "Low": return "text-success-600 bg-success-50";
  }
}

function riskColor(risk: string) {
  switch (risk) {
    case "High": return "text-alert-600";
    case "Moderate": return "text-accent-600";
    default: return "text-success-600";
  }
}

/* ─── Main Component ─── */
export default function EmergencyHub() {
  const live = useSimulatedLiveData();

  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator !== "undefined") return navigator.onLine;
    return true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col" data-theme="paper">

      {/* ═══════ LIVE KUMBH STATUS BAR ═══════ */}
      <header className="glass sticky top-0 z-40 border-b border-paper-300">
        {/* Top Row: Branding + Network */}
        <div className="px-4 py-2.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-sm">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-ink-900 text-sm leading-none">JEEVAN <span className="text-primary-600">AI</span></span>
              <p className="text-[9px] text-ink-300 font-medium leading-none mt-0.5">Simhastha Kumbh Nashik 2027</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-[10px] font-bold uppercase tracking-wider">
              <span className="live-dot" style={{ width: 6, height: 6 }} />
              LIVE
            </div>
            <div className="flex items-center gap-1 text-xs text-ink-300">
              {isOnline ? <Wifi className="w-3.5 h-3.5 text-success-500" /> : <WifiOff className="w-3.5 h-3.5 text-alert-500" />}
            </div>
          </div>
        </div>

        {/* Bottom Row: Live Stats Ticker */}
        <div className="px-4 pb-2.5 flex items-center gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-paper-100 border border-paper-300 text-xs shrink-0">
            <MapPin className="w-3 h-3 text-primary-500" />
            <span className="font-semibold text-ink-700">{live.zone}</span>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs shrink-0 ${crowdColor(live.crowdLevel)}`}>
            <Users className="w-3 h-3" />
            <span className="font-semibold">Crowd {live.crowdLevel}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-paper-100 border border-paper-300 text-xs shrink-0">
            <Thermometer className="w-3 h-3 text-accent-500" />
            <span className="font-semibold text-ink-700">{live.temperature}°C</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-alert-50 border border-alert-200 text-xs shrink-0">
            <AlertTriangle className="w-3 h-3 text-alert-500" />
            <span className="font-semibold text-alert-700">{live.activeAlerts} Alerts</span>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-6 max-w-2xl mx-auto w-full">

        {/* ═══════ LIVE METRICS RING ═══════ */}
        <div className="grid grid-cols-4 gap-2 mt-4 mb-2">
          <div className="metric-card p-3 text-center animate-count-up">
            <p className="text-[9px] text-ink-300 font-semibold uppercase tracking-wide mb-1">ETA</p>
            <p className="text-xl font-display font-bold text-primary-600">{live.etaMinutes}<span className="text-xs font-normal text-ink-300">m</span></p>
          </div>
          <div className="metric-card p-3 text-center animate-count-up delay-100">
            <p className="text-[9px] text-ink-300 font-semibold uppercase tracking-wide mb-1">Ambulance</p>
            <p className="text-sm font-display font-bold text-ink-800">{live.nearestAmbulance}</p>
          </div>
          <div className="metric-card p-3 text-center animate-count-up delay-200">
            <p className="text-[9px] text-ink-300 font-semibold uppercase tracking-wide mb-1">Med Camp</p>
            <p className="text-sm font-display font-bold text-ink-800">{live.nearestMedCamp}</p>
          </div>
          <div className="metric-card p-3 text-center animate-count-up delay-300">
            <p className="text-[9px] text-ink-300 font-semibold uppercase tracking-wide mb-1">Risk</p>
            <p className={`text-sm font-display font-bold ${riskColor(live.medicalRisk)}`}>{live.medicalRisk}</p>
          </div>
        </div>

        {/* ═══════ GIANT SOS BUTTON ═══════ */}
        <div className="flex flex-col items-center pt-6 pb-8">
          <Link
            href="/sos"
            className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-alert-600 text-white flex flex-col items-center justify-center shadow-2xl shadow-alert-600/30 hover:bg-alert-700 transition-all active:scale-95 animate-sos-pulse animate-glow-alert"
            aria-label="Trigger Emergency SOS"
            id="sos-button"
          >
            {/* Pulse rings */}
            <span className="absolute inset-0 rounded-full border-2 border-alert-400 opacity-0" style={{ animation: "sos-ring 2s ease-out infinite" }} />
            <span className="absolute inset-0 rounded-full border-2 border-alert-400 opacity-0" style={{ animation: "sos-ring 2s ease-out infinite 0.6s" }} />
            <span className="absolute inset-0 rounded-full border-2 border-alert-400 opacity-0" style={{ animation: "sos-ring 2s ease-out infinite 1.2s" }} />

            <Siren className="w-12 h-12 sm:w-14 sm:h-14 mb-1" />
            <span className="text-2xl sm:text-3xl font-display font-bold tracking-wide">SOS</span>
            <span className="text-xs opacity-80 mt-0.5">Tap for Emergency</span>
          </Link>

          {/* Sub-stats */}
          <div className="flex items-center gap-5 mt-5 text-xs text-ink-300">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary-500" />
              Avg {live.etaMinutes} min response
            </span>
            <span className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-success-500" />
              {live.pilgrimsNearby} pilgrims nearby
            </span>
          </div>
        </div>

        {/* ═══════ QUICK ACTIONS GRID ═══════ */}
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-ink-300 uppercase tracking-wide mb-3">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {services.map((s, i) => (
              <Link
                key={s.href}
                href={s.href}
                className="card-elevated p-3 flex flex-col items-center gap-2 group card-interactive text-center animate-count-up"
                style={{ animationDelay: `${i * 50}ms` }}
                id={`action-${s.href.slice(1)}`}
              >
                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-ink-900 text-[11px] leading-tight">{s.title}</h3>
                  <p className="text-[9px] text-ink-300 mt-0.5 line-clamp-1 hidden sm:block">{s.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ═══════ AI INSIGHT CARD ═══════ */}
        <div className="card-elevated p-4 mb-4 border-l-4 border-l-accent-500 animate-slide-in-bottom">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-accent-600" />
            <span className="text-[10px] font-bold text-accent-600 uppercase tracking-wider">AI Health Alert</span>
          </div>
          <p className="text-sm text-ink-700 font-medium">
            Crowd density at <strong>Ramkund</strong> is rising. Heat index at <strong>{live.temperature}°C</strong>. 
            Medical teams have been pre-positioned at sectors C and D.
          </p>
          <Link href="/kumbh-pulse" className="inline-flex items-center gap-1 text-xs text-primary-600 font-semibold mt-2 hover:text-primary-700 transition-colors">
            View Kumbh Pulse <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ═══════ EMERGENCY NUMBERS ═══════ */}
        <div className="card-elevated p-4 flex items-center justify-between">
          <div className="text-center">
            <p className="text-[9px] text-ink-300 font-medium mb-0.5 uppercase">Emergency</p>
            <a href="tel:112" className="text-2xl font-display font-bold text-alert-600">112</a>
          </div>
          <div className="h-10 w-px bg-paper-300" />
          <div className="text-center">
            <p className="text-[9px] text-ink-300 font-medium mb-0.5 uppercase">Ambulance</p>
            <a href="tel:108" className="text-2xl font-display font-bold text-primary-600">108</a>
          </div>
          <div className="h-10 w-px bg-paper-300" />
          <div className="text-center">
            <p className="text-[9px] text-ink-300 font-medium mb-0.5 uppercase">Women</p>
            <a href="tel:181" className="text-2xl font-display font-bold text-purple-600">181</a>
          </div>
          <div className="h-10 w-px bg-paper-300" />
          <div className="text-center">
            <p className="text-[9px] text-ink-300 font-medium mb-0.5 uppercase">Kumbh Help</p>
            <a href="tel:1077" className="text-2xl font-display font-bold text-accent-600">1077</a>
          </div>
        </div>
      </main>
    </div>
  );
}
