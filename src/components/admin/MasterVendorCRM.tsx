"use client";

import React, { useState, useMemo } from 'react';
import { Search, Shield, Ban, Star, KeyRound, MoreVertical, LogIn, Plus, X, Edit2, UploadCloud } from 'lucide-react';
import { useWeavers, useStores, useWholesalers, useSuppliers } from '@/lib/db-hooks';
import { db } from '@/lib/firebase';
import { deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import ImageUploader from '@/components/ImageUploader';
import { INDIAN_STATES, ODISHA_DISTRICTS, ODISHA_DISTRICT_BLOCKS } from '@/lib/locations';

export default function MasterVendorCRM() {
  const { weavers, loading: wLoading } = useWeavers(1000);
  const { stores, loading: sLoading } = useStores(1000);
  const { wholesalers, loading: whLoading } = useWholesalers(1000);
  const { suppliers, loading: suLoading } = useSuppliers(1000);
  const loading = wLoading || sLoading || whLoading || suLoading;

  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedShop, setSelectedShop] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '', phone: '', whatsapp: '', email: '', website: '', desc: '',
    country: 'India', state: '', district: '', block: '', address: '',
    img: '', heroImg: '', gallery: [] as string[],
    status: 'approved', role: 'store', // weaver, store, wholesaler, supplier
    weaverExperience: '', generations: '', materials: '', scale: '', productsOffered: '',
    kycType: '', kycId: '', kycDocumentUrl: '',
    bankHolder: '', bankName: '', bankAccount: '', bankIfsc: '', bankUpi: '',
    subscriptionTier: 'free', subscriptionExpiresAt: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allVendors = useMemo(() => {
    const wList = weavers.map(w => ({ ...w, _collectionRole: 'weaver' }));
    const sList = stores.map(s => ({ ...s, _collectionRole: 'store' }));
    const whList = wholesalers.map(wh => ({ ...wh, _collectionRole: 'wholesaler' }));
    const suList = suppliers.map(su => ({ ...su, _collectionRole: 'supplier' }));
    return [...wList, ...sList, ...whList, ...suList];
  }, [weavers, stores, wholesalers, suppliers]);

  const filteredShops = allVendors.filter(shop => {
    const shopNameStr = shop.title || '';
    return shopNameStr.toLowerCase().includes(searchTerm.toLowerCase()) || 
           (shop.phone && shop.phone.includes(searchTerm));
  });

  const handleHardDelete = async (shopId: string, shopName: string, role: string) => {
    const confirmation = prompt(`Type "DELETE" to permanently remove ${shopName} from the database. This action cannot be undone.`);
    if (confirmation !== 'DELETE') {
      alert('Deletion cancelled.');
      return;
    }
    
    try {
      const collectionName = role === "weaver" ? "weavers" : role === "store" ? "stores" : role === "wholesaler" ? "wholesalers" : "suppliers";
      await deleteDoc(doc(db, collectionName, shopId));
      alert(`${shopName} has been permanently deleted.`);
    } catch (e) {
      console.error(e);
      alert('Failed to delete shop.');
    }
  };

  const openAddModal = () => {
    setSelectedShop(null);
    setFormData({
      title: '', phone: '', whatsapp: '', email: '', website: '', desc: '',
      country: 'India', state: '', district: '', block: '', address: '',
      img: '', heroImg: '', gallery: [],
      status: 'approved', role: 'store',
      weaverExperience: '', generations: '', materials: '', scale: '', productsOffered: '',
      kycType: '', kycId: '', kycDocumentUrl: '',
      bankHolder: '', bankName: '', bankAccount: '', bankIfsc: '', bankUpi: '',
      subscriptionTier: 'free', subscriptionExpiresAt: ''
    });
    setModalStep(1);
    setShowAddModal(true);
  };

  const openEditModal = (shop: any) => {
    setSelectedShop(shop);
    setFormData({
      title: shop.title || '',
      phone: shop.phone || shop.phoneNumber || '',
      whatsapp: shop.whatsapp || shop.whatsappNumber || '',
      email: shop.email || '',
      website: shop.website || '',
      desc: shop.desc || shop.description || '',
      country: shop.country || 'India',
      state: shop.state || '',
      district: shop.district || '',
      block: shop.block || '',
      address: shop.address || '',
      img: shop.img || shop.image || shop.logoUrl || '',
      heroImg: shop.heroImg || '',
      gallery: shop.gallery || [],
      status: shop.status || 'approved',
      role: shop._collectionRole || 'store',
      weaverExperience: shop.weaverExperience || '',
      generations: shop.generations || '',
      materials: shop.materials || '',
      scale: shop.scale || '',
      productsOffered: shop.productsOffered || '',
      kycType: shop.kycType || '',
      kycId: shop.kycId || '',
      kycDocumentUrl: shop.kycDocumentUrl || '',
      bankHolder: shop.bankHolder || '',
      bankName: shop.bankName || '',
      bankAccount: shop.bankAccount || '',
      bankIfsc: shop.bankIfsc || '',
      bankUpi: shop.bankUpi || '',
      subscriptionTier: shop.subscriptionTier || 'free',
      subscriptionExpiresAt: shop.subscriptionExpiresAt || ''
    });
    setModalStep(1);
    setShowEditModal(true);
  };

  const handleSaveShop = async () => {
    setIsSubmitting(true);
    try {
      const collectionName = formData.role === "weaver" ? "weavers" : formData.role === "store" ? "stores" : formData.role === "wholesaler" ? "wholesalers" : "suppliers";
      const docId = selectedShop ? selectedShop.id : Date.now().toString();
      
      const saveData = {
        title: formData.title,
        desc: formData.desc,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        email: formData.email,
        website: formData.website,
        country: formData.country,
        state: formData.state,
        district: formData.district,
        block: formData.block,
        address: formData.address,
        img: formData.img,
        heroImg: formData.heroImg,
        gallery: formData.gallery,
        status: formData.status,
        weaverExperience: formData.weaverExperience,
        generations: formData.generations,
        materials: formData.materials,
        scale: formData.scale,
        productsOffered: formData.productsOffered,
        kycType: formData.kycType,
        kycId: formData.kycId,
        kycDocumentUrl: formData.kycDocumentUrl,
        bankHolder: formData.bankHolder,
        bankName: formData.bankName,
        bankAccount: formData.bankAccount,
        bankIfsc: formData.bankIfsc,
        bankUpi: formData.bankUpi,
        subscriptionTier: formData.subscriptionTier,
        subscriptionExpiresAt: formData.subscriptionExpiresAt,
        updatedAt: new Date().toISOString()
      };

      if (!selectedShop) {
        (saveData as any).createdAt = new Date().toISOString();
      }

      await setDoc(doc(db, collectionName, docId), saveData, { merge: true });
      
      alert(`Vendor ${selectedShop ? 'updated' : 'added'} successfully!`);
      setShowAddModal(false);
      setShowEditModal(false);
    } catch (e) {
      console.error(e);
      alert('Failed to save vendor. Please check permissions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateCredentials = async (shop: any) => {
    if (!shop.email) {
      alert('Cannot verify! This vendor does not have an owner email mapped. Please edit the vendor and add an email to generate login credentials.');
      return;
    }
    const pwd = Math.random().toString(36).slice(-8);
    alert(`Mock Registration: Created user ${shop.email} with password: ${pwd}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-blue-600 font-bold animate-pulse">Loading Vendors...</div>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            Master Vendor CRM
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Manage all Bhulia Hub sellers in one place (Weavers, Shops, B2B, Suppliers).</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Vendor
        </button>
      </header>

      {/* Global Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by vendor name, owner name, or phone number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-blue-500 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Vendor List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="py-4 px-6">Vendor Info</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Contact & Status</th>
                <th className="py-4 px-6 text-right sticky right-0 bg-gray-50 shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.1)]">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredShops.map((shop: any) => (
                <tr key={shop.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {shop.img || shop.image || shop.logoUrl ? (
                          <img src={shop.img || shop.image || shop.logoUrl} alt={shop.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-400 font-bold text-lg">{shop.title?.charAt(0) || '?'}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-1">
                          {shop.title}
                          {shop.subscriptionTier === 'advance' && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                          {shop.subscriptionTier === 'pro' && <Star className="w-3 h-3 text-blue-500 fill-blue-500" />}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{shop.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700">
                      {shop._collectionRole}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-900 font-medium">{shop.phone || shop.phoneNumber || 'No Phone'}</span>
                      {shop.status === 'pending_approval' ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-full w-max border border-amber-200">
                          <Shield className="w-3 h-3" /> Pending Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full w-max border border-green-200">
                          <Shield className="w-3 h-3" /> Verified Active
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2 sticky right-0 bg-white group-hover:bg-blue-50/100 shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.05)] transition-colors">
                    <button onClick={() => generateCredentials(shop)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-all shadow-sm" title="Generate Credentials">
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => openEditModal(shop)} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm" title="Edit Shop">
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => handleHardDelete(shop.id, shop.title, shop._collectionRole)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all shadow-sm" title="Delete Shop">
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Shop Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10 shrink-0">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {showAddModal ? <><Plus className="w-5 h-5 text-blue-600"/> Add New Vendor</> : <><Edit2 className="w-5 h-5 text-blue-600"/> Edit Vendor Profile</>}
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Tabs Header */}
            <div className="flex border-b border-gray-100 shrink-0 overflow-x-auto">
              <button onClick={() => setModalStep(1)} className={`flex-1 min-w-[120px] py-4 px-2 text-sm font-bold border-b-2 transition-colors ${modalStep === 1 ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                1. Brand & Media
              </button>
              <button onClick={() => setModalStep(2)} className={`flex-1 min-w-[150px] py-4 px-2 text-sm font-bold border-b-2 transition-colors ${modalStep === 2 ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                2. Identity & Trade
              </button>
              <button onClick={() => setModalStep(3)} className={`flex-1 min-w-[120px] py-4 px-2 text-sm font-bold border-b-2 transition-colors ${modalStep === 3 ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                3. KYC & Bank
              </button>
              <button onClick={() => setModalStep(4)} className={`flex-1 min-w-[120px] py-4 px-2 text-sm font-bold border-b-2 transition-colors ${modalStep === 4 ? 'border-amber-600 text-amber-600 bg-amber-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                4. God Mode
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 bg-gray-50">
              {/* STEP 1: Brand & Media */}
              <div className={`space-y-6 ${modalStep === 1 ? 'block' : 'hidden'}`}>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg flex items-start gap-2">
                    <span className="text-xl leading-none">⚠️</span>
                    <div className="text-xs font-medium">
                      <strong>Important:</strong> Uploading an image here only shows a preview. You MUST click <strong>"Save Shop Profile"</strong> to permanently save your images!
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Logo Slot */}
                    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col">
                      <span className="text-xs font-bold text-gray-700 uppercase mb-3 block">Dedicated Logo</span>
                      <ImageUploader label="Upload Logo" aspectRatio="square" value={formData.img} onChange={(url) => setFormData({...formData, img: url})} />
                    </div>

                    {/* Hero Slot */}
                    <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 flex flex-col">
                      <span className="text-xs font-bold text-blue-800 uppercase mb-3 block">Hero Banner Image</span>
                      <ImageUploader label="Upload Hero Image" aspectRatio="landscape" value={formData.heroImg} onChange={(url) => setFormData({...formData, heroImg: url})} />
                    </div>

                    {/* Gallery Slots */}
                    <div className="md:col-span-2 mt-4">
                       <h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-4">5-Image Bento Box (Gallery)</h4>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         {[0, 1, 2, 3].map(idx => (
                           <div key={idx} className="p-3 rounded-xl border border-gray-200 bg-white flex flex-col">
                             <span className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Gallery Image {idx+1}</span>
                             <ImageUploader 
                               label="Upload" 
                               aspectRatio="square" 
                               value={formData.gallery[idx] || ""} 
                               onChange={(url) => {
                                 const newGal = [...formData.gallery];
                                 while (newGal.length <= idx) newGal.push("");
                                 newGal[idx] = url;
                                 setFormData({...formData, gallery: newGal});
                               }} 
                             />
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 2: Identity & Trade */}
              <div className={`space-y-6 ${modalStep === 2 ? 'block' : 'hidden'}`}>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2"><h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-2">Core Identity</h4></div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Business Name *</label>
                      <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Owner Email (For Login) *</label>
                      <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                      <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp Number</label>
                      <input type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Website URL</label>
                      <input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                      <textarea rows={3} value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div className="md:col-span-2 mt-4"><h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-2">Location (5-Tier System)</h4></div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Country</label>
                      <select value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value, state: '', district: '', block: ''})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="India">India</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {formData.country === 'India' && (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
                        <select value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value, district: '', block: ''})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white">
                          <option value="">Select State</option>
                          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    )}
                    {formData.state === 'Odisha' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">District</label>
                          <select value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value, block: ''})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white">
                            <option value="">Select District</option>
                            {ODISHA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Block / City</label>
                          <select value={formData.block} onChange={(e) => setFormData({...formData, block: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white">
                            <option value="">Select Block</option>
                            {formData.district && (ODISHA_DISTRICT_BLOCKS as any)[formData.district]?.map((b: string) => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                      </>
                    )}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Local Address & Pincode</label>
                      <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="Street, village, pincode..." />
                    </div>

                    <div className="md:col-span-2 mt-4"><h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-2">Trade & Craftsmanship</h4></div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Weaver Experience (Years)</label>
                      <input type="text" value={formData.weaverExperience} onChange={e => setFormData({...formData, weaverExperience: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Generations in Business</label>
                      <input type="text" value={formData.generations} onChange={e => setFormData({...formData, generations: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Materials Used</label>
                      <input type="text" value={formData.materials} onChange={e => setFormData({...formData, materials: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="Cotton, Silk, etc." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Scale of Production</label>
                      <input type="text" value={formData.scale} onChange={e => setFormData({...formData, scale: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Products Offered</label>
                      <input type="text" value={formData.productsOffered} onChange={e => setFormData({...formData, productsOffered: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="Sarees, Dress Materials, etc." />
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3: KYC & Bank */}
              <div className={`space-y-6 ${modalStep === 3 ? 'block' : 'hidden'}`}>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2"><h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-2">KYC Document</h4></div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Document Type</label>
                      <select value={formData.kycType} onChange={e => setFormData({...formData, kycType: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="">Select...</option>
                        <option value="Aadhar">Aadhar</option>
                        <option value="PAN">PAN</option>
                        <option value="ArtisanCard">Artisan Card</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Document ID Number</label>
                      <input type="text" value={formData.kycId} onChange={e => setFormData({...formData, kycId: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-2">Upload KYC File</label>
                      <ImageUploader label="Upload Photo" aspectRatio="landscape" value={formData.kycDocumentUrl} onChange={(url) => setFormData({...formData, kycDocumentUrl: url})} />
                    </div>

                    <div className="md:col-span-2 mt-4"><h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-2">Bank & UPI for Payouts</h4></div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Account Holder Name</label>
                      <input type="text" value={formData.bankHolder} onChange={e => setFormData({...formData, bankHolder: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Bank Name</label>
                      <input type="text" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Account Number</label>
                      <input type="text" value={formData.bankAccount} onChange={e => setFormData({...formData, bankAccount: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">IFSC Code</label>
                      <input type="text" value={formData.bankIfsc} onChange={e => setFormData({...formData, bankIfsc: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">UPI ID (Optional)</label>
                      <input type="text" value={formData.bankUpi} onChange={e => setFormData({...formData, bankUpi: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 4: God Mode */}
              <div className={`space-y-6 ${modalStep === 4 ? 'block' : 'hidden'}`}>
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                  <div className="flex justify-between items-center mb-6 border-b border-amber-200 pb-4">
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">Admin Privileges & SaaS Tiers</h4>
                      <p className="text-[10px] text-amber-700 mt-1">Override vendor roles, status, and subscription tiers.</p>
                    </div>
                    <div className="text-2xl">👑</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">Vendor Role Category</label>
                      <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border border-amber-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white font-bold">
                        <option value="weaver">Weaver</option>
                        <option value="store">Store</option>
                        <option value="wholesaler">Wholesaler</option>
                        <option value="supplier">Supplier</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">Verification Status</label>
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border border-amber-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white font-bold">
                        <option value="approved">Verified Active</option>
                        <option value="pending_approval">Pending Review</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">SaaS Subscription Tier</label>
                      <select value={formData.subscriptionTier} onChange={e => setFormData({...formData, subscriptionTier: e.target.value})} className="w-full border border-amber-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white font-bold">
                        <option value="free">Free Tier</option>
                        <option value="pro">Pro Tier</option>
                        <option value="advance">Advance Pro Tier</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">Subscription Expires At</label>
                      <input type="date" value={formData.subscriptionExpiresAt} onChange={e => setFormData({...formData, subscriptionExpiresAt: e.target.value})} className="w-full border border-amber-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-between items-center z-10 shrink-0">
              <button disabled={isSubmitting} onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="text-gray-500 text-sm font-bold hover:text-gray-900 transition-colors">
                Cancel
              </button>
              <div className="flex gap-3">
                {modalStep > 1 && (
                  <button onClick={() => setModalStep(prev => (prev - 1) as 1 | 2 | 3)} className="px-5 py-2.5 text-gray-700 bg-gray-50 border border-gray-300 font-bold hover:bg-gray-100 rounded-lg transition-colors shadow-sm">
                    Back
                  </button>
                )}
                {modalStep < 4 ? (
                  <button onClick={() => setModalStep(prev => (prev + 1) as 2 | 3 | 4)} className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
                    Next
                  </button>
                ) : (
                  <button disabled={isSubmitting} onClick={handleSaveShop} className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 flex items-center gap-2">
                    {isSubmitting ? 'Saving...' : 'Save Vendor Profile'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
