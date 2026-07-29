import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const { subscriptionId, customerId } = await request.json();

    if (!subscriptionId || !customerId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: subscriptionId or customerId" },
        { status: 400 }
      );
    }

    if (!process.env.RAZORPAY_KEY_ID?.trim() || !process.env.RAZORPAY_KEY_SECRET?.trim()) {
      console.error("Missing Razorpay Keys.");
      return NextResponse.json(
        { success: false, error: "Razorpay credentials missing. Contact Administrator." },
        { status: 500 }
      );
    }

    // Initialize Razorpay
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID.trim(),
      key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
    });

    // Cancel Subscription on Razorpay (cancel_at_cycle_end is usually preferred, but we will cancel immediately here)
    const cancelledSubscription = await instance.subscriptions.cancel(subscriptionId);

    return NextResponse.json({
      success: true,
      message: "Subscription successfully cancelled.",
      cancelledSubscription
    });

  } catch (error: any) {
    console.error("Razorpay Subscription Cancellation Error:", error);
    
    // Razorpay SDK usually returns error details in error.error.description or error.description
    const errorMsg = error?.error?.description || error?.description || error?.message || "Failed to cancel Razorpay subscription";
    
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
