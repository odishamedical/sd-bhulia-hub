"use client";

import React, { useState, useMemo } from "react";
import { useVendors, useWeavers } from "@/lib/db-hooks";
import Image from "next/image";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ImportedListingsDBPage() {
  const { vendors, loading: vLoading } = useVendors();
  const { weavers, loading: wLoading } = useWeavers();
  
  const [deleting, setDeleting] = useState<string | null>(null);

  // Filter only 'unclaimed' items
  const importedListings = useMemo(() => {
    const list = [
      ...vendors.map(v => ({ ...v, role: "vendor" })),
      ...weavers.map(w => ({ ...w, role: "weaver" }))
    ].filter(item => item.status === "unclaimed");
    // Sort descending by createdAt
    return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [vendors, weavers]);

  const handleDelete = async (id: string, role: string) => {
    if (!confirm("Are you sure you want to permanently delete this imported listing?")) return;
    setDeleting(id);
    try {
      const collectionName = role === "weaver" ? "weavers" : "vendors";
      await deleteDoc(doc(db, collectionName, id));
    } catch (e: any) {
      alert("Error deleting record: " + e.message);
    }
    setDeleting(null);
  };

  const handleHide = async (id: string, role: string) => {
    if (!confirm("Hide this listing? It will no longer appear in the directory until approved.")) return;
    setDeleting(id);
    try {
      const collectionName = role === "weaver" ? "weavers" : "vendors";
      await updateDoc(doc(db, collectionName, id), { status: "hidden" });
    } catch (e: any) {
      alert("Error hiding record: " + e.message);
    }
    setDeleting(null);
  };

  if (vLoading || wLoading) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading Imported Data...</div>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Imported Listings DB</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage and review all data automatically collected from Google Maps.</p>
        </div>
        <div className="text-sm font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
          {importedListings.length} Imported Records
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto p-0">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
              <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-100">
                <th className="py-4 px-6 font-bold">Listing Identity</th>
                <th className="py-4 px-6 font-bold">Location</th>
                <th className="py-4 px-6 font-bold">Google Data</th>
                <th className="py-4 px-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {importedListings.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                        {item.img ? (
                          <Image src={item.img} alt={item.title} fill className="object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Img</div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-base">{item.title}</div>
                        <div className="text-xs text-blue-600 font-bold uppercase tracking-widest mt-0.5">{item.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-700 truncate max-w-xs">{item.address}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.district || item.block || item.state}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1 font-bold text-gray-900">
                      <span className="text-yellow-400">★</span> {item.googleRating || "N/A"}
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest">{item.googleReviewsCount || 0} Reviews</div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        disabled={deleting === item.id}
                        onClick={() => handleHide(item.id, item.role)} 
                        className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all disabled:opacity-50"
                      >
                        Hide
                      </button>
                      <button 
                        disabled={deleting === item.id}
                        onClick={() => handleDelete(item.id, item.role)} 
                        className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition-all disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {importedListings.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-24 text-center text-gray-500">
                    <div className="font-bold text-lg text-gray-900 mb-1">No Imported Data</div>
                    <div className="text-sm">Run the Google Importer to collect data.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
