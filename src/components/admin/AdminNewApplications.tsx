"use client";

import React, { useState, useEffect } from 'react';
import { FileText, PhoneCall, CheckCircle, Store, Mail, MapPin, XCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { addNotification } from '@/lib/firestore/notifications';


export default function AdminNewApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [editedApp, setEditedApp] = useState<any | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const collections = ["weavers", "stores", "wholesalers", "suppliers", "resellers"];
      let allApps: any[] = [];
      
      for (const colName of collections) {
        const q = query(collection(db, colName), where("status", "==", "pending_admin_approval"));
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
          allApps.push({ id: doc.id, collectionName: colName, ...doc.data() });
        });
      }
      
      // Sort by createdAt descending
      allApps.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });

      setApplications(allApps);
    } catch (e) {
      console.error(e);
      alert('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appOverride?: any) => {
    const appToApprove = appOverride || editedApp;
    if (!appToApprove) return;
    if (!confirm(`Are you sure you want to approve this ${appToApprove.collectionName.slice(0, -1)} application?`)) return;
    
    setActionLoading(appToApprove.id);
    try {
      const docRef = doc(db, appToApprove.collectionName, appToApprove.id);
      
      let finalDocRef = docRef;
      const { collectionName, id, createdAt, ...fieldsToUpdate } = appToApprove;
      
      if (appToApprove.ownerUid && appToApprove.ownerUid !== appToApprove.id) {
        // Transfer data to the user's UID document to match dashboard architecture
        finalDocRef = doc(db, appToApprove.collectionName, appToApprove.ownerUid);
        await setDoc(finalDocRef, {
          ...fieldsToUpdate,
          id: editedApp.ownerUid,
          status: 'active'
        });
        // Delete original claimed document to prevent duplicates
        await deleteDoc(docRef);
      } else {
        await updateDoc(finalDocRef, {
          ...fieldsToUpdate,
          status: 'active'
        });
      }

      if (appToApprove.ownerUid) {
        // 1. Notify the user
        await addNotification(appToApprove.ownerUid, 'approved', `Your application for ${appToApprove.name || appToApprove.businessName} has been approved! You can now access your Dashboard.`);
        
        // 2. IMPORTANT: Upgrade the user's role in the DB so they actually see the Vendor Panel
        // and pre-fill their store name from the claimed listing
        const userRef = doc(db, "users", appToApprove.ownerUid);
        await updateDoc(userRef, {
          ["roles.bhulia-hub"]: appToApprove.role || appToApprove.collectionName.slice(0, -1), // e.g. weaver
          storeName: appToApprove.name || appToApprove.businessName || "",
          phone: appToApprove.phone || appToApprove.contactPhone || "",
          applicationStatus: 'approved'
        });
      }
      

      setApplications(applications.filter(a => a.id !== appToApprove.id));
      alert('Application approved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to approve application');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (app: any) => {
    const reason = prompt('Please enter a reason for declining:');
    if (reason === null) return;
    
    setActionLoading(app.id);
    try {
      const docRef = doc(db, app.collectionName, app.id);
      
      // If it's a claimed existing place, just unlink it
      if (app.googlePlaceId || app.claimedAt || (app.id && app.id.startsWith('ChIJ'))) {
        await updateDoc(docRef, {
          ownerUid: null,
          ownerName: null,
          status: 'unverified'
        });
      } else {
        // Hard delete the application if it was manually created from scratch
        await deleteDoc(docRef);
      }

      if (app.ownerUid) {
        // Notify the user
        await addNotification(app.ownerUid, 'rejected', `Your application for ${app.name} was declined. Reason: ${reason}`);
        
        // Update user status so they are not permanently locked in 'pending'
        const userRef = doc(db, "users", app.ownerUid);
        await updateDoc(userRef, {
          applicationStatus: 'rejected',
          rejectionReason: reason
        });
      }

      setApplications(applications.filter(a => a.id !== app.id));
      alert('Application declined and removed from pending list.');
    } catch (e) {
      console.error(e);
      alert('Failed to delete application');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#051815] rounded-2xl border border-[#C5A059]/20 p-8 shadow-sm flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C5A059]"></div>
      </div>
    );
  }

  const roleColors: Record<string, string> = {
    weavers: "bg-red-500/10 text-red-400 border-red-500/20",
    stores: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    wholesalers: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    suppliers: "bg-green-500/10 text-green-400 border-green-500/20",
    resellers: "bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/20",
  };

  return (
    <div className="bg-[#051815] rounded-2xl border border-[#C5A059]/20 p-8 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
            <Store className="w-6 h-6 text-[#C5A059]" /> Pending Applications
          </h2>
          <p className="text-gray-400">Review new ecosystem partners before they go live.</p>
        </div>
        <button onClick={fetchApplications} className="px-4 py-2 border border-[#C5A059]/30 rounded-lg text-sm font-bold text-[#C5A059] hover:bg-[#C5A059]/10 transition-colors">
          Refresh List
        </button>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
          <p className="text-gray-500">No pending applications at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <div key={app.id} className="border border-white/10 bg-black/30 rounded-xl p-6 hover:border-[#C5A059]/50 transition-colors">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex gap-4 flex-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{app.name}</h3>
                      <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest rounded border \${roleColors[app.collectionName] || roleColors.resellers}`}>
                        {app.collectionName.slice(0, -1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 max-w-lg truncate mb-4">{app.address}</p>
                    
                                      <button 
                    onClick={() => setSelectedApp(app)}
                    className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-colors w-full md:w-auto"
                  >
                    View Full Details
                  </button>

                    {/* Document Previews */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <PhoneCall className="w-4 h-4 text-[#C5A059]" /> {app.phone || app.contactPhone || 'No phone mapped'} (Owner: {app.ownerName || 'Unknown'})
                      </div>
                      {(app.loomsCount || app.socialMediaLink || app.panNumber) && (
                        <div className="bg-white/5 rounded-lg p-3 mt-2 border border-white/5 space-y-1">
                          {app.loomsCount && <div className="text-xs text-gray-400">Looms: <span className="text-white font-bold">{app.loomsCount}</span></div>}
                          {app.socialMediaLink && <div className="text-xs text-gray-400">Social: <a href={app.socialMediaLink} target="_blank" className="text-blue-400 hover:underline">{app.socialMediaLink}</a></div>}
                          {app.panNumber && <div className="text-xs text-gray-400">PAN / BIS: <span className="text-white font-mono">{app.panNumber}</span></div>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-64 bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Action Required</h4>
                  
                  <div className="space-y-2 mb-4">
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-600 bg-black text-[#C5A059] focus:ring-[#C5A059]" />
                      <PhoneCall className="w-4 h-4 text-gray-400" /> Owner Contacted
                    </label>
                  </div>
                  
                  <div className="flex flex-col gap-2 w-full">
                    <button 
                      onClick={() => { setSelectedApp(app); setEditedApp({ ...app }); handleApprove(); }}
                      disabled={actionLoading === app.id}
                      className="w-full flex items-center justify-center gap-2 bg-[#C5A059] hover:bg-[#8A6A32] text-black py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                    >
                      {actionLoading === app.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" /> Approve App
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => handleDecline(app)}
                      disabled={actionLoading === app.id}
                      className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-red-500/10 text-red-400 border border-red-500/30 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                    >
                      {actionLoading === app.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" /> Decline App
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A1121] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#0A1121]/90 backdrop-blur z-10">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Store className="text-[#C5A059]" /> {selectedApp.name || selectedApp.businessName}
                </h3>
                <span className={`mt-2 inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest rounded border ${roleColors[selectedApp.collectionName] || roleColors.resellers}`}>
                  {selectedApp.collectionName.slice(0, -1)}
                </span>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-white p-2">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Business Info */}
              <div>
                <h4 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-4">Business Information</h4>
                <div className="grid grid-cols-2 gap-4 bg-black/30 p-4 rounded-xl border border-white/5 text-sm">
                  <div>
                    <span className="block text-gray-500 mb-1">Business Name</span>
                    <input 
                      type="text"
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#C5A059]"
                      value={editedApp?.name || editedApp?.businessName || ""}
                      onChange={(e) => setEditedApp({ ...editedApp, name: e.target.value, businessName: e.target.value })}
                    />
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Owner Name</span>
                    <input 
                      type="text"
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#C5A059]"
                      value={editedApp?.ownerName || ""}
                      onChange={(e) => setEditedApp({ ...editedApp, ownerName: e.target.value })}
                    />
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Phone Number</span>
                    <input 
                      type="text"
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#C5A059]"
                      value={editedApp?.phone || ""}
                      onChange={(e) => setEditedApp({ ...editedApp, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Email Address</span>
                    <input 
                      type="email"
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#C5A059]"
                      value={editedApp?.email || ""}
                      onChange={(e) => setEditedApp({ ...editedApp, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Location Info */}
              <div>
                <h4 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-4">Location Details</h4>
                <div className="grid grid-cols-2 gap-4 bg-black/30 p-4 rounded-xl border border-white/5 text-sm">
                  <div>
                    <span className="block text-gray-500 mb-1">Country</span>
                    <input 
                      type="text"
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#C5A059]"
                      value={editedApp?.country || ""}
                      onChange={(e) => setEditedApp({ ...editedApp, country: e.target.value })}
                    />
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">State</span>
                    <input 
                      type="text"
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#C5A059]"
                      value={editedApp?.state || ""}
                      onChange={(e) => setEditedApp({ ...editedApp, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">District</span>
                    <input 
                      type="text"
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#C5A059]"
                      value={editedApp?.district || ""}
                      onChange={(e) => setEditedApp({ ...editedApp, district: e.target.value })}
                    />
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Block / City</span>
                    <input 
                      type="text"
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#C5A059]"
                      value={editedApp?.block || ""}
                      onChange={(e) => setEditedApp({ ...editedApp, block: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <span className="block text-gray-500 mb-1">Full Local Address</span>
                    <input 
                      type="text"
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#C5A059]"
                      value={editedApp?.address || ""}
                      onChange={(e) => setEditedApp({ ...editedApp, address: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Documents & Extra */}
              <div>
                <h4 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-4">Verification & Documents</h4>
                <div className="grid grid-cols-2 gap-4 bg-black/30 p-4 rounded-xl border border-white/5 text-sm">
                  {editedApp?.panNumber !== undefined && (
                    <div>
                      <span className="block text-gray-500 mb-1">PAN Number</span>
                      <input 
                        type="text"
                        className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#C5A059] font-mono"
                        value={editedApp?.panNumber || ""}
                        onChange={(e) => setEditedApp({ ...editedApp, panNumber: e.target.value })}
                      />
                    </div>
                  )}
                  {editedApp?.gstNumber !== undefined && (
                    <div>
                      <span className="block text-gray-500 mb-1">GST Number</span>
                      <input 
                        type="text"
                        className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#C5A059] font-mono"
                        value={editedApp?.gstNumber || ""}
                        onChange={(e) => setEditedApp({ ...editedApp, gstNumber: e.target.value })}
                      />
                    </div>
                  )}
                  {editedApp?.loomsCount !== undefined && (
                    <div>
                      <span className="block text-gray-500 mb-1">Number of Looms</span>
                      <input 
                        type="text"
                        className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#C5A059]"
                        value={editedApp?.loomsCount || ""}
                        onChange={(e) => setEditedApp({ ...editedApp, loomsCount: e.target.value })}
                      />
                    </div>
                  )}
                  {editedApp?.socialMediaLink !== undefined && (
                    <div className="col-span-2">
                      <span className="block text-gray-500 mb-1">Social Media</span>
                      <input 
                        type="url"
                        className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#C5A059]"
                        value={editedApp?.socialMediaLink || ""}
                        onChange={(e) => setEditedApp({ ...editedApp, socialMediaLink: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* WhatsApp Actions */}
              <div>
                <h4 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-4">WhatsApp Communication</h4>
                <div className="flex flex-col gap-3">
                  <a 
                    href={`https://wa.me/91${selectedApp.phone?.replace(/\D/g, '')}?text=Hello ${selectedApp.ownerName}, this is the Bhulia Hub Admin Team. We are reviewing your application for ${selectedApp.name || selectedApp.businessName} and need a bit more information...`}
                    target="_blank"
                    className="flex items-center justify-center gap-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/30 py-3 rounded-xl font-bold transition-colors"
                  >
                    <PhoneCall className="w-5 h-5" /> Chat on WhatsApp (Ask for Info)
                  </a>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        handleApprove(selectedApp);
                        setSelectedApp(null);
                        window.open(`https://wa.me/91${selectedApp.phone?.replace(/\D/g, '')}?text=Congratulations ${selectedApp.ownerName}! Your application for ${selectedApp.name || selectedApp.businessName} on Bhulia Hub has been APPROVED. You can now login to your dashboard.`, '_blank');
                      }}
                      className="flex items-center justify-center gap-2 bg-[#C5A059] hover:bg-[#8A6A32] text-black py-3 rounded-xl font-bold transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" /> Approve & Notify
                    </button>
                    
                    <button 
                      onClick={() => {
                        handleDecline(selectedApp);
                        setSelectedApp(null);
                        // Rejection whatsapp is optional, usually decline deletes it directly, but they can still message if they want.
                      }}
                      className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 py-3 rounded-xl font-bold transition-colors"
                    >
                      <XCircle className="w-5 h-5" /> Decline Application
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
