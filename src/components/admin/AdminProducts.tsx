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
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<any>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery || 
                          String(p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.storeName && String(p.storeName).toLowerCase().includes(searchQuery.toLowerCase())) ||
                          String(p.id || "").toLowerCase().includes(searchQuery.toLowerCase());
    
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

  const toggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action: string) => {
    if (selectedProductIds.length === 0) return;
    
    if (action === "delete") {
      if (confirm(`Delete ${selectedProductIds.length} products?`)) {
        for (const id of selectedProductIds) await deleteProduct(id);
        setSelectedProductIds([]);
      }
    } else if (action === "approve") {
      if (confirm(`Approve ${selectedProductIds.length} products?`)) {
        for (const id of selectedProductIds) await updateDocumentStatus("products", id, { status: "approved" });
        setSelectedProductIds([]);
      }
    } else if (action === "reject") {
       const reason = prompt("Enter rejection reason for these products:");
       if (reason !== null) {
          for (const id of selectedProductIds) await updateDocumentStatus("products", id, { status: "rejected", rejectionReason: reason });
          setSelectedProductIds([]);
       }
    }
  };

  return (
    <div className="space-y-6 relative pb-24">
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
                    <th className="py-4 px-6 font-bold rounded-tl-3xl w-12">
                      <input type="checkbox" className="w-4 h-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length} onChange={toggleSelectAll} />
                    </th>
                    <th className="py-4 px-6 font-bold">Image</th>
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
                        <input type="checkbox" className="w-4 h-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={selectedProductIds.includes(product.id)} onChange={() => toggleSelect(product.id)} />
                      </td>
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
                        <select
                          value={product.status || "pending_approval"}
                          onChange={async (e) => {
                            if (e.target.value === "rejected") {
                                setRejectingProduct(product);
                            } else {
                                await updateDocumentStatus("products", product.id, { status: e.target.value, rejectionReason: "" });
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border outline-none cursor-pointer ${
                            product.status === "approved" ? "bg-green-50 text-green-700 border-green-200" :
                            product.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                            "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                            <option value="approved">LIVE (APPROVED)</option>
                            <option value="pending_approval">PENDING QC</option>
                            <option value="rejected">REJECTED</option>
                        </select>
                        <button 
                          onClick={() => setSelectedProductForDetails(product)}
                          className="px-3 py-2 text-blue-500 hover:text-blue-700 font-bold transition-all inline-block"
                          title="View & Edit Details"
                        >
                           <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
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

      {/* BULK ACTION TOOLBAR */}
      {selectedProductIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-8 border border-gray-800">
           <div className="font-bold border-r border-gray-700 pr-6 text-sm">
             {selectedProductIds.length} Selected
           </div>
           <div className="flex gap-3">
             <button onClick={() => handleBulkAction("approve")} className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-xl text-sm font-bold transition-all shadow-sm">Approve All</button>
             <button onClick={() => handleBulkAction("reject")} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-sm font-bold transition-all shadow-sm">Reject All</button>
             <button onClick={() => handleBulkAction("delete")} className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-bold transition-all shadow-sm">Delete All</button>
           </div>
        </div>
      )}

      {/* DETAILS / EDIT MODAL */}
      {selectedProductForDetails && (
        <div className="fixed inset-0 z-[60] flex items-center justify-end bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 sticky top-0 z-10 backdrop-blur-md">
              <div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight">Product Details</h2>
                <div className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest flex items-center gap-2">
                   ID: {selectedProductForDetails.id}
                   <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md">Live Storefront</span>
                </div>
              </div>
              <button onClick={() => setSelectedProductForDetails(null)} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 shadow-sm transition-all border border-gray-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* Core Info */}
              <div className="flex gap-6 items-start">
                <div className="w-32 h-32 relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
                  <Image src={selectedProductForDetails.img || "/placeholder.jpg"} alt="Product" fill className="object-cover" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-widest">Title</label>
                    <input 
                      type="text"
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-gray-900 focus:border-blue-500 outline-none text-sm transition-all"
                      value={selectedProductForDetails.title || ""}
                      onChange={(e) => setSelectedProductForDetails({...selectedProductForDetails, title: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-widest">Selling Price (₹)</label>
                      <input 
                        type="text"
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-gray-900 focus:border-blue-500 outline-none text-sm transition-all"
                        value={selectedProductForDetails.price || ""}
                        onChange={(e) => setSelectedProductForDetails({...selectedProductForDetails, price: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-widest">MRP (₹)</label>
                      <input 
                        type="text"
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-gray-900 focus:border-blue-500 outline-none text-sm transition-all"
                        value={selectedProductForDetails.mrp || ""}
                        onChange={(e) => setSelectedProductForDetails({...selectedProductForDetails, mrp: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-widest">Reseller Price (₹)</label>
                      <input 
                        type="text"
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-gray-900 focus:border-blue-500 outline-none text-sm transition-all"
                        value={selectedProductForDetails.resellerPrice || ""}
                        onChange={(e) => setSelectedProductForDetails({...selectedProductForDetails, resellerPrice: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-widest">Stock Quantity</label>
                      <input 
                        type="number"
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-gray-900 focus:border-blue-500 outline-none text-sm transition-all"
                        value={selectedProductForDetails.stockQuantity || 1}
                        onChange={(e) => setSelectedProductForDetails({...selectedProductForDetails, stockQuantity: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-widest">Platform Commission (%)</label>
                      <input 
                        type="number"
                        placeholder="Default"
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-gray-900 focus:border-blue-500 outline-none text-sm transition-all"
                        value={selectedProductForDetails.platformCommissionRate ?? ""}
                        onChange={(e) => setSelectedProductForDetails({...selectedProductForDetails, platformCommissionRate: e.target.value === "" ? null : parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-widest">Stock Status</label>
                      <select
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-gray-900 focus:border-blue-500 outline-none text-sm transition-all cursor-pointer"
                        value={selectedProductForDetails.inStock ? "true" : "false"}
                        onChange={(e) => setSelectedProductForDetails({...selectedProductForDetails, inStock: e.target.value === "true"})}
                      >
                        <option value="true">In Stock</option>
                        <option value="false">Out of Stock</option>
                      </select>
                    </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Taxonomy */}
              <div>
                 <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Taxonomy & Materials</h3>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-widest">Category</label>
                     <input 
                        type="text"
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-gray-900 focus:border-blue-500 outline-none text-sm transition-all"
                        value={selectedProductForDetails.category || ""}
                        onChange={(e) => setSelectedProductForDetails({...selectedProductForDetails, category: e.target.value})}
                      />
                   </div>
                   <div>
                     <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-widest">Weave</label>
                     <input 
                        type="text"
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-gray-900 focus:border-blue-500 outline-none text-sm transition-all"
                        value={selectedProductForDetails.weave || ""}
                        onChange={(e) => setSelectedProductForDetails({...selectedProductForDetails, weave: e.target.value})}
                      />
                   </div>
                   <div>
                     <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-widest">Material</label>
                     <input 
                        type="text"
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-gray-900 focus:border-blue-500 outline-none text-sm transition-all"
                        value={selectedProductForDetails.material || ""}
                        onChange={(e) => setSelectedProductForDetails({...selectedProductForDetails, material: e.target.value})}
                      />
                   </div>
                   <div>
                     <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-widest">Thread Count</label>
                     <input 
                        type="text"
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-gray-900 focus:border-blue-500 outline-none text-sm transition-all"
                        value={selectedProductForDetails.threadCount || ""}
                        onChange={(e) => setSelectedProductForDetails({...selectedProductForDetails, threadCount: e.target.value})}
                      />
                   </div>
                 </div>
                 
                 <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 mt-8">Origin & Logistics</h3>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-widest">Weaving Duration (Time)</label>
                     <input 
                        type="text"
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-gray-900 focus:border-blue-500 outline-none text-sm transition-all"
                        value={selectedProductForDetails.time || ""}
                        onChange={(e) => setSelectedProductForDetails({...selectedProductForDetails, time: e.target.value})}
                      />
                   </div>
                   <div>
                     <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-widest">Yarn Type</label>
                     <input 
                        type="text"
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-gray-900 focus:border-blue-500 outline-none text-sm transition-all"
                        value={selectedProductForDetails.yarnType || ""}
                        onChange={(e) => setSelectedProductForDetails({...selectedProductForDetails, yarnType: e.target.value})}
                      />
                   </div>
                   <div>
                     <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-widest">Cluster</label>
                     <input 
                        type="text"
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-gray-900 focus:border-blue-500 outline-none text-sm transition-all"
                        value={selectedProductForDetails.cluster || ""}
                        onChange={(e) => setSelectedProductForDetails({...selectedProductForDetails, cluster: e.target.value})}
                      />
                   </div>
                   <div>
                     <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-widest">Village</label>
                     <input 
                        type="text"
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-gray-900 focus:border-blue-500 outline-none text-sm transition-all"
                        value={selectedProductForDetails.village || ""}
                        onChange={(e) => setSelectedProductForDetails({...selectedProductForDetails, village: e.target.value})}
                      />
                   </div>
                 </div>
              </div>

              <hr className="border-gray-100" />

              {/* Description */}
              <div>
                 <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Content</h3>
                 <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-widest">Full Description</label>
                 <textarea 
                    rows={6}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 font-medium text-gray-900 focus:border-blue-500 outline-none text-sm transition-all resize-none"
                    value={selectedProductForDetails.description || ""}
                    onChange={(e) => setSelectedProductForDetails({...selectedProductForDetails, description: e.target.value})}
                  />
              </div>

            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/80 flex justify-end gap-3 sticky bottom-0 z-10 backdrop-blur-md">
               <button 
                  onClick={() => setSelectedProductForDetails(null)}
                  className="px-6 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    await updateDocumentStatus("products", selectedProductForDetails.id, {
                      title: selectedProductForDetails.title,
                      price: selectedProductForDetails.price,
                      mrp: selectedProductForDetails.mrp,
                      resellerPrice: selectedProductForDetails.resellerPrice,
                      stockQuantity: selectedProductForDetails.stockQuantity,
                      inStock: selectedProductForDetails.inStock,
                      category: selectedProductForDetails.category,
                      weave: selectedProductForDetails.weave,
                      material: selectedProductForDetails.material,
                      threadCount: selectedProductForDetails.threadCount,
                      time: selectedProductForDetails.time,
                      yarnType: selectedProductForDetails.yarnType,
                      cluster: selectedProductForDetails.cluster,
                      platformCommissionRate: selectedProductForDetails.platformCommissionRate,
                      village: selectedProductForDetails.village,
                      description: selectedProductForDetails.description
                    });
                    setSelectedProductForDetails(null);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
                >
                  Save Changes
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
