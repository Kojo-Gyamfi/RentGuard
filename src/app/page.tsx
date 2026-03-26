"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Home, Search, ShieldCheck, FileText, CreditCard, Bell } from "lucide-react";

const features = [
  {
    icon: <Home className="w-6 h-6 text-blue-600" />,
    title: "Property Listings",
    desc: "Landlords can showcase properties with high-quality images and details in a beautiful gallery.",
    color: "bg-blue-100",
  },
  {
    icon: <Search className="w-6 h-6 text-indigo-600" />,
    title: "Smart Search",
    desc: "Tenants instantly discover homes by location, budget, and amenities without the hustle.",
    color: "bg-indigo-100",
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
    title: "Identity Verification",
    desc: "Built-in Ghana Card verification establishes a foundation of trust before any lease is signed.",
    color: "bg-emerald-100",
  },
  {
    icon: <FileText className="w-6 h-6 text-amber-600" />,
    title: "Digital Agreements",
    desc: "Legally binding leases are auto-generated and safely stored in Next.js cloud environments.",
    color: "bg-amber-100",
  },
  {
    icon: <CreditCard className="w-6 h-6 text-rose-600" />,
    title: "Payment Tracking",
    desc: "Log rent payments digitally to stop paper receipt disputes entirely.",
    color: "bg-rose-100",
  },
  {
    icon: <Bell className="w-6 h-6 text-purple-600" />,
    title: "Smart Reminders",
    desc: "Automated cron jobs ensure neither party forgets an upcoming or overdue rent schedule.",
    color: "bg-purple-100",
  },
];

const stats = [
  { value: "500+", label: "Verified Listings" },
  { value: "1.2k+", label: "Happy Tenants" },
  { value: "100%", label: "Digital Workflow" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden relative selection:bg-primary/20">
      {/* Background Decorative Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none mix-blend-multiply" />
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400/20 blur-[120px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-400/20 blur-[120px] pointer-events-none mix-blend-multiply" />

      {/* Navbar - Glassmorphism */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-16 py-4 transition-all duration-300 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:rotate-12 transition-transform duration-300">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">RentGuard</span>
            <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200 uppercase tracking-widest text-[10px] font-bold">Ghana</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Link href="/auth/register">
              <Button className="font-bold px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 rounded-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-24 px-6 md:px-16 overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-primary/90">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

        <div className="relative flex flex-col items-center text-center max-w-7xl mx-auto z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 shadow-sm mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-sm font-medium text-white/90">The modern way to manage properties</span>
          </div>
          
          <h1 className="max-w-4xl text-5xl md:text-7xl lg:text-[80px] font-black leading-[1.1] tracking-tight text-white mb-8">
            Renting in Ghana,{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-300 to-orange-400 xl:inline block">
              Reimagined.
            </span>
          </h1>
          
          <p className="max-w-2xl text-lg md:text-xl text-white/80 mb-10 leading-relaxed font-medium">
            RentGuard brings complete transparency, fairness, and high-level efficiency to Ghana&apos;s rental housing market — completely digitizing the experience for landlords and tenants.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-full bg-white text-slate-900 hover:bg-slate-100 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/20">
                Join Now for Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white transition-all duration-300 backdrop-blur-md">
                Sign In to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <main className="relative z-10 py-20 px-6 md:px-16 max-w-7xl mx-auto">

        {/* Stats Section with Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-32">
          {stats.map((s, i) => (
            <div key={i} className="relative group p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-white scroll-m-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex flex-col items-center text-center">
                <p className="text-4xl lg:text-5xl font-black text-slate-900 mb-2">{s.value}</p>
                <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Everything you need. <br className="hidden md:block"/> Nothing you don&apos;t.
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            A complete ecosystem designed to replace the messy paperwork, relentless phone calls, and constant disputes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-32">
          {features.map((f, i) => (
            <div key={i} className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-400">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${f.color} group-hover:scale-110 transition-transform duration-300 ease-out`}>
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
              <p className="text-slate-600 leading-relaxed font-medium text-sm border-t border-slate-50 pt-4 mt-2">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6 md:px-16 bg-slate-900 overflow-hidden">
        {/* Glow behind CTA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[400px] bg-gradient-to-r from-blue-600 to-indigo-600 blur-[100px] opacity-40 mix-blend-screen pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Ready to upgrade your rental experience?</h2>
          <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium">
            Join hundreds of landlords and tenants across Ghana who are already experiencing the future of property management.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="h-14 px-10 text-base font-bold rounded-full bg-white text-slate-900 hover:bg-slate-100 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Create Your Free Account
            </Button>
          </Link>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm font-semibold text-slate-400">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> No hidden fees</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Secure platform</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 text-center border-t border-slate-200 bg-white">
        <div className="flex items-center justify-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <span className="text-xl font-black text-slate-800 tracking-tight">RentGuard</span>
        </div>
        <p className="text-sm font-medium text-slate-500">
          © {new Date().getFullYear()} RentGuard — Designed & Built for Ghana 🇬🇭
        </p>
      </footer>
    </div>
  );
}
