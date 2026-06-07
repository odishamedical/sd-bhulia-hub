"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function MaintenanceScreen({ message, allowNewsletter }: { message?: string, allowNewsletter?: boolean }) {
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !whatsapp) return;
    // In a real app, save to db
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-[#051815] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xl w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#C5A059] rounded-full blur-[100px] opacity-20"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#996515] rounded-full blur-[100px] opacity-20"></div>

        <div className="relative z-10">
          <div className="w-24 h-24 mx-auto mb-8 bg-[#051815] border border-[#C5A059]/50 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
            <span className="text-4xl">🛠️</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#C5A059] mb-4 tracking-tight">
            We'll Be Back Soon
          </h1>
          
          <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-md mx-auto">
            {message || "We are currently upgrading the platform to bring you a better experience. We will be back online shortly."}
          </p>

          {allowNewsletter && !submitted && (
            <div className="bg-[#051815] border border-[#C5A059]/20 p-6 rounded-2xl">
              <h3 className="text-[#C5A059] font-bold mb-2 uppercase tracking-widest text-xs">Notify Me When Live</h3>
              <p className="text-gray-400 text-sm mb-4">Leave your details and we'll message you the moment we're back.</p>
              
              <form onSubmit={handleSubmit} className="space-y-3 text-left">
                <div>
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#0A2520] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#C5A059] transition-colors"
                  />
                </div>
                <div>
                  <input 
                    type="tel" 
                    placeholder="WhatsApp Number" 
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    className="w-full bg-[#0A2520] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#C5A059] transition-colors"
                  />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] font-black uppercase tracking-widest text-sm py-3 rounded-xl hover:opacity-90 transition-opacity">
                  Notify Me
                </button>
              </form>
            </div>
          )}

          {submitted && (
            <div className="bg-[#0A2520] border border-[#C5A059]/40 p-6 rounded-2xl animate-pulse">
              <div className="text-3xl mb-2">✨</div>
              <h3 className="text-[#C5A059] font-bold mb-1">You're on the list!</h3>
              <p className="text-gray-300 text-sm">We'll let you know as soon as the platform is live.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
