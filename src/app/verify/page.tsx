"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function VerifyContent() {
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  const type = searchParams?.get("type") || "business";
  const name = searchParams?.get("name");

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // In the future, this will submit to Firebase Firestore 'verification_requests' collection
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#051815] font-sans flex items-center justify-center p-6">
        <div className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-3xl p-8 md:p-12 max-w-2xl w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-900/30 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl border border-green-500/30">
            ✓
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#C5A059] mb-4">Verification Request Submitted!</h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Thank you for claiming your business. Our team will review your submitted documents and contact you on your registered WhatsApp number within 24-48 hours.
          </p>
          <Link href="/directory" className="inline-block bg-[#C5A059] hover:bg-[#D4AF37] text-[#051815] font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full transition-all shadow-lg hover:-translate-y-1">
            Return to Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#051815] font-sans py-20 px-4 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[#C5A059]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C5A059] mb-4">
            Claim & Verify Your Business
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto">
            {name ? `You are claiming the profile for ${name}. ` : ""}
            Verified businesses get a verified badge, priority ranking in search results, and access to the seller dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0B2B26] border border-[#C5A059]/20 rounded-3xl p-6 md:p-10 shadow-2xl">
          
          <div className="space-y-8">
            {/* Section 1 */}
            <div>
              <h3 className="text-[#C5A059] font-bold uppercase tracking-widest text-xs mb-4 border-b border-[#C5A059]/20 pb-2">1. Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">Full Name</label>
                  <input required type="text" className="w-full bg-[#051815] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none transition-colors" placeholder="Owner's Name" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">Email Address</label>
                  <input required type="email" className="w-full bg-[#051815] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none transition-colors" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">WhatsApp Number</label>
                  <input required type="tel" className="w-full bg-[#051815] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none transition-colors" placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h3 className="text-[#C5A059] font-bold uppercase tracking-widest text-xs mb-4 border-b border-[#C5A059]/20 pb-2">2. Business Details</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">Business/Shop Name</label>
                  <input required type="text" defaultValue={name || ""} className="w-full bg-[#051815] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none transition-colors" placeholder="E.g. Shyam Dash Creations" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">Business Address</label>
                  <textarea required className="w-full bg-[#051815] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none transition-colors h-24" placeholder="Full address including District and Pincode"></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">GST Number (Optional)</label>
                    <input type="text" className="w-full bg-[#051815] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none transition-colors" placeholder="GSTIN" />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">Business Role</label>
                    <select defaultValue={type} className="w-full bg-[#051815] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none transition-colors cursor-pointer">
                      <option value="business">Select Role</option>
                      <option value="weaver">Master Weaver</option>
                      <option value="vendor">Retail Store</option>
                      <option value="raw_material">Raw Material Supplier</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h3 className="text-[#C5A059] font-bold uppercase tracking-widest text-xs mb-4 border-b border-[#C5A059]/20 pb-2">3. Verification Documents</h3>
              <div className="bg-[#051815] border border-dashed border-gray-600 rounded-2xl p-8 text-center hover:border-[#C5A059] transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#C5A059]/20 transition-colors">
                  <span className="text-2xl">📄</span>
                </div>
                <p className="text-white font-semibold mb-1">Click to upload Trade License, Udyam Aadhar, or Weaver ID</p>
                <p className="text-gray-500 text-xs">PDF, JPG, or PNG (Max 5MB)</p>
              </div>
            </div>

          </div>

          <div className="mt-10 border-t border-[#C5A059]/20 pt-8 text-center">
            <button type="submit" className="bg-[#C5A059] hover:bg-[#D4AF37] text-[#051815] font-bold text-sm uppercase tracking-widest px-10 py-4 rounded-full transition-all shadow-lg hover:-translate-y-1 w-full md:w-auto">
              Submit Verification Request
            </button>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-4">
              By submitting, you agree to the Bhulia.com Terms of Service & Privacy Policy
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#051815] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div></div>}>
      <VerifyContent />
    </Suspense>
  );
}
