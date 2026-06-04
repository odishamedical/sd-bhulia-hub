"use client";

import React, { useState, useEffect } from "react";
import { useOrders, useProducts } from "@/lib/db-hooks";

export default function TaxGSTPage() {
  const { orders } = useOrders();
  const { products } = useProducts();
  const [report, setReport] = useState<any[]>([]);

  useEffect(() => {
    // Mock tax calculations
    if (orders.length > 0) {
      const taxData = orders.map(order => {
        const amount = parseInt(order.productPrice?.toString().replace(/[^0-9]/g, '') || "5000");
        const isB2B = order.isB2B || Math.random() > 0.8;
        
        // 5% GST on Handloom Products, 18% GST on Platform Fees/Shipping
        const productTax = Math.floor(amount * 0.05);
        const platformFee = Math.floor(amount * 0.10);
        const feeTax = Math.floor(platformFee * 0.18);
        
        return {
          id: order.id,
          date: order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : "Recent",
          customerState: isB2B ? "Inter-State (IGST)" : "Intra-State (CGST+SGST)",
          amount,
          productTax,
          feeTax,
          totalTax: productTax + feeTax,
          type: isB2B ? "B2B Supply" : "B2C Retail"
        };
      });
      setReport(taxData);
    }
  }, [orders]);

  const totalCollected = report.reduce((acc, curr) => acc + curr.totalTax, 0);
  const totalProductTax = report.reduce((acc, curr) => acc + curr.productTax, 0);
  const totalFeeTax = report.reduce((acc, curr) => acc + curr.feeTax, 0);

  const handleDownloadGSTR = () => {
    alert("Simulating generation of GSTR-3B compliant Excel sheet...");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Tax & GST Reports</h1>
          <p className="text-gray-500 mt-2 font-medium">Automated split-tax ledger for 5% Handloom GST and 18% SaaS/Platform GST.</p>
        </div>
        <button 
          onClick={handleDownloadGSTR}
          className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgb(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export GSTR-1 & GSTR-3B
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Tax Liability (Q2)</h3>
          <p className="text-4xl font-black text-gray-900">₹{totalCollected.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Handloom Goods (5% GST)</h3>
          <p className="text-3xl font-black text-blue-600">₹{totalProductTax.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Platform Services (18% GST)</h3>
          <p className="text-3xl font-black text-orange-600">₹{totalFeeTax.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Tax Events</h2>
        
        {report.length === 0 ? (
          <div className="py-20 text-center text-gray-400 font-medium">No transactions available for tax calculation.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="py-4 px-4 font-bold rounded-tl-xl">Transaction Date</th>
                  <th className="py-4 px-4 font-bold">Order Type</th>
                  <th className="py-4 px-4 font-bold">GST Jurisdiction</th>
                  <th className="py-4 px-4 font-bold text-right">Base Value</th>
                  <th className="py-4 px-4 font-bold text-right text-blue-600">Goods Tax (5%)</th>
                  <th className="py-4 px-4 font-bold text-right text-orange-500">Service Tax (18%)</th>
                  <th className="py-4 px-4 font-bold text-right text-gray-900 rounded-tr-xl">Total Collected</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {report.map((item, idx) => (
                  <tr key={item.id + idx} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-mono text-xs text-gray-500">{item.date}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${item.type === "B2B Supply" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-green-50 text-green-700 border-green-200"}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs font-bold text-gray-600">{item.customerState}</td>
                    <td className="py-4 px-4 text-right font-medium text-gray-700">₹{item.amount.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right font-bold text-blue-600">₹{item.productTax.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right font-bold text-orange-500">₹{item.feeTax.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right font-black text-gray-900">₹{item.totalTax.toLocaleString()}</td>
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
