"use client";

import React, { useState } from "react";
import { INDIAN_STATES, ODISHA_DISTRICTS, ODISHA_DISTRICT_BLOCKS } from "@/lib/locations";

export default function GooglePlacesImporterPage() {
  const [businessType, setBusinessType] = useState("Sambalpuri Handloom Store");
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("Odisha");
  const [district, setDistrict] = useState("");
  const [block, setBlock] = useState("");
  const [townVillage, setTownVillage] = useState("");
  const [pin, setPin] = useState("");

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [pageToken, setPageToken] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [targetRole, setTargetRole] = useState("vendor");

  const handleSearch = async (token?: string) => {
    const parts = [];
    if (townVillage) parts.push(townVillage);
    if (block) parts.push(block);
    if (district) parts.push(district);
    if (state) parts.push(state);
    if (country) parts.push(country);
    if (pin) parts.push(pin);
    
    const query = `${businessType} in ${parts.join(", ")}`.trim();
    
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, pageToken: token || undefined }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      if (token) {
        setResults(prev => [...prev, ...(data.places || [])]);
      } else {
        setResults(data.places || []);
        setSelectedIds(new Set());
      }
      setPageToken(data.nextPageToken || "");
    } catch (e: any) {
      alert("Failed to search: " + e.message);
    }
    setLoading(false);
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === results.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(results.map(r => r.id)));
    }
  };

  const handleImport = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Import ${selectedIds.size} listings to Vendors directory?`)) return;
    
    setImporting(true);
    try {
      const { collection, setDoc, doc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      
      const itemsToImport = results.filter(r => selectedIds.has(r.id));
      
      for (const item of itemsToImport) {
        const title = item.displayName?.text || "Unknown Store";
        // Generate a URL-friendly slug based on the name and last 5 chars of the Google ID
        const generatedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") + "-" + item.id.slice(-5).toLowerCase();

        const collectionName = targetRole === "weaver" ? "weavers" : "vendors";

        await setDoc(doc(db, collectionName, item.id), {
          title: title,
          slug: generatedSlug,
          address: item.formattedAddress || "",
          phone: item.nationalPhoneNumber || "",
          website: item.websiteUri || "",
          googleRating: item.rating || 0,
          googleReviewsCount: item.userRatingCount || 0,
          googlePlaceId: item.id,
          coordinates: item.location ? { lat: item.location.latitude, lng: item.location.longitude } : null,
          status: "unclaimed",
          country,
          state,
          district,
          block,
          townVillage,
          pin,
          img: item.photoUrl || "",
          desc: "This profile was collected from reliable source but Not verified. If you are the owner, please verify it.",
          isBhuliaVerified: false,
          listingType: targetRole,
          createdAt: Date.now()
        }, { merge: true });
      }
      alert(`Successfully imported ${selectedIds.size} stores with structured global data!`);
      setSelectedIds(new Set());
    } catch (e: any) {
      alert("Failed to import: " + e.message);
    }
    setImporting(false);
  };

  return (
    <div className="p-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-6xl animate-in fade-in">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Global Data Ingestion</h2>
        <p className="text-gray-500 mb-8">Strictly format the location query to ensure accurate data extraction into our standardized global schema.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <div className="lg:col-span-3 mb-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Business Type / Search Query</label>
            <input 
              type="text" 
              value={businessType} 
              onChange={e => setBusinessType(e.target.value)} 
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none font-bold text-lg"
            />
          </div>

          <div className="lg:col-span-1 mb-2">
            <label className="block text-xs font-bold text-[#0070F3] uppercase tracking-wider mb-2">Target Database Role</label>
            <select 
              value={targetRole} 
              onChange={e => setTargetRole(e.target.value)} 
              className="w-full bg-[#E6F0FF] border border-[#0070F3]/30 rounded-xl p-3 text-[#005BB5] focus:border-[#0070F3] outline-none font-bold text-sm"
            >
              <option value="vendor">Retail Shop (Vendor)</option>
              <option value="weaver">Master Weaver</option>
              <option value="raw_material">Raw Material Supplier</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Country</label>
            <select value={country} onChange={e => {
              setCountry(e.target.value);
              if (e.target.value !== "India") {
                setState(""); setDistrict("");
              }
            }} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none">
              <option value="India">India</option>
              <option value="International">International</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">State</label>
            {country === "India" ? (
              <select value={state} onChange={e => { setState(e.target.value); setDistrict(""); setBlock(""); }} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none">
                <option value="Odisha">Odisha</option>
                {INDIAN_STATES.filter(s => s !== "Odisha").map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="State/Province" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">District</label>
            {country === "India" && state === "Odisha" ? (
              <select value={district} onChange={e => { setDistrict(e.target.value); setBlock(""); }} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none">
                <option value="">Select District...</option>
                {ODISHA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            ) : (
              <input type="text" value={district} onChange={e => setDistrict(e.target.value)} placeholder="District/City" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Block</label>
            {country === "India" && state === "Odisha" && district && ODISHA_DISTRICT_BLOCKS[district] ? (
              <select value={block} onChange={e => setBlock(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none">
                <option value="">Select Block...</option>
                {ODISHA_DISTRICT_BLOCKS[district].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            ) : (
              <input type="text" value={block} onChange={e => setBlock(e.target.value)} placeholder="e.g. Attabira" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Town / Village</label>
            <input type="text" value={townVillage} onChange={e => setTownVillage(e.target.value)} placeholder="e.g. Bheden" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">PIN / ZIP Code</label>
            <input type="text" value={pin} onChange={e => setPin(e.target.value)} placeholder="e.g. 768038" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" />
          </div>
          
          <div className="lg:col-span-2 flex items-end">
            <button 
              onClick={() => handleSearch()} 
              disabled={loading}
              className="w-full bg-[#0070F3] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#005BB5] disabled:opacity-50 transition-colors shadow-md"
            >
              {loading ? "Searching Google Network..." : "Search Places"}
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={selectedIds.size === results.length && results.length > 0} 
                  onChange={toggleAll}
                  className="w-5 h-5 rounded border-gray-300 text-[#0070F3] focus:ring-[#0070F3]"
                />
                <span className="font-bold text-gray-900">{selectedIds.size} Selected</span>
              </div>
              <button 
                onClick={handleImport}
                disabled={importing || selectedIds.size === 0}
                className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {importing ? "Importing..." : "Import Selected to Database"}
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-100 rounded-xl max-h-[500px]">
              <table className="w-full text-left relative">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="p-4 w-12 bg-gray-50"></th>
                    <th className="p-4 font-bold bg-gray-50">Store Name</th>
                    <th className="p-4 font-bold bg-gray-50">Location</th>
                    <th className="p-4 font-bold bg-gray-50">Rating</th>
                    <th className="p-4 font-bold bg-gray-50">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {results.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(r.id)} 
                          onChange={() => toggleSelect(r.id)}
                          className="w-5 h-5 rounded border-gray-300 text-[#0070F3] focus:ring-[#0070F3]"
                        />
                      </td>
                      <td className="p-4 font-bold text-gray-900">{r.displayName?.text}</td>
                      <td className="p-4 text-sm text-gray-500 max-w-xs truncate" title={r.formattedAddress}>{r.formattedAddress}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">★</span>
                          <span className="font-bold text-gray-900">{r.rating || "N/A"}</span>
                          <span className="text-xs text-gray-400">({r.userRatingCount || 0})</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-900 font-mono">{r.nationalPhoneNumber || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pageToken && (
              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => handleSearch(pageToken)}
                  disabled={loading}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  {loading ? "Loading..." : "Load Next 20 Results"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
