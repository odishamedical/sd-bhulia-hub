"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import UserMenu from "@/components/UserMenu";
import Link from "next/link";
import { addVendor } from "@/lib/db-hooks";

const INDIAN_STATES = [
  "Odisha", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", 
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar", "Chandigarh", 
  "Dadra and Nagar Haveli", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
  "International (Outside India)"
];

const DISTRICTS_MAP: Record<string, string[]> = {
  "Odisha": ["Sambalpur", "Bargarh", "Balangir", "Sonepur (Subarnapur)", "Jharsuguda", "Deogarh", "Sundargarh", "Cuttack", "Khurda (Bhubaneswar)", "Puri", "Ganjam", "Angul", "Balasore", "Bhadrak", "Boudh", "Dhenkanal", "Gajapati", "Jagatsinghpur", "Jajpur", "Kalahandi", "Kandhamal", "Kendrapara", "Keonjhar", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Rayagada"],
  "West Bengal": ["Kolkata", "Howrah", "Hooghly", "Darjeeling", "Nadia", "Murshidabad", "Purulia", "Bankura", "Birbhum", "Malda", "Medinipur", "North 24 Parganas", "South 24 Parganas"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Nanded"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubli-Dharwad", "Belagavi", "Tumakuru", "Udupi", "Dharwad"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Tiruppur", "Erode", "Vellore", "Kanchipuram"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Rangareddy", "Medchal-Malkajgiri"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Kakinada", "Chittoor", "Anantapur", "Kadapa", "Eluru"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Anand"],
  "Arunachal Pradesh": ["Itanagar", "Tawang", "East Siang", "West Kameng", "Papum Pare", "Changlang", "Tirap"],
  "Assam": ["Guwahati", "Dibrugarh", "Jorhat", "Silchar", "Nagaon", "Tezpur", "Tinsukia", "Bongaigaon"],
  "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia", "Ara", "Begusarai", "Nalanda"],
  "Chhattisgarh": ["Raipur", "Bilaspur", "Durg", "Bhilai", "Korba", "Rajnandgaon", "Jagdalpur", "Raigarh"],
  "Goa": ["North Goa (Panaji)", "South Goa (Margao)"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Rohtak", "Hisar", "Karnal", "Panchkula", "Kurukshetra"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Manali", "Kullu", "Mandi", "Solan", "Hamirpur", "Chamba"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih"],
  "Kerala": ["Thiruvananthapuram", "Kochi (Ernakulam)", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Kannur", "Kottayam", "Palakkad", "Malappuram"],
  "Manipur": ["Imphal", "Churachandpur", "Thoubal", "Senapati", "Ukhrul"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh", "Cherrapunji"],
  "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Wokha", "Tuensang"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot", "Hoshiarpur"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar", "Bhilwara", "Sikar"],
  "Sikkim": ["Gangtok", "Namchi", "Geyzing", "Mangan"],
  "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Kailasahar"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Noida", "Ghaziabad", "Agra", "Varanasi", "Prayagraj (Allahabad)", "Meerut", "Bareilly", "Aligarh", "Moradabad", "Gorakhpur", "Jhansi", "Mathura", "Ayodhya"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Haldwani", "Rishikesh", "Nainital", "Roorkee", "Rudrapur"],
  "Andaman and Nicobar": ["Port Blair", "South Andaman", "North & Middle Andaman", "Nicobar"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli": ["Silvassa", "Daman", "Diu"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua", "Samba", "Udhampur"],
  "Ladakh": ["Leh", "Kargil"],
  "Lakshadweep": ["Kavaratti", "Agatti", "Minicoy"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"]
};

const BUSINESS_TYPES = ["Retailer", "Wholesaler", "Exporter"];

const PRODUCT_CATEGORIES = [
  "Sambalpuri Saree",
  "Ikat Dress Material",
  "Handloom Dupatta",
  "Sambalpuri Fabrics",
  "Handloom Accessories"
];

export default function VendorRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [bypassValidation, setBypassValidation] = useState(false);

  const handleAutofillStore = () => {
    setFormData({
      vendorName: "Sambalpur Handloom Emporium",
      ownerName: "Ramesh Chandra Meher",
      contactNumber: "+91 94380 12345",
      whatsappNumber: "+91 94380 12345",
      emailAddress: "ramesh@samaleswaristore.com",
      address: "Gole Bazar Main Road, opposite Town Hall",
      stateRegion: "Odisha",
      districtCity: "Sambalpur",
      businessTypes: ["Retailer", "Wholesaler"],
      govIdFileName: "ramesh_pan.jpg",
      govIdFilePreview: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=100&auto=format&fit=crop&q=80",
      gstNumber: "21AAAAA1111A1Z1",
      giCertFileName: "gi_saree_cert_012.pdf",
      giCertFilePreview: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=100&auto=format&fit=crop&q=80",
      productCategories: ["Sambalpuri Saree", "Ikat Dress Material", "Sambalpuri Fabrics"],
      logoFileName: "emporium_logo.png",
      logoFilePreview: "https://images.unsplash.com/photo-1516841273335-e39b37888115?w=100&auto=format&fit=crop&q=80",
      vendorImages: [
        { name: "store_front.jpg", preview: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=120&auto=format&fit=crop&q=80" },
        { name: "product_rack.jpg", preview: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=120&auto=format&fit=crop&q=80" },
        { name: "loom_details.jpg", preview: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=120&auto=format&fit=crop&q=80" }
      ],
      priceRangeMin: "4500",
      priceRangeMax: "28000",
      currency: "INR",
      bankAccountName: "Sambalpur Handloom Emporium Current Account",
      bankAccountNo: "50200012345678",
      bankIfsc: "HDFC0000080",
      bankName: "HDFC Bank Ltd",
      upiId: "samalemporium@hdfc",
      consentAuthentic: true,
      consentTerms: true,
      tier: "Silver"
    });
    alert("⚡ Mock Store details populated successfully!");
  };

  // Auth & UI States
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  // Camera States
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<"govId" | "giCert" | "logo" | "vendorImages" | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Domain Lookup States
  const [domainTier, setDomainTier] = useState<string>("numeric");
  const [subfolderInput, setSubfolderInput] = useState<string>("");
  const [subdomainInput, setSubdomainInput] = useState<string>("");
  const [domainSearchInput, setDomainSearchInput] = useState<string>("");
  const [domainSearchTld, setDomainSearchTld] = useState<string>(".com");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<{ available: boolean; domain: string; price: number; platformFee: number } | null>(null);
  const [checkAvailabilityStatus, setCheckAvailabilityStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [activeCustomUrl, setActiveCustomUrl] = useState<string | null>(null);

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
    vendorName: "",
    ownerName: "",
    contactNumber: "",
    whatsappNumber: "",
    emailAddress: "",
    address: "",
    stateRegion: INDIAN_STATES[0],
    districtCity: "",
    businessTypes: [] as string[],
    govIdFileName: "",
    govIdFilePreview: null as string | null,
    gstNumber: "",
    giCertFileName: "",
    giCertFilePreview: null as string | null,
    productCategories: [] as string[],
    logoFileName: "",
    logoFilePreview: null as string | null,
    vendorImages: [] as { name: string; preview: string }[],
    priceRangeMin: "",
    priceRangeMax: "",
    currency: "INR",
    bankAccountName: "",
    bankAccountNo: "",
    bankIfsc: "",
    bankName: "",
    upiId: "",
    consentAuthentic: false,
    consentTerms: false,
    tier: "Silver" as "Silver" | "Gold" | "Diamond"
  });

  
  // Draft Logic
  useEffect(() => {
    const savedDraft = localStorage.getItem('sd_bhulia_vendor_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (confirm('We found an unsaved draft. Do you want to resume?')) {
          setFormData(parsed);
        } else {
          localStorage.removeItem('sd_bhulia_vendor_draft');
        }
      } catch (e) {
        console.error('Failed to parse draft');
      }
    }
  }, []);

  const handleSaveDraft = () => {
    localStorage.setItem('sd_bhulia_vendor_draft', JSON.stringify(formData));
    alert('Draft saved successfully! You can safely close this page and return later.');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "stateRegion") {
        const districts = DISTRICTS_MAP[value];
        updated.districtCity = districts ? districts[0] : "";
      }
      return updated;
    });
  };

  const handleCheckboxChange = (name: "consentAuthentic" | "consentTerms") => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleBusinessType = (type: string) => {
    setFormData((prev) => {
      const alreadySelected = prev.businessTypes.includes(type);
      const updated = alreadySelected
        ? prev.businessTypes.filter((t) => t !== type)
        : [...prev.businessTypes, type];
      return { ...prev, businessTypes: updated };
    });
  };

  const toggleProductCategory = (cat: string) => {
    setFormData((prev) => {
      const alreadySelected = prev.productCategories.includes(cat);
      const updated = alreadySelected
        ? prev.productCategories.filter((c) => c !== cat)
        : [...prev.productCategories, cat];
      return { ...prev, productCategories: updated };
    });
  };

  // Mock File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "govId" | "giCert" | "logo") => {
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

  // Mock Multi-Image Upload
  const handleMultiImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      filesArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            vendorImages: [...prev.vendorImages, { name: file.name, preview: reader.result as string }]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // CAMERA MODULE FUNCTIONS
  const startCamera = async (target: "govId" | "giCert" | "logo" | "vendorImages") => {
    setCameraTarget(target);
    setCapturedImage(null);
    setCameraError(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      // Wait for React to mount the video element
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
      if (cameraTarget === "vendorImages") {
        setFormData((prev) => ({
          ...prev,
          vendorImages: [...prev.vendorImages, { name, preview: capturedImage }]
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

  // DOMAIN BRANDING METHODS
  const handleCheckAvailability = (type: "subfolder" | "subdomain", val: string) => {
    if (!val.trim()) return;
    setCheckAvailabilityStatus("checking");
    setTimeout(() => {
      if (val.toLowerCase() === "taken" || val.toLowerCase() === "admin" || val.toLowerCase() === "bhulia") {
        setCheckAvailabilityStatus("taken");
      } else {
        setCheckAvailabilityStatus("available");
      }
    }, 800);
  };

  const handleSearchDomain = () => {
    if (!domainSearchInput.trim()) return;
    setIsSearching(true);
    setSearchResult(null);
    setTimeout(() => {
      setIsSearching(false);
      const isTaken = domainSearchInput.toLowerCase() === "google" || domainSearchInput.toLowerCase() === "bhulia";
      const domainName = `${domainSearchInput.toLowerCase().replace(/[^a-z0-9-]/g, "")}${domainSearchTld}`;
      setSearchResult({
        available: !isTaken,
        domain: domainName,
        price: domainSearchTld === ".com" ? 899 : domainSearchTld === ".in" ? 499 : 799,
        platformFee: 1499
      });
    }, 1000);
  };

  const handleSaveDomainSettings = (tier: string, value: string) => {
    let customUrl = null;
    if (tier === "subfolder") {
      customUrl = `bhulia.com/${value.toLowerCase().replace(/\s+/g, "")}`;
    } else if (tier === "subdomain") {
      customUrl = `${value.toLowerCase().replace(/\s+/g, "")}.bhulia.com`;
    } else if (tier === "custom") {
      customUrl = value.toLowerCase();
    }
    setDomainTier(tier);
    setActiveCustomUrl(customUrl);
  };

  // STEP VALIDATION
  const validateStep = () => {
    setValidationError(null);
    if (bypassValidation) return null;
    if (currentStep === 1) {
      if (!formData.vendorName.trim()) return "Store/Vendor Name is required.";
      if (!formData.ownerName.trim()) return "Owner/Representative Name is required.";
      if (!formData.contactNumber.trim()) return "Contact Number is required.";
      if (!formData.whatsappNumber.trim()) return "WhatsApp Number is required.";
      if (!formData.emailAddress.trim()) return "Email Address is required.";
      if (!formData.address.trim()) return "Full Address is required.";
      if (!formData.districtCity.trim()) return "City/District is required.";
    } else if (currentStep === 2) {
      if (formData.businessTypes.length === 0) return "Please select at least one Business Type.";
      if (!formData.govIdFileName) return "Please upload or capture a Government ID Proof.";
    } else if (currentStep === 3) {
      if (formData.productCategories.length === 0) return "Please select at least one Primary Product Category.";
      if (!formData.logoFileName) return "Please upload or capture your Store Logo.";
      if (formData.vendorImages.length < 3) return "Please upload or capture at least 3 store/product images.";
      if (!formData.priceRangeMin || !formData.priceRangeMax) return "Please complete the typical price range fields.";
    } else if (currentStep === 4) {
      if (!formData.bankAccountName.trim()) return "Bank Account Holder Name is required.";
      if (!formData.bankAccountNo.trim()) return "Account Number is required.";
      if (!formData.bankIfsc.trim()) return "IFSC Code is required.";
      if (!formData.bankName.trim()) return "Bank Name is required.";
    } else if (currentStep === 5) {
      if (domainTier === "subfolder" && checkAvailabilityStatus !== "available" && !activeCustomUrl) {
        return "Please input a custom subfolder and verify its availability.";
      }
      if (domainTier === "subdomain" && checkAvailabilityStatus !== "available" && !activeCustomUrl) {
        return "Please input a custom subdomain and verify its availability.";
      }
      if (domainTier === "custom" && !activeCustomUrl) {
        return "Please search and book a standalone custom domain first.";
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
      setValidationError("You must consent to all authentication and terms policies before submitting.");
      return;
    }

    const uniqueId = localStorage.getItem("sd_current_user_uid") || "vendor-" + Math.floor(1000 + Math.random() * 9000);
    const assignedSlug = formData.tier === "Silver"
      ? uniqueId
      : formData.vendorName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    let finalImg = formData.logoFilePreview || (formData.vendorImages[0]?.preview) || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80";
    if (finalImg.length > 500000) {
      finalImg = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80";
      console.warn("Image too large for demo database. Using placeholder.");
    }

    const payload = {
      slug: assignedSlug,
      title: formData.vendorName,
      desc: `Authentic Sambalpuri handloom showroom operated by ${formData.ownerName}.`,
      img: finalImg,
      badge: `${formData.tier} Store`,
      phone: formData.contactNumber,
      whatsapp: formData.whatsappNumber,
      address: formData.address,
      tier: formData.tier,
      status: "pending_approval" as const,
      productLimit: formData.tier === "Silver" ? 0 : (formData.tier === "Gold" ? 5 : 9999)
    };

    const res = await addVendor(payload, uniqueId);
    if (!res.success) {
      setValidationError("Error submitting application. Please try again.");
      return;
    }

    // Save submission state to local storage simulation
    const activeApplications = JSON.parse(localStorage.getItem("sd_vendor_applications") || "[]");
    const localPayload = {
      ...formData,
      id: uniqueId,
      appliedAt: new Date().toISOString(),
      status: "pending_approval",
      assignedUrl: activeCustomUrl || `bhulia.com/store/${uniqueId}`
    };
    activeApplications.push(localPayload);
    localStorage.setItem("sd_vendor_applications", JSON.stringify(activeApplications));

    setFormSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="relative flex-1 w-full bg-[#051815] text-white font-sans flex flex-col min-h-screen">
      
      {/* Top Sticky Header */}
      

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden sticky top-[57px] z-40 bg-[#0B2B26]/98 backdrop-blur-md border-b border-[#C5A059]/40 px-6 py-6 space-y-4 shadow-2xl">
          <div className="flex flex-col space-y-3 text-xs font-bold uppercase tracking-widest text-gray-200">
            <Link href="/" className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Home</Link>
            <Link href="/register-weaver" className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Apply as Weaver</Link>
            <span className="text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block font-black">Register Store</span>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
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

      {/* Main Registration Layout */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 flex-1 flex flex-col justify-center">
        
        {!formSubmitted ? (
          <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative">
            
            {/* Header info */}
            <div className="text-center space-y-2 pb-6 border-b border-[#C5A059]/20">
              <h2 className="text-2xl sm:text-4xl font-serif text-[#C5A059] font-bold tracking-wider">Sambalpuri Store Registration</h2>
              <p className="text-xs sm:text-sm text-gray-300">Apply to configure a verified retailer storefront on the Bhulia marketplace.</p>
            </div>

            {/* Step Wizard Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-[#C5A059]">
                <span>Step {currentStep} of 6</span>
                <span>
                  {currentStep === 1 && "Store & Owner Details"}
                  {currentStep === 2 && "Business Verification"}
                  {currentStep === 3 && "Products & Assets"}
                  {currentStep === 4 && "Banking Details"}
                  {currentStep === 5 && "URL & Branding Selection"}
                  {currentStep === 6 && "Review & Consent"}
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#051815] rounded-full overflow-hidden border border-[#C5A059]/20">
                <div 
                  className="h-full bg-gradient-to-r from-[#996515] to-[#C5A059] transition-all duration-500" 
                  style={{ width: `${(currentStep / 6) * 100}%` }}
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

              {/* STEP 1: Personal & Business Info */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fadeIn">
                  
                  {/* Tier Selection */}
                  <div className="space-y-2 mb-4">
                    <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Select Store Tier</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: "Silver", name: "Silver (Free)", price: "Free", desc: "Simple page, one store image, hidden phone, automatic URL." },
                        { id: "Gold", name: "Gold (Rs 2,000/yr)", price: "Rs 2,000", desc: "Custom URL choice, upload store/product desc, verified seal." },
                        { id: "Diamond", name: "Diamond (Paid)", price: "Rs 3,000 / Rs 5,000", desc: "Gold features + upload 25 products (Rs 3k) or Unlimited (Rs 5k)." }
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
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Store/Vendor Name</label>
                      <input 
                        type="text" 
                        name="vendorName" 
                        value={formData.vendorName} 
                        onChange={handleInputChange} 
                        placeholder="e.g. Sambalpur Heritage Handloom Store"
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Owner / Representative Name</label>
                      <input 
                        type="text" 
                        name="ownerName" 
                        value={formData.ownerName} 
                        onChange={handleInputChange} 
                        placeholder="e.g. Ramesh Chandra Meher"
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
                        placeholder="e.g. +91 98765 43210"
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
                        placeholder="e.g. +91 98765 43210"
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
                        placeholder="e.g. contact@sambalpuristore.in"
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Full Address</label>
                      <input 
                        type="text"
                        name="address" 
                        value={formData.address} 
                        onChange={handleInputChange} 
                        placeholder="e.g. Plot 104, Handloom Boulevard, VSS Nagar"
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">State / Region</label>
                      <select 
                        name="stateRegion" 
                        value={formData.stateRegion} 
                        onChange={handleInputChange}
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#C5A059] cursor-pointer"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">City / District / Region Code</label>
                    {DISTRICTS_MAP[formData.stateRegion] ? (
                      <select 
                        name="districtCity" 
                        value={formData.districtCity} 
                        onChange={handleInputChange}
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#C5A059] cursor-pointer"
                      >
                        {DISTRICTS_MAP[formData.stateRegion].map((dist) => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    ) : (
                      <input 
                        type="text" 
                        name="districtCity" 
                        value={formData.districtCity} 
                        onChange={handleInputChange} 
                        placeholder="e.g. Sambalpur, Odisha or New Delhi, NCR"
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: Business Verification */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Business Type checkboxes */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Business Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {BUSINESS_TYPES.map((type) => {
                        const selected = formData.businessTypes.includes(type);
                        return (
                          <div 
                            key={type}
                            onClick={() => toggleBusinessType(type)}
                            className={`border rounded-xl p-3 text-center cursor-pointer transition-all ${selected ? "bg-[#0A3A35] border-[#C5A059] text-white" : "border-[#C5A059]/20 bg-[#051815]/50 text-gray-300 hover:border-[#C5A059]"}`}
                          >
                            <span className="text-xs font-bold">{type}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ID Proof File upload & CAMERA input */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Government ID Proof (Aadhaar, Voter ID, PAN)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Upload */}
                      <div className="bg-[#051815]/50 border border-[#C5A059]/20 rounded-2xl p-4 flex flex-col justify-center items-center gap-3 relative text-center">
                        <span className="text-2xl">📁</span>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white">Upload Document File</p>
            <p className="text-[10px] text-gray-400 mt-1 text-center font-semibold">Max file size: <span className="text-[#C5A059]">500KB</span></p>
                          <p className="text-[10px] text-gray-400">PDF, PNG, JPG up to 10MB</p>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileUpload(e, "govId")}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        {formData.govIdFileName && (
                          <span className="text-[10px] text-green-400 font-mono block mt-1">{formData.govIdFileName}</span>
                        )}
                      </div>

                      {/* Camera */}
                      <div 
                        onClick={() => startCamera("govId")}
                        className="bg-[#051815]/50 border border-dashed border-[#C5A059]/30 rounded-2xl p-4 flex flex-col justify-center items-center gap-3 text-center cursor-pointer hover:bg-[#0A3A35]/30 transition-colors"
                      >
                        <span className="text-2xl">📸</span>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white">Take Camera Snapshot</p>
                          <p className="text-[10px] text-gray-400">Use device camera directly</p>
                        </div>
                        {formData.govIdFilePreview && (
                          <div className="relative w-12 h-12 rounded-lg border border-[#C5A059] overflow-hidden mt-1">
                            <img src={formData.govIdFilePreview} className="object-cover w-full h-full" alt="Gov ID preview" />
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* GST Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">GSTIN Number (Optional)</label>
                    <input 
                      type="text" 
                      name="gstNumber" 
                      value={formData.gstNumber} 
                      onChange={handleInputChange} 
                      placeholder="e.g. 21AAAAA1111A1Z1"
                      className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059] font-mono"
                    />
                  </div>

                  {/* Handloom Mark / GI Cert upload */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Handloom Mark or Bhulia.com Certificate (Optional)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Upload */}
                      <div className="bg-[#051815]/50 border border-[#C5A059]/20 rounded-2xl p-4 flex flex-col justify-center items-center gap-3 relative text-center">
                        <span className="text-2xl">📁</span>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white">Upload Certificate File</p>
            <p className="text-[10px] text-gray-400 mt-1 text-center font-semibold">Max file size: <span className="text-[#C5A059]">500KB</span></p>
                          <p className="text-[10px] text-gray-400">PDF, PNG, JPG up to 10MB</p>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileUpload(e, "giCert")}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        {formData.giCertFileName && (
                          <span className="text-[10px] text-green-400 font-mono block mt-1">{formData.giCertFileName}</span>
                        )}
                      </div>

                      {/* Camera */}
                      <div 
                        onClick={() => startCamera("giCert")}
                        className="bg-[#051815]/50 border border-dashed border-[#C5A059]/30 rounded-2xl p-4 flex flex-col justify-center items-center gap-3 text-center cursor-pointer hover:bg-[#0A3A35]/30 transition-colors"
                      >
                        <span className="text-2xl">📸</span>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white">Capture Certificate Screen</p>
                          <p className="text-[10px] text-gray-400">Snapshot via web camera</p>
                        </div>
                        {formData.giCertFilePreview && (
                          <div className="relative w-12 h-12 rounded-lg border border-[#C5A059] overflow-hidden mt-1">
                            <img src={formData.giCertFilePreview} className="object-cover w-full h-full" alt="GI Cert preview" />
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {/* STEP 3: Products & Assets */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Product Categories select */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Primary Product Categories</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {PRODUCT_CATEGORIES.map((cat) => {
                        const selected = formData.productCategories.includes(cat);
                        return (
                          <div 
                            key={cat}
                            onClick={() => toggleProductCategory(cat)}
                            className={`border rounded-xl p-2.5 text-center cursor-pointer transition-all ${selected ? "bg-[#0A3A35] border-[#C5A059] text-white" : "border-[#C5A059]/20 bg-[#051815]/50 text-gray-300 hover:border-[#C5A059]"}`}
                          >
                            <span className="text-[11px] font-semibold">{cat}</span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Add Custom Category */}
                    <div className="mt-3 flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Add your own custom product type..." 
                        id="customCategoryInput"
                        className="flex-1 bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = e.currentTarget.value;
                            if (val && val.trim()) {
                              toggleProductCategory(val.trim());
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('customCategoryInput') as HTMLInputElement;
                          if (el && el.value.trim()) {
                            toggleProductCategory(el.value.trim());
                            el.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-[#0B2B26] border border-[#C5A059]/50 text-[#C5A059] text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-[#C5A059]/10"
                      >
                        + Add
                      </button>
                    </div>
                    {/* Show Custom Added Categories */}
                    {formData.productCategories.filter(c => !PRODUCT_CATEGORIES.includes(c)).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {formData.productCategories.filter(c => !PRODUCT_CATEGORIES.includes(c)).map(cat => (
                          <div key={cat} className="flex items-center gap-2 bg-[#0A3A35] border border-[#C5A059] rounded-xl px-3 py-1.5">
                            <span className="text-[11px] font-semibold text-white">{cat}</span>
                            <button type="button" onClick={() => toggleProductCategory(cat)} className="text-red-400 hover:text-red-300 ml-1">✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Logo Image Upload & Camera */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Upload Store Logo</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="bg-[#051815]/50 border border-[#C5A059]/20 rounded-2xl p-4 flex flex-col justify-center items-center gap-3 relative text-center">
                        <span className="text-xl">📁</span>
                        <p className="text-xs font-bold text-white">Upload Logo File</p>
                        <p className="text-[10px] text-gray-400 mt-1 text-center font-semibold">Max size: <span className="text-[#C5A059]">500KB</span><br/><span className="text-[#C5A059]/70 font-normal">Ideal: 1:1 Square (e.g. 400x400)</span></p>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "logo")}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        {formData.logoFileName && (
                          <span className="text-[10px] text-green-400 font-mono block mt-1">{formData.logoFileName}</span>
                        )}
                      </div>

                      <div 
                        onClick={() => startCamera("logo")}
                        className="bg-[#051815]/50 border border-dashed border-[#C5A059]/30 rounded-2xl p-4 flex flex-col justify-center items-center gap-3 text-center cursor-pointer hover:bg-[#0A3A35]/30 transition-colors"
                      >
                        <span className="text-xl">📸</span>
                        <p className="text-xs font-bold text-white">Snap Logo Snapshot</p>
                        <p className="text-[10px] text-gray-400 mt-1 text-center font-semibold">Max size: <span className="text-[#C5A059]">500KB</span><br/><span className="text-[#C5A059]/70 font-normal">Ideal: 1:1 Square (e.g. 400x400)</span></p>
                        {formData.logoFilePreview && (
                          <div className="relative w-12 h-12 rounded-lg border border-[#C5A059] overflow-hidden mt-1">
                            <img src={formData.logoFilePreview} className="object-cover w-full h-full" alt="Logo preview" />
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Stores Images Multi upload (minimum 3 images) */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Upload Store / Product Images (Minimum 3 Images Required)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="bg-[#051815]/50 border border-[#C5A059]/20 rounded-2xl p-5 flex flex-col justify-center items-center gap-3 relative text-center">
                        <span className="text-2xl">🖼️</span>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white">Upload Multi-Files</p>
                          <p className="text-[10px] text-gray-400 mt-1 text-center font-semibold">Max size: <span className="text-[#C5A059]">500KB</span><br/><span className="text-[#C5A059]/70 font-normal">Ideal: 16:9 Landscape (e.g. 1200x675)</span></p>
                          <p className="text-[10px] text-gray-400">Select multiple catalog photos</p>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*"
                          multiple
                          onChange={handleMultiImageUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>

                      <div 
                        onClick={() => startCamera("vendorImages")}
                        className="bg-[#051815]/50 border border-dashed border-[#C5A059]/30 rounded-2xl p-5 flex flex-col justify-center items-center gap-3 text-center cursor-pointer hover:bg-[#0A3A35]/30 transition-colors"
                      >
                        <span className="text-2xl">📸</span>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white">Snap Showcase Photos</p>
                          <p className="text-[10px] text-gray-400 mt-1 text-center font-semibold">Max size: <span className="text-[#C5A059]">500KB</span><br/><span className="text-[#C5A059]/70 font-normal">Ideal: 16:9 Landscape (e.g. 1200x675)</span></p>
                          <p className="text-[10px] text-gray-400">Click to snap photo via webcam</p>
                        </div>
                      </div>

                    </div>

                    {/* Previews */}
                    {formData.vendorImages.length > 0 && (
                      <div className="pt-3">
                        <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest block mb-2">Uploaded Images ({formData.vendorImages.length}):</span>
                        <div className="flex flex-wrap gap-2">
                          {formData.vendorImages.map((img, idx) => (
                            <div key={idx} className="relative w-16 h-16 rounded-xl border border-[#C5A059]/40 overflow-hidden bg-black group">
                              <img src={img.preview} className="object-cover w-full h-full" alt="showcase preview" />
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData((prev) => ({
                                    ...prev,
                                    vendorImages: prev.vendorImages.filter((_, i) => i !== idx)
                                  }));
                                }}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-red-400 font-bold transition-opacity"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Typical Price Range */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#C5A059]/20 pt-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Typical Min Price</label>
                      <input 
                        type="number" 
                        name="priceRangeMin" 
                        value={formData.priceRangeMin} 
                        onChange={handleInputChange} 
                        placeholder="e.g. 5000"
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Typical Max Price</label>
                      <input 
                        type="number" 
                        name="priceRangeMax" 
                        value={formData.priceRangeMax} 
                        onChange={handleInputChange} 
                        placeholder="e.g. 80000"
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Currency</label>
                      <select 
                        name="currency" 
                        value={formData.currency} 
                        onChange={handleInputChange}
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#C5A059] cursor-pointer"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </div>

                </div>
              )}

              {/* STEP 4: Banking & Payment */}
              {currentStep === 4 && (
                <div className="space-y-5 animate-fadeIn">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Bank Account Holder Name</label>
                      <input 
                        type="text" 
                        name="bankAccountName" 
                        value={formData.bankAccountName} 
                        onChange={handleInputChange} 
                        placeholder="e.g. Ramesh Chandra Meher"
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Bank Account Number</label>
                      <input 
                        type="text" 
                        name="bankAccountNo" 
                        value={formData.bankAccountNo} 
                        onChange={handleInputChange} 
                        placeholder="e.g. 50100012345678"
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059] font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">IFSC Code</label>
                      <input 
                        type="text" 
                        name="bankIfsc" 
                        value={formData.bankIfsc} 
                        onChange={handleInputChange} 
                        placeholder="e.g. HDFC0001234"
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059] font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Bank Name</label>
                      <input 
                        type="text" 
                        name="bankName" 
                        value={formData.bankName} 
                        onChange={handleInputChange} 
                        placeholder="e.g. HDFC Bank Ltd"
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">UPI ID (Optional)</label>
                    <input 
                      type="text" 
                      name="upiId" 
                      value={formData.upiId} 
                      onChange={handleInputChange} 
                      placeholder="e.g. owner@upi"
                      className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C5A059] font-mono"
                    />
                  </div>

                </div>
              )}

              {/* STEP 5: URL & Branding Selection */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-fadeIn">
                  
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Select Storefront Domain URL Address</h3>
                    <p className="text-xs text-gray-300">Set up how buyers will reach your custom store pages from social media links.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Numeric URL (Free) */}
                    <div 
                      onClick={() => handleSaveDomainSettings("numeric", "")}
                      className={`bg-[#051815]/50 border rounded-2xl p-4 cursor-pointer hover:border-[#C5A059] transition-all flex flex-col justify-between ${domainTier === "numeric" ? "border-[#C5A059] ring-1 ring-[#C5A059] bg-[#0A3A35]/35" : "border-[#C5A059]/20"}`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Tier 1 (Free)</span>
                          {domainTier === "numeric" && <span className="text-xs">✅</span>}
                        </div>
                        <h4 className="font-serif font-bold text-[#C5A059] text-xs">Numeric ID</h4>
                        <p className="text-[9px] text-gray-300 mt-1 leading-relaxed">Default assigned URL path.</p>
                      </div>
                      <div className="mt-4 pt-1.5 border-t border-[#C5A059]/10 text-[10px] font-mono text-gray-300 truncate">
                        bhulia.com/store/1042
                      </div>
                    </div>

                    {/* Subfolder (₹499/yr) */}
                    <div 
                      onClick={() => {
                        setDomainTier("subfolder");
                        setCheckAvailabilityStatus("idle");
                        setActiveCustomUrl(null);
                      }}
                      className={`bg-[#051815]/50 border rounded-2xl p-4 cursor-pointer hover:border-[#C5A059] transition-all flex flex-col justify-between ${domainTier === "subfolder" ? "border-[#C5A059] ring-1 ring-[#C5A059] bg-[#0A3A35]/35" : "border-[#C5A059]/20"}`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Tier 2 (₹499)</span>
                          {domainTier === "subfolder" && <span className="text-xs">✅</span>}
                        </div>
                        <h4 className="font-serif font-bold text-[#C5A059] text-xs">Subfolder</h4>
                        <p className="text-[9px] text-gray-300 mt-1 leading-relaxed">Custom subpath redirect.</p>
                      </div>
                      <div className="mt-4 pt-1.5 border-t border-[#C5A059]/10 text-[10px] font-mono text-gray-300 truncate">
                        bhulia.com/yourstore
                      </div>
                    </div>

                    {/* Subdomain (₹999/yr) */}
                    <div 
                      onClick={() => {
                        setDomainTier("subdomain");
                        setCheckAvailabilityStatus("idle");
                        setActiveCustomUrl(null);
                      }}
                      className={`bg-[#051815]/50 border rounded-2xl p-4 cursor-pointer hover:border-[#C5A059] transition-all flex flex-col justify-between ${domainTier === "subdomain" ? "border-[#C5A059] ring-1 ring-[#C5A059] bg-[#0A3A35]/35" : "border-[#C5A059]/20"}`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Tier 3 (₹999)</span>
                          {domainTier === "subdomain" && <span className="text-xs">✅</span>}
                        </div>
                        <h4 className="font-serif font-bold text-[#C5A059] text-xs">Subdomain</h4>
                        <p className="text-[9px] text-gray-300 mt-1 leading-relaxed">Clean dedicated subdomain prefix.</p>
                      </div>
                      <div className="mt-4 pt-1.5 border-t border-[#C5A059]/10 text-[10px] font-mono text-gray-300 truncate">
                        yourstore.bhulia.com
                      </div>
                    </div>

                    {/* Standalone Custom (₹1499/yr+) */}
                    <div 
                      onClick={() => {
                        setDomainTier("custom");
                        setSearchResult(null);
                        setActiveCustomUrl(null);
                      }}
                      className={`bg-[#051815]/50 border rounded-2xl p-4 cursor-pointer hover:border-[#C5A059] transition-all flex flex-col justify-between ${domainTier === "custom" ? "border-[#C5A059] ring-1 ring-[#C5A059] bg-[#0A3A35]/35" : "border-[#C5A059]/20"}`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Tier 4 (₹1499)</span>
                          {domainTier === "custom" && <span className="text-xs">✅</span>}
                        </div>
                        <h4 className="font-serif font-bold text-[#C5A059] text-xs">Own Domain</h4>
                        <p className="text-[9px] text-gray-300 mt-1 leading-relaxed">Standalone domain mapping.</p>
                      </div>
                      <div className="mt-4 pt-1.5 border-t border-[#C5A059]/10 text-[10px] font-mono text-gray-300 truncate">
                        yourstore.com
                      </div>
                    </div>
                  </div>

                  {/* Panel view configuration based on chosen tier */}
                  <div className="bg-[#051815] border border-[#C5A059]/30 rounded-2xl p-5 shadow-inner">
                    {domainTier === "numeric" && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-300">Your store will be reachable at the standard system path on approval:</p>
                        <div className="bg-[#0B2B26] p-2.5 rounded-lg border border-[#C5A059]/20 text-xs font-mono text-gray-200">
                          https://bhulia.com/store/STR-{"99"}
                        </div>
                      </div>
                    )}

                    {domainTier === "subfolder" && (
                      <div className="space-y-4">
                        <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Input Subfolder Slug</label>
                        <div className="flex gap-2">
                          <div className="flex-1 flex items-center bg-[#0B2B26] border border-[#C5A059]/40 rounded-xl px-3 py-2">
                            <span className="text-xs text-gray-400 font-mono">bhulia.com/</span>
                            <input 
                              type="text" 
                              placeholder="myheritage" 
                              value={subfolderInput}
                              onChange={(e) => {
                                setSubfolderInput(e.target.value);
                                setCheckAvailabilityStatus("idle");
                              }}
                              className="bg-transparent border-none outline-none font-mono text-xs text-white flex-1 pl-0.5"
                            />
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleCheckAvailability("subfolder", subfolderInput)}
                            disabled={checkAvailabilityStatus === "checking"}
                            className="px-4 py-2 border border-[#C5A059] text-xs font-bold text-[#C5A059] rounded-xl hover:bg-[#C5A059]/10 transition-colors uppercase cursor-pointer"
                          >
                            {checkAvailabilityStatus === "checking" ? "Checking..." : "Verify Name"}
                          </button>
                        </div>
                        {checkAvailabilityStatus === "available" && (
                          <div className="text-xs text-green-400 font-medium">
                            ✅ Name 'bhulia.com/{subfolderInput}' is available! Click apply below.
                            <button 
                              type="button"
                              onClick={() => handleSaveDomainSettings("subfolder", subfolderInput)}
                              className="block mt-2 bg-[#C5A059] text-[#0A1021] font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider hover:brightness-110 cursor-pointer"
                            >
                              Select & Lock URL
                            </button>
                          </div>
                        )}
                        {checkAvailabilityStatus === "taken" && (
                          <p className="text-xs text-red-400 font-medium">❌ Sorry, 'bhulia.com/{subfolderInput}' is taken. Try another.</p>
                        )}
                      </div>
                    )}

                    {domainTier === "subdomain" && (
                      <div className="space-y-4">
                        <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Input Subdomain Name</label>
                        <div className="flex gap-2">
                          <div className="flex-1 flex items-center bg-[#0B2B26] border border-[#C5A059]/40 rounded-xl px-3 py-2">
                            <input 
                              type="text" 
                              placeholder="myheritage" 
                              value={subdomainInput}
                              onChange={(e) => {
                                setSubdomainInput(e.target.value);
                                setCheckAvailabilityStatus("idle");
                              }}
                              className="bg-transparent border-none outline-none font-mono text-xs text-white flex-1 text-right pr-0.5"
                            />
                            <span className="text-xs text-gray-400 font-mono">.bhulia.com</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleCheckAvailability("subdomain", subdomainInput)}
                            disabled={checkAvailabilityStatus === "checking"}
                            className="px-4 py-2 border border-[#C5A059] text-xs font-bold text-[#C5A059] rounded-xl hover:bg-[#C5A059]/10 transition-colors uppercase cursor-pointer"
                          >
                            {checkAvailabilityStatus === "checking" ? "Checking..." : "Verify Name"}
                          </button>
                        </div>
                        {checkAvailabilityStatus === "available" && (
                          <div className="text-xs text-green-400 font-medium">
                            ✅ Subdomain '{subdomainInput}.bhulia.com' is available! Click apply below.
                            <button 
                              type="button"
                              onClick={() => handleSaveDomainSettings("subdomain", subdomainInput)}
                              className="block mt-2 bg-[#C5A059] text-[#0A1021] font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider hover:brightness-110 cursor-pointer"
                            >
                              Select & Lock Subdomain
                            </button>
                          </div>
                        )}
                        {checkAvailabilityStatus === "taken" && (
                          <p className="text-xs text-red-400 font-medium">❌ Sorry, subdomain '{subdomainInput}.bhulia.com' is already registered.</p>
                        )}
                      </div>
                    )}

                    {domainTier === "custom" && (
                      <div className="space-y-4">
                        <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Search Standalone Domain Name</label>
                        <div className="flex gap-2">
                          <div className="flex-1 flex items-center bg-[#0B2B26] border border-[#C5A059]/40 rounded-xl px-3 py-2">
                            <input 
                              type="text" 
                              placeholder="myheritagesarees" 
                              value={domainSearchInput}
                              onChange={(e) => {
                                setDomainSearchInput(e.target.value);
                                setSearchResult(null);
                              }}
                              className="bg-transparent border-none outline-none font-mono text-xs text-white flex-1"
                            />
                            <select 
                              value={domainSearchTld} 
                              onChange={(e) => {
                                setDomainSearchTld(e.target.value);
                                setSearchResult(null);
                              }}
                              className="bg-[#0A3A35] border-0 text-[#C5A059] text-xs font-mono font-bold outline-none cursor-pointer rounded px-1.5 py-0.5 ml-2"
                            >
                              <option value=".com">.com</option>
                              <option value=".in">.in</option>
                              <option value=".co.in">.co.in</option>
                            </select>
                          </div>
                          <button 
                            type="button"
                            onClick={handleSearchDomain}
                            disabled={isSearching}
                            className="px-5 py-2.5 bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] text-xs font-bold rounded-xl hover:brightness-110 transition-all uppercase cursor-pointer"
                          >
                            {isSearching ? "Searching..." : "Search"}
                          </button>
                        </div>

                        {isSearching && (
                          <p className="text-xs text-gray-400 font-mono animate-pulse">Querying domain registrar services...</p>
                        )}

                        {searchResult && searchResult.available && (
                          <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-xl p-4 space-y-3 text-xs animate-fadeIn">
                            <p className="font-bold text-green-400">🎉 Domain "{searchResult.domain}" is AVAILABLE!</p>
                            <div className="space-y-1 text-gray-300 font-mono text-[11px]">
                              <div className="flex justify-between">
                                <span>Domain Fee ({domainSearchTld}):</span>
                                <span>₹{searchResult.price}/yr</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Bhulia platform routing fee:</span>
                                <span>₹{searchResult.platformFee}/yr</span>
                              </div>
                              <div className="flex justify-between font-bold border-t border-[#C5A059]/20 pt-1 text-[#C5A059]">
                                <span>First Year Total:</span>
                                <span>₹{searchResult.price + searchResult.platformFee}</span>
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => handleSaveDomainSettings("custom", searchResult.domain)}
                              className="w-full bg-[#C5A059] text-[#0A1021] font-bold py-2 rounded-lg text-[10px] uppercase tracking-wider hover:brightness-110 cursor-pointer"
                            >
                              Select & Lock Custom Domain (₹{searchResult.price + searchResult.platformFee})
                            </button>
                          </div>
                        )}

                        {searchResult && !searchResult.available && (
                          <p className="text-xs text-red-400 font-medium">❌ Sorry, "{searchResult.domain}" is already registered.</p>
                        )}
                      </div>
                    )}
                  </div>

                  {activeCustomUrl && (
                    <div className="bg-[#0A3A35] border border-[#C5A059]/50 rounded-xl p-3 text-xs flex items-center justify-between text-white">
                      <span>Locked URL: <strong>https://{activeCustomUrl}</strong></span>
                      <span className="text-[10px] bg-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded-full border border-green-500/50">CONFIRMED</span>
                    </div>
                  )}

                </div>
              )}

              {/* STEP 6: Review & Consent */}
              {currentStep === 6 && (
                <div className="space-y-6 animate-fadeIn">
                  
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#C5A059]/20 pb-2">Review Storefront Application Draft</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
                      <div className="space-y-1.5">
                        <p className="text-gray-400">Store/Vendor Name:</p>
                        <p className="text-white font-bold">{formData.vendorName}</p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-gray-400">Owner Name:</p>
                        <p className="text-white font-bold">{formData.ownerName}</p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-gray-400">Store Location:</p>
                        <p className="text-white font-bold">{formData.address}, {formData.districtCity}, {formData.stateRegion}</p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-gray-400">Business Structure:</p>
                        <p className="text-white font-bold">{formData.businessTypes.join(", ")}</p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-gray-400">Designated URL Address:</p>
                        <p className="text-[#C5A059] font-bold font-mono">
                          {activeCustomUrl ? `https://${activeCustomUrl}` : `bhulia.com/store/STR-[auto-assigned]`}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-gray-400">Typical Saree Price Range:</p>
                        <p className="text-white font-bold">
                          {formData.currency} {formData.priceRangeMin} - {formData.priceRangeMax}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Trust Disclosure Banner */}
                  <div className="bg-[#051815] border border-[#C5A059]/40 rounded-2xl p-4 text-xs leading-relaxed text-gray-300">
                    <p>
                      <strong>🛡️ Bhulia Hub Authenticity Certification:</strong> On submission, your application enters the verification queue. Bhulia.com validation agents will audit your stock, check tags, and certify your storefront badge. Only original weavers and retail stores holding original craft certifications will be approved.
                    </p>
                  </div>

                  {/* Consents checkboxes */}
                  <div className="space-y-3.5 border-t border-[#C5A059]/20 pt-4">
                    
                    <div className="flex items-start gap-3 cursor-pointer select-none" onClick={() => handleCheckboxChange("consentAuthentic")}>
                      <input 
                        type="checkbox" 
                        checked={formData.consentAuthentic} 
                        onChange={() => {}}
                        className="rounded border-[#C5A059]/40 bg-[#051815] text-[#C5A059] focus:ring-[#C5A059] mt-0.5 accent-[#C5A059]"
                      />
                      <span className="text-xs text-gray-300 leading-snug">
                        I confirm that the products listed on my storefront are authentic Sambalpuri handloom items. I understand that listing fake or powerloom sarees will result in an immediate store ban and forfeiture of security deposits.
                      </span>
                    </div>

                    <div className="flex items-start gap-3 cursor-pointer select-none" onClick={() => handleCheckboxChange("consentTerms")}>
                      <input 
                        type="checkbox" 
                        checked={formData.consentTerms} 
                        onChange={() => {}}
                        className="rounded border-[#C5A059]/40 bg-[#051815] text-[#C5A059] focus:ring-[#C5A059] mt-0.5 accent-[#C5A059]"
                      />
                      <span className="text-xs text-gray-300 leading-snug">
                        I agree to Bhulia.com marketplace terms, payout payout cycles, and physical quality routing inspect protocols.
                      </span>
                    </div>

                  </div>

                </div>
              )}

              {/* Wizard Nav buttons */}
              <div className="flex justify-between gap-4 pt-6 border-t border-[#C5A059]/20">
                {currentStep > 1 ? (
                  <button 
                    type="button" 
                    onClick={handleBack} 
                    className="px-6 py-3 rounded-xl border border-[#C5A059] text-xs font-bold uppercase tracking-wider text-[#C5A059] hover:bg-[#C5A059]/10 transition-colors cursor-pointer"
                  >
                    ← Back
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < 6 ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="bg-[#0A3A35] text-[#C5A059] px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs border border-[#C5A059]/40 hover:bg-[#0D4B45] transition-all shrink-0"
                    >
                      Save Draft
                    </button>
                    <button 
                      type="button" 
                      onClick={handleNext} 
                      className="px-8 py-3 rounded-xl bg-[#C5A059] hover:brightness-110 text-[#0A1021] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Next Step →
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="bg-[#0A3A35] text-[#C5A059] px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs border border-[#C5A059]/40 hover:bg-[#0D4B45] transition-all shrink-0"
                    >
                      Save Draft
                    </button>
                    <button 
                      type="submit" 
                      className="px-10 py-3 rounded-xl bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-lg cursor-pointer"
                    >
                      Submit Application
                    </button>
                  </div>
                )}
              </div>

            </form>
          </div>
        ) : (
          /* Submission Feedback UI */
          <div className="bg-[#0B2B26] border border-[#C5A059]/50 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl animate-fadeIn max-w-2xl mx-auto">
            <span className="text-5xl block animate-bounce">🎉</span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#C5A059] font-bold tracking-wider">Application Received Successfully!</h2>
            
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Your application for <strong>{formData.vendorName}</strong> is registered under verification ticket ID: <code className="text-[#C5A059] font-mono">STR-{"1A2B3C"}</code>. 
            </p>

            <div className="bg-[#051815] border border-[#C5A059]/30 rounded-2xl p-4 text-xs text-left text-gray-200 space-y-2 leading-relaxed">
              <p><strong>Next steps:</strong></p>
              <ul className="list-disc pl-4 space-y-1 text-gray-300">
                <li>Bhulia.com verification agents will visit/audit your business premises within 3 working days.</li>
                <li>Your chosen storefront URL: <strong className="text-white">{activeCustomUrl ? `https://${activeCustomUrl}` : "bhulia.com/store/STR-auto"}</strong> has been locked in draft status.</li>
                <li>Once approved, you will receive an onboarding email containing access to your Store Vendor control panel.</li>
              </ul>
            </div>

            <Link href="/" className="inline-block px-8 py-3 bg-[#C5A059] hover:brightness-110 text-[#0A1021] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md">
              Return to Homepage
            </Link>
          </div>
        )}

      </div>

      {/* Global Footer */}
      
    </main>
  );
}
