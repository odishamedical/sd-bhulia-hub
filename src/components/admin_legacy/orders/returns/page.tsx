"use client";

import { Order } from "@/types";

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ReturnsQueuePage() {
  const [returnRequests, setReturnRequests] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function fetchReturns() {
    setIsLoading(true);
    try {
      const q = query(collection(db, "orders"), where("status", "==", "return_requested"));
      const snapshot = await getDocs(q);
      
      const returns: any[] = [];
      snapshot.forEach((docSnap) => {
        returns.push({ id: docSnap.id, ...docSnap.data() });
      });

      if (returns.length === 0 && process.env.NODE_ENV === "development") {
        returns.push({
          id: "ORD-99125",
          customerName: "Sunil Pradhan",
          productTitle: "Bomkai Cotton Saree",
          amount: "6,500",
          status: "return_requested",
          date: "2026-06-01T10:00:00Z",
          returnReason: "Color does not match the photo on website.",
        });
      }

      setReturnRequests(returns);
    } catch (error) {
      console.error("Failed to fetch return requests:", error);
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
        fetchReturns();
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
              fetchReturns();
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



  const handleAction = async (orderId: string, action: "approve" | "reject") => {
    setProcessingId(orderId);
    try {
      setReturnRequests(prev => prev.filter(r => r.id !== orderId));

      if (!orderId.startsWith("ORD-")) {
        const orderRef = doc(db, "orders", orderId);
        const updates = action === "approve" 
          ? { status: "return_approved", updatedAt: new Date().toISOString() }
          : { status: "delivered", returnRejected: true, updatedAt: new Date().toISOString() };
        
        await updateDoc(orderRef, updates);
      }
      
    } catch (error) {
      console.error(`Failed to ${action} return:`, error);
      alert(`Action failed.`);
      fetchReturns(); 
    } finally {
      setProcessingId(null);
    }
  };

  if (hasPermission === null) {
    return <div className="py-20 text-blue-600 font-bold uppercase tracking-widest text-xs text-center animate-pulse">Verifying Security Clearance...</div>;
  }

  if (hasPermission === false) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h3 className="font-bold text-lg mb-2">Access Denied</h3>
        <p>You do not have `Commerce & Orders` permissions to approve returns.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Returns & Exchanges</h1>
          <p className="text-sm text-gray-500 mt-1">Approve or reject customer return requests.</p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-lg text-sm font-bold text-gray-700">
          Pending Returns: <span className="text-red-600">{returnRequests.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500 animate-pulse">Scanning Return Queue...</div>
        ) : returnRequests.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-5xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold text-gray-900">No Return Requests</h3>
            <p className="text-gray-500 text-sm mt-1">Customers are happy with their orders.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-6 py-4">Order Details</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Reason for Return</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {returnRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <p className="font-bold text-gray-900">{req.productTitle}</p>
                      <p className="text-[10px] text-blue-600 font-mono mt-1">{req.id}</p>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <p className="font-bold text-gray-800">{req.customerName}</p>
                      <p className="text-[10px] text-gray-500 mt-1">₹ {req.amount}</p>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <p className="text-sm text-gray-700 italic border-l-2 border-amber-400 pl-3">"{req.returnReason || "No reason provided."}"</p>
                    </td>
                    <td className="px-6 py-4 align-middle text-right">
                      {processingId === req.id ? (
                        <div className="text-xs text-blue-600 font-semibold animate-pulse">Processing...</div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleAction(req.id, "reject")}
                            className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-lg text-xs transition-colors"
                          >
                            Reject
                          </button>
                          <button 
                            onClick={() => handleAction(req.id, "approve")}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-md transition-colors"
                          >
                            Approve Return
                          </button>
                        </div>
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
