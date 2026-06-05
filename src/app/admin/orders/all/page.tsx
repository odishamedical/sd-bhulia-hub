"use client";

import { Order } from "@/types";

import React, { useState, useEffect } from "react";
import { collection, query, getDocs, doc, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function MasterOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function fetchOrders() {
    setIsLoading(true);
    try {
      // Mock data for development if collection is empty
      let fetchedOrders: any[] = [];
      try {
        const snapshot = await getDocs(collection(db, "orders"));
        snapshot.forEach((docSnap) => {
          fetchedOrders.push({ id: docSnap.id, ...docSnap.data() });
        });
      } catch (e) {
        console.warn("Could not fetch orders from Firestore, using mock data.");
      }

      if (fetchedOrders.length === 0 && process.env.NODE_ENV === "development") {
        fetchedOrders = [
          {
            id: "ORD-99120",
            customerName: "Ramesh Kumar",
            productTitle: "Royal Pasapalli Cotton",
            amount: "12,500",
            status: "processing",
            date: "2026-06-03T10:00:00Z",
            paymentStatus: "paid",
            source: "B2C Web"
          },
          {
            id: "ORD-99121",
            customerName: "Odia Weaves Emporium",
            productTitle: "Bulk Order: 5x Single Ikat",
            amount: "85,000",
            status: "placed",
            date: "2026-06-04T08:30:00Z",
            paymentStatus: "escrow_held",
            source: "B2B Franchise"
          },
          {
            id: "ORD-99122",
            customerName: "Anita Sharma",
            productTitle: "Bomkai Silk Saree",
            amount: "24,800",
            status: "shipped",
            date: "2026-06-02T15:45:00Z",
            paymentStatus: "paid",
            source: "B2C App"
          }
        ];
      }

      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const verifyAccessAndFetch = async () => {
      const email = localStorage.getItem("sd_current_user_email");
      const role = localStorage.getItem("sd_current_user_role");

      if (role === "super_admin") {
        setHasPermission(true);
        fetchOrders();
        return;
      }

      if (role === "admin" && email) {
        try {
          const q = query(collection(db, "users"), where("email", "==", email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const adminData = snap.docs[0].data();
            if (adminData.permissions?.orders === true) {
              setHasPermission(true);
              fetchOrders();
              return;
            }
          }
        } catch (error) {
          console.error("Permission check failed:", error);
        }
      }

      setHasPermission(false);
      setIsLoading(false);
    };

    verifyAccessAndFetch();
  }, []);



  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setProcessingId(orderId);
    try {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      
      if (!orderId.startsWith("ORD-")) {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, { status: newStatus, updatedAt: new Date().toISOString() });
      }
    } catch (error) {
      console.error("Failed to update order:", error);
      fetchOrders(); 
    } finally {
      setProcessingId(null);
    }
  };

  const filteredOrders = filterStatus === "all" ? orders : orders.filter(o => o.status === filterStatus);

  if (hasPermission === null) {
    return <div className="py-20 text-blue-600 font-bold uppercase tracking-widest text-xs text-center animate-pulse">Verifying Security Clearance...</div>;
  }

  if (hasPermission === false) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl shadow-sm">
        <h3 className="font-bold text-lg mb-2">Access Denied</h3>
        <p>You do not have `Commerce & Orders` permissions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Global Order Matrix</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor all incoming B2C and B2B orders across the ecosystem.</p>
        </div>
        
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
        >
          <option value="all">All Orders</option>
          <option value="placed">Placed (New)</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500 animate-pulse">Fetching Global Matrix...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-900">No Orders Found</h3>
            <p className="text-gray-500 text-sm mt-1">There are no orders matching the current filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-6 py-4">Order ID & Date</th>
                  <th className="px-6 py-4">Customer & Source</th>
                  <th className="px-6 py-4">Financials</th>
                  <th className="px-6 py-4">Fulfillment Status</th>
                  <th className="px-6 py-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <p className="font-bold text-gray-900 font-mono text-xs">{order.id}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{new Date(order.date).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <p className="font-bold text-gray-800">{order.customerName}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-[9px] font-bold uppercase rounded border border-purple-100">
                        {(order as any).source}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <p className="font-bold text-gray-900">₹ {order.amount}</p>
                      <p className={`text-[10px] font-bold uppercase mt-1 ${(order as any).paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                        {(order as any).paymentStatus.replace("_", " ")}
                      </p>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        order.status === 'placed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        order.status === 'processing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        order.status === 'shipped' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-middle text-right">
                      {processingId === order.id ? (
                        <div className="text-xs text-blue-600 font-semibold animate-pulse">Syncing...</div>
                      ) : (
                        <select 
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded px-2 py-1 outline-none focus:border-blue-400"
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
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
