import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { amount, urls, slug } = await req.json();

    if (!amount || !urls || !slug) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn("Missing Razorpay Keys. Falling back to Mock Mode for Vanity URLs.");
      // Mock Success Response
      return NextResponse.json({
        success: true,
        mock: true,
        orderId: `order_mock_${Date.now()}`,
        amount: amount,
        currency: "INR",
        keyId: "mock_key_id"
      });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: "INR",
      receipt: `vanity_rcpt_${slug}_${Date.now().toString().slice(-4)}`,
      notes: {
        type: "vanity_url_subscription",
        slug: slug,
        urls: urls.join(", ")
      }
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({
      success: true,
      mock: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID, 
    });

  } catch (error: any) {
    console.error("Razorpay Vanity Order Creation Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initialize Razorpay checkout" },
      { status: 500 }
    );
  }
}
