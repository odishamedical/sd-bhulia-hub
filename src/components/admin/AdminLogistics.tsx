"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from "firebase/firestore";

export default function AdminLogistics() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "intransit">("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [courier, setCourier] = useState("Delhivery");
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    fetchLogisticsData();
  }, [activeTab]);

  const fetchLogisticsData = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "orders"),
        where("status", "==", activeTab === "pending" ? "processing" : "shipped")
      );
      const snap = await getDocs(q);
      const data: any[] = [];
      snap.forEach(d => {
        data.push({ id: d.id, ...d.data() });
      });
      // Sort in memory since Firestore requires composite indexes for where + orderBy
      data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
        return timeB - timeA;
      });
      setOrders(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setProcessingId(selectedOrder.id);
    
    try {
      await updateDoc(doc(db, "orders", selectedOrder.id), {
        status: "shipped",
        trackingInfo: {
          courier,
          trackingNumber,
          dispatchedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      });
      
      setIsModalOpen(false);
      setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
      alert(`Order ${selectedOrder.id} dispatched via ${courier}!`);
    } catch (error) {
      console.error(error);
      alert("Failed to update tracking info.");
    } finally {
      setProcessingId(null);
    }
  };

  const markDelivered = async (orderId: string) => {
    if (!confirm("Are you sure you want to mark this package as Delivered?")) return;
    setProcessingId(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "delivered",
        updatedAt: new Date().toISOString()
      });
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (error) {
      console.error(error);
      alert("Failed to mark as delivered.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleGenerateWaybill = (orderId: string) => {
    // This is a placeholder for integrating Shiprocket / Delhivery API
    alert(`Generating Waybill for ${orderId}... This would connect to the Logistics API.`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Active Dispatch</h2>
          <p className="text-gray-500 text-sm">Logistics command center for assigning couriers and tracking shipments.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-2 rounded-md font-bold text-sm transition-all ${activeTab === "pending" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Pending Dispatch
          </button>
          <button 
            onClick={() => setActiveTab("intransit")}
            className={`px-6 py-2 rounded-md font-bold text-sm transition-all ${activeTab === "intransit" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            In-Transit
          </button>
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
                  <th className="px-6 py-4">Order ID & Date</th>
                  <th className="px-6 py-4">Customer & Destination</th>
                  <th className="px-6 py-4">Weight / Items</th>
                  {activeTab === "intransit" && <th className="px-6 py-4">Tracking Info</th>}
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No {activeTab === "pending" ? "pending dispatch" : "in-transit"} orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-gray-900">{o.id}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">
                          {o.createdAt?.toDate ? o.createdAt.toDate().toLocaleString() : new Date(o.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">{o.customerInfo?.fullName || "Guest"}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {o.customerInfo?.address?.city}, {o.customerInfo?.address?.state} - {o.customerInfo?.address?.pincode}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-700">{o.items?.length || 0} items</div>
                        <div className="text-xs text-blue-600 font-bold mt-1 uppercase tracking-widest">Est. 1.2 KG</div>
                      </td>
                      {activeTab === "intransit" && (
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{o.trackingInfo?.courier}</div>
                          <div className="text-xs text-gray-500 font-mono mt-1">{o.trackingInfo?.trackingNumber}</div>
                        </td>
                      )}
                      <td className="px-6 py-4 text-right">
                        {activeTab === "pending" ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleGenerateWaybill(o.id)}
                              className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded text-xs font-bold hover:bg-gray-50 uppercase"
                            >
                              Print Label
                            </button>
                            <button 
                              onClick={() => { setSelectedOrder(o); setIsModalOpen(true); }}
                              className="px-3 py-1.5 bg-[#051815] text-[#C5A059] rounded text-xs font-bold hover:bg-[#0a201c] uppercase"
                            >
                              Dispatch
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => markDelivered(o.id)}
                            disabled={processingId === o.id}
                            className="px-4 py-2 bg-green-100 text-green-700 rounded text-xs font-bold hover:bg-green-200 uppercase disabled:opacity-50"
                          >
                            {processingId === o.id ? "Updating..." : "Mark Delivered"}
                          </button>
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

      {/* DISPATCH MODAL */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Assign Courier</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleDispatch} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Order ID</label>
                <div className="font-mono text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded border border-gray-200">
                  {selectedOrder.id}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Courier Partner</label>
                <select 
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Delhivery">Delhivery</option>
                  <option value="BlueDart">BlueDart</option>
                  <option value="DTDC">DTDC</option>
                  <option value="XpressBees">XpressBees</option>
                  <option value="IndiaPost">India Post (Speed Post)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tracking Number (AWB)</label>
                <input 
                  type="text" 
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 13987491823"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={processingId === selectedOrder.id} className="px-6 py-2 bg-[#051815] text-[#C5A059] font-bold text-sm rounded-lg hover:bg-[#0a201c] disabled:opacity-50 transition-colors">
                  {processingId === selectedOrder.id ? "Saving..." : "Confirm Dispatch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
