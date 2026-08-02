"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc, query, where } from "firebase/firestore";
import { CheckCircle } from "lucide-react";

export default function AdminCommissions() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "orders"), where("resellerId", "!=", null));
      const snap = await getDocs(q);
      const data: any[] = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() }));
      // Filter out orders that don't actually have a resellerId (Firebase != null also matches undefined if not careful, though usually it's fine)
      setOrders(data.filter(o => o.resellerId));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (orderId: string) => {
    if (!confirm("Mark this commission as paid?")) return;
    setProcessingId(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        commissionPaid: true,
        commissionPaidAt: new Date().toISOString()
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, commissionPaid: true } : o));
    } catch (e) {
      console.error(e);
      alert("Failed to mark as paid");
    } finally {
      setProcessingId(null);
    }
  };

  const totalGenerated = orders.reduce((acc, curr) => acc + (curr.resellerCommission || 0), 0);
  const pendingPayouts = orders.filter(o => !o.commissionPaid).reduce((acc, curr) => acc + (curr.resellerCommission || 0), 0);
  const paidThisMonth = orders.filter(o => o.commissionPaid).reduce((acc, curr) => acc + (curr.resellerCommission || 0), 0); // Simplified

  const pendingRequests = orders.filter(o => !o.commissionPaid);
  const ledger = orders.filter(o => o.commissionPaid);

  if (loading) {
    return <div className="flex justify-center h-64 items-center">Loading Commissions...</div>;
  }

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
            <p className="text-5xl font-black text-emerald-600">₹{totalGenerated.toLocaleString()}</p>
          </div>
          <div className="bg-amber-50 p-8 rounded-3xl shadow-inner border border-amber-200 flex flex-col justify-center items-center text-center">
            <h3 className="text-amber-800 font-bold mb-2 uppercase tracking-widest text-xs">Pending Payouts</h3>
            <p className="text-5xl font-black text-amber-600">₹{pendingPayouts.toLocaleString()}</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
            <h3 className="text-gray-500 font-bold mb-2 uppercase tracking-widest text-xs">Total Paid</h3>
            <p className="text-5xl font-black text-[#0070F3]">₹{paidThisMonth.toLocaleString()}</p>
          </div>
        </div>
      )}

      {activeTab === "queue" && (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No pending payouts</div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-gray-100">Order ID</th>
                <th className="p-4 font-bold border-b border-gray-100">Reseller</th>
                <th className="p-4 font-bold border-b border-gray-100">Amount</th>
                <th className="p-4 font-bold border-b border-gray-100 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map(req => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 border-b border-gray-50 text-sm font-medium text-gray-900">{req.id}</td>
                  <td className="p-4 border-b border-gray-50 font-bold text-[#0070F3]">{req.resellerName || req.resellerId}</td>
                  <td className="p-4 border-b border-gray-50 font-black text-amber-600">₹{req.resellerCommission?.toLocaleString()}</td>
                  <td className="p-4 border-b border-gray-50 text-right">
                    <button 
                      onClick={() => handlePay(req.id)}
                      disabled={processingId === req.id}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
                    >
                      {processingId === req.id ? "Processing..." : "Mark as Paid"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      )}

      {activeTab === "ledger" && (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          {ledger.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No paid commissions yet</div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-gray-100">Order ID</th>
                <th className="p-4 font-bold border-b border-gray-100">Reseller</th>
                <th className="p-4 font-bold border-b border-gray-100">Amount Paid</th>
                <th className="p-4 font-bold border-b border-gray-100 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 border-b border-gray-50 text-sm font-medium text-gray-900">{entry.id}</td>
                  <td className="p-4 border-b border-gray-50 font-bold text-gray-600">{entry.resellerName || entry.resellerId}</td>
                  <td className="p-4 border-b border-gray-50 font-black text-emerald-600">₹{entry.resellerCommission?.toLocaleString()}</td>
                  <td className="p-4 border-b border-gray-50 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4" /> Paid
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      )}
    </div>
  );
}
