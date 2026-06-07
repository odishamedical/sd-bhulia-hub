"use client";

import PremiumMetricCard from "@/components/PremiumMetricCard";
import React, { useState, useEffect } from "react";
import { useOrders } from "@/lib/db-hooks";

export default function FraudAnalysisPage() {
  const { orders, loading } = useOrders();
  const [flaggedOrders, setFlaggedOrders] = useState<any[]>([]);

  useEffect(() => {
    // Mock Fraud Detection Logic
    if (orders.length > 0) {
      const suspicious = orders.map(order => {
        const riskScore = Math.floor(Math.random() * 100);
        const flags = [];
        
        if (riskScore > 75) flags.push("High Dispute Rate IP");
        if (riskScore > 85) flags.push("Mismatched Billing/Shipping");
        if (riskScore > 90) flags.push("Multiple Failed Attempts");
        
        return {
          ...order,
          riskScore,
          flags
        };
      }).filter(o => o.riskScore > 60).sort((a, b) => b.riskScore - a.riskScore);
      
      setFlaggedOrders(suspicious);
    }
  }, [orders]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Fraud Analysis Center</h1>
          <p className="text-gray-800 mt-2 font-semibold">Identify and mitigate high-risk transactions across the ecosystem.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <PremiumMetricCard title="Critical Alerts" value={<>{flaggedOrders.filter(o => o.riskScore > 85).length}</>} index={0} />
        <PremiumMetricCard title="Elevated Risk" value={<>{flaggedOrders.filter(o => o.riskScore > 60 && o.riskScore <= 85).length}</>} index={1} />
        <PremiumMetricCard title="Funds Held in Payout" value={<>₹1,24,000</>} index={2} />
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Suspicious Transactions</h2>
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-100 rounded-xl w-full"></div>
            <div className="h-12 bg-gray-100 rounded-xl w-full"></div>
            <div className="h-12 bg-gray-100 rounded-xl w-full"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase tracking-widest text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="py-4 px-4 font-bold rounded-tl-xl">Order ID</th>
                  <th className="py-4 px-4 font-bold">Customer Details</th>
                  <th className="py-4 px-4 font-bold">Risk Score</th>
                  <th className="py-4 px-4 font-bold">Flags</th>
                  <th className="py-4 px-4 font-bold text-right rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {flaggedOrders.map(order => (
                  <tr key={order.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-mono text-xs text-gray-500">{order.orderId || order.id}</div>
                      <div className="font-bold text-gray-900 mt-1">₹{order.productPrice || "Unknown"}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-500">{order.customerPhone}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-black text-sm ${order.riskScore > 85 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                        {order.riskScore}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-2">
                        {order.flags.map((flag: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-red-50 text-red-600 border border-red-100 rounded-md text-[10px] font-bold uppercase tracking-wider">{flag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors">Inspect</button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 shadow-sm transition-colors">Hold Funds</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {flaggedOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-500 font-medium">
                      <div className="text-4xl mb-3">🛡️</div>
                      No suspicious transactions detected. System is secure.
                    </td>
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
