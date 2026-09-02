"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowRight, Lock, User, Loader2, Navigation, MapPin, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, userLocation, isFetchingLocation, fetchLiveLocation } = useAuth();
  
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  // Trigger GPS acquisition when login page mounts
  React.useEffect(() => {
    fetchLiveLocation();
  }, [fetchLiveLocation]);

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
      // Ensure latest GPS is fetched on submit
      await fetchLiveLocation();
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

  const handleDemoLogin = async (demoEmail: string, role: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setIsLoading(true);
    try {
      await fetchLiveLocation();
      await login({ email: demoEmail, password: "password123" });
    } catch (err) {
      // If demo login backend API is in simulation mode, redirect directly based on role
      if (role === "RESPONDER") router.push("/responder/dashboard");
      else if (role === "COMMAND") router.push("/command/dashboard");
      else router.push("/emergency");
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-surface-bg" data-theme="paper">
      
      {/* Left Form Side */}
      <div className="w-full md:w-1/2 lg:w-[500px] flex flex-col justify-between p-6 md:p-12 z-10 bg-surface-bg shadow-2xl relative">
        <Link href="/" className="flex items-center gap-2 group w-max">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md overflow-hidden group-hover:shadow-glow-primary transition-shadow">
            <img src="/logo.png" alt="JEEVAN AI" className="w-full h-full object-contain p-1" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight text-ink-900">
            JEEVAN <span className="text-primary-600">AI</span>
          </span>
        </Link>

        <div className="w-full max-w-sm mx-auto my-8 animate-fade-in-up">
          <div className="mb-6 text-center md:text-left">
            <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">Welcome Back</h1>
            <p className="text-sm text-ink-400">Secure Access Gateway & Real-Time GPS Synchronization.</p>
          </div>

          {/* Real-Time Live GPS Acquisition Banner */}
          <div className="mb-6 p-3.5 rounded-2xl bg-primary-50 border border-primary-200 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-md">
              {isFetchingLocation ? (
                <Navigation className="w-5 h-5 animate-spin" />
              ) : (
                <MapPin className="w-5 h-5 text-white animate-bounce" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-ink-900">
                  {isFetchingLocation ? "Requesting Live GPS Location..." : "Live GPS Acquired"}
                </span>
                {!isFetchingLocation && <CheckCircle2 className="w-3.5 h-3.5 text-success-600" />}
              </div>
              <p className="text-[11px] text-ink-500 truncate font-mono">
                {userLocation 
                  ? `${userLocation.latitude.toFixed(4)}° N, ${userLocation.longitude.toFixed(4)}° E • ${userLocation.locationName}`
                  : "Fetching browser GPS coordinates..."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full h-12 rounded-xl bg-primary-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 hover:bg-primary-700 hover:shadow-glow-primary transition-all disabled:opacity-50 mt-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Lock className="w-4 h-4" /> Sign In & Sync Live Location</>}
            </button>
          </form>

          {/* Quick Instant Demo Sign-In */}
          <div className="mt-6 space-y-2">
            <p className="text-[10px] text-ink-400 uppercase tracking-widest font-mono text-center font-bold">
              Quick One-Tap Sign In with Live GPS:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDemoLogin("responder@jeevan.gov.in", "RESPONDER")}
                className="p-2.5 rounded-xl bg-paper-100 border border-paper-300 hover:border-primary-500 text-xs font-bold text-ink-800 hover:text-primary-600 transition-all text-center"
              >
                🚑 Ambulance Responder
              </button>
              <button
                onClick={() => handleDemoLogin("command@jeevan.gov.in", "COMMAND")}
                className="p-2.5 rounded-xl bg-paper-100 border border-paper-300 hover:border-primary-500 text-xs font-bold text-ink-800 hover:text-primary-600 transition-all text-center"
              >
                🏛️ Command Officer
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-paper-200">
            <p className="text-xs text-ink-400 text-center mb-3">Are you a citizen looking for help?</p>
            <Link href="/emergency" className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-alert-50 text-alert-700 font-semibold hover:bg-alert-100 transition-colors border border-alert-200">
              Get Immediate Emergency Help <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <p className="text-xs text-ink-300 text-center md:text-left">
          &copy; 2027 JEEVAN AI Platform • Live GPS Synchronized
        </p>
      </div>

      {/* Right Illustration Side */}
      <div className="hidden md:flex flex-1 gradient-hero relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #0d9488 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        
        <div className="max-w-lg text-center relative z-10 animate-fade-in-up delay-200">
          <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-white backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl animate-float overflow-hidden p-2">
            <img src="/logo.png" alt="JEEVAN AI" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-4xl font-display font-bold text-ink-900 mb-4">Live GPS Security Network</h2>
          <p className="text-lg text-ink-500 leading-relaxed">
            Authorized personnel access. Your real-time GPS coordinates are automatically synchronized upon login to optimize emergency dispatch.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/50 text-left">
              <h3 className="font-bold text-ink-900 mb-1">Command Sync</h3>
              <p className="text-xs text-ink-500">Live GPS tracking & digital twin feeds</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/50 text-left">
              <h3 className="font-bold text-ink-900 mb-1">Responder Sync</h3>
              <p className="text-xs text-ink-500">Automatic shortest route navigation</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
