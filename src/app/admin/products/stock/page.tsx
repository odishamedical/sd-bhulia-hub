"use client";

import { Product } from "@/types";

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function LowStockDashboard() {
  const [stockAlerts, setStockAlerts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  async function fetchStockAlerts() {
    setIsLoading(true);
    try {
      // In production we would query where stockCount < 3 or similar
      const q = query(collection(db, "products"), where("inStock", "==", false));
      const snapshot = await getDocs(q);
      
      const alerts: any[] = [];
      snapshot.forEach((docSnap) => {
        alerts.push({ id: docSnap.id, ...docSnap.data() });
      });

      if (alerts.length === 0 && process.env.NODE_ENV === "development") {
        alerts.push({
          id: "SAR-101",
          title: "Royal Pasapalli Mercerized Cotton Ikat Saree",
          weaverName: "Bargarh Co-op",
          stock: 0,
          lastSold: "2026-06-03",
        });
        alerts.push({
          id: "SAR-N103",
          title: "Traditional Machha Motif Single Ikat",
          weaverName: "Meher Family Weaves",
          stock: 1,
          lastSold: "2026-06-04",
        });
      }

      setStockAlerts(alerts);
    } catch (error) {
      console.error("Failed to fetch stock alerts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Strict Protocol: Verify Access on Mount
  useEffect(() => {
    const verifyAccessAndFetch = async () => {
      const email = localStorage.getItem("sd_current_user_email");
      const role = localStorage.getItem("sd_current_user_role");

      if (role === "super_admin") {
        setHasPermission(true);
        fetchStockAlerts();
        return;
      }

      if (role === "admin" && email) {
        try {
          const q = query(collection(db, "users"), where("email", "==", email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const adminData = snap.docs[0].data();
            if (adminData.permissions?.products === true) {
              setHasPermission(true);
              fetchStockAlerts();
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



  if (hasPermission === null) {
    return <div className="py-20 text-blue-600 font-bold uppercase tracking-widest text-xs text-center animate-pulse">Verifying Security Clearance...</div>;
  }

  if (hasPermission === false) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl shadow-sm">
        <h3 className="font-bold text-lg mb-2">Access Denied</h3>
        <p>You do not have `Global Catalog` permissions to view inventory levels.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Low Stock Alerts</h1>
          <p className="text-sm text-gray-500 mt-1">Track fast-moving inventory and coordinate with weavers to restock.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500 animate-pulse">Checking global inventory...</div>
        ) : stockAlerts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900">Inventory is Healthy</h3>
            <p className="text-gray-500 text-sm mt-1">All active products have sufficient stock.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-red-50 border-b border-red-100 text-red-800 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">Weaver Source</th>
                  <th className="px-6 py-3 text-center">Stock Level</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stockAlerts.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{item.title}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {item.id}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">{item.weaverName}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${item.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {item.stock === 0 ? 'Out of Stock' : `${item.stock} Left`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => alert("WhatsApp API integration required to contact weaver directly.")} className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-xs font-bold transition-colors">
                        Ping Weaver
                      </button>
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
