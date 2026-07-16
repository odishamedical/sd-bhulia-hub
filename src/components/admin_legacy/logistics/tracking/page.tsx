"use client";

import PremiumMetricCard from "@/components/PremiumMetricCard";
import React, { useState, useEffect } from "react";
import { useOrders } from "@/lib/db-hooks";
import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";

export default function TrackingPage() {
  const { orders, loading } = useOrders();
  const [trackingData, setTrackingData] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useState<string | null>(null);

  useEffect(() => {
    if (orders.length > 0) {
      // Mock tracking statuses mapping
      const statuses = ["Picked Up", "In Transit", "Out for Delivery", "Delivered"];
      const activeTracking = orders.filter(o => o.status === "shipped" || o.status === "delivered").map((order, idx) => ({
        ...order,
        awbNumber: order.awbNumber || `Pending`,
        carrier: order.carrier || "Pending",
        trackingUrl: order.trackingUrl || "#",
        trackingStatus: (order as any).status === "delivered" ? "Delivered" : statuses[idx % 3],
        lastUpdate: "Today, " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }));
      setTrackingData(activeTracking);
    }
  }, [orders]);

  const handleSyncShiprocket = () => {
    alert("Simulating API Sync with Shiprocket servers to refresh AWB statuses...");
  };

  const handleSimulateDelivery = async (orderId: string) => {
    setIsSimulating(orderId);
    try {
      // 1. Update order status to delivered
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: "delivered" });

      // 2. Auto-Fund Reseller Wallet! (Phase 3 Ledger update)
      const q = query(collection(db, "transactions"), where("orderId", "==", orderId), where("status", "==", "pending_escrow"));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        for (const transactionDoc of snap.docs) {
          await updateDoc(doc(db, "transactions", transactionDoc.id), {
            status: "completed",
            completedAt: new Date().toISOString()
          });
        }
        alert(`Simulated Delivery Success! \nOrder ${orderId} marked as Delivered. \nEscrow cleared: Reseller Wallet has been auto-funded!`);
      } else {
        alert(`Simulated Delivery Success! Order ${orderId} marked as Delivered. (No pending commissions found).`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to simulate delivery");
    } finally {
      setIsSimulating(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Active Tracking</h1>
          <p className="text-gray-800 mt-2 font-semibold">Unified tracking board integrated with Shiprocket courier APIs.</p>
        </div>
        <button 
          onClick={handleSyncShiprocket}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgb(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          Sync Shiprocket API
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <PremiumMetricCard title="Picked Up" value={<>{trackingData.filter(o => o.trackingStatus === "Picked Up").length}</>} index={0} />
        <PremiumMetricCard title="In Transit" value={<>{trackingData.filter(o => o.trackingStatus === "In Transit").length}</>} index={1} />
        <PremiumMetricCard title="Out for Delivery" value={<>{trackingData.filter(o => o.trackingStatus === "Out for Delivery").length}</>} index={2} />
        <PremiumMetricCard title="Delivered Today" value={<>{trackingData.filter(o => o.trackingStatus === "Delivered").length}</>} index={3} />
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Master Live Tracking</h2>
        {loading ? (
          <div className="py-20 text-center text-gray-400 font-medium">Loading API Tracking Data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="py-4 px-4 font-bold rounded-tl-xl">AWB Reference</th>
                  <th className="py-4 px-4 font-bold">Courier</th>
                  <th className="py-4 px-4 font-bold">Customer City</th>
                  <th className="py-4 px-4 font-bold">Live Status</th>
                  <th className="py-4 px-4 font-bold">Last API Sync</th>
                  <th className="py-4 px-4 font-bold text-right rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {trackingData.map((item, idx) => (
                  <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900">{item.awbNumber}</div>
                      <div className="text-xs font-mono text-gray-500">Order: {item.id}</div>
                    </td>
                    <td className="py-4 px-4 font-bold text-gray-700">{item.carrier}</td>
                    <td className="py-4 px-4 text-gray-600 font-medium">{item.customerInfo?.city || "Bhubaneswar"}, OD</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        item.trackingStatus === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                        item.trackingStatus === 'Out for Delivery' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        item.trackingStatus === 'In Transit' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {item.trackingStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs font-mono text-gray-500">{item.lastUpdate}</td>
                    <td className="py-4 px-4 text-right">
                      {item.trackingStatus !== "Delivered" && (
                        <button 
                          onClick={() => handleSimulateDelivery(item.id)}
                          disabled={isSimulating === item.id}
                          className="mr-2 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 rounded-lg text-xs font-bold transition-all"
                        >
                          {isSimulating === item.id ? "Processing..." : "Simulate Delivery"}
                        </button>
                      )}
                      {item.trackingUrl !== "#" ? (
                        <a href={item.trackingUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-all inline-block">Track URL</a>
                      ) : (
                        <button disabled className="px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-xs font-bold inline-block cursor-not-allowed">No URL</button>
                      )}
                    </td>
                  </tr>
                ))}
                {trackingData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-gray-500 font-medium">No active shipments in transit.</td>
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
