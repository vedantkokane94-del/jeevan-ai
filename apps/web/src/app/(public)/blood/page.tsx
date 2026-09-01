"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Droplets, MapPin, Clock, Phone, User, Heart, AlertTriangle, CheckCircle2, Search, ArrowRight, Shield } from "lucide-react";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("@jeevan-ai/ui").then((mod) => mod.Map), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-paper-200 skeleton rounded-xl" />,
});

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface Donor { id: string; name: string; group: string; distance: string; lastDonated: string; verified: boolean; lat: number; lng: number; }
const mockDonors: Donor[] = [
  { id: "1", name: "Rajesh Sharma", group: "O+", distance: "1.2 km", lastDonated: "3 months ago", verified: true, lat: 20.0065, lng: 73.7910 },
  { id: "2", name: "Priya Patel", group: "O+", distance: "2.8 km", lastDonated: "6 months ago", verified: true, lat: 20.0080, lng: 73.7850 },
  { id: "3", name: "Arun Kumar", group: "O+", distance: "3.5 km", lastDonated: "4 months ago", verified: false, lat: 20.0020, lng: 73.7880 },
  { id: "4", name: "Meena Singh", group: "O-", distance: "4.1 km", lastDonated: "5 months ago", verified: true, lat: 19.9980, lng: 73.7950 },
];

interface BloodRequest { id: string; group: string; hospital: string; urgency: "CRITICAL" | "URGENT" | "NEEDED"; distance: string; timeLeft: string; }
const mockRequests: BloodRequest[] = [
  { id: "req1", group: "O+", hospital: "Civil Hospital Nashik", urgency: "CRITICAL", distance: "2.4 km", timeLeft: "45 min" },
  { id: "req2", group: "AB-", hospital: "District Hospital", urgency: "URGENT", distance: "3.1 km", timeLeft: "2 hrs" },
  { id: "req3", group: "B+", hospital: "Apollo Hospitals Nashik", urgency: "NEEDED", distance: "4.8 km", timeLeft: "6 hrs" },
];

