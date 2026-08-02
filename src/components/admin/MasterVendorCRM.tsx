"use client";

import React, { useState, useMemo } from 'react';
import { Search, Shield, Ban, Star, KeyRound, MoreVertical, LogIn, Plus, X, Edit2, UploadCloud } from 'lucide-react';
import { useWeavers, useStores, useWholesalers, useSuppliers } from '@/lib/db-hooks';
import { db } from '@/lib/firebase';
import { deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';

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
    title: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    desc: '',
    address: '',
    img: '',
    heroImg: '',
    status: 'approved',
    role: 'store', // weaver, store, wholesaler, supplier
    weaverExperience: '',
    generations: '',
    materials: '',
    scale: '',
    productsOffered: ''
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
      title: '', phone: '', whatsapp: '', email: '', website: '', desc: '', address: '', img: '', heroImg: '',
      status: 'approved', role: 'store', weaverExperience: '', generations: '', materials: '', scale: '', productsOffered: ''
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
      address: shop.address || '',
      img: shop.img || shop.image || shop.logoUrl || '',
      heroImg: shop.heroImg || '',
      status: shop.status || 'approved',
      role: shop._collectionRole || 'store',
      weaverExperience: shop.weaverExperience || '',
      generations: shop.generations || '',
      materials: shop.materials || '',
      scale: shop.scale || '',
      productsOffered: shop.productsOffered || ''
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
        address: formData.address,
        img: formData.img,
        heroImg: formData.heroImg,
        status: formData.status,
        weaverExperience: formData.weaverExperience,
        generations: formData.generations,
        materials: formData.materials,
        scale: formData.scale,
        productsOffered: formData.productsOffered,
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
                        <div className="font-bold text-gray-900">{shop.title}</div>
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
                    <button onClick={() => handleHardDelete(shop.id, shop.title, shop._collectionRole)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all border border-red-100 shadow-sm" title="Delete Shop">
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                {showAddModal ? <><Plus className="w-6 h-6 text-blue-600"/> Add New Vendor</> : <><Edit2 className="w-6 h-6 text-blue-600"/> Edit Vendor Profile</>}
              </h2>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="space-y-8">
                
                {/* Section: Role & Basics */}
                <section>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Vendor Type</h3>
                  <select 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})} 
                    disabled={!!selectedShop}
                    className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none disabled:opacity-50"
                  >
                    <option value="weaver">Master Weaver</option>
                    <option value="store">Retail Shop</option>
                    <option value="wholesaler">B2B Wholesaler</option>
                    <option value="supplier">Raw Material Supplier</option>
                  </select>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">1. Basic Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Business Name *</label>
                      <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-blue-500 outline-none text-black" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Owner Email (For Login)</label>
                      <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-blue-500 outline-none text-black" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Phone Number *</label>
                      <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-blue-500 outline-none text-black" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">WhatsApp Number</label>
                      <input type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-blue-500 outline-none text-black" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-600 mb-1">Business Address</label>
                      <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-blue-500 outline-none h-24 text-black"></textarea>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
                      <textarea value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-blue-500 outline-none h-24 text-black"></textarea>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">2. Visuals & Branding</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Profile Image / Logo (URL)</label>
                      <input type="text" placeholder="https://..." value={formData.img} onChange={e => setFormData({...formData, img: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-blue-500 outline-none mb-2 text-black" />
                      <div className="flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-gray-400" />
                        <span className="text-[10px] text-gray-500">Alternatively, manually upload custom image via Firebase Storage inside the actual store dashboard later.</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Hero Image Banner (URL)</label>
                      <input type="text" placeholder="https://..." value={formData.heroImg} onChange={e => setFormData({...formData, heroImg: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-blue-500 outline-none mb-2 text-black" />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">3. Specialized Fields</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-6 rounded-xl border border-blue-100">
                    {formData.role === 'weaver' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-blue-800 mb-1">Years of Experience</label>
                          <input type="text" value={formData.weaverExperience} onChange={e => setFormData({...formData, weaverExperience: e.target.value})} className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-blue-500 outline-none text-black" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-blue-800 mb-1">Generations in Handloom</label>
                          <input type="text" value={formData.generations} onChange={e => setFormData({...formData, generations: e.target.value})} className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-blue-500 outline-none text-black" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-blue-800 mb-1">Materials Used (comma separated)</label>
                          <input type="text" value={formData.materials} onChange={e => setFormData({...formData, materials: e.target.value})} className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-blue-500 outline-none text-black" />
                        </div>
                      </>
                    )}
                    {(formData.role === 'wholesaler' || formData.role === 'supplier') && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-blue-800 mb-1">Business Scale</label>
                          <input type="text" placeholder="e.g. 50+ Looms" value={formData.scale} onChange={e => setFormData({...formData, scale: e.target.value})} className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-blue-500 outline-none text-black" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-blue-800 mb-1">Products Offered</label>
                          <input type="text" value={formData.productsOffered} onChange={e => setFormData({...formData, productsOffered: e.target.value})} className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-blue-500 outline-none text-black" />
                        </div>
                      </>
                    )}
                    {formData.role === 'store' && (
                      <div className="md:col-span-2 text-sm text-blue-600 font-medium">
                        Standard retail store. Additional fields are managed via the storefront app.
                      </div>
                    )}
                  </div>
                </section>
                
                <section>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">4. Verification Status</h3>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})} 
                    className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none"
                  >
                    <option value="approved">Verified & Active</option>
                    <option value="pending_approval">Pending Review</option>
                    <option value="unclaimed">Unclaimed (Google Lead)</option>
                  </select>
                </section>

              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <button disabled={isSubmitting} onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="text-gray-500 text-sm font-bold hover:text-gray-900 transition-colors">
                Cancel
              </button>
              <button 
                disabled={isSubmitting} 
                onClick={handleSaveShop}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-8 py-3 rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                {isSubmitting ? "Saving Data..." : "Save Vendor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
