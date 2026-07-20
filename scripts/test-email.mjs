import { Resend } from "resend";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTest() {
  console.log("Sending test email using Resend...");
  
  if (!process.env.RESEND_API_KEY) {
    console.error("Error: RESEND_API_KEY is not set in .env.local");
    return;
  }

  try {
    const data = await resend.emails.send({
      from: 'Bhulia Hub <notifications@update.bhulia.com>',
      // Sending to the email found in your .env.local
      to: ['bhuliadotcom@gmail.com'], 
      subject: '🚀 Test Email from Bhulia Hub (Resend Verified)!',
      html: `
        <div style="font-family: sans-serif; padding: 20px; text-align: center;">
          <h1 style="color: #C5A059;">Authentication Successful!</h1>
          <p style="font-size: 16px; color: #333;">
            If you are reading this, your Resend integration and DNS records for <b>update.bhulia.com</b> are working perfectly.
          </p>
          <br/>
          <p style="font-size: 12px; color: #777;">
            Sent automatically via the Bhulia Hub backend.
          </p>
        </div>
      `,
    });
    
    if (data.error) {
      console.error("Resend API returned an error:", data.error);
    } else {
      console.log("✅ Email sent successfully! Message ID:", data.data?.id);
    }
  } catch (error) {
    console.error("❌ Exception occurred while sending:", error);
  }
}

sendTest();
