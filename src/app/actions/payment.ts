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
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function logPayment(agreementId: string, amount: number, reference: string, supabaseUserId: string, purpose: string) {
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
        purpose,
        status: "PENDING",
        dueDate: new Date(),
        paidDate: new Date()
      }
    });

    return { success: true, payment };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function verifyPayment(paymentId: string, supabaseUserId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { supabaseUserId } });
    if (!user || user.role !== "LANDLORD") throw new Error("Unauthorized.");

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { agreement: true },
    });

    if (!payment || payment.agreement.landlordId !== user.id) {
      throw new Error("Payment not found or unauthorized.");
    }

    // 1. Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "COMPLETED" },
    });

    // 2. Update agreement status to ACTIVE
    await prisma.agreement.update({
      where: { id: payment.agreementId },
      data: { status: "ACTIVE" },
    });

    // 3. Update property status to RENTED
    await prisma.property.update({
      where: { id: payment.agreement.propertyId },
      data: { status: "RENTED" },
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}
