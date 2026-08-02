"use client";

import React, { useState, useEffect } from 'react';
import { FileText, PhoneCall, CheckCircle, Store, Mail, MapPin, XCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
// Assuming addNotification and logAdminActivity exist in some form, or we can mock them if they don't.
// Let's implement lightweight versions or use what's available.
import { addNotification } from '@/lib/firestore/notifications';
import { logAdminActivity } from '@/lib/firestore/admin_activities';

export default function AdminNewApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const handleApprove = async (app: any) => {
    if (!confirm(`Are you sure you want to approve this ${app.collectionName.slice(0, -1)} application?`)) return;
    
    setActionLoading(app.id);
    try {
      const docRef = doc(db, app.collectionName, app.id);
      await updateDoc(docRef, {
        status: 'active'
      });
      if (app.ownerUid) {
        // 1. Notify the user
        await addNotification(app.ownerUid, 'approved', `Your application for ${app.name} has been approved! You can now access your Dashboard.`);
        
        // 2. IMPORTANT: Upgrade the user's role in the DB so they actually see the Vendor Panel
        const userRef = doc(db, "users", app.ownerUid);
        await updateDoc(userRef, {
          ["roles.bhulia-hub"]: app.role || app.collectionName.slice(0, -1) // e.g. weaver
        });
      }
      
      const adminName = localStorage.getItem("sd_current_user_name") || "Admin";
      const adminEmail = localStorage.getItem("sd_current_user_email") || "admin@bhulia.com";
      await logAdminActivity(adminName, adminEmail, "Approved Application", `Approved ${app.collectionName.slice(0, -1)} application for ${app.name} (${app.id})`);

      setApplications(applications.filter(a => a.id !== app.id));
      alert('Application approved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to approve application');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (app: any) => {
    const reason = prompt('Please enter a reason for declining. This will permanently delete the application:');
    if (reason === null) return;
    
    setActionLoading(app.id);
    try {
      // Hard delete the application
      const docRef = doc(db, app.collectionName, app.id);
      await deleteDoc(docRef);
      if (app.ownerUid) {
        await addNotification(app.ownerUid, 'rejected', `Your application for ${app.name} was declined and removed. Reason: ${reason}`);
      }
      
      const adminName = localStorage.getItem("sd_current_user_name") || "Admin";
      const adminEmail = localStorage.getItem("sd_current_user_email") || "admin@bhulia.com";
      await logAdminActivity(adminName, adminEmail, "Declined Application", `Declined and deleted ${app.collectionName.slice(0, -1)} application for ${app.name} (${app.id}). Reason: ${reason}`);

      setApplications(applications.filter(a => a.id !== app.id));
      alert('Application permanently deleted and removed from pending list.');
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
                    
                    {/* Document Previews */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <PhoneCall className="w-4 h-4 text-[#C5A059]" /> {app.phone || 'No phone mapped'} (Owner: {app.ownerName})
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
                      onClick={() => handleApprove(app)}
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
                          <XCircle className="w-4 h-4" /> Decline & Delete
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
    </div>
  );
}
