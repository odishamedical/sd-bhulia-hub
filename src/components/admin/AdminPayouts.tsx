"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";

interface PayoutRecord {
  id: string; // Seller/Weaver ID
  sellerName: string;
  totalSales: number;
  commissionTotal: number;
  netPayout: number;
  orderCount: number;
  orderIds: string[];
  status: "pending" | "paid";
}

export default function AdminPayouts() {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Platform Commission Rate
  const COMMISSION_RATE = 0.10; // 10%

  useEffect(() => {
    fetchPayoutData();
  }, [activeTab]);

  const fetchPayoutData = async () => {
    setLoading(true);
    try {
      // In a real app, you'd fetch from a dedicated `payouts` collection.
      // For this demo, we aggregate delivered orders that are/aren't marked as paid.
      const q = query(
        collection(db, "orders"),
        where("status", "in", ["delivered", "completed"])
      );
      
      const snap = await getDocs(q);
      const sellerMap = new Map<string, PayoutRecord>();

      snap.forEach(d => {
        const order = { id: d.id, ...d.data() } as any;
        
        // Filter based on payout status (mocking logic: assume order.payoutStatus exists)
        const payoutStatus = order.payoutStatus || "pending";
        if (payoutStatus !== activeTab) return;

        // Assuming each order has a sellerId. If not, fallback to a dummy ID for demo
        const sellerId = order.sellerId || "weaver_guest_1";
        const sellerName = order.sellerName || "Anonymous Weaver";

        if (!sellerMap.has(sellerId)) {
          sellerMap.set(sellerId, {
            id: sellerId,
            sellerName,
            totalSales: 0,
            commissionTotal: 0,
            netPayout: 0,
            orderCount: 0,
            orderIds: [],
            status: payoutStatus as any
          });
        }

        const record = sellerMap.get(sellerId)!;
        const saleAmount = order.totalAmount || 0;
        const commission = saleAmount * COMMISSION_RATE;
        const net = saleAmount - commission;

        record.totalSales += saleAmount;
        record.commissionTotal += commission;
        record.netPayout += net;
        record.orderCount += 1;
        record.orderIds.push(order.id);
      });

      setPayouts(Array.from(sellerMap.values()));
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleSettlePayout = async (record: PayoutRecord) => {
    if (!confirm(`Confirm payout of ₹${record.netPayout.toFixed(2)} to ${record.sellerName}?`)) return;
    
    setProcessingId(record.id);
    try {
      // In a real app, you would create a Payout document and update all related orders
      const updatePromises = record.orderIds.map(orderId => 
        updateDoc(doc(db, "orders", orderId), { 
          payoutStatus: "paid", 
          payoutDate: new Date().toISOString() 
        })
      );
      
      await Promise.all(updatePromises);
      
      // Remove from current pending view
      setPayouts(prev => prev.filter(p => p.id !== record.id));
      alert(`Successfully settled payout for ${record.sellerName}!`);
    } catch (e) {
      console.error(e);
      alert("Failed to settle payout.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Seller Payouts & Commissions</h2>
          <p className="text-gray-500 text-sm">Automated ledger for tracking platform revenue and weaver settlements.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-2 rounded-md font-bold text-sm transition-all ${activeTab === "pending" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Pending Payouts
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`px-6 py-2 rounded-md font-bold text-sm transition-all ${activeTab === "history" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Payout History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-bold mb-1">Platform Commission Rate</p>
          <p className="text-3xl font-black text-gray-900">{COMMISSION_RATE * 100}%</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-bold mb-1">Total {activeTab === "pending" ? "Pending" : "Paid"} Volume</p>
          <p className="text-3xl font-black text-blue-600">
            ₹{payouts.reduce((acc, curr) => acc + curr.totalSales, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-[#051815] p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-400 font-bold mb-1">Your Commission Earned</p>
          <p className="text-3xl font-black text-[#C5A059]">
            ₹{payouts.reduce((acc, curr) => acc + curr.commissionTotal, 0).toLocaleString()}
          </p>
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
                  <th className="px-6 py-4">Seller / Weaver</th>
                  <th className="px-6 py-4">Orders</th>
                  <th className="px-6 py-4">Total Sales</th>
                  <th className="px-6 py-4">Platform Fee (-10%)</th>
                  <th className="px-6 py-4 font-black text-gray-900">Net Payout Owed</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No {activeTab} payouts found.
                    </td>
                  </tr>
                ) : (
                  payouts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{p.sellerName}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-mono tracking-widest mt-1">ID: {p.id}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-700">
                        {p.orderCount}
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-600">
                        ₹{p.totalSales.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-mono text-red-600">
                        -₹{p.commissionTotal.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-mono font-black text-green-600 text-base">
                        ₹{p.netPayout.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {activeTab === "pending" ? (
                          <button 
                            onClick={() => handleSettlePayout(p)}
                            disabled={processingId === p.id}
                            className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 uppercase disabled:opacity-50 transition-colors"
                          >
                            {processingId === p.id ? "Processing..." : "Settle Payment"}
                          </button>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold uppercase">
                            Paid via NEFT
                          </span>
                        )}
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
