"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus, Search, Camera, ScanFace, CheckCircle2, AlertTriangle, Shield, MapPin, Clock, Info, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MissingPerson {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastSeen: string;
  time: string;
  clothing: string;
  status: "searching" | "found";
  matchConfidence?: number;
  photoUrl: string;
}

const mockMissing: MissingPerson[] = [
  { id: "m1", name: "Ramesh Kumar", age: 65, gender: "Male", lastSeen: "Ramkund Ghat", time: "2 hours ago", clothing: "White Kurta, Red Scarf", status: "searching", photoUrl: "👴" },
  { id: "m2", name: "Aarohi Patil", age: 8, gender: "Female", lastSeen: "Trimbakeshwar", time: "45 mins ago", clothing: "Yellow Frock", status: "found", matchConfidence: 98, photoUrl: "👧" },
];

export default function LostPersonNetwork() {
  const [tab, setTab] = useState<"search" | "report">("search");
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-surface-bg" data-theme="paper">
      <header className="glass sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-surface-border">
        <div className="flex items-center gap-3">
          <Link href="/emergency" className="w-9 h-9 rounded-xl bg-paper-200 flex items-center justify-center text-ink-600 hover:bg-paper-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-display font-bold text-ink-900 leading-tight">Lost & Found</h1>
            <p className="text-[10px] text-ink-400 font-mono">AI Face Match Network</p>
          </div>
        </div>
        <button className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100 transition-colors">
          <Shield className="w-5 h-5" />
        </button>
      </header>

      <div className="px-4 py-3 bg-white border-b border-paper-200 sticky top-[60px] z-20">
         <div className="flex bg-paper-100 rounded-xl p-1 gap-1">
          <button onClick={() => setTab("search")} className={`flex-1 h-9 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${tab === "search" ? "bg-white shadow-sm text-primary-600" : "text-ink-500 hover:text-ink-700"}`}>
            <Search className="w-3.5 h-3.5" /> Search Network
          </button>
          <button onClick={() => setTab("report")} className={`flex-1 h-9 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${tab === "report" ? "bg-alert-600 shadow-sm text-white" : "text-ink-500 hover:text-ink-700"}`}>
            <UserPlus className="w-3.5 h-3.5" /> Report Missing
          </button>
        </div>
      </div>

      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full relative">
        <AnimatePresence mode="wait">
          {tab === "search" ? (
            <motion.div 
              key="search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* AI Scan CTA */}
              <div className="card-elevated p-6 text-center bg-gradient-to-br from-primary-900 to-ink-950 border-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-[40px]" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-500/20 rounded-full blur-[40px]" />
                
                <div className="relative z-10">
                  <ScanFace className="w-12 h-12 text-primary-400 mx-auto mb-3" />
                  <h2 className="text-xl font-display font-bold text-white mb-2">Found Someone?</h2>
                  <p className="text-xs text-ink-300 mb-6 max-w-[250px] mx-auto">Use AI facial recognition to instantly match them with reported missing persons.</p>
                  
                  <button 
                    onClick={handleScan}
                    disabled={isScanning}
                    className="w-full h-12 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/20"
                  >
                    {isScanning ? (
                      <><Activity className="w-5 h-5 animate-spin-slow" /> Scanning Database...</>
                    ) : (
                      <><Camera className="w-5 h-5" /> Tap to Scan Face</>
                    )}
                  </button>
                </div>
              </div>

              {/* Active Cases */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wide">Recent Cases</h2>
                </div>
                
                <div className="space-y-3">
                  {mockMissing.map((p, i) => (
                    <div key={p.id} className={`card-elevated p-4 flex gap-4 animate-slide-in-bottom ${p.status === "found" ? "border-success-200 bg-success-50/30" : ""}`} style={{ animationDelay: `${i * 100}ms` }}>
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shrink-0 bg-white shadow-sm border ${p.status === "found" ? "border-success-200" : "border-paper-200"}`}>
                        {p.photoUrl}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h3 className="font-display font-bold text-ink-900 text-sm">{p.name}, {p.age}</h3>
                            <p className="text-xs text-ink-500">{p.gender}</p>
                          </div>
                          {p.status === "found" ? (
                            <span className="px-2 py-1 rounded bg-success-100 text-[10px] font-bold text-success-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> MATCH {p.matchConfidence}%
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-alert-100 text-[10px] font-bold text-alert-700">
                              MISSING
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1 mt-2">
                          <p className="text-xs text-ink-600 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" /> <span className="truncate">Last: {p.lastSeen}</span>
                          </p>
                          <p className="text-xs text-ink-600 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-ink-400 shrink-0" /> <span>{p.time}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="report"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="card-elevated p-4 bg-alert-50 border-alert-200 mb-6 flex items-start gap-3">
                 <AlertTriangle className="w-5 h-5 text-alert-600 shrink-0 mt-0.5" />
                 <div>
                   <p className="text-sm font-bold text-alert-900">Emergency Protocol</p>
                   <p className="text-xs text-alert-700 mt-1">Filing a report will immediately alert Kumbh Police and volunteers within a 2km radius.</p>
                 </div>
              </div>

              <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                <div className="w-full h-32 rounded-xl border-2 border-dashed border-paper-300 bg-paper-100 flex flex-col items-center justify-center text-ink-400 hover:bg-paper-200 transition-colors cursor-pointer">
                  <Camera className="w-6 h-6 mb-2" />
                  <span className="text-sm font-semibold">Upload Recent Photo</span>
                  <span className="text-xs">Required for AI matching</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink-700">Full Name</label>
                    <input type="text" className="w-full h-11 rounded-lg border border-paper-300 px-3 text-sm focus:outline-none focus:border-primary-500" placeholder="e.g. Rahul Sharma" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink-700">Age</label>
                    <input type="number" className="w-full h-11 rounded-lg border border-paper-300 px-3 text-sm focus:outline-none focus:border-primary-500" placeholder="e.g. 12" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink-700">Clothing Description</label>
                  <input type="text" className="w-full h-11 rounded-lg border border-paper-300 px-3 text-sm focus:outline-none focus:border-primary-500" placeholder="e.g. Red shirt, blue jeans" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink-700">Last Known Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                    <input type="text" className="w-full h-11 rounded-lg border border-paper-300 pl-9 pr-3 text-sm focus:outline-none focus:border-primary-500" placeholder="e.g. Near Ramkund" />
                  </div>
                </div>

                <button className="w-full h-12 mt-4 rounded-xl bg-alert-600 text-white font-bold shadow-lg shadow-alert-600/20 hover:bg-alert-700 transition-colors">
                  Submit Missing Report
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* "I'm Lost" floating button for kids/elderly */}
      <div className="fixed bottom-4 left-0 right-0 p-4 pointer-events-none">
        <div className="max-w-lg mx-auto flex justify-end">
          <button className="pointer-events-auto w-14 h-14 rounded-full bg-accent-600 text-white shadow-xl shadow-accent-600/30 flex items-center justify-center animate-bounce-slow border-2 border-white">
            <Info className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
