"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Supabase reset password flow
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <Card className="w-full border-none shadow-2xl bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="space-y-1 pb-6 pt-8">
        <CardTitle className="text-xl font-bold tracking-tight">Reset Password</CardTitle>
        <CardDescription className="font-medium">
          {success 
            ? "Reset link has been dispatched." 
            : "Enter your email for security verification."}
        </CardDescription>
      </CardHeader>
      {!success ? (
        <form onSubmit={handleReset}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Mail className="w-full h-full" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="kwame@example.com"
                  className="pl-10 h-11 rounded-lg border-slate-200 focus:ring-blue-500 focus-visible:ring-blue-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs font-medium text-red-600">{error}</div>}
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 pb-8">
            <Button type="submit" className="w-full h-11 text-sm font-bold bg-slate-900 hover:bg-slate-800 rounded-lg shadow-lg active:scale-95 transition-all" disabled={loading}>
              {loading ? "Sending..." : (
                <span className="flex items-center gap-2">
                  Send Recovery Link <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
            <div className="text-sm text-center font-medium text-slate-500">
              Remember your password?{" "}
              <Link href="/auth/login" className="text-blue-600 font-bold hover:underline decoration-2 underline-offset-4">
                Back to Login
              </Link>
            </div>
          </CardFooter>
        </form>
      ) : (
        <CardContent className="pb-10 pt-4 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Check your Email</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-8 max-w-[280px]">
            We&apos;ve sent recovery instructions to <span className="font-bold text-slate-900">{email}</span>.
          </p>
          <Link href="/auth/login" className="w-full">
            <Button variant="outline" className="w-full h-11 font-bold rounded-lg border-slate-200 hover:bg-slate-50">
              Return to Login
            </Button>
          </Link>
        </CardContent>
      )}
    </Card>
  );
}
