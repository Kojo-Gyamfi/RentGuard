import { NextResponse } from "next/server";
// Stale type fix
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { supabaseUserId, ghanaCardFrontUrl, ghanaCardBackUrl } = await req.json();
    
    if (!supabaseUserId || !ghanaCardFrontUrl || !ghanaCardBackUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { supabaseUserId },
      data: { 
        ghanaCardFrontUrl,
        ghanaCardBackUrl 
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
