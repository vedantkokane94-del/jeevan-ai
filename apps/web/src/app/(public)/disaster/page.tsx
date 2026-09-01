"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Radio, Navigation, ShieldAlert, WifiOff, Users, MapPin, Map, Info, CheckCircle2 } from "lucide-react";

export default function DisasterMode() {
  const [safeStatus, setSafeStatus] = useState<"pending" | "safe">("pending");

  return (
    <div className="min-h-[100dvh] bg-black text-white font-body selection:bg-alert-500 selection:text-white" data-theme="ink">
      
      {/* Critical Header */}
      <header className="h-16 bg-alert-600 flex items-center justify-center relative shadow-glow-alert z-20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
        <div className="relative flex items-center gap-3 animate-pulse">
          <AlertTriangle className="w-6 h-6 text-white" />
          <h1 className="font-display font-bold text-white text-xl tracking-widest">DISASTER PROTOCOL ACTIVE</h1>
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">
        
        {/* Broadcast Directive */}
        <div className="bg-alert-950/50 border-2 border-alert-600 rounded-2xl p-6 text-center animate-fade-in-down shadow-[0_0_30px_rgba(220,38,38,0.2)]">
          <p className="text-xs font-bold text-alert-500 uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
            <Radio className="w-4 h-4 animate-ping" /> GOVT DIRECTIVE - 16:42 IST
          </p>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4 uppercase leading-tight">
            Evacuate Ramkund Immediately
          </h2>
          <p className="text-ink-200 text-sm sm:text-base leading-relaxed">
            Severe crowding detected. Proceed calmly to <strong>Evacuation Route Alpha (Towards Goda Park)</strong>. Do not run. Follow NDRF personnel.
          </p>
        </div>

        {/* Offline Cache Notice */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-ink-900 border border-ink-800 animate-fade-in">
          <div className="w-10 h-10 rounded-full bg-ink-800 flex items-center justify-center shrink-0">
            <WifiOff className="w-5 h-5 text-ink-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm">Offline Mode Active</h3>
            <p className="text-xs text-ink-400 mt-0.5">Cellular networks overloaded. Maps and routes are cached via Bluetooth Mesh.</p>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4 animate-fade-in-up delay-100" style={{ animationFillMode: "both" }}>
          
          <button className="flex flex-col items-center text-center gap-3 p-5 rounded-2xl bg-ink-900 border border-ink-800 hover:bg-ink-800 transition-colors">
            <div className="w-12 h-12 rounded-full bg-accent-500/20 flex items-center justify-center">
              <Map className="w-6 h-6 text-accent-400" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Escape Route</div>
              <div className="text-[10px] text-ink-400 mt-1 uppercase tracking-wider">Cached Map</div>
            </div>
          </button>

          <button className="flex flex-col items-center text-center gap-3 p-5 rounded-2xl bg-ink-900 border border-ink-800 hover:bg-ink-800 transition-colors">
            <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Find Shelter</div>
              <div className="text-[10px] text-ink-400 mt-1 uppercase tracking-wider">Nearest Safe Zone</div>
            </div>
          </button>

        </div>

        {/* Safe Check-in (The most critical feature) */}
        <div className="mt-4 animate-fade-in-up delay-200" style={{ animationFillMode: "both" }}>
          <p className="text-xs font-bold text-ink-500 uppercase tracking-widest text-center mb-4">Mark Yourself Safe</p>
          
          {safeStatus === "pending" ? (
            <button 
              onClick={() => setSafeStatus("safe")}
              className="w-full h-20 rounded-2xl bg-success-600 hover:bg-success-500 transition-all shadow-glow-success text-white font-display font-bold text-xl flex items-center justify-center gap-3 active:scale-95"
            >
              <Users className="w-6 h-6" /> I AM SAFE
            </button>
          ) : (
            <div className="w-full p-6 rounded-2xl bg-success-950/30 border border-success-900/50 flex flex-col items-center justify-center text-center animate-scale-in">
               <div className="w-16 h-16 rounded-full bg-success-500/20 flex items-center justify-center mb-3">
                 <CheckCircle2 className="w-8 h-8 text-success-400" />
               </div>
               <h3 className="text-lg font-bold text-success-400 mb-1">Marked Safe</h3>
               <p className="text-xs text-ink-300">Status broadcasted to Command Center and your Family Circle via Mesh SMS.</p>
            </div>
          )}
        </div>

        {/* Home Link */}
        <div className="mt-8 text-center animate-fade-in delay-300" style={{ animationFillMode: "both" }}>
          <Link href="/" className="text-xs font-bold text-ink-500 hover:text-white transition-colors underline">
            Return to Normal Mode
          </Link>
        </div>

      </div>
    </div>
  );
}
