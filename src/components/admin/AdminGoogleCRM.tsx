"use client";

import React, { useState, useMemo } from "react";
import { useWeavers, useStores, useWholesalers, useSuppliers } from "@/lib/db-hooks";
import { db } from "@/lib/firebase";
import { deleteDoc, doc, updateDoc, setDoc } from "firebase/firestore";

export default function AdminGoogleCRM() {
  const { weavers, loading: wLoading } = useWeavers(500);
  const { stores, loading: sLoading } = useStores(500);
  const { wholesalers, loading: whLoading } = useWholesalers(500);
  const { suppliers, loading: suLoading } = useSuppliers(500);
  const loading = wLoading || sLoading || whLoading || suLoading;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingLead, setEditingLead] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Crawler State
  const [showCrawler, setShowCrawler] = useState(false);
  const [googleQuery, setGoogleQuery] = useState("");
  const [googleResults, setGoogleResults] = useState<any[]>([]);
  const [isCrawling, setIsCrawling] = useState(false);
  const [importRole, setImportRole] = useState("store");

  // Inspect & Edit State for Crawler
  const [inspectPlaceId, setInspectPlaceId] = useState<string | null>(null);
  const [editedPlaces, setEditedPlaces] = useState<Record<string, any>>({});

  const handleCrawl = async () => {
    if (!googleQuery) return;
    setIsCrawling(true);
    try {
      const res = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: googleQuery })
      });
      const data = await res.json();
      if (data.places || data.results) {
        setGoogleResults(data.places || data.results);
      } else {
        alert("No results found or error occurred.");
      }
    } catch (e) {
      console.error(e);
      alert("Crawler error");
    } finally {
      setIsCrawling(false);
    }
  };

  const importPlace = async (place: any) => {
    try {
      let country = "India";
      let state = "Odisha";
      let district = "";
      let block = "";

      if (place.addressComponents) {
        place.addressComponents.forEach((comp: any) => {
          if (comp.types.includes("country")) country = comp.longText;
          if (comp.types.includes("administrative_area_level_1")) state = comp.longText;
          if (comp.types.includes("administrative_area_level_2")) district = comp.longText;
          if (!district && comp.types.includes("administrative_area_level_3")) district = comp.longText;
          if (comp.types.includes("locality") || comp.types.includes("sublocality")) {
            if (!block) block = comp.longText;
          }
        });
      }

      const edits = editedPlaces[place.id] || {};
      const newDoc = {
        title: edits.name || place.displayName?.text || place.name || "Unknown",
        address: edits.address || place.formattedAddress || place.address || "",
        country: country,
        state: state,
        district: district,
        block: block,
        phoneNumber: edits.phone || place.nationalPhoneNumber || place.phone || "",
        website: edits.website || place.websiteUri || place.website || "",
        rating: edits.rating || place.rating || 0,
        img: edits.img || place.image || "",
        source: "google_places",
        role: importRole,
        status: "unclaimed",
        createdAt: new Date().toISOString()
      };
      
      const collectionName = importRole === "weaver" ? "weavers" : importRole === "store" ? "stores" : importRole === "wholesaler" ? "wholesalers" : "suppliers";
      const newRef = doc(db, collectionName, place.id || Date.now().toString());
      
      await setDoc(newRef, newDoc);
      alert(`${newDoc.title} imported successfully as ${importRole}!`);
      setInspectPlaceId(null);
    } catch (e) {
      alert("Error importing lead");
    }
  };

  const updateEdit = (id: string, field: string, value: any) => {
    setEditedPlaces(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const crmLeads = useMemo(() => {
    const wList = weavers.filter(w => w.source === "google_places").map(w => ({
      id: w.id, name: w.title, role: "weaver", phone: w.phoneNumber || "N/A", state: String(w.address || "").split(",")?.[2]?.split("-")?.[0]?.trim() || w.state || "N/A", district: String(w.address || "").split(",")?.[1]?.trim() || w.district || "N/A", address: w.address, status: w.status || "approved", website: w.website || "N/A", rating: w.rating || "N/A", img: w.img || "", heroImg: w.heroImg || ""
    }));
    const sList = stores.filter(s => s.source === "google_places").map(s => ({
      id: s.id, name: s.title, role: "store", phone: s.phoneNumber || "N/A", state: String(s.address || "").split(",")?.[2]?.split("-")?.[0]?.trim() || s.state || "N/A", district: String(s.address || "").split(",")?.[1]?.trim() || s.district || "N/A", address: s.address, status: s.status || "approved", website: s.website || "N/A", rating: s.rating || "N/A", img: s.img || "", heroImg: s.heroImg || ""
    }));
    const bList = wholesalers.filter(b => b.source === "google_places").map(b => ({
      id: b.id, name: b.title, role: "wholesaler", phone: b.phoneNumber || "N/A", state: String(b.address || "").split(",")?.[2]?.split("-")?.[0]?.trim() || b.state || "N/A", district: String(b.address || "").split(",")?.[1]?.trim() || b.district || "N/A", address: b.address, status: b.status || "approved", website: b.website || "N/A", rating: b.rating || "N/A", img: b.img || "", heroImg: b.heroImg || ""
    }));
    const suList = suppliers.filter(su => su.source === "google_places").map(su => ({
      id: su.id, name: su.title, role: "supplier", phone: su.phoneNumber || "N/A", state: String(su.address || "").split(",")?.[2]?.split("-")?.[0]?.trim() || su.state || "N/A", district: String(su.address || "").split(",")?.[1]?.trim() || su.district || "N/A", address: su.address, status: su.status || "approved", website: su.website || "N/A", rating: su.rating || "N/A", img: su.img || "", heroImg: su.heroImg || ""
    }));
    return [...wList, ...sList, ...bList, ...suList];
  }, [weavers, stores, wholesalers, suppliers]);

  const filteredLeads = useMemo(() => {
    return crmLeads.filter(lead => {
      const matchesSearch = !searchTerm || String(lead.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || String(lead.phone || "").includes(searchTerm);
      const matchesState = stateFilter === "all" || String(lead.state || "").toLowerCase() === stateFilter.toLowerCase();
      const matchesDistrict = districtFilter === "all" || String(lead.district || "").toLowerCase() === districtFilter.toLowerCase();
      const matchesRole = roleFilter === "all" || lead.role === roleFilter;
      return matchesSearch && matchesState && matchesDistrict && matchesRole;
    });
  }, [crmLeads, searchTerm, stateFilter, districtFilter, roleFilter]);

  const allStates = Array.from(new Set(crmLeads.map(l => l.state))).sort();
  const allDistricts = Array.from(new Set(crmLeads.map(l => l.district))).sort();

  const toggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredLeads.map(l => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (confirm(`Are you sure you want to permanently delete ${selectedIds.length} selected leads?`)) {
      try {
        const deletePromises = selectedIds.map(id => {
          const lead = crmLeads.find(l => l.id === id);
          if (!lead) return Promise.resolve();
          const collectionName = lead.role === "weaver" ? "weavers" : lead.role === "store" ? "stores" : lead.role === "wholesaler" ? "wholesalers" : "suppliers";
          return deleteDoc(doc(db, collectionName, id));
        });
        await Promise.all(deletePromises);
        setSelectedIds([]);
        alert(`${selectedIds.length} leads deleted successfully.`);
      } catch (e) {
        alert("Error during bulk delete.");
      }
    }
  };

  const handleDelete = async (role: string, id: string) => {
    if (confirm("Delete this lead permanently?")) {
      try {
        const collectionName = role === "weaver" ? "weavers" : role === "store" ? "stores" : role === "wholesaler" ? "wholesalers" : "suppliers";
        await deleteDoc(doc(db, collectionName, id));
        alert("Lead deleted.");
      } catch (e) {
        alert("Error deleting lead.");
      }
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    try {
      const collectionName = editingLead.role === "weaver" ? "weavers" : editingLead.role === "store" ? "stores" : editingLead.role === "wholesaler" ? "wholesalers" : "suppliers";
      await updateDoc(doc(db, collectionName, editingLead.id), {
        title: editingLead.name,
        address: editingLead.address,
        phoneNumber: editingLead.phone,
        img: editingLead.img || "",
        heroImg: editingLead.heroImg || ""
      });
      alert("Lead updated successfully!");
      setEditingLead(null);
    } catch (error) {
      alert("Error updating lead");
    }
  };

  const handleCall = (phone: string) => {
    if (phone === "N/A") return alert("No phone number available");
    window.open(`tel:${phone}`);
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold animate-pulse">Loading CRM Data...</div>;

  const inspectedPlace = googleResults.find(p => p.id === inspectPlaceId);
  const currentEdits = inspectedPlace ? (editedPlaces[inspectPlaceId as string] || {}) : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <div className="bg-gradient-to-tr from-green-500 to-emerald-600 p-2 rounded-xl text-white shadow-md">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          Google Data CRM
        </h1>
        <p className="text-gray-500 mt-2 font-medium text-sm">Manage and track leads imported from Google Places.</p>
        
        <button 
          onClick={() => setShowCrawler(!showCrawler)}
          className="mt-4 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-lg hover:bg-green-600 transition-colors">
          {showCrawler ? "Close Crawler" : "Open Google Maps Crawler"}
        </button>
      </header>

      {showCrawler && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-8 shadow-lg">
          <h2 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            Crawl Google Places
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              placeholder="e.g. Sambalpuri Saree Shop in Bargarh" 
              value={googleQuery}
              onChange={(e) => setGoogleQuery(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-50 text-gray-900 border border-gray-300 rounded-xl text-sm focus:border-green-500 outline-none font-medium"
            />
            <select 
              value={importRole} 
              onChange={e => setImportRole(e.target.value)} 
              className="bg-gray-50 text-gray-900 border border-gray-300 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500">
              <option value="weaver">Target: Master Weaver</option>
              <option value="store">Target: Retail Shop</option>
              <option value="wholesaler">Target: B2B Wholesaler</option>
              <option value="supplier">Target: Raw Material Supplier</option>
            </select>
            <button 
              onClick={handleCrawl}
              disabled={isCrawling}
              className="bg-green-500 text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCrawling ? "Crawling..." : "Search"}
            </button>
          </div>
          
          {googleResults.length > 0 && (
            <div className="mt-6 grid gap-4">
              {googleResults.map((place, idx) => {
                const edits = editedPlaces[place.id] || {};
                return (
                  <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center">
                    <div>
                      <h3 className="text-gray-900 font-bold text-sm">{edits.name || place.displayName?.text || place.name}</h3>
                      <p className="text-gray-500 text-xs mt-1">{edits.address || place.formattedAddress || place.address}</p>
                      <p className="text-green-600 text-xs mt-1 font-mono font-bold">{edits.phone || place.nationalPhoneNumber || place.phone || "No Phone"}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setInspectPlaceId(place.id)}
                        className="bg-transparent border border-gray-400 text-gray-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Inspect & Edit
                      </button>
                      <button 
                        onClick={() => importPlace(place)}
                        className="bg-transparent border border-green-500 text-green-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-green-500 hover:text-white transition-colors"
                      >
                        Import Lead
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Inspect & Edit Modal for Crawler */}
      {inspectPlaceId && inspectedPlace && currentEdits && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 relative shadow-2xl my-8 mt-24">
            <button onClick={() => setInspectPlaceId(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Inspect & Edit Lead Data</h2>
            <p className="text-gray-500 mb-8">Review the data grabbed by the Google Crawler before importing.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Business Name</label>
                <input type="text" value={currentEdits.name !== undefined ? currentEdits.name : (inspectedPlace.displayName?.text || inspectedPlace.name || "")} onChange={e => updateEdit(inspectedPlace.id, "name", e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-green-500 outline-none text-black" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                  <input type="text" value={currentEdits.phone !== undefined ? currentEdits.phone : (inspectedPlace.nationalPhoneNumber || inspectedPlace.phone || "")} onChange={e => updateEdit(inspectedPlace.id, "phone", e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-green-500 outline-none text-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Rating</label>
                  <input type="number" step="0.1" value={currentEdits.rating !== undefined ? currentEdits.rating : (inspectedPlace.rating || 0)} onChange={e => updateEdit(inspectedPlace.id, "rating", parseFloat(e.target.value))} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-green-500 outline-none text-black" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Address</label>
                <textarea value={currentEdits.address !== undefined ? currentEdits.address : (inspectedPlace.formattedAddress || inspectedPlace.address || "")} onChange={e => updateEdit(inspectedPlace.id, "address", e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-green-500 outline-none text-black h-24" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Profile Image URL (Optional)</label>
                <input type="text" value={currentEdits.img !== undefined ? currentEdits.img : (inspectedPlace.image || "")} onChange={e => updateEdit(inspectedPlace.id, "img", e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-green-500 outline-none text-black" placeholder="Paste an image URL here..." />
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setInspectPlaceId(null)} className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50">Cancel</button>
              <button onClick={() => importPlace(inspectedPlace)} className="px-8 py-3 bg-green-500 rounded-xl text-white font-bold hover:bg-green-600">Import Lead Now</button>
            </div>
          </div>
        </div>
      )}

      {/* Main CRM Table */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Search leads by name or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:border-green-500 outline-none font-medium"
          />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none">
          <option value="all">All Categories</option>
          <option value="weaver">Master Weavers</option>
          <option value="store">Retail Stores</option>
          <option value="wholesaler">B2B Wholesalers</option>
          <option value="supplier">Raw Material Suppliers</option>
        </select>
        <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none">
          <option value="all">All States</option>
          {allStates.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)} className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none">
          <option value="all">All Districts</option>
          {allDistricts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        {selectedIds.length > 0 && (
          <div className="absolute top-0 left-0 w-full bg-red-50 border-b border-red-100 px-6 py-3 flex items-center justify-between z-20">
            <span className="text-red-800 font-bold text-sm">{selectedIds.length} leads selected</span>
            <button 
              onClick={handleBulkDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
            >
              Delete Selected
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="py-4 px-6 w-12">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500" 
                    checked={selectedIds.length > 0 && selectedIds.length === filteredLeads.length}
                    onChange={toggleAll}
                  />
                </th>
                <th className="py-4 px-6">Business Name</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6">Contact</th>
                <th className="py-4 px-6 text-right sticky right-0 bg-gray-50 z-10 shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.1)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className={`hover:bg-green-50/30 transition-colors group ${selectedIds.includes(lead.id) ? 'bg-green-50/20' : ''}`}>
                  <td className="py-4 px-6">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500" 
                      checked={selectedIds.includes(lead.id)}
                      onChange={() => toggleOne(lead.id)}
                    />
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900">{lead.name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{lead.address}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700">
                      {lead.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600 font-medium">
                    {lead.district}, {lead.state}
                  </td>
                  <td className="py-4 px-6">
                    {lead.phone !== "N/A" ? (
                      <button onClick={() => handleCall(lead.phone)} className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                        📞 {lead.phone}
                      </button>
                    ) : (
                      <span className="text-gray-400">No Phone</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right space-x-3 sticky right-0 bg-white shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.05)] group-hover:bg-green-50/100 transition-colors">
                    <button onClick={() => setEditingLead(lead)} className="text-blue-500 font-bold hover:text-blue-700 text-xs uppercase tracking-wider">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(lead.role, lead.id)} className="text-red-500 font-bold hover:text-red-700 text-xs uppercase tracking-wider">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 font-medium">
                    No Google Data CRM leads found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Basic Edit Modal for Existing Leads */}
      {editingLead && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Google Lead</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Business Name</label>
                <input required type="text" value={editingLead.name} onChange={e => setEditingLead({...editingLead, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-green-500 outline-none font-medium text-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                <input required type="text" value={editingLead.phone} onChange={e => setEditingLead({...editingLead, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-green-500 outline-none font-medium text-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Address</label>
                <textarea required value={editingLead.address} onChange={e => setEditingLead({...editingLead, address: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-green-500 outline-none font-medium text-gray-900 h-24 resize-none"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Profile Image URL</label>
                <input type="text" value={editingLead.img || ""} onChange={e => setEditingLead({...editingLead, img: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-green-500 outline-none font-medium text-gray-900" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Hero Image Banner URL</label>
                <input type="text" value={editingLead.heroImg || ""} onChange={e => setEditingLead({...editingLead, heroImg: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-green-500 outline-none font-medium text-gray-900" placeholder="https://..." />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingLead(null)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-bold text-sm uppercase tracking-wider hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-green-500 text-white font-bold text-sm uppercase tracking-wider hover:bg-green-600">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
