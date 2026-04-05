"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1 font-medium text-sm">Welcome back, <span className="text-slate-700 font-semibold">{user?.email}</span></p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card className="border-slate-200/60 shadow-sm bg-white/80 ring-1 ring-slate-100 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-slate-800">0</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/60 shadow-sm bg-white/80 ring-1 ring-slate-100 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500">Active Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-slate-800">0</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/60 shadow-sm bg-white/80 ring-1 ring-slate-100 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500">Pending Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-slate-800">0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
