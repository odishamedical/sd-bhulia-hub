"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useWeavers, addWeaver, deleteWeaver, updateDocumentStatus } from "@/lib/db-hooks";
import ImageUploader from "@/components/ImageUploader";

export default function AdminWeaversPage() {
  const { weavers, loading } = useWeavers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingWeaver, setEditingWeaver] = useState<any | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState("");
  const [heroImg, setHeroImg] = useState("");
  const [badge, setBadge] = useState("Bhulia.com Verified Artisan");

  const handleEdit = (weaver: any) => {
    setEditingWeaver(weaver);
    setTitle(weaver.title);
    setSlug(weaver.slug);
    setDesc(weaver.desc);
    setImg(weaver.img);
    setHeroImg(weaver.heroImg || "");
    setBadge(weaver.badge);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWeaver(null);
    setTitle("");
    setSlug("");
    setDesc("");
    setImg("");
    setHeroImg("");
    setBadge("Bhulia.com Verified Artisan");
  };

  const handleAddWeaver = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      desc,
      img: img || "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=800&q=80",
      heroImg,
      badge,
      // Keep status as pending_approval or approved
      status: editingWeaver ? editingWeaver.status : "pending_approval"
    };

    if (editingWeaver) {
      const res = await updateDocumentStatus("weavers", editingWeaver.id, data);
      if (res.success) {
        handleCloseModal();
      } else {
        alert("Error updating weaver profile");
      }
    } else {
      const res = await addWeaver(data);
      if (res.success) {
        handleCloseModal();
      } else {
        alert("Error adding weaver");
      }
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove "${title}"?`)) {
      await deleteWeaver(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059]">Verified Weavers</h1>
          <p className="text-gray-300 text-xs mt-1">Manage the artisan registry and profiles.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#C5A059] text-[#0A1021] hover:brightness-110 transition-all font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider"
        >
          + Register Weaver
        </button>
      </div>

      {loading ? (
        <div className="text-[#C5A059] font-mono text-xs animate-pulse p-4">Loading registry...</div>
      ) : (
        <div className="bg-[#0B2B26]/80 border border-[#C5A059]/30 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-200">
              <thead className="text-xs uppercase bg-[#0A3A35] text-[#C5A059] font-bold tracking-widest border-b border-[#C5A059]/30">
                <tr>
                  <th className="px-6 py-4">Profile</th>
                  <th className="px-6 py-4">Name & Slug</th>
                  <th className="px-6 py-4">Verification Badge</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {weavers.map((weaver) => (
                  <tr key={weaver.id} className="border-b border-[#C5A059]/10 hover:bg-[#0A3A35]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 relative rounded-full overflow-hidden border-2 border-[#C5A059]/50 shadow">
                        <Image src={weaver.img} alt={weaver.title} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <div className="text-white font-serif">{weaver.title}</div>
                      <div className="text-[10px] text-gray-400 mt-1 font-mono">/weaver/{weaver.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] px-3 py-1 rounded text-[10px] uppercase tracking-widest font-bold">
                        {weaver.badge}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-4">
                      <a 
                        href={`/weaver/${weaver.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#C5A059] hover:underline font-bold text-xs uppercase tracking-wider"
                      >
                        View Store
                      </a>
                      <button 
                        onClick={() => handleEdit(weaver)}
                        className="text-blue-400 hover:text-blue-350 font-bold text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(weaver.id, weaver.title)}
                        className="text-red-400 hover:text-red-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {weavers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400 font-mono text-xs">No weavers registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Weaver Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B2B26] border border-[#C5A059]/50 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(197,160,89,0.2)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-serif font-bold text-[#C5A059]">
                {editingWeaver ? "Edit Weaver Profile" : "Register Master Weaver"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>
            
            <form onSubmit={handleAddWeaver} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Full Name</label>
                  <input required value={title} onChange={e => setTitle(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. Master Weaver Sunil" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">URL Slug (Optional)</label>
                  <input value={slug} onChange={e => setSlug(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. sunil-meher" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Verification Badge</label>
                  <input required value={badge} onChange={e => setBadge(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. Bhulia.com Verified Artisan" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Detailed Biography</label>
                <textarea required value={desc} onChange={e => setDesc(e.target.value)} rows={4} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="Biography, cluster details, years of experience..."></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageUploader 
                  value={img} 
                  onChange={setImg} 
                  label="Profile Photo" 
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
                  {isSubmitting ? "Saving..." : (editingWeaver ? "Save Changes" : "Register Weaver")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
