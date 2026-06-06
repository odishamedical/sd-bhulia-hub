import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Simulate Shiprocket API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock successful AWB generation
    return NextResponse.json({
      success: true,
      message: "Shiprocket AWB Generated",
      awb_code: "SR" + Math.random().toString().slice(2, 11),
      courier_name: "Delhivery Surface",
      routing_code: "BOM-DEL",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to generate AWB" },
      { status: 500 }
    );
  }
}
