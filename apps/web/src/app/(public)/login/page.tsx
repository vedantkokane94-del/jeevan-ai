"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowRight, Lock, User, Loader2 } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      if (user.role === "RESPONDER") router.push("/responder/dashboard");
      else if (user.role === "COMMAND") router.push("/command/dashboard");
      else if (user.role === "ADMIN") router.push("/admin/users");
      else router.push("/emergency");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ email, password });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid login credentials.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-surface-bg" data-theme="paper">
      
      {/* Left Form Side */}
      <div className="w-full md:w-1/2 lg:w-[480px] flex flex-col justify-between p-6 md:p-12 z-10 bg-surface-bg shadow-2xl relative">
        <Link href="/" className="flex items-center gap-2 group w-max">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md overflow-hidden group-hover:shadow-glow-primary transition-shadow">
            <img src="/logo.png" alt="JEEVAN AI" className="w-full h-full object-contain p-1" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight text-ink-900">
            JEEVAN <span className="text-primary-600">AI</span>
          </span>
        </Link>

        <div className="w-full max-w-sm mx-auto my-12 animate-fade-in-up">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">Welcome Back</h1>
            <p className="text-sm text-ink-400">Secure Access Gateway for official personnel.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-alert-700 bg-alert-50 border border-alert-200 rounded-xl animate-scale-in flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-500 uppercase tracking-wide ml-1" htmlFor="email">Email / ID</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-300" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-paper-300 bg-paper-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="name@jeevan.gov.in"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-500 uppercase tracking-wide ml-1" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-300" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-paper-300 bg-paper-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !email || !password}
              className="w-full h-12 rounded-xl bg-primary-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 hover:bg-primary-700 hover:shadow-glow-primary transition-all disabled:opacity-50 mt-4"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Lock className="w-4 h-4" /> Secure Sign In</>}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-paper-200">
            <p className="text-xs text-ink-400 text-center mb-4">Are you a citizen looking for help?</p>
            <Link href="/emergency" className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-alert-50 text-alert-700 font-semibold hover:bg-alert-100 transition-colors border border-alert-200">
              Get Emergency Help <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <p className="text-xs text-ink-300 text-center md:text-left">
          &copy; 2027 JEEVAN AI Platform.
        </p>
      </div>

      {/* Right Illustration Side */}
      <div className="hidden md:flex flex-1 gradient-hero relative overflow-hidden items-center justify-center p-12">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #0d9488 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        
        <div className="max-w-lg text-center relative z-10 animate-fade-in-up delay-200">
          <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-white backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl animate-float overflow-hidden p-2">
            <img src="/logo.png" alt="JEEVAN AI" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-4xl font-display font-bold text-ink-900 mb-4">Secure Network</h2>
          <p className="text-lg text-ink-500 leading-relaxed">
            Authorized personnel access only. Every action on this platform helps save lives. Proceed with operational awareness.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/50 text-left">
              <h3 className="font-bold text-ink-900 mb-1">Command</h3>
              <p className="text-xs text-ink-500">Access Digital Twin & Intelligence</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/50 text-left">
              <h3 className="font-bold text-ink-900 mb-1">Responder</h3>
              <p className="text-xs text-ink-500">Access Live Tactical Feeds</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
