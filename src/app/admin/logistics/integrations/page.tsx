"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function LogisticsIntegrationsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // API Keys state
  const [shiprocketKey, setShiprocketKey] = useState("");
  const [clickpostKey, setClickpostKey] = useState("");
  const [eshopboxKey, setEshopboxKey] = useState("");

  // Routing Rules state (Store ID -> Provider)
  const [routingRules, setRoutingRules] = useState<{storeId: string, provider: string}[]>([]);
  const [newVendorId, setNewVendorId] = useState("");
  const [newProvider, setNewProvider] = useState("shiprocket");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "admin_settings", "logistics");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setShiprocketKey(data.shiprocketKey || "");
          setClickpostKey(data.clickpostKey || "");
          setEshopboxKey(data.eshopboxKey || "");
          setRoutingRules(data.routingRules || []);
        }
      } catch (error) {
        console.error("Error fetching logistics settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "admin_settings", "logistics"), {
        shiprocketKey,
        clickpostKey,
        eshopboxKey,
        routingRules
      }, { merge: true });
      alert("Logistics settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings", error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const addRule = () => {
    if (!newVendorId) return;
    setRoutingRules([...routingRules, { storeId: newVendorId, provider: newProvider }]);
    setNewVendorId("");
  };

  const removeRule = (index: number) => {
    setRoutingRules(routingRules.filter((_, i) => i !== index));
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Loading logistics configurations...</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Multi-Carrier Logistics Hub</h1>
          <p className="text-gray-800 mt-2 font-semibold">Manage shipping API keys and dynamic routing rules.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Configuration"}
        </button>
      </header>

      {/* API Keys Section */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span>🔑</span> Shipping API Credentials
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Shiprocket API Token</label>
            <input 
              type="password" 
              value={shiprocketKey}
              onChange={(e) => setShiprocketKey(e.target.value)}
              placeholder="Paste Shiprocket API token here"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-mono text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">ClickPost API Key</label>
            <input 
              type="password" 
              value={clickpostKey}
              onChange={(e) => setClickpostKey(e.target.value)}
              placeholder="Paste ClickPost API key here"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Eshopbox API Token</label>
            <input 
              type="password" 
              value={eshopboxKey}
              onChange={(e) => setEshopboxKey(e.target.value)}
              placeholder="Paste Eshopbox API token here"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Routing Rules Section */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span>🔀</span> Dynamic Routing Rules
        </h2>
        <p className="text-sm text-gray-500 mb-6">Assign specific shipping partners to specific stores/weavers. If a store is not listed, the system will default to Shiprocket.</p>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6 flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Store/Weaver ID</label>
            <input 
              type="text" 
              value={newVendorId}
              onChange={(e) => setNewVendorId(e.target.value)}
              placeholder="e.g. USER_ID_123"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Assign Partner</label>
            <select 
              value={newProvider}
              onChange={(e) => setNewProvider(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-sm bg-white"
            >
              <option value="shiprocket">Shiprocket</option>
              <option value="clickpost">ClickPost</option>
              <option value="eshopbox">Eshopbox</option>
            </select>
          </div>
          <button 
            onClick={addRule}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors text-sm h-[38px]"
          >
            Add Rule
          </button>
        </div>

        {routingRules.length === 0 ? (
          <div className="text-center py-8 text-gray-400 font-medium border-2 border-dashed border-gray-200 rounded-xl">
            No routing rules defined. All shipments will default to Shiprocket.
          </div>
        ) : (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-[10px] uppercase tracking-widest text-gray-500">
                  <th className="py-3 px-4 font-bold">Store ID</th>
                  <th className="py-3 px-4 font-bold">Assigned Partner</th>
                  <th className="py-3 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {routingRules.map((rule, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm text-gray-900">{rule.storeId}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
                        {rule.provider}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => removeRule(idx)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
