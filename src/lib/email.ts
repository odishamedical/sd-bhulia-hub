// src/lib/email.ts

/**
 * Free-Tier Email API Simulator (SMTP / Resend)
 * Simulation Mode Enabled: Logs payloads instead of calling external HTTP endpoint.
 */

interface EmailPayload {
  to: string;
  subject: string;
  htmlContent: string;
}

export async function sendEmailMessage(payload: EmailPayload) {
  console.log(`[Email API Simulated] Preparing to send via SMTP / Resend...`);
  console.log(`To: ${payload.to}`);
  console.log(`Subject: ${payload.subject}`);
  console.log(`Body (HTML preview): ${payload.htmlContent.slice(0, 100)}...`);

  // Simulation Mode logic:
  return {
    success: true,
    messageId: `email_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    provider: "Simulated Email Provider"
  };

  // -------------------------------------------------------------
  // REAL IMPLEMENTATION (Using Nodemailer or Resend)
  // -------------------------------------------------------------
  /*
  try {
    // Example with Resend:
    // const res = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     from: 'Bhulia Updates <notifications@bhulia.com>',
    //     to: payload.to,
    //     subject: payload.subject,
    //     html: payload.htmlContent
    //   })
    // });
    // return { success: true, data: await res.json() };
  } catch (error: any) {
    console.error("[Email API Error]", error);
    return { success: false, error: error.message };
  }
  */
}
