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
import { syncUserToDatabase } from "@/app/actions/user";
import Link from "next/link";
import { UserPlus, User, Home as HomeIcon, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"TENANT" | "LANDLORD">("TENANT");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, role },
      },
    });

    if (signUpError) {
      const errorMessage = signUpError.message || "";
      if (errorMessage.toLowerCase().includes("rate limit") || errorMessage.includes("429")) {
        setError("Too many registration attempts. Please wait a few minutes before trying again or use a different IP.");
      } else {
        setError(errorMessage || "Registration failed. Please try again.");
      }
      setLoading(false);
      return;
    }

    if (data?.user?.identities?.length === 0) {
      setError("An account with this email already exists. Please sign in.");
      setLoading(false);
      return;
    }
    
    if (data.user) {
        const dbResult = await syncUserToDatabase(data.user.id, email, name, role);

        if (!dbResult.success) {
          setError("Account created but profile setup failed. Please contact support.");
          setLoading(false);
          return;
        }
    }

    // If confirmation is required, Supabase returns the user but no session usually, or just requires them to click a link.
    // For now we will assume success and route to login or tell them to check email if session is null
    if (data.session === null) {
        setSuccessMsg("Account created successfully! Please check your email inbox to verify your account before logging in.");
        setLoading(false);
        // Do not redirect, let them read the message
    } else {
        router.push("/dashboard");
        router.refresh();
    }
  };

  return (
    <Card className="w-full border border-slate-800 shadow-2xl bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden">
      <CardHeader className="space-y-1 pb-4 pt-6">
        <CardTitle className="text-2xl font-bold text-white tracking-tight">Create Account</CardTitle>
        <CardDescription className="text-slate-400 font-medium">
          Join thousands of users reinventing rent in Ghana.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleRegister}>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</Label>
            <Input
              id="name"
              placeholder="Kwame Mensah"
              className="h-10 rounded-lg border-slate-800 bg-slate-950/50 text-white placeholder:text-slate-600 focus:ring-blue-600 focus:border-blue-600"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="reg-email" className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="name@example.com"
              className="h-10 rounded-lg border-slate-800 bg-slate-950/50 text-white placeholder:text-slate-600 focus:ring-blue-600 focus:border-blue-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="reg-password" className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</Label>
            <div className="relative group/pass">
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-10 rounded-lg border-slate-800 bg-slate-950/50 text-white placeholder:text-slate-600 pr-10 focus:ring-blue-600 focus:border-blue-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Register As</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRole("TENANT")}
                className={`flex items-center justify-center gap-2 border rounded-xl p-2.5 flex-1 transition-all duration-200 ${
                  role === "TENANT" 
                  ? "border-blue-600 bg-blue-600/10 text-blue-400 font-bold shadow-lg shadow-blue-900/20" 
                  : "border-slate-800 bg-slate-950/30 text-slate-500 font-medium hover:border-slate-700"
                }`}
              >
                <User className="w-4 h-4" />
                <span className="text-sm">Tenant</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("LANDLORD")}
                className={`flex items-center justify-center gap-2 border rounded-xl p-2.5 flex-1 transition-all duration-200 ${
                  role === "LANDLORD" 
                  ? "border-blue-600 bg-blue-600/10 text-blue-400 font-bold shadow-lg shadow-blue-900/20" 
                  : "border-slate-800 bg-slate-950/30 text-slate-500 font-medium hover:border-slate-700"
                }`}
              >
                <HomeIcon className="w-4 h-4" />
                <span className="text-sm">Landlord</span>
              </button>
            </div>
          </div>
          {error && <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-xs font-medium text-red-400">{error}</div>}
          {successMsg && <div className="p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-lg text-xs font-medium text-emerald-400">{successMsg}</div>}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-6 pt-2 mt-5">
          <Button type="submit" className="w-full h-10 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-900/20 active:scale-95 transition-all" disabled={loading}>
            {loading ? "Creating Account..." : (
                <span className="flex items-center gap-2">
                    Create Account <UserPlus className="w-4 h-4" />
                </span>
            )}
          </Button>
          <div className="text-sm text-center font-medium text-slate-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-400 font-bold hover:text-blue-300 hover:underline decoration-2 underline-offset-4">
              Sign In
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
