import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

interface ClaimModalProps {
  listing: {
    id: string;
    name: string;
    category: string;
    address: string;
  };
  onClose: () => void;
  onSuccess: (listingId: string) => void;
}

export default function ClaimModal({ listing, onClose, onSuccess }: ClaimModalProps) {
  const { user, loginWithGoogle } = useAuth();
  const [step, setStep] = useState(0); // Step 0 is Auth Check
  
  const [website, setWebsite] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Owner");
  const [docType, setDocType] = useState(
    listing.category === "handlooms"
      ? "Weaver ID Card"
      : listing.category === "doctors"
      ? "Medical Registration ID"
      : listing.category === "jewelry"
      ? "GSTIN / BIS Certificate"
      : "Trade License"
  );
  const [docNumber, setDocNumber] = useState("");
  const [docFile, setDocFile] = useState<File | string | null>(null);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && step === 0) {
      setStep(1);
      setOwnerName(user.displayName || "");
      setEmail(user.email || "");
    }
  }, [user, step]);

  const handleNext = () => {};

  const handleBack = () => {
    setStep(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.uid) throw new Error("Not logged in");

      // 1. Update User Document
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const roleName = listing.category || "vendor";
      
      if (userSnap.exists()) {
        await updateDoc(userRef, {
          [`roles.bhulia-hub`]: roleName,
          applicationStatus: "pending",
          personalName: ownerName,
          phone: phone
        });
      } else {
        await setDoc(userRef, {
          name: ownerName,
          email: email,
          [`roles.bhulia-hub`]: roleName,
          applicationStatus: "pending",
          personalName: ownerName,
          phone: phone,
          createdAt: new Date()
        });
      }

      // 2. Update Listing Document (weavers, stores, etc based on category)
      const collectionName = listing.category === "weaver" || listing.category === "handlooms" ? "weavers" 
        : listing.category === "store" ? "stores" 
        : "stores"; // Fallback
      
      const listingRef = doc(db, collectionName, listing.id);
      
      await updateDoc(listingRef, {
        ownerUid: user.uid,
        status: "pending_admin_approval",
        website: website,
        contactEmail: email,
        contactPhone: phone,
        claimedAt: new Date()
      });

      setClaimId(listing.id);
      setStep(5); // Skip payment modal for now
    } catch (err) {
      console.error("Failed to submit claim:", err);
      alert("Error submitting claim. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      store: "Retail Store",
      weaver: "Master Weaver",
      wholesaler: "B2B Wholesaler",
      raw_material: "Raw Material Supplier"
    };
    return map[cat] || cat;
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg glass-panel rounded-3xl overflow-hidden shadow-2xl relative border border-[#C5A059]/30 animate-float bg-[#051815]">
        
        {/* Glowing Ambient Top Bar */}
        <div className="h-1 bg-gradient-to-r from-[#FFF5C0] via-[#C5A059] to-[#8A5A00] w-full" />
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#C5A059]/20 flex justify-between items-center bg-[#0A2520]">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#C5A059] block mb-0.5">Verification Wizard</span>
            <h3 className="text-lg font-bold text-white">Claim: {listing.name}</h3>
          </div>
          {step < 4 && (
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          )}
        </div>



        {/* Content Body */}
        <div className="p-6">
          {step === 0 && (
            <div className="py-8 text-center flex flex-col items-center justify-center gap-6">
              <div className="w-16 h-16 bg-[#C5A059]/10 rounded-full flex items-center justify-center text-[#C5A059] border border-[#C5A059]/30">
                <Icons.Lock className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-serif font-bold text-white mb-2">Authentication Required</h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  To claim a business and manage it, you must be logged into the Bhulia Ecosystem.
                </p>
              </div>
              <button 
                onClick={loginWithGoogle}
                className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-3 mt-4"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign In with Google
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Confirm listing parameters and provide your official digital credentials. We will compare this data to public Google records.
              </p>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Company Listing</label>
                <div className="w-full bg-[#051815]/50 border border-[#C5A059]/30 rounded-xl px-4 py-3 text-sm text-white flex items-center justify-between">
                  <span>{listing.name}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#051815] bg-[#C5A059] px-2 py-0.5 rounded-full">
                    {getCategoryLabel(listing.category)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Registered Address</label>
                <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300">
                  {listing.address}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="website" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Official Website or Facebook/Social Page *</label>
                  <label className="flex items-center gap-1.5 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="accent-cyan-400 w-3 h-3 cursor-pointer"
                      checked={website === "I don't have a website or social media page"}
                      onChange={(e) => {
                        if (e.target.checked) setWebsite("I don't have a website or social media page");
                        else setWebsite("");
                      }}
                    />
                    <span className="text-[10px] text-slate-500 group-hover:text-slate-300 transition-colors">I don't have one</span>
                  </label>
                </div>
                <input 
                  type="url" 
                  id="website"
                  placeholder="https://example.com or https://facebook.com/business"
                  value={website === "I don't have a website or social media page" ? "" : website}
                  onChange={(e) => setWebsite(e.target.value)}
                  disabled={website === "I don't have a website or social media page"}
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-400 focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Mobile / WhatsApp *</label>
                <input 
                  type="tel" 
                  id="phone"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-[#C5A059] focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors"
                  required
                />
              </div>
            </div>
          )}



          {step === 5 && (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-400 border border-green-500/30 animate-pulse">
                <Icons.CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Claim Request Filed & Payment Received!</h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Your payment was successful and verification file is submitted. Our moderation board will audit your details. We will email setup details to <strong className="text-white">{email}</strong> within 24 hours.
                </p>
              </div>
              
              <div className="w-full bg-cyan-400/5 border border-cyan-400/20 rounded-2xl p-4 text-left flex items-start gap-3 mt-4">
                <Icons.ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  <strong>SSO Integration Note:</strong> Since central SSO registration is offline, your email/phone has been staged for whitelist clearance. No immediate password is required.
                </p>
              </div>

              <button 
                onClick={onClose}
                className="px-6 py-3 btn-primary-cyan font-bold rounded-xl hover:opacity-90 transition-all text-xs uppercase tracking-wider mt-6 w-full"
              >
                Close Verification portal
              </button>
            </div>
          )}
        </div>

        {/* Wizard Footer controls */}
        {step < 5 && step > 0 && (
          <div className="px-6 py-4 bg-[#0A2520] border-t border-[#C5A059]/20 flex justify-between items-center">
            <div />
            <button 
              type="submit" 
              disabled={isSubmitting || !phone.trim() || !website.trim()}
              onClick={handleSubmit}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#8A5A00] text-[#051815] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shadow-lg hover:shadow-[0_0_15px_rgba(197,160,89,0.3)] w-full"
            >
              {isSubmitting ? (
                <>
                  <Icons.Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Icons.CheckCircle2 className="w-4 h-4" />
                  <span>Submit Claim Request</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
