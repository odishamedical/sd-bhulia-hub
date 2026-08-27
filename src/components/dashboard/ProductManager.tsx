"use client";

import { useState } from "react";
import Image from "next/image";
import ProFeatureLock from "@/components/ui/ProFeatureLock";
import UnifiedProductUpload from "./UnifiedProductUpload";
import { getEffectiveUserId } from "@/lib/impersonation";
import { auth } from "@/lib/firebase";

export default function ProductManager({
  subscriptionTier,
  setIsUpgraderOpen,
  sellerProductsRaw,
  sellerRole,
  isAutoApprovedUser,
  storeName,
}: any) {
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleAddNewClick = () => {
    setEditingProduct(null);
    setIsAddInventoryOpen(true);
  };

  const handleEditClick = (product: any) => {
    setEditingProduct(product);
    setIsAddInventoryOpen(true);
  };

  const sellerProducts = sellerProductsRaw.filter((p: any) => {
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter || ((p.status === "pending" || !p.status) && statusFilter === "pending_approval");
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-5xl animate-in fade-in">
      {subscriptionTier === "free" ? (
         <ProFeatureLock 
           message="You must upgrade to the Pro Tier to manage inventory, catalog products, and receive bulk orders."
           onUpgrade={() => setIsUpgraderOpen(true)}
         />
      ) : (
        <></>
      )}
      {subscriptionTier !== "free" && !isAddInventoryOpen ? (
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Products Catalog</h2>
              <p className="text-sm text-gray-500 mt-1">Manage and track your inventory.</p>
            </div>
            <button onClick={handleAddNewClick} className="bg-[#1f2937] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-colors shadow-sm w-full md:w-auto">
              + Add Item
            </button>
          </div>

          {sellerProductsRaw.length > 0 && (
            <div className="flex flex-col md:flex-row gap-4 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search products by name..." 
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className="py-2 px-4 rounded-xl border border-gray-200 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none text-sm bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="approved">Live (Approved)</option>
                <option value="pending_approval">Pending QC</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}

          {sellerProductsRaw.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
              <div className="text-4xl mb-4">🛍️</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Products Yet</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">You haven't added any products to your catalog. Add your first item to start selling.</p>
              <button onClick={handleAddNewClick} className="bg-[#0070F3] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#005BB5] transition-colors shadow-sm">
                Upload First Item
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto rounded-xl border border-gray-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                    <th className="pb-4 font-bold">Product</th>
                    <th className="pb-4 font-bold">Price</th>
                    <th className="pb-4 font-bold">Category</th>
                    <th className="pb-4 font-bold">Status</th>
                    <th className="pb-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sellerProducts.map((product: any) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 relative">
                            <Image 
                              src={product.img || "/bhulia-hero.png"} 
                              alt={product.title} 
                              fill
                              sizes="48px"
                              className="object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).srcset = "";
                                (e.target as HTMLImageElement).src = "/bhulia-hero.png";
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{product.title}</div>
                            {product.weaverName && (
                              <div className="text-xs text-gray-500">Weaver: {product.weaverName}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 font-bold text-gray-900">₹{Number(product.price).toLocaleString()}</td>
                      <td className="py-4 font-medium text-gray-500">{product.category || "Uncategorized"}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          product.status === "approved" ? "bg-green-50 text-green-700 border-green-200" :
                          product.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                          "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}>
                          {String(product.status || 'pending').replace('_approval', '').charAt(0).toUpperCase() + String(product.status || 'pending').replace('_approval', '').slice(1)}
                        </span>
                        {product.status === "rejected" && product.rejectionReason && (
                          <div className="mt-1 text-[10px] text-red-600 font-medium bg-red-50 p-1 rounded">
                            Reason: {product.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td className="py-4 text-right whitespace-nowrap">
                        <a href={"/product/" + product.slug} target="_blank" className="inline-block bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors mr-2">
                          View Live ↗
                        </a>
                        <button onClick={() => handleEditClick(product)} className="inline-block bg-blue-50 text-[#0070F3] border border-blue-100 hover:bg-blue-100 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setIsAddInventoryOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
              ← Back to Catalog
            </button>
            <h2 className="text-2xl font-bold text-gray-900">{editingProduct ? "Edit Inventory" : "Upload New Inventory"}</h2>
          </div>
          <UnifiedProductUpload 
            isOpen={isAddInventoryOpen}
            onClose={() => setIsAddInventoryOpen(false)}
            sellerRole={sellerRole}
            sellerId={getEffectiveUserId(auth.currentUser?.uid) || ""}
            isAutoApprovedUser={isAutoApprovedUser}
            storeName={storeName}
            existingProduct={editingProduct}
          />
        </div>
      )}
    </div>
  );
}
