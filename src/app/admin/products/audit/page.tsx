"use client";

import { Product } from "@/types";

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";

export default function GiTagAuditQueue() {
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function fetchPendingProducts() {
    setIsLoading(true);
    try {
      const q = query(collection(db, "products"), where("status", "==", "pending_verification"));
      const snapshot = await getDocs(q);
      
      const products: any[] = [];
      snapshot.forEach((docSnap) => {
        products.push({ id: docSnap.id, ...docSnap.data() });
      });

      // If no real data yet, we can mock one for the demo UI
      if (products.length === 0 && process.env.NODE_ENV === "development") {
        products.push({
          id: "SAR-PEND-001",
          title: "Nuapatna Ikat Cotton Saree",
          category: "Cotton Classics",
          weaverName: "Lokanath Meher",
          price: "4500",
          weave: "Single Ikat Cotton",
          cluster: "Nuapatna Cluster",
          threadType: "80 Count Handspun",
          img: "/bhulia-hero.png"
        });
      }

      setPendingProducts(products);
    } catch (error) {
      console.error("Failed to fetch pending products:", error);
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
        fetchPendingProducts();
        return;
      }

      if (role === "admin" && email) {
        try {
          const q = query(collection(db, "users"), where("email", "==", email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const adminData = snap.docs[0].data();
            // Checking the granular "products" permission
            if (adminData.permissions?.products === true) {
              setHasPermission(true);
              fetchPendingProducts();
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



  const handleAction = async (productId: string, action: "approve" | "reject") => {
    setProcessingId(productId);
    try {
      // Optimistic update
      setPendingProducts(prev => prev.filter(p => p.id !== productId));

      // Actual Firestore call (ignored for dummy entries without a real doc)
      if (!productId.startsWith("SAR-PEND")) {
        const productRef = doc(db, "products", productId);
        const updates = action === "approve" 
          ? { status: "live", isBhuliaVerified: true, isGI: true, verifiedAt: new Date().toISOString() }
          : { status: "rejected", rejectedAt: new Date().toISOString() };
        
        await updateDoc(productRef, updates);
      }
      
    } catch (error) {
      console.error(`Failed to ${action} product:`, error);
      alert(`Action failed. Ensure you have the required Firestore permissions.`);
      fetchPendingProducts(); // Revert
    } finally {
      setProcessingId(null);
    }
  };

  if (hasPermission === null) {
    return (
      <div className="flex justify-center py-20 text-blue-600 font-bold uppercase tracking-widest text-xs animate-pulse">
        Verifying Security Clearance...
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><span className="text-2xl">🛑</span> Access Denied</h3>
        <p>You do not have the required `Global Catalog` permissions to audit Bhulia.com claims.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Bhulia.com Audit Queue
            <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-amber-200">Quality Control</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Verify technical specifications before pushing sarees to the live public catalog.</p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-lg text-sm font-bold text-gray-700">
          Pending Audits: <span className="text-red-600">{pendingProducts.length}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="bg-transparent">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-500 animate-pulse">Loading Audit Queue...</div>
        ) : pendingProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-gray-900">Zero Pending Audits</h3>
            <p className="text-gray-500 text-sm mt-1">All uploaded sarees have been audited and pushed live.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {pendingProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col sm:flex-row transition-shadow hover:shadow-md">
                
                {/* Image Section */}
                <div className="w-full sm:w-48 h-48 sm:h-auto bg-gray-100 relative shrink-0">
                  {/* For demo purposes, we fall back to a dummy div if image is missing */}
                  <div className="absolute inset-0 flex items-center justify-center text-4xl bg-gray-200">
                    📸
                  </div>
                  {/* Simulated GI Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[9px] font-bold text-gray-800 shadow-sm uppercase tracking-wider flex items-center gap-1 border border-white/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Unverified
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900 leading-tight">{product.title || "Untitled Saree"}</h3>
                      <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 shrink-0 ml-2">₹ {product.price}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 font-mono">ID: {product.id}</p>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Weaver</p>
                        <p className="text-xs font-semibold text-gray-800">{(product as any).weaverName || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Cluster</p>
                        <p className="text-xs font-semibold text-gray-800">{(product as any).cluster || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Weave Type</p>
                        <p className="text-xs font-semibold text-gray-800">{(product as any).weave || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Thread</p>
                        <p className="text-xs font-semibold text-gray-800">{(product as any).threadType || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    {processingId === product.id ? (
                      <div className="text-xs font-bold text-blue-600 animate-pulse flex items-center gap-2">
                        <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                        Syncing to Live Catalog...
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleAction(product.id, "reject")}
                          className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline transition-colors px-2 py-1"
                        >
                          Reject Listing
                        </button>
                        <button 
                          onClick={() => handleAction(product.id, "approve")}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-[0_2px_10px_rgba(37,99,235,0.2)] transition-all flex items-center gap-1.5"
                        >
                          <span>✔️</span> Verify & Push Live
                        </button>
                      </>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
