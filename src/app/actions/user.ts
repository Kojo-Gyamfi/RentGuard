"use server";

import { prisma } from "@/lib/prisma";

export async function syncUserToDatabase(
  supabaseUserId: string,
  email: string,
  name: string,
  role: "LANDLORD" | "TENANT" = "TENANT"
) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { supabaseUserId },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          supabaseUserId,
          email,
          name,
          role,
        },
      });
    }
    return { success: true };
  } catch (error: any) {
    console.error("Error syncing user to database:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserProfile(supabaseUserId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { supabaseUserId },
    });

    if (!user) {
      return { success: false, error: "User profile not found in database." };
    }

    return { success: true, user };
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    return { success: false, error: error.message || "Failed to fetch user profile." };
  }
}
