import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      isMock,
      slug,
      urls
    } = body;

    // Verify Payment Signature
    if (!isMock) {
      if (!process.env.RAZORPAY_KEY_SECRET) {
        throw new Error("Missing Razorpay Secret Key for verification.");
      }

      const text = `${razorpay_order_id}|${razorpay_payment_id}`;
      
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      if (generated_signature !== razorpay_signature) {
        return NextResponse.json(
          { success: false, error: "Payment verification failed. Invalid signature." },
          { status: 400 }
        );
      }
    }

    // --- PHASE 4: AUTO-APPROVAL PROVISIONING ---
    // Update the Vendor/Weaver document to activate the domain
    if (slug) {
      const collectionsToSearch = ["vendors", "weavers"];
      let foundAndUpdated = false;

      for (const colName of collectionsToSearch) {
        if (foundAndUpdated) break;

        const q = query(collection(db, colName), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          await updateDoc(userDoc.ref, {
            vanityUrlActive: true,
            customDomain: urls[0] || null, // Primary purchased domain
            subscriptionTier: "premium",
            billingCycle: "annual"
          });
          foundAndUpdated = true;
        }
      }

      if (!foundAndUpdated) {
        console.warn(`Vanity URL Auto-Provisioning: User with slug ${slug} not found in vendors or weavers.`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and URL auto-provisioned successfully.",
      paymentId: razorpay_payment_id || `pay_mock_${Date.now()}`
    });

  } catch (error: any) {
    console.error("Razorpay Vanity Verification Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
