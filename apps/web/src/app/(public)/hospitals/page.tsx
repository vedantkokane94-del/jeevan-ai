"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Hospital, Search, MapPin, Clock, Navigation, Star,
  ArrowLeft, Heart, Stethoscope, Droplets, Shield,
  Filter, ChevronRight, Zap, CheckCircle2
} from "lucide-react";

interface HospitalData {
  id: string; name: string; distance: string; eta: string;
  rating: number; emergency: boolean; icu: number; icuTotal: number;
  bloodBank: boolean; specializations: string[];
  address: string; aiRecommended?: boolean;
}

const mockHospitals: HospitalData[] = [
  { id: "1", name: "Civil Hospital Nashik", distance: "2.4 km", eta: "8 min", rating: 4.5, emergency: true, icu: 3, icuTotal: 12, bloodBank: true, specializations: ["Trauma", "Cardiology", "Neurology"], address: "Trimbak Road, Nashik", aiRecommended: true },
  { id: "2", name: "District Hospital Nashik", distance: "3.1 km", eta: "12 min", rating: 4.2, emergency: true, icu: 1, icuTotal: 8, bloodBank: true, specializations: ["General", "Orthopedics"], address: "CBS, Nashik" },
  { id: "3", name: "Apollo Hospitals Nashik", distance: "4.8 km", eta: "15 min", rating: 4.7, emergency: true, icu: 5, icuTotal: 10, bloodBank: false, specializations: ["Cardiology", "Pediatrics", "Oncology"], address: "Panchavati, Nashik" },
  { id: "4", name: "Sahyadri Super Speciality Hospital", distance: "1.9 km", eta: "6 min", rating: 3.9, emergency: true, icu: 0, icuTotal: 4, bloodBank: false, specializations: ["General", "ENT"], address: "Wadala Naka, Nashik" },
  { id: "5", name: "Wockhardt Hospital", distance: "5.5 km", eta: "18 min", rating: 4.3, emergency: true, icu: 2, icuTotal: 6, bloodBank: true, specializations: ["Trauma", "Burns"], address: "Mumbai Naka, Nashik" },
];

function HospitalCard({ h }: { h: HospitalData }) {
  return (
    <div className={`card-elevated p-5 group card-interactive ${h.aiRecommended ? "ring-2 ring-primary-300 bg-primary-50/30" : ""}`}>
      {h.aiRecommended && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 mb-3">
          <Zap className="w-3.5 h-3.5" /> AI RECOMMENDED
        </div>
      )}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-ink-900 text-base line-clamp-1">{h.name}</h3>
          <p className="text-xs text-ink-300 mt-0.5">{h.address}</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-accent-600 shrink-0 ml-3">
          <Star className="w-3.5 h-3.5 fill-accent-400 text-accent-400" /> {h.rating}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 text-xs">
        <span className="flex items-center gap-1 text-ink-400"><MapPin className="w-3.5 h-3.5 text-primary-500" /> {h.distance}</span>
        <span className="flex items-center gap-1 text-ink-400"><Clock className="w-3.5 h-3.5 text-accent-500" /> {h.eta}</span>
        {h.emergency && <span className="flex items-center gap-1 text-success-600 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> ER Open</span>}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${h.icu > 0 ? "bg-success-50 text-success-700" : "bg-alert-50 text-alert-600"}`}>
          <Stethoscope className="w-3 h-3" /> ICU: {h.icu}/{h.icuTotal}
        </span>
        {h.bloodBank && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-alert-50 text-alert-700">
            <Droplets className="w-3 h-3" /> Blood Bank
          </span>
        )}
        {h.specializations.slice(0, 3).map(s => (
          <span key={s} className="px-2 py-1 rounded-md text-xs font-medium bg-paper-200 text-ink-500">{s}</span>
        ))}
      </div>

      <button className="w-full h-11 rounded-xl bg-primary-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors shadow-sm">
        <Navigation className="w-4 h-4" /> Navigate
      </button>
    </div>
  );
}

export default function HospitalFinder() {
  const [search, setSearch] = useState("");
  const filtered = mockHospitals.filter(h => h.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-[100dvh] flex flex-col bg-paper-50" data-theme="paper">
      <header className="glass sticky top-0 z-30 px-4 pt-3 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/emergency" className="w-9 h-9 rounded-xl bg-paper-200 flex items-center justify-center hover:bg-paper-300 transition-colors">
            <ArrowLeft className="w-5 h-5 text-ink-500" />
          </Link>
          <h1 className="text-lg font-display font-bold text-ink-900">Find Hospital</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search hospitals, specializations..."
            className="w-full h-11 pl-10 pr-10 rounded-xl border border-paper-300 bg-white text-sm placeholder:text-ink-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-paper-100 flex items-center justify-center hover:bg-paper-200 transition-colors">
            <Filter className="w-3.5 h-3.5 text-ink-400" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 pb-6">
        <p className="text-xs text-ink-200 mb-4 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-primary-500" />
          Sorted by AI recommendation — best match, not just closest
        </p>
        <div className="space-y-4">
          {filtered.map(h => <HospitalCard key={h.id} h={h} />)}
        </div>
      </main>
    </div>
  );
}
