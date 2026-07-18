"use client";

import React, { useState } from "react";

export default function AdminCommissions() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for demonstration based on the implementation plan
  const overviewStats = {
    totalGenerated: "₹1,45,000",
    pendingPayouts: "₹25,000",
    paidThisMonth: "₹15,000",
  };

  const pendingRequests = [
    { id: "REQ-001", resellerName: "Aman Reseller", amount: 4500, status: "pending", date: "2026-07-17", upi: "aman@okicici" },
    { id: "REQ-002", resellerName: "Odisha Handloom Connect", amount: 12000, status: "pending", date: "2026-07-16", upi: "odisha@ybl" },
  ];

  const ledger = [
    { orderId: "ORD-991", reseller: "Aman Reseller", commission: 1200, status: "cleared", date: "2026-07-10" },
    { orderId: "ORD-992", reseller: "Odisha Handloom Connect", commission: 3400, status: "pending", date: "2026-07-18" },
    { orderId: "ORD-993", reseller: "Aman Reseller", commission: 800, status: "cleared", date: "2026-07-11" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Reseller Commissions</h2>
          <p className="text-gray-500 mt-1">Manage network marketer earnings, approve payouts, and audit commission ledgers.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-2 flex gap-2">
        <button 
          onClick={() => setActiveTab("overview")} 
          className={`flex-1 py-3 font-bold rounded-xl transition-all ${activeTab === "overview" ? "bg-[#0070F3] text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
        >
          Financial Overview
        </button>
        <button 
          onClick={() => setActiveTab("queue")} 
          className={`flex-1 py-3 font-bold rounded-xl transition-all ${activeTab === "queue" ? "bg-amber-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
        >
          Payout Queue ({pendingRequests.length})
        </button>
        <button 
          onClick={() => setActiveTab("ledger")} 
          className={`flex-1 py-3 font-bold rounded-xl transition-all ${activeTab === "ledger" ? "bg-gray-900 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
        >
          Complete Ledger
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
            <h3 className="text-gray-500 font-bold mb-2 uppercase tracking-widest text-xs">Total Commissions Generated</h3>
            <p className="text-5xl font-black text-emerald-600">{overviewStats.totalGenerated}</p>
          </div>
          <div className="bg-amber-50 p-8 rounded-3xl shadow-inner border border-amber-200 flex flex-col justify-center items-center text-center">
            <h3 className="text-amber-800 font-bold mb-2 uppercase tracking-widest text-xs">Pending Payouts</h3>
            <p className="text-5xl font-black text-amber-600">{overviewStats.pendingPayouts}</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
            <h3 className="text-gray-500 font-bold mb-2 uppercase tracking-widest text-xs">Paid Out This Month</h3>
            <p className="text-5xl font-black text-[#0070F3]">{overviewStats.paidThisMonth}</p>
          </div>
        </div>
      )}

      {activeTab === "queue" && (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-gray-100">Request ID</th>
                <th className="p-4 font-bold border-b border-gray-100">Reseller</th>
                <th className="p-4 font-bold border-b border-gray-100">UPI/Bank Details</th>
                <th className="p-4 font-bold border-b border-gray-100">Amount</th>
                <th className="p-4 font-bold border-b border-gray-100 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map(req => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 border-b border-gray-50 text-sm font-medium text-gray-900">{req.id}</td>
                  <td className="p-4 border-b border-gray-50 font-bold text-[#0070F3]">{req.resellerName}</td>
                  <td className="p-4 border-b border-gray-50 text-sm text-gray-600 font-mono bg-gray-100 rounded px-2 py-1 inline-block mt-3">{req.upi}</td>
                  <td className="p-4 border-b border-gray-50 font-black text-amber-600">₹{req.amount.toLocaleString()}</td>
                  <td className="p-4 border-b border-gray-50 text-right">
                    <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors shadow-sm">
                      Mark as Paid
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "ledger" && (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-gray-100">Order ID</th>
                <th className="p-4 font-bold border-b border-gray-100">Reseller</th>
                <th className="p-4 font-bold border-b border-gray-100">Date</th>
                <th className="p-4 font-bold border-b border-gray-100">Commission</th>
                <th className="p-4 font-bold border-b border-gray-100">Status</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((entry, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 border-b border-gray-50 text-sm font-medium text-gray-900">{entry.orderId}</td>
                  <td className="p-4 border-b border-gray-50 font-bold text-gray-700">{entry.reseller}</td>
                  <td className="p-4 border-b border-gray-50 text-sm text-gray-500">{entry.date}</td>
                  <td className="p-4 border-b border-gray-50 font-black text-emerald-600">₹{entry.commission.toLocaleString()}</td>
                  <td className="p-4 border-b border-gray-50">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${entry.status === 'cleared' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
