"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserProfile } from "@/app/actions/user";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else {
        getUserProfile(user.id).then((res) => {
          if (res.success && res.user) {
            setRole(res.user.role);
          } else {
            console.error(res.error);
          }
          setProfileLoading(false);
        });
      }
    }
  }, [user, loading, router]);

  if (loading || profileLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !role) return null;

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
