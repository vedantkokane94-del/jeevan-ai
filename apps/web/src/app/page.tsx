import Link from "next/link";
import {
  Shield, Activity, Brain, MapPin, Clock, Heart,
  Phone, Users, Zap, ChevronRight, ArrowRight,
  Siren, Hospital, Ambulance, Radio, AlertTriangle,
  CheckCircle2, Star, BadgeCheck, Globe
} from "lucide-react";

/* ─── Tiny inline components (no separate files needed) ─── */
import { HeroVideoModal } from "../components/HeroVideoModal";

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass" role="navigation" aria-label="Main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md overflow-hidden group-hover:shadow-glow-primary transition-shadow">
              <img src="/logo.png" alt="JEEVAN AI" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-display font-bold tracking-tight text-ink-900">
              JEEVAN <span className="text-primary-600">AI</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-400">
            <a href="#features" className="hover:text-primary-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary-600 transition-colors">How It Works</a>
            <a href="#safety" className="hover:text-primary-600 transition-colors">Safety</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:inline-flex items-center h-10 px-5 text-sm font-semibold text-ink-600 hover:text-primary-700 transition-colors">
              Sign In
            </Link>
            <Link href="/emergency" className="inline-flex items-center h-10 px-5 rounded-full bg-alert-600 text-white text-sm font-semibold shadow-md hover:bg-alert-700 hover:shadow-glow-alert transition-all">
              <Phone className="w-4 h-4 mr-2" />
              Emergency
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function StatCounter({ value, label, suffix = "" }: { value: string; label: string; suffix?: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl sm:text-5xl font-display font-bold text-gradient-primary">{value}{suffix}</div>
      <div className="mt-2 text-sm text-ink-300 font-medium">{label}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="card-elevated p-6 sm:p-8 group card-interactive">
      <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center mb-5 group-hover:bg-primary-100 group-hover:shadow-glow-primary transition-all">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
      <h3 className="text-lg font-display font-bold text-ink-900 mb-2">{title}</h3>
      <p className="text-sm text-ink-300 leading-relaxed">{desc}</p>
    </div>
  );
}

