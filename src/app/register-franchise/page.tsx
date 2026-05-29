"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import EcosystemSwitcher from "../../components/EcosystemSwitcher";
import Link from "next/link";
import { addFranchise } from "@/lib/db-hooks";

const INDIAN_STATES = [
  "Odisha", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", 
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar", "Chandigarh", 
  "Dadra and Nagar Haveli", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
  "International (Outside India)"
];

const DISTRICTS_MAP: Record<string, string[]> = {
  "Odisha": ["Bargarh", "Sonepur (Subarnapur)", "Sambalpur", "Balangir", "Boudh", "Cuttack", "Bhubaneswar (Khurda)", "Puri", "Jharsuguda", "Deogarh", "Sundargarh", "Ganjam", "Angul", "Kalahandi", "Nuapada"],
  "West Bengal": ["Kolkata", "Howrah", "Hooghly", "Darjeeling", "Nadia", "Murshidabad", "Purulia", "Bankura", "Birbhum", "Malda", "Medinipur", "North 24 Parganas", "South 24 Parganas"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubli-Dharwad", "Belagavi", "Tumakuru", "Udupi"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Tiruppur", "Erode"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Rangareddy"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Kakinada", "Chittoor", "Anantapur"]
};

const ENTITY_TYPES = [
  "Proprietorship",
  "Partnership Firm",
  "Private Limited Company",
  "Weavers Co-operative Society",
  "Limited Liability Partnership (LLP)"
];

const COVERAGE_TIERS = [
  "District Hub (Within 25km Radius)",
  "Regional Hub (Within 100km Radius)",
  "State Terminal Network",
  "National Metropolitan Distribution Point"
];

const QC_EQUIPMENT_ITEMS = [
  { id: "threadCounter", label: "Handloom Thread Counter Magnifier" },
  { id: "lightbox", label: "Color Matching Lightbox (D65/TL84)" },
  { id: "moistureCabinet", label: "Humidity-controlled Desiccant Cabinets" },
  { id: "digitalScale", label: "GSM Weighing Scales" },
  { id: "desiccantGel", label: "Silicon Gel Moisture Seal Kit" }
];

