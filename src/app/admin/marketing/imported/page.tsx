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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");

  // Filter only 'unclaimed' items and map them
  const allImportedListings = useMemo(() => {
    const list = [
      ...vendors.map(v => ({ ...v, baseRole: "vendor" })),
      ...weavers.map(w => ({ ...w, baseRole: "weaver" }))
    ].filter(item => item.status === "unclaimed");
    
    return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [vendors, weavers]);

  // Derived filter options
  const allStates = Array.from(new Set(allImportedListings.map(item => item.state).filter(Boolean))).sort();
  const allDistricts = Array.from(new Set(allImportedListings.map(item => item.district).filter(Boolean))).sort();

  // Apply filters
  const filteredListings = useMemo(() => {
    return allImportedListings.filter(item => {
      // Type Filter
      const actualType = item.listingType || item.baseRole;
      if (typeFilter !== "all" && actualType !== typeFilter) return false;
      
      // Location Filters
      if (stateFilter !== "all" && item.state !== stateFilter) return false;
      if (districtFilter !== "all" && item.district !== districtFilter) return false;
      
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const address = item.address?.toLowerCase() || "";
        const title = item.title?.toLowerCase() || "";
        if (!title.includes(q) && !address.includes(q)) return false;
      }
      
      return true;
    });
  }, [allImportedListings, typeFilter, stateFilter, districtFilter, searchQuery]);

  // Selection Logic
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredListings.length && filteredListings.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredListings.map(r => r.id)));
    }
  };

  // Actions
  const handleDelete = async (id: string, role: string) => {
    if (!confirm("Are you sure you want to permanently delete this imported listing?")) return;
    setDeleting(id);
    try {
      const collectionName = role === "weaver" ? "weavers" : "vendors";
      await deleteDoc(doc(db, collectionName, id));
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
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
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    } catch (e: any) {
      alert("Error hiding record: " + e.message);
    }
    setDeleting(null);
  };
  
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to permanently delete ${selectedIds.size} listings?`)) return;
    setDeleting("bulk");
    try {
      const itemsToDelete = filteredListings.filter(item => selectedIds.has(item.id));
      for (const item of itemsToDelete) {
        const collectionName = item.baseRole === "weaver" ? "weavers" : "vendors";
        await deleteDoc(doc(db, collectionName, item.id));
      }
      setSelectedIds(new Set());
      alert(`Successfully deleted ${selectedIds.size} records.`);
    } catch(e: any) {
      alert("Error during bulk delete: " + e.message);
    }
    setDeleting(null);
  };

  const handleEdit = (item: any) => {
    alert("CRM Edit interface opening for: " + item.title + " (Integration with main edit modal coming soon)");
    // In a real app, this would open a modal pre-filled with the item's data to edit address/phone/etc.
  };

  if (vLoading || wLoading) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading Imported Data...</div>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Imported Listings DB</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage and review all data automatically collected from Google Maps.</p>
        </div>
        <div className="text-sm font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 flex items-center gap-2">
          <span>{filteredListings.length} Records</span>
        </div>
      </header>
      
      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Search</label>
          <input 
            type="text" 
            placeholder="Search name or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-blue-500 outline-none"
          />
        </div>
        
        <div className="w-48">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Listing Type</label>
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-blue-500 outline-none"
          >
            <option value="all">All Types</option>
            <option value="vendor">Vendor / Retail Shop</option>
            <option value="weaver">Master Weaver</option>
            <option value="raw_material">Raw Material Supplier</option>
          </select>
        </div>

        <div className="w-40">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">State</label>
          <select 
            value={stateFilter} 
            onChange={(e) => setStateFilter(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-blue-500 outline-none"
          >
            <option value="all">All States</option>
            {allStates.map(s => <option key={s as string} value={s as string}>{s}</option>)}
          </select>
        </div>

        <div className="w-40">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">District</label>
          <select 
            value={districtFilter} 
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-blue-500 outline-none"
          >
            <option value="all">All Districts</option>
            {allDistricts.map(d => <option key={d as string} value={d as string}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex justify-between items-center animate-in slide-in-from-top-2">
          <div className="text-sm font-bold text-blue-800">
            {selectedIds.size} listings selected
          </div>
          <div className="flex gap-2">
            <button 
              disabled={deleting === "bulk"}
              onClick={handleBulkDelete}
              className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {deleting === "bulk" ? "Deleting..." : "Delete Selected"}
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto p-0 max-h-[600px] custom-scrollbar">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
              <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-100">
                <th className="py-4 px-4 bg-gray-50 w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size === filteredListings.length && filteredListings.length > 0} 
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="py-4 px-2 font-bold bg-gray-50">Listing Identity</th>
                <th className="py-4 px-6 font-bold bg-gray-50">Location</th>
                <th className="py-4 px-6 font-bold bg-gray-50">Google Data</th>
                <th className="py-4 px-6 font-bold text-right bg-gray-50">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {filteredListings.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(item.id)} 
                      onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-200 shrink-0 border border-gray-200 shadow-sm">
                        {item.img ? (
                          <Image src={item.img} alt={item.title} fill className="object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 text-[10px] font-bold">NO IMG</div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-base">{item.title}</div>
                        <div className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">
                          {(item.listingType || item.baseRole).replace("_", " ")}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-700 truncate max-w-[200px]" title={item.address}>{item.address}</div>
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
                      <a 
                        href={`/${item.baseRole}/${item.slug}`} 
                        target="_blank"
                        className="px-3 py-1.5 border border-gray-200 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 hover:border-blue-200 transition-all"
                      >
                        View
                      </a>
                      <button 
                        onClick={() => handleEdit(item)}
                        className="px-3 py-1.5 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-100 transition-all"
                      >
                        Edit
                      </button>
                      <button 
                        disabled={deleting === item.id}
                        onClick={() => handleHide(item.id, item.baseRole)} 
                        className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-all disabled:opacity-50"
                        title="Hide listing from public directory"
                      >
                        Hide
                      </button>
                      <button 
                        disabled={deleting === item.id}
                        onClick={() => handleDelete(item.id, item.baseRole)} 
                        className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-all disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredListings.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-24 text-center text-gray-500">
                    <div className="font-bold text-lg text-gray-900 mb-1">No Imported Data Found</div>
                    <div className="text-sm">Try adjusting your filters or run the Google Importer.</div>
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
