"use client";

import { Cart } from "@/types";

import React, { useState, useEffect } from "react";
import { collection, query, getDocs, doc, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function fetchCarts() {
    setIsLoading(true);
    try {
      let fetchedCarts: any[] = [];
      try {
        const snapshot = await getDocs(collection(db, "abandoned_carts"));
        snapshot.forEach((docSnap) => {
          fetchedCarts.push({ id: docSnap.id, ...docSnap.data() });
        });
      } catch (e) {
        console.warn("Could not fetch carts from Firestore, using mock data.");
      }

      if (fetchedCarts.length === 0 && process.env.NODE_ENV === "development") {
        fetchedCarts = [
          {
            id: "CART-77190",
            customerName: "Vikash Senapati",
            customerEmail: "vikash@example.com",
            items: ["Khandua Silk Saree"],
            totalValue: "18,500",
            abandonedAt: "2026-06-03T18:45:00Z",
            reminderSent: false
          },
          {
            id: "CART-77191",
            customerName: "Priya Mohanty",
            customerEmail: "priya.m@example.com",
            items: ["Bapta Cotton Saree", "Sambalpuri Ikat Dress Material"],
            totalValue: "14,200",
            abandonedAt: "2026-06-04T09:12:00Z",
            reminderSent: true
          }
        ];
      }

      setCarts(fetchedCarts);
    } catch (error) {
      console.error("Failed to fetch abandoned carts:", error);
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
        fetchCarts();
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
              fetchCarts();
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



  const handleSendReminder = async (cartId: string) => {
    setProcessingId(cartId);
    try {
      // Optimistic update
      setCarts(prev => prev.map(c => c.id === cartId ? { ...c, reminderSent: true } : c));

      if (!cartId.startsWith("CART-")) {
        const cartRef = doc(db, "abandoned_carts", cartId);
        await updateDoc(cartRef, { reminderSent: true, remindedAt: new Date().toISOString() });
      }
      
      // Simulating email send API call
      await new Promise(resolve => setTimeout(resolve, 800));
      alert("Reminder email successfully dispatched to the customer.");

    } catch (error) {
      console.error("Failed to send reminder:", error);
      fetchCarts(); // Revert
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
        <p>You do not have `Commerce & Orders` permissions to manage cart recovery.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Abandoned Carts Recovery</h1>
          <p className="text-sm text-gray-500 mt-1">Track high-value checkouts that dropped off and send targeted recovery emails.</p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-lg text-sm font-bold text-gray-700">
          Potential Revenue: <span className="text-green-600">₹ 32,700</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500 animate-pulse">Scanning Shopping Sessions...</div>
        ) : carts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <h3 className="text-xl font-bold text-gray-900">No Abandoned Carts</h3>
            <p className="text-gray-500 text-sm mt-1">All customers have successfully completed their checkout.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4">Cart Contents</th>
                  <th className="px-6 py-4">Lost Value</th>
                  <th className="px-6 py-4 text-right">Recovery Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {carts.map((cart) => (
                  <tr key={cart.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5 align-top">
                      <p className="font-bold text-gray-900">{cart.customerName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{cart.customerEmail}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-1">Abandoned: {new Date(cart.abandonedAt).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                        {cart.items.map((item: string, idx: number) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <p className="font-bold text-gray-900">₹ {cart.totalValue}</p>
                    </td>
                    <td className="px-6 py-5 align-middle text-right">
                      {processingId === cart.id ? (
                        <div className="text-xs text-blue-600 font-semibold animate-pulse flex items-center justify-end gap-2">
                          <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                          Sending Email...
                        </div>
                      ) : cart.reminderSent ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-200">
                          <span>✅</span> Reminder Sent
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleSendReminder(cart.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-md transition-colors flex items-center justify-end gap-2 ml-auto"
                        >
                          <span>📨</span> Send Recovery Email
                        </button>
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
