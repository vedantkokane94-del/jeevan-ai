"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, Siren, Clock, ArrowLeft, Phone, AlertTriangle } from "lucide-react";

type DetectState = "detecting" | "asking" | "safe" | "emergency";

export default function SafetyDetection() {
  const [state, setState] = useState<DetectState>("detecting");
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (state === "detecting") {
      const t = setTimeout(() => setState("asking"), 2000);
      return () => clearTimeout(t);
    }
  }, [state]);

  useEffect(() => {
    if (state === "asking" && countdown > 0) {
      const t = setInterval(() => setCountdown(prev => prev - 1), 1000);
      return () => clearInterval(t);
    }
    if (state === "asking" && countdown === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState("emergency");
    }
  }, [state, countdown]);

  if (state === "safe") {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6" data-theme="paper">
        <div className="text-center animate-scale-in">
          <div className="w-24 h-24 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-12 h-12 text-success-600" />
          </div>
          <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">You&apos;re Safe</h1>
          <p className="text-ink-300 mb-8">Glad to know you&apos;re okay. Stay safe!</p>
          <Link href="/emergency" className="inline-flex items-center h-12 px-8 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (state === "emergency") {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 gradient-sos" data-theme="paper">
        <div className="text-center animate-scale-in">
          <div className="w-24 h-24 rounded-full bg-alert-100 flex items-center justify-center mx-auto mb-6 animate-sos-pulse">
            <Siren className="w-12 h-12 text-alert-600" />
          </div>
          <h1 className="text-3xl font-display font-bold text-alert-700 mb-2">Emergency Alert Sent</h1>
          <p className="text-ink-300 mb-8">Help is on the way. Your location has been shared with emergency services.</p>
          <a href="tel:112" className="inline-flex items-center gap-2 h-14 px-8 rounded-2xl bg-alert-600 text-white font-display font-semibold text-lg shadow-lg hover:bg-alert-700 transition-all">
            <Phone className="w-5 h-5" /> Call 112
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6" data-theme="paper">
      <Link href="/emergency" className="absolute top-4 left-4 flex items-center gap-1 text-sm text-ink-300">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {state === "detecting" ? (
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-6 animate-heartbeat">
            <ShieldAlert className="w-10 h-10 text-accent-600" />
          </div>
          <h1 className="text-2xl font-display font-bold text-ink-900 mb-2">Analyzing Activity...</h1>
          <p className="text-sm text-ink-300">We detected unusual movement. Checking if you&apos;re okay.</p>
        </div>
      ) : (
        <div className="text-center w-full max-w-sm animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-accent-600" />
          </div>
          <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">Are You Safe?</h1>
          <p className="text-sm text-ink-300 mb-2">We detected a possible fall or impact.</p>
          <div className="flex items-center justify-center gap-2 text-sm text-accent-600 font-semibold mb-8">
            <Clock className="w-4 h-4" /> Auto-alert in {countdown}s
          </div>

          {/* Progress ring */}
          <div className="relative w-16 h-16 mx-auto mb-8">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#f5f0ea" strokeWidth="4" />
              <circle cx="32" cy="32" r="28" fill="none" stroke="#d97706" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - countdown / 30)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-lg text-accent-700">{countdown}</span>
          </div>

          <div className="space-y-3">
            <button onClick={() => setState("safe")} className="w-full h-16 rounded-2xl bg-success-600 text-white text-xl font-display font-bold shadow-lg hover:bg-success-700 transition-all active:scale-95 flex items-center justify-center gap-2">
              <ShieldCheck className="w-6 h-6" /> I&apos;m Safe
            </button>
            <button onClick={() => setState("emergency")} className="w-full h-16 rounded-2xl bg-alert-600 text-white text-xl font-display font-bold shadow-lg hover:bg-alert-700 transition-all active:scale-95 animate-sos-pulse flex items-center justify-center gap-2">
              <Siren className="w-6 h-6" /> I Need Help
            </button>
          </div>
          <p className="mt-4 text-xs text-ink-200">No response will automatically trigger emergency alert.</p>
        </div>
      )}
    </div>
  );
}
