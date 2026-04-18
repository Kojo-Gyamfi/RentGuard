"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendNotification } from "@/lib/notifications";

export async function getTenantApplications(supabaseUserId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { supabaseUserId } });
    if (!user || user.role !== "TENANT") throw new Error("Unauthorized.");

    const applications = await prisma.application.findMany({
      where: { tenantId: user.id },
      include: {
        property: {
          select: {
            title: true,
            price: true,
            location: true,
            images: true,
            landlord: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, applications };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getLandlordApplications(supabaseUserId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { supabaseUserId } });
    if (!user || user.role !== "LANDLORD") throw new Error("Unauthorized.");

    const applications = await prisma.application.findMany({
      where: { property: { landlordId: user.id } },
      include: {
        tenant: { select: { name: true, email: true, phone: true } },
        property: { select: { title: true, price: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, applications };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: "APPROVED" | "REJECTED",
  supabaseUserId: string
) {
  try {
    const user = await prisma.user.findUnique({ where: { supabaseUserId } });
    if (!user || user.role !== "LANDLORD") throw new Error("Unauthorized.");

    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { property: true },
    });

    if (!app || app.property.landlordId !== user.id) {
      throw new Error("Application not found or unauthorized.");
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    if (status === "APPROVED") {
      await prisma.agreement.create({
        data: {
          propertyId: app.propertyId,
          tenantId: app.tenantId,
          landlordId: user.id,
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          rentAmount: app.property.price,
        },
      });

      await prisma.property.update({
        where: { id: app.propertyId },
        data: { status: "RENTED" },
      });

      await sendNotification(
        app.tenantId,
        "Application Approved!",
        `Good news! Your application for ${app.property.title} has been APPROVED by the landlord. A lease agreement has been generated for you.`,
        "EMAIL"
      );
    } else if (status === "REJECTED") {
      await sendNotification(
        app.tenantId,
        "Application Update",
        `We're sorry to inform you that your application for ${app.property.title} was not accepted at this time.`,
        "EMAIL"
      );
    }

    revalidatePath("/dashboard/applications");
    return { success: true, application: updated };
  } catch (error: any) {
    console.error("Failed to update application:", error);
    return { success: false, error: error.message };
  }
}
