import { sendWhatsAppMessage } from "./whatsapp";
import { sendEmailMessage } from "./email";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export type NotificationType = "whatsapp" | "email" | "both";

export interface NotificationPayload {
  toPhone?: string;
  toEmail?: string;
  templateName?: string; // For WhatsApp
  whatsappComponents?: any[]; // For WhatsApp
  subject?: string; // For Email
  htmlContent?: string; // For Email
  type: NotificationType;
}

export async function sendPlatformNotification(payload: NotificationPayload) {
  const results: any = {
    whatsapp: null,
    email: null
  };

  try {
    // 1. Send WhatsApp if requested
    if ((payload.type === "whatsapp" || payload.type === "both") && payload.toPhone && payload.templateName) {
      const waRes = await sendWhatsAppMessage({
        to: payload.toPhone,
        templateName: payload.templateName,
        components: payload.whatsappComponents
      });
      results.whatsapp = waRes;
    }

    // 2. Send Email if requested
    if ((payload.type === "email" || payload.type === "both") && payload.toEmail && payload.subject && payload.htmlContent) {
      const emailRes = await sendEmailMessage({
        to: payload.toEmail,
        subject: payload.subject,
        htmlContent: payload.htmlContent
      });
      results.email = emailRes;
    }

    // 3. Log to Firestore so Super Admin can see what was sent
    await addDoc(collection(db, "notification_logs"), {
      ...payload,
      results,
      status: "sent_or_simulated",
      createdAt: serverTimestamp()
    });

    console.log("[Notification System] Successfully sent and logged notification.", results);
    return { success: true, results };
  } catch (error: any) {
    console.error("[Notification System Error]", error);
    
    // Log failure to Firestore as well
    await addDoc(collection(db, "notification_logs"), {
      ...payload,
      error: error.message,
      status: "failed",
      createdAt: serverTimestamp()
    });

    return { success: false, error: error.message };
  }
}
