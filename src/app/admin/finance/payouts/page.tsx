"use client";

import React, { useState, useEffect } from "react";
import { useOrders } from "@/lib/db-hooks";

export default function PayoutsPage() {
  const { orders, loading } = useOrders();
  const [escrowList, setEscrowList] = useState<any[]>([]);

  useEffect(() => {
    // Mocking Escrow Data from Orders
    if (orders.length > 0) {
      const pendingEscrow = orders.filter(o => o.status !== "delivered").map(order => ({
        id: order.id,
        beneficiary: order.sellerId || "Bhulia Weaver Network",
        amount: parseInt(order.productPrice?.toString().replace(/[^0-9]/g, '') || "5000"),
        platformFee: 0,
        status: "Held in Escrow",
        clearsOn: "Upon Delivery + 7 Days"
      }));
      
      // Calculate 10% platform fee
      const withFees = pendingEscrow.map(e => ({
        ...e,
        platformFee: Math.floor(e.amount * 0.10),
        payoutAmount: e.amount - Math.floor(e.amount * 0.10)
      }));
      
      setEscrowList(withFees);
    }
  }, [orders]);

  const handleApprovePayout = (id: string) => {
    alert(`Simulating Razorpay/Stripe Route for Escrow Release: Order #${id}`);
    setEscrowList(prev => prev.filter(e => e.id !== id));
  };

  const handleReleaseAll = () => {
    alert("Simulating Bulk Route to RazorpayX API for 12 payouts.");
    setEscrowList([]);
  };

  const totalEscrow = escrowList.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPlatformFees = escrowList.reduce((acc, curr) => acc + curr.platformFee, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Escrow & Payouts</h1>
          <p className="text-gray-800 mt-2 font-semibold">Manage funds held in trust and release payouts to Weavers via Razorpay API.</p>
        </div>
        <button 
          onClick={handleReleaseAll}
          disabled={escrowList.length === 0}
          className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgb(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          Release Eligible Payouts
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
          <h3 className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-2 relative z-10">Total Funds in Escrow</h3>
          <p className="text-4xl font-black relative z-10 mb-4">₹{totalEscrow.toLocaleString()}</p>
          <div className="flex items-center gap-2 text-xs font-medium text-blue-200 bg-blue-950/50 w-fit px-3 py-1.5 rounded-lg border border-blue-800/50 relative z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            Regulated by Nodal Account
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-900 to-green-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
          <h3 className="text-xs font-bold text-green-200 uppercase tracking-wider mb-2 relative z-10">Pending Platform Revenue (10% Fee)</h3>
          <p className="text-4xl font-black relative z-10">₹{totalPlatformFees.toLocaleString()}</p>
          <div className="text-xs font-medium text-green-200 mt-4 relative z-10">Recognized upon payout completion</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Escrow Ledger</h2>
        
        {loading ? (
          <div className="py-20 text-center text-gray-400 font-medium">Loading ledger data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="py-4 px-4 font-bold rounded-tl-xl">Order Ref</th>
                  <th className="py-4 px-4 font-bold">Beneficiary (Weaver)</th>
                  <th className="py-4 px-4 font-bold text-right">Order Value</th>
                  <th className="py-4 px-4 font-bold text-right text-red-500">Platform Fee (-10%)</th>
                  <th className="py-4 px-4 font-bold text-right text-green-600">Net Payout</th>
                  <th className="py-4 px-4 font-bold text-center">Clearance Status</th>
                  <th className="py-4 px-4 font-bold text-right rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {escrowList.map(item => (
                  <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-mono text-xs text-gray-500">{item.id}</td>
                    <td className="py-4 px-4 font-bold text-gray-900">{item.beneficiary}</td>
                    <td className="py-4 px-4 text-right font-medium text-gray-900">₹{item.amount.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right font-medium text-red-500">-₹{item.platformFee.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right font-black text-green-600">₹{item.payoutAmount.toLocaleString()}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md text-[10px] font-bold uppercase tracking-wider">{item.clearsOn}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button onClick={() => handleApprovePayout(item.id)} className="px-4 py-2 border-2 border-blue-100 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 transition-all">Approve Payout</button>
                    </td>
                  </tr>
                ))}
                {escrowList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-500 font-medium">All escrow accounts settled.</td>
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
