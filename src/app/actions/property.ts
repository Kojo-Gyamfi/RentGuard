"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProperty(data: any, supabaseUserId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { supabaseUserId } });
    if (!user || user.role !== "LANDLORD") {
      throw new Error("Unauthorized to create properties.");
    }

    const property = await prisma.property.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        price: parseFloat(data.price),
        status: "AVAILABLE",
        landlordId: user.id,
        images: data.images || ["https://placehold.co/600x400?text=Property"],
      },
    });

    revalidatePath("/dashboard/properties");
    return { success: true, property };
  } catch (error: any) {
    console.error("Error creating property:", error);
    return { success: false, error: error.message };
  }
}

export async function updateProperty(id: string, data: any, supabaseUserId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { supabaseUserId } });
    if (!user || user.role !== "LANDLORD") {
      throw new Error("Unauthorized to update properties.");
    }

    const property = await prisma.property.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        price: parseFloat(data.price),
        images: data.images,
      },
    });

    revalidatePath("/dashboard/properties");
    return { success: true, property };
  } catch (error: any) {
    console.error("Error updating property:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteProperty(id: string, supabaseUserId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { supabaseUserId } });
    if (!user || user.role !== "LANDLORD") {
      throw new Error("Unauthorized to delete properties.");
    }

    const property = await prisma.property.findUnique({
      where: { id },
      include: { agreements: true }
    });

    if (!property || property.landlordId !== user.id) {
      throw new Error("Property not found or unauthorized.");
    }

    if (property.agreements.length > 0) {
       throw new Error("Cannot delete a property with active rental agreements.");
    }

    await prisma.property.delete({
      where: { id },
    });

    revalidatePath("/dashboard/properties");
    revalidatePath("/dashboard/properties/browse");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting property:", error);
    return { success: false, error: error.message };
  }
}

export async function getPropertyById(id: string) {
  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: { landlord: { select: { name: true, email: true } } },
    });
    return { success: true, property };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPropertiesByLandlord(supabaseUserId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { supabaseUserId } });
    if (!user) throw new Error("User not found.");

    const properties = await prisma.property.findMany({
      where: { landlordId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, properties };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllAvailableProperties(filters?: { location?: string; maxPrice?: number }) {
  try {
    const where: any = { status: "AVAILABLE" };
    if (filters?.location) {
      where.location = { contains: filters.location, mode: "insensitive" };
    }
    if (filters?.maxPrice) {
      where.price = { lte: filters.maxPrice };
    }

    const properties = await prisma.property.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { landlord: { select: { name: true, email: true } } },
    });
    return { success: true, properties };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function applyForProperty(propertyId: string, message: string, supabaseUserId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { supabaseUserId } });
    if (!user || user.role !== "TENANT") throw new Error("Only tenants can apply.");

    const existing = await prisma.application.findFirst({
      where: { propertyId, tenantId: user.id },
    });
    if (existing) throw new Error("You have already applied for this property.");

    const application = await prisma.application.create({
      data: {
        propertyId,
        tenantId: user.id,
        message,
        status: "PENDING",
      },
    });

    return { success: true, application };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
