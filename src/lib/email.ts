import { Resend } from 'resend';

/**
 * Official Resend Email API Integration
 */

interface EmailPayload {
  to: string;
  subject: string;
  htmlContent: string;
}

export async function sendEmailMessage(payload: EmailPayload) {
  // If the API key is missing, fall back to simulation mode
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email API] Missing RESEND_API_KEY. Running in Simulation Mode.");
    console.log(`To: ${payload.to} | Subject: ${payload.subject}`);
    return {
      success: true,
      messageId: `simulated_${Date.now()}`,
      provider: "Simulation Mode"
    };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const data = await resend.emails.send({
      from: 'Bhulia Hub <notifications@update.bhulia.com>', // Matched to the domain you registered
      to: [payload.to],
      subject: payload.subject,
      html: payload.htmlContent,
    });

    if (data.error) {
      throw new Error(data.error.message);
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("[Email API Error]", error);
    return { success: false, error: error.message };
  }
}
