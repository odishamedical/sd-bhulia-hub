"use client";

import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

type EntityType = "weaver" | "store" | "franchise";

export default function EcosystemHubPage() {
  const [entityType, setEntityType] = useState<EntityType>("weaver");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    village: "",
    cluster: "Bargarh",
    gstNumber: "",
    businessName: "",
    commissionRate: "10",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleManualInject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Base payload common to all ecosystem entities
      const payload: any = {
        displayName: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: entityType,
        status: "active", // God mode bypasses pending state
        kycStatus: "verified_by_super_admin",
        createdAt: serverTimestamp(),
        manuallyCreated: true,
      };

      // Add specific fields based on entity type
      if (entityType === "weaver") {
        payload.village = formData.village;
        payload.cluster = formData.cluster;
        payload.rating = 5.0; // Default God mode rating
      } else if (entityType === "store") {
        payload.businessName = formData.businessName;
        payload.gstNumber = formData.gstNumber;
      } else if (entityType === "franchise") {
        payload.businessName = formData.businessName;
        payload.clusterRegion = formData.cluster;
        payload.commissionRate = Number(formData.commissionRate);
      }

      // Add to Firestore
      const docRef = await addDoc(collection(db, "users"), payload);
      
      setMessage({
        type: "success",
        text: `Successfully injected ${entityType} into the ecosystem. ID: ${docRef.id}`
      });

      // Reset form
      setFormData({
        name: "", email: "", phone: "", village: "", cluster: "Bargarh", gstNumber: "", businessName: "", commissionRate: "10"
      });

    } catch (error: any) {
      console.error("Injection failed:", error);
      setMessage({
        type: "error",
        text: `Failed to inject record: ${error.message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ecosystem Hub (God Mode)</h1>
        <p className="text-sm text-gray-500 mt-1">
          Bypass standard KYC funnels. Instantly create verified entities directly into the production database.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Entity Injector Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>⚡</span> Universal Entity Injector
            </h2>
          </div>
          
          <form onSubmit={handleManualInject} className="p-6 space-y-6">
            
            {/* Type Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Entity Type</label>
              <div className="flex gap-4">
                {(["weaver", "store", "franchise"] as EntityType[]).map((type) => (
                  <label key={type} className={`
                    flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${entityType === type ? 'border-blue-600 bg-blue-50/50 text-blue-700' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50 text-gray-500'}
                  `}>
                    <input type="radio" className="sr-only" checked={entityType === type} onChange={() => setEntityType(type)} />
                    <span className="text-2xl mb-2">
                      {type === "weaver" ? "🧵" : type === "store" ? "🏛️" : "🏪"}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-100 my-4"></div>

            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Primary Contact Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Ramesh Meher" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number (For Auth)</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 9999999999" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address (Optional)</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="email@example.com" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              </div>
            </div>

            {/* Conditional Fields: Weaver */}
            {entityType === "weaver" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-blue-50/30 rounded-xl border border-blue-100">
                <div>
                  <label className="block text-[11px] font-bold text-blue-800 uppercase tracking-wider mb-1.5">Village Name</label>
                  <input required type="text" name="village" value={formData.village} onChange={handleInputChange} placeholder="e.g. Barpali" className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-lg text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-blue-800 uppercase tracking-wider mb-1.5">Handloom Cluster</label>
                  <select name="cluster" value={formData.cluster} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-lg text-sm outline-none">
                    <option value="Bargarh">Bargarh Cluster</option>
                    <option value="Sonepur">Sonepur Cluster</option>
                    <option value="Nuapatna">Nuapatna Cluster</option>
                    <option value="Sambalpur">Sambalpur Cluster</option>
                  </select>
                </div>
              </div>
            )}

            {/* Conditional Fields: Store & Franchise */}
            {(entityType === "store" || entityType === "franchise") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-amber-50/50 rounded-xl border border-amber-100">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1.5">Business / Retail Name</label>
                  <input required type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} placeholder="e.g. Odia Weaves Emporium" className="w-full px-3 py-2.5 bg-white border border-amber-200 rounded-lg text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1.5">GST Number</label>
                  <input required={entityType === "store"} type="text" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} placeholder="21AAAAA1234A1Z5" className="w-full px-3 py-2.5 bg-white border border-amber-200 rounded-lg text-sm outline-none uppercase" />
                </div>
                {entityType === "franchise" ? (
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1.5">Commission Rate (%)</label>
                    <input required type="number" name="commissionRate" value={formData.commissionRate} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-white border border-amber-200 rounded-lg text-sm outline-none" />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1.5">Store Location</label>
                    <input required type="text" name="village" value={formData.village} onChange={handleInputChange} placeholder="City, State" className="w-full px-3 py-2.5 bg-white border border-amber-200 rounded-lg text-sm outline-none" />
                  </div>
                )}
              </div>
            )}

            {message && (
              <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {message.text}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:bg-blue-700 hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Injecting...</>
                ) : (
                  <>Force Create Entity <span>🚀</span></>
                )}
              </button>
            </div>
            
          </form>
        </div>

        {/* Info Side Panel */}
        <div className="space-y-6">
          <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-red-500">⚠️</span> God Mode Rules
            </h3>
            <ul className="space-y-3 text-xs text-gray-300 mt-4 relative z-10">
              <li className="flex gap-2">
                <span className="text-blue-400">✓</span>
                Entities created here bypass the standard 2-day manual verification hold.
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400">✓</span>
                `kycStatus` is immediately set to `verified_by_super_admin`.
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400">✓</span>
                They will not trigger Red Badges in the sidebar since they skip the pending queue.
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
