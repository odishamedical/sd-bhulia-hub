import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const { planId, customerId } = await request.json();

    if (!process.env.RAZORPAY_KEY_ID?.trim() || !process.env.RAZORPAY_KEY_SECRET?.trim()) {
      console.error("Missing Razorpay Keys.");
      return NextResponse.json(
        { success: false, error: "Razorpay credentials missing. Contact Administrator." },
        { status: 500 }
      );
    }

    // Map internal plans to Razorpay ENV plan IDs
    let rzpPlanId = "";
    switch (planId) {
      case "weaver-monthly":
        rzpPlanId = process.env.RAZORPAY_PLAN_WEAVER_MONTHLY?.trim() || "";
        break;
      case "weaver-yearly":
        rzpPlanId = process.env.RAZORPAY_PLAN_WEAVER_YEARLY?.trim() || "";
        break;
      case "shop-monthly":
        rzpPlanId = process.env.RAZORPAY_PLAN_SHOP_MONTHLY?.trim() || "";
        break;
      case "shop-yearly":
        rzpPlanId = process.env.RAZORPAY_PLAN_SHOP_YEARLY?.trim() || "";
        break;
      default:
        rzpPlanId = process.env.RAZORPAY_PLAN_DEFAULT?.trim() || planId;
    }

    if (!rzpPlanId) {
      return NextResponse.json(
        { success: false, error: "Razorpay Plan ID is not configured for this tier." },
        { status: 500 }
      );
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID.trim(),
      key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
    });

    const subscription = await instance.subscriptions.create({
      plan_id: rzpPlanId,
      customer_notify: 0,
      total_count: planId.includes("yearly") ? 1 : 12, 
    });

    return NextResponse.json({
      success: true,
      isMockMode: false,
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID.trim(),
    });
  } catch (error: any) {
    console.error("Razorpay Subscription Creation Error:", error);
    
    // Razorpay SDK usually returns error details in error.error.description or error.description
    const errorMsg = error?.error?.description || error?.description || error?.message || "Failed to initialize Razorpay subscription";
    
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
