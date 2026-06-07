"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  
  // Calculate total shipping
  const shippingTotal = cart.reduce((total, item) => total + (item.shippingCharge || 0), 0);
  const finalTotal = cartTotal + shippingTotal;
  
  const [userUid, setUserUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUid(user.uid);
        setFormData(prev => ({ ...prev, email: user.email || "" }));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Your cart is empty!");
    
    setLoading(true);

    try {
      // 1. Simulate Payment Gateway Delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 2. Generate Order in Firestore (Cart Splitting by Seller)
      const referralId = localStorage.getItem("sd_reseller_ref") || null;
      
      // Group items by sellerId
      const groupedBySeller: Record<string, typeof cart> = {};
      cart.forEach(item => {
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

        sellerItems.forEach(item => {
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
          paymentStatus: "paid_mock",
          referralId: referralId,
          createdAt: serverTimestamp(),
          assignedLogisticsPartner: "pending"
        };

        // Create sub-order
        await addDoc(collection(db, "orders"), subOrder);

        // Deduct inventory
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

      // 3. Clear Cart & Show Success
      clearCart();
      setSuccess(true);
      
      // Auto redirect after 3s
      setTimeout(() => {
        router.push("/profile");
      }, 3000);

    } catch (error) {
      console.error("Error creating order", error);
      alert("Payment failed simulation.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#051815] flex flex-col items-center justify-center p-6 text-center z-50 relative">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-[0_0_30px_rgba(34,197,94,0.4)]">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-[#C5A059] mb-4 font-serif">Payment Successful!</h1>
        <p className="text-gray-300 max-w-md text-sm leading-relaxed mb-8">
          Your order has been securely placed. The vendor has been notified and the payment has been securely split.
        </p>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest animate-pulse">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#051815] py-12 px-4 sm:px-6 relative z-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Checkout Form */}
        <div className="lg:col-span-7 bg-[#0B2B26] border border-[#C5A059]/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <h2 className="text-2xl font-serif font-black text-[#C5A059] mb-6">Shipping Details</h2>
          <form id="checkout-form" onSubmit={handleSimulatePayment} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                <input required name="fullName" value={formData.fullName} onChange={handleChange} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
              <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Delivery Address</label>
              <textarea required name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none resize-none"></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">City</label>
                <input required name="city" value={formData.city} onChange={handleChange} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">State</label>
                <input required name="state" value={formData.state} onChange={handleChange} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Pincode</label>
                <input required name="pincode" value={formData.pincode} onChange={handleChange} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none" />
              </div>
            </div>

          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-gradient-to-b from-[#1c0f08] to-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 shadow-2xl sticky top-24">
            <h3 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-2">
              <span>🛍️</span> Order Summary
            </h3>
            
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-center bg-[#051815] p-3 rounded-xl border border-[#C5A059]/20">
                  <div className="w-16 h-16 relative rounded-lg overflow-hidden shrink-0">
                    <Image src={item.img || "/bhulia-hero.png"} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white line-clamp-1">{item.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Qty: {item.cartQuantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#C5A059]">₹{parseInt(item.price.replace(/[^0-9]/g, "")) * item.cartQuantity}</p>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <p className="text-gray-500 text-sm italic text-center py-4">Your cart is empty.</p>
              )}
            </div>

            <div className="border-t border-[#C5A059]/20 pt-4 space-y-3 mb-8">
              <div className="flex justify-between text-sm text-gray-300">
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-300">
                <span>Shipping</span>
                <span className={shippingTotal === 0 ? "text-green-400 font-bold" : "text-white"}>
                  {shippingTotal === 0 ? "FREE" : `₹${shippingTotal.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-xl font-black text-white pt-2 border-t border-[#C5A059]/20">
                <span>Total</span>
                <span className="text-[#C5A059]">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <button 
              form="checkout-form"
              type="submit"
              disabled={loading || cart.length === 0}
              className="w-full py-4 bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] font-black text-sm uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(197,160,89,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-[#0A1021]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing Payment...
                </>
              ) : (
                "Pay Securely via Razorpay (Mock)"
              )}
            </button>
            <p className="text-center text-[9px] text-gray-500 mt-4 uppercase tracking-widest">
              🔒 256-bit Encrypted Transaction
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
