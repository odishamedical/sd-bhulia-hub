"use client";

import React, { useState, useMemo } from "react";
import { useWeavers, useStores, useOrders } from "@/lib/db-hooks";

export default function UserManagementPage() {
  const { weavers } = useWeavers();
  const { stores } = useStores();
  const { orders } = useOrders();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [minVolume, setMinVolume] = useState("");
  const [productIdFilter, setProductIdFilter] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");

  // Generate unified mock users from ecosystem data
  const users = useMemo(() => {
    // Weavers
    const wList = weavers.map((w, idx) => ({
      id: w.id,
      name: w.title || `Weaver ${idx}`,
      role: "weaver",
      phone: w.phoneNumber || "N/A",
      state: "Odisha",
      district: ["Bargarh", "Sonepur", "Sambalpur"][idx % 3],
      country: "India",
      volume: Math.floor(Math.random() * 500000) + 50000, // Sales volume
      purchasedProductIds: [],
    }));

    // Shops/Franchises
    const sList = stores.map((s, idx) => ({
      id: s.id,
      name: s.title || `Store ${idx}`,
      role: "shop",
      phone: "N/A",
      state: ["Maharashtra", "Delhi", "Karnataka"][idx % 3],
      district: ["Mumbai", "New Delhi", "Bangalore"][idx % 3],
      country: "India",
      volume: Math.floor(Math.random() * 1000000) + 100000, // Purchase volume
      purchasedProductIds: [],
    }));

    // Extract Customers from Orders (Mocking since no useCustomers hook exists)
    const cList = Array.from(new Set(orders.map(o => o.customerName))).filter(Boolean).map((name, idx) => ({
      id: `cust_${idx}`,
      name: name as string,
      role: "customer",
      phone: orders.find(o => o.customerName === name)?.customerPhone || "N/A",
      state: ["Odisha", "West Bengal", "Gujarat"][idx % 3],
      district: ["Khurda", "Kolkata", "Surat"][idx % 3],
      country: "India",
      volume: orders.filter(o => o.customerName === name).reduce((acc, curr) => acc + (parseInt(curr.productPrice?.toString().replace(/[^0-9]/g, '') || "0")), 0), // Total spent
      purchasedProductIds: orders.filter(o => o.customerName === name).map(o => o.productId).filter(Boolean),
    }));

    return [...wList, ...sList, ...cList];
  }, [weavers, stores, orders]);

  // Apply Filters
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.id.toLowerCase().includes(searchTerm.toLowerCase()) || u.phone.includes(searchTerm);
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      const matchState = stateFilter === "all" || u.state === stateFilter;
      const matchDistrict = districtFilter === "all" || u.district === districtFilter;
      const matchVolume = minVolume === "" || u.volume >= parseInt(minVolume);
      const matchProduct = productIdFilter === "" || u.purchasedProductIds.includes(productIdFilter);

      return matchSearch && matchRole && matchState && matchDistrict && matchVolume && matchProduct;
    });
  }, [users, searchTerm, roleFilter, stateFilter, districtFilter, minVolume, productIdFilter]);

  const allStates = Array.from(new Set(users.map(u => u.state))).sort();
  const allDistricts = Array.from(new Set(users.map(u => u.district))).sort();

  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      const headers = ["ID", "Name", "Role", "Phone/WhatsApp", "State", "District", "Country", "Lifetime Volume"];
      const rows = filteredUsers.map(u => [
        u.id,
        `"${u.name.replace(/"/g, '""')}"`,
        u.role,
        u.phone,
        u.state,
        u.district,
        u.country,
        u.volume
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `bhulia_crm_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 1000);
  };

  const handleSendBroadcast = () => {
    if (!broadcastMessage.trim()) return alert("Please enter a message.");
    alert(`Initiating API Broadcast to ${filteredUsers.length} users via WhatsApp/Email API...`);
    setShowBroadcastModal(false);
    setBroadcastMessage("");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Ecosystem Hub</h1>
          <p className="text-gray-500 mt-2 font-medium">Unified management for Customers, Weavers, and Retail Shops.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowBroadcastModal(true)}
            disabled={filteredUsers.length === 0}
            className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all disabled:opacity-50 shadow-sm flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Broadcast
          </button>
          <button 
            onClick={handleExportCSV}
            disabled={isExporting || filteredUsers.length === 0}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all disabled:opacity-50 shadow-sm flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            {isExporting ? "Exporting..." : "Export CRM"}
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all flex items-center gap-2 ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>
        </div>
      </header>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Advanced Filters Sidebar */}
        {showFilters && (
          <div className="xl:w-80 shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <h3 className="text-sm font-black text-gray-900 mb-5 flex items-center gap-2 uppercase tracking-wider">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                Role Filter
              </h3>
              <div className="space-y-2">
                {['all', 'customer', 'weaver', 'shop'].map(role => (
                  <label key={role} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-100 transition-all">
                    <input type="radio" name="role" checked={roleFilter === role} onChange={() => setRoleFilter(role)} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                    <span className="text-sm font-bold text-gray-700 capitalize">{role === 'all' ? 'Entire Ecosystem' : role + 's'}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <h3 className="text-sm font-black text-gray-900 mb-5 flex items-center gap-2 uppercase tracking-wider">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Geography
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">State / Region</label>
                  <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                    <option value="all">All States (Pan-India)</option>
                    {allStates.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">District</label>
                  <select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                    <option value="all">All Districts</option>
                    {allDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <h3 className="text-sm font-black text-gray-900 mb-5 flex items-center gap-2 uppercase tracking-wider">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                Commerce & Behavior
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Min. Purchase/Sales Vol (₹)</label>
                  <input type="number" placeholder="e.g. 50000" value={minVolume} onChange={e => setMinVolume(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Purchased Product ID</label>
                  <input type="text" placeholder="e.g. PRD-8273" value={productIdFilter} onChange={e => setProductIdFilter(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none font-mono" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Data Grid */}
        <div className="flex-1 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
            <div className="relative w-full max-w-xl">
              <input 
                type="text" 
                placeholder="Search by Name, Phone, or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-bold transition-all shadow-sm"
              />
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <div className="text-sm font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 whitespace-nowrap">
              {filteredUsers.length} Users Found
            </div>
          </div>

          <div className="flex-1 overflow-auto p-0">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 bg-white shadow-sm z-10">
                <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-100">
                  <th className="py-4 px-6 font-bold">User Identity</th>
                  <th className="py-4 px-6 font-bold">Role</th>
                  <th className="py-4 px-6 font-bold">Location</th>
                  <th className="py-4 px-6 font-bold text-right">Lifetime Vol (₹)</th>
                  <th className="py-4 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900 text-base">{user.name}</div>
                      <div className="text-xs text-gray-500 font-mono mt-1">ID: {user.id} • {user.phone}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                        user.role === 'weaver' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        user.role === 'shop' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-700">{user.district}</div>
                      <div className="text-xs text-gray-500">{user.state}, {user.country}</div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="font-black text-gray-900">₹{user.volume.toLocaleString()}</div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all">
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-24 text-center text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                      </div>
                      <div className="font-bold text-lg text-gray-900 mb-1">No users found</div>
                      <div className="text-sm font-medium">Try adjusting your advanced filters or search term.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl border border-gray-100">
            <h3 className="text-2xl font-black text-gray-900 mb-2">Broadcast Message</h3>
            <p className="text-sm font-medium text-gray-500 mb-6">Send an instant WhatsApp/Email broadcast to the {filteredUsers.length} filtered users.</p>
            <textarea 
              rows={4}
              value={broadcastMessage}
              onChange={e => setBroadcastMessage(e.target.value)}
              placeholder="Enter your message here..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none mb-6"
            ></textarea>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowBroadcastModal(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={handleSendBroadcast} className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-sm">Send Broadcast</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
