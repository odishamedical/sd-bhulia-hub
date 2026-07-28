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
            planId: defaultPlan,
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
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Confirm Subscription</h2>
          <p className="text-gray-500 mt-2 font-medium">You are about to subscribe to the <span className="font-bold text-gray-800">{defaultPlan}</span> plan. Your payment method will be securely saved via Razorpay for future billing cycles.</p>
        </div>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
           <p className="text-sm text-blue-800 font-medium text-center">By clicking subscribe, you agree to our Terms of Service. You can cancel your subscription at any time from your billing dashboard.</p>
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
