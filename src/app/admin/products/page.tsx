"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useProducts, deleteProduct } from "@/lib/db-hooks";

export default function AdminProductsPage() {
  const { products, loading } = useProducts();

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      await deleteProduct(id);
    }
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
        <div className="bg-white shadow-sm border border-gray-200/80 border border-[#C5A059]/30 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-200">
              <thead className="text-xs uppercase bg-[#0A3A35] text-gray-900 font-bold tracking-widest border-b border-[#C5A059]/30">
                <tr>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Title & Weave</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Weaving Time</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
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
                    <td className="px-6 py-4 text-right space-x-4">
                      <a 
                        href={`/product/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 hover:underline font-bold text-xs uppercase tracking-wider"
                      >
                        View Product
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
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400 font-mono text-xs">No products found in the database.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
