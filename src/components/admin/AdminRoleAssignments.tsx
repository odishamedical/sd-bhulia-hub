import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const ADMIN_MODULES = [
  { id: 'dashboard', label: 'Global Dashboard' },
  { id: 'logistics-dispatch', label: 'Active Dispatch' },
  { id: 'orders-returns', label: 'Returns & B2B' },
  { id: 'payouts', label: 'Seller Payouts' },
  { id: 'commissions', label: 'Reseller Commissions' },
  { id: 'affiliates', label: 'Affiliate Tracking' },
  { id: 'escrow', label: 'Escrow Management' },
  { id: 'tax', label: 'Tax & Compliance' },
  { id: 'subscriptions', label: 'SaaS Subscriptions' },
  { id: 'ads', label: 'Global Ads' },
  { id: 'coupons', label: 'Coupons & Offers' },
  { id: 'importer', label: 'Google Importer' },
  { id: 'google-crm', label: 'Google Data CRM' },
  { id: 'tickets', label: 'Support Tickets' },
  { id: 'fraud', label: 'Fraud Detection' },
  { id: 'audit', label: 'Activity Logs' },
  { id: 'settings', label: 'Platform Configuration' },
  { id: 'page-builder', label: 'Page Layout Builder' }
];

export default function AdminRoleAssignments() {
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['users']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "admin_invites"));
      setInvites(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (moduleId: string) => {
    if (selectedPermissions.includes(moduleId)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== moduleId));
    } else {
      setSelectedPermissions([...selectedPermissions, moduleId]);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return alert("Email is required");
    if (selectedPermissions.length === 0) return alert("Select at least one permission");

    setIsSubmitting(true);
    try {
      const cleanEmail = inviteEmail.trim().toLowerCase();
      
      // Save invite
      await setDoc(doc(db, "admin_invites", cleanEmail), {
        email: cleanEmail,
        role: "staff",
        permissions: selectedPermissions,
        createdAt: new Date().toISOString()
      });

      // We also preemptively create/update the users collection to grant access immediately upon login
      await setDoc(doc(db, "users", cleanEmail), {
        email: cleanEmail,
        role: "staff",
        adminPermissions: selectedPermissions,
        createdAt: new Date().toISOString()
      }, { merge: true });

      alert(`Invite sent to ${cleanEmail}! They can now log in with their Google account to access the panel.`);
      setInviteEmail('');
      setSelectedPermissions(['users']);
      fetchInvites();
    } catch (err: any) {
      console.error(err);
      alert("Failed to send invite: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (email: string) => {
    if (!confirm(`Are you sure you want to revoke admin access for ${email}?`)) return;
    try {
      await deleteDoc(doc(db, "admin_invites", email));
      
      // Downgrade user back to regular buyer
      await setDoc(doc(db, "users", email), {
        role: "buyer",
        adminPermissions: []
      }, { merge: true });

      fetchInvites();
    } catch (err) {
      console.error(err);
      alert("Failed to revoke access.");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-120px)]">
      
      {/* LEFT: Invite Form */}
      <div className="w-full lg:w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-6 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-blue-600 text-2xl">🛡️</span> Appoint Admin Staff
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Delegate specific modules to your team without giving them Master access.
          </p>
        </div>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-700 mb-1">Staff Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
              <input 
                type="email" 
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="staff@bhuliahub.com"
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-700 mb-3 flex items-center justify-between">
              Module Permissions
              <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px]">{selectedPermissions.length} selected</span>
            </label>
            <div className="space-y-2 bg-white p-3 border border-gray-200 rounded-xl max-h-[300px] overflow-y-auto custom-scrollbar">
              {ADMIN_MODULES.map(mod => (
                <div 
                  key={mod.id} 
                  onClick={() => togglePermission(mod.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors border ${selectedPermissions.includes(mod.id) ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-transparent border-transparent hover:bg-gray-50 text-gray-700'}`}
                >
                  {selectedPermissions.includes(mod.id) ? <span className="text-blue-600 shrink-0">✅</span> : <span className="text-gray-300 shrink-0">⬜</span>}
                  <span className="text-xs font-bold">{mod.label}</span>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={handleInvite}
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Inviting..." : <>🔑 Grant Access</>}
          </button>
        </div>
      </div>

      {/* RIGHT: Active Staff */}
      <div className="w-full lg:w-2/3 flex flex-col bg-white">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white z-10">
          <h3 className="text-lg font-bold text-gray-900">Active Admin Staff</h3>
          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-bold">{invites.length} Members</span>
        </div>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : invites.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl text-gray-200 mx-auto mb-4">🛡️</div>
              <h3 className="text-lg font-bold text-gray-400">No Staff Appointed</h3>
              <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">Use the form to grant specific module access to your team members.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invites.map(invite => (
                <div key={invite.id} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors bg-gray-50/50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                        {invite.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm truncate max-w-[150px]">{invite.email}</div>
                        <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{invite.role || 'Staff'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <a 
                        href={`https://wa.me/?text=${encodeURIComponent(`Hello! You have been granted Admin Staff access to Bhulia Hub. Please go to the website and log in using your email (${invite.email}) to access the Admin Panel.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-500 hover:text-green-700 p-2 hover:bg-green-50 rounded-lg transition-colors"
                        title="Send via WhatsApp"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      </a>
                      <button 
                        onClick={() => handleRevoke(invite.email)}
                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Revoke Access"
                      >
                        <span className="text-red-500">🗑️</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200/60">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Granted Modules ({invite.permissions?.length || 0})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {invite.permissions?.map((p: string) => {
                        const m = ADMIN_MODULES.find(mod => mod.id === p);
                        return (
                          <span key={p} className="bg-white border border-gray-200 text-gray-700 text-[10px] px-2 py-1 rounded shadow-sm">
                            {m ? m.label : p}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
