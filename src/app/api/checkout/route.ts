import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Simulate Razorpay/Stripe network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock successful payment session creation
    return NextResponse.json({
      success: true,
      message: "Mock Checkout Session Created",
      orderId: "MOCK_ORD_" + Math.random().toString(36).substring(7).toUpperCase(),
      paymentUrl: "/checkout?status=success", // In a real app this would be a Stripe/Razorpay URL
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to initialize checkout" },
      { status: 500 }
    );
  }
}
