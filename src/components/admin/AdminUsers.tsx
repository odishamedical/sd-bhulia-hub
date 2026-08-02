"use client";

import React, { useState, useMemo } from "react";
import { useWeavers, useStores, useOrders, useCustomers, useAuthUsers, useResellers, useWholesalers, useSuppliers, addWeaver, addStore, addCustomer, addReseller, deleteUserRecord, suspendUserRecord, convertUserRole, updateDocumentStatus } from "@/lib/db-hooks";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { firebaseConfig, db } from "@/lib/firebase";
import { setDoc, doc, runTransaction, collection, getDocs } from "firebase/firestore";
import AdminUserEditModal from "./AdminUserEditModal";

export default function UserManagementPage() {
  const { weavers } = useWeavers(200);
  const { stores } = useStores(200);
  const { orders } = useOrders(200);
  const { customers } = useCustomers(200);
  const { authUsers } = useAuthUsers();
  const { resellers } = useResellers(200);
  const { wholesalers } = useWholesalers(200);
  const { suppliers } = useSuppliers(200);
  
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
  const [newUserAdminPermissions, setNewUserAdminPermissions] = useState<string[]>([]);
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

  // Heritage Admin Fields
  const [newUserDescription, setNewUserDescription] = useState("");
  const [newUserGoogleMapsLink, setNewUserGoogleMapsLink] = useState("");
  const [newUserSpecialties, setNewUserSpecialties] = useState("");

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

    // B2B Wholesalers
    const b2bList = wholesalers.map((b, idx) => ({
      id: b.id,
      name: b.title || b.name || `Wholesaler ${idx}`,
      role: "wholesaler",
      phone: b.phoneNumber || b.phone || "N/A",
      state: b.state || "N/A",
      district: b.district || "N/A",
      volume: 0,
      purchasedProductIds: [] as any[],
      subStatus: b.subscription?.status || "free_trial",
      whatsapp: b.whatsapp || "N/A",
      address: b.address || "N/A",
      email: authUsers.find(u => u.id === b.id)?.email || "N/A",
      country: b.country || "India",
      referralId: `SDB-${b.id.substring(0,6).toUpperCase()}`,
      slug: b.slug,
      isAutoApproved: b.isAutoApproved,
      maxProductsAllowed: b.productLimit,
      status: b.status || "approved",
      kycType: authUsers.find(u => u.id === b.id)?.kycType || null,
      kycId: authUsers.find(u => u.id === b.id)?.kycId || null,
      kycDocumentUrl: authUsers.find(u => u.id === b.id)?.kycDocumentUrl || null,
      source: b.source || "organic",
    }));

    // Raw Material Suppliers
    const supplierList = suppliers.map((s, idx) => ({
      id: s.id,
      name: s.title || s.name || `Supplier ${idx}`,
      role: "supplier",
      phone: s.phoneNumber || s.phone || "N/A",
      state: s.state || "N/A",
      district: s.district || "N/A",
      volume: 0,
      purchasedProductIds: [] as any[],
      subStatus: s.subscription?.status || "free_trial",
      whatsapp: s.whatsapp || "N/A",
      address: s.address || "N/A",
      email: authUsers.find(u => u.id === s.id)?.email || "N/A",
      country: s.country || "India",
      referralId: `SDSU-${s.id.substring(0,6).toUpperCase()}`,
      slug: s.slug,
      isAutoApproved: s.isAutoApproved,
      maxProductsAllowed: s.productLimit,
      status: s.status || "approved",
      kycType: authUsers.find(u => u.id === s.id)?.kycType || null,
      kycId: authUsers.find(u => u.id === s.id)?.kycId || null,
      kycDocumentUrl: authUsers.find(u => u.id === s.id)?.kycDocumentUrl || null,
      source: s.source || "organic",
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
      source: u.registrationSource || "Organic",
    }));

    // Resellers (Marketing Agents)
    const rList = resellers.map((r) => ({
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

    const allCombined = [...wList, ...sList, ...b2bList, ...supplierList, ...registeredCustomersList, ...identityUsersList, ...rList];
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
  }, [weavers, stores, wholesalers, suppliers, orders, customers, authUsers, resellers]);

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
      const userDocData: any = {
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        applicationStatus: "approved",
        createdAt: new Date().toISOString()
      };
      
      if (newUserRole === "staff") {
        userDocData.adminPermissions = newUserAdminPermissions;
      }

      await setDoc(doc(db, "users", newUid), userDocData);

      if (newUserRole === "weaver") {
        await addWeaver({
          slug: generatedSlug,
          title: newUserName,
          desc: newUserDescription || `Master weaver specializing in handlooms from ${newUserDistrict || newUserState || "Odisha"}.`,
          description: newUserDescription || `Master weaver specializing in handlooms from ${newUserDistrict || newUserState || "Odisha"}.`,
          googleMapsLink: newUserGoogleMapsLink,
          specialties: newUserSpecialties.split(",").map(s => s.trim()).filter(Boolean),
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
          desc: newUserDescription || `Premium handloom store located in ${newUserDistrict || newUserState || "Odisha"}.`,
          description: newUserDescription || `Premium handloom store located in ${newUserDistrict || newUserState || "Odisha"}.`,
          googleMapsLink: newUserGoogleMapsLink,
          specialties: newUserSpecialties.split(",").map(s => s.trim()).filter(Boolean),
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
                  <th className="py-4 px-6 font-bold">Joined Via</th>
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
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-700 border border-gray-200">
                        {user.source}
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
                      {(user.role === 'weaver' || user.role === 'store' || user.role === 'wholesaler' || user.role === 'supplier' || user.role === 'reseller') && (
                        <button 
                          onClick={() => {
                            localStorage.setItem("admin_impersonating_shop", user.id);
                            localStorage.setItem("admin_impersonating_role", user.role);
                            
                            let targetUrl = `/dashboard?viewAs=${user.role}`;
                            if (user.role === "wholesaler") targetUrl = `/dashboard/wholesaler?viewAs=${user.role}`;
                            if (user.role === "supplier") targetUrl = `/dashboard/supplier?viewAs=${user.role}`;
                            if (user.role === "reseller") targetUrl = `/dashboard/reseller?viewAs=${user.role}`;
                            
                            window.open(targetUrl, "_blank");
                          }} 
                          className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-purple-600 hover:text-white transition-all"
                        >
                          Login As
                        </button>
                      )}
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
                      <option value="staff">Platform Staff (Admin)</option>
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

                {newUserRole === 'staff' && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 mt-4">
                    <h4 className="text-sm font-bold text-gray-800 mb-3">Admin Permissions (Maker-Checker)</h4>
                    <p className="text-xs text-gray-500 mb-3">Staff accounts require secondary approval by a Super Admin for key changes.</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['users', 'products', 'orders', 'kyc', 'ads', 'crawler', 'simulator'].map(perm => (
                        <label key={perm} className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={newUserAdminPermissions.includes(perm)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewUserAdminPermissions([...newUserAdminPermissions, perm]);
                              } else {
                                setNewUserAdminPermissions(newUserAdminPermissions.filter(p => p !== perm));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300" 
                          />
                          <span className="capitalize">{perm}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

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

                {(newUserRole === 'weaver' || newUserRole === 'store') && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1.5 block">Store/Weaver Description</label>
                      <textarea value={newUserDescription} onChange={e => setNewUserDescription(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-blue-500 outline-none" placeholder="Enter description for public profile..."></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700 mb-1.5 block">Google Maps Link</label>
                        <input type="url" value={newUserGoogleMapsLink} onChange={e => setNewUserGoogleMapsLink(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-blue-500 outline-none" placeholder="https://maps.google.com/..." />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 mb-1.5 block">Specialties (Comma Separated)</label>
                        <input type="text" value={newUserSpecialties} onChange={e => setNewUserSpecialties(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-blue-500 outline-none" placeholder="e.g. Silk, Bomkai" />
                      </div>
                    </div>
                  </>
                )}

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
        <AdminUserEditModal 
          user={selectedUserForDetails}
          onClose={() => setSelectedUserForDetails(null)}
          handleConvertRole={handleConvertRole}
        />
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
