"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Siren, MapPin, Phone, Users, Hospital,
  CheckCircle2, ArrowLeft, Navigation, Shield,
  Loader2, ChevronRight, WifiOff, Wifi,
  Ambulance, Clock, Activity, Radio, Heart
} from "lucide-react";

type Phase = "ready" | "holding" | "locating" | "zone" | "alerting" | "assigning" | "notifying" | "dispatched" | "tracking" | "queued_offline";

interface TimelineItem {
  time: string;
  label: string;
  icon: React.ElementType;
  done: boolean;
}

const now = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

/* ─── Ambulance Simulation Data ─── */
interface AmbulanceInfo {
  id: string;
  driver: string;
  team: string;
  eta: number;
  distance: string;
  speed: string;
  status: string;
}

const AMBULANCE: AmbulanceInfo = {
  id: "AMB-08",
  driver: "Rakesh Sharma",
  team: "Paramedic Team Alpha",
  eta: 4,
  distance: "1.3 km",
  speed: "32 km/h",
  status: "En Route",
};

/* ─── Progress Steps for SOS Sequence ─── */
const SOS_STEPS = [
  { label: "Finding your location...", icon: MapPin, delay: 800 },
  { label: "Identifying Kumbh Zone — Ramkund", icon: Activity, delay: 1200 },
  { label: "Alerting Command Center...", icon: Radio, delay: 1000 },
  { label: "Assigning nearest Ambulance...", icon: Ambulance, delay: 1200 },
  { label: "Notifying Family & Emergency Contacts", icon: Users, delay: 800 },
];

