/* eslint-disable */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mic, MicOff, ArrowLeft, Volume2, Info, Check, Shield, Globe, Activity, HeartPulse } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Polyfill for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type Language = "en-IN" | "hi-IN" | "mr-IN";
const LANG_MAP = {
  "en-IN": "English",
  "hi-IN": "हिंदी",
  "mr-IN": "मराठी"
};

type VoicePhase = "idle" | "listening" | "processing" | "followup" | "action";

export default function VoiceAssistant() {
  const router = useRouter();
  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("Tap the microphone and describe the emergency.");
  const [hasError, setHasError] = useState(false);
  const [language, setLanguage] = useState<Language>("en-IN");
  
  // Follow-up state
  const [followupQuestion, setFollowupQuestion] = useState("");
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = language;

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
          if (event.results[current].isFinal) {
            analyzeIntent(text);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          setHasError(true);
          setPhase("idle");
          if (event.error === "not-allowed") {
            setFeedback("Microphone access denied. Please enable permissions.");
          } else {
            setFeedback("Could not understand. Please try again or tap SOS.");
          }
        };

        recognitionRef.current.onend = () => {
          if (phase === "listening") {
            // Wait for analyzeIntent to complete before changing state
          }
        };
      } else {
        setHasError(true);
        setFeedback("Speech recognition is not supported in this browser. Please use the SOS button.");
      }

      synthRef.current = window.speechSynthesis;
    }
    
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [language, phase]);

  const speak = (text: string, lang = "en-IN") => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      synthRef.current.speak(utterance);
    }
  };

  const analyzeIntent = (text: string) => {
    const lower = text.toLowerCase();
    setPhase("processing");
    setFeedback("Analyzing...");
    
    // Emergency Keywords
    const isEmergency = ["emergency", "help", "attack", "gir gaye", "bachao", "madat", "heart", "pain", "accident", "blood", "fire", "heatstroke", "faint", "behosh"].some(kw => lower.includes(kw));

    if (isEmergency) {
      setProcessingSteps([
        "Preparing SOS payload...",
        "Identifying nearest First Aid protocol...",
        "Alerting nearby responders..."
      ]);

      setTimeout(() => {
        setPhase("followup");
        const q = language === "mr-IN" ? "मला समजले. ते शुद्धीवर आहेत का?" : 
                  language === "hi-IN" ? "मुझे समझ आ गया। क्या वे होश में हैं?" : 
                  "I understand. Are they conscious?";
        setFollowupQuestion(q);
        speak(q, language);
      }, 1500);
    } else {
      setTimeout(() => {
        setPhase("idle");
        setFeedback("Please describe the emergency clearly.");
        setTranscript("");
      }, 1500);
    }
  };

  const handleFollowup = (answer: string) => {
    setPhase("action");
    const msg = language === "mr-IN" ? "मदत पाठवली जात आहे." : 
                language === "hi-IN" ? "मदद भेजी जा रही है।" : 
                "Help is being dispatched.";
    setFeedback(msg);
    speak(msg, language);
    
    setTimeout(() => {
      router.push("/sos");
    }, 2500);
  };

  const toggleListening = () => {
    if (phase === "listening") {
      recognitionRef.current?.stop();
      setPhase("idle");
    } else {
      setHasError(false);
      setTranscript("");
      setFeedback("Listening...");
      setPhase("listening");
      try {
        recognitionRef.current?.start();
      } catch (e) {} // Handle double start
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-ink-950" data-theme="ink">
      {/* ═══════ HEADER ═══════ */}
      <header className="glass-dark sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-ink-800">
        <Link href="/emergency" className="w-9 h-9 rounded-xl bg-ink-900 border border-ink-800 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-ink-300" />
        </Link>
        <span className="font-display font-bold text-white text-sm">AI Voice Assistant</span>
        
        {/* Language Picker */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink-900 border border-ink-800 text-xs font-semibold text-ink-300">
            <Globe className="w-3.5 h-3.5" />
            {LANG_MAP[language]}
          </button>
          <div className="absolute right-0 top-full mt-1 w-32 bg-ink-900 border border-ink-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            {(Object.keys(LANG_MAP) as Language[]).map(l => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-ink-800 first:rounded-t-lg last:rounded-b-lg ${language === l ? "text-primary-400 font-bold" : "text-white"}`}
              >
                {LANG_MAP[l]}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        
        {/* Animated Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
           <div className={`w-64 h-64 rounded-full blur-[100px] mix-blend-screen transition-colors duration-1000 ${phase === "listening" ? "bg-accent-600" : phase === "action" ? "bg-alert-600" : "bg-primary-600"}`} />
        </div>

        {/* ═══════ FOLLOW-UP PHASE ═══════ */}
        {phase === "followup" ? (
          <div className="z-10 w-full max-w-sm animate-fade-in-up">
            <div className="card-elevated p-6 bg-ink-900 border-ink-800 text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-accent-500/20 flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-6 h-6 text-accent-400 animate-pulse" />
              </div>
              <h2 className="text-xl font-display font-bold text-white mb-2">{followupQuestion}</h2>
              <p className="text-xs text-ink-400">JEEVAN AI is gathering context...</p>
            </div>

            {/* Concurrent background tasks */}
            <div className="space-y-2 mb-8">
              {processingSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-ink-300 animate-fade-in-up" style={{ animationDelay: `${i * 200}ms` }}>
                  <Activity className="w-3.5 h-3.5 text-primary-500 animate-spin-slow" />
                  {step}
                </div>
              ))}
            </div>

            {/* Response Buttons */}
            <div className="grid grid-cols-1 gap-3">
              <button onClick={() => handleFollowup("yes")} className="h-14 rounded-xl bg-success-600 hover:bg-success-700 text-white font-bold text-lg transition-colors shadow-lg shadow-success-600/20">
                Yes
              </button>
              <button onClick={() => handleFollowup("no")} className="h-14 rounded-xl bg-alert-600 hover:bg-alert-700 text-white font-bold text-lg transition-colors shadow-lg shadow-alert-600/20">
                No
              </button>
              <button onClick={() => handleFollowup("notsure")} className="h-12 rounded-xl bg-ink-800 hover:bg-ink-700 text-ink-300 font-bold transition-colors">
                Not Sure
              </button>
            </div>
          </div>
        ) : (
          /* ═══════ IDLE / LISTENING / PROCESSING ═══════ */
          <>
            <div className="text-center z-10 w-full max-w-sm mb-12 animate-fade-in">
              <p className="text-xs font-semibold text-accent-400 mb-3 uppercase tracking-widest flex items-center justify-center gap-2">
                {phase === "listening" && <span className="live-dot" style={{ background: "#f59e0b", boxShadow: "0 0 6px rgba(245,158,11,0.6)" }} />}
                {phase === "listening" ? "Listening..." : phase === "processing" ? "Processing..." : "Standby"}
              </p>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4 min-h-[80px] flex items-center justify-center transition-all">
                {transcript || (phase === "idle" && "Speak clearly into your microphone.") || "..."}
              </h2>
              <p className={`text-sm ${hasError ? "text-alert-400" : "text-ink-400"}`}>
                {feedback}
              </p>
            </div>

            {/* Voice Visualizer / Button */}
            <div className="relative z-10 mt-8 mb-16">
              <AnimatePresence>
                {phase === "listening" && (
                  <>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0, 0.2] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-accent-500 rounded-full"
                    />
                    {/* Simulated Waveform Rings */}
                    <div className="absolute -inset-10 flex items-center justify-center gap-1 opacity-50">
                      {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [10, h * 20, 10] }}
                          transition={{ duration: 0.5 + Math.random(), repeat: Infinity, repeatType: "reverse" }}
                          className="w-1.5 bg-accent-400 rounded-full"
                        />
                      ))}
                    </div>
                  </>
                )}
              </AnimatePresence>

              <button
                onClick={toggleListening}
                disabled={phase === "processing" || phase === "action"}
                className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center shadow-2xl transition-all z-10
                  ${phase === "listening" ? "bg-accent-600 text-white shadow-glow-accent" : 
                    phase === "processing" ? "bg-primary-600 text-white animate-pulse" :
                    "bg-ink-900 border border-ink-800 text-ink-300 hover:text-white hover:border-ink-700"
                  }`}
              >
                {phase === "listening" ? <Mic className="w-10 h-10" /> : <MicOff className="w-10 h-10" />}
              </button>
            </div>

            {/* Examples */}
            {phase === "idle" && (
              <div className="z-10 w-full max-w-sm p-4 rounded-2xl bg-ink-900/50 border border-ink-800/50 flex items-start gap-3 animate-fade-in-up">
                 <Info className="w-5 h-5 text-ink-500 shrink-0 mt-0.5" />
                 <div>
                   <p className="text-xs text-ink-400 mb-2">Try saying:</p>
                   <ul className="text-sm font-semibold text-ink-200 space-y-2">
                     <li>&quot;Mere baba padle aahet.&quot;</li>
                     <li>&quot;Emergency, need an ambulance.&quot;</li>
                     <li>&quot;Yahan aag lagi hai.&quot;</li>
                   </ul>
                 </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
