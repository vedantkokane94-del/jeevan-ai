"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, UserPlus, Search, Camera, ScanFace, CheckCircle2, 
  AlertTriangle, Shield, MapPin, Clock, Info, Activity, 
  Users, User, HelpingHand, PhoneCall, Upload, BrainCircuit,
  Map as MapIcon, ChevronRight, Navigation, X, Bell, Fingerprint, HeartHandshake, Mic, QrCode
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import * as turf from "@turf/turf";
import type { MapPoint } from "@web/components/Map";

const DynamicMap = dynamic(() => import("@web/components/Map").then((mod) => mod.Map), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-ink-900 animate-pulse flex items-center justify-center text-ink-500 text-xs tracking-widest font-mono">LOADING MAP INTELLIGENCE...</div>,
});

type AppView = "HOME" | "REPORT_FLOW" | "CHILD_MODE" | "SENIOR_MODE" | "ACTIVE_CASE" | "REUNION";
type ReportStep = 1 | 2 | 3 | 4;

export default function LostPersonRecoverySystem() {
  const [view, setView] = useState<AppView>("HOME");
  const [reportStep, setReportStep] = useState<ReportStep>(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  
  // Reporting Form State
  const [category, setCategory] = useState<"CHILD" | "SENIOR" | "ADULT" | "SPECIAL">("CHILD");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedFeatures, setExtractedFeatures] = useState<string[]>([]);
  
  // Active Case State
  const [timelineEvents, setTimelineEvents] = useState<{time: string, title: string, desc: string, active: boolean}[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchRadiusGeoJSON, setSearchRadiusGeoJSON] = useState<any>(null);
  const [showMatch, setShowMatch] = useState(false);

  // Auto-fill demo data
  const handleFastDemo = () => {
    setView("REPORT_FLOW");
    setReportStep(1);
    setCategory("CHILD");
    setTimeout(() => setReportStep(2), 300);
  };

  const handleUploadPhoto = () => {
    setIsExtracting(true);
    setTimeout(() => {
      setExtractedFeatures(["Yellow Frock", "Red Backpack", "Height ~120cm"]);
      setIsExtracting(false);
      setTimeout(() => setReportStep(3), 1500);
    }, 2000);
  };

  const submitReport = () => {
    setView("ACTIVE_CASE");
    
    // Initialize Timeline
    const now = new Date();
    setTimelineEvents([
      { time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), title: "Report Created", desc: "Case ID #NK-2027-449", active: true }
    ]);
    
    // Create expanding search radius
    let radiusKm = 0.2;
    const center = [73.7903, 20.0059]; // Ramkund
    
    const updateRadius = () => {
      radiusKm += 0.05;
      if (radiusKm > 1.5) return;
      
      const circle = turf.circle(center, radiusKm, { steps: 64, units: 'kilometers' });
      setSearchRadiusGeoJSON(circle);
      
      requestAnimationFrame(() => setTimeout(updateRadius, 1000)); // Expand every second
    };
    
    updateRadius();

    // Trigger AI Match after 6 seconds
    setTimeout(() => {
      setTimelineEvents(prev => [
        ...prev.map(p => ({...p, active: false})),
        { time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), title: "AI Match Found", desc: "94% Face Match at Gate 4", active: true }
      ]);
      setShowMatch(true);
    }, 6000);
  };

  // --------------------------------------------------------
  // SUB-VIEWS
  // --------------------------------------------------------

  const renderHome = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      
      {/* Hero Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass-dark border border-white/5 p-4 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><UserPlus className="w-16 h-16" /></div>
          <p className="text-xs text-ink-400 font-semibold uppercase tracking-wider mb-1">Reunions Today</p>
          <p className="text-3xl font-display font-bold text-white">142</p>
          <p className="text-[10px] text-emerald-400 mt-2 font-mono flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> 98% Success Rate</p>
        </div>
        <div className="glass-dark border border-white/5 p-4 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Shield className="w-16 h-16" /></div>
          <p className="text-xs text-ink-400 font-semibold uppercase tracking-wider mb-1">Active Centers</p>
          <p className="text-3xl font-display font-bold text-white">24</p>
          <p className="text-[10px] text-sky-400 mt-2 font-mono flex items-center gap-1"><Activity className="w-3 h-3"/> Average ETA: 3 min</p>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="space-y-3">
        <button onClick={handleFastDemo} className="w-full p-4 rounded-2xl bg-gradient-to-r from-alert-600 to-alert-500 hover:from-alert-500 hover:to-alert-400 text-left relative overflow-hidden shadow-xl shadow-alert-500/20 transition-all border border-alert-400/30 group">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Report Lost Person</h2>
              <p className="text-xs text-alert-100 max-w-[200px]">Create an AI-assisted search case. Alert nearby volunteers instantly.</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white/10 to-transparent skew-x-12 translate-x-10" />
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setView("CHILD_MODE")} className="p-4 rounded-2xl glass-dark border border-sky-500/30 hover:bg-sky-950/40 text-left transition-colors">
            <User className="w-6 h-6 text-sky-400 mb-2" />
            <h3 className="text-sm font-bold text-white mb-1">Child Safety</h3>
            <p className="text-[10px] text-sky-200">Kid-friendly SOS & Guidance</p>
          </button>
          <button onClick={() => setView("SENIOR_MODE")} className="p-4 rounded-2xl glass-dark border border-emerald-500/30 hover:bg-emerald-950/40 text-left transition-colors">
            <HelpingHand className="w-6 h-6 text-emerald-400 mb-2" />
            <h3 className="text-sm font-bold text-white mb-1">Senior Help</h3>
            <p className="text-[10px] text-emerald-200">Large text, voice assist</p>
          </button>
        </div>
        
        <button className="w-full p-4 rounded-2xl glass-dark border border-white/5 hover:bg-white/5 text-left transition-colors flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ScanFace className="w-6 h-6 text-primary-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Search AI Database</h3>
              <p className="text-[10px] text-ink-400">Match a found person using face scan</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-ink-500" />
        </button>
      </div>
      
      {/* Footer Info */}
      <div className="mt-8 pt-6 border-t border-white/5 text-center">
        <QrCode className="w-8 h-8 text-ink-600 mx-auto mb-2" />
        <p className="text-xs text-ink-400">Generate your Family Safety QR Code</p>
        <button className="text-xs text-primary-400 font-bold mt-1">Get Started</button>
      </div>
    </motion.div>
  );

  const renderReportFlow = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-bold text-white">Missing Report</h2>
        <span className="text-xs font-mono text-ink-400 bg-ink-900 px-2 py-1 rounded">Step {reportStep}/4</span>
      </div>

      <div className="flex gap-2 mb-8">
        {[1,2,3,4].map(s => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= reportStep ? "bg-primary-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" : "bg-ink-800"}`} />
        ))}
      </div>

      {reportStep === 1 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-ink-200 mb-4 uppercase tracking-widest">Select Category</h3>
          {[
            { id: "CHILD", icon: User, label: "Child (Under 12)", desc: "Triggers amber alert priority" },
            { id: "SENIOR", icon: HelpingHand, label: "Senior Citizen", desc: "Includes medical check alerts" },
            { id: "ADULT", icon: Users, label: "Adult", desc: "Standard missing person protocol" },
          ].map(cat => (
            <button 
              key={cat.id}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => { setCategory(cat.id as any); setReportStep(2); }}
              className={`w-full p-4 rounded-xl flex items-center gap-4 text-left border transition-all ${category === cat.id ? "bg-primary-950/30 border-primary-500 shadow-glow-primary" : "bg-ink-900 border-ink-800 hover:border-ink-600"}`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${category === cat.id ? "bg-primary-500 text-white" : "bg-ink-800 text-ink-400"}`}>
                <cat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className={`font-bold ${category === cat.id ? "text-white" : "text-ink-200"}`}>{cat.label}</p>
                <p className="text-[10px] text-ink-500 mt-0.5">{cat.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {reportStep === 2 && (
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-ink-200 uppercase tracking-widest">Smart Photo Upload</h3>
          <p className="text-xs text-ink-400">Upload a recent photo. Our AI will automatically extract clothing and facial features for the search network.</p>
          
          <button onClick={handleUploadPhoto} disabled={isExtracting} className={`w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${isExtracting ? "border-primary-500 bg-primary-950/20" : "border-ink-700 bg-ink-900/50 hover:bg-ink-900 hover:border-primary-500"}`}>
            {isExtracting ? (
              <>
                <BrainCircuit className="w-8 h-8 text-primary-400 mb-3 animate-pulse" />
                <p className="text-sm font-bold text-primary-400">AI Extracting Features...</p>
                <p className="text-[10px] text-ink-500 mt-1 font-mono">Analyzing clothing colors & patterns</p>
              </>
            ) : extractedFeatures.length > 0 ? (
              <>
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="text-sm font-bold text-emerald-400 mb-2">Photo Analyzed</p>
                <div className="flex gap-2 flex-wrap justify-center px-4">
                  {extractedFeatures.map((f, i) => (
                    <span key={i} className="text-[10px] px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">{f}</span>
                  ))}
                </div>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-ink-500 mb-3" />
                <p className="text-sm font-bold text-ink-300">Tap to Upload Photo</p>
              </>
            )}
          </button>
          
          {extractedFeatures.length === 0 && !isExtracting && (
             <button onClick={() => setReportStep(3)} className="w-full text-center text-xs text-ink-500 hover:text-ink-300 underline">Skip photo upload (Not Recommended)</button>
          )}
        </div>
      )}

      {reportStep === 3 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-ink-200 uppercase tracking-widest mb-4">Person Details</h3>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-400">Full Name</label>
            <input type="text" defaultValue="Aarohi Patil" className="w-full h-12 rounded-xl bg-ink-900 border border-ink-800 px-4 text-white focus:outline-none focus:border-primary-500 transition-colors" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-400">Age</label>
              <input type="number" defaultValue="8" className="w-full h-12 rounded-xl bg-ink-900 border border-ink-800 px-4 text-white focus:outline-none focus:border-primary-500 transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-400">Gender</label>
              <select className="w-full h-12 rounded-xl bg-ink-900 border border-ink-800 px-4 text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none">
                <option>Female</option>
                <option>Male</option>
              </select>
            </div>
          </div>
          
          {extractedFeatures.length > 0 && (
            <div className="p-4 rounded-xl bg-primary-950/30 border border-primary-900">
              <p className="text-xs text-primary-400 flex items-center gap-1.5 mb-2 font-semibold"><BrainCircuit className="w-3 h-3"/> AI Extracted Clothing</p>
              <div className="flex gap-2 flex-wrap">
                {extractedFeatures.map((f, i) => (
                  <span key={i} className="text-[10px] px-2 py-1 rounded bg-primary-900/50 text-primary-200">{f}</span>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => setReportStep(4)} className="w-full h-12 mt-4 rounded-xl bg-primary-600 text-white font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-500 transition-colors">
            Continue to Location
          </button>
        </div>
      )}

      {reportStep === 4 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-ink-200 uppercase tracking-widest mb-4">Last Known Location</h3>
          
          <div className="p-4 rounded-xl bg-alert-950/30 border border-alert-900 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-alert-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-white">Ramkund Ghat</p>
              <p className="text-[10px] text-ink-400 mt-1">15 minutes ago • High crowd density</p>
            </div>
          </div>
          
          <div className="h-48 w-full rounded-xl overflow-hidden relative border border-ink-800 pointer-events-none">
            {/* Mini Map Preview */}
            <div className="absolute inset-0 bg-ink-950 flex flex-col items-center justify-center">
               <MapIcon className="w-8 h-8 text-ink-700 mb-2" />
               <span className="text-[10px] text-ink-500 uppercase tracking-wider">Map Locked</span>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
               <div className="w-4 h-4 bg-alert-500 rounded-full animate-ping absolute" />
               <div className="w-4 h-4 bg-alert-500 rounded-full relative border-2 border-white" />
            </div>
          </div>

          <button onClick={submitReport} className="w-full h-14 mt-4 rounded-xl bg-alert-600 text-white font-bold text-lg shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:bg-alert-500 transition-colors flex items-center justify-center gap-2">
            <Bell className="w-5 h-5 fill-current" /> DEPLOY SEARCH ALERT
          </button>
        </div>
      )}
    </motion.div>
  );

  const renderActiveCase = () => (
    <div className="fixed inset-0 bg-ink-950 flex flex-col z-50">
      <header className="glass-dark px-4 py-3 flex items-center justify-between border-b border-white/10 shrink-0 z-20">
        <div>
          <h1 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-alert-500 animate-pulse" /> ACTIVE SEARCH
          </h1>
          <p className="text-[10px] text-ink-400 font-mono mt-0.5">Case #NK-2027-449 • AI Tracking Active</p>
        </div>
        <button onClick={() => setView("HOME")} className="w-8 h-8 rounded-full bg-ink-800 flex items-center justify-center text-ink-400">
          <X className="w-4 h-4" />
        </button>
      </header>

      <div className="flex-1 relative">
        <DynamicMap 
          mapRef={mapRef}
          center={[20.0059, 73.7903]} 
          zoom={15.5} 
          theme="dark"
          animateOnLoad={true}
          heatmapData={searchRadiusGeoJSON} 
          className="w-full h-full"
        />

        {/* Top Info Bar */}
        <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
           <div className="glass-dark border border-white/10 rounded-xl p-3 flex-1 backdrop-blur-xl">
             <p className="text-[10px] text-ink-400 uppercase font-bold tracking-widest mb-1">Search Radius</p>
             <p className="text-lg font-mono text-white">{(searchRadiusGeoJSON?.properties?.radius || 0.4).toFixed(2)} <span className="text-sm text-ink-500">km</span></p>
           </div>
           <div className="glass-dark border border-white/10 rounded-xl p-3 flex-1 backdrop-blur-xl">
             <p className="text-[10px] text-ink-400 uppercase font-bold tracking-widest mb-1">Volunteers Active</p>
             <p className="text-lg font-mono text-white">12 <span className="text-sm text-ink-500">units</span></p>
           </div>
        </div>
        
        {/* Timeline Overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-10 space-y-3">
          <AnimatePresence>
            {showMatch && (
              <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="glass-dark border border-emerald-500/50 p-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.2)] backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[30px]" />
                <div className="relative z-10 flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <ScanFace className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-emerald-400 text-sm">AI Match Detected!</h3>
                      <span className="text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">94% CONFIDENCE</span>
                    </div>
                    <p className="text-xs text-white mb-3">A volunteer at <strong>Help Center Gate 4</strong> uploaded a photo matching Aarohi&apos;s features.</p>
                    <div className="flex gap-2">
                      <button onClick={() => setView("REUNION")} className="flex-1 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-ink-950 font-bold text-xs transition-colors">
                        Verify Identity
                      </button>
                      <button className="flex-1 h-9 rounded-lg bg-ink-800 text-white font-semibold text-xs border border-white/10">
                        View Location
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="glass-dark border border-white/10 rounded-2xl p-4 backdrop-blur-xl max-h-48 overflow-y-auto no-scrollbar shadow-2xl">
            <h3 className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Clock className="w-3 h-3" /> Live Event Timeline
            </h3>
            <div className="space-y-4">
              {timelineEvents.map((evt, i) => (
                <div key={i} className="flex gap-3 relative">
                  {i !== timelineEvents.length - 1 && <div className="absolute left-[3.5px] top-3 bottom-[-16px] w-[2px] bg-ink-800" />}
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 z-10 ${evt.active ? "bg-primary-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" : "bg-ink-700"}`} />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <p className={`text-xs font-bold ${evt.active ? "text-white" : "text-ink-300"}`}>{evt.title}</p>
                      <span className="text-[10px] font-mono text-ink-500">{evt.time}</span>
                    </div>
                    <p className="text-[10px] text-ink-400 mt-0.5">{evt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReunion = () => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 bg-emerald-950 z-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-800/40 via-transparent to-transparent opacity-50" />
      
      <div className="relative z-10 space-y-6 max-w-sm w-full">
        <div className="w-24 h-24 mx-auto bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.4)]">
          <HeartHandshake className="w-12 h-12 text-emerald-400" />
        </div>
        
        <h1 className="text-3xl font-display font-bold text-white leading-tight">Reunion<br/>Successful!</h1>
        <p className="text-sm text-emerald-100/80">Case #NK-2027-449 has been officially closed. Aarohi is safe with her family.</p>
        
        <div className="glass border border-emerald-500/30 p-4 rounded-xl mt-8">
          <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest mb-2">Recovery Stats</p>
          <div className="flex justify-between items-end border-b border-emerald-500/20 pb-2 mb-2">
            <span className="text-xs text-emerald-100/60">Time to Match</span>
            <span className="font-mono font-bold text-white">4m 12s</span>
          </div>
          <div className="flex justify-between items-end border-b border-emerald-500/20 pb-2 mb-2">
            <span className="text-xs text-emerald-100/60">Search Radius Reached</span>
            <span className="font-mono font-bold text-white">0.6 km</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-xs text-emerald-100/60">Volunteers Engaged</span>
            <span className="font-mono font-bold text-white">12</span>
          </div>
        </div>

        <button onClick={() => setView("HOME")} className="w-full h-12 rounded-xl bg-white text-emerald-950 font-bold mt-4 hover:bg-emerald-50 transition-colors">
          Return to Dashboard
        </button>
      </div>
    </motion.div>
  );

  const renderChildMode = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#FFCA28] z-50 flex flex-col p-6">
       <button onClick={() => setView("HOME")} className="absolute top-6 right-6 w-10 h-10 bg-white/30 rounded-full flex items-center justify-center text-orange-900">
         <X className="w-5 h-5" />
       </button>
       
       <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
         <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl mb-4">
           <span className="text-6xl">🧸</span>
         </div>
         <h1 className="text-4xl font-black text-orange-900">Are you lost?</h1>
         <p className="text-lg font-bold text-orange-800">Don&apos;t worry! We will find your family.</p>
         
         <button className="w-full h-24 rounded-3xl bg-red-500 text-white font-black text-2xl shadow-[0_8px_0_rgba(185,28,28,1)] active:shadow-none active:translate-y-2 transition-all">
           I NEED HELP
         </button>
         
         <div className="w-full h-24 rounded-3xl bg-white flex items-center justify-center gap-4 text-orange-900 font-bold text-xl shadow-[0_8px_0_rgba(251,146,60,0.5)] cursor-pointer">
           <Mic className="w-8 h-8" /> SPEAK NOW
         </div>
       </div>
    </motion.div>
  );

  const renderSeniorMode = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-ink-950 z-50 flex flex-col p-4 text-white">
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <button onClick={() => setView("HOME")} className="flex items-center gap-2 text-xl font-bold text-white">
          <ArrowLeft className="w-6 h-6" /> Back
        </button>
      </header>
      
      <div className="flex-1 space-y-6">
        <h1 className="text-3xl font-bold leading-tight">Senior Citizen<br/>Emergency Help</h1>
        
        <button className="w-full p-6 rounded-2xl bg-alert-600 active:bg-alert-700 flex flex-col items-center justify-center gap-3 shadow-xl">
           <PhoneCall className="w-12 h-12" />
           <span className="text-2xl font-bold">Call Family Now</span>
        </button>

        <button className="w-full p-6 rounded-2xl bg-primary-600 active:bg-primary-700 flex flex-col items-center justify-center gap-3 shadow-xl mt-4">
           <MapPin className="w-12 h-12" />
           <span className="text-2xl font-bold">Share My Location</span>
        </button>
        
        <div className="mt-8 p-4 border-2 border-white/20 rounded-xl bg-white/5 text-center">
          <p className="text-lg font-bold mb-2">Show this to a volunteer:</p>
          <div className="w-48 h-48 bg-white mx-auto rounded-lg p-2 flex items-center justify-center">
            <QrCode className="w-full h-full text-black" />
          </div>
          <p className="mt-4 font-bold text-xl">ID: 884-212</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-ink-950 text-white" data-theme="dark">
      {view !== "ACTIVE_CASE" && view !== "REUNION" && view !== "CHILD_MODE" && view !== "SENIOR_MODE" && (
        <header className="glass-dark sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <Link href="/emergency" className="w-9 h-9 rounded-xl bg-ink-900 border border-white/10 flex items-center justify-center text-ink-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-sm font-display font-bold text-white leading-tight">AI Recovery System</h1>
              <p className="text-[10px] text-ink-400 font-mono">Simhastha Kumbh 2027</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Shield className="w-4 h-4" />
          </div>
        </header>
      )}

      <main className={`flex-1 ${view === "HOME" || view === "REPORT_FLOW" ? "px-4 py-6 max-w-lg mx-auto w-full" : ""}`}>
        <AnimatePresence mode="wait">
          {view === "HOME" && renderHome()}
          {view === "REPORT_FLOW" && renderReportFlow()}
          {view === "ACTIVE_CASE" && renderActiveCase()}
          {view === "REUNION" && renderReunion()}
          {view === "CHILD_MODE" && renderChildMode()}
          {view === "SENIOR_MODE" && renderSeniorMode()}
        </AnimatePresence>
      </main>
    </div>
  );
}
