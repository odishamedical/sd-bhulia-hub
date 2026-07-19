"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SaaSUpgraderModal({ isOpen, onClose, defaultPlan = "weaver-monthly" }: { isOpen: boolean, onClose: () => void, defaultPlan?: string }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    if (!auth.currentUser) return alert("You must be logged in.");
    setLoading(true);
    try {
      // 1. Create subscription via our backend
      const res = await fetch("/api/subscriptions/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: defaultPlan,
          customerId: auth.currentUser!.uid,
        })
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to initialize checkout");
      }

      // 2. Load Razorpay Script if not loaded
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // 3. Open Razorpay Popup
      const options = {
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "Bhulia Hub",
        description: "Pro Seller Subscription",
        handler: async function (response: any) {
          // On Success
          await updateDoc(doc(db, "users", auth.currentUser.uid), {
            subscriptionStatus: "active",
            subscriptionId: data.subscriptionId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          alert("Payment Successful! Welcome to Pro.");
          onClose();
          window.location.reload();
        },
        prefill: {
          email: auth.currentUser.email,
        },
        theme: {
          color: "#0070F3"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to start checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 text-2xl font-bold">&times;</button>
        
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Upgrade to Pro</h2>
          <p className="text-gray-500 mt-2 font-medium">Unlock unlimited products, wholesale (B2B) features, and priority shipping gateway logistics.</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-green-500 text-xl font-bold">✓</span>
            <span className="text-gray-700 font-medium">Unlimited Product Uploads</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-green-500 text-xl font-bold">✓</span>
            <span className="text-gray-700 font-medium">Wholesale & B2B Purchasing unlocked</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-green-500 text-xl font-bold">✓</span>
            <span className="text-gray-700 font-medium">Automated Shipping Gateway Waybills</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-green-500 text-xl font-bold">✓</span>
            <span className="text-gray-700 font-medium">Priority Customer Support</span>
          </div>
        </div>

        <button 
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-[#0070F3] to-blue-600 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          {loading ? "Processing..." : `Subscribe to ${defaultPlan.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}`}
        </button>
        <p className="text-center text-xs text-gray-400 mt-4 font-medium">Securely powered by Razorpay. Cancel anytime.</p>
      </div>
    </div>
  );
}
