"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useVendors, addVendor, deleteVendor, updateDocumentStatus } from "@/lib/db-hooks";
import ImageUploader from "@/components/ImageUploader";

export default function AdminStoresPage() {
  const { vendors: stores, loading } = useVendors();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStore, setEditingStore] = useState<any | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState("");
  const [heroImg, setHeroImg] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [tier, setTier] = useState<"Silver" | "Gold" | "Diamond">("Silver");

  const handleEdit = (store: any) => {
    setEditingStore(store);
    setTitle(store.title);
    setSlug(store.slug);
    setDesc(store.desc);
    setImg(store.img);
    setHeroImg(store.heroImg || "");
    setPhone(store.phone || "");
    setWhatsapp(store.whatsapp || "");
    setAddress(store.address || "");
    setTier(store.tier || "Silver");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStore(null);
    setTitle("");
    setSlug("");
    setDesc("");
    setImg("");
    setHeroImg("");
    setPhone("");
    setWhatsapp("");
    setAddress("");
    setTier("Silver");
  };

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const productLimit = tier === "Silver" ? 5 : tier === "Gold" ? 25 : 9999;
    const data = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      desc,
      img: img || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
      heroImg,
      phone,
      whatsapp,
      address,
      tier,
      productLimit,
      badge: tier !== "Silver" ? "Bhulia Verified Store" : "Bhulia Store",
      status: editingStore ? editingStore.status : "approved"
    };

    if (editingStore) {
      const res = await updateDocumentStatus("vendors", editingStore.id, data);
      if (res.success) {
        handleCloseModal();
      } else {
        alert("Error updating store profile");
      }
    } else {
      const res = await addVendor(data);
      if (res.success) {
        handleCloseModal();
      } else {
        alert("Error adding retail store application");
      }
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove "${title}" store?`)) {
      await deleteVendor(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059]">Retail Store Registry</h1>
          <p className="text-gray-300 text-xs mt-1">Manage physical boutiques, cooperative stores, and product upload limits.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#C5A059] text-[#0A1021] hover:brightness-110 transition-all font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg"
        >
          + Add Retail Store
        </button>
      </div>

      {loading ? (
        <div className="text-[#C5A059] font-mono text-xs animate-pulse p-4">Loading store directory...</div>
      ) : (
        <div className="bg-[#0B2B26]/80 border border-[#C5A059]/30 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-200">
              <thead className="text-xs uppercase bg-[#0A3A35] text-[#C5A059] font-bold tracking-widest border-b border-[#C5A059]/30">
                <tr>
                  <th className="px-6 py-4">Boutique</th>
                  <th className="px-6 py-4">Title & Slug</th>
                  <th className="px-6 py-4">Tier Level</th>
                  <th className="px-6 py-4">Product Limit</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id} className="border-b border-[#C5A059]/10 hover:bg-[#0A3A35]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-[#C5A059]/50 shadow">
                        <Image src={store.img} alt={store.title} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <div className="text-white font-serif">{store.title}</div>
                      <div className="text-[10px] text-gray-400 mt-1 font-mono">/store/{store.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider border ${
                        store.tier === "Diamond" ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300" :
                        store.tier === "Gold" ? "bg-amber-500/10 border-amber-500/30 text-amber-300" :
                        "bg-slate-500/10 border-slate-500/30 text-slate-300"
                      }`}>
                        {store.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono">
                      {store.productLimit === 9999 ? "Unlimited" : `${store.productLimit} Products`}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] uppercase font-bold tracking-widest font-mono ${store.status === "approved" ? "text-green-400" : "text-yellow-400"}`}>
                        ● {store.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-4">
                      <a 
                        href={`/store/${store.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#C5A059] hover:underline font-bold text-xs uppercase tracking-wider"
                      >
                        View Store
                      </a>
                      <button 
                        onClick={() => handleEdit(store)}
                        className="text-blue-400 hover:text-blue-350 font-bold text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(store.id, store.title)}
                        className="text-red-400 hover:text-red-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {stores.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400 font-mono text-xs">No retail stores registered in Firestore yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Store Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B2B26] border border-[#C5A059]/50 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(197,160,89,0.2)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-serif font-bold text-[#C5A059]">
                {editingStore ? "Edit Retail Store Profile" : "Onboard Retail Store"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>
            
            <form onSubmit={handleAddStore} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Store Title</label>
                  <input required value={title} onChange={e => setTitle(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. Sambaleswari Handlooms" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Store Slug</label>
                  <input value={slug} onChange={e => setSlug(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. samaleswari-handlooms" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Store Tier</label>
                  <select value={tier} onChange={e => setTier(e.target.value as any)} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]">
                    <option value="Silver">Silver Tier (Free / 5 Products)</option>
                    <option value="Gold">Gold Tier (₹2000 / 25 Products)</option>
                    <option value="Diamond">Diamond Tier (Unlimited)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Address</label>
                  <input required value={address} onChange={e => setAddress(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. Bargarh Chowk, Odisha" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Phone Number</label>
                  <input required value={phone} onChange={e => setPhone(e.target.value)} type="tel" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="+91 xxxxxx" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">WhatsApp Chat Link ID</label>
                  <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="91xxxxxx" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Description / Specialty</label>
                <textarea required value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="About the store collections, weavers they support..."></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageUploader 
                  value={img} 
                  onChange={setImg} 
                  label="Store Front Image" 
                  aspectRatio="square"
                />
                <ImageUploader 
                  value={heroImg} 
                  onChange={setHeroImg} 
                  label="Hero Banner Image" 
                  aspectRatio="landscape"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2.5 text-gray-300 font-bold text-xs uppercase tracking-wider hover:text-white">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-[#C5A059] text-[#0A1021] hover:brightness-110 transition-all font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider disabled:opacity-50">
                  {isSubmitting ? "Saving..." : (editingStore ? "Save Changes" : "Register Retail Store")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
