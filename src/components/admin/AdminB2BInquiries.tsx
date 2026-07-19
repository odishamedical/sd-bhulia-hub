"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";

interface B2BInquiry {
  id: string;
  productId: string;
  productName: string;
  supplierId: string;
  inquirerId: string;
  inquirerName: string;
  inquirerRole: string;
  requestedQuantity: number;
  status: "pending" | "approved_single" | "approved_global" | "rejected";
  createdAt: string;
}

export default function AdminB2BInquiries() {
  const [inquiries, setInquiries] = useState<B2BInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "b2b_inquiries"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data: B2BInquiry[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as B2BInquiry);
      });
      setInquiries(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleApproveSingle = async (inquiry: B2BInquiry) => {
    if (!confirm(`Grant B2B access to ${inquiry.inquirerName} for supplier ${inquiry.supplierId}?`)) return;
    try {
      // Update inquiry status
      await updateDoc(doc(db, "b2b_inquiries", inquiry.id), {
        status: "approved_single"
      });
      
      // Update user document
      const userRef = doc(db, "users", inquiry.inquirerId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        const approved = data.approvedB2BSuppliers || [];
        if (!approved.includes(inquiry.supplierId)) {
          await updateDoc(userRef, {
            approvedB2BSuppliers: [...approved, inquiry.supplierId]
          });
        }
      } else {
        await setDoc(userRef, {
          approvedB2BSuppliers: [inquiry.supplierId]
        }, { merge: true });
      }
      alert("Access granted for this specific supplier!");
    } catch (e) {
      console.error(e);
      alert("Error approving.");
    }
  };

  const handleApproveGlobal = async (inquiry: B2BInquiry) => {
    if (!confirm(`WARNING: Grant GLOBAL B2B access to ${inquiry.inquirerName}? They will see all wholesale prices.`)) return;
    try {
      // Update inquiry status
      await updateDoc(doc(db, "b2b_inquiries", inquiry.id), {
        status: "approved_global"
      });
      
      // Update user document
      const userRef = doc(db, "users", inquiry.inquirerId);
      await setDoc(userRef, {
        globalB2BAccess: true
      }, { merge: true });
      
      alert("Global access granted!");
    } catch (e) {
      console.error(e);
      alert("Error approving.");
    }
  };

  const handleReject = async (inquiryId: string) => {
    if (!confirm("Reject this request?")) return;
    try {
      await updateDoc(doc(db, "b2b_inquiries", inquiryId), {
        status: "rejected"
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-white">Loading inquiries...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-6 shadow-xl border border-purple-500/30">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
          <span>🛡️</span> B2B Access Control Panel
        </h2>
        <p className="text-sm text-purple-200">
          Review bulk pricing requests. You can grant targeted access (for a single supplier's catalog) or global access (unlocking all B2B prices platform-wide).
        </p>
      </div>

      <div className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#051815] text-[#C5A059] uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="px-6 py-4">Inquirer</th>
                <th className="px-6 py-4">Product & Supplier</th>
                <th className="px-6 py-4">Quantity Requested</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C5A059]/20">
              {inquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-bold">
                    No inquiries found.
                  </td>
                </tr>
              ) : inquiries.map((inq) => (
                <tr key={inq.id} className="hover:bg-[#C5A059]/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{inq.inquirerName || "Unknown"}</div>
                    <div className="text-[10px] text-gray-400 font-mono mt-1">{inq.inquirerId}</div>
                    <div className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded mt-1 inline-block uppercase">{inq.inquirerRole || "user"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#C5A059] line-clamp-1">{inq.productName || "Unknown Product"}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Prod ID: <span className="font-mono">{inq.productId}</span></div>
                    <div className="text-[10px] text-gray-400">Supplier: <span className="font-mono">{inq.supplierId}</span></div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xl font-bold text-white bg-white/10 px-3 py-1 rounded-lg border border-white/20">
                      {inq.requestedQuantity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {inq.status === "pending" && <span className="text-yellow-400 bg-yellow-400/20 px-2 py-1 rounded text-xs font-bold uppercase">Pending</span>}
                    {inq.status === "approved_single" && <span className="text-green-400 bg-green-400/20 px-2 py-1 rounded text-xs font-bold uppercase">Approved (Single)</span>}
                    {inq.status === "approved_global" && <span className="text-blue-400 bg-blue-400/20 px-2 py-1 rounded text-xs font-bold uppercase">Approved (Global)</span>}
                    {inq.status === "rejected" && <span className="text-red-400 bg-red-400/20 px-2 py-1 rounded text-xs font-bold uppercase">Rejected</span>}
                  </td>
                  <td className="px-6 py-4">
                    {inq.status === "pending" ? (
                      <div className="flex flex-col gap-2">
                        <button onClick={() => handleApproveSingle(inq)} className="bg-green-600/20 hover:bg-green-600/40 border border-green-500/50 text-green-400 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all">
                          Approve Supplier Only
                        </button>
                        <button onClick={() => handleApproveGlobal(inq)} className="bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-400 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all">
                          Approve Global Access
                        </button>
                        <button onClick={() => handleReject(inq.id)} className="bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-400 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all mt-2">
                          Reject Request
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 italic">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
