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

    // Verify Signature
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

    // --- TIER 1: FETCH GLOBAL COMMISSION SETTINGS ---
    let globalCommissionRate = 5; // Default fallback
    let roleRates: Record<string, number> = {};
    try {
      const settingsSnap = await getDoc(doc(db, "settings", "platform"));
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        if (data.globalCommissionRate !== undefined) globalCommissionRate = data.globalCommissionRate;
        if (data.weaverCommissionRate !== undefined) roleRates.weaver = data.weaverCommissionRate;
        if (data.storeCommissionRate !== undefined) roleRates.store = data.storeCommissionRate;
        if (data.wholesalerCommissionRate !== undefined) roleRates.wholesaler = data.wholesalerCommissionRate;
        if (data.supplierCommissionRate !== undefined) roleRates.supplier = data.supplierCommissionRate;
      }
    } catch (err) {
      console.error("Failed to load platform settings:", err);
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
      // --- TIER 2: FETCH USER COMMISSION SETTING & ROLE ---
      let sellerCommissionRate: number | null = null;
      let sellerRole: string | null = null;
      if (sellerId !== "bhulia-hub") {
        try {
          const sellerSnap = await getDoc(doc(db, "users", sellerId));
          if (sellerSnap.exists()) {
             if (sellerSnap.data().commissionRate !== undefined) {
               sellerCommissionRate = sellerSnap.data().commissionRate;
             }
             if (sellerSnap.data().role) {
               sellerRole = sellerSnap.data().role;
             }
          }
        } catch(err) {
          console.error("Failed to load seller info:", err);
        }
      }
      
      let subTotal = 0;
      let shippingTotal = 0;
      let totalCommission = 0;
      let platformShare = 0;

      sellerItems.forEach((item: any) => {
        const priceNum = parseInt(item.price.replace(/[^0-9]/g, ""));
        const itemSubTotal = priceNum * item.cartQuantity;
        subTotal += itemSubTotal;
        shippingTotal += (item.shippingCharge || 0);
        
        // --- TIER 3: PRODUCT OVERRIDE CASCADE ---
        let effectiveRate = globalCommissionRate;
        if (sellerRole && roleRates[sellerRole] !== undefined) {
           effectiveRate = roleRates[sellerRole]; // Role level overrides global
        }
        if (sellerCommissionRate !== null) {
           effectiveRate = sellerCommissionRate; // User level overrides role/global
        }
        if (item.platformCommissionRate !== undefined && item.platformCommissionRate !== null) {
           effectiveRate = item.platformCommissionRate; // Product level overrides all
        }
        
        platformShare += itemSubTotal * (effectiveRate / 100);
        
        if (referralId && item.allowResellerMargin && item.resellerMarginPercentage) {
           totalCommission += itemSubTotal * (item.resellerMarginPercentage / 100);
        }
      });

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
        paymentStatus: "paid_escrow",
        paymentGatewayId: razorpay_payment_id || null,
        razorpayOrderId: razorpay_order_id || null,
        referralId: referralId,
        createdAt: serverTimestamp(),
        assignedLogisticsPartner: "pending"
      };

      // Create sub-order
      const orderRef = await addDoc(collection(db, "orders"), subOrder);

      // Log to Global Ledger if there's a reseller commission
      if (referralId && totalCommission > 0) {
        await addDoc(collection(db, "transactions"), {
          type: "reseller_commission",
          resellerId: referralId,
          orderId: orderRef.id,
          amount: totalCommission,
          status: "pending_escrow",
          createdAt: serverTimestamp(),
        });
      }

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
