"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Shield, HeartPulse, Activity, Search, Volume2, Droplets, ThermometerSun, AlertCircle, Phone, CheckCircle2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface FirstAidStep {
  text: string;
  detail?: string;
  critical?: boolean;
}

interface FirstAidGuide {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  description: string;
  steps: FirstAidStep[];
}

const GUIDES: FirstAidGuide[] = [
  {
    id: "heatstroke",
    title: "Heatstroke",
    icon: ThermometerSun,
    color: "text-alert-600 bg-alert-50 border-alert-200",
    description: "Critical emergency caused by extreme heat.",
    steps: [
      { text: "Move to a cool, shaded area immediately.", critical: true },
      { text: "Remove excess clothing.", detail: "Loosen tight clothing to help cooling." },
      { text: "Cool the person rapidly.", detail: "Apply cold water, ice packs (neck, armpits, groin), or use a fan." },
      { text: "Do NOT give fluids if they are unconscious or vomiting.", critical: true },
    ]
  },
  {
    id: "cpr",
    title: "CPR (No Pulse)",
    icon: HeartPulse,
    color: "text-primary-600 bg-primary-50 border-primary-200",
    description: "For someone who is unresponsive and not breathing.",
    steps: [
      { text: "Check responsiveness and breathing.", critical: true },
      { text: "Place hands in center of chest.", detail: "Interlock your fingers." },
      { text: "Push hard and fast.", detail: "Aim for 100-120 compressions per minute. Push at least 2 inches deep." },
      { text: "Do not stop until help arrives or they wake up.", critical: true },
    ]
  },
  {
    id: "choking",
    title: "Choking",
    icon: AlertCircle,
    color: "text-accent-600 bg-accent-50 border-accent-200",
    description: "Person cannot breathe, cough, or speak.",
    steps: [
      { text: "Give 5 back blows.", detail: "Stand behind, lean them forward, hit firmly between shoulder blades." },
      { text: "Give 5 abdominal thrusts (Heimlich).", detail: "Make a fist above navel, pull inward and upward." },
      { text: "Alternate until object is dislodged.", critical: true },
    ]
  },
  {
    id: "bleeding",
    title: "Severe Bleeding",
    icon: Droplets,
    color: "text-alert-700 bg-alert-100 border-alert-300",
    description: "Heavy bleeding that won't stop.",
    steps: [
      { text: "Apply direct pressure.", detail: "Use a clean cloth or hands directly on the wound.", critical: true },
      { text: "Maintain constant pressure.", detail: "Do not peek to check the wound." },
      { text: "Elevate the injured area if possible above the heart." },
    ]
  },
];

export default function FirstAidPage() {
  const [activeGuide, setActiveGuide] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [speakingStep, setSpeakingStep] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const playVoice = (text: string, index: number) => {
    if (!synthRef.current) return;
    
    // Stop any existing speech
    synthRef.current.cancel();
    
    // If clicking the currently playing step, just stop it
    if (speakingStep === index) {
      setSpeakingStep(null);
      return;
    }

    setSpeakingStep(index);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 0.9;
    
    utterance.onend = () => setSpeakingStep(null);
    utterance.onerror = () => setSpeakingStep(null);
    
    synthRef.current.speak(utterance);
  };

  const filteredGuides = GUIDES.filter(g => 
    g.title.toLowerCase().includes(search.toLowerCase()) || 
    g.description.toLowerCase().includes(search.toLowerCase())
  );

  const guide = GUIDES.find(g => g.id === activeGuide);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-surface-bg" data-theme="paper">
      <header className="glass sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-surface-border">
        <button 
          onClick={() => {
            if (activeGuide) {
              setActiveGuide(null);
              if (synthRef.current) synthRef.current.cancel();
              setSpeakingStep(null);
            } else {
              window.history.back();
            }
          }} 
          className="w-9 h-9 rounded-xl bg-paper-200 border border-paper-300 flex items-center justify-center text-ink-600 hover:bg-paper-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-display font-bold text-ink-900 text-sm">First Aid Guide</span>
        <div className="w-9 h-9 flex items-center justify-center">
          <Activity className="w-5 h-5 text-primary-600" />
        </div>
      </header>

      <main className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full relative">
        <AnimatePresence mode="wait">
          {!activeGuide ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type="text"
                  placeholder="Search symptoms (e.g. bleeding, chest pain)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-paper-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                />
              </div>

              {/* Guide List */}
              <div className="grid gap-3">
                {filteredGuides.map((g, i) => (
                  <button
                    key={g.id}
                    onClick={() => setActiveGuide(g.id)}
                    className="card-elevated p-4 flex items-center gap-4 text-left group hover:border-primary-300 animate-slide-in-bottom"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${g.color}`}>
                      <g.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-ink-900 mb-0.5">{g.title}</h3>
                      <p className="text-xs text-ink-500 line-clamp-1">{g.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-ink-300 group-hover:text-primary-500 transition-colors" />
                  </button>
                ))}
                {filteredGuides.length === 0 && (
                  <div className="text-center py-10 text-ink-500 text-sm">
                    No guides found matching &quot;{search}&quot;
                  </div>
                )}
              </div>
            </motion.div>
          ) : guide ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4 pb-24" // Extra padding for bottom CTA
            >
              <div className={`p-5 rounded-2xl border ${guide.color} mb-6`}>
                <guide.icon className="w-8 h-8 mb-3" />
                <h2 className="text-2xl font-display font-bold mb-2">{guide.title}</h2>
                <p className="text-sm opacity-90">{guide.description}</p>
              </div>

              <div className="space-y-3">
                {guide.steps.map((step, idx) => (
                  <div 
                    key={idx} 
                    className={`card-elevated p-4 border-l-4 relative overflow-hidden transition-all duration-300 ${speakingStep === idx ? "border-l-primary-500 shadow-lg scale-[1.02]" : step.critical ? "border-l-alert-500" : "border-l-paper-300"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${speakingStep === idx ? "bg-primary-500 text-white" : "bg-paper-200 text-ink-600"}`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className={`text-sm font-semibold mb-1 ${step.critical ? "text-alert-700" : "text-ink-900"}`}>
                          {step.text}
                        </p>
                        {step.detail && (
                          <p className="text-xs text-ink-500">{step.detail}</p>
                        )}
                      </div>
                      <button 
                        onClick={() => playVoice(`${step.text}. ${step.detail || ""}`, idx)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${speakingStep === idx ? "bg-primary-100 text-primary-600" : "bg-paper-100 text-ink-400 hover:bg-paper-200 hover:text-primary-500"}`}
                        aria-label="Play step instructions"
                      >
                        <Volume2 className={`w-4 h-4 ${speakingStep === idx ? "animate-pulse" : ""}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      {/* Floating SOS CTA in detail view */}
      {activeGuide && (
        <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-paper-200 animate-slide-in-bottom">
          <div className="max-w-2xl mx-auto flex gap-3">
             <Link href="/sos" className="flex-1 h-12 rounded-xl bg-alert-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-alert-700 transition-colors">
               <Shield className="w-4 h-4" /> Emergency SOS
             </Link>
             <a href="tel:108" className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shadow-sm">
               <Phone className="w-5 h-5" />
             </a>
          </div>
        </div>
      )}
    </div>
  );
}
