import { prisma } from "@/lib/prisma";

export async function sendNotification(
  userId: string, 
  title: string, 
  message: string, 
  type: "EMAIL" | "SMS" = "EMAIL" // Keep for compatibility with existing calls
) {
  try {
    // 1. Create the in-app notification in the database
    // We map generic email/sms types to an INFO notification type for the UI
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: "INFO", 
      }
    });

    // 2. In a real production application, you would ALSO integrate with Resend, Sendgrid, or Twilio here.
    console.log(`[NOTIFICATION SYSTEM - ${type}]`);
    console.log(`To User ID: ${userId}`);
    console.log(`Title: ${title}`);
    console.log(`Message: ${message}`);
    console.log(`--------------------------------------------------`);

    return { success: true };
  } catch (error) {
    console.error("Failed to send notification:", error);
    return { success: false, error };
  }
}
