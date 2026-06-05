"use client";

import React, { useState, useEffect } from "react";
import { useWeavers, useVendors } from "@/lib/db-hooks";

export default function SubscriptionsPage() {
  const { weavers } = useWeavers();
  const { vendors: stores } = useVendors();
  const [subscribers, setSubscribers] = useState<any[]>([]);

  useEffect(() => {
    // Mock subscription data based on approved weavers and stores
    const activeWeavers = weavers.filter(w => w.status === "approved").map(w => ({
      id: w.id,
      name: w.title || "Unknown Weaver",
      type: "Weaver",
      plan: "Basic Tier (₹5,000/yr)",
      amount: 5000,
      status: Math.random() > 0.1 ? "Active" : "Churned",
      renewsOn: new Date(Date.now() + Math.random() * 10000000000).toLocaleDateString()
    }));

    const activeStores = stores.filter(s => s.status === "approved").map(s => ({
      id: s.id,
      name: s.title || "Unknown Store",
      type: "Store",
      plan: "Premium Tier (₹10,000/yr)",
      amount: 10000,
      status: Math.random() > 0.15 ? "Active" : "Churned",
      renewsOn: new Date(Date.now() + Math.random() * 10000000000).toLocaleDateString()
    }));

    setSubscribers([...activeWeavers, ...activeStores]);
  }, [weavers, stores]);

  const activeCount = subscribers.filter(s => s.status === "Active").length;
  const churnedCount = subscribers.filter(s => s.status === "Churned").length;
  const mrr = subscribers.filter(s => s.status === "Active").reduce((acc, curr) => acc + (curr.amount / 12), 0);
  const arr = mrr * 12;

  const handleSendReminder = (id: string) => {
    alert(`Payment reminder sent to ${id} via WhatsApp/Email.`);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">SaaS Subscriptions</h1>
          <p className="text-gray-800 mt-2 font-semibold">Track recurring revenue from Weaver and Retail Store platform fees.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Monthly Recurring Revenue (MRR)</h3>
          <p className="text-3xl font-black text-blue-600">₹{Math.floor(mrr).toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Annual Run Rate (ARR)</h3>
          <p className="text-3xl font-black text-green-600">₹{Math.floor(arr).toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Active Subscribers</h3>
          <p className="text-3xl font-black text-gray-900">{activeCount}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-red-50 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Churned Accounts</h3>
          <p className="text-3xl font-black text-red-600">{churnedCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Subscription Roster</h2>
        
        {subscribers.length === 0 ? (
          <div className="py-20 text-center text-gray-400 font-medium">No subscription data available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="py-4 px-4 font-bold rounded-tl-xl">Tenant</th>
                  <th className="py-4 px-4 font-bold">Role</th>
                  <th className="py-4 px-4 font-bold">Subscription Tier</th>
                  <th className="py-4 px-4 font-bold">Status</th>
                  <th className="py-4 px-4 font-bold">Renewal Date</th>
                  <th className="py-4 px-4 font-bold text-right rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {subscribers.map(sub => (
                  <tr key={sub.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-gray-900">{sub.name}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${sub.type === "Weaver" ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-purple-50 text-purple-700 border-purple-200"}`}>
                        {sub.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 font-medium">{sub.plan}</td>
                    <td className="py-4 px-4">
                      <span className={`flex items-center gap-1.5 font-bold text-xs ${sub.status === "Active" ? "text-green-600" : "text-red-500"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sub.status === "Active" ? "bg-green-500" : "bg-red-500"}`}></span>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-500 font-mono text-xs">{sub.renewsOn}</td>
                    <td className="py-4 px-4 text-right">
                      {sub.status === "Churned" && (
                        <button onClick={() => handleSendReminder(sub.id)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 transition-all">Send Reminder</button>
                      )}
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
