"use client";

import { useState } from "react";
import { collection, query, where, getDocs, updateDoc, doc, deleteField } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

interface StaffAccountsTabProps {
  userUid: string;
  roleType: "weaver" | "store" | "wholesaler" | "supplier";
  staffMembers: string[];
  setStaffMembers: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function StaffAccountsTab({ userUid, roleType, staffMembers, setStaffMembers }: StaffAccountsTabProps) {
  const [staffEmailInput, setStaffEmailInput] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(["products", "orders"]);
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!staffEmailInput || staffMembers.includes(staffEmailInput.toLowerCase())) return;
    
    setLoading(true);
    const emailToInvite = staffEmailInput.toLowerCase();
    try {
      const q = query(collection(db, "users"), where("email", "==", emailToInvite));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const staffDoc = querySnapshot.docs[0];
        
        let newRole = "store_staff";
        if (roleType === "weaver") newRole = "weaver_staff";
        if (roleType === "wholesaler") newRole = "wholesaler_staff";
        if (roleType === "supplier") newRole = "supplier_staff";
        
        await updateDoc(staffDoc.ref, {
          role: newRole,
          bossUid: userUid,
          vendorPermissions: selectedPermissions
        });
        
        const newStaff = [...staffMembers, emailToInvite];
        setStaffMembers(newStaff);
        
        await updateDoc(doc(db, "users", userUid), {
          staffMembers: newStaff
        });
        
        // Also update the specific role document if applicable
        if (roleType === "wholesaler") {
          await updateDoc(doc(db, "wholesalers", userUid), { staffMembers: newStaff });
        } else if (roleType === "supplier") {
          await updateDoc(doc(db, "suppliers", userUid), { staffMembers: newStaff });
        }
        
        setStaffEmailInput("");
        alert("Staff successfully linked! When they log in, they will have access to your catalog.");
      } else {
        alert("User not found! Please ask them to create an account on Bhulia.com first using this email, then try inviting them again.");
      }
    } catch (error) {
      console.error("Error inviting staff:", error);
      alert("Error inviting staff.");
    }
    setLoading(false);
  };

  const handleRemove = async (emailToRemove: string) => {
    if (!confirm(`Are you sure you want to remove ${emailToRemove}?`)) return;
    
    setLoading(true);
    try {
      const q = query(collection(db, "users"), where("email", "==", emailToRemove));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const staffDoc = querySnapshot.docs[0];
        await updateDoc(staffDoc.ref, {
          role: "customer", // Downgrade back to normal user
          bossUid: null,
          vendorPermissions: deleteField ? deleteField() : null
        });
      }
      
      const newStaff = staffMembers.filter(e => e !== emailToRemove);
      setStaffMembers(newStaff);
      
      await updateDoc(doc(db, "users", userUid), {
        staffMembers: newStaff
      });
      
      if (roleType === "wholesaler") {
        await updateDoc(doc(db, "wholesalers", userUid), { staffMembers: newStaff });
      } else if (roleType === "supplier") {
        await updateDoc(doc(db, "suppliers", userUid), { staffMembers: newStaff });
      }
      
    } catch (error) {
      console.error("Error removing staff:", error);
      alert("Error removing staff.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6 animate-in fade-in max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Staff Accounts</h2>
        <span className="px-3 py-1 bg-blue-50 text-[#0070F3] rounded-full text-xs font-bold border border-blue-100">{staffMembers.length} / 2 Used</span>
      </div>
      <p className="text-sm text-gray-500 font-medium">Invite up to 2 assistants. Staff can only access the "My Catalog" and "Upload Product" tabs.</p>
      
      {staffMembers.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 font-medium mb-6">No staff members invited yet.</div>
      ) : (
        <div className="space-y-4 mb-6">
          {staffMembers.map((email) => (
            <div key={email} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-gray-700 shadow-sm">{email[0].toUpperCase()}</div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{email}</p>
                  <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Active</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(`Hello! You have been granted Staff access to my dashboard on Bhulia Hub. Please go to https://bhulia.com/login and log in using your email (${email}) to access the catalog.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-500 hover:text-green-700 p-2 hover:bg-green-50 rounded-lg transition-colors"
                  title="Send via WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
                <button disabled={loading} onClick={() => handleRemove(email)} className="text-red-500 hover:text-red-700 font-bold text-xs disabled:opacity-50 px-2 py-1 hover:bg-red-50 rounded-md transition-colors">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {staffMembers.length < 2 && (
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Invite New Staff</h3>
          
          <div className="mb-4">
            <label className="text-xs font-bold text-gray-700 block mb-2">Staff Permissions (What can they access?)</label>
            <div className="flex flex-wrap gap-3">
              {['products', 'orders', 'marketing', 'messages'].map(perm => (
                <label key={perm} className="flex items-center gap-2 cursor-pointer bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    checked={selectedPermissions.includes(perm)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedPermissions([...selectedPermissions, perm]);
                      else setSelectedPermissions(selectedPermissions.filter(p => p !== perm));
                    }}
                  />
                  <span className="text-sm font-bold text-gray-700 capitalize">{perm}</span>
                </label>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-2 font-medium bg-red-50 p-2 rounded border border-red-100 text-red-800">
              Note: Staff accounts can NEVER access Bank details, Wallet Payouts, or Subscription billing.
            </p>
          </div>

          <div className="flex gap-4">
            <input 
              type="email" 
              value={staffEmailInput}
              onChange={(e) => setStaffEmailInput(e.target.value)}
              placeholder="Assistant's Email Address" 
              className="flex-1 border-2 border-gray-300 rounded-xl p-3 text-sm text-gray-900 font-medium shadow-sm focus:ring-4 focus:ring-[#0070F3]/15 focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none" 
            />
            <button 
              onClick={handleInvite}
              disabled={!staffEmailInput || selectedPermissions.length === 0 || loading}
              className="bg-[#1f2937] text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
