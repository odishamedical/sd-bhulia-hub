import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, customerInfo, items, subTotal } = body;

    // Check for Shiprocket Keys
    if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
      console.warn("Missing Shiprocket Credentials. Falling back to Mock AWB.");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return NextResponse.json({
        success: true,
        isMockMode: true,
        message: "Mock AWB Generated",
        awb_code: "SR" + Math.random().toString().slice(2, 11),
        courier_name: "Delhivery Surface (Mock)",
        routing_code: "BOM-DEL",
      });
    }

    // 1. Authenticate with Shiprocket
    const authRes = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD
      })
    });
    
    if (!authRes.ok) throw new Error("Shiprocket Authentication Failed");
    const authData = await authRes.json();
    const token = authData.token;

    // 2. Create Order in Shiprocket
    const orderPayload = {
      order_id: orderId,
      order_date: new Date().toISOString().split("T")[0],
      pickup_location: "Primary Warehouse",
      billing_customer_name: customerInfo.fullName,
      billing_last_name: "",
      billing_address: customerInfo.address,
      billing_city: customerInfo.city,
      billing_pincode: customerInfo.pincode,
      billing_state: customerInfo.state,
      billing_country: "India",
      billing_email: customerInfo.email,
      billing_phone: customerInfo.phone,
      shipping_is_billing: true,
      order_items: items.map((item: any) => ({
        name: item.title,
        sku: item.id,
        units: item.cartQuantity,
        selling_price: parseInt(item.price.replace(/[^0-9]/g, "")),
        discount: 0,
        tax: 0,
        hsn: 5007
      })),
      payment_method: "Prepaid",
      sub_total: subTotal,
      length: 10,
      breadth: 15,
      height: 20,
      weight: 0.5
    };

    const createOrderRes = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/ad-hoc", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(orderPayload)
    });

    if (!createOrderRes.ok) throw new Error("Shiprocket Order Creation Failed");
    const orderData = await createOrderRes.json();
    const shipment_id = orderData.shipment_id;

    // 3. Generate AWB
    const awbRes = await fetch("https://apiv2.shiprocket.in/v1/external/courier/generate/awb", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        shipment_id: shipment_id,
        courier_id: 1 // Example Delhivery
      })
    });

    if (!awbRes.ok) throw new Error("Shiprocket AWB Generation Failed");
    const awbData = await awbRes.json();

    return NextResponse.json({
      success: true,
      isMockMode: false,
      message: "Shiprocket AWB Generated Successfully",
      awb_code: awbData.response.data.awb_code,
      courier_name: awbData.response.data.courier_name,
      routing_code: awbData.response.data.routing_code,
    });

  } catch (error: any) {
    console.error("Shiprocket API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate AWB" },
      { status: 500 }
    );
  }
}
