"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/app/actions/dashboard";
import { getUserProfile } from "@/app/actions/user";
import { getAdminStats } from "@/app/actions/admin";
import { Loader2, Home, Users, FileClock, FileText, DollarSign, Folder, ShieldCheck, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      getUserProfile(user.id).then(async (profileRes) => {
        if (profileRes.success && profileRes.user) {
          const userRole = profileRes.user.role;
          setRole(userRole);
          
          let statsRes;
          if (userRole === "ADMIN") {
            statsRes = await getAdminStats();
          } else {
            statsRes = await getDashboardStats(user.id);
          }
          
          if (statsRes.success) setStats(statsRes.stats);
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

      {/* ─── LANDLORD STATS ────────────────────────────────────── */}
      {role === "LANDLORD" && (
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
      )}

      {/* ─── TENANT STATS ──────────────────────────────────────── */}
      {role === "TENANT" && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-none shadow-sm bg-white ring-1 ring-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">My Applications</CardTitle>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Folder className="w-4 h-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-black text-slate-800">{stats?.totalApplications || 0}</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">Rental applications submitted</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white ring-1 ring-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Leases</CardTitle>
                <div className="p-2 bg-green-50 rounded-lg">
                  <FileText className="w-4 h-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-black text-slate-800">{stats?.activeLeases || 0}</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">Current rental agreements</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white ring-1 ring-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Payments</CardTitle>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-black text-slate-800">{stats?.pendingPayments || 0}</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">Pending rent payments</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions for Tenant */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/dashboard/properties/browse">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <Home className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Browse Properties</p>
                    <p className="text-xs text-slate-400">Find your next home</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/applications">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                    <Folder className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">My Applications</p>
                    <p className="text-xs text-slate-400">Track your submissions</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/lease">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">My Lease</p>
                    <p className="text-xs text-slate-400">View your rental agreement</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </>
      )}

      {/* ─── ADMIN STATS ───────────────────────────────────────── */}
      {role === "ADMIN" && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 whitespace-nowrap">
          <Card className="border-none shadow-sm bg-white ring-1 ring-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Users</CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="w-4 h-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-black text-slate-800">{stats?.totalUsers || 0}</p>
              <p className="text-xs text-slate-400 mt-2 font-medium">Platform-wide users</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white ring-1 ring-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Properties</CardTitle>
              <div className="p-2 bg-green-50 rounded-lg">
                <Home className="w-4 h-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-black text-slate-800">{stats?.totalProperties || 0}</p>
              <p className="text-xs text-slate-400 mt-2 font-medium">All property listings</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white ring-1 ring-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Applications</CardTitle>
              <div className="p-2 bg-amber-50 rounded-lg">
                <Folder className="w-4 h-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-black text-slate-800">{stats?.totalApplications || 0}</p>
              <p className="text-xs text-slate-400 mt-2 font-medium">Total rent attempts</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white ring-1 ring-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold text-red-500 uppercase tracking-wider">Pending Verification</CardTitle>
              <div className="p-2 bg-red-50 rounded-lg">
                <Clock className="w-4 h-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-black text-red-600">{stats?.pendingVerifications || 0}</p>
              <p className="text-xs text-slate-400 mt-2 font-medium">Awaiting Ghana Card review</p>
              <Link href="/dashboard/verifications">
                 <Button variant="link" className="px-0 py-0 h-auto text-xs font-bold text-primary mt-2">Go to Verifications →</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
