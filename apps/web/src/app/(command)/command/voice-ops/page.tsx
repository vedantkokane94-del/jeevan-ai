/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
import { Phone, PhoneIncoming, PhoneOff, Clock, MapPin, AlertTriangle, Activity, BarChart3, CheckCircle2, Users, TrendingUp, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

interface EmergencyCall {
  id: string; 
  status: string; 
  language: string; 
  emergency_type: string;
  severity: string; 
  landmark: string | null; 
  zone_id: string; 
  created_at: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://example.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SEV_COLORS: Record<string, string> = {
  CRITICAL: "bg-red-500", HIGH: "bg-orange-500", MEDIUM: "bg-yellow-500", LOW: "bg-blue-500"
};

const ZONE_LABELS: Record<string, string> = {
  ZONE_A: "Central Godavari", ZONE_B: "Panchavati North",
  ZONE_C: "Tapovan Outer", ZONE_D: "Trimbakeshwar",
  ZONE_E: "South Nashik", ZONE_F: "Transit Zone",
};

const LANG_FLAGS: Record<string, string> = { hi: "🇮🇳 HI", mr: "🇮🇳 MR", en: "🇬🇧 EN" };

const TYPE_ICONS: Record<string, string> = {
  MEDICAL_EMERGENCY: "🏥", HEATSTROKE: "☀️", DROWNING: "🌊",
  CROWD_CRUSH: "👥", FIRE: "🔥", MISSING_PERSON: "🔍", GENERAL_HELP: "ℹ️",
};

export default function VoiceOpsPage() {
  const [activeCalls, setActiveCalls] = useState<EmergencyCall[]>([]);
  const [recentCalls, setRecentCalls] = useState<EmergencyCall[]>([]);
  const [tab, setTab] = useState<"live" | "recent" | "analytics">("live");

  useEffect(() => {
    // 1. Fetch initial state
    async function fetchCalls() {
      try {
        const { data: active } = await supabase
          .from("emergency_calls")
          .select("*")
          .eq("status", "ACTIVE")
          .order("created_at", { ascending: false });
          
        const { data: recent } = await supabase
          .from("emergency_calls")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
          
        if (active) setActiveCalls(active);
        if (recent) setRecentCalls(recent);
      } catch (e) {
        console.error("Supabase fetch failed", e);
      }
    }
    fetchCalls();

    // 2. Subscribe to realtime changes
    const channel = supabase
      .channel("public:emergency_calls")
      .on("postgres_changes", { event: "*", schema: "public", table: "emergency_calls" }, (payload: any) => {
        const record = payload.new as EmergencyCall;
        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
          if (record.status === "ACTIVE") {
            setActiveCalls((prev) => {
              const exists = prev.find(p => p.id === record.id);
              if (exists) return prev.map(p => p.id === record.id ? record : p);
              return [record, ...prev];
            });
          } else {
            setActiveCalls((prev) => prev.filter(p => p.id !== record.id));
          }
          
          setRecentCalls((prev) => {
            const exists = prev.find(p => p.id === record.id);
            if (exists) return prev.map(p => p.id === record.id ? record : p);
            return [record, ...prev].slice(0, 50);
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-surface-border bg-surface-bg/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-primary-400" />
          <h1 className="font-display font-bold text-surface-text text-lg">Voice Operations (Serverless)</h1>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-green-400">
            <span className="live-dot" style={{ background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.6)" }} />
            {activeCalls.length} Live
          </span>
          <span className="text-ink-500">{recentCalls.length} Total Calls</span>
        </div>
      </header>

      {/* Top Stats */}
      <div className="px-6 py-4 grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        {[
          { label: "Active Calls", value: activeCalls.length, icon: PhoneIncoming, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Total Calls", value: recentCalls.length, icon: Phone, color: "text-primary-400", bg: "bg-primary-500/10" },
          { label: "Tickets Created", value: recentCalls.filter(c => c.emergency_type).length, icon: CheckCircle2, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Realtime Active", value: "Supabase", icon: Zap, color: "text-sky-400", bg: "bg-sky-500/10" },
        ].map((s, i) => (
          <div key={i} className="p-4 rounded-xl bg-ink-900/50 border border-ink-800/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-ink-500 font-medium">{s.label}</span>
              <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-6 flex gap-1 shrink-0">
        {(["live", "recent"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-t-lg text-xs font-bold transition-colors ${tab === t ? "bg-ink-900 text-white border border-ink-800 border-b-0" : "text-ink-500 hover:text-ink-300"}`}>
            {t === "live" ? `🔴 Live Calls (${activeCalls.length})` : "📋 Recent Calls"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="bg-ink-900/30 border border-ink-800 border-t-0 rounded-b-xl p-4 min-h-[300px]">

          {/* LIVE CALLS */}
          {tab === "live" && (
            <div className="space-y-3">
              {activeCalls.length === 0 ? (
                <div className="text-center py-12 text-ink-500">
                  <Phone className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No active calls</p>
                </div>
              ) : activeCalls.map((call, i) => (
                <motion.div key={call.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-xl bg-ink-950 border border-ink-800 hover:border-ink-700 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="live-dot" style={{ background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.6)" }} />
                      <span className="text-xs font-mono text-ink-400">{call.id.slice(-8)}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-ink-800 text-ink-300">{LANG_FLAGS[call.language] || call.language}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${SEV_COLORS[call.severity || 'MEDIUM'] || "bg-gray-500"}`}>
                        {call.severity || 'UNKNOWN'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-ink-400">
                    <span className="flex items-center gap-1">
                      {TYPE_ICONS[call.emergency_type] || "❓"} {call.emergency_type ? call.emergency_type.replace(/_/g, " ") : "Identifying..."}
                    </span>
                    {call.landmark && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {call.landmark}</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* RECENT CALLS */}
          {tab === "recent" && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-ink-500 border-b border-ink-800">
                    <th className="text-left py-2 px-2">ID</th>
                    <th className="text-left py-2 px-2">Lang</th>
                    <th className="text-left py-2 px-2">Type</th>
                    <th className="text-left py-2 px-2">Severity</th>
                    <th className="text-left py-2 px-2">Location</th>
                    <th className="text-left py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCalls.map(call => (
                    <tr key={call.id} className="border-b border-ink-800/50 hover:bg-ink-800/30 transition-colors">
                      <td className="py-2.5 px-2 font-mono text-ink-400">{call.id.slice(-8)}</td>
                      <td className="py-2.5 px-2">{LANG_FLAGS[call.language] || call.language}</td>
                      <td className="py-2.5 px-2 text-ink-300">{TYPE_ICONS[call.emergency_type]} {call.emergency_type ? call.emergency_type.replace(/_/g, " ") : "None"}</td>
                      <td className="py-2.5 px-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${SEV_COLORS[call.severity || 'MEDIUM']}`}>{call.severity || '-'}</span></td>
                      <td className="py-2.5 px-2 text-ink-300">{call.landmark || '-'}</td>
                      <td className="py-2.5 px-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${call.status === "ACTIVE" ? "bg-green-900/50 text-green-400" : "bg-ink-900/50 text-ink-400"}`}>
                          {call.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
