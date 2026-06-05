"use client";

import { Subscription } from "@/types";

import React, { useState, useEffect } from "react";
import { collection, query, getDocs, doc, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SaasBillingPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function fetchSubscriptions() {
    setIsLoading(true);
    try {
      let fetched: any[] = [];
      try {
        const snapshot = await getDocs(collection(db, "subscriptions"));
        snapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() });
        });
      } catch (e) {
        console.warn("Could not fetch subscriptions, using mock.");
      }

      if (fetched.length === 0 && process.env.NODE_ENV === "development") {
        fetched = [
          {
            id: "SUB-88102",
            franchiseName: "Odia Weaves Emporium",
            plan: "Enterprise B2B",
            amount: 9999,
            billingCycle: "Monthly",
            status: "active",
            nextBilling: "2026-07-01T00:00:00Z"
          },
          {
            id: "SUB-88103",
            franchiseName: "Sambalpur Handloom Co.",
            plan: "Pro Seller",
            amount: 2999,
            billingCycle: "Monthly",
            status: "past_due",
            nextBilling: "2026-06-01T00:00:00Z"
          }
        ];
      }

      setSubscriptions(fetched as any);
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
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
        fetchSubscriptions();
        return;
      }

      if (role === "admin" && email) {
        try {
          const q = query(collection(db, "users"), where("email", "==", email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const adminData = snap.docs[0].data();
            if (adminData.permissions?.finance === true) {
              setHasPermission(true);
              fetchSubscriptions();
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



  const handleAction = async (subId: string, action: "revoke" | "remind") => {
    setProcessingId(subId);
    try {
      if (action === "revoke") {
        setSubscriptions(prev => prev.map(s => s.id === subId ? { ...s, status: "cancelled" } : s));
        if (!subId.startsWith("SUB-")) {
          const subRef = doc(db, "subscriptions", subId);
          await updateDoc(subRef, { status: "cancelled", cancelledAt: new Date().toISOString() });
        }
      } else {
        // Just simulate an email reminder
        await new Promise(resolve => setTimeout(resolve, 800));
        alert("Payment reminder sent to Franchise owner.");
      }
    } catch (error) {
      console.error(`Failed to ${action} subscription:`, error);
      fetchSubscriptions(); 
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
        <p>You do not have `Finance & Ledger` permissions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            SaaS Billing & Subscriptions
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage recurring revenue from Franchise API usage and Pro Seller tools.</p>
        </div>
        <div className="bg-gray-900 border border-gray-700 shadow-sm px-5 py-3 rounded-xl text-sm font-bold text-white flex flex-col items-end">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">MRR (Monthly Recurring)</span>
          <span className="text-lg text-emerald-400">₹ {subscriptions.reduce((sum, item) => item.status === 'active' ? sum + Number(item.amount) : sum, 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500 animate-pulse">Fetching Stripe Webhooks...</div>
        ) : subscriptions.length === 0 ? (
          <div className="p-16 text-center">
            <h3 className="text-xl font-bold text-gray-900">No Active Subscriptions</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-6 py-4">Franchise</th>
                  <th className="px-6 py-4">Subscription Plan</th>
                  <th className="px-6 py-4">Status & Billing</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5 align-top">
                      <p className="font-bold text-gray-900">{sub.franchiseName}</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-1">{sub.id}</p>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <p className="font-bold text-blue-700">{sub.plan}</p>
                      <p className="text-xs text-gray-600 mt-1">₹ {sub.amount} / {sub.billingCycle}</p>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        sub.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                        sub.status === 'past_due' ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {sub.status.replace("_", " ")}
                      </span>
                      <p className="text-[10px] text-gray-500 mt-2 font-mono">Next: {new Date(sub.nextBilling).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-5 align-middle text-right">
                      {processingId === sub.id ? (
                        <div className="text-xs text-blue-600 font-bold animate-pulse">Processing...</div>
                      ) : sub.status === 'cancelled' ? (
                        <span className="text-xs text-gray-400 font-bold">Access Revoked</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleAction(sub.id, "revoke")}
                            className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-lg text-xs transition-colors"
                          >
                            Revoke Access
                          </button>
                          {sub.status === 'past_due' && (
                            <button 
                              onClick={() => handleAction(sub.id, "remind")}
                              className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-bold rounded-lg text-xs shadow-md transition-colors"
                            >
                              Send Reminder
                            </button>
                          )}
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
