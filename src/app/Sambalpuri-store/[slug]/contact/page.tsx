"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { MASTER_STORES, DEFAULT_STORE } from "../../data";

export default function StoreContactPage() {
  const params = useParams();
  const rawSlug = typeof params?.slug === "string" ? params.slug : "maa-samaleswari-weavers";
  const storeSlug = rawSlug.toLowerCase();

  const store = MASTER_STORES.find((s) => s.slug === storeSlug || s.id.toLowerCase() === storeSlug) || {
    ...DEFAULT_STORE,
    id: storeSlug.toUpperCase(),
    slug: storeSlug,
    name: `Store/PWCS (${storeSlug.replace(/-/g, " ")})`,
  };

  const [inquiryText, setInquiryText] = useState("");
  const [inquiryName, setInquiryName] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleWhatsAppInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryText.trim() || !inquiryName.trim()) return;

    const whatsappNumber = store.contactDetails?.whatsapp || "919437012345";
    const fullMessage = `Hello ${store.name}, my name is ${inquiryName}. I am interested in your Sambalpuri sarees: ${inquiryText}`;
    
    window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(fullMessage)}`, "_blank");
    setFormSubmitted(true);
  };

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8 relative z-10">
      
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-3xl font-serif text-[#C5A059] font-bold tracking-wider">
          Contact Guild Office & Depots
        </h2>
        <p className="text-[10px] md:text-xs text-gray-300 uppercase tracking-widest font-semibold">
          Get in touch for custom designs, order tracking or bulk cooperative queries
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Contact Info Card */}
        <div className="lg:col-span-5 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl text-white">
          <div className="space-y-6">
            <h3 className="text-lg font-serif font-bold text-[#C5A059] border-b border-[#C5A059]/20 pb-3">Official Depot Info</h3>
            
            <div className="space-y-4 text-sm font-sans">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block">Postal Dispatch Address</span>
                <p className="text-gray-200 text-xs leading-relaxed">{store.contactDetails?.address}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block">Inquiry Email</span>
                <p className="text-gray-200 text-xs font-mono">{store.contactDetails?.email}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block">Primary Hotline</span>
                <p className="text-[#C5A059] font-mono text-sm font-bold">{store.contactDetails?.phone}</p>
              </div>
            </div>

            {/* Logistics Disclaimer */}
            <div className="bg-[#051815] border border-[#C5A059]/25 rounded-2xl p-4 text-[11px] text-gray-300 leading-relaxed space-y-1">
              <span className="font-bold text-[#C5A059] block">🚚 Physical Hub Route Activated</span>
              <p>
                All dispatches originate from western Odisha, arriving first at our Sonepur validation hub before routing to the customer destination via Shiprocket premium air networks.
              </p>
            </div>
          </div>
        </div>

        {/* WhatsApp Inquiry Form */}
        <div className="lg:col-span-7 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl text-white">
          <form onSubmit={handleWhatsAppInquiry} className="space-y-6">
            <h3 className="text-lg font-serif font-bold text-[#C5A059] border-b border-[#C5A059]/20 pb-3">Send Direct Guild Message</h3>

            {formSubmitted ? (
              <div className="text-center py-6 bg-[#051815] rounded-2xl border border-[#C5A059]/20 space-y-2">
                <span className="text-2xl">💬</span>
                <h4 className="text-sm font-bold text-[#C5A059]">WhatsApp Chat Triggered</h4>
                <p className="text-xs text-gray-300 max-w-xs mx-auto">
                  We opened your WhatsApp app to send the message. You can also contact us on the hotline.
                </p>
                <button 
                  type="button" 
                  onClick={() => setFormSubmitted(false)}
                  className="text-xs underline text-[#C5A059] font-bold mt-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Your Name</label>
                  <input 
                    type="text" 
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    required
                    placeholder="e.g. Priyambada Mohanty"
                    className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Message Details</label>
                  <textarea 
                    value={inquiryText}
                    onChange={(e) => setInquiryText(e.target.value)}
                    required
                    rows={4}
                    placeholder="Ask about bulk pricing, customized sizes, or specific loom availability..."
                    className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:brightness-110 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2"
                >
                  <span>📲 Send WhatsApp Message</span>
                </button>
              </div>
            )}

          </form>
        </div>

      </div>

    </div>
  );
}
