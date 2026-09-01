"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  ArrowLeft, Users, MapPin, Shield, CheckCircle2, 
  HeartPulse, Navigation, AlertTriangle, Phone, Radio, ChevronRight, UserPlus
} from "lucide-react";

// Use the existing Map component
const DynamicMap = dynamic(() => import("@jeevan-ai/ui").then((mod) => mod.Map), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-paper-100 skeleton">Loading Live Map...</div>,
});

export default function VolunteerNetwork() {
  const [formStep, setFormStep] = useState<"intro" | "register" | "registered">("intro");
  const defaultCenter: [number, number] = [20.0059, 73.7903]; // Nashik Ramkund

  return (
    <div className="min-h-[100dvh] flex flex-col bg-paper-50 font-body" data-theme="paper">
      
      {/* Header */}
      <header className="h-16 bg-white border-b border-paper-200 flex items-center px-4 shrink-0 sticky top-0 z-30">
        <Link href="/" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-paper-100 transition-colors mr-3">
          <ArrowLeft className="w-5 h-5 text-ink-600" />
        </Link>
        <div className="flex-1">
          <h1 className="font-display font-bold text-ink-900 text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" />
            Volunteer Network
          </h1>
          <p className="text-xs text-ink-400 font-medium">Nashik Kumbh Mela 2027</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row h-[calc(100dvh-4rem)]">
        
        {/* Left Content / Form Area */}
        <div className="w-full lg:w-1/2 flex flex-col bg-white overflow-y-auto z-10 shadow-xl">
          
          {formStep === "intro" && (
            <div className="p-6 sm:p-10 flex flex-col items-center justify-center min-h-full text-center animate-fade-in-up">
              <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6 shadow-glow-primary">
                <Shield className="w-10 h-10 text-primary-600" />
              </div>
              <h2 className="text-3xl font-display font-bold text-ink-900 mb-4">Become a Kumbh Mela Guardian</h2>
              <p className="text-ink-300 max-w-md mx-auto mb-10 leading-relaxed text-sm sm:text-base">
                Join a network of verified volunteers helping millions of pilgrims stay safe. Whether you have medical training, know the local area, or just want to help manage crowds, every pair of hands matters.
              </p>

              <div className="w-full max-w-md space-y-4 text-left mb-10">
                <div className="flex gap-4 items-start p-4 bg-paper-50 rounded-xl border border-paper-200">
                  <div className="p-2 bg-white rounded-lg shadow-sm shrink-0"><HeartPulse className="w-5 h-5 text-alert-500" /></div>
                  <div>
                    <h3 className="font-bold text-ink-900 text-sm">Medical Assist</h3>
                    <p className="text-xs text-ink-400 mt-1">CPR, First Aid, and nursing skills to assist in sector camps.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start p-4 bg-paper-50 rounded-xl border border-paper-200">
                  <div className="p-2 bg-white rounded-lg shadow-sm shrink-0"><Navigation className="w-5 h-5 text-accent-500" /></div>
                  <div>
                    <h3 className="font-bold text-ink-900 text-sm">Local Guide</h3>
                    <p className="text-xs text-ink-400 mt-1">Help redirect crowds and assist lost pilgrims with Nashik terrain.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setFormStep("register")}
                className="w-full max-w-md h-14 rounded-full bg-primary-600 text-white font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all hover:scale-[1.02]"
              >
                <UserPlus className="w-5 h-5" /> JOIN THE NETWORK
              </button>
            </div>
          )}

          {formStep === "register" && (
            <div className="p-6 sm:p-10 animate-fade-in-right max-w-lg mx-auto w-full">
              <button onClick={() => setFormStep("intro")} className="text-xs font-bold text-primary-600 flex items-center gap-1 hover:underline mb-8">
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
              
              <h2 className="text-2xl font-display font-bold text-ink-900 mb-6">Register Profile</h2>
              
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setFormStep("registered"); }}>
                
                <div>
                  <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-2">Full Name</label>
                  <input type="text" required placeholder="Ex. Ramesh Kumar" className="w-full h-12 px-4 rounded-xl border border-paper-200 bg-paper-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-2">Phone Number</label>
                  <input type="tel" required placeholder="+91" className="w-full h-12 px-4 rounded-xl border border-paper-200 bg-paper-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-2">Primary Skills (Select all that apply)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 p-3 border border-paper-200 rounded-lg cursor-pointer hover:bg-paper-50 transition-colors">
                      <input type="checkbox" className="accent-primary-600" /> <span className="text-sm font-medium text-ink-700">First Aid / CPR</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border border-paper-200 rounded-lg cursor-pointer hover:bg-paper-50 transition-colors">
                      <input type="checkbox" className="accent-primary-600" /> <span className="text-sm font-medium text-ink-700">Multi-lingual</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border border-paper-200 rounded-lg cursor-pointer hover:bg-paper-50 transition-colors">
                      <input type="checkbox" className="accent-primary-600" /> <span className="text-sm font-medium text-ink-700">Crowd Mgmt</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border border-paper-200 rounded-lg cursor-pointer hover:bg-paper-50 transition-colors">
                      <input type="checkbox" className="accent-primary-600" /> <span className="text-sm font-medium text-ink-700">Local Guide</span>
                    </label>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button type="submit" className="w-full h-14 rounded-xl bg-primary-600 text-white font-bold tracking-wide hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2">
                    Submit Registration <ChevronRight className="w-5 h-5" />
                  </button>
                  <p className="text-[10px] text-center text-ink-400 mt-4 leading-relaxed">
                    By registering, you agree to be deployed strictly under the command of the Nashik Police and NDRF guidelines.
                  </p>
                </div>
              </form>
            </div>
          )}

          {formStep === "registered" && (
            <div className="p-6 sm:p-10 flex flex-col items-center justify-center min-h-full text-center animate-scale-in">
              <div className="w-24 h-24 bg-success-50 rounded-full flex items-center justify-center mb-6 shadow-glow-success relative">
                <div className="absolute inset-0 border-4 border-success-200 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                <CheckCircle2 className="w-12 h-12 text-success-500 relative z-10" />
              </div>
              <h2 className="text-3xl font-display font-bold text-ink-900 mb-2">You Are On Duty</h2>
              <p className="text-ink-400 font-medium mb-8">Verified as Guardian ID: #NSK-4921</p>
              
              <div className="w-full max-w-sm bg-paper-50 border border-paper-200 rounded-2xl p-5 mb-8 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-success-500" />
                <h3 className="font-bold text-ink-900 text-sm flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-ink-400" /> Assigned Sector: Ramkund
                </h3>
                <p className="text-xs text-ink-400">Please remain in your zone. AI Command Center will ping you with a Push Notification if an incident occurs nearby.</p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-success-600 bg-success-50 px-4 py-2 rounded-full mb-8">
                <Radio className="w-4 h-4 animate-pulse" /> DEVICE LOCATION TRACKING ACTIVE
              </div>
              
              <Link href="/" className="text-primary-600 font-bold text-sm hover:underline">
                Return to Home
              </Link>
            </div>
          )}

        </div>

        {/* Right Content / Map Area */}
        <div className="w-full lg:w-1/2 relative bg-paper-100 hidden sm:block">
          {/* Map Layer */}
          <div className="absolute inset-0">
             <DynamicMap center={defaultCenter} zoom={14.5} className="w-full h-full" theme="light" />
          </div>
          
          {/* Active Needs Overlay */}
          <div className="absolute top-6 left-6 z-10 card-elevated p-4 bg-white/90 backdrop-blur-md w-72 max-w-[calc(100vw-3rem)]">
            <h3 className="text-xs font-bold text-ink-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Radio className="w-3 h-3 text-alert-500 animate-pulse" /> Live Volunteer Needs
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-alert-50 border border-alert-100 rounded-lg">
                <div className="flex items-center gap-2 text-alert-700 font-bold text-sm mb-1">
                  <HeartPulse className="w-4 h-4" /> Medical Need
                </div>
                <p className="text-xs text-alert-600 mb-2">CPR trained volunteers required at Tapovan Gate 4.</p>
                <div className="text-[10px] font-bold text-alert-500 uppercase">300m Away</div>
              </div>
              <div className="p-3 bg-accent-50 border border-accent-100 rounded-lg">
                <div className="flex items-center gap-2 text-accent-700 font-bold text-sm mb-1">
                  <AlertTriangle className="w-4 h-4" /> Crowd Assist
                </div>
                <p className="text-xs text-accent-600 mb-2">Crowd marshals needed to guide pilgrims at Trimbak Road.</p>
                <div className="text-[10px] font-bold text-accent-500 uppercase">1.2km Away</div>
              </div>
            </div>
          </div>

          {/* Volunteer Stats */}
          <div className="absolute bottom-6 left-6 right-6 z-10 flex gap-4">
            <div className="flex-1 card-elevated p-4 bg-white/95 backdrop-blur-md flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest">Active Guardians</p>
                <p className="text-2xl font-display font-bold text-ink-900">1,248</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-success-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-success-500" />
              </div>
            </div>
            <div className="flex-1 card-elevated p-4 bg-white/95 backdrop-blur-md flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest">Incidents Resolved</p>
                <p className="text-2xl font-display font-bold text-ink-900">842</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary-500" />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