export default function SOSPage() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [eta, setEta] = useState(4);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [holdProgress, setHoldProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  /* ─── SOS Animated Sequence ─── */
  const runSOSSequence = useCallback(() => {
    setPhase("locating");
    setTimeline([{ time: now(), label: "SOS Triggered", icon: Siren, done: true }]);
    setCurrentStep(0);

    let totalDelay = 0;
    SOS_STEPS.forEach((step, i) => {
      totalDelay += step.delay;
      const capturedDelay = totalDelay;
      setTimeout(() => {
        setCurrentStep(i + 1);
        setTimeline(prev => [...prev, { time: now(), label: step.label, icon: step.icon, done: true }]);

        // Map phases to step indices
        if (i === 0) setPhase("locating");
        if (i === 1) setPhase("zone");
        if (i === 2) setPhase("alerting");
        if (i === 3) setPhase("assigning");
        if (i === 4) setPhase("notifying");
      }, capturedDelay);
    });

    // Final: dispatch
    setTimeout(() => {
      setPhase("dispatched");
      setTimeline(prev => [...prev, { time: now(), label: "Responder Dispatched — AMB-08", icon: Navigation, done: true }]);
    }, totalDelay + 800);

    // Tracking phase
    setTimeout(() => {
      setPhase("tracking");
      setTimeline(prev => [...prev, { time: now(), label: "Hospital Pre-Notified — Civil Hospital Nashik", icon: Hospital, done: true }]);
    }, totalDelay + 2000);
  }, []);

  /* ─── Hold-to-Activate Logic ─── */
  const startHold = useCallback(() => {
    if (phase !== "ready") return;
    setHoldProgress(0);
    let progress = 0;
    holdTimerRef.current = setInterval(() => {
      progress += 3.33; // reaches 100 in ~3 seconds (30 ticks × 100ms)
      setHoldProgress(Math.min(progress, 100));
      if (progress >= 100) {
        if (holdTimerRef.current) clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;

        if (!navigator.onLine) {
          setPhase("queued_offline");
          localStorage.setItem("offline_sos_queue", "true");
          setTimeline([
            { time: now(), label: "SOS Triggered", icon: Siren, done: true },
            { time: now(), label: "Offline Mode — SOS Queued Locally", icon: WifiOff, done: true },
          ]);
        } else {
          runSOSSequence();
        }
      }
    }, 100);
  }, [phase, runSOSSequence]);

  const cancelHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (phase === "ready") setHoldProgress(0);
  }, [phase]);

  /* ─── Quick Tap Fallback ─── */
  const quickTap = useCallback(() => {
    if (phase === "ready") {
      if (!navigator.onLine) {
        setPhase("queued_offline");
        localStorage.setItem("offline_sos_queue", "true");
        setTimeline([
          { time: now(), label: "SOS Triggered", icon: Siren, done: true },
          { time: now(), label: "Offline Mode — SOS Queued Locally", icon: WifiOff, done: true },
        ]);
      } else {
        runSOSSequence();
      }
    }
  }, [phase, runSOSSequence]);

  /* ─── Auto-sync when back online ─── */
  useEffect(() => {
    if (isOnline && phase === "queued_offline") {
      const queued = localStorage.getItem("offline_sos_queue");
      if (queued) {
        localStorage.removeItem("offline_sos_queue");
        const initTimer = setTimeout(() => {
          setTimeline(prev => [...prev, { time: now(), label: "Connection Restored — Syncing...", icon: Wifi, done: true }]);
        }, 0);
        const timer = setTimeout(() => {
          runSOSSequence();
        }, 1000);
        return () => { clearTimeout(initTimer); clearTimeout(timer); };
      }
    }
  }, [isOnline, phase, runSOSSequence]);

  /* ─── ETA Countdown ─── */
  useEffect(() => {
    if (phase === "tracking" && eta > 0) {
      const t = setInterval(() => setEta(prev => Math.max(0, prev - 1)), 12000);
      return () => clearInterval(t);
    }
  }, [phase, eta]);

  /* ── Cleanup hold timer on unmount ── */
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    };
  }, []);

  /* ════════════════════════════════════════════════════════════ */
  /*  READY STATE — Giant SOS Button with Hold-to-Activate      */
  /* ════════════════════════════════════════════════════════════ */
  if (phase === "ready") {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gradient-sos px-4" data-theme="paper">
        <Link href="/emergency" className="absolute top-4 left-4 flex items-center gap-1 text-sm text-ink-300 hover:text-ink-500 transition-colors" id="back-link">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Network indicator */}
        {!isOnline && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-alert-50 border border-alert-200 text-xs text-alert-700 font-semibold animate-badge-pop">
            <WifiOff className="w-3.5 h-3.5" /> Offline Mode
          </div>
        )}

        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-2xl font-display font-bold text-ink-900 mb-2">Emergency SOS</h1>
          <p className="text-sm text-ink-300">Press and hold for 3 seconds to activate</p>
        </div>

        {/* SOS Button with SVG Progress Ring */}
        <div className="relative">
          {/* Progress ring */}
          <svg className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(220,38,38,0.15)" strokeWidth="3" />
            <circle
              cx="50" cy="50" r="45" fill="none"
              stroke="#dc2626" strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * holdProgress / 100)}
              transform="rotate(-90 50 50)"
              style={{ transition: "stroke-dashoffset 100ms linear" }}
            />
          </svg>

          <button
            onMouseDown={startHold}
            onMouseUp={cancelHold}
            onMouseLeave={cancelHold}
            onTouchStart={startHold}
            onTouchEnd={cancelHold}
            onClick={quickTap}
            className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-alert-600 text-white flex flex-col items-center justify-center shadow-2xl shadow-alert-600/40 hover:bg-alert-700 active:scale-95 transition-all animate-sos-pulse focus-visible:outline-4 focus-visible:outline-alert-300"
            aria-label="Trigger Emergency SOS — Hold for 3 seconds"
            id="sos-trigger"
          >
            <span className="absolute inset-0 rounded-full border-2 border-alert-400 opacity-0" style={{ animation: "sos-ring 2s ease-out infinite" }} />
            <span className="absolute inset-0 rounded-full border-2 border-alert-400 opacity-0" style={{ animation: "sos-ring 2s ease-out infinite 0.6s" }} />
            <span className="absolute inset-0 rounded-full border-2 border-alert-400 opacity-0" style={{ animation: "sos-ring 2s ease-out infinite 1.2s" }} />

            <Siren className="w-14 h-14 mb-2" />
            <span className="text-3xl font-display font-bold tracking-wide">SOS</span>
            <span className="text-xs opacity-80 mt-1">
              {holdProgress > 0 ? `${Math.round(holdProgress)}%` : "Hold to Activate"}
            </span>
          </button>
        </div>

        <p className="mt-10 text-xs text-ink-200 text-center max-w-xs">
          This will share your location, identify your Kumbh zone, alert emergency services, assign an ambulance, and notify your trusted contacts.
        </p>

        <a href="tel:112" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-alert-600 hover:text-alert-700 transition-colors">
          <Phone className="w-4 h-4" /> Call 112 Directly
        </a>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════ */
  /*  ACTIVE SOS — Sequence + Tracking                          */
  /* ════════════════════════════════════════════════════════════ */
  const phaseLabel = (() => {
    switch (phase) {
      case "locating": return "Finding Location...";
      case "zone": return "Identifying Kumbh Zone...";
      case "alerting": return "Alerting Command Center...";
      case "assigning": return "Assigning Ambulance...";
      case "notifying": return "Notifying Family...";
      case "queued_offline": return "Offline — SOS Queued";
      case "dispatched": return "Responder Dispatched";
      case "tracking": return "Help is On The Way";
      default: return "Processing...";
    }
  })();

  const isComplete = phase === "tracking";
  const isProcessing = !isComplete && phase !== "queued_offline";

  return (
    <div className="min-h-[100dvh] flex flex-col" data-theme="paper">
      {/* Status bar */}
      <header className={`px-4 py-3 flex items-center justify-between text-white ${isComplete ? "bg-primary-600" : "bg-alert-600"} transition-colors duration-700`}>
        <div className="flex items-center gap-2">
          {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
          <span className="font-display font-bold text-sm">{phaseLabel}</span>
        </div>
        <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center overflow-hidden p-0.5">
          <img src="/logo.png" alt="JEEVAN AI" className="w-full h-full object-contain" />
        </div>
      </header>

      {/* Step Progress Bar */}
      {isProcessing && (
        <div className="h-1.5 bg-paper-200">
          <div
            className="h-full bg-alert-500 transition-all duration-500 rounded-r-full"
            style={{ width: `${(currentStep / SOS_STEPS.length) * 100}%` }}
          />
        </div>
      )}

      <main className="flex-1 px-4 max-w-lg mx-auto w-full py-6">

        {/* ─── ETA Card ─── */}
        {(phase === "dispatched" || phase === "tracking") && (
          <div className="card-elevated p-6 mb-5 text-center animate-scale-in">
            <p className="text-xs text-ink-300 font-medium uppercase tracking-wide mb-1">Estimated Arrival</p>
            <div className="text-5xl font-display font-bold text-primary-600">{eta} <span className="text-xl">min</span></div>
            <div className="mt-4 w-full bg-paper-200 rounded-full h-2 overflow-hidden">
              <div className="bg-primary-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${((4 - eta) / 4) * 100}%` }} />
            </div>
            <p className="text-xs text-ink-200 mt-3">Responder Unit AMB-08 en route</p>
          </div>
        )}

        {/* ─── Ambulance Card ─── */}
        {phase === "tracking" && (
          <div className="card-elevated p-5 mb-5 animate-slide-in-bottom">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
                <Ambulance className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-ink-900 text-sm">{AMBULANCE.id}</h3>
                <p className="text-xs text-primary-600 font-medium">{AMBULANCE.status}</p>
              </div>
              <div className="live-dot" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-paper-100">
                <p className="text-[9px] text-ink-300 uppercase">Driver</p>
                <p className="text-xs font-semibold text-ink-700">{AMBULANCE.driver}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-paper-100">
                <p className="text-[9px] text-ink-300 uppercase">Team</p>
                <p className="text-xs font-semibold text-ink-700">{AMBULANCE.team}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-paper-100">
                <p className="text-[9px] text-ink-300 uppercase">Distance</p>
                <p className="text-xs font-semibold text-ink-700">{AMBULANCE.distance}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-paper-100">
                <p className="text-[9px] text-ink-300 uppercase">Speed</p>
                <p className="text-xs font-semibold text-ink-700">{AMBULANCE.speed}</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── Hospital Card ─── */}
        {phase === "tracking" && (
          <div className="card-elevated p-5 mb-5 flex items-center gap-4 animate-fade-in-up">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
              <Hospital className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-ink-900 text-sm">Civil Hospital Nashik</h3>
              <p className="text-xs text-ink-300 mt-0.5">2.4 km • ICU Available • Blood Bank Active</p>
            </div>
            <ChevronRight className="w-5 h-5 text-ink-200 shrink-0" />
          </div>
        )}

        {/* ─── Live Timeline ─── */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-ink-300 uppercase tracking-wide mb-4">Live Timeline</h2>
          <div className="space-y-0">
            {timeline.map((item, i) => (
              <div key={i} className="flex gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}>
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.done ? "bg-primary-100 text-primary-600" : "bg-paper-200 text-ink-300"}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  {i < timeline.length - 1 && <div className="w-px h-8 bg-primary-200" />}
                </div>
                <div className="pb-6">
                  <p className="text-sm font-medium text-ink-900">{item.label}</p>
                  <p className="text-xs text-ink-200 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-paper-200 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-ink-300 animate-spin" />
                </div>
                <p className="text-sm text-ink-200">{phaseLabel}</p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Family Notification ─── */}
        {timeline.length >= 5 && (
          <div className="card-elevated p-4 flex items-center gap-3 animate-fade-in-up">
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink-900">Family Notified</p>
              <p className="text-xs text-ink-300">2 contacts received your live location</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-success-500" />
          </div>
        )}
      </main>

      {/* Bottom action */}
      <div className="sticky bottom-0 glass p-4">
        <a href="tel:112" className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-ink-900 text-white font-display font-semibold w-full shadow-lg hover:bg-ink-800 transition-colors">
          <Phone className="w-5 h-5" /> Call 112 Emergency
        </a>
      </div>
    </div>
  );
}
