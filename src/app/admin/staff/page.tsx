"use client";

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Define the structure of an admin user
interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: "super_admin" | "admin";
  permissions?: {
    kyc: boolean;
    products: boolean;
    orders: boolean;
    finance: boolean;
    logistics: boolean;
    support: boolean;
    marketing: boolean;
  };
}

const DEFAULT_PERMISSIONS = {
  kyc: false,
  products: false,
  orders: false,
  finance: false,
  logistics: false,
  support: false,
  marketing: false,
};

export default function StaffDelegationPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  // For the Add Admin Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchStatus, setSearchStatus] = useState<string | null>(null);

  useEffect(() => {
    // Basic verification - this panel should only load for super_admin
    const role = localStorage.getItem("sd_current_user_role");
    if (role === "super_admin") {
      setIsSuperAdmin(true);
      fetchAdmins();
    } else {
      setIsSuperAdmin(false);
      setIsLoading(false);
    }
  }, []);

  async function fetchAdmins() {
    setIsLoading(true);
    try {
      // In Firebase, we can use an 'in' query for role: super_admin or admin
      const q = query(collection(db, "users"), where("role", "in", ["super_admin", "admin"]));
      const snapshot = await getDocs(q);
      
      const adminList: AdminUser[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        adminList.push({
          id: docSnap.id,
          email: data.email || "",
          displayName: data.displayName || "Unknown User",
          role: data.role,
          permissions: data.permissions || { ...DEFAULT_PERMISSIONS }
        });
      });
      setAdmins(adminList);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionChange = async (adminId: string, permKey: keyof typeof DEFAULT_PERMISSIONS, value: boolean) => {
    // Optimistic UI update
    setAdmins(prev => prev.map(a => {
      if (a.id === adminId) {
        return {
          ...a,
          permissions: {
            ...(a.permissions || DEFAULT_PERMISSIONS),
            [permKey]: value
          }
        };
      }
      return a;
    }));

    // Firestore Update
    setSavingId(adminId);
    try {
      const adminRef = doc(db, "users", adminId);
      const targetAdmin = admins.find(a => a.id === adminId);
      if (!targetAdmin) return;
      
      const updatedPermissions = {
        ...(targetAdmin.permissions || DEFAULT_PERMISSIONS),
        [permKey]: value
      };

      await updateDoc(adminRef, {
        permissions: updatedPermissions
      });
      
    } catch (error) {
      console.error("Failed to update permissions. Reverting UI...", error);
      fetchAdmins();
      alert("Error: You might not have the correct Firebase Custom Claims to perform this action.");
    } finally {
      setSavingId(null);
    }
  };

  const handlePromoteUser = async () => {
    setSearchStatus("Searching...");
    try {
      const q = query(collection(db, "users"), where("email", "==", searchEmail.trim()));
      const snap = await getDocs(q);
      if (snap.empty) {
        setSearchStatus("User not found with this email.");
        return;
      }
      
      const userDoc = snap.docs[0];
      const userData = userDoc.data();
      
      if (userData.role === "admin" || userData.role === "super_admin") {
        setSearchStatus("User is already an admin!");
        return;
      }

      // Promote
      setSearchStatus("Promoting user to Admin...");
      await updateDoc(userDoc.ref, {
        role: "admin",
        permissions: { ...DEFAULT_PERMISSIONS }
      });
      
      setIsModalOpen(false);
      setSearchEmail("");
      setSearchStatus(null);
      fetchAdmins(); // Refresh list

    } catch (err) {
      setSearchStatus("Error performing promotion.");
      console.error(err);
    }
  };

  if (!isSuperAdmin && !isLoading) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
        <h3 className="font-bold text-lg mb-2">Unauthorized Access</h3>
        <p>The Staff Delegation panel is strictly reserved for the Super Admin. Your attempt has been logged.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Staff & Delegation</h1>
          <p className="text-sm text-gray-500 mt-1">Manage Sub-Admins and control their exact module access.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md transition-all flex items-center gap-2"
        >
          <span>+</span> Appoint New Admin
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500 animate-pulse">Loading Staff Roster...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-6 py-4">Admin Details</th>
                  <th className="px-6 py-4">Role Status</th>
                  <th className="px-6 py-4 min-w-[300px]">Granular Permissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.map((admin) => {
                  const isSuper = admin.role === "super_admin";
                  const perms = admin.permissions || DEFAULT_PERMISSIONS;

                  return (
                    <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5 align-top">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner ${isSuper ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gray-300 text-gray-700'}`}>
                            {admin.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{admin.displayName}</p>
                            <p className="text-xs text-gray-500">{admin.email}</p>
                            <p className="text-[10px] text-gray-400 mt-1 font-mono">ID: {admin.id.substring(0,8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isSuper ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                          {isSuper ? '👑 Super Admin' : '🛡️ Sub-Admin'}
                        </span>
                        {savingId === admin.id && (
                          <div className="mt-3 text-xs text-blue-600 font-semibold animate-pulse flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                            Syncing...
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        {isSuper ? (
                          <div className="text-xs text-blue-600 font-semibold bg-blue-50 px-4 py-2 rounded-lg inline-block border border-blue-100">
                            God Mode Enabled. Has access to all modules.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                            <PermissionToggle 
                              label="Trust & KYC" 
                              checked={perms.kyc} 
                              onChange={(val) => handlePermissionChange(admin.id, "kyc", val)} 
                            />
                            <PermissionToggle 
                              label="Products (GI-Tag)" 
                              checked={perms.products} 
                              onChange={(val) => handlePermissionChange(admin.id, "products", val)} 
                            />
                            <PermissionToggle 
                              label="Commerce & Orders" 
                              checked={perms.orders} 
                              onChange={(val) => handlePermissionChange(admin.id, "orders", val)} 
                            />
                            <PermissionToggle 
                              label="Finance (Escrow)" 
                              checked={perms.finance} 
                              onChange={(val) => handlePermissionChange(admin.id, "finance", val)} 
                              isDangerous
                            />
                            <PermissionToggle 
                              label="Logistics & RTO" 
                              checked={perms.logistics} 
                              onChange={(val) => handlePermissionChange(admin.id, "logistics", val)} 
                            />
                            <PermissionToggle 
                              label="Support & Disputes" 
                              checked={perms.support} 
                              onChange={(val) => handlePermissionChange(admin.id, "support", val)} 
                            />
                            <PermissionToggle 
                              label="Marketing (Ads)" 
                              checked={perms.marketing} 
                              onChange={(val) => handlePermissionChange(admin.id, "marketing", val)} 
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Appoint Sub-Admin</h3>
              <p className="text-xs text-gray-500 mt-1">Elevate an existing registered user to an Admin role.</p>
            </div>
            <div className="p-6">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">User Email Address</label>
              <input 
                type="email" 
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="e.g. employee@bhulia.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
              {searchStatus && (
                <p className={`mt-3 text-sm font-medium ${searchStatus.includes("Error") || searchStatus.includes("not found") ? "text-red-600" : "text-blue-600"}`}>
                  {searchStatus}
                </p>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => {setIsModalOpen(false); setSearchStatus(null); setSearchEmail("");}}
                className="px-5 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handlePromoteUser}
                disabled={!searchEmail.includes("@")}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify & Appoint
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Reusable Toggle Component
function PermissionToggle({ label, checked, onChange, isDangerous = false }: { label: string, checked: boolean, onChange: (val: boolean) => void, isDangerous?: boolean }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div className="relative">
        <input 
          type="checkbox" 
          className="sr-only" 
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? (isDangerous ? 'bg-red-500' : 'bg-blue-600') : 'bg-gray-200 border border-gray-300'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-4 shadow-sm' : ''}`}></div>
      </div>
      <span className={`text-[13px] font-medium transition-colors ${checked ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>
        {label}
      </span>
    </label>
  );
}
