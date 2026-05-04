import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // 1. Check for authorizations (if triggered externally by Vercel Cron)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === "production") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Find agreements where rent is due in exactly 7 days
    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + 7);
    
    // For MVP purposes, let's grab active agreements and mock checking their payment schedules.
    // In a full implementation, you'd check a 'nextPaymentDate' field.
    const agreements = await prisma.agreement.findMany({
      include: {
        tenant: { select: { id: true, name: true, email: true } },
        property: { select: { title: true } }
      }
    });

    let notificationsSent = 0;

    for (const agreement of agreements) {
      // Logic to determine if rent is due soon would go here based on startDate and rent frequency.
      // Mocking the condition:
      const rentIsDueSoon = true; // Replace with actual date comparison logic

      if (rentIsDueSoon) {
        await sendNotification(
          agreement.tenant.id,
          "Upcoming Rent Reminder",
          `Hello ${agreement.tenant.name}, your rent of GH₵${agreement.rentAmount} for ${agreement.property.title} is due soon. Please ensure you log your payment on the RentGuard portal.`,
          "EMAIL"
        );
        notificationsSent++;
      }
    }

    return NextResponse.json({ success: true, processed: notificationsSent, message: "Reminders successfully executed." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
