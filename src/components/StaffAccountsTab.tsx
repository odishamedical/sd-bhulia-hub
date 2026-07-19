"use client";

import { useState } from "react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

interface StaffAccountsTabProps {
  userUid: string;
  roleType: "weaver" | "store" | "wholesaler" | "supplier";
  staffMembers: string[];
  setStaffMembers: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function StaffAccountsTab({ userUid, roleType, staffMembers, setStaffMembers }: StaffAccountsTabProps) {
  const [staffEmailInput, setStaffEmailInput] = useState("");
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
          bossUid: userUid
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
          bossUid: null
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
              <button disabled={loading} onClick={() => handleRemove(email)} className="text-red-500 hover:text-red-700 font-bold text-xs disabled:opacity-50">Remove</button>
            </div>
          ))}
        </div>
      )}
      
      {staffMembers.length < 2 && (
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Invite New Staff</h3>
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
              disabled={!staffEmailInput || loading}
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
