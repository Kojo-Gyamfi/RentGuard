"use server";
// Stale type fix

import { prisma } from "@/lib/prisma";

export async function getAdminStats() {
  try {
    const [totalUsers, totalProperties, totalApplications, totalAgreements, pendingVerifications] =
      await Promise.all([
        prisma.user.count(),
        prisma.property.count(),
        prisma.application.count(),
        prisma.agreement.count(),
        prisma.user.count({ 
          where: { 
            OR: [
              { ghanaCardFrontUrl: { not: null } },
              { ghanaCardBackUrl: { not: null } }
            ],
            isVerified: false 
          } 
        }),
      ]);

    return {
      success: true,
      stats: { totalUsers, totalProperties, totalApplications, totalAgreements, pendingVerifications },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPendingVerifications() {
  try {
    const users = await prisma.user.findMany({
      where: { 
        OR: [
          { ghanaCardFrontUrl: { not: null } },
          { ghanaCardBackUrl: { not: null } }
        ],
        isVerified: false 
      },
      select: { id: true, name: true, email: true, phone: true, ghanaCardFrontUrl: true, ghanaCardBackUrl: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, users };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function approveVerification(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, role: true, 
        isVerified: true, phone: true, createdAt: true,
        _count: { select: { properties: true, applications: true } },
      },
    });
    return { success: true, users };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
