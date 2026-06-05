"use client";

import React, { useState } from "react";
import { useProducts, updateDocumentStatus } from "@/lib/db-hooks";
import Image from "next/image";

export default function LiveProductsPage() {
  const { products, loading } = useProducts();
  const [search, setSearch] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const activeProducts = products.filter(p => p.status === "approved" || p.status === "active" || p.isBhuliaVerified);
  
  const filteredProducts = activeProducts.filter(p => 
    p.title?.toLowerCase().includes(search.toLowerCase()) || 
    p.sku?.toLowerCase().includes(search.toLowerCase()) ||
    p.id?.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleHide = async (product: any) => {
    const newHiddenStatus = !(product as any).isHidden;
    const res = await updateDocumentStatus("products", product.id, { isHidden: newHiddenStatus });
    if (res.success) {
      alert(`Product ${newHiddenStatus ? 'hidden from' : 'made visible on'} storefront.`);
    } else {
      alert("Failed to update visibility.");
    }
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      const headers = ["ID", "SKU", "Title", "Price", "Stock", "Weaver ID"];
      const rows = filteredProducts.map(p => [
        p.id,
        p.sku || 'N/A',
        `"${(p.title || '').replace(/"/g, '""')}"`,
        p.price || 0,
        p.stock || 0,
        p.sellerId || 'Unknown'
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "bhulia_live_products.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsExporting(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Live Saree DB</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage the global active catalog. Edit inventory, prices, and visibility.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            disabled={isExporting || loading}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgb(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isExporting ? "Generating CSV..." : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Export to CSV
              </>
            )}
          </button>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-220px)]">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <input 
              type="text" 
              placeholder="Search by Title, SKU, or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
            />
            <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <div className="text-sm font-bold text-gray-500">
            {filteredProducts.length} Items
          </div>
        </div>

        <div className="flex-1 overflow-auto p-0">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 bg-white shadow-sm z-10">
              <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-100">
                <th className="py-4 px-6 font-bold w-12">Img</th>
                <th className="py-4 px-6 font-bold">Product Details</th>
                <th className="py-4 px-6 font-bold w-32">Price (₹)</th>
                <th className="py-4 px-6 font-bold w-24">Stock</th>
                <th className="py-4 px-6 font-bold w-32 text-center">Visibility</th>
                <th className="py-4 px-6 font-bold w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400 font-medium">Loading catalog data...</td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <tr key={product.id} className={`group transition-colors ${(product as any).isHidden ? 'bg-gray-50/50 grayscale-[0.5] opacity-60' : 'hover:bg-blue-50/30'}`}>
                    <td className="py-3 px-6">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden relative">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-bold">NO IMG</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{product.title}</div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {product.id} • SKU: {(product as any).sku || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-6">
                      <input 
                        type="text" 
                        defaultValue={product.price?.toString().replace(/[^0-9]/g, '') || ''} 
                        className="w-full bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 focus:bg-blue-50 outline-none py-1 font-bold text-gray-900 transition-all"
                      />
                    </td>
                    <td className="py-3 px-6">
                      <input 
                        type="number" 
                        defaultValue={(product as any).stock || 1} 
                        className="w-full bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 focus:bg-blue-50 outline-none py-1 font-bold text-gray-900 transition-all"
                      />
                    </td>
                    <td className="py-3 px-6 text-center">
                      <button 
                        onClick={() => handleToggleHide(product)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${(product as any).isHidden ? 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}
                      >
                        {(product as any).isHidden ? "Hidden" : "Live"}
                      </button>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <button className="text-blue-600 hover:text-blue-800 text-xs font-bold transition-colors">Save</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-500 font-medium">No live products found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
