"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function AdminSettings() {
  const [globalCommission, setGlobalCommission] = useState("5");
  const [weaverCommission, setWeaverCommission] = useState("2");
  const [storeCommission, setStoreCommission] = useState("5");
  const [wholesalerCommission, setWholesalerCommission] = useState("8");
  const [supplierCommission, setSupplierCommission] = useState("10");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const snap = await getDoc(doc(db, "settings", "platform"));
        if (snap.exists()) {
          const data = snap.data();
          if (data.globalCommissionRate !== undefined) setGlobalCommission(String(data.globalCommissionRate));
          if (data.weaverCommissionRate !== undefined) setWeaverCommission(String(data.weaverCommissionRate));
          if (data.storeCommissionRate !== undefined) setStoreCommission(String(data.storeCommissionRate));
          if (data.wholesalerCommissionRate !== undefined) setWholesalerCommission(String(data.wholesalerCommissionRate));
          if (data.supplierCommissionRate !== undefined) setSupplierCommission(String(data.supplierCommissionRate));
        }
      } catch (err) {
        console.error("Failed to load platform settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "platform"), {
        globalCommissionRate: parseFloat(globalCommission) || 5,
        weaverCommissionRate: parseFloat(weaverCommission) || 2,
        storeCommissionRate: parseFloat(storeCommission) || 5,
        wholesalerCommissionRate: parseFloat(wholesalerCommission) || 8,
        supplierCommissionRate: parseFloat(supplierCommission) || 10,
      }, { merge: true });
      alert("Settings saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
  }

  const InputRow = ({ label, value, onChange, desc }: any) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <label className="block text-sm font-bold text-gray-900">{label}</label>
        {desc && <p className="text-xs text-gray-500 mt-1">{desc}</p>}
      </div>
      <div className="relative w-32">
        <input
          type="number"
          step="0.1"
          min="0"
          max="100"
          className="w-full pl-4 pr-10 py-2 border-2 border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-[#0070F3] transition-all"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Platform Settings</h2>
        <p className="text-gray-500 mt-2 font-medium">Manage global configurations for the Bhulia ecosystem.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Financial Engine</h3>
        
        <div className="space-y-4">
          <InputRow 
            label="Global Default Commission" 
            desc="Fallback percentage deducted if a role-specific rate is missing."
            value={globalCommission} 
            onChange={setGlobalCommission} 
          />
          <InputRow 
            label="Weaver Commission" 
            desc="Deducted from Master Weavers (B2C & B2B)."
            value={weaverCommission} 
            onChange={setWeaverCommission} 
          />
          <InputRow 
            label="Retail Store Commission" 
            desc="Deducted from Retail Stores & Boutiques."
            value={storeCommission} 
            onChange={setStoreCommission} 
          />
          <InputRow 
            label="Wholesaler Commission" 
            desc="Deducted from Wholesalers selling bulk items."
            value={wholesalerCommission} 
            onChange={setWholesalerCommission} 
          />
          <InputRow 
            label="Supplier Commission" 
            desc="Deducted from Raw Material Suppliers."
            value={supplierCommission} 
            onChange={setSupplierCommission} 
          />
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
