"use client";

import React, { useState, useMemo } from "react";
import { useStores, useWeavers } from "@/lib/db-hooks";
import Image from "next/image";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ImportedListingsDBPage() {
  const { stores, loading: vLoading } = useStores();
  const { weavers, loading: wLoading } = useWeavers();
  
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");

  // Filter only 'unclaimed' items and map them
  const allImportedListings = useMemo(() => {
    const list = [
      ...stores.map(v => ({ ...v, baseRole: "store" })),
      ...weavers.map(w => ({ ...w, baseRole: "weaver" }))
    ].filter(item => item.status === "unclaimed");
    
    return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [stores, weavers]);

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
      const collectionName = role === "weaver" ? "weavers" : "stores";
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
      const collectionName = role === "weaver" ? "weavers" : "stores";
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
        const collectionName = item.baseRole === "weaver" ? "weavers" : "stores";
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
    setEditingItem({ ...item });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `imported/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setEditingItem((prev: any) => ({ ...prev, img: downloadURL }));
    } catch (error: any) {
      alert("Error uploading image: " + error.message);
    }
    setIsUploading(false);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setSavingEdit(true);
    try {
      const collectionName = editingItem.baseRole === "weaver" ? "weavers" : "stores";
      
      const updates = {
        title: editingItem.title,
        address: editingItem.address,
        country: editingItem.country,
        state: editingItem.state,
        district: editingItem.district,
        block: editingItem.block,
        townVillage: editingItem.townVillage,
        pin: editingItem.pin,
        phone: editingItem.phone,
        whatsapp: editingItem.whatsapp,
        website: editingItem.website,
        listingType: editingItem.listingType || editingItem.baseRole,
        desc: editingItem.desc || "",
        productsOffered: editingItem.productsOffered || "",
        img: editingItem.img || "",
      };

      await updateDoc(doc(db, collectionName, editingItem.id), updates);
      alert("Successfully updated listing!");
      setEditingItem(null);
    } catch (e: any) {
      alert("Error saving updates: " + e.message);
    }
    setSavingEdit(false);
  };

  const handleExportCSV = () => {
    if (filteredListings.length === 0) return alert("No listings to export!");
    setIsExporting(true);
    
    setTimeout(() => {
      // We want to export phone numbers for WhatsApp marketing
      const headers = ["Business Name", "Listing Type", "Phone/WhatsApp", "State", "District", "Address", "Google Rating"];
      const rows = filteredListings.map(item => [
        `"${(item.title || "").replace(/"/g, '""')}"`,
        item.listingType || item.baseRole,
        item.phone || item.whatsapp || "Not Provided",
        item.state || "",
        item.district || "",
        `"${(item.address || "").replace(/"/g, '""')}"`,
        item.googleRating || "N/A"
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `bhulia_imported_leads_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 500);
  };

  if (vLoading || wLoading) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading Imported Data...</div>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Imported Listings DB</h1>
          <p className="text-gray-700 mt-2 font-medium">Manage and review all data automatically collected from Google Maps.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleExportCSV}
            disabled={isExporting || filteredListings.length === 0}
            className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all disabled:opacity-50 shadow-sm flex items-center gap-2"
          >
            {isExporting ? "Exporting..." : "📥 Export Contacts (CSV)"}
          </button>
          <div className="text-sm font-black text-blue-600 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100 flex items-center gap-2">
            <span>{filteredListings.length} Records</span>
          </div>
        </div>
      </header>
      
      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-1">Search</label>
          <input 
            type="text" 
            placeholder="Search name or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm font-semibold text-gray-900 focus:border-blue-500 outline-none"
          />
        </div>
        
        <div className="w-48">
          <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-1">Listing Type</label>
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm font-semibold text-gray-900 focus:border-blue-500 outline-none"
          >
            <option value="all">All Types</option>
            <option value="store">Store / Retail Shop</option>
            <option value="weaver">Master Weaver</option>
            <option value="raw_material">Raw Material Supplier</option>
          </select>
        </div>

        <div className="w-40">
          <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-1">State</label>
          <select 
            value={stateFilter} 
            onChange={(e) => setStateFilter(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm font-semibold text-gray-900 focus:border-blue-500 outline-none"
          >
            <option value="all">All States</option>
            {allStates.map(s => <option key={s as string} value={s as string}>{s}</option>)}
          </select>
        </div>

        <div className="w-40">
          <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-1">District</label>
          <select 
            value={districtFilter} 
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm font-semibold text-gray-900 focus:border-blue-500 outline-none"
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
                        <Image 
                          src={item.img || "/bhulia-hero.png"} 
                          alt={item.title || "Listing"} 
                          fill 
                          className="object-cover" 
                          unoptimized={true} 
                        />
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
                        className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all"
                      >
                        Edit
                      </button>
                      <button 
                        disabled={deleting === item.id}
                        onClick={() => handleHide(item.id, item.baseRole)} 
                        className="px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-100 transition-all disabled:opacity-50"
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
      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <h3 className="text-xl md:text-2xl font-black text-gray-900">Edit Imported Listing</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setEditingItem(null)} 
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveEdit} 
                  disabled={savingEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
                >
                  {savingEdit ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Business Name</label>
                <input 
                  type="text" 
                  value={editingItem.title || ""} 
                  onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-semibold focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Address</label>
                <textarea 
                  rows={2}
                  value={editingItem.address || ""} 
                  onChange={e => setEditingItem({...editingItem, address: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-semibold focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Country</label>
                  <input 
                    type="text" 
                    value={editingItem.country || ""} 
                    onChange={e => setEditingItem({...editingItem, country: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-semibold focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">State</label>
                  <input 
                    type="text" 
                    value={editingItem.state || ""} 
                    onChange={e => setEditingItem({...editingItem, state: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-semibold focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">District</label>
                  <input 
                    type="text" 
                    value={editingItem.district || ""} 
                    onChange={e => setEditingItem({...editingItem, district: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-semibold focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Block</label>
                  <input 
                    type="text" 
                    value={editingItem.block || ""} 
                    onChange={e => setEditingItem({...editingItem, block: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-semibold focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Town / Village</label>
                  <input 
                    type="text" 
                    value={editingItem.townVillage || ""} 
                    onChange={e => setEditingItem({...editingItem, townVillage: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-semibold focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">PIN Code</label>
                  <input 
                    type="text" 
                    value={editingItem.pin || ""} 
                    onChange={e => setEditingItem({...editingItem, pin: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-semibold focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input 
                    type="text" 
                    value={editingItem.phone || ""} 
                    onChange={e => setEditingItem({...editingItem, phone: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-semibold focus:border-blue-500 outline-none"
                    placeholder="+91..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">WhatsApp Number</label>
                  <input 
                    type="text" 
                    value={editingItem.whatsapp || ""} 
                    onChange={e => setEditingItem({...editingItem, whatsapp: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-semibold focus:border-blue-500 outline-none"
                    placeholder="+91..."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Website</label>
                <input 
                  type="text" 
                  value={editingItem.website || ""} 
                  onChange={e => setEditingItem({...editingItem, website: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-semibold focus:border-blue-500 outline-none"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Listing Type</label>
                <select 
                  value={editingItem.listingType || editingItem.baseRole} 
                  onChange={e => setEditingItem({...editingItem, listingType: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-semibold focus:border-blue-500 outline-none"
                >
                  <option value="store">Store / Retail Shop</option>
                  <option value="weaver">Master Weaver</option>
                  <option value="raw_material">Raw Material Supplier</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea 
                  rows={3}
                  value={editingItem.desc || ""} 
                  onChange={e => setEditingItem({...editingItem, desc: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-semibold focus:border-blue-500 outline-none resize-none"
                  placeholder="Short description of the store or weaver..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Products / Specialties</label>
                <input 
                  type="text" 
                  value={editingItem.productsOffered || ""} 
                  onChange={e => setEditingItem({...editingItem, productsOffered: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-semibold focus:border-blue-500 outline-none"
                  placeholder="e.g. Silk Sarees, Cotton Dress Materials, Bomkai..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Image Upload</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-sm font-semibold focus:border-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {isUploading && <p className="text-xs text-blue-600 mt-2 font-bold animate-pulse">Uploading image...</p>}
                {editingItem.img && (
                  <div className="mt-4 w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 relative group shadow-sm">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src={editingItem.img} alt="Preview" className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => setEditingItem((prev: any) => ({ ...prev, img: "" }))} className="text-white text-xs font-bold bg-red-600 px-2 py-1 rounded">Remove</button>
                     </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
