"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";
import SupplierInventoryUpload from "@/components/dashboard/SupplierInventoryUpload";
import { useOrders, useProducts } from "@/lib/db-hooks";
import GlobalBannerSlot from "@/components/GlobalBannerSlot";
import { INDIAN_STATES, ODISHA_DISTRICTS, ODISHA_DISTRICT_BLOCKS } from "@/lib/locations";
import PricingTab from "@/components/PricingTab";
import Image from "next/image";
import ImageUploader from "@/components/ImageUploader";
import SecurityTab from "@/components/SecurityTab";
import StaffAccountsTab from "@/components/StaffAccountsTab";
import { uploadBase64ToStorage } from "@/lib/storageUtils";
import VanityUrlManager from "@/components/VanityUrlManager";

export default function SupplierDashboardPage() {
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const router = useRouter();

  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [userUid, setUserUid] = useState("");

  const { products } = useProducts();
  const { orders } = useOrders();

  const myMaterials = products.filter(p => p.sellerId === userUid && p.sellerType === "supplier");
  const myOrders = orders.filter(o => o.sellerId === userUid);

  // KYC & Business Profile state
  const [gstNumber, setGstNumber] = useState("");
  const [udyamNumber, setUdyamNumber] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyDesc, setCompanyDesc] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [materialTypes, setMaterialTypes] = useState("");
  const [supplyCapacity, setSupplyCapacity] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  
  // KYC Docs
  const [kycType, setKycType] = useState("");
  const [kycId, setKycId] = useState("");
  const [kycDocumentUrl, setKycDocumentUrl] = useState("");

  // Personal Profile State
  const [personalName, setPersonalName] = useState("");
  const [personalDob, setPersonalDob] = useState("");
  const [personalPhone, setPersonalPhone] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [personalCountry, setPersonalCountry] = useState("India");
  const [personalState, setPersonalState] = useState("");
  const [personalDistrict, setPersonalDistrict] = useState("");
  const [personalBlock, setPersonalBlock] = useState("");
  const [personalTownVillage, setPersonalTownVillage] = useState("");
  const [personalPin, setPersonalPin] = useState("");
  const [personalAddress, setPersonalAddress] = useState("");
  const [personalAadhaar, setPersonalAadhaar] = useState("");
  const [personalPhoto, setPersonalPhoto] = useState("");
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);

  const [bankHolder, setBankHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankUpi, setBankUpi] = useState("");
  const [isSavingBank, setIsSavingBank] = useState(false);

  const [isSavingKyc, setIsSavingKyc] = useState(false);
  const [staffMembers, setStaffMembers] = useState<string[]>([]);

  // Market Rates State
  const [cottonPrice, setCottonPrice] = useState("3200");
  const [silkPrice, setSilkPrice] = useState("5500");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const actualRole = userDoc.data().role;
            
            const params = new URLSearchParams(window.location.search);
            const viewAsRole = params.get("viewAs");
            
            if (actualRole === "super_admin" && viewAsRole === "supplier") {
              setUserName("Demo Supplier");
              setUserUid("demo-supplier");
              setIsDemoMode(true);
              setLoading(false);
              return;
            }
            
            if (actualRole !== "supplier") {
              router.push("/dashboard");
              return;
            }
            setUserName(userDoc.data().name || user.email?.split("@")[0] || "Supplier");
            setUserUid(user.uid);
            
            const storeDoc = await getDoc(doc(db, "suppliers", user.uid));
            if (storeDoc.exists()) {
              const data = storeDoc.data();
              setGstNumber(data.gstNumber || data.gst || "");
              setUdyamNumber(data.udyamNumber || "");
              setBusinessAddress(data.businessAddress || "");
              setCompanyName(data.companyName || data.title || "");
              setCompanyDesc(data.companyDesc || "");
              setPhone(data.phone || "");
              setWhatsapp(data.whatsapp || "");
              setState(data.state || "");
              setDistrict(data.district || "");
              setCity(data.city || "");
              setProfileImage(data.profileImage || data.img || "");
              setMaterialTypes(data.materialTypes || "");
              setSupplyCapacity(data.supplyCapacity || "");
              setKycType(data.kycType || "");
              setKycId(data.kycId || "");
              setKycDocumentUrl(data.kycDocumentUrl || "");
              setBankHolder(data.bankHolder || "");
              setBankName(data.bankName || "");
              setBankAccount(data.bankAccount || "");
              setBankIfsc(data.bankIfsc || "");
              setBankUpi(data.bankUpi || "");
              const slug = String(data.companyName || data.title || "supplier").toLowerCase().replace(/[^a-z0-9]+/g, '-');
              setStoreSlug(slug);
              // Personal fields
              setPersonalName(data.personalName || "");
              setPersonalDob(data.personalDob || "");
              setPersonalPhone(data.personalPhone || "");
              setPersonalEmail(data.personalEmail || "");
              setPersonalCountry(data.personalCountry || "India");
              setPersonalState(data.personalState || "");
              setPersonalDistrict(data.personalDistrict || "");
              setPersonalBlock(data.personalBlock || "");
              setPersonalTownVillage(data.personalTownVillage || "");
              setPersonalPin(data.personalPin || "");
              setPersonalAddress(data.personalAddress || "");
              setPersonalAadhaar(data.personalAadhaar || "");
              setPersonalPhoto(data.personalPhoto || "");
              setStaffMembers(data.staffMembers || []);
            }
          }
        } catch (error) {
          console.error("Error fetching user role", error);
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="w-12 h-12 border-4 border-[#0070F3] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const navItems: NavItem[] = [
    { id: "personal", label: "Personal Profile", icon: "👤", category: "1. Profile & Setup" },
    { id: "profile", label: "Supplier Profile", icon: "🏢", category: "1. Profile & Setup" },
    { id: "kyc", label: "Verification (KYC)", icon: "🛡️", category: "1. Profile & Setup" },
    { id: "operations", label: "Business Operations", icon: "⚙️", category: "1. Profile & Setup" },
    { id: "vanity_url", label: "Custom Brand URL", icon: "🔗", category: "1. Profile & Setup" },
    { id: "staff", label: "Staff Accounts", icon: "👥", category: "1. Profile & Setup" },
    { id: "pricing", label: "View Pricing Plans", icon: "💎", category: "1. Profile & Setup" },
    { id: "security", label: "Security & Login", icon: "🔐", category: "1. Profile & Setup" },
    { id: "home", label: "Inventory & Stock", icon: "📦", category: "Dashboard & Reports" },
    { id: "catalog", label: "Catalog Management", icon: "📋", category: "Catalog & Inventory" },
    { id: "pricing_rates", label: "Market Rates Update", icon: "📉", category: "Catalog & Inventory" },
    { id: "crm", label: "Weaver CRM & Orders", icon: "🤝", category: "Orders & Logistics" },
    { id: "finance", label: "Finance & Bank Payouts", icon: "💰", category: "Finance & Earnings" },
  ];

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode) return alert("Demo mode: Cannot save.");
    setIsSavingPersonal(true);
    try {
      let finalPhotoUrl = personalPhoto;
      if (personalPhoto && personalPhoto.startsWith("data:image")) {
        finalPhotoUrl = await uploadBase64ToStorage(personalPhoto, `kyc/${auth.currentUser?.uid}`);
        setPersonalPhoto(finalPhotoUrl);
      }

      const personalData = {
        personalName, personalDob, personalPhone, personalEmail,
        personalCountry, personalState, personalDistrict, personalBlock,
        personalTownVillage, personalPin, personalAddress,
        personalAadhaar, personalPhoto: finalPhotoUrl,
      };

      await updateDoc(doc(db, "suppliers", userUid), personalData);
      await updateDoc(doc(db, "users", userUid), personalData);
      alert("Personal Profile saved!");
    } catch (err) {
      console.error(err);
      alert("Error saving personal profile.");
    }
    setIsSavingPersonal(false);
  };

  const handleSaveKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode) return alert("Demo mode: Cannot save.");
    setIsSavingKyc(true);
    try {
      const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      let finalLogoUrl = profileImage;
      if (profileImage && profileImage.startsWith("data:image")) {
        finalLogoUrl = await uploadBase64ToStorage(profileImage, `profiles/${auth.currentUser?.uid}`);
        setProfileImage(finalLogoUrl);
      }

      let finalKycUrl = kycDocumentUrl;
      if (kycDocumentUrl && kycDocumentUrl.startsWith("data:image")) {
        finalKycUrl = await uploadBase64ToStorage(kycDocumentUrl, `kyc_docs/${auth.currentUser?.uid}`);
        setKycDocumentUrl(finalKycUrl);
      }

      const kycData = {
        gstNumber,
        udyamNumber,
        businessAddress,
        companyName,
        companyDesc,
        phone,
        whatsapp,
        state,
        district,
        city,
        profileImage: finalLogoUrl,
        materialTypes,
        supplyCapacity,
        slug,
        kycType,
        kycId,
        kycDocumentUrl: finalKycUrl,
      };

      await updateDoc(doc(db, "suppliers", userUid), kycData);
      await updateDoc(doc(db, "users", userUid), kycData);
      setStoreSlug(slug);
      alert("Profile saved!");
    } catch (err) {
      console.error(err);
      alert("Error saving.");
    }
    setIsSavingKyc(false);
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode) return alert("Demo mode: Cannot save.");
    setIsSavingBank(true);
    try {
      const bankData = {
        bankHolder,
        bankName,
        bankAccount,
        bankIfsc,
        bankUpi,
      };

      await updateDoc(doc(db, "suppliers", userUid), bankData);
      await updateDoc(doc(db, "users", userUid), bankData);
      alert("Bank details saved!");
    } catch (err) {
      console.error(err);
      alert("Error saving bank details.");
    }
    setIsSavingBank(false);
  };

  const totalStockKg = myMaterials.reduce((acc, curr) => acc + (Number(curr.stockKg) || 0), 0);

  return (
    <DashboardLayout
      userName={userName}
      userRole="supplier"
      userStatus="active"
      storeSlug={storeSlug || "b2b-supplier"}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      navItems={navItems}
      globalNotifications={[]}
      isSuperAdminViewAs={isDemoMode}
      isSellerMode={true}
      setIsSellerMode={() => router.push("/dashboard")}
    >
      <div className="p-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Raw Material Supplier Dashboard</h1>
            <p className="text-gray-500 mt-2 text-lg">Manage yarn inventory, daily market rates, and weaver orders.</p>
          </div>
          <div className="bg-indigo-50 text-indigo-800 px-4 py-2 rounded-xl font-bold border border-indigo-200">
            Supplier Mode Active
          </div>
        </div>

        {activeTab === "home" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-indigo-500">
              <h3 className="text-gray-500 font-bold mb-1">Total Stock (Kg)</h3>
              <p className="text-4xl font-black text-indigo-900">{totalStockKg}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-emerald-500">
              <h3 className="text-gray-500 font-bold mb-1">Active Materials</h3>
              <p className="text-4xl font-black text-emerald-900">{myMaterials.length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-amber-500">
              <h3 className="text-gray-500 font-bold mb-1">Pending Orders</h3>
              <p className="text-4xl font-black text-amber-900">{myOrders.length}</p>
            </div>
          </div>
        )}

        {activeTab === "catalog" && (
          <div className="animate-in fade-in space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Inventory Management</h2>
                <p className="text-gray-500">Upload raw materials with B2B Pricing and custom MOQ.</p>
              </div>
              <button 
                onClick={() => setIsUploadOpen(true)}
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg flex items-center gap-2"
              >
                <span>+</span> Add Raw Material
              </button>
            </div>

            {myMaterials.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-12 border-2 border-dashed border-gray-200 text-center">
                <p className="text-gray-500 font-medium">You have no active raw materials in stock.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {myMaterials.map(m => (
                  <div key={m.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="aspect-square relative bg-gray-100">
                      {m.img ? (
                        <Image src={m.img} alt={m.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                      )}
                      <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-md">{m.stockKg} Kg STOCK</div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-lg truncate">{m.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">{m.category} • {m.color}</p>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Price / Kg</span>
                        <span className="text-lg font-black text-gray-900">₹{m.pricePerKg}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "pricing_rates" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Daily Market Rates</h2>
            <p className="text-gray-500 mb-8">Update your base market prices for standard yarn types. These are visible publicly to weavers.</p>
            
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Cotton Yarn (Base)</h3>
                  <p className="text-xs text-gray-500">Per 10 Kg Bundle</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-bold">₹</span>
                  <input type="number" value={cottonPrice} onChange={e => setCottonPrice(e.target.value)} className="w-24 border border-gray-300 rounded-lg p-2 text-center font-bold text-gray-900 focus:ring-2 focus:ring-[#0074E4] outline-none" />
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Premium Silk Yarn</h3>
                  <p className="text-xs text-gray-500">Per Kg</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-bold">₹</span>
                  <input type="number" value={silkPrice} onChange={e => setSilkPrice(e.target.value)} className="w-24 border border-gray-300 rounded-lg p-2 text-center font-bold text-gray-900 focus:ring-2 focus:ring-[#0074E4] outline-none" />
                </div>
              </div>

              <button className="w-full bg-[#051815] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#0a2f29] transition-colors shadow-lg mt-4">
                Publish New Rates
              </button>
            </div>
          </div>
        )}

        {activeTab === "crm" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Weaver CRM & Orders</h2>
            {myOrders.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-gray-500 font-medium">No material orders yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                      <th className="p-4 font-bold border-b border-gray-100 rounded-tl-xl">Order ID</th>
                      <th className="p-4 font-bold border-b border-gray-100">Weaver</th>
                      <th className="p-4 font-bold border-b border-gray-100">Amount</th>
                      <th className="p-4 font-bold border-b border-gray-100">Status</th>
                      <th className="p-4 font-bold border-b border-gray-100 rounded-tr-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myOrders.map(order => (
                      <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="p-4 text-sm font-medium text-gray-900">{order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="p-4 text-sm font-medium text-gray-700">{order.customerName || 'Guest Weaver'}</td>
                        <td className="p-4 text-sm font-bold text-emerald-600">₹{order.total}</td>
                        <td className="p-4">
                          <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                            {order.status || 'Pending'}
                          </span>
                        </td>
                        <td className="p-4">
                          <button className="text-indigo-600 font-bold text-xs hover:underline">Process Order</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "personal" && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-3xl animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Personal Profile & KYC</h2>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
              <h3 className="text-red-800 font-bold text-sm mb-1">🔒 Strictly Confidential</h3>
              <p className="text-red-700 text-xs font-medium">This information is for official KYC and bank verification only. It will NEVER be shown publicly. A verified person must be behind every business.</p>
            </div>
            <form className="space-y-8" onSubmit={handleSavePersonal}>
              {/* Personal Photo */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Personal Photo (Owner / Director)</label>
                <ImageUploader 
                  value={personalPhoto} 
                  onChange={setPersonalPhoto}
                  label="Personal Photo"
                  aspectRatio="square"
                />
              </div>
              {/* Section 1: Personal Identity */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">1. Personal Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Full Name (As per Aadhaar / Bank)</label>
                    <input type="text" value={personalName} onChange={e => setPersonalName(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Date of Birth</label>
                    <input type="date" value={personalDob} onChange={e => setPersonalDob(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Personal Phone</label>
                    <input type="tel" value={personalPhone} onChange={e => setPersonalPhone(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" placeholder="+91..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Personal Email</label>
                    <input type="email" value={personalEmail} onChange={e => setPersonalEmail(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" placeholder="owner@email.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Aadhaar Number (Confidential)</label>
                    <input type="password" value={personalAadhaar} onChange={e => setPersonalAadhaar(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none font-mono" placeholder="XXXX XXXX XXXX" />
                  </div>
                </div>
              </div>
              {/* Section 2: Residential Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">2. Residential Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Country</label>
                    <select value={personalCountry} onChange={e => { setPersonalCountry(e.target.value); setPersonalState(""); setPersonalDistrict(""); }} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none">
                      <option value="India">India</option>
                      <option value="International">International</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">State</label>
                    {personalCountry === "India" ? (
                      <select value={personalState} onChange={e => { setPersonalState(e.target.value); setPersonalDistrict(""); }} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none">
                        <option value="">Select State...</option>
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <input type="text" value={personalState} onChange={e => setPersonalState(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" placeholder="Province / State" />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">District</label>
                    {personalCountry === "India" && personalState === "Odisha" ? (
                      <select value={personalDistrict} onChange={e => { setPersonalDistrict(e.target.value); setPersonalBlock(""); }} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none">
                        <option value="">Select District...</option>
                        {ODISHA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    ) : (
                      <input type="text" value={personalDistrict} onChange={e => setPersonalDistrict(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" placeholder="District" />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Block</label>
                    {personalCountry === "India" && personalState === "Odisha" && personalDistrict && ODISHA_DISTRICT_BLOCKS[personalDistrict] ? (
                      <select value={personalBlock} onChange={e => setPersonalBlock(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none">
                        <option value="">Select Block...</option>
                        {ODISHA_DISTRICT_BLOCKS[personalDistrict].map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    ) : (
                      <input type="text" value={personalBlock} onChange={e => setPersonalBlock(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" placeholder="Block / Tehsil" />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Town / Village</label>
                    <input type="text" value={personalTownVillage} onChange={e => setPersonalTownVillage(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">PIN Code</label>
                    <input type="text" value={personalPin} onChange={e => setPersonalPin(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" placeholder="6-digit PIN" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Full Street Address</label>
                    <textarea value={personalAddress} onChange={e => setPersonalAddress(e.target.value)} rows={2} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" />
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button type="submit" disabled={isSavingPersonal} className="bg-[#0070F3] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#005BB5] disabled:opacity-50 transition-colors shadow-sm">
                  {isSavingPersonal ? "Saving..." : "Save Personal Profile"}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "profile" && (

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Supplier Profile</h2>
            <form onSubmit={handleSaveKyc} className="space-y-6">

              {/* Company Logo */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Company Logo</label>
                <ImageUploader 
                  value={profileImage} 
                  onChange={setProfileImage}
                  label="Company Logo"
                  aspectRatio="square"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Company / Supplier Name</label>
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none bg-gray-50 focus:bg-white" placeholder="e.g. Sri Ram Yarn Suppliers" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Company Description</label>
                  <textarea value={companyDesc} onChange={e => setCompanyDesc(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none bg-gray-50 focus:bg-white resize-none" placeholder="Describe your materials, quality standards, and supply capabilities..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none bg-gray-50 focus:bg-white" placeholder="+91..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp Number</label>
                  <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none bg-gray-50 focus:bg-white" placeholder="+91..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Godown / Business Address</label>
                  <input type="text" value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none bg-gray-50 focus:bg-white" placeholder="Street, locality..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                  <select
                    value={state}
                    onChange={e => { setState(e.target.value); setDistrict(""); }}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none bg-gray-50 focus:bg-white"
                  >
                    <option value="">Select State...</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">District</label>
                  {state === "Odisha" ? (
                    <select
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none bg-gray-50 focus:bg-white"
                    >
                      <option value="">Select District...</option>
                      {ODISHA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none bg-gray-50 focus:bg-white"
                      placeholder="e.g. Bargarh"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">City / Pincode</label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none bg-gray-50 focus:bg-white" placeholder="e.g. Bargarh - 768028" />
                </div>
              </div>
              <button type="submit" disabled={isSavingKyc} className="w-full bg-[#0074E4] text-white font-bold py-4 rounded-xl hover:bg-[#005bb5] transition-colors disabled:opacity-50 text-lg shadow-lg">
                {isSavingKyc ? "Saving..." : "Save Profile Details"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "operations" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Supply Operations</h2>
            <form onSubmit={handleSaveKyc} className="space-y-8">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Primary Materials Supplied</label>
                    <input 
                      type="text" 
                      value={materialTypes}
                      onChange={e => setMaterialTypes(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="e.g. Cotton Yarn, Silk, Dyes"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Monthly Supply Capacity (Kg)</label>
                    <input 
                      type="text" 
                      value={supplyCapacity}
                      onChange={e => setSupplyCapacity(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="e.g. 1000 Kg"
                    />
                  </div>
                </div>
              </div>
              <button type="submit" disabled={isSavingKyc} className="w-full bg-[#0074E4] text-white font-bold py-4 rounded-xl hover:bg-[#005bb5] transition-colors disabled:opacity-50 text-lg shadow-lg">
                {isSavingKyc ? "Saving..." : "Save Operations"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "kyc" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">KYC & Registration</h2>
            <form onSubmit={handleSaveKyc} className="space-y-8">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">GST Number (Optional)</label>
                    <input
                      type="text"
                      value={gstNumber}
                      onChange={e => setGstNumber(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none bg-gray-50 focus:bg-white"
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Udyam Registration</label>
                    <input
                      type="text"
                      value={udyamNumber}
                      onChange={e => setUdyamNumber(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none bg-gray-50 focus:bg-white"
                      placeholder="UDYAM-XX-00-0000000"
                    />
                  </div>
                  <div className="md:col-span-2 border-t border-gray-100 pt-6 mt-2">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">KYC Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">KYC Document Type</label>
                        <select value={kycType} onChange={e => setKycType(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0074E4]/15 rounded-xl p-3 text-gray-900 focus:border-[#0074E4] outline-none" required>
                          <option value="">Select Document Type...</option>
                          <option value="gst">GST Registration Number</option>
                          <option value="udyam">Aadhaar Udyam Number</option>
                          <option value="aadhaar">Personal Aadhaar Card</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Document ID / Number</label>
                        <input type="text" value={kycId} onChange={e => setKycId(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0074E4]/15 rounded-xl p-3 text-gray-900 focus:border-[#0074E4] outline-none" required />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Upload KYC Document (Photo/PDF)</label>
                        <ImageUploader 
                          value={kycDocumentUrl} 
                          onChange={setKycDocumentUrl}
                          label="KYC Document"
                          aspectRatio="landscape"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={isSavingKyc} className="w-full bg-[#0074E4] text-white font-bold py-4 rounded-xl hover:bg-[#005bb5] transition-colors disabled:opacity-50 text-lg shadow-lg">
                {isSavingKyc ? "Saving..." : "Save KYC"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "finance" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bank Details</h2>
            <form onSubmit={handleSaveKyc} className="space-y-8">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Account Holder Name</label>
                    <input 
                      type="text" 
                      value={bankHolder}
                      onChange={e => setBankHolder(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="Name on bank account"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Bank Name</label>
                    <input 
                      type="text" 
                      value={bankName}
                      onChange={e => setBankName(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="e.g. HDFC Bank"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Account Number</label>
                    <input 
                      type="password" 
                      value={bankAccount}
                      onChange={e => setBankAccount(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="XXXX XXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">IFSC Code</label>
                    <input 
                      type="text" 
                      value={bankIfsc}
                      onChange={e => setBankIfsc(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none transition-all uppercase bg-gray-50 focus:bg-white"
                      placeholder="HDFC0001234"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">UPI ID</label>
                    <input 
                      type="text" 
                      value={bankUpi}
                      onChange={e => setBankUpi(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="yourupi@bank"
                    />
                  </div>
                </div>
              </div>
              <button type="submit" disabled={isSavingBank} className="w-full bg-[#0074E4] text-white font-bold py-4 rounded-xl hover:bg-[#005bb5] transition-colors disabled:opacity-50 text-lg shadow-lg">
                {isSavingBank ? "Saving..." : "Save Bank Details"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "staff" && (
          <div className="animate-in fade-in max-w-2xl">
            <StaffAccountsTab 
              userUid={userUid}
              roleType="supplier"
              staffMembers={staffMembers}
              setStaffMembers={setStaffMembers}
            />
          </div>
        )}

        {activeTab === "security" && (
          <div className="animate-in fade-in max-w-2xl">
            <SecurityTab />
          </div>
        )}

        {activeTab === "finance" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Finance & Bank Payouts</h2>
            <p className="text-gray-500 mb-6 text-sm">Add your bank account to receive settlement payouts directly.</p>
            <form onSubmit={handleSaveBank} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Account Holder Name</label>
                  <input type="text" value={bankHolder} onChange={e => setBankHolder(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none bg-gray-50 focus:bg-white" placeholder="Name on bank account" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Bank Name</label>
                  <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none bg-gray-50 focus:bg-white" placeholder="e.g. SBI" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Account Number</label>
                  <input type="password" value={bankAccount} onChange={e => setBankAccount(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none bg-gray-50 focus:bg-white" placeholder="XXXX XXXX" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">IFSC Code</label>
                  <input type="text" value={bankIfsc} onChange={e => setBankIfsc(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none uppercase bg-gray-50 focus:bg-white" placeholder="SBIN0001234" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">UPI ID</label>
                  <input type="text" value={bankUpi} onChange={e => setBankUpi(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none bg-gray-50 focus:bg-white" placeholder="yourupi@bank" />
                </div>
              </div>
              <button type="submit" disabled={isSavingBank} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 text-lg shadow-lg">
                {isSavingBank ? "Saving..." : "Save Bank Details"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "vanity_url" && (
          <div className="animate-in fade-in max-w-4xl">
            <VanityUrlManager currentSlug={storeSlug} roleType="supplier" />
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="animate-in fade-in">
            <PricingTab isPublicPage={false} userRole="supplier" />
          </div>
        )}
        <SupplierInventoryUpload 
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          sellerId={userUid}
        />
      </div>
    </DashboardLayout>
  );
}
