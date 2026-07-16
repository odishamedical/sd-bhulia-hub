import { NextResponse } from 'next/server';

const SHIPROCKET_API_URL = "https://apiv2.shiprocket.in/v1/external";

export async function POST(request: Request) {
  try {
    const { orderDetails } = await request.json();

    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
      console.warn("Missing Shiprocket Keys. Returning Mock AWB.");
      return NextResponse.json({
        success: true,
        isMockMode: true,
        awbCode: "MOCK_AWB_" + Math.random().toString(36).substring(7).toUpperCase(),
        shipmentId: "MOCK_SHIPMENT_" + Date.now(),
      });
    }

    // 1. Authenticate with Shiprocket
    const authRes = await fetch(`${SHIPROCKET_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const authData = await authRes.json();
    if (!authData.token) {
      throw new Error("Failed to authenticate with Shiprocket");
    }

    const token = authData.token;

    // 2. Create Custom Order
    const createOrderRes = await fetch(`${SHIPROCKET_API_URL}/orders/create/adhoc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(orderDetails),
    });

    const createOrderData = await createOrderRes.json();
    
    if (createOrderRes.ok && createOrderData.shipment_id) {
       return NextResponse.json({
         success: true,
         orderId: createOrderData.order_id,
         shipmentId: createOrderData.shipment_id,
         awbCode: createOrderData.awb_code || null,
       });
    } else {
       console.error("Shiprocket Create Order API Error", createOrderData);
       throw new Error(createOrderData.message || "Failed to create order in Shiprocket");
    }
  } catch (error: any) {
    console.error("Shiprocket Shipping Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process shipping request" },
      { status: 500 }
    );
  }
}
