"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { addOrder } from "../../lib/db-hooks";
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function CheckoutPage() {
  const { cart, cartTotal, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [shippingDetails, setShippingDetails] = useState({
    fullName: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    const checkProfileComplete = async () => {
      const uid = user?.uid || localStorage.getItem("sd_current_user_uid");
      if (!uid) {
        setLoadingProfile(false);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (!data.phone || !data.addresses || data.addresses.length === 0) {
            router.push("/profile?intent=checkout");
            return;
          } else {
            // Pre-fill shipping details with default address
            const defaultAddr = data.addresses.find((a: any) => a.isDefault) || data.addresses[0];
            setShippingDetails({
              fullName: data.name || user?.displayName || "",
              email: user?.email || "",
              phone: data.phone || "",
              address: defaultAddr.localAddress || "",
              city: defaultAddr.district || "",
              state: defaultAddr.state || "",
              pincode: defaultAddr.pinCode || "",
            });
          }
        } else {
          router.push("/profile?intent=checkout");
          return;
        }
      } catch (e) {
        console.error(e);
      }
      setLoadingProfile(false);
    };
    checkProfileComplete();
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({ ...prev, [name]: value }));
  };

  const loadRazorpay = async () => {
    if (!(window as any).Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
      await new Promise((resolve) => {
        script.onload = resolve;
      });
    }
  };

  const handlePayment = async () => {
    if (!shippingDetails.address || !shippingDetails.phone) {
      alert("Please fill in all required shipping details.");
      return;
    }

    try {
      await loadRazorpay();

      // In production, you would call an API route here to create a Razorpay order
      // const res = await fetch('/api/create-order', { method: 'POST', body: JSON.stringify({ amount: cartTotal }) });
      // const order = await res.json();

      const options = {
        key: "rzp_test_YourTestKey", // Replace with your test/live key
        amount: cartTotal * 100, // Razorpay works in paise
        currency: "INR",
        name: "Bhulia Hub",
        description: "Heritage Sambalpuri Marketplace",
        image: "/bhulia-hero.png",
        // order_id: order.id, // Uncomment when API is ready
        handler: async function (response: any) {
          try {
            // Create Order in Firestore for each cart item
            for (const item of cart) {
              await addOrder({
                orderId: response.razorpay_payment_id,
                productName: item.title,
                productPrice: item.price,
                quantity: item.cartQuantity,
                customerName: shippingDetails.fullName,
                customerPhone: shippingDetails.phone,
                customerWhatsapp: shippingDetails.phone,
                customerAddress: `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.state} - ${shippingDetails.pincode}`,
                referralId: localStorage.getItem("sd_referral_id") || null,
                proxyBuyerId: user?.uid || null,
                paymentMode: "Razorpay",
                paymentStatus: "Paid",
                logisticsStatus: "Pending Sourcing",
                qcStatus: "Pending Sourcing",
                timestamp: new Date().toISOString(),
              });
            }
            clearCart();
            alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
            router.push("/dashboard"); // Redirect to user dashboard after success
          } catch (error) {
            console.error("Order save failed", error);
            alert("Payment successful but failed to save order. Contact support.");
          }
        },
        prefill: {
          name: shippingDetails.fullName,
          email: shippingDetails.email,
          contact: shippingDetails.phone,
        },
        theme: {
          color: "#0A3A35",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Payment failed", error);
      alert("Payment failed to initialize.");
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 mt-12 text-center min-h-[60vh]">
        <div className="animate-pulse text-[#C5A059] font-mono text-sm">Verifying Checkout Eligibility...</div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 mt-12 text-center min-h-[60vh]">
        <div className="w-24 h-24 mb-6 rounded-full bg-[#0A3A35] flex items-center justify-center border border-[#C5A059]/30">
          <svg className="w-10 h-10 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        </div>
        <h2 className="text-3xl font-serif text-[#C5A059] mb-4">Your Cart is Empty</h2>
        <p className="text-gray-400 mb-8 max-w-md">Discover authentic Sambalpuri masterpieces and support our master weavers directly.</p>
        <button onClick={() => router.push('/')} className="px-8 py-3 bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(197,160,89,0.3)]">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col lg:flex-row gap-10">
      
      {/* Checkout Form */}
      <div className="flex-1 space-y-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-[#C5A059] mb-2">Secure Checkout</h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest">Provide shipping details for D2C Escrow Delivery</p>
        </div>

        <div className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
          <h3 className="text-xl font-serif text-white border-b border-[#C5A059]/20 pb-4">Shipping Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs text-[#C5A059] font-bold uppercase tracking-wider">Full Name *</label>
              <input type="text" name="fullName" value={shippingDetails.fullName} onChange={handleInputChange} className="w-full bg-[#051815] border border-[#2A4A45] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors" placeholder="Shyam Dash" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#C5A059] font-bold uppercase tracking-wider">Email Address *</label>
              <input type="email" name="email" value={shippingDetails.email} onChange={handleInputChange} className="w-full bg-[#051815] border border-[#2A4A45] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors" placeholder="shyam@example.com" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs text-[#C5A059] font-bold uppercase tracking-wider">Phone Number *</label>
              <input type="tel" name="phone" value={shippingDetails.phone} onChange={handleInputChange} className="w-full bg-[#051815] border border-[#2A4A45] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors" placeholder="+91 99370 XXXXX" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs text-[#C5A059] font-bold uppercase tracking-wider">Delivery Address *</label>
              <textarea name="address" value={shippingDetails.address} onChange={handleInputChange} className="w-full bg-[#051815] border border-[#2A4A45] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors h-24 resize-none" placeholder="House No, Street, Landmark"></textarea>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#C5A059] font-bold uppercase tracking-wider">City *</label>
              <input type="text" name="city" value={shippingDetails.city} onChange={handleInputChange} className="w-full bg-[#051815] border border-[#2A4A45] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors" placeholder="Bhubaneswar" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#C5A059] font-bold uppercase tracking-wider">State *</label>
              <input type="text" name="state" value={shippingDetails.state} onChange={handleInputChange} className="w-full bg-[#051815] border border-[#2A4A45] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors" placeholder="Odisha" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#C5A059] font-bold uppercase tracking-wider">PIN Code *</label>
              <input type="text" name="pincode" value={shippingDetails.pincode} onChange={handleInputChange} className="w-full bg-[#051815] border border-[#2A4A45] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors" placeholder="751001" />
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="w-full lg:w-[420px] space-y-6">
        <div className="bg-[#051815] border-2 border-[#C5A059]/40 rounded-3xl p-6 shadow-2xl sticky top-24">
          <h3 className="text-xl font-serif text-white border-b border-[#C5A059]/20 pb-4 mb-4">Order Summary</h3>
          
          <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 bg-[#0B2B26] rounded-xl border border-[#C5A059]/20">
                <div className="relative w-16 h-20 rounded-lg overflow-hidden shrink-0">
                  <Image src={item.img} alt={item.title} fill className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-2">{item.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Qty: {item.cartQuantity}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-bold text-[#C5A059]">{item.price}</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-[10px] text-red-400 hover:text-red-300 underline">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 border-t border-[#C5A059]/20 pt-4">
            <div className="flex justify-between text-sm text-gray-300">
              <span>Subtotal</span>
              <span>₹ {cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-300">
              <span>Escrow Protection Fee (1.5%)</span>
              <span>₹ {Math.round(cartTotal * 0.015).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-300">
              <span>Shipping</span>
              <span className="text-[#C5A059]">Free</span>
            </div>
            
            <div className="pt-3 mt-3 border-t border-[#C5A059]/20 flex justify-between items-center">
              <span className="text-lg font-bold text-white">Total</span>
              <span className="text-xl font-bold text-[#C5A059]">₹ {Math.round(cartTotal * 1.015).toLocaleString()}</span>
            </div>
          </div>

          <button onClick={handlePayment} className="w-full mt-8 py-4 bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] font-bold text-sm uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(197,160,89,0.3)] flex justify-center items-center gap-2">
            <span>Pay securely with Razorpay</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </button>
          
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest text-center">
            <svg className="w-3 h-3 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            <span>100% Escrow Protected D2C Payment</span>
          </div>
        </div>
      </div>
    </div>
  );
}
