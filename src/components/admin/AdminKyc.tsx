"use client";

import { User } from "@/types";

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc, getDoc, addDoc, serverTimestamp, deleteField } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function KycResolutionDesk() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [pendingStores, setPendingStores] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "stores">("users");
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});

  async function fetchPendingKyc() {
    setIsLoading(true);
    try {
      const q = query(collection(db, "users"), where("status", "==", "pending"));
      const snapshot = await getDocs(q);
      
      const users: any[] = [];
      snapshot.forEach((docSnap) => {
        users.push({ id: docSnap.id, ...docSnap.data(), type: "user_approval" });
      });

      const q2 = query(collection(db, "kyc_verifications"), where("status", "==", "pending"));
      const snap2 = await getDocs(q2);
      
      snap2.forEach((docSnap) => {
        users.push({ id: docSnap.id, ...docSnap.data(), type: "document_verification" });
      });

      const q3 = query(collection(db, "verification_requests"), where("status", "==", "pending"));
      const snap3 = await getDocs(q3);

      snap3.forEach((docSnap) => {
        users.push({ id: docSnap.id, ...docSnap.data(), type: "listing_claim" });
      });

      setPendingUsers(users);

      // Fetch pending stores
      const storesQuery = query(collection(db, "weavers"), where("status", "==", "pending"));
      const storesSnap = await getDocs(storesQuery);
      const stores: any[] = [];
      storesSnap.forEach((docSnap) => {
        stores.push({ id: docSnap.id, ...docSnap.data(), type: "store_approval" });
      });
      setPendingStores(stores);
    } catch (error) {
      console.error("Failed to fetch pending queues:", error);
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



  const handleAction = async (item: any, action: "approve" | "reject" | "hold") => {
    let rejectionReason = null;
    if (action === "reject") {
        const reason = window.prompt("Please provide a rejection reason so the applicant knows what to fix (e.g. 'Bank account blurred'):");
        if (reason === null) return; // User cancelled
        if (!reason.trim()) {
            alert("A rejection reason is required.");
            return;
        }
        rejectionReason = reason;
    }
    
    if (action === "hold") {
        const confirmHold = window.confirm("Mark as 'Field Visit Required'? This will notify the user that an agent will visit them.");
        if (!confirmHold) return;
    }

    setProcessingId(item.id);
    try {
      if (item.type === "store_approval") {
        const storeRef = doc(db, "weavers", item.id);
        const updates = action === "approve"
          ? { status: "approved" }
          : action === "hold"
          ? { status: "on_hold" }
          : { status: "rejected", rejectionReason };
          
        await updateDoc(storeRef, updates);
        setPendingStores(prev => prev.filter(s => s.id !== item.id));
      } else if (item.type === "user_approval") {
        const userRef = doc(db, "users", item.id);
        const updates: any = action === "approve" 
          ? { status: "active", kycStatus: "verified", verifiedAt: new Date().toISOString(), applicationStatus: deleteField() }
          : action === "hold"
          ? { status: "on_hold", kycStatus: "field_verification", holdReason: "Field force will visit for verification.", applicationStatus: deleteField() }
          : { status: "rejected", kycStatus: "rejected", rejectedAt: new Date().toISOString(), rejectionReason, applicationStatus: deleteField() };
        
        if (action === "approve" && item.requestedRole) {
          updates.role = item.requestedRole;
        }

        await updateDoc(userRef, updates);

        if (action === "approve" && item.requestedRole) {
          const targetCollection = item.requestedRole === "weaver" ? "weavers" : item.requestedRole === "store" ? "stores" : item.requestedRole === "franchise" ? "franchises" : null;
          if (targetCollection) {
            const profileRef = doc(db, targetCollection, item.id);
            const profileSnap = await getDoc(profileRef);
            if (profileSnap.exists()) {
              await updateDoc(profileRef, { status: "approved" });
            }
          }
        }

        // Add Notification
        const notificationTitle = action === "approve" ? "Application Approved! 🎉" 
                                : action === "hold" ? "Field Verification Required 🏠" 
                                : "Application Update ⚠️";
        const notificationMessage = action === "approve" ? `Congratulations! Your application has been fully approved. You can now access all features in your hub.`
                                  : action === "hold" ? `We have placed your application on hold. A member of our field force will visit your location to complete physical verification.`
                                  : `There is an issue with your application: ${rejectionReason}. Please update your details and try again.`;

        await addDoc(collection(db, "notifications"), {
          userId: item.id,
          title: notificationTitle,
          message: notificationMessage,
          read: false,
          type: "account_status",
          createdAt: serverTimestamp()
        });

      } else if (item.type === "document_verification") {
        const docRef = doc(db, "kyc_verifications", item.id);
        const updates = action === "approve" 
          ? { status: "approved", verifiedAt: new Date().toISOString() }
          : { status: "rejected", rejectedAt: new Date().toISOString(), rejectionReason };
        await updateDoc(docRef, updates);

        // Also update the user's document status if approved
        if (action === "approve" && item.userId) {
            const userRef = doc(db, "users", item.userId);
            if (item.documentType === "bank") {
                await updateDoc(userRef, { bankVerified: true });
            } else {
                await updateDoc(userRef, { identityVerified: true, isVerified: true });
            }
        }
      } else if (item.type === "listing_claim") {
        const claimRef = doc(db, "verification_requests", item.id);
        const updates = action === "approve" 
          ? { status: "approved", verifiedAt: new Date().toISOString() }
          : { status: "rejected", rejectedAt: new Date().toISOString(), rejectionReason };
        await updateDoc(claimRef, updates);

        if (action === "approve") {
          // 1. Update the user role
          if (item.ownerId) {
            const userRef = doc(db, "users", item.ownerId);
            await updateDoc(userRef, { role: item.role || "store", status: "active" });
            
            // Notify user
            await addDoc(collection(db, "notifications"), {
              userId: item.ownerId,
              title: "Business Claim Approved! 🎉",
              message: `Congratulations! Your claim for ${item.businessName} has been approved. You now have access to your seller dashboard.`,
              read: false,
              type: "account_status",
              createdAt: serverTimestamp()
            });
          }

          // 2. Update the target listing if they claimed an existing one, or create new if not?
          // If targetProfileId exists, we update the ownerId of that profile
          if (item.targetProfileId) {
            const targetCollection = item.role === "weaver" ? "weavers" : "stores";
            const profileRef = doc(db, targetCollection, item.targetProfileId);
            const profileSnap = await getDoc(profileRef);
            if (profileSnap.exists()) {
              await updateDoc(profileRef, { ownerId: item.ownerId, status: "approved", isVerified: true });
            }
          }
        }
      }
      
      // Remove from list optimistically
      setPendingUsers(prev => prev.filter(u => u.id !== item.id));
    } catch (error) {
      console.error(`Failed to ${action} item:`, error);
      alert(`Action failed. Ensure you have the required Firestore permissions.`);
      fetchPendingKyc(); // Revert optimistic update
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedUser || !editFormData) return;
    setProcessingId(selectedUser.id);
    try {
      const userRef = doc(db, "users", selectedUser.id);
      await updateDoc(userRef, editFormData);
      setSelectedUser({ ...selectedUser, ...editFormData });
      setIsEditingUser(false);
      fetchPendingKyc(); // Refresh table
    } catch (error) {
      console.error("Edit failed", error);
      alert("Failed to save changes.");
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
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${activeTab === "users" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
          >
            User Accounts ({pendingUsers.length})
          </button>
          <button 
            onClick={() => setActiveTab("stores")}
            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${activeTab === "stores" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
          >
            Store Profiles ({pendingStores.length})
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500 animate-pulse">Scanning Global Queue...</div>
        ) : (activeTab === "users" ? pendingUsers.length === 0 : pendingStores.length === 0) ? (
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
                  <th className="px-6 py-4">{activeTab === "users" ? "Applicant Profile" : "Store Details"}</th>
                  <th className="px-6 py-4">{activeTab === "users" ? "Entity Type" : "Location"}</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">Applied On</th>
                  <th className="px-6 py-4 text-right">Resolution Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(activeTab === "users" ? pendingUsers : pendingStores).map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-gray-900 bg-gradient-to-br from-gray-400 to-gray-600 shadow-inner">
                          {activeTab === "users" ? (item.displayName ? item.displayName.charAt(0).toUpperCase() : "?") : (item.title ? item.title.charAt(0).toUpperCase() : "S")}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{activeTab === "users" ? (item.displayName || "Unregistered") : (item.title || item.storeName || "Unnamed Store")}</p>
                          <p className="text-xs text-gray-500">{activeTab === "users" ? (item.email || item.phone) : (item.phone || "No phone")}</p>
                          <p className="text-[10px] text-gray-400 mt-1 font-mono">UID: {item.id.substring(0,8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      {activeTab === "users" ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        item.role === 'weaver' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                        item.role === 'shop' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                        item.role === 'reseller' ? 'bg-green-100 text-green-800 border-green-200' :
                        item.role === 'customer' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {item.role || "Unknown"}
                      </span>
                      ) : (
                        <div>
                          <p className="font-semibold text-gray-900">{item.district}</p>
                          <p className="text-xs text-gray-500">{item.block}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-xs text-gray-600">
                      {item.type === "store_approval" ? (
                        <div>
                          <p className="text-sm font-bold text-blue-600 uppercase mb-1">STORE APPROVAL</p>
                          <p><span className="font-semibold">Specialties:</span> {item.specialties?.join(", ")}</p>
                          <p><span className="font-semibold">Exp:</span> {item.weaverExperience}</p>
                        </div>
                      ) : item.type === "document_verification" ? (
                        <div>
                           <p className="text-sm font-bold text-blue-600 uppercase mb-1">{(user as any).documentType || "BANK"} UPLOAD</p>
                           { (user as any).documentUrl ? (
                             <a href={(user as any).documentUrl} target="_blank" className="underline text-blue-500">View Document ↗</a>
                           ) : (
                             <div>
                                <p><span className="font-semibold">Bank:</span> {(user as any).bankName}</p>
                                <p><span className="font-semibold">A/C:</span> {(user as any).accountNumber}</p>
                                <p><span className="font-semibold">IFSC:</span> {(user as any).ifsc}</p>
                             </div>
                           )}
                        </div>
                      ) : item.type === "listing_claim" ? (
                        <div>
                          <p className="text-sm font-bold text-purple-600 uppercase mb-1">LISTING CLAIM</p>
                          <p><span className="font-semibold">Business:</span> {item.businessName}</p>
                          <p><span className="font-semibold">Target ID:</span> {item.targetProfileId || "New Listing"}</p>
                        </div>
                      ) : item.role === "weaver" ? (
                        <div>
                          <p className="text-sm font-bold text-gray-900 uppercase mb-1">NEW ACCOUNT</p>
                          <p><span className="font-semibold">Cluster:</span> {item.cluster || "N/A"}</p>
                          <p><span className="font-semibold">Village:</span> {item.village || "N/A"}</p>
                        </div>
                      ) : item.role === "store" ? (
                        <div>
                          <p className="text-sm font-bold text-gray-900 uppercase mb-1">NEW ACCOUNT</p>
                          <p><span className="font-semibold">Business:</span> {item.businessName || "N/A"}</p>
                          <p><span className="font-semibold">GST:</span> {item.gstNumber || "N/A"}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-bold text-gray-900 uppercase mb-1">OTHER UPDATE</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-xs text-gray-500 font-mono">
                      {item.applicationDate?.toDate ? item.applicationDate.toDate().toLocaleString() : item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : "N/A"}
                    </td>
                    <td className="px-6 py-5 align-top text-right">
                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                        {processingId === item.id ? (
                          <div className="text-blue-500 font-bold animate-pulse text-xs uppercase tracking-widest">Processing...</div>
                        ) : (
                          <>
                            <button onClick={() => handleAction(item, "approve")} className="w-full sm:w-auto bg-green-500 text-white font-bold py-2 px-4 rounded shadow hover:bg-green-600 transition-colors text-xs uppercase tracking-wider">
                              Approve
                            </button>
                            <button onClick={() => handleAction(item, "reject")} className="w-full sm:w-auto bg-white text-red-500 border border-red-200 font-bold py-2 px-4 rounded shadow-sm hover:bg-red-50 transition-colors text-xs uppercase tracking-wider">
                              Reject
                            </button>
                            {item.type !== "store_approval" && (
                              <button onClick={() => handleAction(item, "hold")} className="w-full sm:w-auto bg-yellow-100 text-yellow-800 font-bold py-2 px-4 rounded shadow-sm hover:bg-yellow-200 transition-colors text-xs uppercase tracking-wider">
                                Request Visit
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-900">{isEditingUser ? "Edit Details" : "Application Details"}</h2>
              <button onClick={() => { setSelectedUser(null); setIsEditingUser(false); }} className="text-gray-400 hover:text-gray-600 font-bold text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-6 space-y-8">
              {isEditingUser ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 border-b pb-2">Edit Profile Info</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><label className="block text-xs text-gray-500 mb-1">Name</label><input type="text" className="w-full border rounded p-2" value={editFormData.personalName || editFormData.displayName || ''} onChange={e => setEditFormData({...editFormData, personalName: e.target.value})} /></div>
                      <div><label className="block text-xs text-gray-500 mb-1">Store / Brand</label><input type="text" className="w-full border rounded p-2" value={editFormData.storeName || editFormData.businessName || ''} onChange={e => setEditFormData({...editFormData, storeName: e.target.value})} /></div>
                      <div><label className="block text-xs text-gray-500 mb-1">Phone</label><input type="text" className="w-full border rounded p-2" value={editFormData.phone || editFormData.whatsapp || ''} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} /></div>
                      <div><label className="block text-xs text-gray-500 mb-1">Email</label><input type="text" className="w-full border rounded p-2" value={editFormData.email || ''} onChange={e => setEditFormData({...editFormData, email: e.target.value})} /></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 border-b pb-2">Edit Bank Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><label className="block text-xs text-gray-500 mb-1">Account Name</label><input type="text" className="w-full border rounded p-2" value={editFormData.bankHolder || ''} onChange={e => setEditFormData({...editFormData, bankHolder: e.target.value})} /></div>
                      <div><label className="block text-xs text-gray-500 mb-1">Bank Name</label><input type="text" className="w-full border rounded p-2" value={editFormData.bankName || ''} onChange={e => setEditFormData({...editFormData, bankName: e.target.value})} /></div>
                      <div><label className="block text-xs text-gray-500 mb-1">Account Number</label><input type="text" className="w-full border rounded p-2 font-mono" value={editFormData.bankAccount || ''} onChange={e => setEditFormData({...editFormData, bankAccount: e.target.value})} /></div>
                      <div><label className="block text-xs text-gray-500 mb-1">IFSC Code</label><input type="text" className="w-full border rounded p-2 font-mono" value={editFormData.bankIfsc || ''} onChange={e => setEditFormData({...editFormData, bankIfsc: e.target.value})} /></div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Profile */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 border-b pb-2">Profile Info</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-500 block text-xs">Role / Type</span><span className="font-semibold capitalize">{selectedUser.role}</span></div>
                      <div><span className="text-gray-500 block text-xs">Name</span><span className="font-semibold">{selectedUser.personalName || selectedUser.displayName || 'N/A'}</span></div>
                      <div><span className="text-gray-500 block text-xs">Store / Brand</span><span className="font-semibold">{selectedUser.storeName || selectedUser.businessName || 'N/A'}</span></div>
                      <div><span className="text-gray-500 block text-xs">Phone</span><span className="font-semibold">{selectedUser.phone || selectedUser.whatsapp || 'N/A'}</span></div>
                      <div><span className="text-gray-500 block text-xs">Email</span><span className="font-semibold">{selectedUser.email || 'N/A'}</span></div>
                      <div><span className="text-gray-500 block text-xs">Applied On</span><span className="font-semibold">{selectedUser.applicationDate?.toDate ? selectedUser.applicationDate.toDate().toLocaleString() : 'N/A'}</span></div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 border-b pb-2">Address</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-500 block text-xs">Street / Village</span><span className="font-semibold">{selectedUser.address?.streetAddress || selectedUser.address?.cityTownVillage || selectedUser.village || 'N/A'}</span></div>
                      <div><span className="text-gray-500 block text-xs">Block / City</span><span className="font-semibold">{selectedUser.address?.block || selectedUser.block || 'N/A'}</span></div>
                      <div><span className="text-gray-500 block text-xs">District</span><span className="font-semibold">{selectedUser.address?.district || selectedUser.district || selectedUser.cluster || 'N/A'}</span></div>
                      <div><span className="text-gray-500 block text-xs">State & PIN</span><span className="font-semibold">{selectedUser.address?.state || selectedUser.state || 'N/A'} - {selectedUser.address?.pincode || selectedUser.pin || ''}</span></div>
                    </div>
                  </div>

                  {/* KYC */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 border-b pb-2">KYC Documents</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div><span className="text-gray-500 block text-xs">Document Type</span><span className="font-semibold">{selectedUser.kycType || 'N/A'}</span></div>
                      <div><span className="text-gray-500 block text-xs">Document ID</span><span className="font-semibold">{selectedUser.kycId || 'N/A'}</span></div>
                      <div><span className="text-gray-500 block text-xs">GST Number</span><span className="font-semibold">{selectedUser.gst || selectedUser.gstNumber || 'N/A'}</span></div>
                    </div>
                    {selectedUser.kycDocumentUrl ? (
                      <div className="border rounded-lg overflow-hidden bg-gray-50 p-2">
                        {selectedUser.kycDocumentUrl.startsWith('data:image') || selectedUser.kycDocumentUrl.includes('firebasestorage') ? (
                          <img src={selectedUser.kycDocumentUrl} alt="KYC Document" className="w-full h-auto max-h-[400px] object-contain rounded" />
                        ) : (
                          <a href={selectedUser.kycDocumentUrl} target="_blank" className="text-blue-600 underline font-semibold block text-center py-8">Open Document in New Tab ↗</a>
                        )}
                      </div>
                    ) : (
                      <div className="bg-red-50 text-red-600 p-4 rounded text-sm text-center font-bold">No Document Uploaded</div>
                    )}
                  </div>

                  {/* Bank */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 border-b pb-2">Bank Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-500 block text-xs">Account Name</span><span className="font-semibold">{selectedUser.bankHolder || 'N/A'}</span></div>
                      <div><span className="text-gray-500 block text-xs">Bank Name</span><span className="font-semibold">{selectedUser.bankName || 'N/A'}</span></div>
                      <div><span className="text-gray-500 block text-xs">Account Number</span><span className="font-semibold font-mono">{selectedUser.bankAccount || 'N/A'}</span></div>
                      <div><span className="text-gray-500 block text-xs">IFSC Code</span><span className="font-semibold font-mono">{selectedUser.bankIfsc || 'N/A'}</span></div>
                      <div><span className="text-gray-500 block text-xs">UPI ID</span><span className="font-semibold">{selectedUser.bankUpi || 'N/A'}</span></div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-between gap-3 z-10 rounded-b-2xl">
              {isEditingUser ? (
                <>
                  <button 
                    onClick={() => { setIsEditingUser(false); setEditFormData({}); }}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-200 font-bold rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveEdit}
                    disabled={!!processingId}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors disabled:opacity-50"
                  >
                    {processingId ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <button 
                      onClick={() => { setEditFormData({...selectedUser}); setIsEditingUser(true); }}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-200 font-bold rounded-xl text-sm transition-colors"
                    >
                      Edit Details
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        handleAction(selectedUser, "reject");
                        setSelectedUser(null);
                      }}
                      className="px-6 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl text-sm transition-colors"
                    >
                      Reject Application
                    </button>
                    <button 
                      onClick={() => {
                        handleAction(selectedUser, "hold");
                        setSelectedUser(null);
                      }}
                      className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl text-sm shadow-md transition-colors"
                    >
                      Require Field Visit
                    </button>
                    <button 
                      onClick={() => {
                        handleAction(selectedUser, "approve");
                        setSelectedUser(null);
                      }}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
