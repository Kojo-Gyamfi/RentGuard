"use server";

import { prisma } from "@/lib/prisma";

export async function syncUserToDatabase(
  supabaseUserId: string,
  email: string,
  name: string,
  role: "LANDLORD" | "TENANT" | "ADMIN" = "TENANT"
) {
  try {
    // 1. Try finding by Supabase ID (the primary way we link)
    const existingBySupabaseId = await prisma.user.findUnique({
      where: { supabaseUserId },
    });

    if (existingBySupabaseId) {
      console.log(`User found by Supabase ID: ${supabaseUserId}`);
      return { success: true };
    }

    console.log(`Profile not found for ID: ${supabaseUserId}. Checking email: ${email}`);

    // 2. Fallback: Check if they exist by email (in case of account recreation or ID mismatch)
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      console.log(`Found existing profile by email. Updating Supabase ID from ${existingByEmail.supabaseUserId} to ${supabaseUserId}`);
      // Re-link the existing record to the new Supabase ID
      await prisma.user.update({
        where: { email },
        data: { supabaseUserId },
      });
      return { success: true };
    }

    console.log(`No profile found for email ${email}. Creating new record.`);

    // 3. Create new user if no record exists at all
    await prisma.user.create({
      data: {
        supabaseUserId,
        email,
        name,
        role,
      },
    });
    console.log(`New user created: ${email}`);
    return { success: true };
  } catch (error) {
    console.error("Error syncing user to database:", error);
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
  } catch (error) {
    console.error("Error fetching user profile:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch user profile.";
    return { success: false, error: message };
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
  } catch (error) {
    console.error("Error updating user profile:", error);
    const message = error instanceof Error ? error.message : "Failed to update profile.";
    return { success: false, error: message };
  }
}