export default function FranchiseRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [bypassValidation, setBypassValidation] = useState(false);

  // Authentication states (navbar sync)
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  // Subdomain availability check state
  const [subfolderInput, setSubfolderInput] = useState("");
  const [subdomainInput, setSubdomainInput] = useState("");
  const [domainTier, setDomainTier] = useState("subfolder"); // subfolder or subdomain
  const [checkAvailabilityStatus, setCheckAvailabilityStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [activeCustomUrl, setActiveCustomUrl] = useState<string | null>(null);

  // Camera States
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<"govId" | "logo" | "hubImages" | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    representativeName: "",
    hubName: "",
    contactNumber: "",
    whatsappNumber: "",
    emailAddress: "",
    address: "",
    stateRegion: "Odisha",
    districtCity: "Bargarh",
    entityType: ENTITY_TYPES[0],
    coverageTier: COVERAGE_TIERS[0],
    govIdFileName: "",
    govIdFilePreview: null as string | null,
    gstNumber: "",
    hubStorageSize: "",
    qcEquipment: [] as string[],
    logoFileName: "",
    logoFilePreview: null as string | null,
    hubImages: [] as { name: string; preview: string }[],
    bankAccountName: "",
    bankAccountNo: "",
    bankIfsc: "",
    bankName: "",
    securityDepositTxn: "",
    consentAuthentic: false,
    consentTerms: false,
    tier: "Silver" as "Silver" | "Gold" | "Diamond"
  });

  // Sync auth state on load
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "stateRegion") {
        const districts = DISTRICTS_MAP[value] || [];
        updated.districtCity = districts.length > 0 ? districts[0] : "";
      }
      return updated;
    });
  };

  const handleCheckboxChange = (name: "consentAuthentic" | "consentTerms") => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleQCEquipmentToggle = (itemId: string) => {
    setFormData((prev) => {
      const alreadySelected = prev.qcEquipment.includes(itemId);
      const updated = alreadySelected
        ? prev.qcEquipment.filter((i) => i !== itemId)
        : [...prev.qcEquipment, itemId];
      return { ...prev, qcEquipment: updated };
    });
  };

  // Autofill mock details for super_admin or developers
  const handleAutofillFranchise = () => {
    setFormData({
      representativeName: "Satya Ranjan Meher",
      hubName: "Bargarh Phygital Weavers Hub",
      contactNumber: "+91 94372 90123",
      whatsappNumber: "+91 94372 90123",
      emailAddress: "bargarh.hub@bhulia.com",
      address: "Meher Chowk, Barpali Road, Bargarh",
      stateRegion: "Odisha",
      districtCity: "Bargarh",
      entityType: "Weavers Co-operative Society",
      coverageTier: "Regional Hub (Within 100km Radius)",
      govIdFileName: "satya_pan_card.jpg",
      govIdFilePreview: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=100&auto=format&fit=crop&q=80",
      gstNumber: "21ABCDE1234A1Z5",
      hubStorageSize: "2450",
      qcEquipment: ["threadCounter", "lightbox", "desiccantGel", "digitalScale"],
      logoFileName: "bargarh_hub_logo.png",
      logoFilePreview: "https://images.unsplash.com/photo-1516841273335-e39b37888115?w=100&auto=format&fit=crop&q=80",
      hubImages: [
        { name: "warehouse_front.jpg", preview: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&auto=format&fit=crop&q=80" },
        { name: "qc_desk.jpg", preview: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&auto=format&fit=crop&q=80" },
        { name: "despatch_bay.jpg", preview: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&auto=format&fit=crop&q=80" }
      ],
      bankAccountName: "Bargarh Phygital Hub Co-op Society",
      bankAccountNo: "3029102901234",
      bankIfsc: "SBIN0000037",
      bankName: "State Bank of India",
      securityDepositTxn: "TXN-9023419082",
      consentAuthentic: true,
      consentTerms: true,
      tier: "Silver"
    });
    setSubfolderInput("bargarh-hub");
    setActiveCustomUrl("bhulia.com/bargarh-hub");
    setCheckAvailabilityStatus("available");
    alert("⚡ Mock Franchise Hub details populated successfully!");
  };

  // File Upload Handler (Base64 conversion)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "govId" | "logo") => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          [`${fieldName}FileName`]: file.name,
          [`${fieldName}FilePreview`]: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Multi-Image Upload (Hub warehouse images)
  const handleMultiImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      filesArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            hubImages: [...prev.hubImages, { name: file.name, preview: reader.result as string }]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Camera Handlers
  const startCamera = async (target: "govId" | "logo" | "hubImages") => {
    setCameraTarget(target);
    setCapturedImage(null);
    setCameraError(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Unable to access camera device. Please check permissions or upload file manually.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraTarget(null);
    setCapturedImage(null);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
      }
    }
  };

  const saveCapturedPhoto = () => {
    if (capturedImage && cameraTarget) {
      const name = `camera_capture_${Date.now()}.jpg`;
      if (cameraTarget === "hubImages") {
        setFormData((prev) => ({
          ...prev,
          hubImages: [...prev.hubImages, { name, preview: capturedImage }]
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [`${cameraTarget}FileName`]: name,
          [`${cameraTarget}FilePreview`]: capturedImage
        }));
      }
      stopCamera();
    }
  };

  // Subdomain Availability check
  const handleCheckAvailability = (type: "subfolder" | "subdomain", val: string) => {
    if (!val.trim()) return;
    setCheckAvailabilityStatus("checking");
    setTimeout(() => {
      if (val.toLowerCase() === "taken" || val.toLowerCase() === "admin" || val.toLowerCase() === "bhulia") {
        setCheckAvailabilityStatus("taken");
      } else {
        setCheckAvailabilityStatus("available");
        setActiveCustomUrl(type === "subfolder" ? `bhulia.com/${val.toLowerCase()}` : `${val.toLowerCase()}.bhulia.com`);
      }
    }, 800);
  };

  // Step Validation
  const validateStep = () => {
    setValidationError(null);
    if (bypassValidation) return null;

    if (currentStep === 1) {
      if (!formData.hubName.trim()) return "Franchise Hub Name is required.";
      if (!formData.representativeName.trim()) return "Representative Name is required.";
      if (!formData.contactNumber.trim()) return "Contact Number is required.";
      if (!formData.whatsappNumber.trim()) return "WhatsApp Number is mandatory.";
      if (!formData.emailAddress.trim()) return "Email Address is required.";
      if (!formData.address.trim()) return "Hub Physical Address is required.";
      if (!formData.districtCity.trim()) return "City/District is required.";
    } else if (currentStep === 2) {
      if (!formData.govIdFileName) return "Please upload or capture a Government ID Proof.";
      if (!formData.gstNumber.trim()) return "GST Number is required for Franchise hubs.";
    } else if (currentStep === 3) {
      if (!formData.hubStorageSize.trim()) return "Proposed storage warehouse size is required.";
      if (formData.hubImages.length < 3) return "Please upload or capture at least 3 warehouse/hub facility images.";
      if (!formData.logoFileName) return "Proposed Hub Logo is required.";
    } else if (currentStep === 4) {
      if (!formData.bankAccountName.trim()) return "Bank Account Holder Name is required.";
      if (!formData.bankAccountNo.trim()) return "Account Number is required.";
      if (!formData.bankIfsc.trim()) return "IFSC Code is required.";
      if (!formData.bankName.trim()) return "Bank Name is required.";
      if (!formData.securityDepositTxn.trim()) return "Security Deposit Transaction Code is required.";
    } else if (currentStep === 5) {
      if (domainTier === "subfolder" && checkAvailabilityStatus !== "available" && !activeCustomUrl) {
        return "Please input a custom subfolder and verify its availability.";
      }
      if (domainTier === "subdomain" && checkAvailabilityStatus !== "available" && !activeCustomUrl) {
        return "Please input a custom subdomain and verify its availability.";
      }
    }
    return null;
  };

  const handleNext = () => {
    const error = validateStep();
    if (error) {
      setValidationError(error);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setValidationError(null);
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consentAuthentic || !formData.consentTerms) {
      setValidationError("You must consent to all quality standard audits and terms before submitting.");
      return;
    }

    const uniqueId = "franchise-" + Math.floor(1000 + Math.random() * 9000);
    const assignedSlug = formData.tier === "Silver"
      ? uniqueId
      : formData.hubName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const payload = {
      slug: assignedSlug,
      name: formData.hubName,
      city: `${formData.districtCity}, ${formData.stateRegion}`,
      phone: formData.contactNumber,
      whatsapp: formData.whatsappNumber,
      address: formData.address,
      img: formData.logoFilePreview || (formData.hubImages[0]?.preview) || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
      tier: formData.tier,
      status: "pending_approval" as const,
      invitedCount: 0,
      totalSales: 0,
      commissionEarned: 0
    };

    const res = await addFranchise(payload, uniqueId);
    if (!res.success) {
      setValidationError("Error submitting application. Please try again.");
      return;
    }

    // Save details locally in localStorage simulation
    const activeApplications = JSON.parse(localStorage.getItem("sd_franchise_applications") || "[]");
    const localPayload = {
      ...formData,
      id: uniqueId,
      appliedAt: new Date().toISOString(),
      status: "pending_approval",
      assignedUrl: activeCustomUrl || `bhulia.com/${assignedSlug}`
    };
    activeApplications.push(localPayload);
    localStorage.setItem("sd_franchise_applications", JSON.stringify(activeApplications));

    setFormSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="relative flex-1 w-full bg-[#051815] text-white font-sans flex flex-col min-h-screen">
      
      {/* Sticky Header */}
      <header className="sticky top-0 w-full z-50 bg-[#0B2B26] border-b border-[#C5A059]/40 px-4 sm:px-6 py-3 sm:py-4 shadow-lg flex flex-col gap-3">
        <div className="flex justify-between items-center gap-2 w-full">
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
            <div className="relative w-8 sm:w-14 h-8 sm:h-14 rounded-full overflow-hidden border border-[#C5A059] sm:border-2 shadow-[0_0_20px_rgba(197,160,89,0.6)] shrink-0">
              <Image src="/bhulia_logo_final.jpg" alt="Bhulia Gold Logo" fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <Link href="/">
                <h1 className="text-lg sm:text-2xl font-serif font-bold tracking-wider text-[#C5A059] leading-none hover:opacity-80 transition-opacity">BHULIA.COM</h1>
              </Link>
              <p className="hidden sm:block text-[11px] text-gray-300 font-medium tracking-wide mt-1 truncate">Sambalpuri Franchise Network</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-200">
            <Link href="/" className="hover:text-[#C5A059] transition-colors pb-1">Home</Link>
            <Link href="/register-weaver" className="hover:text-[#C5A059] transition-colors pb-1">Apply as Weaver</Link>
            <Link href="/register-store" className="hover:text-[#C5A059] transition-colors pb-1">Register Store</Link>
            <span className="text-[#C5A059] border-b-2 border-[#C5A059] pb-1 cursor-default">Franchise Application</span>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <EcosystemSwitcher />

            <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="lg:hidden flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] rounded-xl hover:bg-[#0D4B45] transition-all">
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

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden sticky top-[57px] z-40 bg-[#0B2B26]/98 backdrop-blur-md border-b border-[#C5A059]/40 px-6 py-6 space-y-4 shadow-2xl">
          <div className="flex flex-col space-y-3 text-xs font-bold uppercase tracking-widest text-gray-200">
            <Link href="/" className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Home</Link>
            <Link href="/register-weaver" className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Apply as Weaver</Link>
            <Link href="/register-store" className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Register Store</Link>
            <span className="text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block font-black">Franchise Application</span>
          </div>
        </div>
      )}

      {/* Live Camera Modal */}
      {cameraActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-[#0B2B26] border border-[#C5A059]/50 rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button 
              onClick={stopCamera}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-lg font-serif text-[#C5A059] font-bold">📸 Live Camera Capture</h3>
            
            <div className="relative rounded-2xl overflow-hidden border border-[#C5A059]/40 bg-black min-h-[300px] flex items-center justify-center">
              {cameraError ? (
                <div className="p-4 text-center text-xs text-red-400 font-medium">
                  {cameraError}
                </div>
              ) : capturedImage ? (
                <img src={capturedImage} alt="Captured Snapshot" className="w-full h-auto object-cover max-h-[360px]" />
              ) : (
                <video ref={videoRef} autoPlay playsInline className="w-full h-auto object-cover max-h-[360px]"></video>
              )}
            </div>

            <div className="flex gap-3">
              {capturedImage ? (
                <>
                  <button 
                    onClick={() => setCapturedImage(null)}
                    className="flex-1 py-3 bg-[#0A3A35] border border-[#C5A059]/30 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#0D4B45] transition-colors cursor-pointer"
                  >
                    🔄 Retake Photo
                  </button>
                  <button 
                    onClick={saveCapturedPhoto}
                    className="flex-1 py-3 bg-[#C5A059] text-[#0A1021] rounded-xl text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer"
                  >
                    💾 Use Photo
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={capturePhoto}
                    disabled={!!cameraError}
                    className="flex-1 py-3 bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] rounded-xl text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    📸 Take Snapshot
                  </button>
                  <button 
                    onClick={stopCamera}
                    className="px-6 py-3 bg-[#0A3A35] border border-[#C5A059]/20 text-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form Container */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 flex-1 flex flex-col justify-center">
        
        {/* Sandbox Dev Toolbar */}
        {!formSubmitted && (
          <div className="bg-[#0A3A35]/80 border border-[#C5A059]/40 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <div>
                <p className="text-xs font-bold text-[#C5A059] uppercase tracking-wider">Super Admin Sandbox Control</p>
                <p className="text-[10px] text-gray-300">Quickly test form pages and subfolders without validation constraints.</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                type="button"
                onClick={handleAutofillFranchise}
                className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#0B2B26] border border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059]/10 transition-colors cursor-pointer"
              >
                Autofill Mock Data
              </button>
              <button 
                type="button"
                onClick={() => setBypassValidation(!bypassValidation)}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-colors cursor-pointer ${bypassValidation ? "bg-red-500/20 border-red-500 text-red-300" : "bg-[#0B2B26] border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059]/10"}`}
              >
                {bypassValidation ? "Bypass: ON" : "Bypass Validation"}
              </button>
            </div>
          </div>
        )}

        {!formSubmitted ? (
          <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative">
            
            {/* Header Title */}
            <div className="text-center space-y-2 pb-6 border-b border-[#C5A059]/20">
              <h2 className="text-2xl sm:text-4xl font-serif text-[#C5A059] font-bold tracking-wider">Phygital Hub Franchise Registration</h2>
              <p className="text-xs sm:text-sm text-gray-300 font-sans">Apply to operate a verified regional drop-off hub and dropshipping terminal.</p>
            </div>

            {/* Stepper Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-[#C5A059]">
                <span>Step {currentStep} of 5</span>
                <span>
                  {currentStep === 1 && "Hub & Representative Info"}
                  {currentStep === 2 && "Verification & Business Details"}
                  {currentStep === 3 && "Hub Infrastructure"}
                  {currentStep === 4 && "Banking & Security Deposit"}
                  {currentStep === 5 && "URL Assignment & Consent"}
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#051815] rounded-full overflow-hidden border border-[#C5A059]/20">
                <div 
                  className="h-full bg-gradient-to-r from-[#996515] to-[#C5A059] transition-all duration-500" 
                  style={{ width: `${(currentStep / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Validation Alert */}
            {validationError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-xs font-medium animate-fadeIn">
                ⚠️ {validationError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* STEP 1: Personal & Hub Info */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  
                  {/* Tier Selection */}
                  <div className="space-y-2 mb-4">
                    <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Select Franchise Tier</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: "Silver", name: "Silver (Paid)", price: "Rs 1,000", desc: "Track invitees, commission dashboard. Upgrade to Gold on 50 sales." },
                        { id: "Gold", name: "Gold (Paid)", price: "Rs 2,000", desc: "Select up to 10 products on custom page, custom choice URL." },
                        { id: "Diamond", name: "Diamond (Paid)", price: "Rs 4,000", desc: "Display unlimited products, categorized grid layout, verified seal." }
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
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Proposed Hub Name</label>
                      <input 
                        type="text" 
                        name="hubName" 
                        value={formData.hubName} 
                        onChange={handleInputChange} 
                        placeholder="e.g. Sambalpur Craft Phygital Hub"
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Representative Name</label>
                      <input 
                        type="text" 
                        name="representativeName" 
                        value={formData.representativeName} 
                        onChange={handleInputChange} 
                        placeholder="e.g. Satya Ranjan Meher"
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Contact Number</label>
                      <input 
                        type="tel" 
                        name="contactNumber" 
                        value={formData.contactNumber} 
                        onChange={handleInputChange} 
                        placeholder="e.g. +91 94370 12345"
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">WhatsApp Number (Mandatory)</label>
                      <input 
                        type="tel" 
                        name="whatsappNumber" 
                        value={formData.whatsappNumber} 
                        onChange={handleInputChange} 
                        placeholder="e.g. +91 94370 12345"
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Email Address</label>
                      <input 
                        type="email" 
                        name="emailAddress" 
                        value={formData.emailAddress} 
                        onChange={handleInputChange} 
                        placeholder="e.g. manager@hubdomain.com"
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Full Hub Address</label>
                    <textarea 
                      name="address" 
                      value={formData.address} 
                      onChange={handleInputChange} 
                      rows={3}
                      placeholder="Enter the complete warehouse or store outlet physical location..."
                      className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059] resize-none"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">State / Region</label>
                      <select 
                        name="stateRegion" 
                        value={formData.stateRegion} 
                        onChange={handleInputChange} 
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#C5A059] cursor-pointer"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st} className="bg-[#0B2B26] text-white">{st}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">City / District (Linked to State)</label>
                      <select 
                        name="districtCity" 
                        value={formData.districtCity} 
                        onChange={handleInputChange} 
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#C5A059] cursor-pointer"
                      >
                        {(DISTRICTS_MAP[formData.stateRegion] || ["Select District"]).map((dt) => (
                          <option key={dt} value={dt} className="bg-[#0B2B26] text-white">{dt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Business & Verification */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Entity Type</label>
                      <select 
                        name="entityType" 
                        value={formData.entityType} 
                        onChange={handleInputChange} 
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#C5A059] cursor-pointer"
                      >
                        {ENTITY_TYPES.map((et) => (
                          <option key={et} value={et} className="bg-[#0B2B26] text-white">{et}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Target Service Coverage</label>
                      <select 
                        name="coverageTier" 
                        value={formData.coverageTier} 
                        onChange={handleInputChange} 
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#C5A059] cursor-pointer"
                      >
                        {COVERAGE_TIERS.map((ct) => (
                          <option key={ct} value={ct} className="bg-[#0B2B26] text-white">{ct}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">GST IN Number</label>
                      <input 
                        type="text" 
                        name="gstNumber" 
                        value={formData.gstNumber} 
                        onChange={handleInputChange} 
                        placeholder="e.g. 21ABCDE1234A1Z5"
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  {/* ID Proof file upload and live camera section */}
                  <div className="border border-[#C5A059]/30 rounded-2xl p-5 bg-black/10 space-y-4">
                    <span className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Government ID Proof (Aadhaar/PAN/Passport)</span>
                    
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="flex-1 w-full space-y-2">
                        <input 
                          type="file" 
                          id="file-govId"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "govId")}
                          className="hidden"
                        />
                        <div className="flex gap-2 w-full">
                          <label 
                            htmlFor="file-govId"
                            className="flex-1 py-3 px-4 bg-[#0A3A35] border border-[#C5A059]/40 rounded-xl text-center text-xs font-bold uppercase tracking-wider text-[#C5A059] hover:bg-[#C5A059]/10 cursor-pointer transition-colors"
                          >
                            📁 Upload ID File
                          </label>
                          <button 
                            type="button"
                            onClick={() => startCamera("govId")}
                            className="py-3 px-4 bg-[#051815] border border-[#C5A059]/50 rounded-xl text-xs font-bold uppercase text-[#C5A059] hover:bg-[#C5A059]/15 cursor-pointer transition-colors"
                          >
                            📸 Capture Snapshot
                          </button>
                        </div>
                      </div>

                      {formData.govIdFilePreview && (
                        <div className="shrink-0 flex items-center gap-3 bg-[#0A3A35]/30 p-2.5 rounded-xl border border-[#C5A059]/20 w-full sm:w-auto">
                          <img src={formData.govIdFilePreview} alt="Gov ID Preview" className="w-16 h-12 object-cover rounded border border-[#C5A059]/40" />
                          <div className="min-w-0 max-w-[150px]">
                            <p className="text-[10px] text-white truncate font-bold">{formData.govIdFileName}</p>
                            <p className="text-[9px] text-green-400 font-bold uppercase">Ready</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Hub Infrastructure */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Proposed Hub Size (Sq. Ft.)</label>
                      <input 
                        type="number" 
                        name="hubStorageSize" 
                        value={formData.hubStorageSize} 
                        onChange={handleInputChange} 
                        placeholder="e.g. 1500"
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  {/* QC checklists */}
                  <div className="border border-[#C5A059]/30 rounded-2xl p-5 bg-black/10 space-y-3">
                    <span className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Required Quality Control (QC) Equipment Available</span>
                    <p className="text-[10px] text-gray-400">Select which of the following standard handloom authentication and sealing devices you have on site:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      {QC_EQUIPMENT_ITEMS.map((item) => {
                        const isSelected = formData.qcEquipment.includes(item.id);
                        return (
                          <button 
                            key={item.id}
                            type="button"
                            onClick={() => handleQCEquipmentToggle(item.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors cursor-pointer ${isSelected ? "bg-[#0A3A35]/50 border-[#C5A059]" : "bg-[#051815]/40 border-gray-800 text-gray-400"}`}
                          >
                            <span className="text-xs">{isSelected ? "✅" : "⬜"}</span>
                            <span className="text-xs text-white font-medium">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Proposed Hub Logo Upload & camera */}
                  <div className="border border-[#C5A059]/30 rounded-2xl p-5 bg-black/10 space-y-4">
                    <span className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Proposed Hub Logo</span>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="flex-1 w-full space-y-2">
                        <input 
                          type="file" 
                          id="file-logo"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "logo")}
                          className="hidden"
                        />
                        <div className="flex gap-2 w-full">
                          <label 
                            htmlFor="file-logo"
                            className="flex-1 py-3 px-4 bg-[#0A3A35] border border-[#C5A059]/40 rounded-xl text-center text-xs font-bold uppercase tracking-wider text-[#C5A059] hover:bg-[#C5A059]/10 cursor-pointer transition-colors"
                          >
                            📁 Upload Logo File
                          </label>
                          <button 
                            type="button"
                            onClick={() => startCamera("logo")}
                            className="py-3 px-4 bg-[#051815] border border-[#C5A059]/50 rounded-xl text-xs font-bold uppercase text-[#C5A059] hover:bg-[#C5A059]/15 cursor-pointer transition-colors"
                          >
                            📸 Capture Snapshot
                          </button>
                        </div>
                      </div>

                      {formData.logoFilePreview && (
                        <div className="shrink-0 flex items-center gap-3 bg-[#0A3A35]/30 p-2.5 rounded-xl border border-[#C5A059]/20 w-full sm:w-auto">
                          <img src={formData.logoFilePreview} alt="Hub Logo Preview" className="w-12 h-12 object-cover rounded-full border border-[#C5A059]/40" />
                          <div className="min-w-0 max-w-[150px]">
                            <p className="text-[10px] text-white truncate font-bold">{formData.logoFileName}</p>
                            <p className="text-[9px] text-green-400 font-bold uppercase">Ready</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hub facility images */}
                  <div className="border border-[#C5A059]/30 rounded-2xl p-5 bg-black/10 space-y-4">
                    <span className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Hub Facility Images (Min 3 Images required)</span>
                    <p className="text-[10px] text-gray-400">Provide pictures of your storage racks, drop-off counter, and security locker setups.</p>
                    
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-2">
                        <input 
                          type="file" 
                          id="file-hubImages"
                          multiple
                          accept="image/*"
                          onChange={handleMultiImageUpload}
                          className="hidden"
                        />
                        <label 
                          htmlFor="file-hubImages"
                          className="flex-1 py-3 bg-[#0A3A35] border border-[#C5A059]/40 rounded-xl text-center text-xs font-bold uppercase tracking-wider text-[#C5A059] hover:bg-[#C5A059]/10 cursor-pointer transition-colors"
                        >
                          📁 Select images to Upload
                        </label>
                        <button 
                          type="button"
                          onClick={() => startCamera("hubImages")}
                          className="py-3 px-6 bg-[#051815] border border-[#C5A059]/50 rounded-xl text-xs font-bold uppercase text-[#C5A059] hover:bg-[#C5A059]/15 cursor-pointer transition-colors"
                        >
                          📸 Take Photo
                        </button>
                      </div>

                      {formData.hubImages.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                          {formData.hubImages.map((img, index) => (
                            <div key={index} className="relative rounded-xl overflow-hidden border border-[#C5A059]/30 aspect-square group bg-black">
                              <img src={img.preview} alt={`Warehouse Preview ${index}`} className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    hubImages: prev.hubImages.filter((_, idx) => idx !== index)
                                  }));
                                }}
                                className="absolute top-1 right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-[9px] font-bold text-white hover:bg-red-700 transition-colors shadow"
                              >
                                ✕
                              </button>
                              <span className="absolute bottom-1 left-1 right-1 bg-black/60 text-[8px] text-gray-300 px-1 truncate rounded text-center">
                                {img.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Financial Remittance & Deposit */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Remittance Bank Holder Name</label>
                      <input 
                        type="text" 
                        name="bankAccountName" 
                        value={formData.bankAccountName} 
                        onChange={handleInputChange} 
                        placeholder="e.g. Sambalpur Craft Phygital Hub Account"
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Account Number</label>
                      <input 
                        type="text" 
                        name="bankAccountNo" 
                        value={formData.bankAccountNo} 
                        onChange={handleInputChange} 
                        placeholder="e.g. 50200000000000"
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Bank IFSC Code</label>
                      <input 
                        type="text" 
                        name="bankIfsc" 
                        value={formData.bankIfsc} 
                        onChange={handleInputChange} 
                        placeholder="e.g. SBIN0000037"
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Bank Name</label>
                      <input 
                        type="text" 
                        name="bankName" 
                        value={formData.bankName} 
                        onChange={handleInputChange} 
                        placeholder="e.g. State Bank of India"
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  {/* Security Deposit Transaction Code */}
                  <div className="border border-[#C5A059]/30 rounded-2xl p-5 bg-black/10 space-y-4">
                    <span className="text-xs text-[#C5A059] font-bold uppercase tracking-wider block">🔗 Escrow Security Deposit confirmation</span>
                    <p className="text-[10px] text-gray-300 leading-relaxed font-sans">
                      All verified regional Phygital Hubs must provide an escrow security deposit to cover dropshipping liability, inventory loss buffers, and Sequel secure transit guarantees.
                    </p>
                    <div className="space-y-1.5 max-w-sm">
                      <label className="text-xs text-gray-300 font-bold uppercase block">Deposit Transaction ID / Code</label>
                      <input 
                        type="text" 
                        name="securityDepositTxn" 
                        value={formData.securityDepositTxn} 
                        onChange={handleInputChange} 
                        placeholder="e.g. TXN-9082347"
                        className="w-full bg-[#051815] border border-orange-500/50 rounded-xl px-4 py-3 text-xs text-white outline-none placeholder-gray-600 focus:border-[#C5A059]"
                      />
                      <span className="text-[9px] text-gray-400 block font-mono">Reference deposit bank wire transaction or gateway receipt codes.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: URL Assignment & Consent */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  
                  {/* URL subfolder / subdomain check */}
                  <div className="border border-[#C5A059]/30 rounded-2xl p-5 bg-black/10 space-y-4">
                    <span className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Configure Storefront URL structure</span>
                    <p className="text-[10px] text-gray-300 leading-relaxed">
                      Choose your default URL slug structure. You will be able to map stand-alone custom domains from the premium dashboard settings after verification.
                    </p>

                    <div className="flex gap-4 pt-2">
                      <button 
                        type="button" 
                        onClick={() => {
                          setDomainTier("subfolder");
                          setCheckAvailabilityStatus("idle");
                          setActiveCustomUrl(null);
                        }}
                        className={`flex-1 py-3 px-4 rounded-xl border text-center text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${domainTier === "subfolder" ? "bg-[#0A3A35] border-[#C5A059] text-white" : "bg-[#051815]/50 border-gray-800 text-gray-400"}`}
                      >
                        Subfolder: bhulia.com/[slug]
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          setDomainTier("subdomain");
                          setCheckAvailabilityStatus("idle");
                          setActiveCustomUrl(null);
                        }}
                        className={`flex-1 py-3 px-4 rounded-xl border text-center text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${domainTier === "subdomain" ? "bg-[#0A3A35] border-[#C5A059] text-white" : "bg-[#051815]/50 border-gray-800 text-gray-400"}`}
                      >
                        Subdomain: [slug].bhulia.com
                      </button>
                    </div>

                    <div className="space-y-2 max-w-lg">
                      <label className="text-xs text-gray-300 font-bold uppercase block">Preferred URL Slug Name</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          {domainTier === "subfolder" && (
                            <span className="absolute left-4 top-3.5 text-xs text-gray-500 font-mono">bhulia.com/</span>
                          )}
                          <input 
                            type="text"
                            value={domainTier === "subfolder" ? subfolderInput : subdomainInput}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^a-zA-Z0-9-]/g, "");
                              if (domainTier === "subfolder") setSubfolderInput(val);
                              else setSubdomainInput(val);
                              setCheckAvailabilityStatus("idle");
                              setActiveCustomUrl(null);
                            }}
                            placeholder="e.g. bargarh-hub"
                            className={`w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl py-3 text-xs text-white outline-none focus:border-[#C5A059] ${domainTier === "subfolder" ? "pl-24 pr-4" : "px-4"}`}
                          />
                          {domainTier === "subdomain" && (
                            <span className="absolute right-4 top-3.5 text-xs text-gray-500 font-mono">.bhulia.com</span>
                          )}
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleCheckAvailability(domainTier as any, domainTier === "subfolder" ? subfolderInput : subdomainInput)}
                          className="bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059] hover:text-[#051815] px-4 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer"
                        >
                          Check
                        </button>
                      </div>

                      {/* Availability status indicators */}
                      {checkAvailabilityStatus === "checking" && (
                        <p className="text-[10px] text-yellow-400 font-bold font-mono">🔍 Searching registry...</p>
                      )}
                      {checkAvailabilityStatus === "taken" && (
                        <p className="text-[10px] text-red-400 font-bold font-mono">❌ Name is taken. Try another slug (e.g. adds numbers or -hub).</p>
                      )}
                      {checkAvailabilityStatus === "available" && (
                        <div className="p-3 bg-[#0A3A35]/30 border border-[#C5A059]/40 rounded-xl space-y-1">
                          <p className="text-[10px] text-green-400 font-bold font-mono">✅ Subdomain name is available!</p>
                          <p className="text-[9px] text-gray-300 font-mono">Simulated address: <strong className="text-white">{activeCustomUrl}</strong></p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Consents and Agreements */}
                  <div className="border border-[#C5A059]/30 rounded-2xl p-5 bg-black/10 space-y-4">
                    <span className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Terms and Policies Confirmation</span>
                    
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <input 
                          type="checkbox" 
                          id="consentAuthentic"
                          checked={formData.consentAuthentic}
                          onChange={() => handleCheckboxChange("consentAuthentic")}
                          className="w-5 h-5 accent-[#C5A059] mt-0.5 cursor-pointer shrink-0"
                        />
                        <label htmlFor="consentAuthentic" className="text-xs text-gray-300 leading-relaxed cursor-pointer select-none">
                          I guarantee that every product processed, QC certified, and dispatched from our Hub will undergo standard handloom authentication (verifying genuine GI Tag certificates and thread counts).
                        </label>
                      </div>

                      <div className="flex gap-3">
                        <input 
                          type="checkbox" 
                          id="consentTerms"
                          checked={formData.consentTerms}
                          onChange={() => handleCheckboxChange("consentTerms")}
                          className="w-5 h-5 accent-[#C5A059] mt-0.5 cursor-pointer shrink-0"
                        />
                        <label htmlFor="consentTerms" className="text-xs text-gray-300 leading-relaxed cursor-pointer select-none">
                          I accept all billing remittance terms, dropshipping policies, B2C courier liabilities, BVC secure logistics rules, and standard 5% commission setup.
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stepper Navigation Actions */}
              <div className="flex justify-between items-center pt-6 border-t border-[#C5A059]/20">
                {currentStep > 1 ? (
                  <button 
                    type="button" 
                    onClick={handleBack}
                    className="px-6 py-3 bg-[#0A3A35] border border-[#C5A059]/30 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#0D4B45] transition-colors cursor-pointer"
                  >
                    ← Back
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < 5 ? (
                  <button 
                    type="button" 
                    onClick={handleNext}
                    className="px-6 py-3 bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] rounded-xl text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer"
                  >
                    Continue →
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    className="px-8 py-3 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(197,160,89,0.35)] cursor-pointer"
                  >
                    Submit Application
                  </button>
                )}
              </div>

            </form>
          </div>
        ) : (
          /* SUCCESS RESPONSE SCREEN */
          <div className="bg-[#0B2B26] border-2 border-green-500/50 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-6 relative max-w-xl mx-auto">
            <div className="w-16 h-16 bg-green-500/10 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto text-3xl shadow-[0_0_25px_rgba(34,197,94,0.4)] animate-bounce">
              ✓
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-serif text-[#C5A059] font-bold">Application Received!</h2>
              <p className="text-xs uppercase tracking-widest text-green-400 font-mono font-bold">Status: Pending Bhulia Admin Verification</p>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              Thank you for applying as a regional drop-off terminal. Your Representative registration details and Security deposit transaction reference (<span className="font-mono text-white font-bold">{formData.securityDepositTxn}</span>) have been logged in the platform registry.
            </p>

            <div className="bg-[#051815] border border-[#C5A059]/20 rounded-2xl p-4 text-left space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Representative:</span>
                <span className="font-bold text-white">{formData.representativeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Proposed Hub Node:</span>
                <span className="font-bold text-white">{formData.hubName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Assigned Node URL:</span>
                <span className="font-mono font-bold text-[#C5A059]">{activeCustomUrl || `bhulia.com/${formData.hubName.toLowerCase().replace(/[^a-z0-9-]/g, "")}`}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Link 
                href="/franchise/dashboard"
                className="flex-1 py-3 bg-[#0A3A35] border border-[#C5A059]/40 hover:border-[#C5A059] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors text-center cursor-pointer block"
              >
                Go to Franchise Dashboard
              </Link>
              <Link 
                href="/"
                className="flex-1 py-3 bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] rounded-xl text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all text-center cursor-pointer block"
              >
                Return to Marketplace
              </Link>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
