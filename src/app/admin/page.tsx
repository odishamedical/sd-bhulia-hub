"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  useProducts, 
  useWeavers, 
  useStores, 
  useFranchises, 
  useOrders,
  updateDocumentStatus 
} from "@/lib/db-hooks";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminDashboardPage() {
  const { products, loading: productsLoading } = useProducts();
  const { weavers, loading: weaversLoading } = useWeavers();
  const { stores, loading: storesLoading } = useStores();
  const { franchises, loading: franchisesLoading } = useFranchises();
  const { orders, loading: ordersLoading } = useOrders();

  const [activeTab, setActiveTab] = useState("overview");

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
    const priceStr = curr.price?.toString().replace(/[^0-9]/g, '') || "0";
    return acc + (parseInt(priceStr) || 0);
  }, 0);

  // Group pending verification items
  const pendingWeavers = weavers.filter(w => w.status === "pending_approval" || (w.status as string) === "pending");
  const pendingStores = stores.filter(s => s.status === "pending_approval" || (s.status as string) === "pending");
  const pendingFranchises = franchises.filter(f => f.status === "pending_approval" || (f.status as string) === "pending");
  
  // Notice: The form in Step 2 used `status: "pending"` for products
  const pendingProducts = products.filter(p => p.escrowStatus === "pending_approval" || (p as any).status === "pending_approval" || (p as any).status === "pending");

  const pendingList = [
    ...pendingWeavers.map(w => ({ id: w.id, title: w.title || w.slug, type: "weavers" as const, data: w as any })),
    ...pendingStores.map(s => ({ id: s.id, title: s.title || s.slug, type: "stores" as const, data: s as any })),
    ...pendingFranchises.map(f => ({ id: f.id, title: f.name || f.slug, type: "franchises" as const, data: f as any })),
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
    if (type === "products") {
      updates.isBhuliaVerified = true;
      updates.status = "approved"; // Clear out 'pending'
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
    if (!confirm("Are you sure you want to reject this item?")) return;
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
      // Reject new application
      updates = { status: "rejected" };
      const res = await updateDocumentStatus(type, id, updates);
      if (res.success) {
        alert("Application rejected.");
        setSelectedItem(null);
      } else {
        alert("Error rejecting application");
      }
    }
    setIsSubmitting(false);
  };

  const updateOrderStatus = async (orderId: string, statusKey: string, newValue: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        [statusKey]: newValue
      });
      alert(`Order ${statusKey} updated to ${newValue}`);
    } catch (e) {
      console.error(e);
      alert("Failed to update order status.");
    }
  };

  const NavTab = ({ id, label }: { id: string, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`px-4 py-3 font-bold text-xs uppercase tracking-wider transition-colors ${activeTab === id ? "bg-[#C5A059] text-[#0A1021] rounded-lg" : "text-gray-400 hover:text-[#C5A059]"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#C5A059]/30 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059]">Super Admin Hub</h1>
          <p className="text-gray-300 text-xs mt-1">Manage KYC, Products, Logistics, and Escrow Finances.</p>
        </div>
        <div className="flex space-x-2 bg-[#0A3A35] p-1 rounded-xl">
          <NavTab id="overview" label="Overview" />
          <NavTab id="kyc" label="KYC (Users)" />
          <NavTab id="products" label="Products" />
          <NavTab id="logistics" label="Logistics" />
          <NavTab id="finance" label="Finance" />
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in">
          {/* Stats Counter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-[#0A3A35]/50 border border-[#C5A059]/30 rounded-2xl p-5 shadow-lg">
              <h3 className="text-gray-300 text-xs font-bold uppercase tracking-widest mb-1">Total Catalog Value</h3>
              <p className="text-2xl font-serif font-bold text-[#C5A059]">₹{totalCatalogValue.toLocaleString()}</p>
            </div>
            <div className="bg-[#0A3A35]/50 border border-[#C5A059]/30 rounded-2xl p-5 shadow-lg">
              <h3 className="text-gray-300 text-xs font-bold uppercase tracking-widest mb-1">Live Products</h3>
              <p className="text-3xl font-serif font-bold text-white">{productsLoading ? "..." : products.length}</p>
            </div>
            <div className="bg-[#0A3A35]/50 border border-[#C5A059]/30 rounded-2xl p-5 shadow-lg">
              <h3 className="text-gray-300 text-xs font-bold uppercase tracking-widest mb-1">Verified Weavers</h3>
              <p className="text-3xl font-serif font-bold text-white">{weaversLoading ? "..." : weavers.length}</p>
            </div>
            <div className="bg-[#0A3A35]/50 border border-[#C5A059]/30 rounded-2xl p-5 shadow-lg">
              <h3 className="text-gray-300 text-xs font-bold uppercase tracking-widest mb-1">Retail Stores</h3>
              <p className="text-3xl font-serif font-bold text-white">{storesLoading ? "..." : stores.length}</p>
            </div>
            <div className="bg-[#0A3A35]/50 border border-[#C5A059]/30 rounded-2xl p-5 shadow-lg">
              <h3 className="text-gray-300 text-xs font-bold uppercase tracking-widest mb-1">Reseller Franchises</h3>
              <p className="text-3xl font-serif font-bold text-white">{franchisesLoading ? "..." : franchises.length}</p>
            </div>
          </div>

          {/* Pending Overview Queue */}
          <div className="bg-[#0B2B26]/80 border border-[#C5A059]/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#C5A059]">Global Action Queue</h2>
              <p className="text-xs text-gray-300 mt-0.5">Everything that requires your immediate attention.</p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#C5A059]/20">
              <table className="w-full text-left text-sm text-gray-200">
                <thead className="text-xs uppercase bg-[#0A3A35] text-[#C5A059] font-bold tracking-widest border-b border-[#C5A059]/30">
                  <tr>
                    <th className="px-6 py-4">Tenant/Asset</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
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
                      <td className="px-6 py-4 text-yellow-400 text-xs font-bold">Pending Review</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleInspect(item)}
                          className="bg-[#C5A059] text-[#0A1021] hover:brightness-110 font-bold px-4 py-2 rounded-lg text-[10px] uppercase tracking-wider transition-all"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pendingList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-xs">
                        No pending items in the queue.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "kyc" && (
        <div className="bg-[#0B2B26]/80 border border-[#C5A059]/30 rounded-3xl p-6 shadow-xl space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#C5A059]">User KYC & Verification</h2>
            <p className="text-xs text-gray-300 mt-0.5">Approve Weavers, Vendors, and Resellers identities.</p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-[#C5A059]/20">
            <table className="w-full text-left text-sm text-gray-200">
              <thead className="text-xs uppercase bg-[#0A3A35] text-[#C5A059] font-bold tracking-widest border-b border-[#C5A059]/30">
                <tr>
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-right">KYC Status</th>
                </tr>
              </thead>
              <tbody>
                {[...pendingWeavers, ...pendingStores, ...pendingFranchises].map((user: any) => (
                  <tr key={user.id} className="border-b border-[#C5A059]/10">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{user.title || user.name || user.slug}</div>
                      <div className="text-[10px] text-gray-400">{user.id}</div>
                    </td>
                    <td className="px-6 py-4 uppercase text-xs text-gray-300">{user.status ? "Platform User" : "Unknown"}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleInspect({ id: user.id, title: user.title || user.name || user.slug, type: user.name ? "franchises" : user.title ? "stores" : "weavers", data: user })} className="px-4 py-1.5 bg-yellow-600/20 text-yellow-400 border border-yellow-500/30 rounded text-xs">
                        Review KYC
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div className="bg-[#0B2B26]/80 border border-[#C5A059]/30 rounded-3xl p-6 shadow-xl space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#C5A059]">Product Approvals (GI-Tag Validation)</h2>
            <p className="text-xs text-gray-300 mt-0.5">Audit new handloom listings before they appear on storefronts.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingProducts.map(p => (
              <div key={p.id} className="bg-[#051815] border border-[#C5A059]/20 rounded-xl p-4">
                <div className="font-bold text-white text-sm mb-1">{p.title}</div>
                <div className="text-xs text-[#C5A059] mb-4">Price: {p.price}</div>
                <button 
                  onClick={() => handleInspect({ id: p.id, title: p.title, type: "products", data: p })}
                  className="w-full py-2 bg-[#0A3A35] border border-[#C5A059] text-white rounded text-[10px] uppercase tracking-wider hover:bg-[#C5A059] hover:text-[#0A1021] transition-colors"
                >
                  Verify Handloom Authenticity
                </button>
              </div>
            ))}
            {pendingProducts.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500 text-sm">No products pending review.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === "logistics" && (
        <div className="bg-[#0B2B26]/80 border border-[#C5A059]/30 rounded-3xl p-6 shadow-xl space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#C5A059]">Logistics & Order Fulfillment</h2>
            <p className="text-xs text-gray-300 mt-0.5">Manage dispatch routes, Shiprocket AWBs, and delivery statuses.</p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-[#C5A059]/20">
            <table className="w-full text-left text-sm text-gray-200">
              <thead className="text-xs uppercase bg-[#0A3A35] text-[#C5A059] font-bold tracking-widest border-b border-[#C5A059]/30">
                <tr>
                  <th className="px-6 py-4">Order Details</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Logistics Status</th>
                  <th className="px-6 py-4 text-right">Update</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b border-[#C5A059]/10">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{order.productName || "Proxy Order"}</div>
                      <div className="text-[10px] text-gray-400">ID: {order.orderId || order.id}</div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div>{order.customerName}</div>
                      <div className="text-gray-400">{order.customerAddress}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.logisticsStatus || (order as any).status || "Pending QC"} 
                        onChange={(e) => updateOrderStatus(order.id, "logisticsStatus", e.target.value)}
                        className="bg-[#051815] border border-[#C5A059]/40 rounded px-2 py-1 text-xs text-white"
                      >
                        <option value="placed">Placed (Pending QC)</option>
                        <option value="QC Passed">QC Passed</option>
                        <option value="Pending Weaver Handover">Pending Weaver Handover</option>
                        <option value="Dispatched via Hub">Dispatched via Hub</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => alert(`Shiprocket AWB creation for ${order.id} will pop up here.`)} className="text-[10px] text-blue-400 hover:underline">Generate AWB</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "finance" && (
        <div className="bg-[#0B2B26]/80 border border-[#C5A059]/30 rounded-3xl p-6 shadow-xl space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#C5A059]">Escrow & Reseller Finance</h2>
            <p className="text-xs text-gray-300 mt-0.5">Manage Weaver payouts and Reseller commissions.</p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-[#C5A059]/20">
            <table className="w-full text-left text-sm text-gray-200">
              <thead className="text-xs uppercase bg-[#0A3A35] text-[#C5A059] font-bold tracking-widest border-b border-[#C5A059]/30">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Amount / Method</th>
                  <th className="px-6 py-4">Payment Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b border-[#C5A059]/10">
                    <td className="px-6 py-4 font-mono text-[10px]">{order.orderId || order.id}</td>
                    <td className="px-6 py-4 text-xs">
                      <div className="font-bold text-[#C5A059]">{order.productPrice || "TBD"}</div>
                      <div className="text-gray-400 uppercase">{order.paymentMode || "Online"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.paymentStatus || (order as any).status || "Escrow Locked"} 
                        onChange={(e) => updateOrderStatus(order.id, "paymentStatus", e.target.value)}
                        className="bg-[#051815] border border-[#C5A059]/40 rounded px-2 py-1 text-xs text-white"
                      >
                        <option value="Escrow Locked">Escrow Locked</option>
                        <option value="placed">Placed (Cash)</option>
                        <option value="Payout Pending (Weaver)">Payout Pending (Weaver)</option>
                        <option value="Settled">Fully Settled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => alert("Initiating Weaver Razorpay Route...")} className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-800 rounded text-[10px] uppercase">
                        Release Escrow
                      </button>
                      {(order.referralId || order.proxyBuyerId || (order as any).resellerId) && (
                        <button onClick={() => alert("Initiating Reseller Commission Payout...")} className="px-3 py-1 bg-blue-900/30 text-blue-400 border border-blue-800 rounded text-[10px] uppercase">
                          Pay Comm.
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
