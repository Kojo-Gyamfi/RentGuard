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

    // 1. Sign up with Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Pass metadata so we can use it in the DB sync
        data: { full_name: name, role },
      },
    });

    if (signUpError || !data.user) {
      setError(signUpError?.message || "Registration failed. Please try again.");
      setLoading(false);
      return;
    }

    // 2. Sync profile to our PostgreSQL User table via a server action
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
    <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Join RentGuard</CardTitle>
        <CardDescription className="text-center">
          Create a new account as a Landlord or Tenant.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleRegister}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Kwame Mensah"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <Input
              id="reg-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label>I want to register as a:</Label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  value="TENANT"
                  checked={role === "TENANT"}
                  onChange={() => setRole("TENANT")}
                  className="accent-primary"
                />
                <span className="font-medium">Tenant</span>
              </label>
              <label className="flex items-center space-x-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  value="LANDLORD"
                  checked={role === "LANDLORD"}
                  onChange={() => setRole("LANDLORD")}
                  className="accent-primary"
                />
                <span className="font-medium">Landlord</span>
              </label>
            </div>
          </div>
          {error && <p className="text-sm text-destructive font-medium">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full text-lg h-12" disabled={loading}>
            {loading ? "Creating Account…" : "Register"}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <a href="/auth/login" className="text-primary font-semibold hover:underline">
              Sign In
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
