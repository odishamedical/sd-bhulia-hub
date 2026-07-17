"use client";

import React, { useState, useMemo } from "react";
import { useWeavers, useStores } from "@/lib/db-hooks";
import { db } from "@/lib/firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";

export default function AdminGoogleCRM() {
  const { weavers, loading: wLoading } = useWeavers(500);
  const { stores, loading: sLoading } = useStores(500);
  const loading = wLoading || sLoading;
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const crmLeads = useMemo(() => {
    const wList = weavers.filter(w => w.source === "google_places").map(w => ({
      id: w.id,
      name: w.title,
      role: "weaver",
      phone: w.phoneNumber || "N/A",
      state: String(w.address || "").split(",")?.[2]?.split("-")?.[0]?.trim() || w.state || "N/A",
      district: String(w.address || "").split(",")?.[1]?.trim() || w.district || "N/A",
      address: w.address,
      status: w.status || "approved",
      website: w.website || "N/A",
      rating: w.rating || "N/A",
    }));

    const sList = stores.filter(s => s.source === "google_places").map(s => ({
      id: s.id,
      name: s.title,
      role: "store",
      phone: s.phoneNumber || "N/A",
      state: String(s.address || "").split(",")?.[2]?.split("-")?.[0]?.trim() || s.state || "N/A",
      district: String(s.address || "").split(",")?.[1]?.trim() || s.district || "N/A",
      address: s.address,
      status: s.status || "approved",
      website: s.website || "N/A",
      rating: s.rating || "N/A",
    }));

    return [...wList, ...sList];
  }, [weavers, stores]);

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

  const handleDelete = async (role: string, id: string) => {
    if (confirm("Delete this lead permanently?")) {
      try {
        const collectionName = role === "weaver" ? "weavers" : "stores";
        await deleteDoc(doc(db, collectionName, id));
        alert("Lead deleted.");
      } catch (e) {
        alert("Error deleting lead.");
      }
    }
  };

  const handleCall = (phone: string) => {
    if (phone === "N/A") return alert("No phone number available");
    window.open(`tel:${phone}`);
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold animate-pulse">Loading CRM Data...</div>;

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
      </header>

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
          <option value="all">All Roles</option>
          <option value="weaver">Weavers</option>
          <option value="store">Stores</option>
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="py-4 px-6">Business Name</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6">Contact</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-green-50/30 transition-colors">
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
                  <td className="py-4 px-6 text-right space-x-3">
                    <button onClick={() => handleDelete(lead.role, lead.id)} className="text-red-500 font-bold hover:text-red-700 text-xs uppercase tracking-wider">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 font-medium">
                    No Google Data CRM leads found matching your criteria.
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
