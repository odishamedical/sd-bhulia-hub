"use client";

import React, { useState } from "react";
import { 
  useProducts,
  useWeavers,
  useVendors,
  useResellers,
  useOrders,
  updateDocumentStatus
} from "@/lib/db-hooks";

export default function AdminDashboardPage() {
  const { products, loading: productsLoading } = useProducts();
  const { weavers, loading: weaversLoading } = useWeavers();
  const { vendors: stores, loading: storesLoading } = useVendors();
  const { resellers: franchises, loading: franchisesLoading } = useResellers();
  const { orders } = useOrders(); // Removed ordersLoading since it's unused

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group pending items
  const pendingWeavers = weavers.filter(w => w.status === "pending_approval" || (w.status as string) === "pending");
  const pendingStores = stores.filter(s => s.status === "pending_approval" || (s.status as string) === "pending");
  const pendingFranchises = franchises.filter(f => f.status === "pending_approval" || (f.status as string) === "pending");
  const pendingProducts = products.filter(p => p.escrowStatus === "pending_approval" || (p as any).status === "pending_approval" || (p as any).status === "pending");

  const pendingList = [
    ...pendingWeavers.map(w => ({ id: w.id, title: w.title || w.slug, type: "weavers" as const, data: w as any })),
    ...pendingStores.map(s => ({ id: s.id, title: s.title || s.slug, type: "stores" as const, data: s as any })),
    ...pendingFranchises.map(f => ({ id: f.id, title: f.name || f.slug, type: "franchises" as const, data: f as any })),
    ...pendingProducts.map(p => ({ id: p.id, title: p.title, type: "products" as const, data: p as any }))
  ];

  const totalCatalogValue = products.reduce((acc, curr) => {
    const priceStr = curr.price?.toString().replace(/[^0-9]/g, '') || "0";
    return acc + (parseInt(priceStr) || 0);
  }, 0);

  const handleInspect = (item: any) => setSelectedItem(item);

  const handleApprove = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    const { id, type, data } = selectedItem;
    let updates: any = { status: "approved" };

    if (data.pendingChanges) {
      updates = { ...updates, ...data.pendingChanges, pendingChanges: null };
    }
    if (type === "products") {
      updates.isBhuliaVerified = true;
      updates.status = "approved";
    }

    const res = await updateDocumentStatus(type, id, updates);
    if (res.success) {
      alert("Successfully verified and published to Bhulia Hub!");
      setSelectedItem(null);
    } else {
      alert("Error approving changes: " + (res.error as any)?.message);
    }
    setIsSubmitting(false);
  };

  const handleReject = async () => {
    if (!selectedItem) return;
    if (!window.confirm("Are you sure you want to reject this item?")) return;
    setIsSubmitting(true);
    const { id, type, data } = selectedItem;
    
    let updates: any = { status: "rejected" };
    if (data.pendingChanges) {
      updates = { status: "approved", pendingChanges: null };
    }
    
    const res = await updateDocumentStatus(type, id, updates);
    if (res.success) {
      alert("Application rejected.");
      setSelectedItem(null);
    } else {
      alert("Error rejecting application");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Ecosystem Overview</h1>
          <p className="text-gray-500 mt-2 font-medium">High-level metrics and global action queue for Super Admins.</p>
        </div>
      </header>

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Catalog Value</h3>
            <p className="text-3xl font-black text-gray-900">₹{totalCatalogValue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Live Products</h3>
            <p className="text-3xl font-black text-blue-600">{productsLoading ? "..." : products.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Verified Weavers</h3>
            <p className="text-3xl font-black text-blue-600">{weaversLoading ? "..." : weavers.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Retail Stores</h3>
            <p className="text-3xl font-black text-blue-600">{storesLoading ? "..." : stores.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Resellers</h3>
            <p className="text-3xl font-black text-blue-600">{franchisesLoading ? "..." : franchises.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Global Action Queue</h2>
            <div className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
              {pendingList.length} Pending Actions
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase tracking-widest text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="py-4 px-4 font-bold rounded-tl-xl">Tenant / Asset</th>
                  <th className="py-4 px-4 font-bold">Category</th>
                  <th className="py-4 px-4 font-bold">Status</th>
                  <th className="py-4 px-4 font-bold text-right rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {pendingList.map(item => (
                  <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">ID: {item.id}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-700 rounded-full text-[10px] font-bold uppercase tracking-wider">{item.type}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-orange-500 font-bold text-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                        Pending Review
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button onClick={() => handleInspect(item)} className="px-5 py-2.5 bg-gray-900 text-gray-900 rounded-xl text-xs font-bold hover:bg-black hover:shadow-lg hover:shadow-gray-900/20 transition-all">Review & Approve</button>
                    </td>
                  </tr>
                ))}
                {pendingList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-gray-500 font-medium">
                      <div className="text-4xl mb-3">✅</div>
                      All caught up! No pending items in the queue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Inspector Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Ecosystem Verification</span>
                <h3 className="text-2xl font-black text-gray-900 mt-1">Inspect: {selectedItem.title}</h3>
              </div>
              <button onClick={() => setSelectedItem(null)} className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition-colors">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
              {Object.keys(selectedItem.data).filter(key => key !== "id" && key !== "status" && key !== "pendingChanges" && key !== "layoutConfig").map(key => (
                <div key={key} className="space-y-1 bg-white p-3 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">{key}</span>
                  <span className="text-sm font-medium text-gray-900 break-words">{String(selectedItem.data[key])}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between gap-4 pt-4 border-t border-gray-100">
              <button onClick={handleReject} disabled={isSubmitting} className="px-6 py-3 border-2 border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-200 transition-all disabled:opacity-50 w-1/3">Reject</button>
              <button onClick={handleApprove} disabled={isSubmitting} className="px-8 py-3 bg-blue-600 text-gray-900 font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all disabled:opacity-50 w-2/3">Approve & Publish to Hub</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
