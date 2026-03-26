"use server";

import { prisma } from "@/lib/prisma";

export async function getAgreements(supabaseUserId: string, role: "LANDLORD" | "TENANT") {
  try {
    const user = await prisma.user.findUnique({ where: { supabaseUserId } });
    if (!user || user.role !== role) throw new Error("Unauthorized.");

    const whereClause = role === "LANDLORD" ? { landlordId: user.id } : { tenantId: user.id };

    const agreements = await prisma.agreement.findMany({
      where: whereClause,
      include: {
        property: { select: { title: true, location: true } },
        tenant: { select: { name: true, email: true } },
        landlord: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, agreements };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
