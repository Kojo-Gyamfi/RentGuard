"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats(supabaseUserId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { supabaseUserId },
      include: {
        properties: true,
        landlordAgreements: true,
      }
    });

    if (!user) throw new Error("User not found.");

    if (user.role === "LANDLORD") {
      const propertyCount = await prisma.property.count({
        where: { landlordId: user.id }
      });

      const activeTenantsCount = await prisma.agreement.count({
        where: { landlordId: user.id }
      });

      const pendingApplicationsCount = await prisma.application.count({
        where: {
          property: { landlordId: user.id },
          status: "PENDING"
        }
      });

      return {
        success: true,
        stats: {
          totalProperties: propertyCount,
          activeTenants: activeTenantsCount,
          pendingApplications: pendingApplicationsCount
        }
      };
    }

    if (user.role === "TENANT") {
      const myApplicationsCount = await prisma.application.count({
        where: { tenantId: user.id }
      });
      
      const myActiveLeasesCount = await prisma.agreement.count({
        where: { tenantId: user.id }
      });

      return {
        success: true,
        stats: {
          totalApplications: myApplicationsCount,
          activeLeases: myActiveLeasesCount,
          pendingPayments: 0 // Placeholder
        }
      };
    }

    return { success: true, stats: {} };
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return { success: false, error: error.message };
  }
}
