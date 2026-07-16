import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const { planId, customerId } = await request.json();

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn("Missing Razorpay Keys. Falling back to Mock Mode.");
      return NextResponse.json({
        success: true,
        isMockMode: true,
        subscriptionId: "sub_MOCK_" + Math.random().toString(36).substring(7).toUpperCase(),
      });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const subscription = await instance.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // Defaulting to 12 billing cycles for this example
    });

    return NextResponse.json({
      success: true,
      isMockMode: false,
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("Razorpay Subscription Creation Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initialize Razorpay subscription" },
      { status: 500 }
    );
  }
}
