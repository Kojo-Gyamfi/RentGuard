"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogIn, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message || "Failed to login. Please check your credentials.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <Card className="w-full border-none shadow-2xl bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden">
      <CardHeader className="space-y-1 pb-6 pt-8">
        <CardTitle className="text-xl font-bold italic">Welcome Back</CardTitle>
        <CardDescription className="font-medium">
          Enter your credentials to manage your rentals.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="kwame@example.com"
              className="h-11 rounded-lg border-slate-200 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</Label>
              <Link href="/auth/forgot-password" className="text-xs font-bold text-blue-600 hover:text-blue-500 hover:underline">Forgot password?</Link>
            </div>
            <div className="relative group/pass">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 rounded-lg border-slate-200 pr-10 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
          </div>
          {error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs font-medium text-red-600">{error}</div>}
        </CardContent>
        <CardFooter className="flex flex-col space-y-6 pb-8">
          <Button type="submit" className="w-full h-11 text-sm font-bold bg-slate-900 hover:bg-slate-800 rounded-lg shadow-lg shadow-slate-200 active:scale-95 transition-all" disabled={loading}>
            {loading ? "Signing in..." : (
                <span className="flex items-center gap-2">
                    Sign In <LogIn className="w-4 h-4" />
                </span>
            )}
          </Button>
          <div className="text-sm text-center font-medium text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-blue-600 font-bold hover:underline decoration-2 underline-offset-4">
              Create Account
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
