"use client";

import React, { useState, useEffect } from "react";
import ImageUploader from "@/components/ImageUploader";
import { updateDocumentStatus } from "@/lib/db-hooks";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "@/lib/firebase";

export default function AdminUserEditModal({ user, onClose, handleConvertRole }: { user: any, onClose: () => void, handleConvertRole: (role: any) => void }) {
  const [modalStep, setModalStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    whatsapp: user.whatsapp || "",
    email: user.email || "",
    address: user.address || "",
    description: user.description || "",
    googleMapsLink: user.googleMapsLink || "",
    specialties: user.specialties ? user.specialties.join(", ") : "",
    img: user.img || "", // Logo
    coverImages: user.coverImages || [], // Bento images
    kycType: user.kycType || "",
    kycId: user.kycId || "",
    kycDocumentUrl: user.kycDocumentUrl || "",
    bankHolder: user.bankHolder || "",
    bankName: user.bankName || "",
    bankAccount: user.bankAccount || "",
    bankIfsc: user.bankIfsc || "",
    bankUpi: user.bankUpi || "",
    isAutoApproved: user.isAutoApproved || false,
    canSellWholesale: user.canSellWholesale || false,
    maxProductsAllowed: user.maxProductsAllowed || 10,
    status: user.status || "approved"
  });

  // Hydrate additional data that might not be in the mock `user` list from AdminUsers
  useEffect(() => {
    const fetchFullProfile = async () => {
      if (user.role === 'weaver' || user.role === 'store') {
        const col = user.role === 'weaver' ? 'weavers' : 'stores';
        const snap = await getDoc(doc(db, col, user.id));
        if (snap.exists()) {
          const d = snap.data();
          setFormData(prev => ({
            ...prev,
            description: d.description || d.desc || "",
            googleMapsLink: d.googleMapsLink || "",
            specialties: Array.isArray(d.specialties) ? d.specialties.join(", ") : "",
            img: d.img || d.logoUrl || "",
            coverImages: d.coverImages || [],
            bankHolder: d.bankHolder || "",
            bankName: d.bankName || "",
            bankAccount: d.bankAccount || "",
            bankIfsc: d.bankIfsc || "",
            bankUpi: d.bankUpi || "",
          }));
        }
      }
    };
    fetchFullProfile();
  }, [user.id, user.role]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const col = user.role === 'weaver' ? 'weavers' : user.role === 'store' ? 'stores' : user.role === 'reseller' ? 'resellers' : 'users';
      
      const updates: any = {
        title: formData.name,
        name: formData.name,
        phone: formData.phone,
        phoneNumber: formData.phone,
        whatsapp: formData.whatsapp,
        email: formData.email,
        address: formData.address,
        isAutoApproved: formData.isAutoApproved,
        status: formData.status,
      };

      if (user.role === 'weaver' || user.role === 'store') {
        updates.description = formData.description;
        updates.desc = formData.description;
        updates.googleMapsLink = formData.googleMapsLink;
        updates.specialties = formData.specialties ? formData.specialties.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
        updates.img = formData.img;
        updates.coverImages = formData.coverImages;
        updates.bankHolder = formData.bankHolder;
        updates.bankName = formData.bankName;
        updates.bankAccount = formData.bankAccount;
        updates.bankIfsc = formData.bankIfsc;
        updates.bankUpi = formData.bankUpi;
        updates.canSellWholesale = formData.canSellWholesale;
        if (user.role === 'weaver') {
          updates['subscription.uploadLimit'] = parseInt(formData.maxProductsAllowed as any);
        } else {
          updates.productLimit = parseInt(formData.maxProductsAllowed as any);
        }
      }

      await updateDocumentStatus(col, user.id, updates);
      
      // Also sync user collection for KYC
      if (formData.kycType || formData.kycId || formData.kycDocumentUrl) {
         const userDocRef = doc(db, 'users', user.id);
         const userSnap = await getDoc(userDocRef);
         if (userSnap.exists()) {
             await updateDoc(userDocRef, {
                 kycType: formData.kycType,
                 kycId: formData.kycId,
                 kycDocumentUrl: formData.kycDocumentUrl,
             });
         }
      }

      alert("Profile updated successfully!");
      onClose();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateOrphanLogin = async () => {
    const emailInput = document.getElementById('crmDummyEmail') as HTMLInputElement;
    const pwdInput = document.getElementById('crmDummyPwd') as HTMLInputElement;
    if (!emailInput.value || !pwdInput.value) return alert('Enter email and password');
    
    try {
      const secondaryApp = initializeApp(firebaseConfig, "Secondary" + Date.now());
      const secondaryAuth = getAuth(secondaryApp);
      const cred = await createUserWithEmailAndPassword(secondaryAuth, emailInput.value, pwdInput.value);
      const newUid = cred.user.uid;
      
      const col = user.role === 'weaver' ? 'weavers' : 'stores';
      const oldDocRef = doc(db, col, user.id);
      const newDocRef = doc(db, col, newUid);
      const oldSnap = await getDoc(oldDocRef);
      if (oldSnap.exists()) {
        await setDoc(newDocRef, { ...oldSnap.data(), uid: newUid, updatedAt: serverTimestamp() });
        await setDoc(doc(db, 'users', newUid), {
          uid: newUid,
          email: emailInput.value,
          role: user.role,
          weaverDocId: newUid,
          createdAt: serverTimestamp()
        });
        await updateDoc(oldDocRef, { status: "migrated", migratedTo: newUid });
        alert('Credentials created! They can now log in.');
        onClose();
      }
      await secondaryAuth.signOut();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100 bg-white z-20 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-2xl font-black text-gray-900">Edit {user.role === 'weaver' ? 'Weaver' : user.role === 'store' ? 'Store' : 'User'} Profile</h3>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-100 text-blue-700">
                {user.role}
              </span>
            </div>
            <div className="text-xs text-gray-500 font-mono">ID: {user.id} | {formData.name}</div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-200 text-gray-500 rounded-full transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Tabs */}
        {(user.role === 'weaver' || user.role === 'store') && (
          <div className="flex border-b border-gray-100 shrink-0">
            <button onClick={() => setModalStep(1)} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${modalStep === 1 ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>1. Brand & Media</button>
            <button onClick={() => setModalStep(2)} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${modalStep === 2 ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>2. Store Details & Admin</button>
            <button onClick={() => setModalStep(3)} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${modalStep === 3 ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>3. KYC & Bank Details</button>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          
          {/* STEP 1: Brand & Media */}
          {(user.role === 'weaver' || user.role === 'store') && modalStep === 1 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 mb-4 border-b pb-2">Dedicated Logo & Bento Images</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Logo Slot */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-xs font-bold text-gray-700 uppercase mb-2 block">Dedicated Logo</span>
                    <ImageUploader label="Upload Logo" aspectRatio="square" value={formData.img} onChange={(url) => setFormData({...formData, img: url})} />
                  </div>

                  {/* Hero Slot */}
                  <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm relative">
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-xl z-10">HERO (MAIN)</div>
                    <span className="text-xs font-bold text-gray-700 uppercase mb-2 block">Hero Image</span>
                    <ImageUploader label="Upload Hero" aspectRatio="square" value={formData.coverImages[0] || ""} onChange={(url) => {
                      const newCovers = [...formData.coverImages];
                      newCovers[0] = url;
                      setFormData({...formData, coverImages: newCovers});
                    }} />
                  </div>

                  {/* Grid Slots */}
                  {[1, 2, 3, 4].map(idx => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <span className="text-xs font-bold text-gray-700 uppercase mb-2 block">Grid Image {idx}</span>
                      <ImageUploader label={`Upload Grid ${idx}`} aspectRatio="square" value={formData.coverImages[idx] || ""} onChange={(url) => {
                        const newCovers = [...formData.coverImages];
                        while (newCovers.length <= idx) newCovers.push("");
                        newCovers[idx] = url;
                        setFormData({...formData, coverImages: newCovers});
                      }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Store Details (Or standard user details if not weaver/store) */}
          {((user.role === 'weaver' || user.role === 'store') ? modalStep === 2 : true) && (
            <div className="space-y-6">
              
              {/* Orphan Credentials (if N/A email) */}
              {(user.email === 'N/A' || !user.email) && (user.role === 'weaver' || user.role === 'store') && (
                <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                  <h4 className="text-sm font-bold text-purple-900 uppercase mb-2">Orphan Profile / Dummy Account</h4>
                  <p className="text-sm text-purple-800 font-medium mb-4">Create credentials for this user so they can log in and claim the profile.</p>
                  <div className="flex gap-3">
                    <input id="crmDummyEmail" type="email" placeholder="Email" className="flex-1 border border-purple-200 rounded-lg px-3 py-2 text-sm" />
                    <input id="crmDummyPwd" type="text" defaultValue="bhulia123" className="w-32 border border-purple-200 rounded-lg px-3 py-2 text-sm" />
                    <button onClick={handleCreateOrphanLogin} className="bg-purple-600 text-white px-4 rounded-lg font-bold">Create Login</button>
                  </div>
                </div>
              )}

              {/* Admin God Mode Panel */}
              {(user.role === 'weaver' || user.role === 'store') && (
                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200 flex flex-wrap gap-6 items-center">
                  <div>
                    <h4 className="text-sm font-black text-orange-900 uppercase">Admin God Mode</h4>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-orange-900 uppercase">Max Products:</label>
                      <input type="number" value={formData.maxProductsAllowed} onChange={e => setFormData({...formData, maxProductsAllowed: parseInt(e.target.value)})} className="w-20 border border-orange-300 rounded-lg p-2 text-sm font-bold text-center" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.isAutoApproved} onChange={e => setFormData({...formData, isAutoApproved: e.target.checked})} className="w-4 h-4 text-orange-600 border-orange-300 rounded" />
                      <span className="text-xs font-bold text-orange-900 uppercase">VIP Auto-Approval</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.canSellWholesale} onChange={e => setFormData({...formData, canSellWholesale: e.target.checked})} className="w-4 h-4 text-purple-600 border-purple-300 rounded" />
                      <span className="text-xs font-bold text-purple-900 uppercase">B2B Privileges</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Core Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 border-b pb-2"><h4 className="text-sm font-bold">Core Information</h4></div>
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Name / Title</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg px-4 py-2 text-sm" /></div>
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Email</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border rounded-lg px-4 py-2 text-sm" /></div>
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Phone</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border rounded-lg px-4 py-2 text-sm" /></div>
                <div><label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp</label><input type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full border rounded-lg px-4 py-2 text-sm" /></div>
                
                {/* Weaver/Store Only */}
                {(user.role === 'weaver' || user.role === 'store') && (
                  <>
                    <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-700 mb-1">Bio / Description</label><textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded-lg px-4 py-2 text-sm" /></div>
                    <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-700 mb-1">Google Maps Link</label><input type="text" value={formData.googleMapsLink} onChange={e => setFormData({...formData, googleMapsLink: e.target.value})} className="w-full border rounded-lg px-4 py-2 text-sm" /></div>
                    <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-700 mb-1">Specialties (Comma Separated)</label><input type="text" value={formData.specialties} onChange={e => setFormData({...formData, specialties: e.target.value})} className="w-full border rounded-lg px-4 py-2 text-sm" /></div>
                  </>
                )}
                
                <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-700 mb-1">Address</label><input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border rounded-lg px-4 py-2 text-sm" /></div>
              </div>
            </div>
          )}

          {/* STEP 3: KYC & Bank */}
          {(user.role === 'weaver' || user.role === 'store') && modalStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 border-b pb-2"><h4 className="text-sm font-bold">KYC Details</h4></div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Document Type</label>
                  <select value={formData.kycType} onChange={e => setFormData({...formData, kycType: e.target.value})} className="w-full border rounded-lg px-4 py-2 text-sm">
                    <option value="">Select</option><option value="GST">GST</option><option value="Aadhar">Aadhar</option><option value="PAN">PAN</option>
                  </select>
                </div>
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Document ID</label><input type="text" value={formData.kycId} onChange={e => setFormData({...formData, kycId: e.target.value})} className="w-full border rounded-lg px-4 py-2 text-sm" /></div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">KYC Upload</label>
                  <ImageUploader label="Upload KYC" aspectRatio="video" value={formData.kycDocumentUrl} onChange={url => setFormData({...formData, kycDocumentUrl: url})} />
                </div>

                <div className="md:col-span-2 border-b pb-2 mt-4"><h4 className="text-sm font-bold">Bank Details</h4></div>
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Account Holder Name</label><input type="text" value={formData.bankHolder} onChange={e => setFormData({...formData, bankHolder: e.target.value})} className="w-full border rounded-lg px-4 py-2 text-sm" /></div>
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Bank Name</label><input type="text" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full border rounded-lg px-4 py-2 text-sm" /></div>
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Account Number</label><input type="text" value={formData.bankAccount} onChange={e => setFormData({...formData, bankAccount: e.target.value})} className="w-full border rounded-lg px-4 py-2 text-sm" /></div>
                <div><label className="block text-xs font-bold text-gray-700 mb-1">IFSC Code</label><input type="text" value={formData.bankIfsc} onChange={e => setFormData({...formData, bankIfsc: e.target.value})} className="w-full border rounded-lg px-4 py-2 text-sm" /></div>
                <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-700 mb-1">UPI ID</label><input type="text" value={formData.bankUpi} onChange={e => setFormData({...formData, bankUpi: e.target.value})} className="w-full border rounded-lg px-4 py-2 text-sm" /></div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
          <button onClick={onClose} disabled={isSubmitting} className="text-gray-500 font-bold hover:text-gray-900 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm">
            {isSubmitting ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
