"use client";

import React, { useState, useMemo } from "react";
import { useWeavers, useVendors, useOrders, useCustomers, useAuthUsers, useResellers, addWeaver, addVendor, addCustomer, addReseller, deleteUserRecord, suspendUserRecord, convertUserRole, updateDocumentStatus } from "@/lib/db-hooks";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { firebaseConfig, db } from "@/lib/firebase";
import { setDoc, doc, runTransaction } from "firebase/firestore";

export default function UserManagementPage() {
  const { weavers } = useWeavers(200);
  const { vendors: stores } = useVendors(200);
  const { orders } = useOrders(200);
  const { customers } = useCustomers(200);
  const { authUsers } = useAuthUsers();
  const { resellers } = useResellers(200);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [subStatusFilter, setSubStatusFilter] = useState("all");
  const [minVolume, setMinVolume] = useState("");
  const [productIdFilter, setProductIdFilter] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<any>(null);
  
  const [newUserRole, setNewUserRole] = useState("customer");
  const [newUserDuration, setNewUserDuration] = useState("permanent");
  const [newUserStockLimit, setNewUserStockLimit] = useState("limited");
  
  // New User Form State
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserWhatsapp, setNewUserWhatsapp] = useState("");
  const [newUserCountry, setNewUserCountry] = useState("India");
  const [newUserState, setNewUserState] = useState("");
  const [newUserDistrict, setNewUserDistrict] = useState("");
  const [newUserAddress, setNewUserAddress] = useState("");
  const [newUserPin, setNewUserPin] = useState("");
  const [allowDirectContact, setAllowDirectContact] = useState(false);
  const [newUserCanSellWholesale, setNewUserCanSellWholesale] = useState(false);

  // SaaS Configuration State
  const [newSubStatus, setNewSubStatus] = useState("free_trial");
  const [newSubLimit, setNewSubLimit] = useState("10");
  const [newSubCommission, setNewSubCommission] = useState("15");
  const [newSubDuration, setNewSubDuration] = useState("1"); // months

  // Generate unified mock users from ecosystem data
  const users = useMemo(() => {
    // Weavers
    const wList = weavers.map((w, idx) => ({
      id: w.id,
      name: w.title || `Weaver ${idx}`,
      role: "weaver",
      phone: w.phoneNumber || "N/A",
      state: w.address?.split(",")?.[2]?.trim()?.split("-")?.[0]?.trim() || "Odisha",
      district: w.address?.split(",")?.[1]?.trim() || "Sambalpur",
      volume: Math.floor(Math.random() * 500000) + 50000,
      purchasedProductIds: [] as any[],
      subStatus: w.subscription?.status || "free_trial",
      whatsapp: w.whatsapp || "N/A",
      address: w.address || "N/A",
      email: authUsers.find(u => u.id === w.id)?.email || "N/A",
      country: "India",
      referralId: `SDW-${w.id.substring(0,6).toUpperCase()}`,
      slug: w.slug,
      isAutoApproved: w.isAutoApproved,
      maxProductsAllowed: w.subscription?.uploadLimit,
    }));

    // Shops/Franchises
    const sList = stores.map((s, idx) => ({
      id: s.id,
      name: s.title || `Store ${idx}`,
      role: "shop",
      phone: "N/A",
      state: ["Maharashtra", "Delhi", "Karnataka"][idx % 3],
      district: ["Mumbai", "New Delhi", "Bangalore"][idx % 3],
      volume: Math.floor(Math.random() * 1000000) + 100000,
      purchasedProductIds: [] as any[],
      subStatus: s.subscription?.status || "free_trial",
      whatsapp: s.whatsapp || "N/A",
      address: s.address || "N/A",
      email: authUsers.find(u => u.id === s.id)?.email || "N/A",
      country: "India",
      referralId: `SDS-${s.id.substring(0,6).toUpperCase()}`,
      slug: s.slug,
      isAutoApproved: s.isAutoApproved,
      maxProductsAllowed: s.productLimit,
    }));

    // Extract Customers from Orders (Mocking legacy customers from purchases)
    const cList = Array.from(new Set(orders.map(o => o.customerName))).filter(Boolean).map((name, idx) => ({
      id: `order_cust_${idx}`,
      name: name as string,
      role: "customer",
      phone: orders.find(o => o.customerName === name)?.customerPhone || "N/A",
      state: ["Odisha", "West Bengal", "Gujarat"][idx % 3],
      district: ["Khurda", "Kolkata", "Surat"][idx % 3],
      country: "India",
      volume: orders.filter(o => o.customerName === name).reduce((acc, curr) => acc + (parseInt(curr.productPrice?.toString().replace(/[^0-9]/g, '') || "0")), 0), // Total spent
      purchasedProductIds: orders.filter(o => o.customerName === name).map(o => o.productId).filter(Boolean),
      whatsapp: orders.find(o => o.customerName === name)?.customerWhatsapp || "N/A",
      address: orders.find(o => o.customerName === name)?.customerAddress || "N/A",
      email: "N/A",
      referralId: `SDC-${String(`order_cust_${idx}`).substring(0,6).toUpperCase()}`,
    }));

    // Explicitly Registered Customers (May not have purchased yet)
    const registeredCustomersList = customers.map((c) => ({
      id: c.id,
      name: c.name || "Unknown Customer",
      role: "customer",
      phone: c.phone || "N/A",
      state: c.state || "N/A",
      district: c.district || "N/A",
      country: c.country || "India",
      volume: 0,
      purchasedProductIds: [] as any[],
      whatsapp: c.whatsapp || "N/A",
      address: c.address || "N/A",
      email: c.email || authUsers.find(u => u.id === c.id || u.id === c.userId)?.email || "N/A",
      referralId: `SDC-${c.id.substring(0,6).toUpperCase()}`,
    }));

    // General Identity Provider Users (e.g. Gmail login)
    const identityUsersList = authUsers.map((u) => ({
      id: u.id,
      name: u.name || u.email?.split("@")[0] || "Auth User",
      role: u.role || "user",
      phone: "N/A",
      state: "N/A",
      district: "N/A",
      country: "N/A",
      volume: 0,
      purchasedProductIds: [] as any[],
      whatsapp: "N/A",
      address: "N/A",
      email: u.email || "N/A",
      referralId: `SDU-${u.id.substring(0,6).toUpperCase()}`,
    }));

    // Resellers (Marketing Agents)
    const resellersList = resellers.map((r) => ({
      id: r.id,
      name: r.name || "Unknown Reseller",
      role: "reseller",
      phone: r.phone || "N/A",
      state: r.state || "N/A",
      district: r.district || "N/A",
      country: r.country || "India",
      volume: 0,
      purchasedProductIds: [] as any[],
      whatsapp: r.whatsapp || "N/A",
      address: r.address || "N/A",
      email: r.email || "N/A",
      referralId: r.referralId || "N/A",
      tier: r.tier || "Bronze",
      commissionRate: r.commissionRate || 10,
    }));

    // Deduplicate logic: prioritize higher roles over generic 'user' to prevent the exact same person from appearing 3 times
    const allCombined = [...wList, ...sList, ...resellersList, ...registeredCustomersList, ...cList, ...identityUsersList];
    const uniqueUsersMap = new Map();
    
    for (const u of allCombined) {
      if (!uniqueUsersMap.has(u.id)) {
        uniqueUsersMap.set(u.id, u);
      } else {
        // If the user is already in the map but the current entry is a generic 'user', skip it
        const existing = uniqueUsersMap.get(u.id);
        if (existing.role === 'user' && u.role !== 'user') {
          uniqueUsersMap.set(u.id, u); // Override with the specific profile
        }
      }
    }
    
    return Array.from(uniqueUsersMap.values());
  }, [weavers, stores, orders, customers, authUsers, resellers]);

  // Apply Filters
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.id.toLowerCase().includes(searchTerm.toLowerCase()) || u.phone.includes(searchTerm) || (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      const matchState = stateFilter === "all" || u.state === stateFilter;
      const matchDistrict = districtFilter === "all" || u.district === districtFilter;
      const matchVolume = minVolume === "" || u.volume >= parseInt(minVolume);
      const matchProduct = productIdFilter === "" || u.purchasedProductIds.includes(productIdFilter);
      const matchSubStatus = subStatusFilter === "all" || u.subStatus === subStatusFilter;

      return matchSearch && matchRole && matchState && matchDistrict && matchVolume && matchProduct && matchSubStatus;
    });
  }, [users, searchTerm, roleFilter, stateFilter, districtFilter, minVolume, productIdFilter, subStatusFilter]);

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

  const handleCreateUser = async () => {
    if (!newUserName.trim()) return alert("Please provide a Full Name.");
    if (!newUserEmail.trim() || !newUserPassword.trim()) return alert("Email and Password are required to create a login.");
    
    // Generate Serial Slug starting from 303
    let generatedSlug = "303";
    try {
      const counterRef = doc(db, "system", "slug_counters");
      generatedSlug = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        const currentCount = counterDoc.exists() ? (counterDoc.data()[newUserRole] || 303) : 303;
        const nextCount = currentCount + 1;
        transaction.set(counterRef, { [newUserRole]: nextCount }, { merge: true });
        return currentCount.toString();
      });
    } catch (e) {
      // Fallback
      generatedSlug = (303 + Math.floor(Math.random() * 9000)).toString();
    }

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + parseInt(newSubDuration));

    const subscriptionData = {
      status: newSubStatus as "active" | "free_trial" | "expired",
      uploadLimit: parseInt(newSubLimit),
      commissionRate: parseInt(newSubCommission),
      expiresAt: expiryDate.toISOString(),
    };

    try {
      // 1. Create the Firebase Auth user via secondary app (so admin doesn't get logged out)
      const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp" + Date.now());
      const secondaryAuth = getAuth(secondaryApp);
      const userCred = await createUserWithEmailAndPassword(secondaryAuth, newUserEmail, newUserPassword);
      const newUid = userCred.user.uid;
      await signOut(secondaryAuth); // Sign out of the secondary app
      
      // 2. Create the Users collection document
      await setDoc(doc(db, "users", newUid), {
        name: newUserName,
        email: newUserEmail,
        role: newUserRole === "shop" ? "vendor" : newUserRole,
        applicationStatus: "approved",
        createdAt: new Date().toISOString()
      });

      if (newUserRole === "weaver") {
        await addWeaver({
          slug: generatedSlug,
          title: newUserName,
          desc: `Master weaver specializing in handlooms from ${newUserDistrict || newUserState || "Odisha"}.`,
          img: "/bhulia-hero.png",
          badge: "Odishan Master Weaver",
          phone: newUserPhone || "N/A",
          whatsapp: newUserWhatsapp || "N/A",
          address: `${newUserAddress}, ${newUserDistrict}, ${newUserState} - ${newUserPin}`,
          tier: "Silver",
          status: "approved",
          layoutConfig: {
            sidebarPosition: "Left",
            heroEnabled: true,
            gridStyle: "3-Column",
          },
          canSellWholesale: newUserCanSellWholesale,
          subscription: subscriptionData,
        }, newUid);
        alert(`Master Weaver Profile Generated!\nPublic Link: bhulia.com/weaver/${generatedSlug}`);
      } else if (newUserRole === "shop") {
        await addVendor({
          slug: generatedSlug,
          title: newUserName,
          desc: `Premium handloom store located in ${newUserDistrict || newUserState || "Odisha"}.`,
          img: "/bhulia-hero.png",
          badge: "Verified Vendor",
          phone: newUserPhone || "N/A",
          whatsapp: newUserWhatsapp || "N/A",
          address: `${newUserAddress}, ${newUserDistrict}, ${newUserState} - ${newUserPin}`,
          tier: "Silver",
          status: "approved",
          productLimit: parseInt(newSubLimit),
          canSellWholesale: newUserCanSellWholesale,
          subscription: subscriptionData,
        }, newUid);
        alert(`B2B Vendor Profile Generated!\nPublic Link: bhulia.com/store/${generatedSlug}`);
      } else if (newUserRole === "reseller") {
        await addReseller({
          name: newUserName,
          email: newUserEmail || "N/A",
          phone: newUserPhone || "N/A",
          whatsapp: newUserWhatsapp || "N/A",
          country: newUserCountry || "India",
          state: newUserState || "N/A",
          district: newUserDistrict || "N/A",
          address: newUserAddress || "N/A",
          pin: newUserPin || "N/A",
          commissionRate: parseInt(newSubCommission) || 15,
          status: "active",
          isB2BApproved: true,
        }, newUid);
        alert(`Reseller Created Successfully in Database.`);
      } else {
        await addCustomer({
          name: newUserName,
          email: newUserEmail || "N/A",
          phone: newUserPhone || "N/A",
          whatsapp: newUserWhatsapp || "N/A",
          country: newUserCountry || "India",
          state: newUserState || "N/A",
          district: newUserDistrict || "N/A",
          address: newUserAddress || "N/A",
          pin: newUserPin || "N/A",
        }, newUid);
        alert(`Customer Created Successfully in Database.`);
      }
      
      // Reset Modal
      setShowAddUserModal(false);
      setNewUserName("");
      setNewUserPhone("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserWhatsapp("");
    } catch (e) {
      alert("Error adding customer to database.");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserForDetails) return;
    
    // Prevent accidental deletion of super admins
    if (selectedUserForDetails.role === "super_admin") {
      return alert("Action denied: Cannot delete super administrator account.");
    }

    const confirmDelete = window.confirm(`Are you sure you want to permanently delete ${selectedUserForDetails.name}? This action cannot be undone.`);
    if (!confirmDelete) return;

    const res = await deleteUserRecord(selectedUserForDetails.role, selectedUserForDetails.id);
    if (res.success) {
      alert(`${selectedUserForDetails.name} has been successfully deleted.`);
      setSelectedUserForDetails(null);
    } else {
      alert(`Failed to delete user. They might be a mock data record or there was a server error.`);
    }
  };

  const handleSuspendUser = async () => {
    if (!selectedUserForDetails) return;
    
    if (selectedUserForDetails.role === "super_admin") {
      return alert("Action denied: Cannot suspend super administrator account.");
    }

    const confirmSuspend = window.confirm(`Are you sure you want to SUSPEND ${selectedUserForDetails.name}? They will be immediately blocked from logging in or registering again.`);
    if (!confirmSuspend) return;

    const res = await suspendUserRecord(selectedUserForDetails.role, selectedUserForDetails.id);
    if (res.success) {
      alert(`${selectedUserForDetails.name} has been successfully suspended and blacklisted.`);
      setSelectedUserForDetails(null);
    } else {
      alert(`Failed to suspend user.`);
    }
  };

  const handleConvertRole = async (newRole: "weaver" | "shop" | "reseller" | "customer") => {
    if (!selectedUserForDetails) return;
    
    if (selectedUserForDetails.role !== 'user') {
      return alert("This feature is currently intended to convert general SSO users. For existing profiles, please edit their profile instead.");
    }

    const confirmConvert = window.confirm(`Are you sure you want to promote ${selectedUserForDetails.name} to a ${newRole.toUpperCase()}? This will create a basic profile for them in the system.`);
    if (!confirmConvert) return;

    const res = await convertUserRole(selectedUserForDetails.id, selectedUserForDetails.email, selectedUserForDetails.name, newRole);
    if (res.success) {
      alert(`Success! ${selectedUserForDetails.name} has been upgraded to ${newRole}.`);
      setSelectedUserForDetails({ ...selectedUserForDetails, role: newRole });
    } else {
      alert(`Failed to convert user role.`);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Ecosystem Hub</h1>
          <p className="text-gray-800 mt-2 font-semibold">Unified management for Customers, Weavers, and Retail Shops.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowAddUserModal(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
            Add New User
          </button>
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
                {['all', 'user', 'customer', 'reseller', 'weaver', 'shop'].map(role => (
                  <label key={role} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-100 transition-all">
                    <input type="radio" name="role" checked={roleFilter === role} onChange={() => setRoleFilter(role)} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                    <span className="text-sm font-bold text-gray-700 capitalize">{
                      role === 'all' ? 'Entire Ecosystem' :
                      role === 'user' ? 'General Users' :
                      role + 's'
                    }</span>
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
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Subscription Status</label>
                  <select value={subStatusFilter} onChange={e => setSubStatusFilter(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                    <option value="all">All Subscriptions</option>
                    <option value="active">Active (Paid)</option>
                    <option value="free_trial">Free Trial</option>
                    <option value="expired">Expired / Expiring Soon</option>
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
        <div className="flex-1 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col">
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

          <div className="flex-1 overflow-x-auto p-0">
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
                {filteredUsers.map((user, idx) => (
                  <tr key={`${user.id}-${user.role}-${idx}`} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900 text-base">{user.name}</div>
                      <div className="text-xs text-gray-500 font-mono mt-1">ID: {user.id} • {user.phone}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                        user.role === 'weaver' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        user.role === 'shop' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        user.role === 'reseller' ? 'bg-green-50 text-green-700 border-green-200' :
                        user.role === 'customer' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-700">{user.district}</div>
                      <div className="text-xs text-gray-500">{user.state}, {(user as any).country}</div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="font-black text-gray-900">₹{user.volume.toLocaleString()}</div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => setSelectedUserForDetails(user)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all">
                        View CRM Details
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
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl border border-gray-100 relative">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4 sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-black text-gray-900">Send Notification Broadcast</h3>
              <div className="flex gap-2">
                <button onClick={() => setShowBroadcastModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all">Cancel</button>
                <button onClick={handleSendBroadcast} className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-sm">Send</button>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mb-6 font-medium">This message will be sent via WebSocket to all currently active users in the ecosystem. It will appear as a toast notification on their screens.</p>
            
            <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-widest">Message Content</label>
            <textarea 
              rows={4}
              value={broadcastMessage}
              onChange={e => setBroadcastMessage(e.target.value)}
              placeholder="Enter your message here..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none mb-6"
            ></textarea>
          </div>
        </div>
      )}

      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-4xl shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-4 border-b border-gray-100 pt-2">
              <h3 className="text-2xl font-black text-gray-900">Create New Ecosystem User</h3>
              <div className="flex gap-2">
                <button onClick={() => setShowAddUserModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all">Cancel</button>
                <button onClick={handleCreateUser} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm">Save</button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Left Column: Core & Contact */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-[#C5A059] border-b border-gray-100 pb-2">Core Profile</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">User Role</label>
                    <select value={newUserRole} onChange={e => {
                        setNewUserRole(e.target.value);
                        if (e.target.value === 'weaver') {
                          setNewUserCountry("India");
                          setNewUserState("Odisha");
                          setNewUserDistrict("");
                        }
                      }} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none">
                      <option value="customer">Retail Customer</option>
                      <option value="reseller">Reseller (Marketing Agent)</option>
                      <option value="weaver">Sambalpuri Weaver</option>
                      <option value="shop">Shop</option>
                      <option value="store">Store</option>
                      <option value="vendor">Vendor / B2B</option>
                      <option value="wholesaler">Wholesaler</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Full Name / Entity Name</label>
                    <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Name" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Email Address (Used for Login)</label>
                    <input type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="Email" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Password</label>
                    <input type="text" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} placeholder="Temporary Password" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Phone Number</label>
                    <input type="tel" value={newUserPhone} onChange={e => setNewUserPhone(e.target.value)} placeholder="+91" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">WhatsApp Number</label>
                    <input type="tel" value={newUserWhatsapp} onChange={e => setNewUserWhatsapp(e.target.value)} placeholder="+91" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
                  </div>
                </div>

                {newUserRole !== 'customer' && (
                  <>
                    <div className="pt-2">
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Profile Image (Square)</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 transition-all">
                        <span className="text-sm font-bold text-blue-600">Click to Upload Avatar</span>
                        <p className="text-[10px] text-gray-400 mt-1">Recommended: 400x400px (JPG/PNG)</p>
                      </div>
                    </div>
                      <label className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-100 rounded-xl cursor-pointer mt-4">
                        <input type="checkbox" checked={allowDirectContact} onChange={e => setAllowDirectContact(e.target.checked)} className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded" />
                        <div>
                          <div className="text-sm font-bold text-orange-900 leading-tight">Special Provision: Unmask Contact</div>
                          <div className="text-xs text-orange-700 mt-0.5">By default, phone numbers are masked on public pages. Check this to allow direct customer calls/WhatsApp.</div>
                        </div>
                      </label>
                      
                      {(newUserRole === 'weaver' || newUserRole === 'shop') && (
                        <label className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-100 rounded-xl cursor-pointer mt-4">
                          <input type="checkbox" checked={newUserCanSellWholesale} onChange={e => setNewUserCanSellWholesale(e.target.checked)} className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded" />
                          <div>
                            <div className="text-sm font-bold text-purple-900 leading-tight">B2B Wholesale Privileges</div>
                            <div className="text-xs text-purple-700 mt-0.5">Allow this vendor to upload products with hidden B2B commercial prices.</div>
                          </div>
                        </label>
                      )}
                    </>
                  )}
              </div>

              {/* Right Column: Geography & Admin Limits */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-[#C5A059] border-b border-gray-100 pb-2">Geography & Access</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Country</label>
                    {newUserRole === 'weaver' ? (
                      <input type="text" value="India" disabled className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-sm font-medium outline-none opacity-60" />
                    ) : (
                      <input type="text" value={newUserCountry} onChange={e => setNewUserCountry(e.target.value)} placeholder="e.g. India, USA" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">State</label>
                    {newUserRole === 'weaver' ? (
                      <input type="text" value="Odisha" disabled className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-sm font-medium outline-none opacity-60" />
                    ) : (
                      <input type="text" value={newUserState} onChange={e => setNewUserState(e.target.value)} placeholder="e.g. Maharashtra, California" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">District / City</label>
                  {newUserRole === 'weaver' ? (
                    <select value={newUserDistrict} onChange={e => setNewUserDistrict(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none">
                      <option value="">Select District</option>
                      {["Bargarh", "Sonepur", "Sambalpur", "Bolangir", "Nuapada", "Boudh", "Jharsuguda"].map(d => (
                        <option key={d} value={d}>{d} (Bhulia.com-Approved)</option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" value={newUserDistrict} onChange={e => setNewUserDistrict(e.target.value)} placeholder="e.g. Mumbai, New York" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Complete Address</label>
                    <input type="text" value={newUserAddress} onChange={e => setNewUserAddress(e.target.value)} placeholder="Street, landmark..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">PIN Code</label>
                    <input type="text" value={newUserPin} onChange={e => setNewUserPin(e.target.value)} placeholder="PIN" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-[#C5A059] mb-4">SaaS & Revenue Configuration</h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Subscription Status</label>
                      <select value={newSubStatus} onChange={e => setNewSubStatus(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none">
                        <option value="free_trial">Free Trial / Promotion</option>
                        <option value="active">Active (Paid)</option>
                        <option value="expired">Expired / Locked</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Duration (Months)</label>
                      <select value={newSubDuration} onChange={e => setNewSubDuration(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none">
                        <option value="1">1 Month</option>
                        <option value="3">3 Months</option>
                        <option value="12">12 Months (1 Year)</option>
                        <option value="1200">Lifetime</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Product Upload Limit</label>
                      <select value={newSubLimit} onChange={e => setNewSubLimit(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none">
                        <option value="0">0 (Locked - View Only)</option>
                        <option value="10">10 (Trial Limit)</option>
                        <option value="20">20 Products</option>
                        <option value="50">50 Products</option>
                        <option value="9999">Unlimited (Paid)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Commission Rate (%)</label>
                      <select value={newSubCommission} onChange={e => setNewSubCommission(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none">
                        <option value="0">0% (Zero Commission)</option>
                        <option value="5">5% (Premium Standard)</option>
                        <option value="10">10%</option>
                        <option value="15">15% (Free Tier Penalty)</option>
                        <option value="20">20%</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedUserForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl border border-gray-100">
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-1">{selectedUserForDetails.name}</h3>
                <div className="text-xs text-gray-500 font-mono uppercase tracking-widest flex items-center gap-2">
                  ID: {selectedUserForDetails.id} • ROLE: {selectedUserForDetails.role}
                  {selectedUserForDetails.role === 'user' && (
                    <select 
                      onChange={(e) => {
                        if(e.target.value) handleConvertRole(e.target.value as any);
                        e.target.value = "";
                      }}
                      className="ml-2 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] py-1 px-2 rounded-lg font-bold outline-none cursor-pointer"
                    >
                      <option value="">+ Promote User</option>
                      <option value="weaver">To Weaver</option>
                      <option value="shop">To Retail Store</option>
                      <option value="reseller">To Reseller</option>
                      <option value="customer">To Customer</option>
                    </select>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedUserForDetails(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {(selectedUserForDetails.role === 'weaver' || selectedUserForDetails.role === 'shop') && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex flex-col md:flex-row md:items-center gap-6">
                <div>
                  <h4 className="text-sm font-black text-orange-900 uppercase tracking-widest flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                    Admin God Mode
                  </h4>
                  <p className="text-xs text-orange-800 mt-1">Override system limits for this user.</p>
                </div>
                <div className="flex-1 flex gap-4 items-center justify-end">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-orange-900 uppercase">Max Products Allowed:</label>
                    <input 
                      type="number" 
                      defaultValue={selectedUserForDetails.maxProductsAllowed || 10}
                      onBlur={async (e) => {
                        const val = parseInt(e.target.value);
                        if(confirm(`Update product upload limit to ${val}?`)) {
                          const collectionName = selectedUserForDetails.role === 'weaver' ? 'weavers' : 'vendors';
                          if (selectedUserForDetails.role === 'weaver') {
                            await updateDocumentStatus(collectionName, selectedUserForDetails.id, { "subscription.uploadLimit": val });
                          } else {
                            await updateDocumentStatus(collectionName, selectedUserForDetails.id, { "productLimit": val, "subscription.uploadLimit": val });
                          }
                          alert("Limit updated successfully!");
                        }
                      }}
                      className="w-20 bg-white border border-orange-300 rounded-lg p-2 text-sm font-bold text-center outline-none" 
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 border border-orange-300 rounded-lg hover:bg-orange-100 transition-colors">
                    <input 
                      type="checkbox" 
                      defaultChecked={selectedUserForDetails.isAutoApproved}
                      onChange={async (e) => {
                        const checked = e.target.checked;
                        if(confirm(`${checked ? 'Enable' : 'Disable'} VIP Auto-Approval for this seller?`)) {
                          const collectionName = selectedUserForDetails.role === 'weaver' ? 'weavers' : 'vendors';
                          await updateDocumentStatus(collectionName, selectedUserForDetails.id, { isAutoApproved: checked });
                          alert(`Auto-approval ${checked ? 'enabled' : 'disabled'}!`);
                        } else {
                          e.target.checked = !checked;
                        }
                      }}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded" 
                    />
                    <span className="text-xs font-bold text-orange-900 uppercase">VIP Auto-Approval</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer bg-purple-50 px-3 py-2 border border-purple-300 rounded-lg hover:bg-purple-100 transition-colors">
                    <input 
                      type="checkbox" 
                      defaultChecked={selectedUserForDetails.canSellWholesale}
                      onChange={async (e) => {
                        const checked = e.target.checked;
                        if(confirm(`${checked ? 'Enable' : 'Disable'} B2B Wholesale Privileges for this seller?`)) {
                          const collectionName = selectedUserForDetails.role === 'weaver' ? 'weavers' : 'vendors';
                          await updateDocumentStatus(collectionName, selectedUserForDetails.id, { canSellWholesale: checked });
                          alert(`Wholesale Privileges ${checked ? 'enabled' : 'disabled'}!`);
                        } else {
                          e.target.checked = !checked;
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded" 
                    />
                    <span className="text-xs font-bold text-purple-900 uppercase">B2B Privileges</span>
                  </label>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Phone Number</div>
                  <div className="text-sm font-bold text-gray-900">{selectedUserForDetails.phone}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">WhatsApp</div>
                  <div className="text-sm font-bold text-gray-900">{selectedUserForDetails.whatsapp}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Email Address</div>
                  <div className="text-sm font-bold text-gray-900">{selectedUserForDetails.email}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Geography</div>
                  <div className="text-sm font-bold text-gray-900">{[selectedUserForDetails.district, selectedUserForDetails.state, selectedUserForDetails.country].filter(Boolean).filter(s => s !== "N/A").join(", ") || "N/A"}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Full Address</div>
                  <div className="text-sm font-bold text-gray-900 leading-relaxed">{selectedUserForDetails.address}</div>
                </div>
                {selectedUserForDetails.role === 'reseller' && (
                  <>
                    <div className="bg-green-50 p-4 rounded-2xl border border-green-100 mb-4">
                      <div className="text-[10px] uppercase tracking-widest text-green-700 font-bold mb-1">Referral ID (Shareable)</div>
                      <div className="text-xl font-black text-green-900 font-mono tracking-widest">{selectedUserForDetails.referralId}</div>
                    </div>
                    <div className="flex gap-4 mb-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Commission Tier</div>
                        <div className="text-sm font-bold text-gray-900">{selectedUserForDetails.tier}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Base Rate</div>
                        <div className="text-sm font-bold text-gray-900">{selectedUserForDetails.commissionRate}%</div>
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Lifetime Volume</div>
                  <div className="text-sm font-black text-green-600">₹{selectedUserForDetails.volume.toLocaleString()}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              {selectedUserForDetails.role !== 'customer' && selectedUserForDetails.slug && (
                <button onClick={() => window.open(`/${selectedUserForDetails.role === 'shop' ? 'store' : selectedUserForDetails.role}/${selectedUserForDetails.slug}`, '_blank')} className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-sm">
                  View Public Profile
                </button>
              )}
              <button onClick={() => window.open(`https://api.whatsapp.com/send?phone=${selectedUserForDetails.whatsapp.replace(/[^0-9]/g,'')}`, '_blank')} className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-sm">
                Chat on WhatsApp
              </button>
              <div className="ml-auto flex gap-2">
                <button onClick={() => {
                  localStorage.setItem("sd_view_as_uid", selectedUserForDetails.id);
                  localStorage.setItem("sd_view_as_role", selectedUserForDetails.role);
                  localStorage.setItem("sd_view_as_name", selectedUserForDetails.name);
                  window.open('/dashboard', '_blank');
                }} className="px-5 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                  View Dashboard As User
                </button>
                <button onClick={handleSuspendUser} className="px-5 py-2.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-xl text-sm font-bold hover:bg-orange-600 hover:text-white transition-all shadow-sm">
                  Suspend & Block
                </button>
                <button onClick={handleDeleteUser} className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
