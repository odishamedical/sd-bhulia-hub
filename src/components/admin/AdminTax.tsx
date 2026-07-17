"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs } from "firebase/firestore";

interface TaxRecord {
  month: string;
  totalSales: number;
  totalGSTCollected: number;
  totalCommissionEarned: number;
  gstOnCommission: number; // You owe this if reverse charge or forward charge applies, usually 18% on services
}

export default function AdminTax() {
  const [taxData, setTaxData] = useState<TaxRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Constants
  const COMMISSION_RATE = 0.10; // 10%
  const GST_RATE_ON_COMMISSION = 0.18; // 18% on platform services

  useEffect(() => {
    fetchTaxData();
  }, []);

  const fetchTaxData = async () => {
    setLoading(true);
    try {
      // Fetch all completed/delivered orders to calculate tax
      const snap = await getDocs(collection(db, "orders"));
      
      const monthlyMap = new Map<string, TaxRecord>();

      snap.forEach(d => {
        const order = d.data();
        // Only count revenue-generating statuses
        if (!["delivered", "completed", "shipped"].includes(order.status)) return;

        const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
        if (isNaN(date.getTime())) return;

        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; // e.g. "2026-07"

        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            month: monthKey,
            totalSales: 0,
            totalGSTCollected: 0,
            totalCommissionEarned: 0,
            gstOnCommission: 0
          });
        }

        const record = monthlyMap.get(monthKey)!;
        
        const saleAmount = order.totalAmount || 0;
        // In reality, GST should be broken down per item. 
        // For this demo, let's assume a blended average of 5% GST on the apparel is included in the total.
        // Taxable Value = Total / 1.05. GST = Total - Taxable Value.
        const gstCollected = saleAmount - (saleAmount / 1.05); 
        
        const commission = saleAmount * COMMISSION_RATE;
        const commissionGst = commission * GST_RATE_ON_COMMISSION;

        record.totalSales += saleAmount;
        record.totalGSTCollected += gstCollected;
        record.totalCommissionEarned += commission;
        record.gstOnCommission += commissionGst;
      });

      // Sort by month descending
      const sorted = Array.from(monthlyMap.values()).sort((a, b) => b.month.localeCompare(a.month));
      setTaxData(sorted);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleExportCSV = () => {
    const headers = ["Month", "Total Sales (₹)", "GST Collected on Sales (₹)", "Commission Earned (₹)", "GST on Commission (18%) (₹)"];
    const rows = taxData.map(r => [
      r.month,
      r.totalSales.toFixed(2),
      r.totalGSTCollected.toFixed(2),
      r.totalCommissionEarned.toFixed(2),
      r.gstOnCommission.toFixed(2)
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bhulia-tax-report-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Tax & Compliance</h2>
          <p className="text-gray-500 text-sm">Monthly GST aggregation for CA handoff and compliance reporting.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="bg-[#051815] text-[#C5A059] px-6 py-2.5 rounded-lg font-bold text-sm shadow hover:bg-[#0a201c] transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Export CSV for CA
        </button>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700 font-bold">
              Compliance Reminder: <span className="font-normal">As an e-commerce operator, you are required to file GSTR-8 (TCS) by the 10th of every month. Ensure your CA receives this report by the 5th.</span>
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Filing Month</th>
                  <th className="px-6 py-4">Total Gross Sales</th>
                  <th className="px-6 py-4 text-blue-700">GST Collected (5%)</th>
                  <th className="px-6 py-4">Platform Commission</th>
                  <th className="px-6 py-4 text-red-700">Commission GST (18%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {taxData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No sales data available for tax calculation.
                    </td>
                  </tr>
                ) : (
                  taxData.map((t) => (
                    <tr key={t.month} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-base">{t.month}</div>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-gray-800">
                        ₹{t.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-blue-600">
                        ₹{t.totalGSTCollected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-600">
                        ₹{t.totalCommissionEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-red-600">
                        ₹{t.gstOnCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
