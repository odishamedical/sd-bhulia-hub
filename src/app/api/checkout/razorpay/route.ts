import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const { amount, currency = "INR", receipt = "receipt_01" } = await request.json();

    // Check if keys exist, if not, use a graceful fallback to mock mode
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn("Missing Razorpay Keys. Falling back to Mock Mode.");
      return NextResponse.json({
        success: true,
        isMockMode: true,
        orderId: "MOCK_RZP_" + Math.random().toString(36).substring(7).toUpperCase(),
        amount: amount,
      });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: receipt + "_" + Date.now(),
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({
      success: true,
      isMockMode: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // Send public key to frontend for init
    });
  } catch (error: any) {
    console.error("Razorpay Order Creation Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initialize Razorpay checkout" },
      { status: 500 }
    );
  }
}
