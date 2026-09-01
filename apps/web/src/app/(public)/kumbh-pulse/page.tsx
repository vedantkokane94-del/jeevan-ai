"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Activity, Users, Ambulance, Heart, AlertTriangle,
  Shield, ChevronRight, Clock,
  TrendingUp, TrendingDown, Minus, Brain
} from "lucide-react";

/* ─── Types ─── */
interface ZoneRisk {
  name: string;
  score: number;
  crowd: "Low" | "Moderate" | "High" | "Critical";
  temperature: number;
  incidents: number;
  ambulances: number;
  trend: "up" | "down" | "stable";
  reasons: string[];
  action: string;
}

interface PulseMetrics {
  pilgrimsActive: string;
  medicalRisk: "Low" | "Moderate" | "High";
  availableAmbulances: number;
  medicalCamps: number;
  activeIncidents: number;
  highestRiskZone: string;
  lastUpdated: string;
}

/* ─── Simulated Data ─── */
const ZONES: ZoneRisk[] = [
  { name: "Ramkund", score: 91, crowd: "Critical", temperature: 36, incidents: 8, ambulances: 3, trend: "up",
    reasons: ["Crowd density exceeding safe threshold", "Temperature above 35°C", "Medical incidents increasing rapidly", "Ambulance availability critically low"],
    action: "Deploy 4 additional medical units from Sector B reserve. Activate water distribution points." },
  { name: "Panchavati", score: 63, crowd: "High", temperature: 34, incidents: 4, ambulances: 6, trend: "stable",
    reasons: ["Moderate crowd buildup near temple entry", "Temperature within range", "2 minor incidents in last hour"],
    action: "Monitor crowd flow at entry gate. Pre-position 1 additional ambulance." },
  { name: "Trimbakeshwar", score: 48, crowd: "Moderate", temperature: 31, incidents: 2, ambulances: 8, trend: "down",
    reasons: ["Crowd thinning after morning darshan", "Favorable weather conditions", "Adequate medical coverage"],
    action: "Maintain current deployment. No additional action required." },
  { name: "Godavari Ghat", score: 72, crowd: "High", temperature: 35, incidents: 5, ambulances: 4, trend: "up",
    reasons: ["Snan ritual driving crowd surge", "High humidity increasing heatstroke risk", "3 heatstroke cases reported"],
    action: "Activate shade shelters at Ghat entry. Deploy mobile hydration unit." },
  { name: "Kushavarta", score: 35, crowd: "Low", temperature: 30, incidents: 1, ambulances: 10, trend: "down",
    reasons: ["Low pilgrim density", "Comfortable conditions", "Surplus medical resources"],
    action: "Consider reallocating 2 ambulances to Ramkund sector." },
];

