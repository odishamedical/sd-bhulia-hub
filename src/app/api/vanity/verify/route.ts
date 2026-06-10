import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      isMock,
      slug,
      urls
    } = body;

    if (isMock) {
      // Handle mock verification
      return NextResponse.json({
        success: true,
        message: "Mock payment verified successfully.",
        paymentId: `pay_mock_${Date.now()}`
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Missing Razorpay Secret Key for verification.");
    }

    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Payment verification failed. Invalid signature." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully.",
      paymentId: razorpay_payment_id
    });

  } catch (error: any) {
    console.error("Razorpay Vanity Verification Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
