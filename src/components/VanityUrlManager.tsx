"use client";

import React, { useState } from "react";
import Script from "next/script";

export default function VanityUrlManager({ currentSlug = "shyam-dash-303" }: { currentSlug?: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Selected Tiers
  const [selectedProfessional, setSelectedProfessional] = useState(false);
  const [selectedPremium, setSelectedPremium] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] = useState(false);

  const PRICING = {
    professional: 999, // ₹999/yr
    premium: 2999,     // ₹2,999/yr
    enterprise: 4999,  // ₹4,999/yr
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(false);
    
    // Simulate API search latency
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
      // Auto-select the cheapest one to encourage purchase
      setSelectedProfessional(true);
    }, 1200);
  };

  const calculateTotal = () => {
    let base = 0;
    let count = 0;
    if (selectedProfessional) { base += PRICING.professional; count++; }
    if (selectedPremium) { base += PRICING.premium; count++; }
    if (selectedEnterprise) { base += PRICING.enterprise; count++; }

    let discountPercent = 0;
    if (count === 2) discountPercent = 0.15; // 15% Combo Discount
    if (count === 3) discountPercent = 0.25; // 25% Maximum Discount

    const discountAmount = Math.floor(base * discountPercent);
    const finalTotal = base - discountAmount;

    return { base, discountPercent, discountAmount, finalTotal, count };
  };

  const totals = calculateTotal();
  const rawSearch = searchQuery.toLowerCase().replace(/[^a-z0-9-]/g, "");

  const handleCheckout = async () => {
    if (totals.count === 0 || isProcessingPayment) return;
    setIsProcessingPayment(true);

    const selectedUrls = [];
    if (selectedProfessional) selectedUrls.push(`bhulia.com/store/${rawSearch}`);
    if (selectedPremium) selectedUrls.push(`bhulia.com/${rawSearch}`);
    if (selectedEnterprise) selectedUrls.push(`${rawSearch}.bhulia.com`);

    try {
      // 1. Generate Order
      const res = await fetch("/api/vanity/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totals.finalTotal,
          urls: selectedUrls,
          slug: currentSlug,
        })
      });

      const orderData = await res.json();
      if (!orderData.success) throw new Error(orderData.error || "Failed to create order");

      // 2. Open Razorpay
      const options = {
        key: orderData.keyId || "rzp_test_mock", 
        amount: orderData.amount, 
        currency: orderData.currency,
        name: "Bhulia Premium",
        description: "Vanity URL Subscription (1 Year)",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyRes = await fetch("/api/vanity/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              isMock: orderData.mock,
              slug: currentSlug,
              urls: selectedUrls
            })
          });
          
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setPaymentSuccess(true);
            setIsProcessingPayment(false);
          } else {
            alert("Payment Verification Failed!");
            setIsProcessingPayment(false);
          }
        },
        theme: {
          color: "#C5A059"
        }
      };

      if (orderData.mock) {
        options.handler({
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: "pay_mock",
          razorpay_signature: "mock_signature"
        });
      } else {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        rzp.on('payment.failed', function () {
          alert("Payment failed or cancelled.");
          setIsProcessingPayment(false);
        });
      }

    } catch (error) {
      console.error(error);
      alert("Checkout failed. Please try again.");
      setIsProcessingPayment(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="bg-[#0B2B26] border border-[#C5A059] rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden animate-in fade-in zoom-in">
        <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-3xl font-serif text-[#C5A059] font-bold mb-4">URLs Secured!</h2>
        <p className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
          Your new brand identity is now locked and protected for 1 year. The Bhulia Auto-Provisioning engine is updating your storefront right now!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      {/* Background Graphic */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header & Warning Hook */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#C5A059] font-bold mb-3">Claim Your Brand URL</h2>
          <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm text-red-200 font-semibold mb-1">Your brand identity is currently unprotected.</p>
                <p className="text-xs text-red-100/70">
                  You are currently using the generic auto-generated ID link: 
                  <span className="font-mono text-white bg-black/30 px-2 py-0.5 rounded mx-1 break-all">bhulia.com/store/{currentSlug}</span>. 
                  Protect your actual name before a competitor registers it.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-[#C5A059] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your brand name (e.g. shyamdash)"
            className="w-full pl-12 pr-32 py-4 bg-[#051815] border-2 border-[#C5A059]/30 rounded-2xl text-white font-bold text-lg focus:outline-none focus:border-[#C5A059] transition-colors"
          />
          <button 
            type="submit" 
            disabled={isSearching || !searchQuery}
            className="absolute right-2 top-2 bottom-2 bg-[#C5A059] text-[#0A1021] font-black uppercase tracking-wider px-6 rounded-xl hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isSearching ? (
              <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span> Search</>
            ) : "Search"}
          </button>
        </form>

        {/* Search Results / GoDaddy Engine */}
        {hasSearched && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </span>
              <h3 className="text-xl font-bold text-white">Congratulations! <span className="text-[#C5A059]">{rawSearch}</span> is available.</h3>
            </div>

            <div className="space-y-3">
              {/* Professional Tier */}
              <label className={`block cursor-pointer p-4 border-2 rounded-2xl transition-all ${
                selectedProfessional ? "border-[#C5A059] bg-[#C5A059]/10" : "border-gray-700 bg-black/20 hover:border-gray-500"
              }`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <input 
                      type="checkbox" 
                      checked={selectedProfessional} 
                      onChange={() => setSelectedProfessional(!selectedProfessional)}
                      className="w-5 h-5 accent-[#C5A059]" 
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">Professional</span>
                      </div>
                      <p className="text-sm sm:text-base font-bold text-white break-all">bhulia.com/store/<span className="text-[#C5A059]">{rawSearch}</span></p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-[#C5A059]">₹{PRICING.professional}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">per year</p>
                  </div>
                </div>
              </label>

              {/* Premium Tier */}
              <label className={`block cursor-pointer p-4 border-2 rounded-2xl transition-all ${
                selectedPremium ? "border-[#C5A059] bg-[#C5A059]/10" : "border-gray-700 bg-black/20 hover:border-gray-500"
              }`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <input 
                      type="checkbox" 
                      checked={selectedPremium} 
                      onChange={() => setSelectedPremium(!selectedPremium)}
                      className="w-5 h-5 accent-[#C5A059]" 
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded">Premium (Top Level)</span>
                      </div>
                      <p className="text-sm sm:text-base font-bold text-white break-all">bhulia.com/<span className="text-[#C5A059]">{rawSearch}</span></p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-[#C5A059]">₹{PRICING.premium}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">per year</p>
                  </div>
                </div>
              </label>

              {/* Enterprise Tier */}
              <label className={`block cursor-pointer p-4 border-2 rounded-2xl transition-all ${
                selectedEnterprise ? "border-[#C5A059] bg-[#C5A059]/10" : "border-gray-700 bg-black/20 hover:border-gray-500"
              }`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <input 
                      type="checkbox" 
                      checked={selectedEnterprise} 
                      onChange={() => setSelectedEnterprise(!selectedEnterprise)}
                      className="w-5 h-5 accent-[#C5A059]" 
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">Enterprise (Subdomain)</span>
                      </div>
                      <p className="text-sm sm:text-base font-bold text-white break-all"><span className="text-[#C5A059]">{rawSearch}</span>.bhulia.com</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-[#C5A059]">₹{PRICING.enterprise}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">per year</p>
                  </div>
                </div>
              </label>
            </div>

            {/* Checkout & Combo Logic */}
            {totals.count > 0 && (
              <div className="mt-8 bg-black/40 border border-[#C5A059]/20 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                  
                  <div className="w-full sm:w-auto">
                    {totals.count > 1 ? (
                      <div className="mb-2">
                        <span className="inline-block bg-green-500/20 border border-green-500/50 text-green-400 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded mb-1">
                          🔥 {totals.discountPercent * 100}% Brand Protection Combo Applied!
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 mb-2">Select multiple URLs to unlock combo discounts.</p>
                    )}
                    
                    <div className="flex items-end gap-3">
                      <div className="text-3xl font-black text-white">₹{totals.finalTotal.toLocaleString()} <span className="text-sm text-gray-400 font-medium">/ year</span></div>
                      {totals.count > 1 && (
                        <div className="text-sm text-gray-500 line-through mb-1.5">₹{totals.base.toLocaleString()}</div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    disabled={isProcessingPayment}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#C5A059] to-[#A07B35] text-[#0A1021] font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(197,160,89,0.4)] hover:-translate-y-0.5 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessingPayment ? (
                      <><span className="w-5 h-5 border-2 border-[#0A1021] border-t-transparent rounded-full animate-spin"></span> Processing...</>
                    ) : (
                      `Secure ${totals.count} ${totals.count === 1 ? 'URL' : 'URLs'}`
                    )}
                  </button>
                  
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
