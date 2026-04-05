import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center p-6 bg-[#f8fafc] overflow-hidden">
      {/* Background Decorative Mesh Gradients - Light Mode Optimized */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-100/60 blur-[150px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-indigo-100/50 blur-[150px] pointer-events-none mix-blend-multiply" />
      
      {/* Back to Home Button - Desktop Absolute */}
      <div className="absolute top-8 left-8 z-20 hidden lg:block">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:bg-slate-50 group-hover:scale-110 transition-all text-slate-600 group-hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Home
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Branding - Symmetrically centered above the card */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_8px_16px_rgba(37,99,235,0.25)] mb-4">
                <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">RentGuard</h1>
            <div className="h-1 w-10 bg-blue-600 mt-2 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
        </div>

        {/* The Auth Card */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 zoom-in-95">
          {children}
        </div>

        {/* Home Navigation - Symmetrical Link at the bottom */}
        <Link 
          href="/" 
          className="flex items-center justify-center gap-2 mt-8 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
      </div>

      {/* Subtle Noise Texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
