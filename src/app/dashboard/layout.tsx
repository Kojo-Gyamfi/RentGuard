"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserProfile, syncUserToDatabase } from "@/app/actions/user";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;

    async function checkProfile() {
      if (loading || !user) return;

      try {
        const res = await getUserProfile(user.id);
        
        if (res.success && res.user) {
          if (isSubscribed) setRole(res.user.role);
        } else {
          // Attempt repair if not found
          const repairResult = await syncUserToDatabase(
            user.id,
            user.email || "",
            user.user_metadata?.full_name || "User",
            user.user_metadata?.role || "TENANT"
          );

          if (repairResult.success) {
            const verify = await getUserProfile(user.id);
            if (verify.success && verify.user) {
              if (isSubscribed) setRole(verify.user.role);
            } else {
              if (isSubscribed) setRole("TENANT");
            }
          } else {
            console.error("Critical: User synchronization failed", repairResult.error);
            if (isSubscribed) setRole("TENANT");
          }
        }
      } catch (err) {
        console.error("Dashboard profile check failed:", err);
      } finally {
        if (isSubscribed) setProfileLoading(false);
      }
    }

    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else {
        checkProfile();
      }
    }

    return () => { isSubscribed = false; };
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
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden">
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
