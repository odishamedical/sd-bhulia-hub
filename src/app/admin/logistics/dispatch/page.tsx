"use client";

import PremiumMetricCard from "@/components/PremiumMetricCard";
import React, { useState, useEffect } from "react";
import { useOrders } from "@/lib/db-hooks";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function DispatchPage() {
  const { orders, loading } = useOrders();
  const [dispatchQueue, setDispatchQueue] = useState<any[]>([]);

  useEffect(() => {
    if (orders.length > 0) {
      // Filter for orders that are "processing" or "paid_escrow" or "paid_mock" and need dispatch
      const pendingDispatch = orders.filter(o => o.status === "processing" || o.status === "placed" || o.status === "approved").map((order, idx) => ({
        ...order,
        // If it already has an AWB, show it, otherwise show pending
        awbNumber: order.awbNumber || `Pending Generation`,
        carrier: order.carrier || ["Shiprocket", "Delhivery", "BlueDart"][idx % 3],
        sla: order.sla || ["24h", "48h", "Urgent"][idx % 3]
      }));
      setDispatchQueue(pendingDispatch);
    }
  }, [orders]);

  const handleGenerateManifest = () => {
    alert("Simulating Bulk Manifest Generation and printing labels for " + dispatchQueue.length + " orders.");
  };

  const handleSchedulePickup = async (order: any) => {
    try {
      // Optimistic UI update or loading state could go here
      const res = await fetch("/api/shipping/awb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          customerInfo: order.customerInfo || {
             fullName: "Valued Customer",
             address: "123 Main St",
             city: "Mumbai",
             pincode: "400001",
             state: "Maharashtra",
             email: "customer@example.com",
             phone: "9999999999"
          },
          items: order.items || [],
          subTotal: order.totalAmount || 0
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // Update Firestore
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, {
        status: "shipped",
        awbNumber: data.awb_code,
        carrier: data.courier_name,
        trackingUrl: `https://shiprocket.co/tracking/${data.awb_code}`
      });

      alert(`Success! AWB ${data.awb_code} generated via ${data.courier_name}.`);

      // -------------------------------------------------------------
      // PHASE 8: TRIGGER NOTIFICATION (WHATSAPP)
      // -------------------------------------------------------------
      try {
        const phone = order.customerInfo?.phone || "919876543210";
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "whatsapp",
            toPhone: phone,
            templateName: "order_shipped",
            whatsappComponents: [{ type: "body", parameters: [{ type: "text", text: data.awb_code }] }]
          })
        });
      } catch (err) {
        console.error("Failed to trigger shipping notification", err);
      }

    } catch (err: any) {
      console.error(err);
      alert("Failed to generate AWB: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Active Dispatch</h1>
          <p className="text-gray-800 mt-2 font-semibold">Manage packing queue, generate AWBs, and schedule courier pickups.</p>
        </div>
        <button 
          onClick={handleGenerateManifest}
          disabled={dispatchQueue.length === 0}
          className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgb(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Print Bulk Manifest
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <PremiumMetricCard title="Pending Packaging" value={<>{dispatchQueue.length}</>} index={0} />
        <PremiumMetricCard title="SLA Breaches (Urgent)" value={<>{dispatchQueue.filter(o => o.sla === "Urgent").length}</>} index={1} />
        <PremiumMetricCard title="Today's Pickups Scheduled" value={<>0</>} index={2} />
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Dispatch Queue</h2>
        {loading ? (
          <div className="py-20 text-center text-gray-400 font-medium">Loading dispatch data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="py-4 px-4 font-bold rounded-tl-xl">Order Ref</th>
                  <th className="py-4 px-4 font-bold">Customer Name</th>
                  <th className="py-4 px-4 font-bold">Assigned Carrier</th>
                  <th className="py-4 px-4 font-bold">AWB Number</th>
                  <th className="py-4 px-4 font-bold">SLA Priority</th>
                  <th className="py-4 px-4 font-bold text-right rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {dispatchQueue.map((item, idx) => (
                  <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-mono text-xs text-gray-500">{item.id || item.orderId}</td>
                    <td className="py-4 px-4 font-bold text-gray-900">{item.customerInfo?.fullName || item.customerName || "Valued Customer"}</td>
                    <td className="py-4 px-4 font-medium text-gray-700">{item.carrier}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold tracking-wider">{item.awbNumber}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        item.sla === 'Urgent' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {item.sla}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button onClick={() => handleSchedulePickup(item)} className="px-4 py-2 border-2 border-blue-100 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-50 transition-all">Schedule Pickup</button>
                    </td>
                  </tr>
                ))}
                {dispatchQueue.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-gray-500 font-medium">All pending orders dispatched!</td>
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
