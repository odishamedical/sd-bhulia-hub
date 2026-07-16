"use client";

import React, { useState } from "react";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([
    { id: 1, code: "WELCOME10", discount: "10% OFF", type: "Storewide", uses: 1240, limit: "Unlimited", status: "Active" },
    { id: 2, title: "WEAVER500", discount: "₹500 OFF", type: "Specific Weaver", uses: 45, limit: "100 Users", status: "Active" },
    { id: 3, title: "B2B_BULK", discount: "15% OFF", type: "B2B Wholesale", uses: 12, limit: "MOQ > 50", status: "Active" }
  ]);

  const handleGenerate = () => {
    alert("Simulating Coupon Generation Engine...");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Discount & Promo Engine</h1>
          <p className="text-gray-800 mt-2 font-semibold">Generate intelligent coupon codes for retail and wholesale pipelines.</p>
        </div>
        <button onClick={handleGenerate} className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgb(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:bg-blue-700 transition-all flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Create New Coupon
        </button>
      </header>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Active Master Codes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-100 bg-gray-50">
                <th className="py-4 px-4 font-bold rounded-tl-xl">Promo Code</th>
                <th className="py-4 px-4 font-bold">Discount Value</th>
                <th className="py-4 px-4 font-bold">Condition / Type</th>
                <th className="py-4 px-4 font-bold text-right">Redemptions</th>
                <th className="py-4 px-4 font-bold">Limits</th>
                <th className="py-4 px-4 font-bold text-right rounded-tr-xl">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {coupons.map(coupon => (
                <tr key={coupon.id} className="group hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-black text-gray-900 font-mono tracking-wider">{coupon.code || coupon.title}</td>
                  <td className="py-4 px-4 font-bold text-green-600">{coupon.discount}</td>
                  <td className="py-4 px-4 text-gray-600 font-medium">{coupon.type}</td>
                  <td className="py-4 px-4 text-right font-mono text-gray-900 font-bold">{coupon.uses}</td>
                  <td className="py-4 px-4 text-gray-500 text-xs font-bold">{coupon.limit}</td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-red-500 hover:text-red-700 font-bold text-xs p-2">Deactivate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
