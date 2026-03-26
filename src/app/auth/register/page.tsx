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
import { UserPlus, User, Home as HomeIcon } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"TENANT" | "LANDLORD">("TENANT");
  const [error, setError] = useState("");
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

    if (signUpError || !data.user) {
      setError(signUpError?.message || "Registration failed. Please try again.");
      setLoading(false);
      return;
    }

    const dbResult = await syncUserToDatabase(data.user.id, email, name, role);

    if (!dbResult.success) {
      setError("Account created but profile setup failed. Please contact support.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <Card className="w-full border-none shadow-2xl bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="space-y-1 pb-6 pt-8">
        <CardTitle className="text-xl font-bold">Create Account</CardTitle>
        <CardDescription>
          Join thousands of users reinventing rent in Ghana.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleRegister}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</Label>
            <Input
              id="name"
              placeholder="Kwame Mensah"
              className="h-11 rounded-lg border-slate-200 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="name@example.com"
              className="h-11 rounded-lg border-slate-200 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password" className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</Label>
            <Input
              id="reg-password"
              type="password"
              placeholder="••••••••"
              className="h-11 rounded-lg border-slate-200 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Register As</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole("TENANT")}
                className={`flex items-center justify-center gap-2 border-2 rounded-xl p-3 flex-1 transition-all duration-200 ${
                  role === "TENANT" 
                  ? "border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-md shadow-blue-100" 
                  : "border-slate-100 bg-slate-50/50 text-slate-500 font-medium hover:border-slate-200"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Tenant</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("LANDLORD")}
                className={`flex items-center justify-center gap-2 border-2 rounded-xl p-3 flex-1 transition-all duration-200 ${
                  role === "LANDLORD" 
                  ? "border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-md shadow-blue-100" 
                  : "border-slate-100 bg-slate-50/50 text-slate-500 font-medium hover:border-slate-200"
                }`}
              >
                <HomeIcon className="w-4 h-4" />
                <span>Landlord</span>
              </button>
            </div>
          </div>
          {error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs font-medium text-red-600">{error}</div>}
        </CardContent>
        <CardFooter className="flex flex-col space-y-6 pb-8">
          <Button type="submit" className="w-full h-11 text-sm font-bold bg-slate-900 hover:bg-slate-800 rounded-lg shadow-lg shadow-slate-200 active:scale-95 transition-all" disabled={loading}>
            {loading ? "Creating Account..." : (
                <span className="flex items-center gap-2">
                    Create Account <UserPlus className="w-4 h-4" />
                </span>
            )}
          </Button>
          <div className="text-sm text-center font-medium text-slate-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 font-bold hover:underline decoration-2 underline-offset-4">
              Sign In
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
