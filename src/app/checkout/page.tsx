"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { INDIAN_STATES, ODISHA_DISTRICTS, ODISHA_DISTRICT_BLOCKS } from "@/lib/locations";
import Image from "next/image";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, userData } = useAuth();
  const router = useRouter();
  
  const [userUid, setUserUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Coupon State
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Calculate Subtotal for the specific seller (if coupon applied)
  let sellerSubtotal = 0;
  let discountAmount = 0;

  if (appliedCoupon) {
    sellerSubtotal = cart
      .filter((item: any) => item.sellerId === appliedCoupon.sellerId || item.storeId === appliedCoupon.sellerId)
      .reduce((total: number, item: any) => total + parseInt(item.price.replace(/[^0-9]/g, "")) * item.cartQuantity, 0);

    if (appliedCoupon.type === "percentage") {
      discountAmount = sellerSubtotal * (appliedCoupon.value / 100);
    } else {
      discountAmount = Math.min(sellerSubtotal, appliedCoupon.value);
    }
  }

  // Calculate total shipping
  const shippingTotal = cart.reduce((total, item) => total + (item.shippingCharge || 0), 0);
  const finalTotal = cartTotal + shippingTotal - discountAmount;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    state: "Odisha",
    district: "",
    block: "",
    cityTownVillage: "",
    streetAddress: "",
    pincode: "",
  });

  useEffect(() => {
    if (user) {
      setUserUid(user.uid);
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        fullName: userData?.name || prev.fullName,
        phone: userData?.whatsapp || userData?.phone || prev.phone,
        state: userData?.address?.state || userData?.state || prev.state,
        district: userData?.address?.district || userData?.district || prev.district,
        block: userData?.address?.block || userData?.block || prev.block,
        cityTownVillage: userData?.address?.cityTownVillage || userData?.city || prev.cityTownVillage,
        streetAddress: userData?.address?.streetAddress || userData?.address || prev.streetAddress,
        pincode: userData?.address?.pincode || userData?.pincode || prev.pincode,
      }));
    }
  }, [user, userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!promoCodeInput.trim()) return;

    setValidatingCoupon(true);
    try {
      const q = query(collection(db, "coupons"), where("code", "==", promoCodeInput.toUpperCase()));
      const snap = await getDocs(q);

      if (snap.empty) {
        setCouponError("Invalid promo code.");
        setValidatingCoupon(false);
        return;
      }

      const couponDoc = snap.docs[0].data();

      if (!couponDoc.active) {
        setCouponError("This promo code has expired or is inactive.");
        setValidatingCoupon(false);
        return;
      }

      // Check if cart contains items from this seller
      const hasSellerItems = cart.some((item: any) => item.sellerId === couponDoc.sellerId || item.storeId === couponDoc.sellerId);
      if (!hasSellerItems) {
        setCouponError("This promo code is only valid for products sold by the issuing weaver.");
        setValidatingCoupon(false);
        return;
      }

      setAppliedCoupon({ id: snap.docs[0].id, ...couponDoc });
      setPromoCodeInput("");
    } catch (e) {
      console.error(e);
      setCouponError("Error validating promo code.");
    }
    setValidatingCoupon(false);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Your cart is empty!");
    
    setLoading(true);

    try {
      // 1. Call Backend to generate Razorpay Order
      const res = await fetch("/api/checkout/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalTotal,
        })
      });
      const data = await res.json();
      
      if (!data.success) throw new Error(data.error);

      // 2. Open Razorpay Modal
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Bhulia Hub",
        description: "Payment Protected Escrow Transaction",
        image: "/bhulia-hero.png",
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            await verifyPaymentOnBackend(
              response.razorpay_order_id, 
              response.razorpay_payment_id, 
              response.razorpay_signature,
              false
            );
          } catch (err) {
            console.error(err);
            alert("Payment Verification Failed!");
            setLoading(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#051815",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment Failed: " + response.error.description);
        setLoading(false);
      });
      rzp.open();

    } catch (error) {
      console.error("Error creating order", error);
      alert("Checkout initialization failed.");
      setLoading(false);
    }
  };

  const verifyPaymentOnBackend = async (
    razorpay_order_id: string, 
    razorpay_payment_id: string, 
    razorpay_signature: string, 
    isMockMode: boolean
  ) => {
    const referralId = localStorage.getItem("sd_reseller_ref") || null;
    
    // Call secure verify endpoint
    const verifyRes = await fetch("/api/checkout/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        isMockMode,
        cart,
        formData,
        userUid,
        referralId
      })
    });

    const verifyData = await verifyRes.json();
    if (verifyData.success) {
      // Save address back to user profile if logged in
      if (userUid) {
        try {
          await updateDoc(doc(db, "users", userUid), {
            whatsapp: formData.phone,
            phone: formData.phone,
            address: {
              state: formData.state,
              district: formData.district,
              block: formData.block,
              cityTownVillage: formData.cityTownVillage,
              streetAddress: formData.streetAddress,
              pincode: formData.pincode,
            }
          });
        } catch (err) {
          console.error("Failed to save address to profile", err);
        }
      }

      // 3. Clear Cart & Show Success
      clearCart();
      setSuccess(true);
      
      // Auto redirect after 3s
      setTimeout(() => {
        router.push("/profile");
      }, 3000);
    } else {
      alert("Payment verification failed! " + verifyData.error);
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
          Your order has been securely placed. The store has been notified and the payment has been securely split.
        </p>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest animate-pulse">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#051815] py-12 px-4 sm:px-6 relative z-10">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Breadcrumbs Navigation */}
        <Breadcrumbs items={[{ label: "Checkout" }]} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Checkout Form */}
        <div className="lg:col-span-7 bg-[#0B2B26] border border-[#C5A059]/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <h2 className="text-2xl font-serif font-black text-[#C5A059] mb-6">Shipping Details</h2>
          <form id="checkout-form" onSubmit={handlePayment} className="space-y-6">
            
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">State</label>
                <select name="state" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value, district: "", block: ""})} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none cursor-pointer">
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">District</label>
                {formData.state === "Odisha" ? (
                  <select required name="district" value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value, block: ""})} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none cursor-pointer">
                    <option value="">Select District</option>
                    {ODISHA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                ) : (
                  <input required name="district" value={formData.district} onChange={handleChange} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none" placeholder="Enter District" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Block</label>
                {formData.state === "Odisha" && formData.district ? (
                  <select name="block" value={formData.block} onChange={handleChange} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none cursor-pointer">
                    <option value="">Select Block (Optional)</option>
                    {(ODISHA_DISTRICT_BLOCKS[formData.district] || []).map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                ) : (
                  <input name="block" value={formData.block} onChange={handleChange} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none" placeholder="Enter Block (Optional)" />
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">City / Town / Village</label>
                <input required name="cityTownVillage" value={formData.cityTownVillage} onChange={handleChange} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Pincode</label>
                <input required name="pincode" value={formData.pincode} onChange={handleChange} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Street Address</label>
              <textarea required name="streetAddress" value={formData.streetAddress} onChange={handleChange} rows={3} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none resize-none" placeholder="Shop number, street, landmark..."></textarea>
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

            {/* Promo Code Input */}
            <div className="border-t border-[#C5A059]/20 pt-6 mb-6">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Have a Promo Code?</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  disabled={appliedCoupon !== null}
                  value={appliedCoupon ? appliedCoupon.code : promoCodeInput} 
                  onChange={e => setPromoCodeInput(e.target.value)}
                  placeholder="e.g. DIWALI20" 
                  className="flex-1 bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-white focus:border-[#C5A059] outline-none font-mono uppercase text-sm disabled:opacity-50"
                />
                {!appliedCoupon ? (
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !promoCodeInput}
                    type="button"
                    className="px-4 py-2 bg-[#C5A059] text-[#0A1021] font-bold rounded-xl text-sm hover:brightness-110 transition-colors disabled:opacity-50"
                  >
                    {validatingCoupon ? "..." : "Apply"}
                  </button>
                ) : (
                  <button 
                    onClick={() => setAppliedCoupon(null)}
                    type="button"
                    className="px-4 py-2 bg-red-900/30 text-red-400 border border-red-500/30 font-bold rounded-xl text-sm hover:bg-red-900/50 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              {couponError && <p className="text-red-400 text-xs mt-2 font-medium">{couponError}</p>}
              {appliedCoupon && <p className="text-green-400 text-xs mt-2 font-medium">Coupon applied to eligible products!</p>}
            </div>

            <div className="border-t border-[#C5A059]/20 pt-4 space-y-3 mb-8">
              <div className="flex justify-between text-sm text-gray-300">
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-400 font-bold">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
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
                "Pay Securely with Razorpay"
              )}
            </button>
            <p className="text-center text-[9px] text-gray-500 mt-4 uppercase tracking-widest">
              🔒 256-bit Encrypted Transaction
            </p>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
}
