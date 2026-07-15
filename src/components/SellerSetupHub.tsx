"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc, runTransaction } from "firebase/firestore";
import ImageUploader from "@/components/ImageUploader";
import { uploadBase64ToStorage } from "@/lib/storageUtils";
import { INDIAN_STATES, ODISHA_DISTRICTS, ODISHA_DISTRICT_BLOCKS, WEAVER_DISTRICTS } from "@/lib/locations";

interface SellerSetupHubProps {
  userRole: string;
}

export default function SellerSetupHub({ userRole }: SellerSetupHubProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<any>({});

  // Profile
  const [desiredRole, setDesiredRole] = useState("weaver");
  const [personalName, setPersonalName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [storeName, setStoreName] = useState("");
  
  // Address
  const [streetAddress, setStreetAddress] = useState("");
  const [cityTownVillage, setCityTownVillage] = useState("");
  const [block, setBlock] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("Odisha");
  const [pincode, setPincode] = useState("");

  // KYC
  const [kycType, setKycType] = useState("");
  const [kycId, setKycId] = useState("");
  const [kycDocumentUrl, setKycDocumentUrl] = useState("");
  const [gstNumber, setGstNumber] = useState("");

  // Bank
  const [bankHolder, setBankHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankUpi, setBankUpi] = useState("");

  // Marketing (Reseller Only)
  const [socialLinks, setSocialLinks] = useState("");
  const [followerCount, setFollowerCount] = useState("");
  const [whatsappGroupSize, setWhatsappGroupSize] = useState("");
  const [handloomExperience, setHandloomExperience] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const applyParam = params.get("apply");
      if (applyParam) {
        setDesiredRole(applyParam);
      }
    }

    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      try {
        const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);
          
          if (data.desiredRole) setDesiredRole(data.desiredRole);
          setPersonalName(data.personalName || data.name || "");
          setPhone(data.phone || "");
          setWhatsapp(data.whatsapp || "");
          setStoreName(data.storeName || "");

          setStreetAddress(typeof data.address === 'string' ? data.address : (data.address?.streetAddress || ""));
          setCityTownVillage(data.address?.cityTownVillage || data.townVillage || "");
          setBlock(data.address?.block || data.block || "");
          setDistrict(data.address?.district || data.district || "");
          setState(data.address?.state || data.state || "Odisha");
          setPincode(data.address?.pincode || data.pin || "");

          setKycType(data.kycType || "");
          setKycId(data.kycId || "");
          setKycDocumentUrl(data.kycDocumentUrl || "");
          setGstNumber(data.gst || "");

          setBankHolder(data.bankHolder || "");
          setBankName(data.bankName || "");
          setBankAccount(data.bankAccount || "");
          setBankIfsc(data.bankIfsc || "");
          setBankUpi(data.bankUpi || "");

          setSocialLinks(data.socialLinks || "");
          setFollowerCount(data.followerCount || "");
          setWhatsappGroupSize(data.whatsappGroupSize || "");
          setHandloomExperience(data.handloomExperience || "");
        }
      } catch (err) {
        console.error("Error fetching setup data:", err);
      }
      setIsLoading(false);
    };
    
    setTimeout(fetchUserData, 500);
  }, []);

  // Enforce Weaver Location Rule
  useEffect(() => {
    if (desiredRole === "weaver") {
      setState("Odisha");
      if (district && !WEAVER_DISTRICTS.includes(district)) {
        setDistrict("");
        setBlock("");
      }
    }
  }, [desiredRole, district]);

  // Handle District Change to reset Block
  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    setBlock("");
  };

  const steps = [
    { id: 1, title: "Profile", icon: "👤", isReady: !!(personalName && phone && whatsapp) },
    { id: 2, title: "Address", icon: "📍", isReady: !!(streetAddress && district && state && pincode) },
    { id: 3, title: "KYC", icon: "🛡️", isReady: !!(kycType && kycId && kycDocumentUrl) },
    { id: 4, title: "Bank", icon: "🏦", isReady: !!(bankHolder && bankName && bankAccount && bankIfsc) },
  ];

  if (desiredRole === "reseller") {
    steps.push({ id: 5, title: "Marketing", icon: "📈", isReady: !!(followerCount && socialLinks && handloomExperience) });
  }

  const totalSteps = steps.length;
  const isFinalStep = currentStep === totalSteps;
  const progressPercent = Math.round(((currentStep - 1) / totalSteps) * 100) + (isFinalStep ? (steps[totalSteps-1].isReady ? 100/totalSteps : 0) : 0);
  const canSubmitApplication = steps.every(s => s.isReady);

  const handleNextStep = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    
    try {
      const updates: any = {};
      
      if (currentStep === 1) {
        updates.desiredRole = desiredRole;
        updates.personalName = personalName;
        updates.phone = phone;
        updates.whatsapp = whatsapp;
        updates.storeName = storeName;
      } else if (currentStep === 2) {
        updates.address = {
          state,
          district,
          block,
          cityTownVillage,
          streetAddress,
          pincode
        };
      } else if (currentStep === 3) {
        let finalKycUrl = kycDocumentUrl;
        if (kycDocumentUrl && kycDocumentUrl.startsWith("data:image")) {
          finalKycUrl = await uploadBase64ToStorage(kycDocumentUrl, `kyc/${auth.currentUser.uid}`);
          setKycDocumentUrl(finalKycUrl);
        }
        updates.kycType = kycType;
        updates.kycId = kycId;
        updates.kycDocumentUrl = finalKycUrl;
        updates.gst = gstNumber;
      } else if (currentStep === 4) {
        updates.bankHolder = bankHolder;
        updates.bankName = bankName;
        updates.bankAccount = bankAccount;
        updates.bankIfsc = bankIfsc;
        updates.bankUpi = bankUpi;
      } else if (currentStep === 5) {
        updates.socialLinks = socialLinks;
        updates.followerCount = followerCount;
        updates.whatsappGroupSize = whatsappGroupSize;
        updates.handloomExperience = handloomExperience;
      }

      await setDoc(doc(db, "users", auth.currentUser.uid), updates, { merge: true });
      
      if (!isFinalStep) {
        setCurrentStep(prev => prev + 1);
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to auto-save. Please try again.");
    }
    
    setIsSaving(false);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmitApplication = async () => {
    if (!auth.currentUser || !canSubmitApplication) return;
    if (!confirm("Are you sure you want to submit your application? An Admin will review it shortly.")) return;
    
    setIsSaving(true);
    try {
      await handleNextStep(); // Save final step data

      await setDoc(doc(db, "users", auth.currentUser.uid), {
        applicationStatus: "pending_approval",
        role: desiredRole
      }, { merge: true });

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
        generatedSlug = (303 + Math.floor(Math.random() * 9000)).toString();
      }
      
      const collectionName = desiredRole === "weaver" ? "weavers" : (desiredRole === "store" || desiredRole === "b2b" || desiredRole === "raw_material") ? "stores" : "resellers";
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
        <h3 className="text-lg font-bold text-blue-900 mb-2">Loading your application...</h3>
      </div>
    );
  }

  if (userData?.applicationStatus === "pending_approval") {
    return (
      <div className="bg-yellow-50 p-8 rounded-3xl border border-yellow-200 text-center animate-in fade-in">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-2xl font-bold text-yellow-900 mb-2">Application Under Review</h2>
        <p className="text-yellow-700 font-medium">
          You have successfully submitted all required documents. An Admin is currently reviewing your application. You will be notified via WhatsApp and Email once approved.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
      
      {/* Progress Bar Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Setup Application</h2>
          <span className="text-xs font-bold text-[#0070F3] bg-blue-50 px-3 py-1 rounded-full">Step {currentStep} of {totalSteps}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner flex">
          <div 
            className="bg-[#0070F3] h-2 rounded-full transition-all duration-500 ease-in-out shadow-[0_0_10px_rgba(0,112,243,0.5)]" 
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-3">
          {steps.map(step => (
            <div 
              key={step.id} 
              className={`flex flex-col items-center flex-1 cursor-pointer transition-colors ${currentStep === step.id ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
              onClick={() => setCurrentStep(step.id)}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 mb-1 ${
                step.isReady ? 'bg-green-500 border-green-500 text-white' : 
                currentStep === step.id ? 'border-[#0070F3] text-[#0070F3]' : 'border-gray-300 text-gray-400'
              }`}>
                {step.isReady ? "✓" : step.id}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block ${currentStep === step.id ? 'text-[#0070F3]' : 'text-gray-500'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Area */}
      <div className="min-h-[350px]">
        {/* === STEP 1: PROFILE === */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in slide-in-from-right-4 fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Profile & Role</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">I want to apply as:</label>
              <select 
                value={desiredRole} 
                onChange={(e) => setDesiredRole(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none transition-all bg-white font-medium"
              >
                <option value="weaver">Master Weaver (Produce & Sell)</option>
                <option value="store">Store / Shop (Aggregator)</option>
                <option value="b2b">B2B Wholesaler</option>
                <option value="raw_material">Raw Material Supplier</option>
                <option value="reseller">Reseller (Dropship for Commission)</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
          </div>
        )}

        {/* === STEP 2: ADDRESS === */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in slide-in-from-right-4 fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Business Address</h3>
            
            {desiredRole === "weaver" && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-xs text-yellow-800 font-medium mb-4 flex items-start gap-2">
                <span className="text-lg">🎖️</span>
                <span><strong>Global Rule Enforcement:</strong> As a Master Weaver, you must be from one of the authentic GI-Tag regions in Odisha.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Street / Local Address</label>
              <input type="text" value={streetAddress} onChange={e => setStreetAddress(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" placeholder="House/Shop no., Street" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">State</label>
                <select 
                  value={state} 
                  onChange={e => setState(e.target.value)}
                  disabled={desiredRole === "weaver"}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none bg-white disabled:bg-gray-100"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">District</label>
                {state === "Odisha" ? (
                  <select 
                    value={district} 
                    onChange={e => handleDistrictChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none bg-white"
                  >
                    <option value="">Select District</option>
                    {(desiredRole === "weaver" ? WEAVER_DISTRICTS : ODISHA_DISTRICTS).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" value={district} onChange={e => handleDistrictChange(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" placeholder="Enter District" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Block / City</label>
                {state === "Odisha" && district && ODISHA_DISTRICT_BLOCKS[district] ? (
                  <select 
                    value={block} 
                    onChange={e => setBlock(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none bg-white"
                  >
                    <option value="">Select Block</option>
                    {ODISHA_DISTRICT_BLOCKS[district].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" value={block} onChange={e => setBlock(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" placeholder="Enter Block/City" />
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">PIN Code</label>
                <input type="text" value={pincode} onChange={e => setPincode(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" placeholder="XXXXXX" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Village / Town (Local Name)</label>
              <input type="text" value={cityTownVillage} onChange={e => setCityTownVillage(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" />
            </div>
          </div>
        )}

        {/* === STEP 3: KYC === */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in slide-in-from-right-4 fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Identity Verification</h3>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-800 font-medium mb-4">
              Your documents are stored securely and are only used to verify your identity for direct payouts and fraud prevention.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  <option value="GST">GST Certificate</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Document ID Number</label>
                <input type="text" value={kycId} onChange={e => setKycId(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none uppercase" placeholder="e.g. 1234 5678 9012" />
              </div>
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

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">GST Number (Optional)</label>
              <input type="text" value={gstNumber} onChange={e => setGstNumber(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none uppercase" placeholder="e.g. 21AAAAA1234A1Z1" />
            </div>
          </div>
        )}

        {/* === STEP 4: BANK === */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in slide-in-from-right-4 fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Bank Details</h3>
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-xs text-green-800 font-medium mb-4">
              Profits and commissions from your sales will be auto-transferred to this account securely.
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account Holder Name (must match KYC)</label>
              <input type="text" value={bankHolder} onChange={e => setBankHolder(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account Number</label>
                <input type="password" value={bankAccount} onChange={e => setBankAccount(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" placeholder="XXXX XXXX XXXX" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Re-Enter Account Number</label>
                <input type="text" value={bankAccount} onChange={e => setBankAccount(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bank Name</label>
                <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" placeholder="e.g. State Bank of India" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">IFSC Code</label>
                <input type="text" value={bankIfsc} onChange={e => setBankIfsc(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none uppercase" placeholder="SBIN000XXXX" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">UPI ID (Optional but recommended)</label>
              <input type="text" value={bankUpi} onChange={e => setBankUpi(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" placeholder="yourphone@ybl" />
            </div>
          </div>
        )}

        {/* === STEP 5: MARKETING (RESELLER ONLY) === */}
        {currentStep === 5 && desiredRole === "reseller" && (
          <div className="space-y-5 animate-in slide-in-from-right-4 fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Marketing Network</h3>
            <div className="bg-[#C5A059]/10 border border-[#C5A059]/30 p-4 rounded-xl text-xs text-[#996515] font-medium mb-4">
              To approve you as a Reseller, we need to understand your marketing strength and network.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Social Media Followers</label>
                <select 
                  value={followerCount} 
                  onChange={e => setFollowerCount(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none bg-white"
                >
                  <option value="">Select Range</option>
                  <option value="under_1k">Under 1,000</option>
                  <option value="1k_5k">1,000 - 5,000</option>
                  <option value="5k_20k">5,000 - 20,000</option>
                  <option value="over_20k">Over 20,000</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">WhatsApp Group/Community Size</label>
                <select 
                  value={whatsappGroupSize} 
                  onChange={e => setWhatsappGroupSize(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none bg-white"
                >
                  <option value="">Select Size</option>
                  <option value="no_group">No Group Yet</option>
                  <option value="under_100">Under 100 Members</option>
                  <option value="100_500">100 - 500 Members</option>
                  <option value="over_500">Over 500 Members</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Social Media Profile Links</label>
              <textarea 
                value={socialLinks} 
                onChange={e => setSocialLinks(e.target.value)} 
                rows={2}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" 
                placeholder="Paste Instagram, Facebook Page, or YouTube channel URLs here..."
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Previous Experience selling Handlooms?</label>
              <textarea 
                value={handloomExperience} 
                onChange={e => setHandloomExperience(e.target.value)} 
                rows={2}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-[#0070F3] outline-none" 
                placeholder="Briefly describe if you have sold Sambalpuri handlooms before, or your primary expected customers."
              ></textarea>
            </div>
          </div>
        )}

      </div>

      {/* Navigation Footer */}
      <div className="pt-6 border-t border-gray-100 flex items-center justify-between mt-8">
        {currentStep > 1 ? (
          <button 
            onClick={handlePrevStep}
            disabled={isSaving}
            className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 text-sm"
          >
            ← Previous
          </button>
        ) : <div></div>}

        {!isFinalStep ? (
          <button 
            onClick={handleNextStep}
            disabled={isSaving}
            className="px-8 py-3 bg-[#0070F3] text-white font-bold rounded-xl shadow-sm hover:bg-[#005BB5] hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
          >
            {isSaving ? "Saving..." : "Save & Next →"}
          </button>
        ) : (
          <button 
            onClick={handleSubmitApplication}
            disabled={isSaving || !canSubmitApplication}
            className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-sm hover:bg-green-700 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 text-sm"
          >
            {isSaving ? "Submitting..." : "Submit Final Application 🚀"}
          </button>
        )}
      </div>

    </div>
  );
}
