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
    // Safely serialize the error so it doesn't crash the Next.js server action boundary
    const errorMsg = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMsg };
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

    return { success: true, user: JSON.parse(JSON.stringify(user)) };
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    return { success: false, error: error.message || "Failed to fetch user profile." };
  }
}

export async function updateUserProfile(
  supabaseUserId: string,
  data: { name?: string; phone?: string }
) {
  try {
    const updated = await prisma.user.update({
      where: { supabaseUserId },
      data,
    });
    return { success: true, user: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return { success: false, error: error.message || "Failed to update profile." };
  }
}
