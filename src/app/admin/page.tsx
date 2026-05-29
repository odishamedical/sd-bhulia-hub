"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  useProducts, 
  useWeavers, 
  useStores, 
  useFranchises, 
  updateDocumentStatus 
} from "@/lib/db-hooks";

export default function AdminDashboardPage() {
  const { products, loading: productsLoading } = useProducts();
  const { weavers, loading: weaversLoading } = useWeavers();
  const { stores, loading: storesLoading } = useStores();
  const { franchises, loading: franchisesLoading } = useFranchises();

  // Selected item for inspection modal
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    title: string;
    type: "weavers" | "stores" | "franchises" | "products";
    data: any;
  } | null>(null);

  // Layout Configuration States in Modal
  const [sidebarPosition, setSidebarPosition] = useState<"Left" | "Right" | "Hidden">("Left");
  const [heroEnabled, setHeroEnabled] = useState<boolean>(true);
  const [gridStyle, setGridStyle] = useState<"2-Column" | "3-Column">("3-Column");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Calculate live statistics
  const totalCatalogValue = products.reduce((acc, curr) => {
    const priceStr = curr.price.replace(/[^0-9]/g, '');
    return acc + (parseInt(priceStr) || 0);
  }, 0);

  // Group pending verification items
  const pendingWeavers = weavers.filter(w => w.status === "pending_approval");
  const pendingStores = stores.filter(s => s.status === "pending_approval");
  const pendingFranchises = franchises.filter(f => f.status === "pending_approval");
  const pendingProducts = products.filter(p => p.escrowStatus === "pending_approval" || (p as any).status === "pending_approval");

  const pendingList = [
    ...pendingWeavers.map(w => ({ id: w.id, title: w.title, type: "weavers" as const, data: w as any })),
    ...pendingStores.map(s => ({ id: s.id, title: s.title, type: "stores" as const, data: s as any })),
    ...pendingFranchises.map(f => ({ id: f.id, title: f.name, type: "franchises" as const, data: f as any })),
    ...pendingProducts.map(p => ({ id: p.id, title: p.title, type: "products" as const, data: p as any }))
  ];

  const handleInspect = (item: { id: string; title: string; type: "weavers" | "stores" | "franchises" | "products"; data: any }) => {
    setSelectedItem(item);
    
    // Seed layout states if applicable
    if (item.type === "weavers" && item.data.layoutConfig) {
      setSidebarPosition(item.data.layoutConfig.sidebarPosition || "Left");
      setHeroEnabled(item.data.layoutConfig.heroEnabled ?? true);
      setGridStyle(item.data.layoutConfig.gridStyle || "3-Column");
    } else {
      setSidebarPosition("Left");
      setHeroEnabled(true);
      setGridStyle("3-Column");
    }
  };

  const formatValue = (val: any) => {
    if (val === undefined || val === null) return "None";
    if (typeof val === "boolean") return val ? "Yes" : "No";
    return String(val);
  };

  const handleApprove = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);

    const { id, type, data } = selectedItem;
    let updates: any = { status: "approved" };

    // Apply layout configuration to weavers
    if (type === "weavers") {
      updates.layoutConfig = {
        sidebarPosition,
        heroEnabled,
        gridStyle
      };
    }

    // Merge pending changes if revision
    if (data.pendingChanges) {
      updates = {
        ...updates,
        ...data.pendingChanges,
        pendingChanges: null // clear changelog
      };
    }

    // Handloom products badge setting upon approval
    if (type === "products" && data.isBhuliaVerified === undefined) {
      updates.isBhuliaVerified = true;
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
    if (!confirm("Are you sure you want to reject and clear these pending changes?")) return;
    setIsSubmitting(true);

    const { id, type, data } = selectedItem;
    let updates: any = {};

    if (data.pendingChanges) {
      // Revert status to approved (keep old data) and clear changes
      updates = {
        status: "approved",
        pendingChanges: null
      };
      const res = await updateDocumentStatus(type, id, updates);
      if (res.success) {
        alert("Pending modifications rejected. Reverted to previous state.");
        setSelectedItem(null);
      } else {
        alert("Error resetting status");
      }
    } else {
      // It's a new registration, rejecting deletes/keeps as pending
      alert("New application rejected. It will remain in queue as pending or can be deleted from registry pages.");
      setSelectedItem(null);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059]">Ecosystem Overview</h1>
        <p className="text-gray-300 text-xs mt-1">Real-time statistics & verification queue from Firestore.</p>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Products Stat */}
        <div className="bg-[#0A3A35]/50 border border-[#C5A059]/30 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#C5A059]/20 rounded-lg text-xl">🛍️</div>
            <Link href="/admin/products" className="text-[10px] text-[#C5A059] font-bold uppercase tracking-wider hover:underline">Manage</Link>
          </div>
          <h3 className="text-gray-300 text-xs font-bold uppercase tracking-widest mb-1">Live Products</h3>
          <p className="text-3xl font-serif font-bold text-white">
            {productsLoading ? <span className="animate-pulse">...</span> : products.length}
          </p>
        </div>

        {/* Weavers Stat */}
        <div className="bg-[#0A3A35]/50 border border-[#C5A059]/30 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#C5A059]/20 rounded-lg text-xl">🧵</div>
            <Link href="/admin/weavers" className="text-[10px] text-[#C5A059] font-bold uppercase tracking-wider hover:underline">Manage</Link>
          </div>
          <h3 className="text-gray-300 text-xs font-bold uppercase tracking-widest mb-1">Verified Weavers</h3>
          <p className="text-3xl font-serif font-bold text-white">
            {weaversLoading ? <span className="animate-pulse">...</span> : weavers.length}
          </p>
        </div>

        {/* Retail Stores Stat */}
        <div className="bg-[#0A3A35]/50 border border-[#C5A059]/30 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#C5A059]/20 rounded-lg text-xl">🏛️</div>
            <Link href="/admin/stores" className="text-[10px] text-[#C5A059] font-bold uppercase tracking-wider hover:underline">Manage</Link>
          </div>
          <h3 className="text-gray-300 text-xs font-bold uppercase tracking-widest mb-1">Retail Stores</h3>
          <p className="text-3xl font-serif font-bold text-white">
            {storesLoading ? <span className="animate-pulse">...</span> : stores.length}
          </p>
        </div>

        {/* Franchises Stat */}
        <div className="bg-[#0A3A35]/50 border border-[#C5A059]/30 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#C5A059]/20 rounded-lg text-xl">🏪</div>
            <Link href="/admin/franchises" className="text-[10px] text-[#C5A059] font-bold uppercase tracking-wider hover:underline">Manage</Link>
          </div>
          <h3 className="text-gray-300 text-xs font-bold uppercase tracking-widest mb-1">Active Franchises</h3>
          <p className="text-3xl font-serif font-bold text-white">
            {franchisesLoading ? <span className="animate-pulse">...</span> : franchises.length}
          </p>
        </div>
      </div>

      {/* Pending Approvals & Revisions Queue */}
      <div className="bg-[#0B2B26]/80 border border-[#C5A059]/30 rounded-3xl p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-[#C5A059]">Moderation & Revision Queue</h2>
          <p className="text-xs text-gray-300 mt-0.5">Approve new onboardings and audit modified profiles/products before publishing.</p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#C5A059]/20">
          <table className="w-full text-left text-sm text-gray-200">
            <thead className="text-xs uppercase bg-[#0A3A35] text-[#C5A059] font-bold tracking-widest border-b border-[#C5A059]/30">
              <tr>
                <th className="px-6 py-4">Tenant/Asset</th>
                <th className="px-6 py-4">Category Type</th>
                <th className="px-6 py-4">Change Type</th>
                <th className="px-6 py-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody>
              {pendingList.map((item) => (
                <tr key={item.id} className="border-b border-[#C5A059]/10 hover:bg-[#0A3A35]/40 transition-colors">
                  <td className="px-6 py-4 font-medium">
                    <span className="text-white font-serif">{item.title}</span>
                    <span className="text-[10px] text-gray-400 font-mono block mt-0.5">ID: {item.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-[#0A3A35] border border-[#C5A059]/30 text-[#C5A059]">
                      {item.type.replace("s", "")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {item.data.pendingChanges ? (
                      <span className="text-yellow-400 text-xs font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                        Modified Revision (Diff)
                      </span>
                    ) : (
                      <span className="text-green-400 text-xs font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                        New Registration
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleInspect(item)}
                      className="bg-[#C5A059] text-[#0A1021] hover:brightness-110 font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition-all"
                    >
                      Inspect & Audit
                    </button>
                  </td>
                </tr>
              ))}
              {pendingList.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-mono text-xs">
                    🎉 Excellent! No pending applications or edits require verification.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-Side Audit Inspector Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0B2B26] border-2 border-[#C5A059]/50 rounded-3xl p-6 sm:p-8 w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-[0_0_60px_rgba(197,160,89,0.3)] space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-[#C5A059]/20 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059]">Ecosystem Verification Auditor</span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                  Inspect: {selectedItem.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-white text-xl p-1 bg-[#0A3A35] border border-[#C5A059]/30 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Side-by-Side Difference or Properties Table */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-widest text-[#C5A059] font-bold">
                {selectedItem.data.pendingChanges ? "Audit Diff: Modified Fields" : "Submitted Registration Parameters"}
              </h4>

              {selectedItem.data.pendingChanges ? (
                // Side-by-Side Diff Comparison View
                <div className="overflow-hidden border border-[#C5A059]/20 rounded-xl">
                  <table className="w-full text-left text-xs sm:text-sm text-gray-200">
                    <thead className="bg-[#0A3A35] text-[#C5A059] font-bold uppercase tracking-wider text-[10px] border-b border-[#C5A059]/20">
                      <tr>
                        <th className="px-4 py-3">Property</th>
                        <th className="px-4 py-3 bg-red-950/20 text-red-400">Old Value</th>
                        <th className="px-4 py-3 bg-green-950/20 text-green-400">New Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(selectedItem.data.pendingChanges).map((field) => (
                        <tr key={field} className="border-b border-[#C5A059]/10">
                          <td className="px-4 py-3 font-mono text-[11px] text-[#C5A059] font-bold">{field}</td>
                          <td className="px-4 py-3 bg-red-950/10 text-gray-300 font-sans">{formatValue(selectedItem.data[field])}</td>
                          <td className="px-4 py-3 bg-green-950/10 text-white font-sans font-bold">{formatValue(selectedItem.data.pendingChanges[field])}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                // Static Properties List for New Onboardings
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0A3A35]/30 p-5 rounded-2xl border border-[#C5A059]/20">
                  {Object.keys(selectedItem.data)
                    .filter((key) => key !== "id" && key !== "status" && key !== "pendingChanges" && key !== "layoutConfig")
                    .map((key) => (
                      <div key={key} className="space-y-1">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">{key}</span>
                        <span className="text-xs text-white font-medium">{formatValue(selectedItem.data[key])}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Layout Options Override Panel (For Weavers / Stores) */}
            {(selectedItem.type === "weavers" || selectedItem.type === "stores") && (
              <div className="bg-[#0A3A35]/40 border border-[#C5A059]/30 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs uppercase tracking-widest text-[#C5A059] font-bold flex items-center gap-1.5">
                  <span>🎨</span> Storefront Layout overrides configuration
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Hero Banner Override */}
                  <div>
                    <label className="text-[10px] uppercase text-gray-300 tracking-wider block mb-1">Hero Banner Header</label>
                    <select 
                      value={heroEnabled ? "enabled" : "disabled"}
                      onChange={(e) => setHeroEnabled(e.target.value === "enabled")}
                      className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value="enabled">Enabled Banner</option>
                      <option value="disabled">Disabled Banner</option>
                    </select>
                  </div>

                  {/* Sidebar position */}
                  <div>
                    <label className="text-[10px] uppercase text-gray-300 tracking-wider block mb-1">Sidebar Bio Position</label>
                    <select 
                      value={sidebarPosition}
                      onChange={(e) => setSidebarPosition(e.target.value as any)}
                      className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value="Left">Left Aligned Sidebar</option>
                      <option value="Right">Right Aligned Sidebar</option>
                      <option value="Hidden">Hidden Sidebar (Full Width)</option>
                    </select>
                  </div>

                  {/* Grid Column Style */}
                  <div>
                    <label className="text-[10px] uppercase text-gray-300 tracking-wider block mb-1">Catalog Grid Columns</label>
                    <select 
                      value={gridStyle}
                      onChange={(e) => setGridStyle(e.target.value as any)}
                      className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value="3-Column">3-Column Grid</option>
                      <option value="2-Column">2-Column Grid</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Actions Footer */}
            <div className="pt-4 border-t border-[#C5A059]/20 flex justify-between gap-4">
              <button 
                onClick={handleReject}
                disabled={isSubmitting}
                className="px-5 py-3 border border-red-500/50 hover:bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50"
              >
                Reject modifications
              </button>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="px-5 py-3 text-gray-300 hover:text-white text-xs font-bold uppercase tracking-wider"
                >
                  Close
                </button>
                <button 
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] hover:brightness-110 shadow-lg text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : "Approve & Publish Live"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
