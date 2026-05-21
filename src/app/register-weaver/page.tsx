"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const GI_DISTRICTS = [
  "Bargarh",
  "Sonepur (Subarnapur)",
  "Sambalpur",
  "Balangir",
  "Boudh",
  "Kalahandi",
  "Nuapada"
];

const SPECIALIZATIONS = [
  "Sarees",
  "Dress Material",
  "Dupatta",
  "Fabrics",
  "Others"
];

const PRODUCT_CATEGORIES = [
  "Sambalpuri Saree",
  "Ikat Fabric",
  "Handloom Accessories"
];

export default function WeaverRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = () => {
      const email = localStorage.getItem("sd_current_user_email");
      const name = localStorage.getItem("sd_current_user_name");
      const avatar = localStorage.getItem("sd_current_user_avatar");
      const role = localStorage.getItem("sd_current_user_role");

      if (email) {
        setUserName(name || email.split("@")[0]);
        setUserAvatar(avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80");
        setUserRole(role || "user");
      } else {
        setUserName(null);
        setUserAvatar(null);
        setUserRole(null);
      }
    };

    checkAuth();
    window.addEventListener("sd_auth_change", checkAuth);
    return () => window.removeEventListener("sd_auth_change", checkAuth);
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    contactNumber: "",
    emailAddress: "",
    address: "",
    district: GI_DISTRICTS[0],
    weaverId: "", // Optional
    govIdFile: null as File | null,
    govIdFileName: "",
    experienceYears: "",
    specializations: [] as string[],
    primaryCategory: PRODUCT_CATEGORIES[0],
    productDescription: "",
    priceMin: "",
    priceMax: "",
    currency: "INR",
    availableStock: "",
    productImages: [] as { name: string; type: string }[],
    gstNumber: "", // Optional
    giCertFile: null as File | null,
    giCertFileName: "", // Optional
    bankAccountNo: "",
    bankIfsc: "",
    bankName: "",
    consentAuthentic: false,
    consentTerms: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: "consentAuthentic" | "consentTerms") => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSpecializationToggle = (spec: string) => {
    setFormData((prev) => {
      const alreadySelected = prev.specializations.includes(spec);
      const updated = alreadySelected
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec];
      return { ...prev, specializations: updated };
    });
  };

  // Mock File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "govIdFile" | "giCertFile") => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        [fieldName]: file,
        [`${fieldName}Name`]: file.name
      }));
    }
  };

  // Mock Multi-Image Upload
  const handleMultiImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files).map((f) => ({
        name: f.name,
        type: f.type
      }));
      setFormData((prev) => ({
        ...prev,
        productImages: [...prev.productImages, ...filesArray]
      }));
    }
  };

  const validateStep = () => {
    setValidationError(null);
    if (currentStep === 1) {
      if (!formData.fullName.trim()) return "Full Name is required.";
      if (!formData.businessName.trim()) return "Business or Weaver Group Name is required.";
      if (!formData.contactNumber.trim()) return "Contact Number is required.";
      if (!formData.emailAddress.trim()) return "Email Address is required.";
      if (!formData.address.trim()) return "Postal Address is required.";
    } else if (currentStep === 2) {
      if (!formData.govIdFileName) return "Please upload an official Government ID Proof.";
      if (!formData.experienceYears || parseInt(formData.experienceYears) < 0) return "Please enter valid years of experience.";
      if (formData.specializations.length === 0) return "Please select at least one specialization.";
    } else if (currentStep === 3) {
      if (!formData.productDescription.trim()) return "Please provide a brief craft/product description.";
      if (!formData.priceMin || !formData.priceMax) return "Please enter a valid price range.";
      if (parseFloat(formData.priceMin) > parseFloat(formData.priceMax)) return "Minimum price cannot be greater than maximum price.";
      if (!formData.availableStock || parseInt(formData.availableStock) < 0) return "Please specify initial available stock.";
      if (formData.productImages.length < 3) return "Please upload at least 3 images (Profile, Loom, and Product sample).";
    } else if (currentStep === 4) {
      if (!formData.bankAccountNo.trim()) return "Bank Account Number is required.";
      if (!formData.bankIfsc.trim()) return "Bank IFSC Code is required.";
      if (!formData.bankName.trim()) return "Bank Name is required.";
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) {
      setValidationError(err);
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setValidationError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consentAuthentic || !formData.consentTerms) {
      setValidationError("You must agree to the authenticity statement and marketplace terms.");
      return;
    }

    // Save to localstorage for demo and trigger success
    const submissions = JSON.parse(localStorage.getItem("sd_weaver_applications") || "[]");
    submissions.push({
      ...formData,
      id: "APP-" + Date.now(),
      appliedAt: new Date().toISOString(),
      status: "pending_verification"
    });
    localStorage.setItem("sd_weaver_applications", JSON.stringify(submissions));

    setFormSubmitted(true);
  };

  return (
    <main className="relative flex-1 w-full bg-[#051815] text-white font-sans flex flex-col min-h-screen">
      
      {/* Top Sticky Header */}
      <header className="sticky top-0 w-full z-50 bg-[#0B2B26] border-b border-[#C5A059]/40 px-4 sm:px-6 py-3 sm:py-4 shadow-lg flex flex-col gap-3">
        <div className="flex justify-between items-center gap-2 w-full">
          {/* Left Side: Gold Logo, Bhulia.com & Slogan */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
            <div className="relative w-8 sm:w-14 h-8 sm:h-14 rounded-full overflow-hidden border border-[#C5A059] sm:border-2 shadow-[0_0_20px_rgba(197,160,89,0.6)] shrink-0">
              <Image src="/bhulia_logo_final.jpg" alt="Bhulia Gold Logo" fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <Link href="/">
                <h1 className="text-lg sm:text-2xl font-serif font-bold tracking-wider text-[#C5A059] leading-none hover:opacity-80 transition-opacity">BHULIA.COM</h1>
              </Link>
              <p className="hidden sm:block text-[11px] text-gray-300 font-medium tracking-wide mt-1 truncate">Sambalpuri Saree, Direct from Weavers</p>
            </div>
          </div>

          {/* Center: Dedicated Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-200">
            <Link href="/" className="hover:text-[#C5A059] transition-colors pb-1">Home</Link>
            <Link href="/#weaver-boutiques" className="hover:text-[#C5A059] transition-colors pb-1">Weaver Boutiques</Link>
            <Link href="/" className="hover:text-[#C5A059] transition-colors pb-1">About Us</Link>
            <Link href="/" className="hover:text-[#C5A059] transition-colors pb-1">Contact Us</Link>
          </nav>

          {/* Right Side: User Menu / Sign In / Register (Desktop) & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {userAvatar ? (
              <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1 sm:py-2 bg-[#0A3A35] rounded-xl border border-[#C5A059]/50 shadow-inner shrink-0">
                <img src={userAvatar} alt="User Avatar" className="w-6 sm:w-8 h-6 sm:h-8 rounded-full border border-[#C5A059]" />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-none">{userName}</span>
                  <span className="text-[9px] text-[#C5A059] uppercase tracking-widest mt-0.5">{userRole}</span>
                </div>
              </div>
            ) : (
              <a href="https://sd-auth-center.vercel.app" className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(197,160,89,0.4)] hover:brightness-110 transition-all cursor-pointer shrink-0">
                <svg className="w-3.5 h-3.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                <span>Sign In / Register</span>
              </a>
            )}

            {/* Mobile Hamburger Button */}
            <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="lg:hidden flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] rounded-xl hover:bg-[#0D4B45] transition-all cursor-pointer shrink-0 shadow">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileNavOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden sticky top-[57px] z-40 bg-[#0B2B26]/98 backdrop-blur-md border-b border-[#C5A059]/40 px-6 py-6 space-y-4 shadow-2xl animate-fadeIn">
          <div className="flex flex-col space-y-3 text-xs font-bold uppercase tracking-widest text-gray-200">
            <Link href="/" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Home</Link>
            <Link href="/#weaver-boutiques" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Weaver Boutiques</Link>
            <Link href="/" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">About Us</Link>
            <Link href="/" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] pb-1 block">Contact Us</Link>

            {/* Mobile-Only Dedicated Sign In in Drawer */}
            {!userAvatar && (
              <a href="https://sd-auth-center.vercel.app" onClick={() => setMobileNavOpen(false)} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow">
                <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                <span>Sign In / Register</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 max-w-[800px] w-full mx-auto px-4 py-12 flex flex-col justify-center">
        
        {/* Progress Stepper Indicator */}
        {!formSubmitted && (
          <div className="mb-10 w-full">
            <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#C5A059] mb-4">
              <span>Step {currentStep} of 5</span>
              <span>
                {currentStep === 1 && "Business Details"}
                {currentStep === 2 && "Artisan Profile"}
                {currentStep === 3 && "Weaving Inventory"}
                {currentStep === 4 && "Compliance & Banking"}
                {currentStep === 5 && "Review & Submit"}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#0A3A35] rounded-full overflow-hidden border border-[#C5A059]/10">
              <div 
                className="h-full bg-gradient-to-r from-[#996515] to-[#C5A059] transition-all duration-300"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Form Body Box */}
        <div className="bg-[#0B2B26]/80 backdrop-blur-md border border-[#C5A059]/40 rounded-3xl p-6 sm:p-10 shadow-2xl">
          
          {formSubmitted ? (
            // Thank You State
            <div className="text-center py-8 space-y-6">
              <div className="w-20 h-20 bg-green-500/10 border border-green-500 text-green-400 rounded-full flex items-center justify-center mx-auto text-4xl shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                ✓
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#C5A059] font-bold">Application Received!</h2>
              <div className="text-gray-300 text-sm max-w-md mx-auto leading-relaxed space-y-3">
                <p>
                  Thank you, <strong>{formData.fullName}</strong>. Your registration for <strong>{formData.businessName}</strong> has been logged.
                </p>
                <p className="bg-[#0A3A35] py-2.5 px-4 rounded-xl border border-[#C5A059]/20 text-xs font-mono text-[#C5A059]">
                  Application ID: APP-{Date.now().toString().slice(-6)}
                </p>
                <p className="text-xs">
                  We verify every weaver personally. A Bhulia.com cluster specialist will contact you on <strong>{formData.contactNumber}</strong> to schedule an on-loom audit and activate your dynamic storefront.
                </p>
              </div>
              <div className="pt-6">
                <Link href="/" className="bhulia-gold-button px-8 py-3 text-[#0A1021] font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all">
                  Return to Homepage
                </Link>
              </div>
            </div>
          ) : (
            // Form Steps
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Alert Validation Error */}
              {validationError && (
                <div className="bg-red-950/40 border border-red-500/60 rounded-xl p-3 text-red-300 text-xs font-semibold flex items-center gap-2">
                  <span className="text-sm">⚠️</span> {validationError}
                </div>
              )}

              {/* STEP 1: Personal & Business Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-[#C5A059]/25 pb-3">
                    <h3 className="text-lg font-serif font-bold text-[#C5A059]">Section 1: Contact & District Details</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Tell us about you and your weaving business</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Full Name</label>
                      <input 
                        type="text" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="e.g. Kishore Kumar Meher"
                        className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Business / Weaver Guild Name</label>
                      <input 
                        type="text" 
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        placeholder="e.g. Barpali Ikat Cooperative Society"
                        className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Contact Number (WhatsApp preferred)</label>
                      <input 
                        type="tel" 
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        placeholder="e.g. +91 94370 12345"
                        className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Email Address</label>
                      <input 
                        type="email" 
                        name="emailAddress"
                        value={formData.emailAddress}
                        onChange={handleInputChange}
                        placeholder="e.g. kishore.meher@gmail.com"
                        className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Postal Address</label>
                    <textarea 
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Street address, Weaver Colony, Village..."
                      className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Weaving District / State (GI Tag Belt Only)</label>
                    <select 
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                    >
                      {GI_DISTRICTS.map((dist) => (
                        <option key={dist} value={dist}>{dist}, Odisha</option>
                      ))}
                    </select>
                    <p className="text-[9px] text-gray-400 italic">Pre-filtered to the seven official Geographical Indication (GI) protected districts for Sambalpuri handloom.</p>
                  </div>
                </div>
              )}

              {/* STEP 2: Weaver Identification */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-[#C5A059]/25 pb-3">
                    <h3 className="text-lg font-serif font-bold text-[#C5A059]">Section 2: Weaver Identification</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Verify your artisan credentials</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold flex justify-between">
                      <span>Weaver ID / Cooperative Membership No.</span>
                      <span className="text-gray-400 lowercase font-normal italic">Optional</span>
                    </label>
                    <input 
                      type="text" 
                      name="weaverId"
                      value={formData.weaverId}
                      onChange={handleInputChange}
                      placeholder="e.g. PWCS-OD-BARPALI-449"
                      className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Years of Weaving Experience</label>
                    <input 
                      type="number" 
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleInputChange}
                      placeholder="e.g. 15"
                      className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block">Weaving Specialization</label>
                    <div className="flex flex-wrap gap-2">
                      {SPECIALIZATIONS.map((spec) => {
                        const isSelected = formData.specializations.includes(spec);
                        return (
                          <button
                            key={spec}
                            type="button"
                            onClick={() => handleSpecializationToggle(spec)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                              isSelected
                                ? "bg-[#C5A059] border-[#C5A059] text-[#0A1021]"
                                : "bg-[#051815] border-[#C5A059]/30 text-gray-300 hover:border-[#C5A059]"
                            }`}
                          >
                            {spec}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block">Government ID Proof Document</label>
                    <div className="relative border-2 border-dashed border-[#C5A059]/30 hover:border-[#C5A059]/70 rounded-2xl p-6 text-center cursor-pointer transition-all bg-[#051815]">
                      <input 
                        type="file" 
                        onChange={(e) => handleFileUpload(e, "govIdFile")}
                        accept="image/*,.pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <span className="text-2xl block mb-1">📇</span>
                      <span className="text-xs font-bold block text-gray-300">
                        {formData.govIdFileName ? formData.govIdFileName : "Upload Aadhaar card, Voter ID, or certificate scan"}
                      </span>
                      <span className="text-[9px] text-gray-400 block mt-1">Accepts PNG, JPG, or PDF (Max 5MB)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Product & Craft Details */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="border-b border-[#C5A059]/25 pb-3">
                    <h3 className="text-lg font-serif font-bold text-[#C5A059]">Section 3: Craft & Product Details</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Submit samples of your handloom inventory</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Primary Product Category</label>
                    <select 
                      name="primaryCategory"
                      value={formData.primaryCategory}
                      onChange={handleInputChange}
                      className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                    >
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Product / Loom Description</label>
                    <textarea 
                      name="productDescription"
                      value={formData.productDescription}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Tell us about the yarn count, dyes used (organic/chemical), motifs (Pasapalli, Bomkai), and weaving time..."
                      className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Min Saree Price</label>
                      <input 
                        type="number" 
                        name="priceMin"
                        value={formData.priceMin}
                        onChange={handleInputChange}
                        placeholder="e.g. 5000"
                        className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Max Saree Price</label>
                      <input 
                        type="number" 
                        name="priceMax"
                        value={formData.priceMax}
                        onChange={handleInputChange}
                        placeholder="e.g. 35000"
                        className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Available Stock (Ready to inspect)</label>
                    <input 
                      type="number" 
                      name="availableStock"
                      value={formData.availableStock}
                      onChange={handleInputChange}
                      placeholder="e.g. 4"
                      className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block">Upload Craft/Inventory Images (Min 3 required)</label>
                    <div className="relative border-2 border-dashed border-[#C5A059]/30 hover:border-[#C5A059]/70 rounded-2xl p-6 text-center cursor-pointer transition-all bg-[#051815]">
                      <input 
                        type="file" 
                        onChange={handleMultiImageUpload}
                        accept="image/*"
                        multiple
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <span className="text-2xl block mb-1">📸</span>
                      <span className="text-xs font-bold block text-gray-300">
                        Select multiple images of your workspace, loom, and finished sarees.
                      </span>
                      {formData.productImages.length > 0 && (
                        <div className="mt-2 text-xs text-[#C5A059] font-bold">
                          ✓ {formData.productImages.length} images selected
                        </div>
                      )}
                      <span className="text-[9px] text-gray-400 block mt-1">Needs at least 3 files (Max 5MB each)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Compliance & Verification */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="border-b border-[#C5A059]/25 pb-3">
                    <h3 className="text-lg font-serif font-bold text-[#C5A059]">Section 4: Compliance & Banking</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Government registration and settlement account details</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold flex justify-between">
                      <span>GST Number</span>
                      <span className="text-gray-400 lowercase font-normal italic">Optional</span>
                    </label>
                    <input 
                      type="text" 
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. 21AAAAA1111A1Z1"
                      className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold flex justify-between">
                      <span>Handloom Mark / GI Tag Certificate Scan</span>
                      <span className="text-gray-400 lowercase font-normal italic">Optional</span>
                    </label>
                    <div className="relative border border-[#C5A059]/35 hover:border-[#C5A059]/75 rounded-2xl p-4 text-center cursor-pointer transition-all bg-[#051815]">
                      <input 
                        type="file" 
                        onChange={(e) => handleFileUpload(e, "giCertFile")}
                        accept="image/*,.pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <span className="text-sm block">📜</span>
                      <span className="text-xs font-semibold block text-gray-300">
                        {formData.giCertFileName ? formData.giCertFileName : "Select certificate PDF or Image file"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-[#C5A059]/20 pt-4 space-y-3">
                    <h4 className="text-[11px] uppercase tracking-widest text-[#C5A059] font-bold">Escrow Settlement Bank Account</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-gray-300 font-semibold">Bank Name</label>
                        <input 
                          type="text" 
                          name="bankName"
                          value={formData.bankName}
                          onChange={handleInputChange}
                          placeholder="e.g. State Bank of India"
                          className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-gray-300 font-semibold">IFSC Code</label>
                        <input 
                          type="text" 
                          name="bankIfsc"
                          value={formData.bankIfsc}
                          onChange={handleInputChange}
                          placeholder="e.g. SBIN0001234"
                          className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-gray-300 font-semibold">Account Number</label>
                      <input 
                        type="text" 
                        name="bankAccountNo"
                        value={formData.bankAccountNo}
                        onChange={handleInputChange}
                        placeholder="e.g. 10987654321"
                        className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Review & Submit */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="border-b border-[#C5A059]/25 pb-3">
                    <h3 className="text-lg font-serif font-bold text-[#C5A059]">Section 5: Consent & Submission</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Please review details carefully and confirm authenticity</p>
                  </div>

                  <div className="bg-[#051815] border border-[#C5A059]/30 rounded-2xl p-4 text-xs space-y-2 font-mono">
                    <h4 className="font-bold text-[#C5A059]">Application Summary</h4>
                    <p><span className="text-gray-400">Weaver:</span> {formData.fullName}</p>
                    <p><span className="text-gray-400">Business:</span> {formData.businessName}</p>
                    <p><span className="text-gray-400">District:</span> {formData.district}</p>
                    <p><span className="text-gray-400">Specialty:</span> {formData.specializations.join(", ")}</p>
                    <p><span className="text-gray-400">GI-Tag Attached:</span> {formData.giCertFileName ? "✓ Yes" : "❌ No (Pending physical audit)"}</p>
                    <p><span className="text-gray-400">Bank Name:</span> {formData.bankName}</p>
                  </div>

                  <div className="space-y-3 pt-3">
                    <label className="flex items-start gap-3 cursor-pointer text-xs leading-relaxed text-gray-200">
                      <input 
                        type="checkbox"
                        checked={formData.consentAuthentic}
                        onChange={() => handleCheckboxChange("consentAuthentic")}
                        className="mt-1 accent-[#C5A059]"
                      />
                      <span>
                        I confirm that the products listed are authentic Sambalpuri handloom items. I understand that Bhulia.com physically validates every item and false submissions will lead to account suspension.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer text-xs leading-relaxed text-gray-200">
                      <input 
                        type="checkbox"
                        checked={formData.consentTerms}
                        onChange={() => handleCheckboxChange("consentTerms")}
                        className="mt-1 accent-[#C5A059]"
                      />
                      <span>
                        I agree to the marketplace terms and conditions and bank escrow holding guidelines.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="flex justify-between border-t border-[#C5A059]/20 pt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-6 py-2.5 rounded-xl border border-[#C5A059]/40 text-xs font-bold uppercase tracking-wider hover:bg-[#0A3A35] transition-all disabled:opacity-40"
                >
                  Back
                </button>

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bhulia-gold-button px-6 py-2.5 text-[#0A1021] font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition-all"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-8 py-2.5 font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                  >
                    Submit Application
                  </button>
                )}
              </div>

            </form>
          )}

        </div>

      </div>

      {/* Global Footer */}
      <footer className="w-full bg-[#051815] border-t border-[#C5A059]/40 text-white py-8 px-6 mt-auto">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-sm font-serif font-bold tracking-widest text-[#C5A059] uppercase mb-1">Shyam Dash Global Network</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Sovereign Cooperative Ecosystem</p>
          </div>
          <span className="text-[10px] font-mono text-gray-400">© 2026 Bhulia.com. All Rights Reserved.</span>
        </div>
      </footer>
    </main>
  );
}
