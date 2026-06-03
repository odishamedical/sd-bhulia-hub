"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useFranchises, addFranchise, deleteFranchise, updateDocumentStatus, approveFranchiseAndUserRole } from "@/lib/db-hooks";
import ImageUploader from "@/components/ImageUploader";

export default function AdminFranchisesPage() {
  const { franchises, loading } = useFranchises();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingFranchise, setEditingFranchise] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [img, setImg] = useState("");
  const [tier, setTier] = useState<"Silver" | "Gold" | "Diamond">("Silver");

  const handleEdit = (franchise: any) => {
    setEditingFranchise(franchise);
    setName(franchise.name);
    setSlug(franchise.slug);
    setCity(franchise.city);
    setPhone(franchise.phone || "");
    setWhatsapp(franchise.whatsapp || "");
    setAddress(franchise.address || "");
    setImg(franchise.img || "");
    setTier(franchise.tier || "Silver");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFranchise(null);
    setName("");
    setSlug("");
    setCity("");
    setPhone("");
    setWhatsapp("");
    setAddress("");
    setImg("");
    setTier("Silver");
  };

  const handleAddFranchise = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      city,
      phone,
      whatsapp,
      address,
      img: img || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
      tier,
      status: editingFranchise ? editingFranchise.status : "approved",
      invitedCount: editingFranchise ? editingFranchise.invitedCount : 0,
      totalSales: editingFranchise ? editingFranchise.totalSales : 0,
      commissionEarned: editingFranchise ? editingFranchise.commissionEarned : 0
    };

    if (editingFranchise) {
      const res = await updateDocumentStatus("franchises", editingFranchise.id, data);
      if (res.success) {
        handleCloseModal();
      } else {
        alert("Error updating franchise partner");
      }
    } else {
      const res = await addFranchise(data);
      if (res.success) {
        handleCloseModal();
      } else {
        alert("Error adding franchise partner");
      }
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" franchise partner?`)) {
      await deleteFranchise(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059]">Franchise Partners</h1>
          <p className="text-gray-300 text-xs mt-1">Manage promoter dashboards, phygital hubs, page visits, and referral sales.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#C5A059] text-[#0A1021] hover:brightness-110 transition-all font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg"
        >
          + Approve New Franchise
        </button>
      </div>

      {loading ? (
        <div className="text-[#C5A059] font-mono text-xs animate-pulse p-4">Loading franchises list...</div>
      ) : (
        <div className="bg-[#0B2B26]/80 border border-[#C5A059]/30 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-200">
              <thead className="text-xs uppercase bg-[#0A3A35] text-[#C5A059] font-bold tracking-widest border-b border-[#C5A059]/30">
                <tr>
                  <th className="px-6 py-4">Promoter</th>
                  <th className="px-6 py-4">Name & Slug</th>
                  <th className="px-6 py-4">City Location</th>
                  <th className="px-6 py-4">Tier Level</th>
                  <th className="px-6 py-4">Page Visits</th>
                  <th className="px-6 py-4">Referral Sales</th>
                  <th className="px-6 py-4">Commissions</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {franchises.map((franchise) => (
                  <tr key={franchise.id} className="border-b border-[#C5A059]/10 hover:bg-[#0A3A35]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 relative rounded-full overflow-hidden border-2 border-[#C5A059]/50 shadow">
                        <Image src={franchise.img} alt={franchise.name} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <div className="text-white font-serif">{franchise.name}</div>
                      <div className="text-[10px] text-gray-400 mt-1 font-mono">/franchise/{franchise.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-xs">{franchise.city}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${
                        franchise.tier === "Diamond" ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300" :
                        franchise.tier === "Gold" ? "bg-amber-500/10 border-amber-500/30 text-amber-300" :
                        "bg-slate-500/10 border-slate-500/30 text-slate-300"
                      }`}>
                        {franchise.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-300">
                      👁️ {franchise.invitedCount || 0}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-300">
                      📦 {franchise.totalSales || 0}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#C5A059]">
                      ₹ {(franchise.commissionEarned || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right space-x-4">
                      {franchise.status === "pending_approval" && (
                        <button 
                          onClick={async () => {
                             if (confirm(`Approve franchise "${franchise.name}"?`)) {
                               await approveFranchiseAndUserRole(franchise.id, franchise.userId);
                             }
                          }}
                          className="text-green-400 hover:text-green-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      <a 
                        href={`/franchise/${franchise.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#C5A059] hover:underline font-bold text-xs uppercase tracking-wider"
                      >
                        View Hub
                      </a>
                      <button 
                        onClick={() => handleEdit(franchise)}
                        className="text-blue-400 hover:text-blue-350 font-bold text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(franchise.id, franchise.name)}
                        className="text-red-400 hover:text-red-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {franchises.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-400 font-mono text-xs">No franchise promoters registered in Firestore yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Franchise Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B2B26] border border-[#C5A059]/50 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(197,160,89,0.2)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-serif font-bold text-[#C5A059]">
                {editingFranchise ? "Edit Franchise Partner" : "Onboard Franchise Partner"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>
            
            <form onSubmit={handleAddFranchise} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Promoter Full Name</label>
                  <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. Priyatama Meher" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Custom Link Slug</label>
                  <input value={slug} onChange={e => setSlug(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. priyatama" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Franchise Tier</label>
                  <select value={tier} onChange={e => setTier(e.target.value as any)} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]">
                    <option value="Silver">Silver Tier (Free)</option>
                    <option value="Gold">Gold Tier (₹2000)</option>
                    <option value="Diamond">Diamond Tier (₹5000)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">City Hub Location</label>
                  <input required value={city} onChange={e => setCity(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. Sambalpur" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Address Details</label>
                  <input required value={address} onChange={e => setAddress(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="Full Phygital Hub Address" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Phone Number</label>
                  <input required value={phone} onChange={e => setPhone(e.target.value)} type="tel" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="+91 xxxxxx" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">WhatsApp Chat ID</label>
                  <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="91xxxxxx" />
                </div>
                <div className="md:col-span-2">
                  <ImageUploader 
                    value={img} 
                    onChange={setImg} 
                    label="Avatar / Hub Image" 
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2.5 text-gray-300 font-bold text-xs uppercase tracking-wider hover:text-white">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-[#C5A059] text-[#0A1021] hover:brightness-110 transition-all font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider disabled:opacity-50">
                  {isSubmitting ? "Saving..." : (editingFranchise ? "Save Changes" : "Register Franchise Partner")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
