"use server";

import { prisma } from "@/lib/prisma";

export async function getPayments(supabaseUserId: string, role: "LANDLORD" | "TENANT") {
  try {
    const user = await prisma.user.findUnique({ where: { supabaseUserId } });
    if (!user || user.role !== role) throw new Error("Unauthorized.");

    const whereClause = role === "LANDLORD" 
      ? { agreement: { landlordId: user.id } } 
      : { agreement: { tenantId: user.id } };

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        agreement: {
          include: {
            property: { select: { title: true } },
            tenant: { select: { name: true } },
            landlord: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, payments };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function logPayment(agreementId: string, amount: number, reference: string, supabaseUserId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { supabaseUserId } });
    if (!user || user.role !== "TENANT") throw new Error("Only tenants can log payments.");

    const agreement = await prisma.agreement.findUnique({ where: { id: agreementId } });
    if (!agreement || agreement.tenantId !== user.id) throw new Error("Agreement not found.");

    const payment = await prisma.payment.create({
      data: {
        agreementId: agreement.id,
        tenantId: user.id,
        amount,
        reference,
        status: "COMPLETED",
        dueDate: new Date(),
        paidDate: new Date()
      }
    });

    return { success: true, payment };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
