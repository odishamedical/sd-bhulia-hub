import { NextResponse } from "next/server";
import { sendPlatformNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Quick validation
    if (!body.type || (body.type === "whatsapp" && !body.toPhone) || (body.type === "email" && !body.toEmail)) {
      return NextResponse.json(
        { success: false, error: "Missing required fields for notification type." },
        { status: 400 }
      );
    }

    // Call our unified notification wrapper
    const result = await sendPlatformNotification(body);

    if (result.success) {
      return NextResponse.json({ success: true, message: "Notification queued/sent successfully.", result }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

  } catch (error: any) {
    console.error("[Notification API Error]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
