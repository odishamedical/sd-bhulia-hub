"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "../../components/Header";
import ImageCropperModal from "@/components/ImageCropperModal";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir"
].sort();

const ODISHA_DISTRICTS = [
  "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", 
  "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", 
  "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar (Keonjhar)", 
  "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", 
  "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur (Sonepur)", "Sundargarh"
].sort();

function ProfileContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const intent = searchParams?.get("intent");

  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  const [franchiseApps, setFranchiseApps] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");
  
  // Profile Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [customPhotoUrl, setCustomPhotoUrl] = useState("");
  
  // Image Upload State
  const [isCropping, setIsCropping] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Address State
  const [addresses, setAddresses] = useState<unknown[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [country, setCountry] = useState("India");
  const [otherCountry, setOtherCountry] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [localAddress, setLocalAddress] = useState("");
  const [pinCode, setPinCode] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orders, setOrders] = useState<unknown[]>([]);

  useEffect(() => {
    if (!user) {
      // If no user, mock check for demo
      const localRole = localStorage.getItem("sd_current_user_role");
      if (!localRole) {
        router.push("/");
        return;
      }
    }

    async function fetchProfile() {
      const uid = user?.uid || localStorage.getItem("sd_current_user_uid") || "demo_user";
      setName(user?.displayName || localStorage.getItem("sd_current_user_name") || "");
      
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.customPhotoUrl) {
            setCustomPhotoUrl(data.customPhotoUrl);
          }
          if (data.phone && data.addresses && data.addresses.length > 0) {
            setProfileComplete(true);
            setPhone(data.phone || "");
            setWhatsapp(data.whatsapp || "");
            setAddresses(data.addresses || []);
            
            // If they were trying to checkout, send them back
            if (intent === "checkout") {
              router.push("/checkout");
            }
          }
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      }

      try {
        const q = query(collection(db, "franchises"), where("userId", "==", uid));
        const snapshot = await getDocs(q);
        const apps: any[] = [];
        snapshot.forEach(doc => {
          apps.push({ id: doc.id, ...doc.data() });
        });

        const localApps = JSON.parse(localStorage.getItem("sd_franchise_applications") || "[]");
        const combined = [...apps];
        
        localApps.forEach((la: any) => {
          if (!combined.find(ca => ca.id === la.id)) {
             combined.push(la);
          }
        });
        
        setFranchiseApps(combined);
      } catch (e) {
        console.warn("Could not load franchise apps", e);
      }
      
      setLoading(false);
    };

    fetchProfile();
    // FORCE REDIRECT TO UNIFIED DASHBOARD
    router.replace("/dashboard");
  }, [user, intent, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const uid = user?.uid || localStorage.getItem("sd_current_user_uid") || "demo_user";
    
    const newAddress = {
      id: Date.now().toString(),
      country: country === "Other" ? otherCountry : country,
      state,
      district,
      localAddress,
      pinCode,
      isDefault: addresses.length === 0
    };

    const updatedAddresses = [...addresses, newAddress];

    const payload = {
      name,
      phone,
      whatsapp,
      addresses: updatedAddresses,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, "users", uid), payload, { merge: true });
      setAddresses(updatedAddresses);
      setProfileComplete(true);
      setShowAddressForm(false);
      
      if (intent === "checkout") {
        router.push("/checkout");
      }
    } catch (err) {
      console.error("Error saving profile", err);
      alert("Failed to save profile. Please try again.");
    }
    
    setIsSubmitting(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setSelectedImageSrc(reader.result?.toString() || "");
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsCropping(false);
    setLoading(true);
    const uid = user?.uid || localStorage.getItem("sd_current_user_uid") || "demo_user";
    try {
      const { storage } = await import('@/lib/firebase');
      const storageRef = ref(storage, `users/${uid}/profile.jpg`);
      await uploadBytes(storageRef, croppedBlob);
      const downloadURL = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "users", uid), { customPhotoUrl: downloadURL });
      setCustomPhotoUrl(downloadURL);
    } catch (err) {
      console.error("Error uploading photo", err);
      alert("Failed to upload photo.");
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0A2520] flex justify-center items-center"><div className="animate-pulse text-[#C5A059] font-mono text-sm">Loading Profile...</div></div>;
  }

  // ==========================================
  // INCOMPLETE PROFILE / NEW ADDRESS FORM VIEW
  // ==========================================
  if (!profileComplete || showAddressForm) {
    return (
      <div className="min-h-screen bg-[#0A2520] flex flex-col">
        
        <div className="py-12 px-4 sm:px-6 flex-1">
          <div className="max-w-3xl mx-auto bg-[#051815] rounded-3xl border border-[#C5A059]/30 p-6 md:p-10 shadow-2xl">
            <div className="text-center mb-10">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#C5A059]">
              {profileComplete ? "Add New Delivery Address" : "Complete Your Profile"}
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              {intent === "checkout" 
                ? "Please complete your delivery details to proceed with your purchase." 
                : "Enter your primary shipping and contact details."}
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-8">
            {/* Contact Details (Only show if profile not complete) */}
            {!profileComplete && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-[#C5A059]/20 pb-2">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Full Name *</label>
                    <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full bg-[#0A2520] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#C5A059]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Phone Number *</label>
                    <input required value={phone} onChange={e => setPhone(e.target.value)} type="tel" className="w-full bg-[#0A2520] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#C5A059]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">WhatsApp Number *</label>
                    <input required value={whatsapp} onChange={e => setWhatsapp(e.target.value)} type="tel" className="w-full bg-[#0A2520] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#C5A059]" />
                  </div>
                </div>
              </div>
            )}

            {/* Address Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-[#C5A059]/20 pb-2">Delivery Address</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Country *</label>
                  <select required value={country} onChange={e => { setCountry(e.target.value); setState(""); setDistrict(""); }} className="w-full bg-[#0A2520] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#C5A059]">
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UAE">UAE</option>
                    <option value="UK">UK / England</option>
                    <option value="Australia">Australia</option>
                    <option value="France">France</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {country === "Other" && (
                  <div>
                    <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Enter Your Country *</label>
                    <input required value={otherCountry} onChange={e => setOtherCountry(e.target.value)} type="text" className="w-full bg-[#0A2520] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. Canada" />
                  </div>
                )}
                {country === "India" ? (
                  <div>
                    <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">State/Region *</label>
                    <select required value={state} onChange={e => { setState(e.target.value); setDistrict(""); }} className="w-full bg-[#0A2520] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#C5A059]">
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                ) : country ? (
                  <div>
                    <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">State/Region *</label>
                    <input required value={state} onChange={e => setState(e.target.value)} type="text" className="w-full bg-[#0A2520] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. Nairobi" />
                  </div>
                ) : null}

                {state === "Odisha" ? (
                  <div>
                    <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">District *</label>
                    <select required value={district} onChange={e => setDistrict(e.target.value)} className="w-full bg-[#0A2520] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#C5A059]">
                      <option value="">Select District</option>
                      {ODISHA_DISTRICTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                ) : state ? (
                  <div>
                    <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">City/District *</label>
                    <input required value={district} onChange={e => setDistrict(e.target.value)} type="text" className="w-full bg-[#0A2520] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#C5A059]" />
                  </div>
                ) : null}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Local Address (Town/Village, House No, Street) *</label>
                <textarea required value={localAddress} onChange={e => setLocalAddress(e.target.value)} rows={3} className="w-full bg-[#0A2520] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#C5A059]"></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">PIN / Zip Code *</label>
                <input required value={pinCode} onChange={e => setPinCode(e.target.value)} type="text" className="w-full bg-[#0A2520] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#C5A059] max-w-xs" />
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              {profileComplete && (
                <button type="button" onClick={() => setShowAddressForm(false)} className="w-1/3 py-4 rounded-xl border border-gray-600 text-gray-300 font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-all">
                  Cancel
                </button>
              )}
              <button disabled={isSubmitting} type="submit" className="flex-1 bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:brightness-110 transition-all shadow-lg disabled:opacity-50">
                {isSubmitting ? "Saving..." : (profileComplete ? "Save New Address" : "Save Profile & Continue")}
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD VIEW
  // ==========================================
  return (
    <div className="min-h-screen bg-[#051815] text-white font-sans flex flex-col">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full flex-1">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {customPhotoUrl || user?.photoURL ? (
                <img src={customPhotoUrl || user?.photoURL || ""} alt="Profile" className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-[#C5A059] shadow-lg object-cover group-hover:brightness-75 transition-all" />
              ) : (
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-[#C5A059] bg-[#0A3A35] flex items-center justify-center text-xl font-bold text-[#C5A059] shadow-lg group-hover:brightness-75 transition-all">
                  {name ? name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
            
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#C5A059]">Welcome, {name}</h1>
              <p className="text-gray-300 text-xs md:text-sm mt-1">Manage your orders, addresses, and partnerships.</p>
            </div>
          </div>
          <Link href="/" className="px-6 py-2 border border-[#C5A059]/40 text-[#C5A059] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#C5A059]/10 transition-colors inline-block text-center">
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 lg:gap-8 mt-6 lg:mt-12">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1 flex flex-row lg:flex-col overflow-x-auto hide-scrollbar border-b border-[#C5A059]/30 lg:border-none lg:space-y-2 z-10 relative">
            <button onClick={() => setActiveTab("orders")} className={`flex-1 flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 px-1 py-3 lg:py-4 lg:rounded-2xl font-bold uppercase tracking-wider text-[10px] sm:text-xs text-center transition-all ${activeTab === "orders" ? "bg-[#051815] text-[#C5A059] lg:bg-[#C5A059] lg:text-[#0A1021] border-t border-l border-r border-[#C5A059]/30 lg:border-none rounded-t-xl" : "text-gray-400 hover:text-gray-200 lg:text-gray-300 lg:bg-[#051815] lg:border lg:border-[#C5A059]/20 lg:rounded-2xl"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              My Orders
            </button>
            <button onClick={() => setActiveTab("addresses")} className={`flex-1 flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 px-1 py-3 lg:py-4 lg:rounded-2xl font-bold uppercase tracking-wider text-[10px] sm:text-xs text-center transition-all ${activeTab === "addresses" ? "bg-[#051815] text-[#C5A059] lg:bg-[#C5A059] lg:text-[#0A1021] border-t border-l border-r border-[#C5A059]/30 lg:border-none rounded-t-xl" : "text-gray-400 hover:text-gray-200 lg:text-gray-300 lg:bg-[#051815] lg:border lg:border-[#C5A059]/20 lg:rounded-2xl"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Address Book
            </button>
            <button onClick={() => setActiveTab("partnership")} className={`flex-1 flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 px-1 py-3 lg:py-4 lg:rounded-2xl font-bold uppercase tracking-wider text-[10px] sm:text-xs text-center transition-all ${activeTab === "partnership" ? "bg-[#051815] text-[#C5A059] lg:bg-[#C5A059] lg:text-[#0A1021] border-t border-l border-r border-[#C5A059]/30 lg:border-none rounded-t-xl" : "text-gray-400 hover:text-gray-200 lg:text-gray-300 lg:bg-[#051815] lg:border lg:border-[#C5A059]/20 lg:rounded-2xl"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              Partnerships
            </button>
          </div>

          {/* RIGHT COLUMN - CONTENT */}
          <div className="lg:col-span-3 bg-[#051815] rounded-b-3xl rounded-tr-3xl lg:rounded-tl-3xl border-x border-b border-[#C5A059]/30 lg:border-t p-6 md:p-8 shadow-2xl min-h-[500px] -mt-px lg:mt-0 relative z-0">
            
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold font-serif text-[#C5A059] border-b border-[#C5A059]/20 pb-4">Order History & Tracking</h2>
                
                {orders.length === 0 ? (
                  <div className="text-center py-10 bg-[#051815] rounded-xl border border-[#C5A059]/10">
                    <p className="text-gray-400 text-sm">You have no active orders yet.</p>
                    <Link href="/" className="mt-4 inline-block px-6 py-2 border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#C5A059]/10 transition-colors">Start Shopping</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order, idx) => (
                      <div key={idx} className="bg-[#051815] border border-[#C5A059]/30 rounded-xl p-5 hover:border-[#C5A059]/50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="font-bold text-white text-sm">{order.id}</span>
                            <span className="ml-3 px-2 py-0.5 bg-[#0D4B45] text-[#4ADE80] text-[10px] font-bold uppercase rounded">{order.status}</span>
                            <p className="text-gray-400 text-xs mt-1">Placed on: {order.date}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[#C5A059] font-bold">{order.total}</span>
                          </div>
                        </div>
                        <div className="border-t border-[#C5A059]/10 pt-4 flex justify-between items-center">
                          <p className="text-sm text-gray-300">{order.items[0]} {order.items.length > 1 && `+ ${order.items.length - 1} more`}</p>
                          <button className="text-xs font-bold text-[#C5A059] hover:text-white transition-colors uppercase tracking-wider">Track Package →</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Address Book Tab */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-[#C5A059]/20 pb-4">
                  <h2 className="text-xl font-serif font-bold text-[#C5A059]">Saved Addresses</h2>
                  <button onClick={() => setShowAddressForm(true)} className="px-4 py-2 bg-[#0A3A35] text-[#C5A059] border border-[#C5A059]/40 hover:bg-[#C5A059] hover:text-[#0A1021] transition-all rounded-lg text-xs font-bold uppercase tracking-wider">
                    + Add New
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map(addr => (
                    <div key={addr.id} className="bg-[#0A2520] border border-[#C5A059]/20 rounded-2xl p-5 relative">
                      {addr.isDefault && (
                        <span className="absolute top-4 right-4 text-[9px] bg-[#C5A059]/20 text-[#C5A059] px-2 py-1 rounded uppercase tracking-widest font-bold">Default</span>
                      )}
                      <p className="font-bold text-white mb-2">{name}</p>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {addr.localAddress}<br/>
                        {addr.district}, {addr.state} - {addr.pinCode}<br/>
                        {addr.country}
                      </p>
                      <p className="text-xs text-gray-400 mt-3 font-mono">Ph: {phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Partnership Tab */}
            {activeTab === "partnership" && (
              <div className="space-y-6">
                {franchiseApps.length > 0 && (
                  <div className="bg-[#0A3A35]/30 border border-[#C5A059]/40 rounded-2xl p-6 mb-8">
                    <h2 className="text-xl font-serif font-bold text-[#C5A059] mb-4">My Partner Hubs</h2>
                    <div className="space-y-4">
                      {franchiseApps.map((app: any) => (
                        <div key={app.id} className="bg-[#051815] border border-[#C5A059]/20 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <p className="font-bold text-white text-sm">{app.hubName || app.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono mt-1">Tier: {app.tier} | Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "Recently"}</p>
                          </div>
                          <Link href="/franchise/dashboard" className="px-5 py-2.5 bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] font-bold text-xs uppercase tracking-wider rounded-lg hover:brightness-110 shadow-lg text-center whitespace-nowrap">
                            Access Dashboard →
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <h2 className="text-xl font-serif font-bold text-[#C5A059] border-b border-[#C5A059]/20 pb-4">Become a Bhulia Partner</h2>
                <p className="text-sm text-gray-300">Expand your business by joining the Bhulia Hub ecosystem. Choose a partnership model below to start your onboarding process.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <Link href="/register-weaver" className="bg-[#0A2520] border border-[#C5A059]/30 hover:border-[#C5A059] p-6 rounded-2xl transition-all group flex flex-col items-center text-center">
                    <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🧵</span>
                    <h3 className="font-bold text-[#C5A059] text-sm uppercase tracking-widest mb-2">Weaver Node</h3>
                    <p className="text-xs text-gray-400">Direct-to-Consumer portal for rural weaver clusters.</p>
                  </Link>

                  <Link href="/register-store" className="bg-[#0A2520] border border-[#C5A059]/30 hover:border-[#C5A059] p-6 rounded-2xl transition-all group flex flex-col items-center text-center">
                    <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏛️</span>
                    <h3 className="font-bold text-[#C5A059] text-sm uppercase tracking-widest mb-2">Retail Store</h3>
                    <p className="text-xs text-gray-400">Onboard your physical boutique or cooperative society.</p>
                  </Link>

                  <Link href="/register-franchise" className="bg-[#0A2520] border border-[#C5A059]/30 hover:border-[#C5A059] p-6 rounded-2xl transition-all group flex flex-col items-center text-center">
                    <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏪</span>
                    <h3 className="font-bold text-[#C5A059] text-sm uppercase tracking-widest mb-2">Franchise Hub</h3>
                    <p className="text-xs text-gray-400">Apply for a premium dropshipping logistics node.</p>
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      
      {isCropping && selectedImageSrc && (
        <ImageCropperModal
          imageSrc={selectedImageSrc}
          aspect={1}
          onClose={() => { setIsCropping(false); setSelectedImageSrc(""); }}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A2520] flex justify-center items-center"><div className="animate-pulse text-[#C5A059] font-mono text-sm">Loading Profile...</div></div>}>
      <ProfileContent />
    </Suspense>
  );
}
