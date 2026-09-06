"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Siren, MapPin, Users, Phone, Navigation, Eye, EyeOff, Smartphone, Volume2 } from "lucide-react";

export default function WomenSafety() {
  const [silentMode, setSilentMode] = useState(false);
  const [sosActive, setSosActive] = useState(false);

  if (sosActive) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6" data-theme="paper">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-2xl font-display font-bold text-ink-900 mb-2">Silent Alert Active</h1>
          <p className="text-sm text-ink-300 mb-4 max-w-xs mx-auto">Your live location is being shared with 3 trusted contacts. No visible or audible alerts.</p>
          <div className="card-elevated p-4 mb-6 max-w-xs mx-auto text-left">
            <p className="text-xs text-ink-300 font-medium mb-2">Contacts Notified:</p>
            <div className="space-y-2 text-sm text-ink-600">
              <p>✓ Mummy — Live location shared</p>
              <p>✓ Papa — Live location shared</p>
              <p>✓ Bhai — Live location shared</p>
            </div>
          </div>
          <button onClick={() => setSosActive(false)} className="h-12 px-8 rounded-xl bg-ink-900 text-white font-semibold hover:bg-ink-800 transition-colors">
            Deactivate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col" data-theme="paper">
      <header className="glass sticky top-0 z-30 px-4 py-3 flex items-center gap-3">
        <Link href="/emergency" className="w-9 h-9 rounded-xl bg-paper-200 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-ink-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-display font-bold text-ink-900">Women & Child Safety</h1>
          <p className="text-xs text-ink-300">Discreet protection features</p>
        </div>
        <button
          onClick={() => setSilentMode(!silentMode)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${silentMode ? "bg-purple-600 text-white" : "bg-paper-200 text-ink-400"}`}
        >
          {silentMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        {/* Silent SOS */}
        <button
          onClick={() => setSosActive(true)}
          className="w-full card-elevated p-6 mb-4 flex items-center gap-4 ring-2 ring-purple-200 bg-purple-50/30 group card-interactive"
        >
          <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center shadow-md">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-display font-bold text-ink-900">Silent SOS</h3>
            <p className="text-xs text-ink-300 mt-0.5">Discreetly alert contacts without any visible or audible notification</p>
          </div>
        </button>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: Smartphone, title: "Shake SOS", desc: "Shake phone 3 times", color: "bg-accent-600" },
            { icon: Volume2, title: "Voice SOS", desc: 'Say "Help me"', color: "bg-alert-600" },
            { icon: Navigation, title: "Safe Route", desc: "Well-lit, populated paths", color: "bg-primary-600" },
            { icon: Users, title: "Alert Contacts", desc: "Share live location", color: "bg-success-600" },
          ].map(a => (
            <button key={a.title} className="card-elevated p-4 text-left group card-interactive">
              <div className={`w-10 h-10 rounded-xl ${a.color} flex items-center justify-center mb-3 shadow-sm`}>
                <a.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display font-bold text-ink-900 text-sm">{a.title}</h3>
              <p className="text-xs text-ink-300 mt-0.5">{a.desc}</p>
            </button>
          ))}
        </div>

        {/* Trusted Contacts */}
        <h2 className="text-xs font-semibold text-ink-300 uppercase tracking-wide mb-3">Trusted Contacts</h2>
        <div className="space-y-2 mb-8">
          {["Mummy", "Papa", "Bhai"].map(name => (
            <div key={name} className="card-elevated p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-600">
                {name[0]}
              </div>
              <span className="flex-1 text-sm font-medium text-ink-900">{name}</span>
              <a href="tel:+919999999999" className="w-8 h-8 rounded-lg bg-paper-200 flex items-center justify-center text-ink-400 hover:bg-purple-100 hover:text-purple-600 transition-colors">
                <Phone className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        {/* Helplines */}
        <div className="card-elevated p-4 bg-purple-50/50 border-purple-200">
          <h3 className="font-display font-bold text-ink-900 text-sm mb-3">Emergency Helplines</h3>
          <div className="space-y-2 text-sm">
            <a href="tel:181" className="flex items-center justify-between text-ink-600 hover:text-purple-600 transition-colors">
              <span>Women Helpline</span>
              <span className="font-bold text-purple-600">181</span>
            </a>
            <a href="tel:1098" className="flex items-center justify-between text-ink-600 hover:text-purple-600 transition-colors">
              <span>Child Helpline</span>
              <span className="font-bold text-purple-600">1098</span>
            </a>
            <a href="tel:112" className="flex items-center justify-between text-ink-600 hover:text-alert-600 transition-colors">
              <span>National Emergency</span>
              <span className="font-bold text-alert-600">112</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
