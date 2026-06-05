"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { addReseller } from "@/lib/db-hooks";

export default function ResellerRegistrationPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authentication states
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  // Form Data
  const [formData, setFormData] = useState({
    representativeName: "",
    hubName: "",
    contactNumber: "",
    whatsappNumber: "",
    emailAddress: "",
    address: "",
    city: "",
    tier: "Silver" as "Silver" | "Gold" | "Diamond"
  });

  // Sync auth state on load
  useEffect(() => {
    const checkAuth = () => {
      const email = localStorage.getItem("sd_current_user_email");
      const name = localStorage.getItem("sd_current_user_name");
      const avatar = localStorage.getItem("sd_current_user_avatar");

      if (email) {
        setUserName(name || email.split("@")[0]);
        setUserAvatar(avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80");
        if (!formData.emailAddress) {
          setFormData(prev => ({ ...prev, emailAddress: email, representativeName: prev.representativeName || name || "" }));
        }
      } else {
        setUserName(null);
        setUserAvatar(null);
      }
    };

    checkAuth();
    window.addEventListener("sd_auth_change", checkAuth);
    return () => window.removeEventListener("sd_auth_change", checkAuth);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (validationError) setValidationError(null);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    if (!formData.hubName || !formData.representativeName || !formData.contactNumber || !formData.city) {
       setValidationError("Please fill in all mandatory fields (Name, Store Name, Contact, City).");
       window.scrollTo({ top: 0, behavior: "smooth" });
       return;
    }

    setIsSubmitting(true);

    const uniqueId = "reseller-" + Math.floor(1000 + Math.random() * 9000);
    const assignedSlug = formData.tier === "Silver"
      ? uniqueId
      : formData.hubName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const subscriptionTier = formData.tier === "Silver" ? "free" : formData.tier === "Gold" ? "paid_1" : "paid_3";

    const payload = {
      slug: assignedSlug,
      name: formData.hubName || "Unnamed Store",
      city: formData.city,
      phone: formData.contactNumber,
      whatsapp: formData.whatsappNumber || formData.contactNumber,
      address: formData.address || "N/A",
      img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80", // Default placeholder
      tier: formData.tier,
      subscriptionTier: subscriptionTier,
      status: "pending_approval" as const,
      invitedCount: 0,
      totalSales: 0,
      commissionEarned: 0,
      userId: localStorage.getItem("sd_current_user_uid") || "demo_user",
      userEmail: formData.emailAddress || localStorage.getItem("sd_current_user_email") || ""
    };

    try {
      const res = await addReseller(payload);
      if (!(res as any).success) {
        setValidationError("Database Error submitting application. Please try again.");
        setIsSubmitting(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    } catch (err: any) {
      setValidationError("Network or Server error submitting application: " + err.message);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setFormSubmitted(true);
    setIsSubmitting(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="relative flex-1 w-full bg-[#051815] text-white font-sans flex flex-col min-h-screen">
      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden sticky top-[57px] z-40 bg-[#0B2B26]/98 backdrop-blur-md border-b border-[#C5A059]/40 px-6 py-6 space-y-4 shadow-2xl">
          <div className="flex flex-col space-y-3 text-xs font-bold uppercase tracking-widest text-gray-200">
            <Link href="/" className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Home</Link>
            <Link href="/register-weaver" className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Apply as Weaver</Link>
            <span className="text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block font-black">Reseller Partner Application</span>
          </div>
        </div>
      )}

      {/* Form Container */}
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 flex-1 flex flex-col justify-center">
        {!formSubmitted ? (
          <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative">
            
            <div className="text-center space-y-2 pb-6 border-b border-[#C5A059]/20">
              <h2 className="text-2xl sm:text-4xl font-serif text-[#C5A059] font-bold tracking-wider">Become a Reseller Partner</h2>
              <p className="text-xs sm:text-sm text-gray-300 font-sans">Launch your digital storefront in minutes. Zero inventory, massive commissions.</p>
            </div>

            {validationError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-xs font-medium animate-fadeIn">
                ⚠️ {validationError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 mb-6">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Select Reseller Plan</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "Silver", name: "Silver (Free)", price: "Rs 0", desc: "Private dashboard. Share product links and earn." },
                    { id: "Gold", name: "Gold (Paid)", price: "Rs 2,000 / yr", desc: "Public Storefront. Curate up to 10 products." },
                    { id: "Diamond", name: "Diamond (Paid)", price: "Rs 5,000 / yr", desc: "Premium Storefront. Unlimited curated products." }
                  ].map((t) => {
                    const selected = formData.tier === t.id;
                    return (
                      <div 
                        key={t.id}
                        onClick={() => setFormData(prev => ({ ...prev, tier: t.id as any }))}
                        className={`border rounded-xl p-3.5 cursor-pointer transition-all flex flex-col justify-between ${selected ? "bg-[#0A3A35] border-[#C5A059] text-white" : "border-[#C5A059]/20 bg-[#051815]/50 text-gray-300 hover:border-[#C5A059]"}`}
                      >
                        <div>
                          <p className="text-xs font-bold text-[#C5A059]">{t.name}</p>
                          <p className="text-[10px] text-gray-300 mt-1 leading-relaxed">{t.desc}</p>
                        </div>
                        <span className="text-[10px] font-mono text-[#C5A059] font-bold mt-2 block">{t.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Your Store Name</label>
                  <input 
                    type="text" name="hubName" value={formData.hubName} onChange={handleInputChange} 
                    placeholder="e.g. Amaar Halchal Collection" required
                    className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Your Full Name</label>
                  <input 
                    type="text" name="representativeName" value={formData.representativeName} onChange={handleInputChange} 
                    placeholder="e.g. Amaar Halchal" required
                    className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Mobile Number</label>
                  <input 
                    type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} 
                    placeholder="e.g. +91 94370 12345" required
                    className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Email Address</label>
                  <input 
                    type="email" name="emailAddress" value={formData.emailAddress} onChange={handleInputChange} 
                    placeholder="name@example.com" required
                    className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">City Location</label>
                  <input 
                    type="text" name="city" value={formData.city} onChange={handleInputChange} 
                    placeholder="e.g. Bhubaneswar" required
                    className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Full Address (Optional)</label>
                  <input 
                    type="text" name="address" value={formData.address} onChange={handleInputChange} 
                    placeholder="Full Address details"
                    className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-6 py-4 bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] rounded-xl text-sm font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(197,160,89,0.3)] disabled:opacity-50"
              >
                {isSubmitting ? "Submitting Application..." : "Apply as Reseller Partner"}
              </button>
              
              <p className="text-center text-[10px] text-gray-400 mt-4">By applying, you agree to our Terms of Service. Verification details (ID/Bank) can be uploaded later via your partner dashboard.</p>
            </form>
          </div>
        ) : (
          <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-10 shadow-2xl text-center space-y-6 max-w-lg mx-auto">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/40">
              <span className="text-4xl">✨</span>
            </div>
            <h2 className="text-3xl font-serif text-[#C5A059] font-bold">Application Received</h2>
            <p className="text-sm text-gray-300">
              Welcome to the Bhulia ecosystem! We have received your reseller application. 
              Our team will review it shortly. Once approved, you can access your dashboard and start earning immediately.
            </p>
            <div className="pt-6">
              <Link href="/" className="inline-block py-3 px-8 bg-[#051815] border border-[#C5A059]/50 text-[#C5A059] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#C5A059]/10 transition-all">
                Return to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
