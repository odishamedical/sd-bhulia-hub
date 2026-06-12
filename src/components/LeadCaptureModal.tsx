"use client";

import React, { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export default function LeadCaptureModal({ isOpen, onClose, onSuccess, title = "Complete Your Profile", description = "Please enter your WhatsApp number to receive updates and secure your account." }: LeadCaptureModalProps) {
  const { user } = useAuth();
  const [whatsapp, setWhatsapp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (whatsapp.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        whatsapp: whatsapp
      });
      setIsSubmitting(false);
      onSuccess(); // Triggers the callback (like addToCart) and closes modal
    } catch (err) {
      console.error(err);
      setError("Failed to save. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <div className="w-16 h-16 bg-[#C5A059]/10 text-[#C5A059] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#C5A059]/30">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
        </div>

        <h2 className="text-2xl font-serif font-bold text-center text-[#C5A059] mb-2">{title}</h2>
        <p className="text-gray-300 text-sm text-center mb-6 leading-relaxed">
          {description}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">WhatsApp Number</label>
            <input 
              required 
              type="tel" 
              value={whatsapp} 
              onChange={(e) => setWhatsapp(e.target.value)} 
              className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none transition-colors" 
              placeholder="+91 XXXXX XXXXX" 
            />
          </div>
          
          {error && <p className="text-red-400 text-xs font-bold">{error}</p>}

          <button 
            disabled={isSubmitting} 
            type="submit" 
            className="w-full bg-[#C5A059] hover:bg-[#D4AF37] disabled:opacity-50 text-[#051815] font-black text-sm uppercase tracking-widest py-4 rounded-full transition-all shadow-lg hover:-translate-y-1 mt-4"
          >
            {isSubmitting ? "Saving..." : "Verify & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
