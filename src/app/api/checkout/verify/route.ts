import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { sendPlatformNotification } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      isMockMode,
      cart,
      formData,
      userUid,
      referralId
    } = body;

    // Verify Signature if not in mock mode
    if (!isMockMode) {
      if (!process.env.RAZORPAY_KEY_SECRET) {
        throw new Error("Missing Razorpay Secret Key for verification.");
      }
      
      const text = `${razorpay_order_id}|${razorpay_payment_id}`;
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      if (generated_signature !== razorpay_signature) {
        return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
      }
    }

    // --- SECURE BACKEND CART SPLITTING & INVENTORY DEDUCTION ---
    const groupedBySeller: Record<string, typeof cart> = {};
    cart.forEach((item: any) => {
      const sellerId = item.sellerId || "bhulia-hub";
      if (!groupedBySeller[sellerId]) groupedBySeller[sellerId] = [];
      groupedBySeller[sellerId].push(item);
    });

    const parentOrderId = `P-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    
    for (const sellerId of Object.keys(groupedBySeller)) {
      const sellerItems = groupedBySeller[sellerId];
      
      let subTotal = 0;
      let shippingTotal = 0;
      let totalCommission = 0;

      sellerItems.forEach((item: any) => {
        const priceNum = parseInt(item.price.replace(/[^0-9]/g, ""));
        subTotal += priceNum * item.cartQuantity;
        shippingTotal += (item.shippingCharge || 0);
        
        if (referralId && item.allowResellerMargin && item.resellerMarginPercentage) {
           totalCommission += (priceNum * item.cartQuantity) * (item.resellerMarginPercentage / 100);
        }
      });

      const platformShare = subTotal * 0.05; // 5% platform fee
      const vendorPayout = subTotal - totalCommission - platformShare;

      const subOrder = {
        parentOrderId,
        sellerId,
        userId: userUid || "guest",
        customerInfo: formData,
        items: sellerItems,
        totalAmount: subTotal + shippingTotal,
        subTotal: subTotal,
        shippingTotal: shippingTotal,
        resellerCommission: totalCommission,
        platformShare: platformShare,
        vendorPayout: vendorPayout,
        status: "processing", // pending_dispatch
        paymentStatus: isMockMode ? "paid_mock" : "paid_escrow",
        paymentGatewayId: razorpay_payment_id || null,
        razorpayOrderId: razorpay_order_id || null,
        referralId: referralId,
        createdAt: serverTimestamp(),
        assignedLogisticsPartner: "pending"
      };

      // Create sub-order
      await addDoc(collection(db, "orders"), subOrder);

      // Deduct inventory securely on the backend
      for (const item of sellerItems) {
        try {
          const productRef = doc(db, "products", item.id);
          const productSnap = await getDoc(productRef);
          
          if (productSnap.exists()) {
            const pData = productSnap.data();
            const currentStock = pData.stockQuantity || 0;
            const newStock = Math.max(0, currentStock - item.cartQuantity);
            
            await updateDoc(productRef, {
              stockQuantity: newStock,
              inStock: newStock > 0
            });
          }
        } catch (e) {
          console.error("Failed to deduct inventory for product", item.id, e);
        }
      }
    }

    // -------------------------------------------------------------
    // PHASE 8: TRIGGER AUTOMATED NOTIFICATIONS (WHATSAPP & EMAIL)
    // -------------------------------------------------------------
    try {
      // 1. Notify Buyer (Order Confirmed)
      if (formData.phone) {
        await sendPlatformNotification({
          type: "both",
          toPhone: formData.phone,
          toEmail: formData.email,
          templateName: "order_confirmed",
          whatsappComponents: [{ type: "body", parameters: [{ type: "text", text: parentOrderId }] }],
          subject: `Bhulia.com Order Confirmed: ${parentOrderId}`,
          htmlContent: `<h2>Thank you for your order!</h2><p>Your order <strong>${parentOrderId}</strong> has been successfully placed. We will notify you once it ships.</p>`
        });
      }

      // 2. Notify Sellers (New Order Received)
      for (const sellerId of Object.keys(groupedBySeller)) {
        // In a real app, we would lookup the seller's phone/email from the DB here
        // For simulation, we log the intent
        await sendPlatformNotification({
          type: "whatsapp",
          toPhone: "919876543210", // Mock seller phone
          templateName: "vendor_new_order",
          whatsappComponents: [{ type: "body", parameters: [{ type: "text", text: parentOrderId }] }]
        });
      }
    } catch (notifErr) {
      console.error("Failed to send checkout notifications", notifErr);
    }

    return NextResponse.json({ success: true, parentOrderId });
    
  } catch (error: any) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
