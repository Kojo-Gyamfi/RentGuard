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
import { toast } from "sonner";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"TENANT" | "LANDLORD">("TENANT");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
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
        toast.error("Too many registration attempts. Please try again later.");
      } else {
        toast.error(errorMessage || "Registration failed. Please try again.");
      }
      setLoading(false);
      return;
    }

    if (data?.user?.identities?.length === 0) {
      toast.error("An account with this email already exists. Please sign in.");
      setLoading(false);
      return;
    }
    
    if (data.user) {
        const dbResult = await syncUserToDatabase(data.user.id, email, name, role);

        if (!dbResult.success) {
          toast.error("Account created but profile setup failed. Please contact support.");
          setLoading(false);
          return;
        }
    }

    // Since email verification is disabled, Supabase instantly issues an active session.
    // We must manually sign out, otherwise middleware will bounce them to /dashboard natively.
    await supabase.auth.signOut();

    toast.success("Account created successfully! Please log in.");
    setLoading(false);
    router.push("/auth/login");
  };

  return (
    <Card className="w-full border border-slate-200/60 shadow-xl bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden">
      <CardHeader className="space-y-1 pb-4 pt-6">
        <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Create Account</CardTitle>
        <CardDescription className="text-slate-500 font-medium">
          Join thousands of users reinventing rent in Ghana.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleRegister}>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</Label>
            <Input
              id="name"
              placeholder="Kwame Mensah"
              className="h-10 rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-600 focus:border-blue-600 shadow-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="reg-email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="name@example.com"
              className="h-10 rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-600 focus:border-blue-600 shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="reg-password" className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</Label>
            <div className="relative group/pass">
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-10 rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 pr-10 focus:ring-blue-600 focus:border-blue-600 shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
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
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Register As</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRole("TENANT")}
                className={`flex items-center justify-center gap-2 border rounded-xl p-2.5 flex-1 transition-all duration-200 ${
                  role === "TENANT" 
                  ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100 font-bold" 
                  : "border-slate-200 bg-slate-50 text-slate-500 font-medium hover:border-slate-300 hover:bg-slate-100"
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
                  ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100 font-bold" 
                  : "border-slate-200 bg-slate-50 text-slate-500 font-medium hover:border-slate-300 hover:bg-slate-100"
                }`}
              >
                <HomeIcon className="w-4 h-4" />
                <span className="text-sm">Landlord</span>
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-6 pt-2 mt-5">
          <Button type="submit" className="w-full h-10 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.3)] active:scale-95 transition-all" disabled={loading}>
            {loading ? "Creating Account..." : (
                <span className="flex items-center gap-2">
                    Create Account <UserPlus className="w-4 h-4" />
                </span>
            )}
          </Button>
          <div className="text-sm text-center font-medium text-slate-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 font-bold hover:text-blue-500 hover:underline decoration-2 underline-offset-4">
              Sign In
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
