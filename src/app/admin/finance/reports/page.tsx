"use client";

import React, { useState, useEffect } from "react";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function TaxReportingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(false);

  useEffect(() => {
    const verifyAccess = async () => {
      const email = localStorage.getItem("sd_current_user_email");
      const role = localStorage.getItem("sd_current_user_role");

      if (role === "super_admin") {
        setHasPermission(true);
        setIsLoading(false);
        return;
      }

      if (role === "admin" && email) {
        try {
          const q = query(collection(db, "users"), where("email", "==", email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const adminData = snap.docs[0].data();
            if (adminData.permissions?.finance === true) {
              setHasPermission(true);
              setIsLoading(false);
              return;
            }
          }
        } catch (error) {
          console.error("Permission check failed:", error);
        }
      }

      setHasPermission(false);
      setIsLoading(false);
    };

    verifyAccess();
    
    // Set default dates to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    setDateRange({ start: firstDay, end: lastDay });
    
  }, []);

  const handleGenerateCSV = async () => {
    setIsGenerating(true);
    setReportReady(false);
    
    // Simulate complex ledger aggregation and CSV formatting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsGenerating(false);
    setReportReady(true);
  };

  const handleDownloadCSV = () => {
    // In production, this would trigger a file blob download
    alert(`Downloading GST_Report_${dateRange.start}_to_${dateRange.end}.csv`);
    setReportReady(false); // Reset UI after download
  };

  if (hasPermission === null || isLoading) {
    return <div className="py-20 text-red-600 font-bold uppercase tracking-widest text-xs text-center animate-pulse">Verifying Treasury Clearance...</div>;
  }

  if (hasPermission === false) {
    return (
      <div className="bg-red-900 text-red-50 p-6 rounded-xl shadow-2xl border border-red-700">
        <h3 className="font-bold text-xl mb-2 flex items-center gap-2"><span className="text-3xl">🛑</span> Level 5 Authorization Required</h3>
        <p>You do not have `Finance & Ledger` permissions to view sensitive tax data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Tax & GST Reporting
          </h1>
          <p className="text-sm text-gray-500 mt-1">Export transaction ledgers formatted strictly for Chartered Accountants.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Generate Compliance Export</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Start Date</label>
              <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">End Date</label>
              <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none" 
              />
            </div>
          </div>

          <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
            <h4 className="font-bold text-blue-900 mb-2">Included in this export:</h4>
            <ul className="text-sm text-blue-800 space-y-1.5 list-disc list-inside">
              <li>All B2C Retail Sales (CGST & SGST split)</li>
              <li>B2B Franchise Bulk Orders (IGST records)</li>
              <li>Platform Commission Invoices generated for Weavers</li>
              <li>SaaS Billing Invoices for Franchises</li>
            </ul>
          </div>

          <div className="flex justify-end pt-4">
            {isGenerating ? (
              <button disabled className="px-8 py-3 bg-gray-400 text-white font-bold rounded-xl shadow-sm flex items-center gap-2 cursor-not-allowed">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Aggregating Ledger...
              </button>
            ) : reportReady ? (
              <button 
                onClick={handleDownloadCSV}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] transition-all flex items-center gap-2"
              >
                <span>📥</span> Download CSV Report
              </button>
            ) : (
              <button 
                onClick={handleGenerateCSV}
                className="px-8 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all"
              >
                Compile Ledger Data
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
