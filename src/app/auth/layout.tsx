import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-slate-50 overflow-x-hidden">
      {/* Background Decorative Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-[120px] pointer-events-none mix-blend-multiply" />

      {/* Back to Home Button - Desktop */}
      <div className="absolute top-8 left-8 z-20 hidden md:block">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:bg-slate-100 group-hover:scale-110 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Home
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md py-12">
        {/* Branding - More compact to prioritize card centering */}
        <div className="flex flex-col items-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
                <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">RentGuard</h1>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Premium Housing</p>
        </div>

        {children}

        {/* Mobile Home Navigation */}
        <Link 
          href="/" 
          className="flex md:hidden items-center justify-center gap-2 mt-8 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
