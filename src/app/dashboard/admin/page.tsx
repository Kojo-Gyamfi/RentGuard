"use client";

import { useEffect, useState } from "react";
import { getAdminStats } from "@/app/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Home, FileText, ShieldCheck, Clock } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  totalApplications: number;
  totalAgreements: number;
  pendingVerifications: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats().then((res) => {
      if (res.success && res.stats) setStats(res.stats);
      setLoading(false);
    });
  }, []);

  const statCards = stats ? [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Properties Listed", value: stats.totalProperties, icon: Home, color: "text-green-600", bg: "bg-green-50" },
    { label: "Applications", value: stats.totalApplications, icon: FileText, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Active Agreements", value: stats.totalAgreements, icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Pending Verifications", value: stats.pendingVerifications, icon: Clock, color: "text-red-600", bg: "bg-red-50" },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-t-4 border-t-primary">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Admin Overview</h1>
        <p className="text-muted-foreground">Platform-wide statistics and management tools.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="shadow-sm border-gray-200 bg-white">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">{s.label}</p>
                    <p className="text-4xl font-black text-gray-900">{s.value}</p>
                  </div>
                  <div className={`p-4 ${s.bg} rounded-xl`}>
                    <Icon className={`h-7 w-7 ${s.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
