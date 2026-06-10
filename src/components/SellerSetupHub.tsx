"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc, runTransaction } from "firebase/firestore";
import ImageUploader from "@/components/ImageUploader";
import { uploadBase64ToStorage } from "@/app/dashboard/page"; // Reuse the upload utility

interface SellerSetupHubProps {
  userRole: string;
}

type TicketStatus = "todo" | "in_progress" | "completed";

export default function SellerSetupHub({ userRole }: SellerSetupHubProps) {
  const [activeTicket, setActiveTicket] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<any>({});

  // Form States
  // Profile
  const [desiredRole, setDesiredRole] = useState("weaver");
  const [personalName, setPersonalName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [storeName, setStoreName] = useState("");
  
  // Address
  const [address, setAddress] = useState("");
  const [townVillage, setTownVillage] = useState("");
  const [block, setBlock] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("Odisha");
  const [pin, setPin] = useState("");

  // KYC
  const [kycType, setKycType] = useState("");
  const [kycId, setKycId] = useState("");
  const [kycDocumentUrl, setKycDocumentUrl] = useState("");

  // Bank
  const [bankHolder, setBankHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankUpi, setBankUpi] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      try {
        const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);
          
          setDesiredRole(data.desiredRole || "weaver");
          setPersonalName(data.personalName || data.name || "");
          setPhone(data.phone || "");
          setWhatsapp(data.whatsapp || "");
          setStoreName(data.storeName || "");

          setAddress(data.address || "");
          setTownVillage(data.townVillage || "");
          setBlock(data.block || "");
          setDistrict(data.district || "");
          setState(data.state || "Odisha");
          setPin(data.pin || "");

          setKycType(data.kycType || "");
          setKycId(data.kycId || "");
          setKycDocumentUrl(data.kycDocumentUrl || "");

          setBankHolder(data.bankHolder || "");
          setBankName(data.bankName || "");
          setBankAccount(data.bankAccount || "");
          setBankIfsc(data.bankIfsc || "");
          setBankUpi(data.bankUpi || "");
        }
      } catch (err) {
        console.error("Error fetching setup data:", err);
      }
      setIsLoading(false);
    };
    
    // Slight delay to ensure auth is loaded if coming directly
    setTimeout(fetchUserData, 500);
  }, []);

  // Compute status for each ticket
  const getProfileStatus = (): TicketStatus => {
    if (personalName && phone && whatsapp && desiredRole) return "completed";
    if (personalName || phone) return "in_progress";
    return "todo";
  };

  const getAddressStatus = (): TicketStatus => {
    if (address && townVillage && district && pin) return "completed";
    if (address || district) return "in_progress";
    return "todo";
  };

  const getKycStatus = (): TicketStatus => {
    if (kycType && kycId && kycDocumentUrl) return "completed";
    if (kycType || kycId) return "in_progress";
    return "todo";
  };

  const getBankStatus = (): TicketStatus => {
    if (bankHolder && bankName && bankAccount && bankIfsc) return "completed";
    if (bankHolder || bankAccount) return "in_progress";
    return "todo";
  };

  const tickets = [
    { id: "profile", title: "Profile & Role", icon: "👤", status: getProfileStatus(), desc: "Your name, role, and contact info." },
    { id: "address", title: "Business Address", icon: "📍", status: getAddressStatus(), desc: "Where you operate from." },
    { id: "kyc", title: "KYC Documents", icon: "🛡️", status: getKycStatus(), desc: "Identity verification for payouts." },
    { id: "bank", title: "Bank Details", icon: "🏦", status: getBankStatus(), desc: "Where we send your earnings." }
  ];

  const completedCount = tickets.filter(t => t.status === "completed").length;
  const totalCount = tickets.length;
  const progressPercent = (completedCount / totalCount) * 100;
  const canSubmitApplication = completedCount === totalCount;

  const handleSaveTicket = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    
    try {
      const updates: any = {};
      
      if (activeTicket === "profile") {
        updates.desiredRole = desiredRole;
        updates.personalName = personalName;
        updates.phone = phone;
        updates.whatsapp = whatsapp;
        updates.storeName = storeName;
      } else if (activeTicket === "address") {
        updates.address = address;
        updates.townVillage = townVillage;
        updates.block = block;
        updates.district = district;
        updates.state = state;
        updates.pin = pin;
      } else if (activeTicket === "kyc") {
        let finalKycUrl = kycDocumentUrl;
        if (kycDocumentUrl && kycDocumentUrl.startsWith("data:image")) {
          finalKycUrl = await uploadBase64ToStorage(kycDocumentUrl, `kyc/${auth.currentUser.uid}`);
          setKycDocumentUrl(finalKycUrl);
        }
        updates.kycType = kycType;
        updates.kycId = kycId;
        updates.kycDocumentUrl = finalKycUrl;
      } else if (activeTicket === "bank") {
        updates.bankHolder = bankHolder;
        updates.bankName = bankName;
        updates.bankAccount = bankAccount;
        updates.bankIfsc = bankIfsc;
        updates.bankUpi = bankUpi;
      }

      await updateDoc(doc(db, "users", auth.currentUser.uid), updates);
      
      // Close modal and trick re-render to update progress
      setActiveTicket(null);
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save. Please try again.");
    }
    
    setIsSaving(false);
  };

  const handleSubmitApplication = async () => {
    if (!auth.currentUser || !canSubmitApplication) return;
    if (!confirm("Are you sure you want to submit your application? An Admin will review it shortly.")) return;
    
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        applicationStatus: "pending_approval",
        role: desiredRole
      });

      // Generate Serial Slug starting from 303
      let generatedSlug = "303";
      try {
        const counterRef = doc(db, "system", "slug_counters");
        generatedSlug = await runTransaction(db, async (transaction) => {
          const counterDoc = await transaction.get(counterRef);
          const currentCount = counterDoc.exists() ? (counterDoc.data()[desiredRole] || 303) : 303;
          const nextCount = currentCount + 1;
          transaction.set(counterRef, { [desiredRole]: nextCount }, { merge: true });
          return currentCount.toString();
        });
      } catch (e) {
        // Fallback to random number if transaction fails
        generatedSlug = (303 + Math.floor(Math.random() * 9000)).toString();
      }
      
      // Create a pending profile in the respective collection so the dashboard works
      const collectionName = desiredRole === "weaver" ? "weavers" : desiredRole === "vendor" ? "vendors" : "resellers";
      
      const docRef = doc(db, collectionName, auth.currentUser.uid);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        await setDoc(docRef, {
          slug: generatedSlug,
          title: storeName || personalName,
          status: "pending_approval",
          isAutoApproved: false
        });
      }
      alert("Application submitted successfully! You will be notified once an Admin approves your account.");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Failed to submit application.");
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="p-8 border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-2xl text-center">
        <h3 className="text-lg font-bold text-blue-900 mb-2">Loading your setup tickets...</h3>
      </div>
    );
  }

  // If already applied
  if (userData?.applicationStatus === "pending_approval") {
    return (
      <div className="bg-yellow-50 p-8 rounded-3xl border border-yellow-200 text-center animate-in fade-in">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-2xl font-bold text-yellow-900 mb-2">Application Under Review</h2>
        <p className="text-yellow-700 font-medium">
          You have successfully submitted all required documents. An Admin is currently reviewing your application. You will be notified once approved.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Progress Section */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-[#0070F3]"></div>
        <h3 className="text-sm font-bold text-gray-900 mb-2">Setup Progress</h3>
        <p className="text-xs text-gray-500 mb-4 font-medium text-center">
          Complete all 4 tickets to submit your application.
        </p>
        <div className="w-full max-w-lg bg-gray-100 rounded-full h-3 mb-2 overflow-hidden shadow-inner">
          <div 
            className="bg-[#0070F3] h-3 rounded-full transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(0,112,243,0.5)]" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">{progressPercent}% Complete</span>
      </div>

      {/* Ticket Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tickets.map(ticket => (
          <button
            key={ticket.id}
            onClick={() => setActiveTicket(ticket.id)}
            className={`flex items-center p-5 rounded-2xl border text-left transition-all group ${
              ticket.status === "completed" 
                ? "bg-gray-50 border-gray-200 hover:border-gray-300" 
                : ticket.status === "in_progress"
                ? "bg-blue-50 border-[#0070F3] shadow-[0_4px_14px_0_rgba(0,112,243,0.1)]"
                : "bg-white border-gray-200 hover:border-[#0070F3] hover:shadow-md"
            }`}
          >
            <div className="text-3xl mr-4 group-hover:scale-110 transition-transform">{ticket.icon}</div>
            <div className="flex-1">
              <h4 className={`font-bold ${ticket.status === "in_progress" ? "text-[#0070F3]" : "text-gray-900"}`}>{ticket.title}</h4>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{ticket.desc}</p>
            </div>
            <div className="ml-2">
              {ticket.status === "completed" && <span className="text-green-500 text-xl drop-shadow-sm">✅</span>}
              {ticket.status === "in_progress" && <span className="text-[#0070F3] text-xl font-bold">→</span>}
              {ticket.status === "todo" && <span className="text-gray-300 group-hover:text-[#0070F3] transition-colors text-xl font-bold">→</span>}
            </div>
          </button>
        ))}
      </div>

      {/* Submit Application Button */}
      {canSubmitApplication && (
        <div className="flex justify-center pt-4">
          <button 
            onClick={handleSubmitApplication}
            disabled={isSaving}
            className="px-8 py-4 bg-[#0070F3] text-white font-bold rounded-full shadow-lg shadow-blue-500/30 hover:bg-[#005BB5] hover:-translate-y-1 transition-all text-sm uppercase tracking-wider disabled:opacity-50"
          >
            {isSaving ? "Submitting..." : "Submit Application for Review"}
          </button>
        </div>
      )}

      {/* Slide-out Drawer Modal */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={() => setActiveTicket(null)}></div>
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300 border-l border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>{tickets.find(t => t.id === activeTicket)?.icon}</span>
                {tickets.find(t => t.id === activeTicket)?.title}
              </h2>
              <button 
                onClick={() => setActiveTicket(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              
              {/* === PROFILE FORM === */}
              {activeTicket === "profile" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">I want to become a:</label>
                    <select 
                      value={desiredRole} 
                      onChange={(e) => setDesiredRole(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none transition-all bg-white font-medium"
                    >
                      <option value="weaver">Master Weaver (Produce & Sell)</option>
                      <option value="vendor">Vendor / Shop (Aggregator)</option>
                      <option value="reseller">Reseller (Dropship for Commission)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Legal Name</label>
                    <input type="text" value={personalName} onChange={e => setPersonalName(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" placeholder="e.g. Ramesh Meher" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Brand / Store Name</label>
                    <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" placeholder="e.g. Meher Handlooms" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" placeholder="+91" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">WhatsApp Number</label>
                    <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" placeholder="+91" />
                  </div>
                </div>
              )}

              {/* === ADDRESS FORM === */}
              {activeTicket === "address" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Street Address</label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" placeholder="House/Shop no., Street" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Village / Town</label>
                      <input type="text" value={townVillage} onChange={e => setTownVillage(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Block</label>
                      <input type="text" value={block} onChange={e => setBlock(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">District</label>
                      <input type="text" value={district} onChange={e => setDistrict(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">PIN Code</label>
                      <input type="text" value={pin} onChange={e => setPin(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* === KYC FORM === */}
              {activeTicket === "kyc" && (
                <div className="space-y-5">
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-xs text-yellow-800 font-medium mb-4">
                    Your documents are stored securely and are only used to verify your identity for direct payouts.
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Document Type</label>
                    <select 
                      value={kycType} 
                      onChange={e => setKycType(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none bg-white"
                    >
                      <option value="">Select Document</option>
                      <option value="Aadhar">Aadhar Card</option>
                      <option value="PAN">PAN Card</option>
                      <option value="GST">GST Certificate (Vendors)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Document ID Number</label>
                    <input type="text" value={kycId} onChange={e => setKycId(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none uppercase" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Upload Clear Photo</label>
                    <ImageUploader 
                      value={kycDocumentUrl} 
                      onChange={setKycDocumentUrl}
                      label="KYC Document"
                      aspectRatio="landscape"
                    />
                  </div>
                </div>
              )}

              {/* === BANK FORM === */}
              {activeTicket === "bank" && (
                <div className="space-y-5">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-xs text-green-800 font-medium mb-4">
                    Profits from your sales will be auto-transferred to this account securely.
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account Holder Name</label>
                    <input type="text" value={bankHolder} onChange={e => setBankHolder(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bank Name</label>
                    <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account Number</label>
                    <input type="text" value={bankAccount} onChange={e => setBankAccount(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">IFSC Code</label>
                    <input type="text" value={bankIfsc} onChange={e => setBankIfsc(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none uppercase" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">UPI ID (Optional)</label>
                    <input type="text" value={bankUpi} onChange={e => setBankUpi(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" placeholder="phone@upi" />
                  </div>
                </div>
              )}

            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-white flex gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
              <button 
                onClick={() => setActiveTicket(null)} 
                disabled={isSaving}
                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveTicket}
                disabled={isSaving}
                className="flex-1 py-3 bg-[#0070F3] text-white rounded-xl font-bold text-sm hover:bg-[#005BB5] shadow-sm shadow-[#0070F3]/30 transition-all disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
