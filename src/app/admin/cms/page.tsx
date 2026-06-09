"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, addDoc } from "firebase/firestore";
import Link from "next/link";
import { PlatformPage, PageType } from "@/types/cms";
import { useRouter } from "next/navigation";

export default function CMSAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<PlatformPage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<PlatformPage | null>(null);
  
  // New Template Form State
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<PageType>("homepage");

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const q = query(collection(db, "platform_pages"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data: PlatformPage[] = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as PlatformPage);
        });
        setTemplates(data);
      } catch (e) {
        console.error("Error fetching templates", e);
      }
      setLoading(false);
    }
    fetchTemplates();
  }, []);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newPage: PlatformPage = {
        title: newTitle,
        type: newType,
        status: "draft",
        theme: {
          backgroundColor: "#0A1021",
          headingColor: "#C5A059",
          textColor: "#E2E8F0",
          ticketColor: "#C5A059"
        },
        rows: [],
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, "platform_pages"), newPage);
      router.push(`/admin/cms/builder/${docRef.id}`);
    } catch (e) {
      console.error(e);
      alert("Error creating template");
    }
  };

  const handleDuplicateTemplate = async (templateToCopy: PlatformPage) => {
    try {
      const duplicatedPage = {
        ...templateToCopy,
        title: `Copy of ${templateToCopy.title}`,
        status: "draft",
        createdAt: new Date().toISOString()
      };
      // remove the id
      delete duplicatedPage.id;
      
      const docRef = await addDoc(collection(db, "platform_pages"), duplicatedPage);
      router.push(`/admin/cms/builder/${docRef.id}`);
    } catch (e) {
      console.error(e);
      alert("Error duplicating template");
    }
  };

  const confirmDeleteTemplate = (template: PlatformPage) => {
    setTemplateToDelete(template);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete?.id) return;
    try {
      // Need deleteDoc here, let's just do an API call or use db directly
      // Wait, need to import deleteDoc and doc
      const { deleteDoc, doc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "platform_pages", templateToDelete.id));
      setTemplates(templates.filter(t => t.id !== templateToDelete.id));
      setIsDeleteModalOpen(false);
      setTemplateToDelete(null);
    } catch (e) {
      console.error(e);
      alert("Error deleting template");
    }
  };

  if (loading) return <div className="p-8 text-[#C5A059] animate-pulse">Loading Template Library...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#C5A059]/30 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059]">Visual Template Library</h1>
          <p className="text-gray-300 text-xs mt-1">Design and manage all visual layouts for homepages, vendors, weavers, and products.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin/cms/routes"
            className="bg-[#051815] border border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059]/10 transition-colors font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center"
          >
            Active Routes Manager
          </Link>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#C5A059] text-[#0A1021] hover:brightness-110 transition-all font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg"
          >
            + Create New Template
          </button>
        </div>
      </div>

      {templates.filter(t => t.status === 'premium_template').length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#C5A059]">Ready-Made Templates</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-[#C5A059]/50 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.filter(t => t.status === 'premium_template').map(t => (
              <div key={t.id} className="bg-[#0B2B26]/80 border border-[#C5A059] shadow-[0_0_15px_rgba(197,160,89,0.1)] rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider border ${
                      t.type === 'homepage' ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' :
                      t.type === 'weaver' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                      t.type === 'store' ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' :
                      'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    }`}>
                      {t.type} Template
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded border border-[#C5A059]/30">
                      ● Ready-Made
                    </span>
                  </div>
                  <h2 className="text-xl font-serif font-bold text-white mb-2">{t.title}</h2>
                  <p className="text-xs text-[#C5A059]/80 mb-6 italic">{t.rows?.length || 0} Design Rows configured. Do not edit directly; duplicate this to start a new page.</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => handleDuplicateTemplate(t)}
                    className="w-full text-center bg-[#C5A059] text-[#0A1021] hover:brightness-110 transition-colors font-bold px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-wider cursor-pointer shadow-lg"
                  >
                    📋 Duplicate to Custom Library
                  </button>
                  <Link 
                    href={`/admin/cms/builder/${t.id}`}
                    className="w-full text-center bg-transparent border border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059]/10 transition-colors font-bold px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider"
                  >
                    View Layout
                  </Link>
                  <button 
                    onClick={() => confirmDeleteTemplate(t)}
                    className="w-full text-center text-red-400/50 hover:text-red-400 transition-colors font-bold px-4 py-1.5 rounded-xl text-[10px] uppercase tracking-wider cursor-pointer mt-1"
                  >
                    Delete Ready-Made
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">Your Custom Templates</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-gray-700 to-transparent"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.filter(t => t.status !== 'premium_template').map(t => (
          <div key={t.id} className={`bg-[#0B2B26]/80 border ${
            t.status === 'draft' ? 'border-gray-500' : 
            t.status === 'published' ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 
            'border-[#C5A059] shadow-[0_0_15px_rgba(197,160,89,0.1)]'
          } rounded-3xl p-6 flex flex-col justify-between`}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider border ${
                  t.type === 'homepage' ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' :
                  t.type === 'weaver' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                  t.type === 'store' ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' :
                  'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}>
                  {t.type} Template
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-widest font-mono ${
                  t.status === 'published' ? 'text-green-400 bg-green-900/30 px-2 py-0.5 rounded border border-green-500/30' : 
                  t.status === 'premium_template' ? 'text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded border border-[#C5A059]/30' : 
                  'text-gray-400 bg-gray-800/50 px-2 py-0.5 rounded border border-gray-600'
                }`}>
                  ● {t.status.replace("_", " ")}
                </span>
              </div>
              <h2 className="text-xl font-serif font-bold text-white mb-2">{t.title}</h2>
              <p className="text-xs text-gray-400 mb-6">{t.rows?.length || 0} Design Rows configured.</p>
            </div>
            
                <div className="flex flex-col gap-2">
                  <Link 
                    href={`/admin/cms/builder/${t.id}`}
                    className="w-full text-center bg-[#051815] border border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059]/10 transition-colors font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider"
                  >
                    Open Visual Editor
                  </Link>
                  <button 
                    onClick={() => handleDuplicateTemplate(t)}
                    className="w-full text-center bg-gray-800/50 border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors font-bold px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider cursor-pointer"
                  >
                    📋 Duplicate as New Draft
                  </button>
                  <button 
                    onClick={() => confirmDeleteTemplate(t)}
                    className="w-full text-center bg-red-900/20 border border-red-500/30 text-red-400 hover:bg-red-900/40 transition-colors font-bold px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider cursor-pointer mt-1"
                  >
                    🗑️ Delete Template
                  </button>
                </div>
              </div>
            ))}
            {templates.filter(t => t.status !== 'premium_template').length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-[#C5A059]/20 rounded-3xl">
                <p className="text-gray-400 font-mono text-sm">No custom templates found. Create a new one or duplicate a Ready-Made template!</p>
              </div>
            )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B2B26] border border-[#C5A059]/50 rounded-3xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(197,160,89,0.2)]">
            <h2 className="text-xl font-serif font-bold text-[#C5A059] mb-4">Create New Template</h2>
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Template Name</label>
                <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. Master Weaver Luxury Layout" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Target Audience (Type)</label>
                <select value={newType} onChange={e => setNewType(e.target.value as PageType)} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]">
                  <option value="homepage">Homepage / Main Site Route</option>
                  <option value="weaver">Master Weaver Profile</option>
                  <option value="store">Retail Store / Vendor Page</option>
                  <option value="product">Ultra-Premium Product Landing Page</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-2">This determines where this template can be assigned later.</p>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-gray-300 font-bold text-xs uppercase tracking-wider hover:text-white">Cancel</button>
                <button type="submit" className="bg-[#C5A059] text-[#0A1021] hover:brightness-110 transition-all font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider">
                  Create Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && templateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B2B26] border-2 border-red-500 rounded-3xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(239,68,68,0.3)]">
            <div className="text-center">
              <span className="text-4xl mb-4 block">⚠️</span>
              <h2 className="text-2xl font-black text-red-500 uppercase tracking-wider mb-2">DO YOU REALLY WANT TO DELETE?</h2>
              <p className="text-gray-300 text-sm mb-6">
                You are about to permanently delete the template <strong className="text-white">{templateToDelete.title}</strong>. This action cannot be undone.
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)} 
                  className="flex-1 px-4 py-3 bg-gray-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteTemplate} 
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-red-700 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                >
                  Yes, Delete It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
