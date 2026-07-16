"use client";

import React, { useState, useEffect } from "react";
import PremiumMetricCard from "@/components/PremiumMetricCard";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, doc, updateDoc, where, getDocs, orderBy } from "firebase/firestore";

export default function ResellerCommissionsPage() {
  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fetch Payout Requests
    const q1 = query(collection(db, "payout_requests"), orderBy("createdAt", "desc"));
    const unsub1 = onSnapshot(q1, (snap) => {
      setPayoutRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 2. Fetch Transactions Ledger
    const q2 = query(collection(db, "transactions"));
    const unsub2 = onSnapshot(q2, (snap) => {
      setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 3. Fetch Orders for Platform Revenue
    const q3 = query(collection(db, "orders"));
    const unsub3 = onSnapshot(q3, (snap) => {
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  // Calculate Metrics
  const globalEscrow = transactions.filter(t => t.status === "pending_escrow").reduce((sum, t) => sum + t.amount, 0);
  const totalPaidOut = transactions.filter(t => t.status === "paid_out").reduce((sum, t) => sum + t.amount, 0);
  
  // Platform Revenue (5% cut from delivered/completed orders)
  const platformRevenue = orders.filter(o => o.status === "delivered").reduce((sum, o) => sum + (o.platformShare || 0), 0);

  const handleMarkPaid = async (requestId: string, resellerId: string) => {
    if (!confirm("Are you sure you have transferred the funds to this reseller's bank account?")) return;
    setProcessingId(requestId);
    
    try {
      // 1. Mark request as paid
      await updateDoc(doc(db, "payout_requests", requestId), {
        status: "paid",
        paidAt: new Date().toISOString()
      });

      // 2. Update all "completed" transactions for this reseller to "paid_out"
      // This zeroes out their Available Balance on their dashboard.
      const txQuery = query(collection(db, "transactions"), where("resellerId", "==", resellerId), where("status", "==", "completed"));
      const snap = await getDocs(txQuery);
      
      for (const txDoc of snap.docs) {
        await updateDoc(doc(db, "transactions", txDoc.id), {
          status: "paid_out",
          paidOutAt: new Date().toISOString(),
          payoutRequestId: requestId
        });
      }

      alert("Payout successfully marked as Paid. Reseller wallet has been updated.");
    } catch (err) {
      console.error(err);
      alert("Failed to process payout.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Finance & Payouts</h1>
          <p className="text-gray-800 mt-2 font-semibold">Manage global escrow, platform revenue, and clear reseller payouts.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <PremiumMetricCard title="Global Escrow (Locked)" value={`₹${globalEscrow.toLocaleString('en-IN')}`} index={0} />
        <PremiumMetricCard title="Total Payouts Cleared" value={`₹${totalPaidOut.toLocaleString('en-IN')}`} index={1} />
        <PremiumMetricCard title="Platform Revenue (5%)" value={`₹${platformRevenue.toLocaleString('en-IN')}`} index={2} />
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Pending Payout Requests</h2>
        {loading ? (
          <div className="py-20 text-center text-gray-400 font-medium">Loading ledger data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="py-4 px-4 font-bold rounded-tl-xl">Request ID</th>
                  <th className="py-4 px-4 font-bold">Reseller ID</th>
                  <th className="py-4 px-4 font-bold">Amount</th>
                  <th className="py-4 px-4 font-bold">Status</th>
                  <th className="py-4 px-4 font-bold text-right rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {payoutRequests.filter(pr => pr.status === "pending").map((req) => (
                  <tr key={req.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-mono text-xs text-gray-500">{req.id}</td>
                    <td className="py-4 px-4 font-medium text-gray-700">{req.resellerId}</td>
                    <td className="py-4 px-4 font-black text-gray-900">₹{req.amount?.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-yellow-50 text-yellow-700 border-yellow-200">
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => handleMarkPaid(req.id, req.resellerId)}
                        disabled={processingId === req.id}
                        className="px-4 py-2 border-2 border-green-100 text-green-600 rounded-xl text-xs font-bold hover:bg-green-50 transition-all"
                      >
                        {processingId === req.id ? "Processing..." : "Mark as Paid"}
                      </button>
                    </td>
                  </tr>
                ))}
                {payoutRequests.filter(pr => pr.status === "pending").length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-500 font-medium">No pending payout requests! You are all caught up.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {payoutRequests.filter(pr => pr.status === "paid").length > 0 && (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Payment History</h2>
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="py-4 px-4 font-bold rounded-tl-xl">Request ID</th>
                  <th className="py-4 px-4 font-bold">Reseller ID</th>
                  <th className="py-4 px-4 font-bold">Amount Paid</th>
                  <th className="py-4 px-4 font-bold rounded-tr-xl">Paid At</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {payoutRequests.filter(pr => pr.status === "paid").map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-mono text-xs text-gray-500">{req.id}</td>
                    <td className="py-4 px-4 font-medium text-gray-700">{req.resellerId}</td>
                    <td className="py-4 px-4 font-black text-gray-900">₹{req.amount?.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-4 text-xs font-mono text-gray-500">{new Date(req.paidAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
