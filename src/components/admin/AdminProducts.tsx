import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useProducts, deleteProduct, updateDocumentStatus } from "@/lib/db-hooks";

export default function AdminProducts() {
  const { products, loading } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sellerFilter, setSellerFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const [rejectingProduct, setRejectingProduct] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.storeName && p.storeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
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
    <div className="space-y-6 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Product Catalog</h1>
          <p className="text-gray-800 mt-2 font-semibold">Manage live products and review pending uploads.</p>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold text-sm">Syncing with Ecosystem Database...</p>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-6 flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">🔍</span>
              <input 
                type="text" 
                placeholder="Search by ID, Title, or Store..." 
                className="w-full pl-12 pr-6 py-3 rounded-2xl border-2 border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none text-sm font-bold text-gray-900 bg-gray-50 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4 w-full lg:w-auto">
              <select 
                className="flex-1 lg:w-auto py-3 px-5 rounded-2xl border-2 border-gray-100 focus:border-blue-500 outline-none text-sm font-bold bg-gray-50 text-gray-900 focus:ring-4 focus:ring-blue-500/20 transition-all cursor-pointer"
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
                className="flex-1 lg:w-auto py-3 px-5 rounded-2xl border-2 border-gray-100 focus:border-blue-500 outline-none text-sm font-bold bg-gray-50 text-gray-900 focus:ring-4 focus:ring-blue-500/20 transition-all cursor-pointer"
                value={sellerFilter}
                onChange={(e) => setSellerFilter(e.target.value)}
              >
                <option value="all">All Sellers</option>
                <option value="weaver">Master Weavers</option>
                <option value="store">Retail Stores</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto max-h-[70vh] custom-scrollbar relative">
              <table className="w-full text-left border-collapse relative">
                <thead className="sticky top-0 z-10">
                  <tr className="text-xs uppercase tracking-widest text-gray-500 border-b border-gray-100 bg-gray-50/90 backdrop-blur-md">
                    <th className="py-4 px-6 font-bold rounded-tl-3xl">Image</th>
                    <th className="py-4 px-6 font-bold">Title & Weave</th>
                    <th className="py-4 px-6 font-bold">Price</th>
                    <th className="py-4 px-6 font-bold">Uploaded By</th>
                    <th className="py-4 px-6 font-bold text-right rounded-tr-3xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 relative rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                          <Image src={product.img || "/placeholder.jpg"} alt={product.title} fill className="object-cover" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{product.title}</div>
                        <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">
                          {product.category} • {product.weave}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 text-lg">
                        {product.price}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-blue-600">{product.storeName || "Unknown"}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">{product.sellerType || "system"}</div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {product.status === "pending_approval" ? (
                          <>
                            <button 
                              onClick={() => handleApprove(product.id)}
                              className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold hover:bg-green-100 transition-all border border-green-100"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => setRejectingProduct(product)}
                              className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-xs font-bold hover:bg-orange-100 transition-all border border-orange-100"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            product.status === "approved" ? "bg-green-50 text-green-700 border border-green-100" :
                            product.status === "rejected" ? "bg-red-50 text-red-700 border border-red-100" :
                            "bg-gray-50 text-gray-700 border border-gray-200"
                          }`}>
                            {product.status}
                          </span>
                        )}
                        
                        <button 
                          onClick={() => handleDelete(product.id, product.title)}
                          className="px-3 py-2 text-red-400 hover:text-red-600 font-bold transition-all"
                          title="Delete Product"
                        >
                          <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-gray-500 font-medium">
                         <div className="text-4xl mb-3">🔍</div>
                         No products found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {rejectingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-gray-100">
            <h3 className="text-2xl font-black text-gray-900 mb-2">Reject Product</h3>
            <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">
              You are rejecting <b>{rejectingProduct.title}</b>. Provide a reason so the seller knows how to fix it.
            </p>
            <textarea 
              rows={3}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g., Image is too blurry, please upload a clear picture."
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm font-medium focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none resize-none mb-6 transition-all"
            ></textarea>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setRejectingProduct(null); setRejectionReason(""); }} 
                className="px-5 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all border border-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleRejectSubmit} 
                className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition-all shadow-md shadow-orange-600/20"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
