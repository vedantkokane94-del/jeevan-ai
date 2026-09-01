"use client";

import React, { useState } from "react";
import { AlertTriangle, Radio, Globe, ShieldAlert, CloudLightning, ThermometerSun, MapPin, Send, CheckCircle2 } from "lucide-react";

interface Alert {
  id: string; type: string; title: string; severity: "CRITICAL" | "HIGH" | "MEDIUM";
  status: "ACTIVE" | "DRAFT" | "RESOLVED"; time: string; affected: string; icon: React.ElementType;
}

const mockAlerts: Alert[] = [
  { id: "1", type: "WEATHER", title: "Extreme Heatwave Warning", severity: "HIGH", status: "ACTIVE", time: "14:30 UTC", affected: "Nashik District (All Sectors)", icon: ThermometerSun },
  { id: "2", type: "CROWD", title: "Stampede Risk Escalation", severity: "CRITICAL", status: "DRAFT", time: "Pending Broadcast", affected: "Ramkund Zone & Godavari Ghats", icon: ShieldAlert },
  { id: "3", type: "INFRA", title: "Flash Flood Alert", severity: "MEDIUM", status: "RESOLVED", time: "Yesterday, 08:00 UTC", affected: "Low-lying areas (Godavari River)", icon: CloudLightning },
];

export default function DisasterAlerts() {
  const [selected, setSelected] = useState<Alert>(mockAlerts[0]);
  const [broadcasting, setBroadcasting] = useState(false);

  const handleBroadcast = () => {
    setBroadcasting(true);
    setTimeout(() => {
      setBroadcasting(false);
      // Update state in real app
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-bg overflow-hidden p-6" data-theme="ink">
      
      <header className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white mb-1">Disaster Alert System</h1>
        <p className="text-sm text-ink-400">Manage and broadcast mass public safety alerts.</p>
      </header>

      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* Alerts List */}
        <div className="w-1/3 flex flex-col gap-4">
          <div className="flex gap-2">
            <button className="flex-1 py-2 rounded-lg bg-ink-900 text-white text-xs font-semibold border border-surface-border">Active (1)</button>
            <button className="flex-1 py-2 rounded-lg bg-transparent text-ink-400 text-xs font-semibold hover:bg-ink-900 transition-colors border border-transparent">Drafts (1)</button>
            <button className="flex-1 py-2 rounded-lg bg-transparent text-ink-400 text-xs font-semibold hover:bg-ink-900 transition-colors border border-transparent">History</button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar pr-2">
            {mockAlerts.map(alert => (
              <button 
                key={alert.id}
                onClick={() => setSelected(alert)}
                className={`w-full text-left card-elevated p-4 transition-all border ${selected.id === alert.id ? "bg-ink-900 border-primary-500 shadow-glow-primary" : "bg-ink-950 border-surface-border hover:border-ink-600"}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    alert.severity === "CRITICAL" ? "bg-alert-600 text-white" :
                    alert.severity === "HIGH" ? "bg-accent-600 text-white" : "bg-primary-600 text-white"
                  }`}>
                    <alert.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                    alert.status === "ACTIVE" ? "bg-alert-500/20 text-alert-400" :
                    alert.status === "DRAFT" ? "bg-ink-800 text-ink-300" : "bg-success-500/20 text-success-400"
                  }`}>
                    {alert.status}
                  </span>
                </div>
                <h3 className="font-display font-bold text-white text-sm line-clamp-1">{alert.title}</h3>
                <p className="text-xs text-ink-400 mt-1">{alert.time}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Alert Details & Broadcast Panel */}
        <div className="flex-1 card-elevated bg-ink-950 border-surface-border flex flex-col p-0 overflow-hidden">
          <div className={`h-2 w-full ${
            selected.severity === "CRITICAL" ? "bg-alert-500" :
            selected.severity === "HIGH" ? "bg-accent-500" : "bg-primary-500"
          }`} />
          
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-ink-900 flex items-center justify-center border border-ink-800">
                <selected.icon className={`w-6 h-6 ${selected.severity === "CRITICAL" ? "text-alert-500" : selected.severity === "HIGH" ? "text-accent-500" : "text-primary-500"}`} />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-white">{selected.title}</h2>
                <div className="flex items-center gap-3 mt-1 text-sm text-ink-400 font-mono">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-ink-500" /> {selected.affected}</span>
                  <span>|</span>
                  <span className={selected.severity === "CRITICAL" ? "text-alert-400" : selected.severity === "HIGH" ? "text-accent-400" : "text-primary-400"}>
                    {selected.severity} SEVERITY
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2">Public Broadcast Message</h3>
                <div className="p-4 rounded-xl bg-ink-900 border border-ink-800 text-ink-200 text-sm leading-relaxed">
                  ⚠️ {selected.title.toUpperCase()} ⚠️<br/><br/>
                  {selected.id === "1" ? "Temperatures are expected to exceed 42°C today. Avoid direct sunlight between 11 AM and 4 PM. Stay hydrated. Free water and medical camps are available at all major sectors." : 
                   selected.id === "2" ? "High crowd density detected at Ramkund. Do not proceed to this area. Follow police instructions and use alternate routes via Panchavati Corridor." :
                   "A flash flood warning has been issued for low-lying areas near the Godavari River. Move to higher ground immediately."}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-ink-900 border border-ink-800">
                  <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2">Safe Shelters</h3>
                  <ul className="text-sm text-ink-200 space-y-1">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-success-500" /> Sector A Transit Camp</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-success-500" /> DAV School Grounds</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-ink-900 border border-ink-800">
                  <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2">Distribution Channels</h3>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 rounded bg-primary-500/20 text-primary-400 text-xs font-bold border border-primary-500/30">SMS Alert</span>
                    <span className="px-2 py-1 rounded bg-accent-500/20 text-accent-400 text-xs font-bold border border-accent-500/30">App Push</span>
                    <span className="px-2 py-1 rounded bg-ink-800 text-ink-300 text-xs font-bold border border-ink-700">Digital Billboards</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-4 bg-ink-900 border-t border-ink-800 flex items-center justify-between">
            <p className="text-xs text-ink-400 font-mono flex items-center gap-2">
              <Globe className="w-4 h-4 text-ink-500" /> Est. Reach: 2.4M Citizens
            </p>
            {selected.status === "DRAFT" ? (
              <button 
                onClick={handleBroadcast}
                disabled={broadcasting}
                className="h-12 px-8 rounded-xl bg-alert-600 text-white font-display font-bold flex items-center gap-2 hover:bg-alert-700 transition-colors shadow-lg shadow-alert-600/20 disabled:opacity-50"
              >
                {broadcasting ? <><Radio className="w-5 h-5 animate-pulse" /> Transmitting...</> : <><Send className="w-5 h-5" /> BROADCAST ALERT</>}
              </button>
            ) : (
              <button className="h-12 px-8 rounded-xl bg-ink-800 text-ink-300 font-display font-bold flex items-center gap-2 hover:text-white transition-colors">
                <AlertTriangle className="w-5 h-5" /> End Alert
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
