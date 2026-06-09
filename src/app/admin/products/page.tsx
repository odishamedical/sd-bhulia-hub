"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useProducts, deleteProduct, updateDocumentStatus } from "@/lib/db-hooks";

export default function AdminProductsPage() {
  const { products, loading } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending_approval");
  const [sellerFilter, setSellerFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const [rejectingProduct, setRejectingProduct] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.vendorName && p.vendorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          p.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const productStatus = p.status || "pending";
    let matchesStatus = true;
    if (statusFilter === "in_stock") matchesStatus = p.inStock;
    else if (statusFilter === "out_of_stock") matchesStatus = !p.inStock;
    else if (statusFilter !== "all") matchesStatus = productStatus === statusFilter;

    const matchesSeller = sellerFilter === "all" || p.sellerType === sellerFilter;

    // Simplified date matching
    let matchesDate = true;
    if (dateFilter !== "all" && p.createdAt) {
      const createdDate = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
      const now = new Date();
      if (dateFilter === "today") {
        matchesDate = createdDate.toDateString() === now.toDateString();
      } else if (dateFilter === "this_month") {
        matchesDate = createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === "last_month") {
        const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
        matchesDate = createdDate.getMonth() === lastMonth.getMonth() && createdDate.getFullYear() === lastMonth.getFullYear();
      }
    }

    return matchesSearch && matchesStatus && matchesSeller && matchesDate;
  });

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      await deleteProduct(id);
    }
  };

  const handleApprove = async (id: string) => {
    if (confirm(`Approve this product and push it live?`)) {
      await updateDocumentStatus("products", id, { status: "approved", rejectionReason: "" });
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingProduct) return;
    await updateDocumentStatus("products", rejectingProduct.id, { 
      status: "rejected", 
      rejectionReason: rejectionReason 
    });
    setRejectingProduct(null);
    setRejectionReason("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">Products Directory</h1>
          <p className="text-gray-300 text-xs mt-1">Manage the live saree catalog.</p>
        </div>
        <Link 
          href="/admin/products/add"
          className="bg-[#C5A059] text-[#0A1021] hover:brightness-110 transition-all font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider"
        >
          + Add Product
        </Link>
      </div>

      {loading ? (
        <div className="text-gray-900 font-mono text-xs animate-pulse p-4">Loading catalog...</div>
      ) : (
        <>
          <div className="bg-white p-4 rounded-3xl border border-[#C5A059]/30 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input 
                type="text" 
                placeholder="Search by ID, Title, or Vendor..." 
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none text-sm text-gray-900 bg-gray-50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4 w-full lg:w-auto">
              <select 
                className="flex-1 lg:w-auto py-2 px-4 rounded-xl border border-gray-200 focus:border-[#C5A059] outline-none text-sm bg-gray-50 text-gray-900"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="approved">Live (Approved)</option>
                <option value="pending_approval">Pending QC (Moderation Queue)</option>
                <option value="rejected">Rejected</option>
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              <select 
                className="flex-1 lg:w-auto py-2 px-4 rounded-xl border border-gray-200 focus:border-[#C5A059] outline-none text-sm bg-gray-50 text-gray-900"
                value={sellerFilter}
                onChange={(e) => setSellerFilter(e.target.value)}
              >
                <option value="all">All Sellers</option>
                <option value="weaver">Master Weavers</option>
                <option value="vendor">Stores / Vendors</option>
              </select>
              <select 
                className="flex-1 lg:w-auto py-2 px-4 rounded-xl border border-gray-200 focus:border-[#C5A059] outline-none text-sm bg-gray-50 text-gray-900"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
              </select>
            </div>
          </div>

          <div className="bg-white shadow-sm border border-gray-200/80 border border-[#C5A059]/30 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto max-h-[700px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-gray-200">
              <thead className="text-xs uppercase bg-[#0A3A35] text-[#C5A059] font-bold tracking-widest border-b border-[#C5A059]/30">
                <tr>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Title & Weave</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Weaving Time</th>
                  <th className="px-6 py-4">Uploaded By</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-[#C5A059]/10 hover:bg-[#0A3A35]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-[#C5A059]/50">
                        <Image src={product.img} alt={product.title} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <div className="text-gray-900 font-serif">{product.title}</div>
                      <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">{product.category} • {product.weave}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{product.price}</td>
                    <td className="px-6 py-4 text-xs font-mono">{product.time}</td>
                    <td className="px-6 py-4 font-medium">
                      <a href={product.sellerType === 'weaver' ? '/admin/weavers' : '/admin/stores'} className="hover:bg-gray-100 p-2 -ml-2 rounded-lg transition-colors inline-block">
                        <div className="text-[#0070F3] hover:text-[#005BB5] font-bold">{product.vendorName || "Admin"}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">{product.sellerType || "system"}</div>
                      </a>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      {product.status === "pending_approval" && (
                        <>
                          <button 
                            onClick={() => handleApprove(product.id)}
                            className="text-green-600 hover:text-green-500 font-bold text-xs uppercase tracking-wider bg-green-50 px-3 py-1 rounded"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => setRejectingProduct(product)}
                            className="text-orange-600 hover:text-orange-500 font-bold text-xs uppercase tracking-wider bg-orange-50 px-3 py-1 rounded"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      
                      <a 
                        href={`/product/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 hover:underline font-bold text-xs uppercase tracking-wider"
                      >
                        View
                      </a>
                      <Link 
                        href={`/admin/products/edit/${product.id}`}
                        className="text-blue-400 hover:text-blue-350 font-bold text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(product.id, product.title)}
                        className="text-red-400 hover:text-red-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400 font-mono text-xs">No products found in the database.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}

      {/* REJECTION MODAL */}
      {rejectingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-gray-100">
            <h3 className="text-2xl font-black text-gray-900 mb-2">Reject Product</h3>
            <p className="text-sm font-medium text-gray-500 mb-6">
              You are rejecting <b>{rejectingProduct.title}</b>. Would you like to provide a reason to the seller so they can fix it? (Optional)
            </p>
            <textarea 
              rows={3}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g., Image is too blurry, please upload a clear picture."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none resize-none mb-6"
            ></textarea>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setRejectingProduct(null); setRejectionReason(""); }} 
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleRejectSubmit} 
                className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition-all shadow-sm"
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
