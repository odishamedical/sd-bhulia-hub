"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function AdminSettings() {
  const [globalCommission, setGlobalCommission] = useState("5");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const snap = await getDoc(doc(db, "settings", "platform"));
        if (snap.exists() && snap.data().globalCommissionRate !== undefined) {
          setGlobalCommission(String(snap.data().globalCommissionRate));
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
        globalCommissionRate: parseFloat(globalCommission) || 5
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

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Platform Settings</h2>
        <p className="text-gray-500 mt-2 font-medium">Manage global configurations for the Bhulia ecosystem.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Financial Engine</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Global Default Platform Commission (%)</label>
            <p className="text-xs text-gray-500 mb-4">
              This is the fallback percentage deducted from seller payouts. It will be overridden by user-specific or product-specific rates if they exist.
            </p>
            <div className="relative max-w-xs">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                className="w-full pl-4 pr-10 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-blue-500 transition-all"
                value={globalCommission}
                onChange={(e) => setGlobalCommission(e.target.value)}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
            </div>
          </div>
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
