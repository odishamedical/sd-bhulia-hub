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
  const [isInjecting, setIsInjecting] = useState(false);
  
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

  const handleInjectTemplates = async () => {
    setIsInjecting(true);
    try {
      const luxuryTemplates: Partial<PlatformPage>[] = [
        {
          title: "Sambalpuri Royal Heritage (Classic)",
          type: "homepage",
          status: "premium_template",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          theme: { backgroundColor: "#0A1021", headingColor: "#C5A059", textColor: "#E2E8F0", ticketColor: "#C5A059" },
          rows: [
            {
              id: "hero-1", type: "hero", title: "The Legacy of Threads", hideTitle: true, heroLayout: "full",
              heroHeadline: "A Heritage Woven in Time. A Legacy Worn by Legends.",
              heroSubheadline: "Experience the soul of Sambalpur. Every master weaver's masterpiece is a story of resilience, art, and timeless luxury.",
              heroButtonText: "Explore the Royal Collection", heroButtonLink: "/search",
              heroImages: ["https://images.unsplash.com/photo-1605001011155-2241b7147b4d?auto=format&fit=crop&q=80&w=1600", "https://images.unsplash.com/photo-1605001011500-bf64b2d35817?auto=format&fit=crop&q=80&w=1600"]
            },
            {
              id: "split-1", type: "split_banner_products", title: "The Master Weaver's Pride", hideTitle: false, splitColumnsCount: 3,
              splitColumns: [
                { id: "col1", type: "ad", bannerImage: "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?auto=format&fit=crop&q=80&w=800", bannerText: "Handwoven Perfection", bannerLink: "/weavers" },
                { id: "col2", type: "products", productLimit: 2, featuredOnly: true },
                { id: "col3", type: "share_widget", shareLayout: "vertical", shareText: "Wear the pride of Odisha. Share this legacy with the world." }
              ]
            },
            { id: "products-1", type: "products", title: "The Royal Reserve Collection", hideTitle: false, productLimit: 8, featuredOnly: true, discountOnly: false }
          ]
        },
        {
          title: "Sambalpuri Midnight Elegance (Dark Mode)",
          type: "homepage",
          status: "premium_template",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          theme: { backgroundColor: "#02040A", headingColor: "#E2E8F0", textColor: "#94A3B8", ticketColor: "#3B82F6" },
          rows: [
            {
              id: "hero-2", type: "hero", title: "Midnight Silk", hideTitle: true, heroLayout: "split",
              heroHeadline: "The Deep Richness of Sambalpuri Silk.",
              heroSubheadline: "Reserved for the elite. Woven in the shadows of tradition.",
              heroButtonText: "Shop Midnight Collection", heroButtonLink: "/search?material=silk",
              heroImages: ["https://images.unsplash.com/photo-1558980394-0a06c4631733?auto=format&fit=crop&q=80&w=1600"],
              heroRightContentType: "products"
            },
            { id: "products-2", type: "products", title: "Exclusive Handlooms", hideTitle: false, productLimit: 4, featuredOnly: false, discountOnly: false }
          ]
        },
        {
          title: "Master Weaver Profile (Gold Standard)",
          type: "weaver",
          status: "premium_template",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          theme: { backgroundColor: "#0B2B26", headingColor: "#C5A059", textColor: "#E2E8F0", ticketColor: "#C5A059" },
          rows: [
            {
              id: "hero-3", type: "hero", title: "Weaver Cover", hideTitle: true, heroLayout: "split",
              heroHeadline: "Generations of Craftsmanship.",
              heroSubheadline: "Award-winning designs straight from the loom.",
              heroButtonText: "Contact Master Weaver", heroButtonLink: "#contact",
              heroImages: ["https://images.unsplash.com/photo-1604077351052-e932402bc0f7?auto=format&fit=crop&q=80&w=1600"],
              heroRightContentType: "ad"
            },
            { id: "products-3", type: "products", title: "My Masterpieces", hideTitle: false, productLimit: 8, featuredOnly: false, discountOnly: false }
          ]
        }
      ];

      for (const t of luxuryTemplates) {
        await addDoc(collection(db, 'platform_pages'), t);
      }
      alert("Injected 3 Luxury Templates!");
      window.location.reload();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsInjecting(false);
    }
  };

  if (loading) return <div className="p-8 text-[#0074E4] animate-pulse font-bold">Loading Template Library...</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Visual Template Library</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Design and manage all visual layouts for homepages, vendors, weavers, and products.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleInjectTemplates}
            disabled={isInjecting}
            className="bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 transition-all font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider disabled:opacity-50 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            {isInjecting ? "Injecting..." : "✨ Inject 3 Luxury Templates"}
          </button>
          <Link 
            href="/admin/cms/routes"
            className="bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 transition-all duration-300 font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-sm hover:shadow-md hover:shadow-slate-900/20 hover:-translate-y-1 flex items-center justify-center"
          >
            Active Routes Manager
          </Link>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0074E4] hover:bg-[#0052A3] text-white transition-all duration-300 font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md shadow-[#0074E4]/20 hover:shadow-[0_8px_20px_rgba(0,116,228,0.4)] hover:-translate-y-1 backdrop-blur-sm"
          >
            + Create New Template
          </button>
        </div>
      </div>

      {templates.filter(t => t.status === 'premium_template').length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Ready-Made Templates</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.filter(t => t.status === 'premium_template').map(t => (
              <div key={t.id} className="bg-white border border-indigo-200 shadow-sm shadow-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/20 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded text-[10px] uppercase font-bold tracking-widest border shadow-sm ${
                      t.type === 'homepage' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      t.type === 'weaver' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      t.type === 'store' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {t.type} Template
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 shadow-sm">
                      ● Ready-Made
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">{t.title}</h2>
                  <p className="text-sm text-slate-600 mb-6 font-medium italic">{t.rows?.length || 0} Design Rows configured. Do not edit directly; duplicate this to start a new page.</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => handleDuplicateTemplate(t)}
                    className="w-full text-center bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all duration-300 font-bold px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-wider cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  >
                    📋 Duplicate to Custom Library
                  </button>
                  <Link 
                    href={`/admin/cms/builder/${t.id}`}
                    className="w-full text-center bg-white border border-gray-300 text-slate-800 hover:bg-gray-50 hover:text-[#0074E4] font-bold px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5"
                  >
                    View Layout
                  </Link>
                  <button 
                    onClick={() => confirmDeleteTemplate(t)}
                    className="w-full text-center text-red-500/80 hover:text-red-600 hover:bg-red-50 transition-colors font-bold px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider cursor-pointer mt-1"
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
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Your Custom Templates</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.filter(t => t.status !== 'premium_template').map(t => (
          <div key={t.id} className={`bg-white border rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
            t.status === 'draft' ? 'border-gray-200 shadow-sm hover:shadow-md' : 
            t.status === 'published' ? 'border-green-300 shadow-sm shadow-green-500/10 hover:shadow-lg hover:shadow-green-500/20' : 
            'border-gray-200 shadow-sm hover:shadow-md'
          }`}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded text-[10px] uppercase font-bold tracking-widest border shadow-sm ${
                  t.type === 'homepage' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                  t.type === 'weaver' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  t.type === 'store' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {t.type} Template
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-widest font-mono shadow-sm ${
                  t.status === 'published' ? 'text-green-800 bg-green-100 px-3 py-1 rounded border border-green-300' : 
                  t.status === 'premium_template' ? 'text-indigo-700 bg-indigo-50 px-3 py-1 rounded border border-indigo-200' : 
                  'text-gray-800 bg-gray-200 px-3 py-1 rounded border border-gray-300'
                }`}>
                  ● {t.status.replace("_", " ")}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">{t.title}</h2>
              <p className="text-sm font-medium text-slate-600 mb-6">{t.rows?.length || 0} Design Rows configured.</p>
            </div>
            
                <div className="flex flex-col gap-2">
                  <Link 
                    href={`/admin/cms/builder/${t.id}`}
                    className="w-full text-center bg-[#0074E4] hover:bg-[#0052A3] text-white transition-all duration-300 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md shadow-[#0074E4]/20 hover:shadow-[0_8px_20px_rgba(0,116,228,0.4)] hover:-translate-y-1 backdrop-blur-sm"
                  >
                    Open Visual Editor
                  </Link>
                  <button 
                    onClick={() => handleDuplicateTemplate(t)}
                    className="w-full text-center bg-white border border-gray-300 text-slate-800 hover:bg-blue-50 hover:text-[#0074E4] font-bold px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5 cursor-pointer"
                  >
                    📋 Duplicate as New Draft
                  </button>
                  <button 
                    onClick={() => confirmDeleteTemplate(t)}
                    className="w-full text-center bg-red-50 border border-red-100 text-red-600 hover:bg-red-500 hover:text-white font-bold px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-red-500/20 hover:-translate-y-0.5 cursor-pointer mt-1 flex justify-center items-center gap-1.5"
                  >
                    <span>🗑️</span> Delete Template
                  </button>
                </div>
              </div>
            ))}
            {templates.filter(t => t.status !== 'premium_template').length === 0 && (
              <div className="col-span-full py-12 text-center bg-white border border-dashed border-gray-300 rounded-2xl shadow-sm">
                <p className="text-slate-600 font-medium text-sm">No custom templates found. Create a new one or duplicate a Ready-Made template!</p>
              </div>
            )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-6 pb-4 border-b border-gray-100">Create New Template</h2>
            <form onSubmit={handleCreateTemplate} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Template Name</label>
                <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} type="text" className="w-full bg-gray-50 border border-gray-200 text-slate-900 text-sm rounded-lg px-4 py-3 outline-none focus:border-[#0074E4] focus:ring-2 focus:ring-[#0074E4]/20 transition-all placeholder:text-slate-400" placeholder="e.g. Master Weaver Luxury Layout" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Audience (Type)</label>
                <select value={newType} onChange={e => setNewType(e.target.value as PageType)} className="w-full bg-gray-50 border border-gray-200 text-slate-900 text-sm rounded-lg px-4 py-3 outline-none focus:border-[#0074E4] focus:ring-2 focus:ring-[#0074E4]/20 transition-all cursor-pointer">
                  <option value="homepage">Homepage / Main Site Route</option>
                  <option value="weaver">Master Weaver Profile</option>
                  <option value="store">Retail Store / Vendor Page</option>
                  <option value="product">Ultra-Premium Product Landing Page</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-2 font-medium">This determines where this template can be assigned later.</p>
              </div>
              <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 bg-white border border-gray-300 text-slate-800 hover:bg-gray-50 hover:text-[#0074E4] font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300">Cancel</button>
                <button type="submit" className="bg-[#0074E4] hover:bg-[#0052A3] text-white transition-all duration-300 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-md shadow-[#0074E4]/20 hover:shadow-[0_8px_20px_rgba(0,116,228,0.4)] hover:-translate-y-1 backdrop-blur-sm">
                  Create Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && templateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="text-center">
              <span className="text-5xl mb-6 block animate-bounce">⚠️</span>
              <h2 className="text-2xl font-black text-red-600 uppercase tracking-wider mb-2">DO YOU REALLY WANT TO DELETE?</h2>
              <p className="text-slate-600 text-sm mb-8 font-medium">
                You are about to permanently delete the template <strong className="text-slate-900">{templateToDelete.title}</strong>. This action cannot be undone.
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)} 
                  className="flex-1 px-4 py-3 bg-white border border-gray-300 text-slate-800 hover:bg-gray-50 font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteTemplate} 
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-red-600/30 hover:-translate-y-1"
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
