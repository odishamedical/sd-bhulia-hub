"use client";

import React, { useState } from "react";
import { useOrders } from "@/lib/db-hooks";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminOrders() {
  const { orders, loading } = useOrders();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setProcessingId(orderId);
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus, updatedAt: new Date().toISOString() });
    } catch (error) {
      console.error("Failed to update order:", error);
      alert("Failed to update order status.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (o.customerInfo?.fullName && o.customerInfo.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Global Order Matrix</h1>
          <p className="text-gray-800 mt-2 font-semibold">Monitor all incoming B2C and B2B orders across the ecosystem.</p>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold text-sm">Syncing orders with live database...</p>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-6 flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">🔍</span>
              <input 
                type="text" 
                placeholder="Search by Order ID or Customer Name..." 
                className="w-full pl-12 pr-6 py-3 rounded-2xl border-2 border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none text-sm font-bold text-gray-900 bg-gray-50 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4 w-full lg:w-auto">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 lg:w-auto py-3 px-5 rounded-2xl border-2 border-gray-100 focus:border-blue-500 outline-none text-sm font-bold bg-gray-50 text-gray-900 focus:ring-4 focus:ring-blue-500/20 transition-all cursor-pointer"
              >
                <option value="all">All Orders</option>
                <option value="placed">Placed (New)</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto max-h-[70vh] custom-scrollbar relative">
              <table className="w-full text-left border-collapse relative">
                <thead className="sticky top-0 z-10">
                  <tr className="text-xs uppercase tracking-widest text-gray-500 border-b border-gray-100 bg-gray-50/90 backdrop-blur-md">
                    <th className="py-4 px-6 font-bold rounded-tl-3xl">Order ID & Date</th>
                    <th className="py-4 px-6 font-bold">Customer & Items</th>
                    <th className="py-4 px-6 font-bold">Financials</th>
                    <th className="py-4 px-6 font-bold">Status</th>
                    <th className="py-4 px-6 font-bold text-right rounded-tr-3xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {filteredOrders.map((order: any) => (
                    <tr key={order.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <p className="font-bold text-gray-900 font-mono text-sm">{order.id}</p>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">
                          {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : new Date(order.createdAt).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <p className="font-bold text-gray-900">{order.customerInfo?.fullName || "Guest User"}</p>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">
                          {order.items?.length || 0} ITEMS
                        </p>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <p className="font-bold text-gray-900 text-lg">₹{order.totalAmount || 0}</p>
                        <div className="mt-1 space-y-0.5 text-[10px] uppercase font-bold tracking-widest">
                          <p className="text-blue-600">Platform: ₹{order.platformShare || 0}</p>
                          <p className="text-green-600">Seller: ₹{order.vendorPayout || 0}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          order.status === 'placed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          order.status === 'processing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          order.status === 'shipped' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {order.status || 'unknown'}
                        </span>
                        {order.assignedLogisticsPartner && (
                          <div className="mt-2">
                             <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Partner: {order.assignedLogisticsPartner}</p>
                             {order.trackingNumber && <p className="text-[10px] font-mono font-bold text-blue-600 mt-0.5">{order.trackingNumber}</p>}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 align-middle text-right">
                        {processingId === order.id ? (
                          <div className="text-xs text-blue-600 font-bold uppercase tracking-widest animate-pulse">Syncing...</div>
                        ) : (
                          <select 
                            value={order.status || "placed"}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            className="bg-white border-2 border-gray-100 text-gray-900 font-bold text-xs rounded-xl px-3 py-2 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all cursor-pointer"
                          >
                            <option value="placed">Mark Placed</option>
                            <option value="processing">Mark Processing</option>
                            <option value="shipped">Mark Shipped</option>
                            <option value="delivered">Mark Delivered</option>
                            <option value="cancelled">Cancel Order</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-gray-500 font-medium">
                        <div className="text-4xl mb-3">📭</div>
                        No orders found in the live database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
