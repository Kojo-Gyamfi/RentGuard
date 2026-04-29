// Actions for managing user notifications
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUserNotifications(supabaseUserId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { supabaseUserId } });
    if (!user) throw new Error("Unauthorized.");

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to recent 50
    });

    return { success: true, notifications };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function markNotificationAsRead(id: string, supabaseUserId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { supabaseUserId } });
    if (!user) throw new Error("Unauthorized.");

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== user.id) {
      throw new Error("Notification not found or unauthorized.");
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function markAllNotificationsAsRead(supabaseUserId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { supabaseUserId } });
    if (!user) throw new Error("Unauthorized.");

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}
