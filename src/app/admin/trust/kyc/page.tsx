"use client";

import { User } from "@/types";

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function KycResolutionDesk() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function fetchPendingKyc() {
    setIsLoading(true);
    try {
      const q = query(collection(db, "users"), where("status", "==", "pending"));
      const snapshot = await getDocs(q);
      
      const users: any[] = [];
      snapshot.forEach((docSnap) => {
        users.push({ id: docSnap.id, ...docSnap.data() });
      });
      setPendingUsers(users);
    } catch (error) {
      console.error("Failed to fetch pending KYC:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Strict Protocol: Verify Access on Mount
  useEffect(() => {
    const verifyAccessAndFetch = async () => {
      const email = localStorage.getItem("sd_current_user_email");
      const role = localStorage.getItem("sd_current_user_role");

      if (role === "super_admin") {
        setHasPermission(true);
        fetchPendingKyc();
        return;
      }

      if (role === "admin" && email) {
        try {
          // Fetch the admin's permissions from Firestore to ensure no local storage tampering
          const q = query(collection(db, "users"), where("email", "==", email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const adminData = snap.docs[0].data();
            if (adminData.permissions?.kyc === true) {
              setHasPermission(true);
              fetchPendingKyc();
              return;
            }
          }
        } catch (error) {
          console.error("Permission check failed:", error);
        }
      }

      setHasPermission(false);
      setIsLoading(false);
    };

    verifyAccessAndFetch();
  }, []);



  const handleAction = async (userId: string, action: "approve" | "reject") => {
    setProcessingId(userId);
    try {
      const userRef = doc(db, "users", userId);
      const updates = action === "approve" 
        ? { status: "active", kycStatus: "verified", verifiedAt: new Date().toISOString() }
        : { status: "rejected", kycStatus: "rejected", rejectedAt: new Date().toISOString() };
      
      await updateDoc(userRef, updates);
      
      // Remove from list optimistically
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      alert(`Action failed. Ensure you have the required Firestore permissions.`);
      fetchPendingKyc(); // Revert optimistic update
    } finally {
      setProcessingId(null);
    }
  };

  if (hasPermission === null) {
    return (
      <div className="flex justify-center py-20 text-blue-600 font-bold uppercase tracking-widest text-xs animate-pulse">
        Verifying Security Clearance...
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
        <h3 className="font-bold text-lg mb-2">Security Breach Blocked</h3>
        <p>You do not have the required `KYC & Trust` permissions to view the Resolution Desk.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            KYC Resolution Desk
            <span className="bg-blue-100 text-blue-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Secure Zone</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Review and approve pending Weaver, Store, and Franchise applications.</p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-lg text-sm font-bold text-gray-700">
          Pending: <span className="text-red-600">{pendingUsers.length}</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500 animate-pulse">Scanning Global Queue...</div>
        ) : pendingUsers.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-900">Queue is Empty</h3>
            <p className="text-gray-500 text-sm mt-1">All KYC verifications are up to date. Excellent work.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-6 py-4">Applicant Profile</th>
                  <th className="px-6 py-4">Entity Type</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4 text-right">Resolution Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-gray-900 bg-gradient-to-br from-gray-400 to-gray-600 shadow-inner">
                          {(user as any).displayName ? (user as any).displayName.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{(user as any).displayName || "Unregistered"}</p>
                          <p className="text-xs text-gray-500">{user.email || user.phone}</p>
                          <p className="text-[10px] text-gray-400 mt-1 font-mono">UID: {user.id.substring(0,8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                        {user.role || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs text-gray-600">
                      {user.role === "weaver" ? (
                        <div>
                          <p><span className="font-semibold">Cluster:</span> {(user as any).cluster || "N/A"}</p>
                          <p><span className="font-semibold">Village:</span> {(user as any).village || "N/A"}</p>
                        </div>
                      ) : user.role === "store" ? (
                        <div>
                          <p><span className="font-semibold">Business:</span> {user.businessName || "N/A"}</p>
                          <p><span className="font-semibold">GST:</span> {(user as any).gstNumber || "N/A"}</p>
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">No extra metadata provided.</p>
                      )}
                    </td>
                    <td className="px-6 py-5 align-middle text-right">
                      {processingId === user.id ? (
                        <div className="text-xs text-blue-600 font-semibold animate-pulse">Processing...</div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleAction(user.id, "reject")}
                            className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold rounded-lg text-xs transition-colors"
                          >
                            Reject
                          </button>
                          <button 
                            onClick={() => handleAction(user.id, "approve")}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-gray-900 font-bold rounded-lg text-xs shadow-md transition-colors"
                          >
                            Approve
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
