"use server";

import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";
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
            landlord: { select: { name: true, email: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, applications };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function cancelApplication(applicationId: string, supabaseUserId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { supabaseUserId } });
    if (!user || user.role !== "TENANT") throw new Error("Unauthorized.");

    const app = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!app || app.tenantId !== user.id) {
      throw new Error("Application not found or unauthorized.");
    }

    if (app.status !== "PENDING") {
      throw new Error("Only pending applications can be cancelled.");
    }

    await prisma.application.delete({
      where: { id: applicationId },
    });

    revalidatePath("/dashboard/applications");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
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
      // In the new 9-step flow, "APPROVED" by landlord now means "OFFERED" 
      // if we want to follow the step exactly. 
      // However, to keep the enum simple, I'll use OFFERED status for the offer.
      // If the landlord clicks "Approve", we'll actually set it to OFFERED first.
    }

    if (status === "OFFERED") {
      await sendNotification(
        app.tenantId,
        "Rental Offer Received!",
        `Good news! The landlord has sent you an offer for ${app.property.title}. Please review and accept it to proceed.`,
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function acceptOffer(applicationId: string, supabaseUserId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { supabaseUserId } });
    if (!user || user.role !== "TENANT") throw new Error("Unauthorized.");

    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { property: { include: { landlord: true } } },
    });

    if (!app || app.tenantId !== user.id) {
      throw new Error("Application not found or unauthorized.");
    }

    if (app.status !== "OFFERED") {
      throw new Error("This application does not have an active offer to accept.");
    }

    // 1. Create the Agreement (PENDING_PAYMENT)
    const agreement = await prisma.agreement.create({
      data: {
        propertyId: app.propertyId,
        tenantId: app.tenantId,
        landlordId: app.property.landlordId,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        rentAmount: app.property.price,
        status: "PENDING_PAYMENT",
      },
    });

    // 2. Update Application to APPROVED
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: "APPROVED" },
    });

    // 3. Notify Landlord
    await sendNotification(
      app.property.landlordId,
      "Offer Accepted!",
      `${user.name} has accepted your offer for ${app.property.title}. They are now required to make the initial payment.`,
      "EMAIL"
    );

    revalidatePath("/dashboard/applications");
    revalidatePath("/dashboard/agreements");
    revalidatePath("/dashboard/lease");
    
    return { success: true, agreement };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}
