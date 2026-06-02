"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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

  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");
  
  // Profile Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  
  // Address State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [localAddress, setLocalAddress] = useState("");
  const [pinCode, setPinCode] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      // If no user, mock check for demo
      const localRole = localStorage.getItem("sd_current_user_role");
      if (!localRole) {
        router.push("/");
        return;
      }
    }

    const fetchProfile = async () => {
      const uid = user?.uid || localStorage.getItem("sd_current_user_uid") || "demo_user";
      setName(user?.displayName || localStorage.getItem("sd_current_user_name") || "");
      
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
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
      setLoading(false);
    };

    fetchProfile();
  }, [user, intent, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const uid = user?.uid || localStorage.getItem("sd_current_user_uid") || "demo_user";
    
    const newAddress = {
      id: Date.now().toString(),
      country,
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

  // Mock Orders Data
  const mockOrders = [
    {
      id: "ORD-928174",
      date: "May 28, 2026",
      total: "₹ 12,500",
      status: "Shipped",
      items: ["Royal Pasapalli Mercerized Cotton Ikat Saree"]
    }
  ];

  if (loading) {
    return <div className="min-h-screen bg-[#0A2520] flex justify-center items-center"><div className="animate-pulse text-[#C5A059] font-mono text-sm">Loading Profile...</div></div>;
  }

  // ==========================================
  // INCOMPLETE PROFILE / NEW ADDRESS FORM VIEW
  // ==========================================
  if (!profileComplete || showAddressForm) {
    return (
      <div className="min-h-screen bg-[#0A2520] py-12 px-4 sm:px-6">
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
                    <option value="Other">Other</option>
                  </select>
                </div>

                {country === "India" ? (
                  <div>
                    <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">State *</label>
                    <select required value={state} onChange={e => { setState(e.target.value); setDistrict(""); }} className="w-full bg-[#0A2520] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#C5A059]">
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                ) : country === "Other" ? (
                  <div>
                    <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">State/Region *</label>
                    <input required value={state} onChange={e => setState(e.target.value)} type="text" className="w-full bg-[#0A2520] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#C5A059]" />
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
                ) : state && country === "India" ? (
                  <div>
                    <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">District/City *</label>
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
    );
  }

  // ==========================================
  // COMPLETE PROFILE / PRIVATE DASHBOARD VIEW
  // ==========================================
  return (
    <div className="min-h-screen bg-[#0A2520] py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#C5A059]">Welcome, {name}</h1>
            <p className="text-gray-300 text-sm mt-1">Manage your orders, addresses, and partnerships from this private dashboard.</p>
          </div>
          <Link href="/" className="px-6 py-2 border border-[#C5A059]/40 text-[#C5A059] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#C5A059]/10 transition-colors inline-block text-center">
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1 space-y-2">
            <button onClick={() => setActiveTab("orders")} className={`w-full text-left px-5 py-4 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all ${activeTab === "orders" ? "bg-[#C5A059] text-[#0A1021] shadow-lg" : "bg-[#051815] text-gray-300 hover:bg-[#0A3A35] border border-[#C5A059]/20"}`}>
              📦 My Orders
            </button>
            <button onClick={() => setActiveTab("addresses")} className={`w-full text-left px-5 py-4 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all ${activeTab === "addresses" ? "bg-[#C5A059] text-[#0A1021] shadow-lg" : "bg-[#051815] text-gray-300 hover:bg-[#0A3A35] border border-[#C5A059]/20"}`}>
              📍 Address Book
            </button>
            <button onClick={() => setActiveTab("partnership")} className={`w-full text-left px-5 py-4 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all ${activeTab === "partnership" ? "bg-[#C5A059] text-[#0A1021] shadow-lg" : "bg-[#051815] text-gray-300 hover:bg-[#0A3A35] border border-[#C5A059]/20"}`}>
              🤝 Partnerships
            </button>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 bg-[#051815] rounded-3xl border border-[#C5A059]/30 p-6 md:p-8 shadow-2xl min-h-[500px]">
            
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h2 className="text-xl font-serif font-bold text-[#C5A059] border-b border-[#C5A059]/20 pb-4">Order History & Tracking</h2>
                
                {mockOrders.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <span className="text-4xl mb-4 block">🛍️</span>
                    <p>You have not placed any orders yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockOrders.map(order => (
                      <div key={order.id} className="bg-[#0A2520] border border-[#C5A059]/20 rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-bold text-white">{order.id}</span>
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-[10px] uppercase font-bold tracking-widest">{order.status}</span>
                          </div>
                          <p className="text-xs text-gray-400 mb-1">Placed on: {order.date}</p>
                          <p className="text-sm text-gray-300 font-serif">{order.items.join(", ")}</p>
                        </div>
                        <div className="md:text-right flex flex-col justify-between">
                          <p className="text-lg font-bold text-[#C5A059]">{order.total}</p>
                          <button className="text-xs text-[#C5A059] hover:underline uppercase tracking-widest font-bold mt-2">Track Package →</button>
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
