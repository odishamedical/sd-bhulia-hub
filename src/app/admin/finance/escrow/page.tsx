"use client";

import { Order } from "@/types";

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function EscrowVaultPage() {
  const [escrowHolds, setEscrowHolds] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Strict Protocol: Verify Access on Mount
  useEffect(() => {
    const verifyAccessAndFetch = async () => {
      const email = localStorage.getItem("sd_current_user_email");
      const role = localStorage.getItem("sd_current_user_role");

      if (role === "super_admin") {
        setHasPermission(true);
        fetchEscrow();
        return;
      }

      if (role === "admin" && email) {
        try {
          const q = query(collection(db, "users"), where("email", "==", email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const adminData = snap.docs[0].data();
            // Checking the granular "finance" permission
            if (adminData.permissions?.finance === true) {
              setHasPermission(true);
              fetchEscrow();
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

  async function fetchEscrow() {
    setIsLoading(true);
    try {
      // Mock data for escrow locked funds
      let fetched: any[] = [];
      try {
        const q = query(collection(db, "orders"), where("paymentStatus", "==", "escrow_held"));
        const snapshot = await getDocs(q);
        snapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() });
        });
      } catch (e) {
        console.warn("Could not fetch escrow data, using mock.");
      }

      if (fetched.length === 0 && process.env.NODE_ENV === "development") {
        fetched = [
          {
            id: "ORD-99121",
            amount: 85000,
            weaverName: "Lokanath Meher",
            customerName: "Odia Weaves Emporium",
            status: "escrow_held",
            lockedOn: "2026-06-04T08:30:00Z",
            deliveryStatus: "delivered" // Eligible for release
          },
          {
            id: "ORD-99127",
            amount: 14500,
            weaverName: "Nuapatna Co-op",
            customerName: "Rahul Sharma",
            status: "escrow_held",
            lockedOn: "2026-06-03T11:20:00Z",
            deliveryStatus: "in_transit" // Not eligible yet
          }
        ];
      }

      setEscrowHolds(fetched as any);
    } catch (error) {
      console.error("Failed to fetch escrow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (orderId: string, action: "release" | "refund") => {
    if (!confirm(`Are you absolutely sure you want to ${action} these funds? This action is irreversible and writes to the financial ledger.`)) return;
    
    setProcessingId(orderId);
    try {
      setEscrowHolds(prev => prev.filter(o => o.id !== orderId));

      if (!orderId.startsWith("ORD-")) {
        const orderRef = doc(db, "orders", orderId);
        const updates = action === "release" 
          ? { paymentStatus: "paid_to_weaver", releasedAt: new Date().toISOString() }
          : { paymentStatus: "refunded", status: "cancelled", refundedAt: new Date().toISOString() };
        
        await updateDoc(orderRef, updates);
      }
    } catch (error) {
      console.error(`Failed to ${action} escrow:`, error);
      alert(`Ledger update failed.`);
      fetchEscrow(); 
    } finally {
      setProcessingId(null);
    }
  };

  if (hasPermission === null) {
    return <div className="py-20 text-red-600 font-bold uppercase tracking-widest text-xs text-center animate-pulse">Verifying Treasury Clearance...</div>;
  }

  if (hasPermission === false) {
    return (
      <div className="bg-red-900 text-red-50 p-6 rounded-xl shadow-2xl border border-red-700">
        <h3 className="font-bold text-xl mb-2 flex items-center gap-2"><span className="text-3xl">🛑</span> Level 5 Authorization Required</h3>
        <p>You do not have `Finance & Ledger` permissions. Access to the Escrow Vault is strictly prohibited.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Escrow Vault
            <span className="bg-red-100 text-red-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-red-200">Treasury</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage funds locked in escrow between customers and weavers.</p>
        </div>
        <div className="bg-gray-900 border border-gray-700 shadow-sm px-5 py-3 rounded-xl text-sm font-bold text-white flex flex-col items-end">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">Total Locked Volume</span>
          <span className="text-lg text-emerald-400">₹ {escrowHolds.reduce((sum, item) => sum + Number(item.amount), 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500 animate-pulse">Accessing Secure Ledger...</div>
        ) : escrowHolds.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-5xl mb-4">🏦</div>
            <h3 className="text-xl font-bold text-gray-900">Vault is Empty</h3>
            <p className="text-gray-500 text-sm mt-1">All escrow funds have been successfully disbursed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-red-50 border-b border-red-100 text-red-900 uppercase tracking-wider font-bold text-[11px]">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Financials</th>
                  <th className="px-6 py-4">Counterparties</th>
                  <th className="px-6 py-4 text-right">Ledger Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {escrowHolds.map((hold) => (
                  <tr key={hold.id} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-6 py-5 align-top">
                      <p className="font-bold text-gray-900 font-mono">{hold.id}</p>
                      <p className="text-[10px] text-gray-500 mt-1">Locked: {new Date(hold.lockedOn as string).toLocaleString()}</p>
                      <span className={`inline-block mt-2 px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${
                        hold.deliveryStatus === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        Logistics: {hold.deliveryStatus?.replace("_", " ") || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <p className="text-lg font-bold text-emerald-600">₹ {Number(hold.amount).toLocaleString()}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Holding in Escrow</p>
                    </td>
                    <td className="px-6 py-5 align-top text-xs">
                      <div className="flex flex-col gap-2">
                        <div>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">From Customer</span>
                          <span className="font-semibold text-gray-800">{hold.customerName}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">To Weaver</span>
                          <span className="font-semibold text-blue-700">{hold.weaverName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-middle text-right">
                      {processingId === hold.id ? (
                        <div className="text-xs text-red-600 font-bold animate-pulse">Writing to Ledger...</div>
                      ) : hold.deliveryStatus !== 'delivered' ? (
                        <div className="text-[10px] text-gray-500 font-bold uppercase text-right max-w-[150px] ml-auto leading-tight">
                          Cannot release funds until delivery is confirmed.
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleAction(hold.id, "refund")}
                            className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-lg text-xs transition-colors"
                          >
                            Force Refund
                          </button>
                          <button 
                            onClick={() => handleAction(hold.id, "release")}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-md transition-colors"
                          >
                            Release to Weaver
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
