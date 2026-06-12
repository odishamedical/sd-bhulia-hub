"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/context/AuthContext";
import { INDIAN_STATES, ODISHA_DISTRICTS, WEAVER_DISTRICTS } from "@/lib/locations";

function VerifyContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  const urlType = searchParams?.get("type") || "business";
  const urlName = searchParams?.get("name");

  const isClaiming = !!id;

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [businessName, setBusinessName] = useState(urlName || "");
  
  // Address State
  const [state, setState] = useState("Odisha");
  const [district, setDistrict] = useState("");
  const [pincode, setPincode] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  
  const [gst, setGst] = useState("");
  const [role, setRole] = useState(urlType);
  const [documentId, setDocumentId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#051815] font-sans py-20 px-4 relative overflow-hidden flex items-center justify-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[#C5A059]/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="bg-[#0B2B26] border border-[#C5A059]/20 rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-2xl relative z-10">
          <div className="w-20 h-20 bg-[#051815] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#C5A059]/30 shadow-inner">
            <svg className="w-8 h-8 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#C5A059] mb-4">Authentication Required</h2>
          <p className="text-gray-300 text-sm mb-8 leading-relaxed">
            You must be logged into your Bhulia.com account to {isClaiming ? "claim this business" : "register a new business"}. This ensures your business profile is securely linked to you.
          </p>
          <button 
            onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/verify${id ? `?id=${id}&name=${urlName}&type=${urlType}` : ''}`)}`)}
            className="bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A1021] font-bold text-sm uppercase tracking-widest px-10 py-4 rounded-full transition-all shadow-lg hover:-translate-y-1 w-full"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload a verification document.");
      return;
    }
    setIsSubmitting(true);

    try {
      // 1. Upload File
      const fileExt = file.name.split('.').pop();
      const fileName = `verification_documents/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const storageRef = ref(storage, fileName);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // 2. Save to Firestore
      await addDoc(collection(db, "verification_requests"), {
        ownerId: user.uid,
        targetProfileId: id || null,
        ownerName,
        email,
        whatsapp,
        businessName,
        state,
        district,
        pincode,
        streetAddress,
        gst: gst || null,
        role,
        documentId,
        documentUrl: downloadURL,
        status: "pending",
        createdAt: serverTimestamp()
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting verification:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
            Thank you for {isClaiming ? "claiming" : "registering"} your business. Our team will review your submitted documents and contact you on your registered WhatsApp number within 24-48 hours.
          </p>
          <Link href="/directory" className="inline-block bg-[#C5A059] hover:bg-[#D4AF37] text-[#051815] font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full transition-all shadow-lg hover:-translate-y-1">
            Return to Directory
          </Link>
        </div>
      </div>
    );
  }

  const getDistrictOptions = () => {
    if (state === "Odisha") {
      return role === "weaver" ? WEAVER_DISTRICTS : ODISHA_DISTRICTS;
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-[#051815] font-sans py-20 px-4 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[#C5A059]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C5A059] mb-4">
            {isClaiming ? "Claim & Verify Your Business" : "Register & Verify Your Business"}
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto">
            {isClaiming ? `You are claiming the profile for ${urlName}. ` : "Register a new profile for your business. "}
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
                  <input required value={ownerName} onChange={(e) => setOwnerName(e.target.value)} type="text" className="w-full bg-[#051815] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none transition-colors" placeholder="Owner's Name" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">Email Address</label>
                  <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full bg-[#051815] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none transition-colors" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">WhatsApp Number</label>
                  <input required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} type="tel" className="w-full bg-[#051815] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none transition-colors" placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h3 className="text-[#C5A059] font-bold uppercase tracking-widest text-xs mb-4 border-b border-[#C5A059]/20 pb-2">2. Business Details</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">Business/Shop Name</label>
                  <input required value={businessName} onChange={(e) => setBusinessName(e.target.value)} type="text" className="w-full bg-[#051815] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none transition-colors" placeholder="E.g. Shyam Dash Creations" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">State</label>
                    <select value={state} onChange={(e) => { setState(e.target.value); setDistrict(""); }} className="w-full bg-[#051815] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none transition-colors cursor-pointer">
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">District / City</label>
                    {state === "Odisha" ? (
                      <select required value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full bg-[#051815] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none transition-colors cursor-pointer">
                        <option value="">Select District</option>
                        {getDistrictOptions().map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    ) : (
                      <input required value={district} onChange={(e) => setDistrict(e.target.value)} type="text" className="w-full bg-[#051815] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none transition-colors" placeholder="Enter District/City" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">Pincode</label>
                    <input required value={pincode} onChange={(e) => setPincode(e.target.value)} type="text" className="w-full bg-[#051815] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none transition-colors" placeholder="6-digit Pincode" />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">Business Role</label>
                    <select required value={role} onChange={(e) => { setRole(e.target.value); if(state === "Odisha") setDistrict(""); }} className="w-full bg-[#051815] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none transition-colors cursor-pointer">
                      <option value="">Select Role</option>
                      <option value="weaver">Master Weaver</option>
                      <option value="vendor">Retail Store</option>
                      <option value="wholesaler">B2B Wholesaler</option>
                      <option value="raw_material">Raw Material Supplier</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">Street Address</label>
                  <textarea required value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} className="w-full bg-[#051815] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none transition-colors h-20" placeholder="Shop number, street, landmark..."></textarea>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">GST Number (Optional)</label>
                  <input value={gst} onChange={(e) => setGst(e.target.value)} type="text" className="w-full bg-[#051815] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none transition-colors" placeholder="GSTIN" />
                </div>
                
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h3 className="text-[#C5A059] font-bold uppercase tracking-widest text-xs mb-4 border-b border-[#C5A059]/20 pb-2">3. Verification Documents</h3>
              
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-semibold mb-2">Document ID / Serial Number</label>
                <input required value={documentId} onChange={(e) => setDocumentId(e.target.value)} type="text" className="w-full bg-[#051815] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#C5A059] outline-none transition-colors" placeholder="E.g. Aadhar Number, Trade License No." />
                <p className="text-gray-500 text-xs mt-2">We securely store this ID even if the uploaded photo is later deleted.</p>
              </div>

              <div className="bg-[#051815] border border-dashed border-gray-600 rounded-2xl p-8 text-center hover:border-[#C5A059] transition-colors cursor-pointer group relative">
                <input 
                  type="file" 
                  required 
                  accept=".pdf,image/*"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#C5A059]/20 transition-colors">
                  <span className="text-2xl">{file ? "✅" : "📄"}</span>
                </div>
                <p className="text-white font-semibold mb-1">{file ? file.name : "Click to upload Trade License, Udyam Aadhar, or Weaver ID"}</p>
                <p className="text-gray-500 text-xs">PDF, JPG, or PNG (Max 5MB)</p>
              </div>
            </div>

          </div>

          <div className="mt-10 border-t border-[#C5A059]/20 pt-8 text-center">
            <button disabled={isSubmitting} type="submit" className="bg-[#C5A059] hover:bg-[#D4AF37] disabled:opacity-50 text-[#051815] font-bold text-sm uppercase tracking-widest px-10 py-4 rounded-full transition-all shadow-lg hover:-translate-y-1 w-full md:w-auto flex items-center justify-center gap-2 mx-auto">
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#051815] border-t-transparent rounded-full animate-spin"></span>
                  Uploading...
                </>
              ) : (isClaiming ? "Submit Claim Request" : "Submit Registration")}
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
