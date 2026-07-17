"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from "firebase/firestore";

export default function AdminReturns() {
  const [activeTab, setActiveTab] = useState<"returns" | "b2b">("returns");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "returns") {
        // Fetch orders where return is requested
        const q = query(collection(db, "orders"), where("status", "in", ["return_requested", "returned", "refunded"]));
        const snap = await getDocs(q);
        const data: any[] = [];
        snap.forEach(d => data.push({ id: d.id, ...d.data() }));
        data.sort((a, b) => {
          const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return timeB - timeA;
        });
        setItems(data);
      } else {
        // Fetch B2B wholesale inquiries
        const q = query(collection(db, "b2b_inquiries"));
        const snap = await getDocs(q);
        const data: any[] = [];
        snap.forEach(d => data.push({ id: d.id, ...d.data() }));
        data.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
          return timeB - timeA;
        });
        setItems(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleReturnAction = async (orderId: string, action: "approve" | "reject" | "refund") => {
    if (!confirm(`Are you sure you want to ${action} this return?`)) return;
    setProcessingId(orderId);
    try {
      let newStatus = "";
      if (action === "approve") newStatus = "return_approved";
      if (action === "reject") newStatus = "delivered"; // back to delivered
      if (action === "refund") newStatus = "refunded";

      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      setItems(prev => prev.filter(o => o.id !== orderId));
    } catch (e) {
      console.error(e);
      alert("Error processing return.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleB2BAction = async (inquiryId: string, status: string) => {
    setProcessingId(inquiryId);
    try {
      await updateDoc(doc(db, "b2b_inquiries", inquiryId), {
        status,
        updatedAt: new Date().toISOString()
      });
      setItems(prev => prev.map(item => item.id === inquiryId ? { ...item, status } : item));
    } catch (e) {
      console.error(e);
      alert("Error updating B2B inquiry.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Returns & B2B Wholesale</h2>
          <p className="text-gray-500 text-sm">Manage product returns and large wholesale inquiries.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab("returns")}
            className={`px-6 py-2 rounded-md font-bold text-sm transition-all ${activeTab === "returns" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Customer Returns
          </button>
          <button 
            onClick={() => setActiveTab("b2b")}
            className={`px-6 py-2 rounded-md font-bold text-sm transition-all ${activeTab === "b2b" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            B2B Inquiries
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
                  <th className="px-6 py-4">{activeTab === "returns" ? "Order ID & Request Date" : "Inquiry ID & Date"}</th>
                  <th className="px-6 py-4">{activeTab === "returns" ? "Customer" : "Company / Contact"}</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No {activeTab === "returns" ? "return requests" : "B2B inquiries"} found.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <div className="font-mono font-bold text-gray-900">{item.id}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">
                          {activeTab === "returns" ? new Date(item.updatedAt).toLocaleString() : (item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : "N/A")}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        {activeTab === "returns" ? (
                          <>
                            <div className="font-bold text-gray-800">{item.customerInfo?.fullName || "Guest"}</div>
                            <div className="text-xs text-gray-500 mt-1">{item.customerInfo?.email}</div>
                          </>
                        ) : (
                          <>
                            <div className="font-bold text-gray-800">{item.companyName}</div>
                            <div className="text-xs text-gray-500 mt-1">{item.contactName} - {item.phone}</div>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top max-w-xs">
                        {activeTab === "returns" ? (
                          <>
                            <div className="font-bold text-red-600">Refund: ₹{item.totalAmount}</div>
                            <div className="text-xs text-gray-500 mt-1 italic truncate">Reason: {item.returnReason || "Size issue / Not fitting"}</div>
                          </>
                        ) : (
                          <>
                            <div className="font-bold text-blue-600">Est. Quantity: {item.estimatedQuantity}</div>
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">{item.message}</div>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest rounded-full border ${
                          item.status === 'return_requested' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                          item.status === 'refunded' ? 'bg-green-50 text-green-600 border-green-200' :
                          item.status === 'contacted' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                          {item.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right align-top">
                        {activeTab === "returns" ? (
                          <div className="flex justify-end gap-2">
                            {item.status === "return_requested" && (
                              <>
                                <button 
                                  onClick={() => handleReturnAction(item.id, "reject")}
                                  disabled={processingId === item.id}
                                  className="px-3 py-1.5 border border-red-200 text-red-600 rounded text-xs font-bold hover:bg-red-50 uppercase disabled:opacity-50"
                                >
                                  Reject
                                </button>
                                <button 
                                  onClick={() => handleReturnAction(item.id, "approve")}
                                  disabled={processingId === item.id}
                                  className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 uppercase disabled:opacity-50"
                                >
                                  Approve
                                </button>
                              </>
                            )}
                            {item.status === "returned" && (
                              <button 
                                onClick={() => handleReturnAction(item.id, "refund")}
                                disabled={processingId === item.id}
                                className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 uppercase disabled:opacity-50"
                              >
                                Issue Refund
                              </button>
                            )}
                          </div>
                        ) : (
                          <select 
                            value={item.status || "new"}
                            onChange={(e) => handleB2BAction(item.id, e.target.value)}
                            disabled={processingId === item.id}
                            className="text-xs font-bold bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-500"
                          >
                            <option value="new">Mark as New</option>
                            <option value="contacted">Mark as Contacted</option>
                            <option value="converted">Converted to Order</option>
                            <option value="closed">Closed / Not Interested</option>
                          </select>
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
