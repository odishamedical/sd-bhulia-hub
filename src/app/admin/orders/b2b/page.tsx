"use client";

import React, { useState, useEffect } from "react";
import { useOrders, updateDocumentStatus } from "@/lib/db-hooks";

export default function B2BOrdersPage() {
  const { orders, loading } = useOrders();
  const [b2bOrders, setB2bOrders] = useState<any[]>([]);

  useEffect(() => {
    // Simulating B2B logic. We filter orders and inject some B2B specific mock data
    if (orders.length > 0) {
      const wholesale = orders
        .filter(o => o.isB2B || Math.random() > 0.7) // Mock logic to get some B2B orders
        .map((order, index) => {
          const discountTiers = ["10% (MOQ 50)", "15% (MOQ 100)", "20% (MOQ 250)"];
          const freightModes = ["Air Cargo Express", "Surface Transport (Gati)", "Self Pickup"];
          const statuses = ["Negotiating", "Proforma Sent", "Payment Cleared", "In Production", "Ready for Freight"];
          
          return {
            ...order,
            b2bCompany: order.customerName + " Enterprises",
            bulkQuantity: Math.floor(Math.random() * 200) + 50,
            discountApplied: discountTiers[index % discountTiers.length],
            freightMode: freightModes[index % freightModes.length],
            negotiationStatus: statuses[index % statuses.length],
          };
        });
      setB2bOrders(wholesale);
    }
  }, [orders]);

  const handleUpdateStatus = (id: string) => {
    alert(`Updating B2B negotiation status for Order #${id} (Simulation)`);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Wholesale & B2B Orders</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage bulk negotiations, MOQ tiers, and custom freight logistics.</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgb(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:bg-blue-700 transition-all flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
          Generate Proforma Invoice
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-blue-100 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Active Negotiations</h3>
          <p className="text-3xl font-black text-blue-600">{b2bOrders.filter(o => o.negotiationStatus === "Negotiating").length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Proforma Sent</h3>
          <p className="text-3xl font-black text-gray-900">{b2bOrders.filter(o => o.negotiationStatus === "Proforma Sent").length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-green-100 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">In Production</h3>
          <p className="text-3xl font-black text-green-600">{b2bOrders.filter(o => o.negotiationStatus === "In Production").length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total B2B Value</h3>
          <p className="text-3xl font-black text-gray-900">₹45.2 L</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Wholesale Pipeline</h2>
        
        {loading ? (
          <div className="py-20 text-center text-gray-400 font-medium">Loading B2B pipeline...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase tracking-widest text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="py-4 px-4 font-bold rounded-tl-xl">Corporate Buyer</th>
                  <th className="py-4 px-4 font-bold">Bulk Qty</th>
                  <th className="py-4 px-4 font-bold">Negotiated Tier</th>
                  <th className="py-4 px-4 font-bold">Freight Terms</th>
                  <th className="py-4 px-4 font-bold">Status</th>
                  <th className="py-4 px-4 font-bold text-right rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {b2bOrders.map(order => (
                  <tr key={order.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900">{order.b2bCompany}</div>
                      <div className="text-xs text-gray-500 mt-1">Rep: {order.customerName}</div>
                    </td>
                    <td className="py-4 px-4 font-black text-blue-600">{order.bulkQuantity} Pcs</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg text-xs font-bold">{order.discountApplied}</span>
                    </td>
                    <td className="py-4 px-4 text-gray-700 font-medium">{order.freightMode}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        order.negotiationStatus === "Payment Cleared" ? "bg-green-50 text-green-700 border-green-200" :
                        order.negotiationStatus === "In Production" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-orange-50 text-orange-700 border-orange-200"
                      }`}>
                        {order.negotiationStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button onClick={() => handleUpdateStatus(order.id)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-white hover:shadow-sm transition-all">Manage</button>
                    </td>
                  </tr>
                ))}
                {b2bOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-gray-500 font-medium">No active wholesale negotiations.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
