"use client";

import PremiumMetricCard from "@/components/PremiumMetricCard";
import React, { useState, useEffect } from "react";
import { useOrders } from "@/lib/db-hooks";

export default function RTOsPage() {
  const { orders, loading } = useOrders();
  const [rtoData, setRtoData] = useState<any[]>([]);

  useEffect(() => {
    if (orders.length > 0) {
      // Mocking Return To Origin data
      const returned = orders.filter(() => Math.random() > 0.8).map((order, idx) => ({
        ...order,
        awbNumber: `AWB-${Math.floor(Math.random() * 900000) + 100000}`,
        reason: ["Customer Unavailable", "Address Incomplete", "Refused Delivery"][idx % 3],
        rtoStatus: ["Returning to Hub", "Received at Hub", "Restocked"][idx % 3],
      })).slice(0, 5); // Keep it small for simulation
      setRtoData(returned);
    }
  }, [orders]);

  const handleRestock = (id: string) => {
    alert("Simulating inventory restock and order cancellation for RTO #" + id);
    setRtoData(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">RTO Management</h1>
          <p className="text-gray-800 mt-2 font-semibold">Manage Return-to-Origin packages, assess logistics penalties, and restock inventory.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <PremiumMetricCard title="Total RTO Rate" value={<>4.2%</>} index={0} />
        <PremiumMetricCard title="In Transit to Hub" value={<>{rtoData.filter(r => r.rtoStatus === "Returning to Hub").length}</>} index={1} />
        <PremiumMetricCard title="Pending Restock" value={<>{rtoData.filter(r => r.rtoStatus === "Received at Hub").length}</>} index={2} />
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Undelivered Packages</h2>
        {loading ? (
          <div className="py-20 text-center text-gray-400 font-medium">Loading RTO Data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="py-4 px-4 font-bold rounded-tl-xl">AWB Reference</th>
                  <th className="py-4 px-4 font-bold">Failure Reason</th>
                  <th className="py-4 px-4 font-bold">Current Location</th>
                  <th className="py-4 px-4 font-bold">Value</th>
                  <th className="py-4 px-4 font-bold text-right rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {rtoData.map((item, idx) => (
                  <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900">{item.awbNumber}</div>
                      <div className="text-xs font-mono text-gray-500">Order: {item.id}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-md text-[10px] font-bold uppercase tracking-wider">{item.reason}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        item.rtoStatus === 'Restocked' ? 'bg-green-50 text-green-700 border-green-200' :
                        item.rtoStatus === 'Received at Hub' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {item.rtoStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-black text-gray-900">₹{item.productPrice}</td>
                    <td className="py-4 px-4 text-right">
                      {item.rtoStatus === "Received at Hub" ? (
                         <button onClick={() => handleRestock(item.id)} className="px-4 py-2 border-2 border-green-100 text-green-700 rounded-xl text-xs font-bold hover:bg-green-50 transition-all">Restock Item</button>
                      ) : (
                         <button disabled className="px-4 py-2 bg-gray-100 text-gray-400 rounded-xl text-xs font-bold cursor-not-allowed transition-all">Track Return</button>
                      )}
                    </td>
                  </tr>
                ))}
                {rtoData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-500 font-medium">No RTO packages currently active.</td>
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
