"use client";

import React from "react";
import { BarChart3, Activity, Users, Clock, ArrowUpRight, ArrowDownRight, TrendingUp, ShieldCheck } from "lucide-react";

function StatCard({ title, value, change, positive }: { title: string, value: string, change: string, positive: boolean }) {
  return (
    <div className="card-elevated p-5 bg-ink-950 border-surface-border">
      <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2">{title}</h3>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-display font-bold text-white">{value}</span>
        <div className={`flex items-center gap-1 text-xs font-bold ${positive ? "text-success-400" : "text-alert-400"}`}>
          {positive ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
          {change}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  return (
    <div className="flex-1 flex flex-col h-full bg-surface-bg overflow-y-auto p-6" data-theme="ink">
      
      <header className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white mb-1">Intelligence & Analytics</h1>
        <p className="text-sm text-ink-400">Real-time platform performance and predictive operational metrics.</p>
      </header>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Avg Response Time" value="3.8m" change="12%" positive={true} />
        <StatCard title="Active Incidents" value="14" change="4" positive={false} />
        <StatCard title="AI Predictions Hit Rate" value="94.2%" change="2.1%" positive={true} />
        <StatCard title="Resources Engaged" value="68%" change="5%" positive={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Incident Trends (Mock Chart) */}
        <div className="lg:col-span-2 card-elevated p-5 bg-ink-950 border-surface-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-500" /> Incident Frequency (Last 12 Hours)
            </h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs text-ink-400"><div className="w-2 h-2 rounded-full bg-primary-500" /> Actual</span>
              <span className="flex items-center gap-1 text-xs text-ink-400"><div className="w-2 h-2 rounded-full bg-ink-700 border border-ink-600" /> Predicted</span>
            </div>
          </div>
          
          <div className="h-64 flex items-end gap-2 px-2">
            {/* Mock bars */}
            {[40, 55, 30, 45, 60, 80, 95, 85, 65, 50, 40, 45].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end gap-1 group">
                <div 
                  className="w-full bg-primary-600 rounded-t-sm opacity-80 group-hover:opacity-100 transition-opacity relative"
                  style={{ height: `${val}%` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white opacity-0 group-hover:opacity-100">{val}</div>
                </div>
                <div className="text-[10px] text-ink-500 text-center">{i}:00</div>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Allocation */}
        <div className="card-elevated p-5 bg-ink-950 border-surface-border flex flex-col">
          <h3 className="text-sm font-display font-bold text-white flex items-center gap-2 mb-6">
            <Activity className="w-4 h-4 text-accent-500" /> Sector Risk Distribution
          </h3>
          
          <div className="flex-1 space-y-5">
            {[
              { name: "Sector C (Ram Ghat)", risk: 88, color: "bg-alert-500" },
              { name: "Sector A (Transit)", risk: 45, color: "bg-primary-500" },
              { name: "Sector D (Mahakal)", risk: 62, color: "bg-accent-500" },
              { name: "Sector B (Parking)", risk: 15, color: "bg-success-500" },
            ].map(s => (
              <div key={s.name}>
                <div className="flex justify-between text-xs text-ink-300 mb-2">
                  <span>{s.name}</span>
                  <span className="font-mono text-white">{s.risk}% Risk</span>
                </div>
                <div className="w-full h-2 rounded-full bg-ink-900 overflow-hidden">
                  <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.risk}%` }} />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 rounded-xl bg-ink-900 border border-ink-800 text-sm text-ink-300">
            <ShieldCheck className="w-5 h-5 text-success-500 mb-2" />
            Platform stability is optimal. No system bottlenecks detected in the last 24 hours.
          </div>
        </div>

      </div>
    </div>
  );
}