export default function BloodNetwork() {
  const [tab, setTab] = useState<"request" | "donate">("request");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [step, setStep] = useState(0); // 0=select group, 1=results
  const [confirmDonate, setConfirmDonate] = useState<string | null>(null);

  const mapPoints = mockDonors.map(d => ({
    id: d.id,
    latitude: d.lat,
    longitude: d.lng,
    title: `${d.name} (${d.group})`,
    severity: "LOW" as const
  }));

  return (
    <div className="min-h-[100dvh] flex flex-col bg-surface-bg" data-theme="paper">
      <header className="glass sticky top-0 z-30 px-4 py-3 border-b border-surface-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Link href="/emergency" className="w-9 h-9 rounded-xl bg-paper-200 flex items-center justify-center text-ink-600 hover:bg-paper-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-display font-bold text-ink-900 leading-tight">Blood Network</h1>
              <p className="text-[10px] text-ink-400 font-mono">Nashik Kumbh District</p>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center">
            <Droplets className="w-5 h-5 text-alert-600" />
          </div>
        </div>
        
        <div className="flex bg-paper-200 rounded-xl p-1 gap-1">
          <button onClick={() => setTab("request")} className={`flex-1 h-9 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${tab === "request" ? "bg-white shadow-sm text-alert-600" : "text-ink-500 hover:text-ink-700"}`}>
            <AlertTriangle className="w-3.5 h-3.5" /> Urgent Requests
          </button>
          <button onClick={() => setTab("donate")} className={`flex-1 h-9 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${tab === "donate" ? "bg-white shadow-sm text-primary-600" : "text-ink-500 hover:text-ink-700"}`}>
            <Search className="w-3.5 h-3.5" /> Find Donors
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 max-w-xl mx-auto w-full relative">
        
        {/* ═══════ URGENT REQUESTS TAB ═══════ */}
        {tab === "request" ? (
          <div className="space-y-4 animate-fade-in">
            {mockRequests.map((r, i) => (
              <div key={r.id} className={`card-elevated p-5 relative overflow-hidden animate-slide-in-bottom ${r.urgency === "CRITICAL" ? "border-alert-200" : ""}`} style={{ animationDelay: `${i * 80}ms` }}>
                {r.urgency === "CRITICAL" && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-alert-500 animate-pulse" />
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg shadow-md shrink-0 ${r.urgency === "CRITICAL" ? "bg-alert-600 text-white shadow-alert-600/30" : "bg-alert-50 text-alert-700 border border-alert-200"}`}>
                      {r.group}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-ink-900 text-sm line-clamp-1">{r.hospital}</h3>
                      <p className="text-xs text-ink-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3 text-primary-500" /> {r.distance} away</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider ${r.urgency === "CRITICAL" ? "bg-alert-100 text-alert-700" : r.urgency === "URGENT" ? "bg-accent-100 text-accent-700" : "bg-primary-100 text-primary-700"}`}>
                    {r.urgency}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-paper-100 border border-paper-200 mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${r.urgency === "CRITICAL" ? "bg-alert-100" : "bg-paper-200"}`}>
                      <Clock className={`w-4 h-4 ${r.urgency === "CRITICAL" ? "text-alert-600 animate-pulse" : "text-ink-500"}`} />
                    </div>
                    <div>
                      <p className="text-[10px] text-ink-400 uppercase font-semibold">Time Remaining</p>
                      <p className={`text-xs font-bold ${r.urgency === "CRITICAL" ? "text-alert-600" : "text-ink-800"}`}>{r.timeLeft}</p>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-paper-300" />
                  <div>
                    <p className="text-[10px] text-ink-400 uppercase font-semibold">Units Needed</p>
                    <p className="text-xs font-bold text-ink-800 text-center">2 Units</p>
                  </div>
                </div>

                {confirmDonate === r.id ? (
                  <div className="flex gap-2 animate-fade-in">
                    <button onClick={() => setConfirmDonate(null)} className="flex-1 h-11 rounded-xl bg-paper-200 text-ink-600 font-semibold text-sm">Cancel</button>
                    <button className="flex-1 h-11 rounded-xl bg-success-600 text-white font-semibold text-sm shadow-md">Confirm Donation</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setConfirmDonate(r.id)}
                    className="w-full h-11 rounded-xl bg-alert-600 text-white text-sm font-semibold hover:bg-alert-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Heart className="w-4 h-4 fill-current" /> Donate Now
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : 
        /* ═══════ FIND DONORS TAB ═══════ */
        step === 0 ? (
          <div className="animate-fade-in">
            <h2 className="text-sm font-semibold text-ink-900 mb-1">Select Blood Group</h2>
            <p className="text-xs text-ink-400 mb-6">Choose the blood group you need to find nearby donors.</p>
            
            <div className="grid grid-cols-4 gap-3">
              {bloodGroups.map((g, i) => (
                <button
                  key={g}
                  onClick={() => { setSelectedGroup(g); setStep(1); }}
                  className={`h-16 rounded-xl font-display font-bold text-xl flex items-center justify-center transition-all card-elevated hover:border-alert-300 animate-slide-in-bottom`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {g}
                </button>
              ))}
            </div>
            
            <div className="mt-8 p-4 rounded-xl bg-primary-50 border border-primary-100 flex gap-3 items-start">
               <Shield className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
               <div>
                 <p className="text-sm font-semibold text-primary-900">Verified Donors Only</p>
                 <p className="text-xs text-primary-700 mt-1">Donors with the green checkmark have verified their blood group with government medical records.</p>
               </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in flex flex-col h-[calc(100dvh-140px)]">
            <button onClick={() => setStep(0)} className="flex items-center gap-1.5 text-xs text-ink-500 font-semibold mb-4 hover:text-ink-800 transition-colors w-fit px-2 py-1 -ml-2 rounded hover:bg-paper-200">
              <ArrowLeft className="w-3.5 h-3.5" /> Change Blood Group
            </button>
            
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-ink-900">
                <span className="text-alert-600">{mockDonors.length}</span> donors found for <span className="text-alert-600">{selectedGroup}</span>
              </h2>
            </div>
            
            {/* Map View */}
            <div className="w-full h-48 rounded-xl overflow-hidden border border-paper-300 mb-4 shrink-0 relative">
               <DynamicMap center={[20.0050, 73.7900]} zoom={13} points={mapPoints} theme="light" />
               <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur rounded text-[10px] font-bold text-ink-600 shadow-sm border border-paper-200">
                 Within 5 km
               </div>
            </div>

            <div className="space-y-3 overflow-y-auto pb-4 no-scrollbar flex-1">
              {mockDonors.map((d, i) => (
                <div key={d.id} className="card-elevated p-4 flex items-center gap-4 animate-slide-in-bottom" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="w-12 h-12 rounded-full bg-paper-100 border border-paper-200 flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-ink-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className="font-display font-bold text-ink-900 text-sm truncate">{d.name}</h3>
                      {d.verified && <CheckCircle2 className="w-3.5 h-3.5 text-success-500 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-ink-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary-500" /> {d.distance}</span>
                      <span>Last: {d.lastDonated}</span>
                    </div>
                  </div>
                  <a href="tel:9999999999" className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
