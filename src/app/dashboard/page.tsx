"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/app/actions/dashboard";
import { Loader2, Home, Users, FileClock } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      getDashboardStats(user.id).then((res) => {
        if (res.success) {
          setStats(res.stats);
        }
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Gathering your overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      <div className="flex justify-between items-end bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1 font-medium">
            Welcome back, <span className="text-primary font-bold">{user?.email?.split('@')[0]}</span>
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 ring-1 ring-green-100">
            Active Session
          </span>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-none shadow-sm bg-white ring-1 ring-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Properties</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Home className="w-4 h-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black text-slate-800">{stats?.totalProperties || 0}</p>
            <p className="text-xs text-slate-400 mt-2 font-medium">Listed properties on RentGuard</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white ring-1 ring-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Tenants</CardTitle>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black text-slate-800">{stats?.activeTenants || 0}</p>
            <p className="text-xs text-slate-400 mt-2 font-medium">With active lease agreements</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white ring-1 ring-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending Apps</CardTitle>
            <div className="p-2 bg-amber-50 rounded-lg">
              <FileClock className="w-4 h-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black text-slate-800">{stats?.pendingApplications || 0}</p>
            <p className="text-xs text-slate-400 mt-2 font-medium">Awaiting your review</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
