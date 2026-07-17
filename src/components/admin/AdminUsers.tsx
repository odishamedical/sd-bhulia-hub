"use client";

import React, { useState, useMemo } from "react";
import { useWeavers, useStores, useOrders, useCustomers, useAuthUsers, useResellers, addWeaver, addStore, addCustomer, addReseller, deleteUserRecord, suspendUserRecord, convertUserRole, updateDocumentStatus } from "@/lib/db-hooks";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { firebaseConfig, db } from "@/lib/firebase";
import { setDoc, doc, runTransaction, collection, getDocs } from "firebase/firestore";

export default function UserManagementPage() {
  const { weavers } = useWeavers(200);
  const { stores } = useStores(200);
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
  const [sourceFilter, setSourceFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<any>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
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
  const [newUserBlock, setNewUserBlock] = useState("");
  const [newUserAddress, setNewUserAddress] = useState("");
  const [newUserPin, setNewUserPin] = useState("");
  const [allowDirectContact, setAllowDirectContact] = useState(false);
  const [newUserCanSellWholesale, setNewUserCanSellWholesale] = useState(false);

  // SaaS Configuration State
  const [newSubStatus, setNewSubStatus] = useState("free_trial");
  const [newSubLimit, setNewSubLimit] = useState("10");
  const [newSubCommission, setNewSubCommission] = useState("15");
  const [newSubDuration, setNewSubDuration] = useState("1"); // months

  // Verification State
  const [verificationFilter, setVerificationFilter] = useState("all");

  // Generate unified mock users from ecosystem data
  const users = useMemo(() => {
    try {
      // Weavers
      const wList = weavers.map((w, idx) => ({
      id: w.id,
      name: w.title || `Weaver ${idx}`,
      role: "weaver",
      phone: w.phoneNumber || "N/A",
      state: (String(w.address || "").split(",")?.[2] || "").split("-")?.[0]?.trim() || "Odisha",
      district: String(w.address || "").split(",")?.[1]?.trim() || "Sambalpur",
      volume: orders.filter(o => o.sellerId === w.id).reduce((acc, curr) => acc + (parseInt(curr.productPrice?.toString().replace(/[^0-9]/g, '') || "0")), 0),
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
      status: w.status || "approved",
      kycType: authUsers.find(u => u.id === w.id)?.kycType || null,
      kycId: authUsers.find(u => u.id === w.id)?.kycId || null,
      kycDocumentUrl: authUsers.find(u => u.id === w.id)?.kycDocumentUrl || null,
      source: w.source || "organic",
    }));

    // Retail Stores
    const sList = stores.map((s, idx) => ({
      id: s.id,
      name: s.title || `Store ${idx}`,
      role: "store",
      phone: s.phoneNumber || "N/A",
      state: (String(s.address || "").split(",")?.[2] || "").split("-")?.[0]?.trim() || "N/A",
      district: String(s.address || "").split(",")?.[1]?.trim() || "N/A",
      volume: orders.filter(o => o.sellerId === s.id).reduce((acc, curr) => acc + (parseInt(curr.productPrice?.toString().replace(/[^0-9]/g, '') || "0")), 0),
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
      status: s.status || "approved",
      kycType: authUsers.find(u => u.id === s.id)?.kycType || null,
      kycId: authUsers.find(u => u.id === s.id)?.kycId || null,
      kycDocumentUrl: authUsers.find(u => u.id === s.id)?.kycDocumentUrl || null,
      source: s.source || "organic",
    }));

    // Extract Customers from Orders (Mocking legacy customers from purchases)
    const cList = Array.from(new Set(orders.map(o => o.customerName))).filter(Boolean).map((name, idx) => ({
      id: `order_cust_${idx}`,
      name: name as string,
      role: "customer",
      phone: orders.find(o => o.customerName === name)?.customerPhone || "N/A",
      state: (String(orders.find(o => o.customerName === name)?.customerAddress || "").split(",")?.[2] || "").split("-")?.[0]?.trim() || "N/A",
      district: String(orders.find(o => o.customerName === name)?.customerAddress || "").split(",")?.[1]?.trim() || "N/A",
      country: "India",
      volume: orders.filter(o => o.customerName === name).reduce((acc, curr) => acc + (parseInt(curr.productPrice?.toString().replace(/[^0-9]/g, '') || "0")), 0), // Total spent
      purchasedProductIds: orders.filter(o => o.customerName === name).map(o => o.productId).filter(Boolean),
      whatsapp: orders.find(o => o.customerName === name)?.customerWhatsapp || "N/A",
      address: orders.find(o => o.customerName === name)?.customerAddress || "N/A",
      email: "N/A",
      referralId: `SDC-${String(`order_cust_${idx}`).substring(0,6).toUpperCase()}`,
      status: "approved",
      source: "organic",
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
      volume: orders.filter(o => o.customerId === c.id || o.customerName === c.name).reduce((acc, curr) => acc + (parseInt(curr.productPrice?.toString().replace(/[^0-9]/g, '') || "0")), 0),
      purchasedProductIds: [] as any[],
      whatsapp: c.whatsapp || "N/A",
      address: c.address || "N/A",
      email: c.email || authUsers.find(u => u.id === c.id || u.id === c.userId)?.email || "N/A",
      referralId: `SDC-${c.id.substring(0,6).toUpperCase()}`,
      status: c.status || "approved",
      kycType: authUsers.find(u => u.id === c.id || u.id === c.userId)?.kycType || null,
      kycId: authUsers.find(u => u.id === c.id || u.id === c.userId)?.kycId || null,
      kycDocumentUrl: authUsers.find(u => u.id === c.id || u.id === c.userId)?.kycDocumentUrl || null,
      source: c.source || "organic",
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
      volume: orders.filter(o => o.customerId === u.id || o.customerName === u.name).reduce((acc, curr) => acc + (parseInt(curr.productPrice?.toString().replace(/[^0-9]/g, '') || "0")), 0),
      purchasedProductIds: [] as any[],
      whatsapp: "N/A",
      address: "N/A",
      email: u.email || "N/A",
      referralId: `SDU-${u.id.substring(0,6).toUpperCase()}`,
      status: "approved",
      kycType: u.kycType || null,
      kycId: u.kycId || null,
      kycDocumentUrl: u.kycDocumentUrl || null,
      source: "organic",
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
      volume: orders.filter(o => o.resellerId === r.id).reduce((acc, curr) => acc + (parseInt(curr.productPrice?.toString().replace(/[^0-9]/g, '') || "0")), 0),
      purchasedProductIds: [] as any[],
      whatsapp: r.whatsapp || "N/A",
      address: r.address || "N/A",
      email: r.email || "N/A",
      referralId: r.referralId || "N/A",
      tier: r.tier || "Bronze",
      commissionRate: r.commissionRate || 10,
      status: r.status || "approved",
      kycType: authUsers.find(u => u.id === r.id || u.id === (r as any).userId)?.kycType || null,
      kycId: authUsers.find(u => u.id === r.id || u.id === (r as any).userId)?.kycId || null,
      kycDocumentUrl: authUsers.find(u => u.id === r.id || u.id === (r as any).userId)?.kycDocumentUrl || null,
      source: r.source || "organic",
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
    } catch (error: any) {
      console.error("Error generating users list: ", error);
      return [{
        id: "ERROR",
        name: error?.message || String(error),
        role: "user",
        phone: error?.stack?.substring(0, 50) || "N/A",
        state: "N/A", district: "N/A", country: "N/A", volume: 0, purchasedProductIds: [],
        whatsapp: "N/A", address: "N/A", email: "N/A", referralId: "N/A", status: "error", source: "organic"
      }];
    }
  }, [weavers, stores, orders, customers, authUsers, resellers]);

  // Apply Filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // 1. Search Term
      const matchesSearch = !searchTerm || 
        String(user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
        String(user.phone || "").includes(searchTerm) ||
        String(user.id || "").toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Role Filter
      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      // 3. State & District
      const matchesState = stateFilter === "all" || String(user.state || "").toLowerCase() === stateFilter.toLowerCase();
      const matchesDistrict = districtFilter === "all" || String(user.district || "").toLowerCase() === districtFilter.toLowerCase();

      // 4. Sub Status Filter (SaaS)
      const matchesSubStatus = subStatusFilter === "all" || (user.subStatus === subStatusFilter);

      // 5. Volume Filter
      const matchesVolume = !minVolume || user.volume >= parseInt(minVolume);

      // 6. Product ID Purchase Filter
      const matchesProduct = !productIdFilter || (user.purchasedProductIds || []).includes(productIdFilter);
      
      // 7. Verification Filter
      let matchesVerification = true;
      if (verificationFilter === "verified") {
        matchesVerification = !!user.kycId && user.status === "approved";
      } else if (verificationFilter === "pending") {
        matchesVerification = !!user.kycId && user.status === "pending_approval";
      } else if (verificationFilter === "unverified") {
        matchesVerification = !user.kycId;
      }
      
      // 8. Source Filter (Google CRM)
      const matchesSource = sourceFilter === "all" || (user.source === sourceFilter);

      return matchesSearch && matchesRole && matchesState && matchesDistrict && matchesSubStatus && matchesVolume && matchesProduct && matchesVerification && matchesSource;
    });
  }, [users, searchTerm, roleFilter, stateFilter, districtFilter, subStatusFilter, minVolume, productIdFilter, verificationFilter, sourceFilter]);

  const allStates = Array.from(new Set(users.map(u => u.state))).sort();
  const allDistricts = Array.from(new Set(users.map(u => u.district))).sort();

  const toggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u: any) => u.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(uId => uId !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUserIds.length === 0) return;
    
    if (action === "delete") {
      if (confirm(`Are you sure you want to completely DELETE ${selectedUserIds.length} user accounts? This cannot be undone.`)) {
        for (const id of selectedUserIds) {
           const u = users.find(x => x.id === id);
           if (u) await deleteUserRecord(u.role, id);
        }
        setSelectedUserIds([]);
        alert("Users deleted successfully.");
      }
    } else if (action === "suspend") {
      if (confirm(`Suspend and block ${selectedUserIds.length} users?`)) {
        for (const id of selectedUserIds) {
           const u = users.find(x => x.id === id);
           if (u) await suspendUserRecord(u.role, id);
        }
        setSelectedUserIds([]);
        alert("Users suspended successfully.");
      }
    } else if (action === "approve") {
      if (confirm(`Approve ${selectedUserIds.length} users?`)) {
        for (const id of selectedUserIds) {
           const u = users.find(x => x.id === id);
           if (u) {
              const colName = u.role === "weaver" ? "weavers" : u.role === "store" ? "stores" : u.role === "reseller" ? "resellers" : "customers";
              await updateDocumentStatus(colName, id, { status: "approved" });
           }
        }
        setSelectedUserIds([]);
        alert("Users approved successfully.");
      }
    }
  };

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

  const handleMigrateVendorsToStores = async () => {
    if(!confirm("Are you sure you want to migrate all 'vendors' to 'stores' collection? This cannot be easily undone!")) return;
    try {
      const vendorsRef = collection(db, "vendors");
      const vendorsSnap = await getDocs(vendorsRef);
      if (vendorsSnap.empty) {
        alert("No vendors found to migrate.");
        return;
      }
      let count = 0;
      for (const docSnap of vendorsSnap.docs) {
        const storeRef = doc(db, "stores", docSnap.id);
        await setDoc(storeRef, docSnap.data());
        count++;
      }
      alert(`Successfully migrated ${count} vendors to stores!`);
    } catch(e) {
      console.error(e);
      alert("Error migrating: " + e.message);
    }
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
        role: newUserRole,
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
          address: {
            streetAddress: newUserAddress,
            block: newUserBlock,
            district: newUserDistrict,
            state: newUserState,
            country: newUserCountry,
            pincode: newUserPin
          } as any,
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
      } else if (newUserRole === "store") {
        await addStore({
          slug: generatedSlug,
          title: newUserName,
          desc: `Premium handloom store located in ${newUserDistrict || newUserState || "Odisha"}.`,
          img: "/bhulia-hero.png",
          badge: "Verified Store",
          phone: newUserPhone || "N/A",
          whatsapp: newUserWhatsapp || "N/A",
          address: {
            streetAddress: newUserAddress,
            block: newUserBlock,
            district: newUserDistrict,
            state: newUserState,
            country: newUserCountry,
            pincode: newUserPin
          } as any,
          tier: "Silver",
          status: "approved",
          productLimit: parseInt(newSubLimit),
          canSellWholesale: newUserCanSellWholesale,
          subscription: subscriptionData,
        }, newUid);
        alert(`Retail Store Profile Generated!\nPublic Link: bhulia.com/store/${generatedSlug}`);
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
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-md">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            Ecosystem Hub
          </h1>
          <p className="text-gray-500 mt-2 font-medium text-sm">Unified management for Customers, Weavers, and Retail Shops.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowAddUserModal(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
            Add New User
          </button>
          <button 
            onClick={() => setShowBroadcastModal(true)}
            disabled={filteredUsers.length === 0}
            className="px-5 py-2.5 bg-green-500 text-white rounded-full text-sm font-bold hover:bg-green-600 transition-all disabled:opacity-50 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Broadcast
          </button>
          <button 
            onClick={handleMigrateVendorsToStores}
            className="px-5 py-2.5 bg-red-600 text-white rounded-full text-sm font-bold hover:bg-red-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Migrate Vendors to Stores
          </button>
          <button 
            onClick={handleExportCSV}
            disabled={isExporting || filteredUsers.length === 0}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-black transition-all disabled:opacity-50 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            {isExporting ? "Exporting..." : "Export CRM"}
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all flex items-center gap-2 shadow-sm ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Advanced Filters Sidebar */}
        {showFilters && (
          <div className="w-full lg:w-64 shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <h3 className="text-sm font-black text-gray-900 mb-5 flex items-center gap-2 uppercase tracking-wider">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                Role Filter
              </h3>
              <div className="space-y-2">
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                  {['all', 'user', 'customer', 'reseller', 'weaver', 'store', 'wholesaler', 'supplier', 'staff'].map(role => (
                    <option key={role} value={role}>{role === 'all' ? 'Entire Ecosystem' : role === 'user' ? 'General Users' : role.charAt(0).toUpperCase() + role.slice(1) + 's'}</option>
                  ))}
                </select>
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
                  <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                    <option value="all">All States (Pan-India)</option>
                    {allStates.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">District</label>
                  <select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                    <option value="all">All Districts</option>
                    {allDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Subscription Status</label>
                  <select
                    value={subStatusFilter}
                    onChange={(e) => setSubStatusFilter(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-all text-gray-700 font-medium"
                  >
                    <option value="all">Any SaaS Plan</option>
                    <option value="free_trial">Free Tier</option>
                    <option value="active">Premium Tier</option>
                    <option value="suspended">Suspended / Banned</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Data Source (CRM)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                    </div>
                    <select
                      value={sourceFilter}
                      onChange={(e) => setSourceFilter(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-all text-gray-700 font-medium"
                    >
                      <option value="all">All Data Sources</option>
                      <option value="organic">Organic Users</option>
                      <option value="google_places">Google Data CRM (Imported)</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Verification Status</label>
                  <select value={verificationFilter} onChange={e => setVerificationFilter(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                    <option value="all">All Statuses</option>
                    <option value="approved">Approved & Active</option>
                    <option value="pending">Pending Verification</option>
                    <option value="rejected">Rejected / Suspended</option>
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
                  <input type="number" placeholder="e.g. 50000" value={minVolume} onChange={e => setMinVolume(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Purchased Product ID</label>
                  <input type="text" placeholder="e.g. PRD-8273" value={productIdFilter} onChange={e => setProductIdFilter(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none font-mono" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Data Grid */}
        <div className="flex-1 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col pb-24">
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
                  <th className="py-4 px-6 font-bold w-12">
                    <input type="checkbox" className="w-4 h-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length} onChange={toggleSelectAll} />
                  </th>
                  <th className="py-4 px-6 font-bold">User Identity</th>
                  <th className="py-4 px-6 font-bold">Role</th>
                  <th className="py-4 px-6 font-bold">Location</th>
                  <th className="py-4 px-6 font-bold text-right">Lifetime Vol (₹)</th>
                  <th className="py-4 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {filteredUsers.map((user, idx) => (
                  <tr key={`${user.id}-${user.role}-${idx}`} className="group hover:bg-blue-50/40 transition-colors border-b border-gray-50">
                    <td className="py-4 px-6">
                      <input type="checkbox" className="w-4 h-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={selectedUserIds.includes(user.id)} onChange={() => toggleSelect(user.id)} />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                          user.role === 'weaver' ? 'bg-orange-100 text-orange-700' :
                          user.role === 'store' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'reseller' ? 'bg-green-100 text-green-700' :
                          user.role === 'customer' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {String(user?.name || '?').trim().split(/\s+/).filter(Boolean).map((n: string) => n[0]).join('').substring(0,2).toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">{user.name}</div>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">ID: {user.id} • {user.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${
                        user.role === 'weaver' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        user.role === 'store' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        user.role === 'reseller' ? 'bg-green-50 text-green-700 border-green-200' :
                        user.role === 'customer' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-700 text-sm">{user.district}</div>
                      <div className="text-[11px] text-gray-400 font-medium">{user.state}, {(user as any).country}</div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {user.volume > 0 ? (
                        <div className="inline-block bg-green-50 px-3 py-1 rounded-lg border border-green-100 text-green-800 font-bold text-sm shadow-sm">
                          ₹{user.volume.toLocaleString()}
                        </div>
                      ) : (
                        <div className="font-bold text-gray-400 text-sm">₹0</div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button onClick={() => setSelectedUserForDetails(user)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all">
                        View CRM
                      </button>
                      <button onClick={() => {
                        setSelectedUserForDetails(user);
                        setTimeout(() => {
                           const el = document.getElementById('suspend-btn');
                           if (el) el.click();
                        }, 100);
                      }} className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-orange-600 hover:text-white transition-all">
                        Suspend
                      </button>
                      <button onClick={() => {
                        setSelectedUserForDetails(user);
                        setTimeout(() => {
                           const el = document.getElementById('delete-btn');
                           if (el) el.click();
                        }, 100);
                      }} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all">
                        Delete
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
              className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-4 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none mb-6"
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
                      }} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none">
                      <option value="customer">Retail Customer</option>
                      <option value="reseller">Reseller (Marketing Agent)</option>
                      <option value="weaver">Sambalpuri Weaver</option>
                      <option value="store">Retail Store / Franchise</option>
                      <option value="supplier">Raw Material Supplier</option>
                      <option value="wholesaler">B2B Wholesaler</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Full Name / Entity Name</label>
                    <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Name" className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Email Address (Used for Login)</label>
                    <input type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="Email" className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Password</label>
                    <input type="text" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} placeholder="Temporary Password" className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Phone Number</label>
                    <input type="tel" value={newUserPhone} onChange={e => setNewUserPhone(e.target.value)} placeholder="+91" className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">WhatsApp Number</label>
                    <input type="tel" value={newUserWhatsapp} onChange={e => setNewUserWhatsapp(e.target.value)} placeholder="+91" className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
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
                      
                      {(newUserRole === 'weaver' || newUserRole === 'store') && (
                        <label className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-100 rounded-xl cursor-pointer mt-4">
                          <input type="checkbox" checked={newUserCanSellWholesale} onChange={e => setNewUserCanSellWholesale(e.target.checked)} className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded" />
                          <div>
                            <div className="text-sm font-bold text-purple-900 leading-tight">B2B Wholesale Privileges</div>
                            <div className="text-xs text-purple-700 mt-0.5">Allow this store to upload products with hidden B2B commercial prices.</div>
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
                      <input type="text" value={newUserCountry} onChange={e => setNewUserCountry(e.target.value)} placeholder="e.g. India, USA" className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">State</label>
                    {newUserRole === 'weaver' ? (
                      <input type="text" value="Odisha" disabled className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-sm font-medium outline-none opacity-60" />
                    ) : (
                      <input type="text" value={newUserState} onChange={e => setNewUserState(e.target.value)} placeholder="e.g. Maharashtra, California" className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">District / City</label>
                  {newUserRole === 'weaver' ? (
                    <select value={newUserDistrict} onChange={e => setNewUserDistrict(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none">
                      <option value="">Select District</option>
                      {["Bargarh", "Sonepur", "Sambalpur", "Bolangir", "Nuapada", "Boudh", "Jharsuguda"].map(d => (
                        <option key={d} value={d}>{d} (Bhulia.com-Approved)</option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" value={newUserDistrict} onChange={e => setNewUserDistrict(e.target.value)} placeholder="e.g. Mumbai, New York" className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Block / Tehsil</label>
                  {newUserRole === 'weaver' ? (
                    <select value={newUserBlock} onChange={e => setNewUserBlock(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none">
                      <option value="">Select Block (Optional)</option>
                      {["Attabira", "Bargarh", "Barpali", "Bhatli", "Bheden", "Bijepur", "Gaisilet", "Jharbandh", "Padampur", "Paikmal", "Rajborasamar", "Sohela", "Binika", "Birmaharajpur", "Dunguripali", "Sonepur", "Tarabha", "Ullunda"].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" value={newUserBlock} onChange={e => setNewUserBlock(e.target.value)} placeholder="e.g. Andheri, Manhattan" className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Complete Address</label>
                    <input type="text" value={newUserAddress} onChange={e => setNewUserAddress(e.target.value)} placeholder="Street, landmark..." className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">PIN Code</label>
                    <input type="text" value={newUserPin} onChange={e => setNewUserPin(e.target.value)} placeholder="PIN" className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-[#C5A059] mb-4">SaaS & Revenue Configuration</h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Subscription Status</label>
                      <select value={newSubStatus} onChange={e => setNewSubStatus(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none">
                        <option value="free_trial">Free Trial / Promotion</option>
                        <option value="active">Active (Paid)</option>
                        <option value="expired">Expired / Locked</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Duration (Months)</label>
                      <select value={newSubDuration} onChange={e => setNewSubDuration(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none">
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
                      <select value={newSubLimit} onChange={e => setNewSubLimit(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none">
                        <option value="0">0 (Locked - View Only)</option>
                        <option value="10">10 (Trial Limit)</option>
                        <option value="20">20 Products</option>
                        <option value="50">50 Products</option>
                        <option value="9999">Unlimited (Paid)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Commission Rate (%)</label>
                      <select value={newSubCommission} onChange={e => setNewSubCommission(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none">
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
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col overflow-hidden relative">
            
            {/* STICKY HEADER */}
            <div className="flex justify-between items-start p-6 md:p-8 pb-4 border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-20 shadow-sm shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-black text-gray-900">{selectedUserForDetails.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${selectedUserForDetails.applicationStatus === 'pending' ? 'bg-amber-100 text-amber-700' : selectedUserForDetails.applicationStatus === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {selectedUserForDetails.applicationStatus || 'Active'}
                  </span>
                </div>
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
                      <option value="store">To Retail Store</option>
                      <option value="reseller">To Reseller</option>
                      <option value="customer">To Customer</option>
                    </select>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    alert("Changes have been auto-saved securely.");
                    setSelectedUserForDetails(null);
                  }} 
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                  Save & Close
                </button>
                <button onClick={() => setSelectedUserForDetails(null)} className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors border border-gray-200">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>

            {/* SCROLLABLE BODY */}
            <div className="overflow-y-auto flex-1 p-6 md:p-8 pt-6 space-y-6">

            {(selectedUserForDetails.role === 'weaver' || selectedUserForDetails.role === 'store') && (
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
                          const collectionName = selectedUserForDetails.role === 'weaver' ? 'weavers' : 'stores';
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
                          const collectionName = selectedUserForDetails.role === 'weaver' ? 'weavers' : 'stores';
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
                          const collectionName = selectedUserForDetails.role === 'weaver' ? 'weavers' : 'stores';
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
              
              {/* Orphan Credentials Block */}
              {selectedUserForDetails.email === 'N/A' && (selectedUserForDetails.role === 'weaver' || selectedUserForDetails.role === 'store') && (
                <div className="col-span-2 grid grid-cols-1 gap-4 bg-purple-50 p-6 rounded-2xl border border-purple-100 mb-2">
                  <div className="col-span-full mb-1 border-b border-purple-200 pb-2">
                    <h4 className="text-sm font-bold text-purple-900 uppercase">Orphan Profile / Dummy Account</h4>
                  </div>
                  <p className="text-sm text-purple-800 font-medium mt-0">This profile does not have an active login account. Create credentials below.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input id="crmDummyEmail" type="email" placeholder="Email (e.g. gmail.com)" className="flex-1 bg-white border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" />
                    <input id="crmDummyPwd" type="text" placeholder="Password" defaultValue="bhulia123" className="w-32 bg-white border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" />
                    <button 
                      onClick={async (e) => {
                        e.preventDefault();
                        const emailInput = document.getElementById('crmDummyEmail') as HTMLInputElement;
                        const pwdInput = document.getElementById('crmDummyPwd') as HTMLInputElement;
                        if (!emailInput.value || !pwdInput.value) { alert('Enter email and password'); return; }
                        
                        const btn = e.currentTarget;
                        btn.textContent = "Creating...";
                        btn.disabled = true;
                        try {
                          const { initializeApp } = await import('firebase/app');
                          const { getAuth, createUserWithEmailAndPassword } = await import('firebase/auth');
                          const { setDoc, updateDoc, getDoc, doc, serverTimestamp } = await import('firebase/firestore');
                          
                          const secondaryApp = initializeApp(auth.app.options, "Secondary" + Date.now());
                          const secondaryAuth = getAuth(secondaryApp);
                          
                          const cred = await createUserWithEmailAndPassword(secondaryAuth, emailInput.value, pwdInput.value);
                          const newUid = cred.user.uid;
                          
                          const col = selectedUserForDetails.role === 'weaver' ? 'weavers' : 'stores';
                          const oldDocRef = doc(db, col, selectedUserForDetails.id);
                          const newDocRef = doc(db, col, newUid);
                          const oldSnap = await getDoc(oldDocRef);
                          if (oldSnap.exists()) {
                            await setDoc(newDocRef, { ...oldSnap.data(), uid: newUid, updatedAt: serverTimestamp() });
                            await setDoc(doc(db, 'users', newUid), {
                              uid: newUid,
                              email: emailInput.value,
                              role: selectedUserForDetails.role,
                              weaverDocId: newUid,
                              createdAt: serverTimestamp()
                            });
                            await updateDoc(oldDocRef, { status: "migrated", migratedTo: newUid });
                            alert('Credentials created successfully! They can now log in.');
                            setSelectedUserForDetails({...selectedUserForDetails, email: emailInput.value});
                          }
                          await secondaryAuth.signOut();
                        } catch (err: any) {
                          alert(err.message);
                        } finally {
                          btn.textContent = "Create Login & Claim Profile";
                          btn.disabled = false;
                        }
                      }}
                      className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      Create Login
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 flex justify-between items-center">
                    Phone Number
                    <button onClick={async () => {
                      const val = prompt('Edit Phone Number:', selectedUserForDetails.phone);
                      if (val && val !== selectedUserForDetails.phone) {
                        const col = selectedUserForDetails.role === 'weaver' ? 'weavers' : selectedUserForDetails.role === 'store' ? 'stores' : 'users';
                        await updateDocumentStatus(col, selectedUserForDetails.id, { phoneNumber: val });
                        setSelectedUserForDetails({...selectedUserForDetails, phone: val});
                        alert('Updated!');
                      }
                    }} className="text-blue-500 hover:text-blue-700">Edit</button>
                  </div>
                  <div className="text-sm font-bold text-gray-900">{selectedUserForDetails.phone}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 flex justify-between items-center">
                    WhatsApp
                    <button onClick={async () => {
                      const val = prompt('Edit WhatsApp:', selectedUserForDetails.whatsapp);
                      if (val && val !== selectedUserForDetails.whatsapp) {
                        const col = selectedUserForDetails.role === 'weaver' ? 'weavers' : selectedUserForDetails.role === 'store' ? 'stores' : 'users';
                        await updateDocumentStatus(col, selectedUserForDetails.id, { whatsapp: val });
                        setSelectedUserForDetails({...selectedUserForDetails, whatsapp: val});
                        alert('Updated!');
                      }
                    }} className="text-blue-500 hover:text-blue-700">Edit</button>
                  </div>
                  <div className="text-sm font-bold text-gray-900">{selectedUserForDetails.whatsapp}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 flex justify-between items-center">
                    Email Address
                    <button onClick={async () => {
                      const val = prompt('Edit Email Address in DB (Note: Does not change their Auth login email, only CRM record):', selectedUserForDetails.email);
                      if (val && val !== selectedUserForDetails.email) {
                        const col = selectedUserForDetails.role === 'weaver' ? 'weavers' : selectedUserForDetails.role === 'store' ? 'stores' : 'users';
                        await updateDocumentStatus(col, selectedUserForDetails.id, { email: val });
                        setSelectedUserForDetails({...selectedUserForDetails, email: val});
                        alert('Updated!');
                      }
                    }} className="text-blue-500 hover:text-blue-700">Edit</button>
                  </div>
                  <div className="text-sm font-bold text-gray-900">{selectedUserForDetails.email}</div>
                  <button onClick={async () => {
                    if(!selectedUserForDetails.email || selectedUserForDetails.email === 'N/A') return alert('No valid email to reset.');
                    if(confirm(`Send password reset link to ${selectedUserForDetails.email}?`)){
                      const { sendPasswordResetEmail } = await import('firebase/auth');
                      await sendPasswordResetEmail(auth, selectedUserForDetails.email);
                      alert('Password reset link sent!');
                    }
                  }} className="text-xs text-blue-600 font-bold mt-2 hover:underline">✉ Send Password Reset</button>
                </div>
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-3">KYC & Verification</h4>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-widest">Document Type</span>
                        <span className="font-semibold text-gray-900">{selectedUserForDetails.kycType || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-widest">Document ID</span>
                        <span className="font-semibold text-gray-900">{selectedUserForDetails.kycId || 'N/A'}</span>
                      </div>
                    </div>
                    
                    {selectedUserForDetails.kycDocumentUrl ? (
                      <div className="border rounded-lg overflow-hidden bg-white p-2">
                        {selectedUserForDetails.kycDocumentUrl.startsWith('data:image') || selectedUserForDetails.kycDocumentUrl.includes('firebasestorage') ? (
                          <img src={selectedUserForDetails.kycDocumentUrl} alt="KYC Document" className="w-full h-auto max-h-[250px] object-contain rounded" />
                        ) : (
                          <a href={selectedUserForDetails.kycDocumentUrl} target="_blank" className="text-blue-600 underline font-semibold block text-center py-4">Open Document ↗</a>
                        )}
                        <a href={selectedUserForDetails.kycDocumentUrl} target="_blank" className="block text-center text-[10px] font-bold text-slate-800 uppercase tracking-widest mt-2 hover:text-blue-500">View Full Size</a>
                      </div>
                    ) : (
                      <div className="bg-red-50 text-red-600 p-3 rounded text-xs text-center font-bold">No Document Uploaded</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 flex justify-between items-center">
                    Geography
                    <button onClick={async () => {
                      const val = prompt('Edit Geography (e.g. District, State):', [selectedUserForDetails.district, selectedUserForDetails.state].filter(Boolean).join(", "));
                      if (val) {
                        const parts = val.split(",");
                        const district = parts[0]?.trim() || "";
                        const state = parts[1]?.trim() || "";
                        const col = selectedUserForDetails.role === 'weaver' ? 'weavers' : selectedUserForDetails.role === 'store' ? 'stores' : 'users';
                        await updateDocumentStatus(col, selectedUserForDetails.id, { district, state });
                        setSelectedUserForDetails({...selectedUserForDetails, district, state});
                        alert('Updated!');
                      }
                    }} className="text-blue-500 hover:text-blue-700">Edit</button>
                  </div>
                  <div className="text-sm font-bold text-gray-900">{[selectedUserForDetails.district, selectedUserForDetails.state, selectedUserForDetails.country].filter(Boolean).filter(s => s !== "N/A").join(", ") || "N/A"}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 flex justify-between items-center">
                    Full Address
                    <button onClick={async () => {
                      const val = prompt('Edit Full Address:', selectedUserForDetails.address);
                      if (val && val !== selectedUserForDetails.address) {
                        const col = selectedUserForDetails.role === 'weaver' ? 'weavers' : selectedUserForDetails.role === 'store' ? 'stores' : 'users';
                        await updateDocumentStatus(col, selectedUserForDetails.id, { address: val });
                        setSelectedUserForDetails({...selectedUserForDetails, address: val});
                        alert('Updated!');
                      }
                    }} className="text-blue-500 hover:text-blue-700">Edit</button>
                  </div>
                  <div className="text-sm font-bold text-gray-900 leading-relaxed">{typeof selectedUserForDetails.address === 'object' ? JSON.stringify(selectedUserForDetails.address) : String(selectedUserForDetails.address)}</div>
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
                  <div className="text-sm font-black text-green-600">₹{Number(selectedUserForDetails.volume || 0).toLocaleString()}</div>
                </div>
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-3">SaaS Subscription</h4>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-blue-900">Current Plan</span>
                      <span className="text-xs font-black text-blue-700 uppercase">{selectedUserForDetails.subStatus || "Free Trial"}</span>
                    </div>
                    {selectedUserForDetails.subStatus && selectedUserForDetails.subStatus !== "free_trial" && (
                      <div className="text-[10px] text-blue-600 font-medium">Managed via Razorpay integration</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            </div>
            
            {/* STICKY FOOTER */}
            <div className="flex justify-end gap-3 p-6 md:p-8 pt-4 border-t border-gray-100 bg-gray-50/80 backdrop-blur-md shrink-0">
              {selectedUserForDetails.role !== 'customer' && selectedUserForDetails.slug && (
                <button onClick={() => window.open(`/${selectedUserForDetails.role}/${selectedUserForDetails.slug}`, '_blank')} className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-sm">
                  View Public Profile
                </button>
              )}
              <button onClick={() => window.open(`https://api.whatsapp.com/send?phone=${String(selectedUserForDetails.whatsapp || "").replace(/[^0-9]/g,'')}`, '_blank')} className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-sm">
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
                <button id="suspend-btn" onClick={handleSuspendUser} className="px-5 py-2.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-xl text-sm font-bold hover:bg-orange-600 hover:text-white transition-all shadow-sm">
                  Suspend & Block
                </button>
                <button id="delete-btn" onClick={handleDeleteUser} className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BULK ACTION TOOLBAR */}
      {selectedUserIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-8 border border-gray-800">
           <div className="font-bold border-r border-gray-700 pr-6 text-sm">
             {selectedUserIds.length} Users Selected
           </div>
           <div className="flex gap-3">
             <button onClick={() => handleBulkAction("approve")} className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-xl text-sm font-bold transition-all shadow-sm">Approve All</button>
             <button onClick={() => handleBulkAction("suspend")} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-sm font-bold transition-all shadow-sm">Suspend All</button>
             <button onClick={() => handleBulkAction("delete")} className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-bold transition-all shadow-sm">Delete All</button>
           </div>
        </div>
      )}
    </div>
  );
}
