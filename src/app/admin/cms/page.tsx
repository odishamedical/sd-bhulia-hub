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

  if (loading) return <div className="p-8 text-[#C5A059] animate-pulse">Loading Template Library...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#C5A059]/30 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059]">Visual Template Library</h1>
          <p className="text-gray-300 text-xs mt-1">Design and manage all visual layouts for homepages, vendors, weavers, and products.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#C5A059] text-[#0A1021] hover:brightness-110 transition-all font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg"
        >
          + Create New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(t => (
          <div key={t.id} className="bg-[#0B2B26]/80 border border-[#C5A059]/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
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
                  t.status === 'published' ? 'text-green-400' : 
                  t.status === 'premium_template' ? 'text-[#C5A059]' : 
                  'text-gray-400'
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
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-[#C5A059]/20 rounded-3xl">
            <p className="text-gray-400 font-mono text-sm">No templates found. Create your first design!</p>
          </div>
        )}
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
    </div>
  );
}
