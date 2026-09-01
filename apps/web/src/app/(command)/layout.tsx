"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { Shield, Radio, Layers, AlertTriangle, BarChart3, LogOut, History, Zap } from "lucide-react";

export default function CommandLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const nav = [
    { name: "Live Operations", href: "/command/dashboard", icon: Radio },
    { name: "Digital Twin", href: "/command/digital-twin", icon: Layers },
    { name: "Smart Corridors", href: "/command/smart-corridors", icon: Zap },
    { name: "Kumbh Replay", href: "/command/kumbh-replay", icon: History },
    { name: "Disaster Alerts", href: "/command/alerts", icon: AlertTriangle },
    { name: "Intelligence", href: "/command/analytics", icon: BarChart3 },
  ];

  return (
    <div className="flex h-[100dvh] bg-surface-bg text-surface-text overflow-hidden font-body" data-theme="ink">
      {/* Sidebar Navigation */}
      <aside className="w-16 lg:w-64 flex flex-col bg-ink-950 border-r border-surface-border z-20 shrink-0">
        <div className="h-14 flex items-center justify-center lg:justify-start lg:px-4 border-b border-surface-border">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="JEEVAN AI" className="w-full h-full object-contain" />
          </div>
          <span className="hidden lg:block ml-3 font-display font-bold text-white tracking-wide">COMMAND</span>
        </div>
        
        <nav className="flex-1 py-4 flex flex-col gap-2 px-2">
          {nav.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${isActive ? "bg-primary-600/20 text-primary-400 font-medium" : "hover:bg-ink-900 text-ink-400 hover:text-ink-200"}`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="hidden lg:block">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-surface-border flex items-center justify-center lg:justify-between">
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-ink-800 flex items-center justify-center text-xs font-bold text-ink-300">OP</div>
            <div>
              <p className="text-xs text-ink-200 font-medium line-clamp-1">{user?.full_name || "Operator"}</p>
              <p className="text-[10px] text-ink-500 font-mono">SYS_ADMIN</p>
            </div>
          </div>
          <button onClick={() => logout()} className="text-ink-500 hover:text-alert-400 transition-colors" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
