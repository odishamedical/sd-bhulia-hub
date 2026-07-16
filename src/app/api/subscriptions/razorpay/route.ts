import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const { planId, customerId } = await request.json();

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
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
        rzpPlanId = process.env.RAZORPAY_PLAN_WEAVER_MONTHLY || "";
        break;
      case "weaver-yearly":
        rzpPlanId = process.env.RAZORPAY_PLAN_WEAVER_YEARLY || "";
        break;
      case "shop-monthly":
        rzpPlanId = process.env.RAZORPAY_PLAN_SHOP_MONTHLY || "";
        break;
      case "shop-yearly":
        rzpPlanId = process.env.RAZORPAY_PLAN_SHOP_YEARLY || "";
        break;
      default:
        rzpPlanId = process.env.RAZORPAY_PLAN_DEFAULT || planId;
    }

    if (!rzpPlanId) {
      return NextResponse.json(
        { success: false, error: "Razorpay Plan ID is not configured for this tier." },
        { status: 500 }
      );
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const subscription = await instance.subscriptions.create({
      plan_id: rzpPlanId,
      customer_notify: 1,
      total_count: planId.includes("yearly") ? 1 : 12, 
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