function StepItem({ num, title, desc, icon: Icon }: { num: string; title: string; desc: string; icon: React.ElementType }) {
  return (
    <div className="flex gap-5 items-start">
      <div className="flex flex-col items-center shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-display font-bold text-lg shadow-md shadow-primary-600/20">
          {num}
        </div>
        <div className="w-px h-full bg-gradient-to-b from-primary-300 to-transparent mt-2 min-h-[40px]" />
      </div>
      <div className="pb-10">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-primary-500" />
          <h4 className="font-display font-bold text-ink-900">{title}</h4>
        </div>
        <p className="text-sm text-ink-300 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-ink-950 text-ink-200 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center p-0.5 overflow-hidden">
                <img src="/logo.png" alt="JEEVAN AI" className="w-full h-full object-contain" />
              </div>
              <span className="font-display font-bold text-white">JEEVAN AI</span>
            </div>
            <p className="text-sm text-ink-300 leading-relaxed">
              Official AI-powered Emergency Response Platform for Nashik Kumbh Mela 2027.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-sm">Platform</h4>
            <ul className="space-y-2.5 text-sm text-ink-300">
              <li><Link href="/emergency" className="hover:text-primary-400 transition-colors">Emergency Help</Link></li>
              <li><Link href="/disaster" className="text-alert-400 hover:text-alert-300 font-bold transition-colors">Disaster Mode</Link></li>
              <li><Link href="/volunteer" className="hover:text-primary-400 transition-colors">Volunteer Network</Link></li>
              <li><Link href="/hospitals" className="hover:text-primary-400 transition-colors">Find Hospital</Link></li>
              <li><Link href="/first-aid" className="hover:text-primary-400 transition-colors">First Aid Guide</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-sm">Portals</h4>
            <ul className="space-y-2.5 text-sm text-ink-300">
              <li><Link href="/login" className="hover:text-primary-400 transition-colors">Responder Login</Link></li>
              <li><Link href="/login" className="hover:text-primary-400 transition-colors">Command Center</Link></li>
              <li><Link href="/login" className="hover:text-primary-400 transition-colors">Admin Portal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-sm">Contact</h4>
            <ul className="space-y-2.5 text-sm text-ink-300">
              <li>Emergency: <span className="text-alert-400 font-semibold">112</span></li>
              <li>Ambulance: <span className="text-alert-400 font-semibold">108</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-ink-800 pt-10 mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left side: Terms & Mission */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-display font-semibold text-white text-sm">JEEVAN AI • Nashik Simhastha Kumbh Mela 2027</h4>
                <p className="text-primary-400 font-medium text-sm">Protect Every Pilgrim. Predict Every Risk. Respond Before It&apos;s Too Late.</p>
              </div>
              <div className="text-xs text-ink-400 leading-relaxed max-w-lg space-y-2">
                <p><strong className="text-ink-300">Website Terms Notice:</strong> All content, designs, source code, graphics, documentation, and branding used in JEEVAN AI are protected by applicable copyright laws.</p>
                <p>The &quot;JEEVAN AI&quot; name, visual identity, and project materials are intended solely for this project and may not be reproduced or used for commercial purposes without permission from Abhay Sachin Donde.</p>
              </div>
            </div>

            {/* Right side: Copyright & Credits */}
            <div className="flex flex-col lg:items-end justify-between space-y-6 lg:space-y-0">
              <div className="flex items-center gap-1.5 text-xs text-ink-400">
                <BadgeCheck className="w-4 h-4 text-primary-500" />
                WCAG 2.1 AA Compliant
              </div>
              <div className="text-left lg:text-right space-y-1.5">
                <p className="text-sm text-ink-300 font-medium">Built with ❤️ in India by Abhay Sachin Donde</p>
                <p className="text-xs text-ink-500">&copy; 2026 JEEVAN AI. Designed and Developed by Abhay Sachin Donde.</p>
                <p className="text-xs text-ink-500">Copyright &copy; 2026 Abhay Sachin Donde. All Rights Reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Main Landing Page ─── */

export default function HomePage() {
  return (
    <div data-theme="paper" className="min-h-screen">
      <Navbar />

      {/* ══════ HERO ══════ */}
      <section className="relative min-h-screen flex items-center justify-center gradient-hero overflow-hidden pt-16">
        {/* Decorative dots grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #0d9488 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium mb-8 animate-fade-in-down">
            <Zap className="w-4 h-4" />
            Official Platform • Nashik Kumbh Mela 2027
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold tracking-tight text-ink-900 mb-6 animate-fade-in-up">
            Kumbh Mela{" "}
            <span className="text-gradient-hero">Safe & Secure.</span>
          </h1>

          <p className="text-lg sm:text-xl text-ink-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200" style={{ animationFillMode: "both" }}>
            The AI-powered public health platform designed to protect 150M+ pilgrims. We see the risk, predict the need, and move the help — before it&apos;s too late.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-400" style={{ animationFillMode: "both" }}>
            <Link
              href="/emergency"
              className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-alert-600 text-white font-display font-semibold text-lg shadow-lg shadow-alert-600/25 hover:bg-alert-700 hover:shadow-glow-alert transition-all gap-2"
            >
              <Siren className="w-5 h-5" />
              Get Emergency Help
            </Link>
            <HeroVideoModal />
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap justify-center gap-6 sm:gap-10 text-xs text-ink-300 font-medium animate-fade-in delay-600" style={{ animationFillMode: "both" }}>
            <div className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-primary-500" /> Government Ready</div>
            <div className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-primary-500" /> Multi-Language</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary-500" /> WCAG AA</div>
            <div className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-primary-500" /> Offline-First</div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-paper-50 to-transparent" />
      </section>

      {/* ══════ STATISTICS ══════ */}
      <section id="safety" className="py-20 px-4 bg-paper-50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
          <StatCounter value="150M" suffix="+" label="Expected Pilgrims" />
          <StatCounter value="12" suffix="" label="Active Sectors" />
          <StatCounter value="10K" suffix="+" label="Active Volunteers" />
          <StatCounter value="12" suffix="+" label="Languages Supported" />
        </div>
      </section>

      {/* ══════ FEATURES ══════ */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary-600 tracking-wide uppercase mb-3">Capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-ink-900 mb-4">
              Built for When It Matters Most
            </h2>
            <p className="text-ink-300 max-w-xl mx-auto">
              Every feature is designed around one principle: reduce panic, increase safety.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={Siren} title="One-Tap SOS" desc="Giant emergency button with instant location capture. Help arrives in under 4 minutes." />
            <FeatureCard icon={Hospital} title="Smart Hospital Finder" desc="AI recommends the best hospital — not just the closest. ICU, blood bank, and specialist availability." />
            <FeatureCard icon={Brain} title="AI Triage Assistant" desc="Conversational medical assistant in Hindi, English, and Marathi. Guides you calmly through emergencies." />
            <FeatureCard icon={Heart} title="Blood Donor Network" desc="Urgent blood request matching. Find verified donors within minutes based on blood group and proximity." />
            <FeatureCard icon={Users} title="Family Safety Circle" desc="Real-time family status dashboard. Automatic emergency timelines and trusted contact alerts." />
            <FeatureCard icon={Shield} title="Volunteer Network" desc="A verified network of 10,000+ local guardians ready to assist with crowds and first aid." />
            <FeatureCard icon={Activity} title="Kumbh Pulse AI" desc="Live situational awareness dashboard predicting crowd surges and medical hotspots." />
          </div>
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section id="how-it-works" className="py-24 px-4 bg-paper-100/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary-600 tracking-wide uppercase mb-3">Emergency Flow</p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-ink-900 mb-4">
              From SOS to Safety
            </h2>
            <p className="text-ink-300 max-w-lg mx-auto">
              The complete emergency journey — automated, intelligent, and always human-centered.
            </p>
          </div>
          <div className="space-y-0">
            <StepItem num="1" icon={Phone} title="SOS Triggered" desc="One-tap emergency button captures your GPS location instantly. No forms, no delays." />
            <StepItem num="2" icon={Brain} title="AI Assesses Situation" desc="AI identifies emergency type, finds nearest suitable hospital, and calculates optimal ambulance route." />
            <StepItem num="3" icon={Users} title="Family Alerted" desc="Trusted contacts receive real-time notifications with your location and emergency status." />
            <StepItem num="4" icon={Ambulance} title="Responder Dispatched" desc="Nearest available responder is dispatched with live navigation to your exact location." />
            <StepItem num="5" icon={MapPin} title="Live Tracking" desc="Track the responder in real-time. Estimated arrival time updates every 10 seconds." />
            <StepItem num="6" icon={Hospital} title="Hospital Prepared" desc="Hospital is pre-notified with patient information. Emergency team is ready on arrival." />
            <StepItem num="7" icon={CheckCircle2} title="Safe & Tracked" desc="Complete emergency timeline generated. Case tracked until patient reaches safety." />
          </div>
        </div>
      </section>

      {/* ══════ AI INTELLIGENCE ══════ */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-sm font-semibold text-accent-600 tracking-wide uppercase mb-3">AI Intelligence</p>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-ink-900 mb-6">
                Predict. Prevent. Protect.
              </h2>
              <p className="text-ink-300 leading-relaxed mb-8">
                JEEVAN AI doesn&apos;t just react to emergencies — it predicts them. By analyzing crowd density, weather patterns, and historical incident data, the platform deploys resources before crises unfold.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Activity, text: "Real-time crowd density monitoring" },
                  { icon: AlertTriangle, text: "Anomaly detection with early warnings" },
                  { icon: Radio, text: "Automated resource redeployment" },
                  { icon: Star, text: "Explainable AI with human-in-the-loop safety" },
                ].map(({ icon: I, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-50 flex items-center justify-center shrink-0">
                      <I className="w-4 h-4 text-accent-600" />
                    </div>
                    <span className="text-sm text-ink-400 font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* AI Recommendation card mockup */}
            <div className="card-elevated p-6 sm:p-8 bg-ink-950 text-white border-ink-800" data-theme="ink">
              <div className="flex items-center gap-2 text-xs font-mono text-primary-400 mb-4">
                <Brain className="w-4 h-4" />
                AI RECOMMENDATION
              </div>
              <h3 className="text-lg font-display font-bold mb-2">Zone C Risk Increasing</h3>
              <p className="text-sm text-ink-200 mb-5">Crowd density rising 23% in 15 min. Incident frequency +40%. Heat conditions worsening.</p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-300">Confidence</span>
                  <span className="font-mono text-primary-400">94%</span>
                </div>
                <div className="w-full bg-ink-800 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: "94%" }} />
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 h-10 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors">Approve</button>
                <button className="flex-1 h-10 rounded-lg bg-ink-800 text-ink-200 text-sm font-semibold hover:bg-ink-700 transition-colors">Modify</button>
                <button className="h-10 px-4 rounded-lg text-ink-400 text-sm font-semibold hover:text-alert-400 transition-colors">Reject</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ GOVERNMENT READINESS ══════ */}
      <section className="py-24 px-4 bg-primary-950 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-primary-300 tracking-wide uppercase mb-3">Enterprise Ready</p>
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-6">
            Designed for National Deployment
          </h2>
          <p className="text-primary-200 max-w-2xl mx-auto mb-12 leading-relaxed">
            Built to meet government security standards, scalable to millions of users, and deployable across India&apos;s diverse infrastructure landscape.
          </p>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Security First", desc: "End-to-end encryption, SOC 2 compliance, zero-trust architecture" },
              { icon: Globe, title: "12+ Languages", desc: "Hindi, English, Marathi, Tamil, Bengali, and more regional languages" },
              { icon: Zap, title: "Offline-First", desc: "SMS SOS, cached maps, offline first-aid — works without internet" },
            ].map(({ icon: I, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <I className="w-8 h-8 text-primary-400 mx-auto mb-4" />
                <h3 className="font-display font-bold mb-2">{title}</h3>
                <p className="text-sm text-primary-200">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FINAL CTA ══════ */}
      <section className="py-24 px-4 gradient-hero">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-ink-900 mb-6">
            Ready to Save Lives?
          </h2>
          <p className="text-ink-300 max-w-lg mx-auto mb-10 leading-relaxed">
            JEEVAN AI is live and ready. Whether you need emergency help or want to join as a responder — every second matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/emergency" className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-alert-600 text-white font-display font-semibold text-lg shadow-lg shadow-alert-600/25 hover:bg-alert-700 transition-all gap-2">
              <Siren className="w-5 h-5" />
              Get Emergency Help
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-primary-600 text-white font-display font-semibold text-lg shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all gap-2">
              Responder Portal
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