function useSimulatedPulse(): PulseMetrics {
  const [metrics, setMetrics] = useState<PulseMetrics>({
    pilgrimsActive: "18.4L",
    medicalRisk: "Moderate",
    availableAmbulances: 47,
    medicalCamps: 32,
    activeIncidents: 18,
    highestRiskZone: "Ramkund",
    lastUpdated: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        availableAmbulances: 44 + Math.floor(Math.random() * 6),
        activeIncidents: 15 + Math.floor(Math.random() * 8),
        lastUpdated: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return metrics;
}

/* ─── Risk Score Utilities ─── */
function scoreColor(score: number) {
  if (score >= 80) return "text-alert-600";
  if (score >= 60) return "text-accent-600";
  if (score >= 40) return "text-primary-600";
  return "text-success-600";
}

function scoreBg(score: number) {
  if (score >= 80) return "bg-alert-600";
  if (score >= 60) return "bg-accent-500";
  if (score >= 40) return "bg-primary-500";
  return "bg-success-500";
}

function scoreRing(score: number) {
  if (score >= 80) return "ring-alert-300 bg-alert-50/50";
  if (score >= 60) return "ring-accent-200 bg-accent-50/50";
  if (score >= 40) return "ring-primary-200 bg-primary-50/30";
  return "ring-success-200 bg-success-50/30";
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp className="w-3.5 h-3.5 text-alert-500" />;
  if (trend === "down") return <TrendingDown className="w-3.5 h-3.5 text-success-500" />;
  return <Minus className="w-3.5 h-3.5 text-ink-300" />;
}

/* ─── Main Component ─── */
export default function KumbhPulse() {
  const pulse = useSimulatedPulse();
  const [expandedZone, setExpandedZone] = useState<string | null>(null);

  const toggleZone = useCallback((name: string) => {
    setExpandedZone(prev => prev === name ? null : name);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col gradient-kumbh" data-theme="paper">

      {/* ═══════ HEADER ═══════ */}
      <header className="glass sticky top-0 z-30 px-4 py-3 flex items-center gap-3">
        <Link href="/emergency" className="w-9 h-9 rounded-xl bg-paper-200 flex items-center justify-center hover:bg-paper-300 transition-colors" id="back-button">
          <ArrowLeft className="w-5 h-5 text-ink-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-display font-bold text-ink-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-600" />
            Kumbh Pulse
          </h1>
          <p className="text-[10px] text-ink-300 font-medium">Simhastha Nashik 2027 • Live Health Intelligence</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-ink-300 font-mono">
          <span className="live-dot" style={{ width: 6, height: 6 }} />
          {pulse.lastUpdated}
        </div>
      </header>

      <main className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full">

        {/* ═══════ HERO METRICS ═══════ */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* Primary Large Metric */}
          <div className="col-span-3 metric-card p-5 flex items-center justify-between animate-count-up">
            <div>
              <p className="text-[10px] text-ink-300 font-semibold uppercase tracking-wider mb-1">Pilgrims Active Now</p>
              <p className="text-4xl font-display font-bold text-gradient-primary">{pulse.pilgrimsActive}</p>
              <p className="text-xs text-ink-300 mt-1">Across all Kumbh zones</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center animate-glow-breathe">
              <Users className="w-8 h-8 text-primary-600" />
            </div>
          </div>

          {/* Grid Metrics */}
          <div className="metric-card p-4 text-center animate-count-up delay-100">
            <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-5 h-5 text-accent-600" />
            </div>
            <p className="text-2xl font-display font-bold text-ink-800">{pulse.activeIncidents}</p>
            <p className="text-[9px] text-ink-300 font-semibold uppercase mt-1">Active Incidents</p>
          </div>

          <div className="metric-card p-4 text-center animate-count-up delay-200">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-2">
              <Ambulance className="w-5 h-5 text-primary-600" />
            </div>
            <p className="text-2xl font-display font-bold text-primary-600">{pulse.availableAmbulances}</p>
            <p className="text-[9px] text-ink-300 font-semibold uppercase mt-1">Ambulances Ready</p>
          </div>

          <div className="metric-card p-4 text-center animate-count-up delay-300">
            <div className="w-10 h-10 rounded-xl bg-success-50 flex items-center justify-center mx-auto mb-2">
              <Heart className="w-5 h-5 text-success-600" />
            </div>
            <p className="text-2xl font-display font-bold text-success-600">{pulse.medicalCamps}</p>
            <p className="text-[9px] text-ink-300 font-semibold uppercase mt-1">Medical Camps</p>
          </div>
        </div>

        {/* ═══════ ZONE-BY-ZONE RISK ═══════ */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-ink-300 uppercase tracking-wide flex items-center gap-2">
              <Brain className="w-3.5 h-3.5 text-primary-500" />
              AI Risk Assessment by Zone
            </h2>
            <span className="text-[10px] text-ink-200 font-mono">Score / 100</span>
          </div>

          <div className="space-y-2">
            {ZONES.map((zone, i) => (
              <div key={zone.name} className="animate-slide-in-bottom" style={{ animationDelay: `${i * 80}ms` }}>
                <button
                  onClick={() => toggleZone(zone.name)}
                  className={`w-full text-left card-elevated p-4 transition-all ${expandedZone === zone.name ? `ring-2 ${scoreRing(zone.score)}` : ""}`}
                  id={`zone-${zone.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl ${scoreBg(zone.score)} flex items-center justify-center shadow-md`}>
                        <span className="text-white font-display font-bold text-sm">{zone.score}</span>
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-ink-900 text-sm">{zone.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-ink-300">Crowd: <span className={`font-bold ${scoreColor(zone.score)}`}>{zone.crowd}</span></span>
                          <span className="text-[10px] text-ink-200">•</span>
                          <span className="text-[10px] text-ink-300 flex items-center gap-0.5">
                            <TrendIcon trend={zone.trend} />
                            {zone.trend === "up" ? "Rising" : zone.trend === "down" ? "Declining" : "Stable"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-ink-300">{zone.temperature}°C</p>
                        <p className="text-[10px] text-ink-300">{zone.ambulances} amb.</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-ink-200 transition-transform ${expandedZone === zone.name ? "rotate-90" : ""}`} />
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {expandedZone === zone.name && (
                    <div className="mt-4 pt-4 border-t border-paper-200 animate-fade-in-up" style={{ animationDuration: "0.3s" }}>
                      {/* Stats Row */}
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="p-2 rounded-lg bg-paper-100 text-center">
                          <p className="text-[9px] text-ink-300 uppercase mb-0.5">Temp</p>
                          <p className="text-sm font-bold text-ink-800">{zone.temperature}°C</p>
                        </div>
                        <div className="p-2 rounded-lg bg-paper-100 text-center">
                          <p className="text-[9px] text-ink-300 uppercase mb-0.5">Incidents</p>
                          <p className="text-sm font-bold text-ink-800">{zone.incidents}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-paper-100 text-center">
                          <p className="text-[9px] text-ink-300 uppercase mb-0.5">Ambulances</p>
                          <p className="text-sm font-bold text-ink-800">{zone.ambulances}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-paper-100 text-center">
                          <p className="text-[9px] text-ink-300 uppercase mb-0.5">Risk</p>
                          <p className={`text-sm font-bold ${scoreColor(zone.score)}`}>{zone.score}</p>
                        </div>
                      </div>

                      {/* Why? Section */}
                      <div className="mb-3">
                        <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-2">Why this score?</p>
                        <ul className="space-y-1.5">
                          {zone.reasons.map((r, j) => (
                            <li key={j} className="flex items-start gap-2 text-xs text-ink-500">
                              <AlertTriangle className="w-3 h-3 text-accent-500 mt-0.5 shrink-0" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* AI Action */}
                      <div className="p-3 rounded-xl bg-primary-50 border border-primary-200">
                        <p className="text-[10px] font-bold text-primary-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Brain className="w-3 h-3" /> Recommended Action
                        </p>
                        <p className="text-xs text-primary-800">{zone.action}</p>
                      </div>
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════ AI SUMMARY CARD ═══════ */}
        <div className="card-elevated p-5 mb-6 bg-ink-950 text-white border-ink-800 animate-slide-in-bottom" data-theme="ink">
          <div className="flex items-center gap-2 text-[10px] font-mono text-primary-400 mb-3 tracking-widest">
            <Brain className="w-3.5 h-3.5" /> JEEVAN AI INTELLIGENCE SUMMARY
          </div>
          <p className="text-sm text-ink-200 leading-relaxed mb-4">
            Overall Kumbh health status is <strong className="text-accent-400">MODERATE</strong>. 
            Primary concern: <strong className="text-white">Ramkund sector</strong> showing crowd density 23% above safe threshold 
            with rising heat index. 3 heatstroke cases reported in last hour. 
            AI has pre-positioned medical teams and recommends activating water distribution at all ghats.
          </p>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-primary-400">
              <Shield className="w-3.5 h-3.5" />
              Confidence: 94.2%
            </div>
            <div className="flex items-center gap-1.5 text-ink-400">
              <Clock className="w-3.5 h-3.5" />
              Updated {pulse.lastUpdated}
            </div>
          </div>
        </div>

        {/* ═══════ BOTTOM CTA ═══════ */}
        <div className="flex gap-3">
          <Link href="/sos" className="flex-1 h-12 rounded-xl bg-alert-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-alert-700 transition-colors" id="sos-link">
            <Shield className="w-4 h-4" /> Emergency SOS
          </Link>
          <Link href="/emergency" className="flex-1 h-12 rounded-xl bg-primary-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-primary-700 transition-colors" id="dashboard-link">
            <Activity className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
