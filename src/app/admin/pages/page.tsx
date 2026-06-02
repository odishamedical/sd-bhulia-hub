"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

interface StaticPage {
  id: string; // The slug
  title: string;
  content: string;
}

export default function AdminPagesCMS() {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [currentSlug, setCurrentSlug] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentContent, setCurrentContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "pages"));
      const pagesList: StaticPage[] = [];
      querySnapshot.forEach((doc) => {
        pagesList.push({ id: doc.id, ...doc.data() } as StaticPage);
      });
      setPages(pagesList);
    } catch (e) {
      console.error("Error fetching pages", e);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!currentSlug || !currentTitle) return alert("Slug and Title are required.");
    
    // Clean slug (lowercase, replace spaces with hyphens, remove special chars)
    const cleanSlug = currentSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
    
    setSaving(true);
    try {
      await setDoc(doc(db, "pages", cleanSlug), {
        title: currentTitle,
        content: currentContent,
        updatedAt: new Date().toISOString()
      });
      
      alert("Page saved successfully!");
      setIsEditing(false);
      fetchPages();
    } catch (e) {
      console.error("Error saving page", e);
      alert("Failed to save page.");
    }
    setSaving(false);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete the page '/p/${slug}'? This cannot be undone.`)) return;
    
    try {
      await deleteDoc(doc(db, "pages", slug));
      fetchPages();
    } catch (e) {
      console.error("Error deleting page", e);
      alert("Failed to delete.");
    }
  };

  const openEditor = (page?: StaticPage) => {
    if (page) {
      setCurrentSlug(page.id);
      setCurrentTitle(page.title);
      setCurrentContent(page.content);
    } else {
      setCurrentSlug("");
      setCurrentTitle("");
      setCurrentContent("");
    }
    setIsEditing(true);
  };

  if (loading && !isEditing) return <div className="text-[#C5A059] animate-pulse">Loading Pages CMS...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059]">Static Pages Engine</h1>
        <p className="text-gray-300 text-xs mt-1">Manage text-heavy public pages like FAQs, Privacy Policies, and Notices.</p>
      </div>

      {isEditing ? (
        <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-[#C5A059]/20 pb-4">
            <h2 className="text-xl font-serif font-bold text-[#C5A059]">{currentSlug ? "Edit Page" : "Create New Page"}</h2>
            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white text-sm">Cancel</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] uppercase font-bold text-[#C5A059] tracking-widest block mb-2">Page Title</label>
              <input 
                type="text" 
                value={currentTitle} 
                onChange={(e) => setCurrentTitle(e.target.value)} 
                className="w-full px-4 py-3 bg-[#051815] rounded-xl border border-[#C5A059]/30 text-sm text-white focus:border-[#C5A059] outline-none" 
                placeholder="e.g. Return Policy" 
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-[#C5A059] tracking-widest block mb-2">URL Slug</label>
              <div className="flex items-center">
                <span className="bg-[#0A3A35] border border-r-0 border-[#C5A059]/30 px-3 py-3 rounded-l-xl text-gray-400 text-sm border-r-transparent font-mono">
                  bhulia.com/p/
                </span>
                <input 
                  type="text" 
                  value={currentSlug} 
                  disabled={!!pages.find(p => p.id === currentSlug)} // Disable slug edit if it exists to prevent orphaned docs
                  onChange={(e) => setCurrentSlug(e.target.value)} 
                  className="flex-1 px-4 py-3 bg-[#051815] rounded-r-xl border border-[#C5A059]/30 text-sm text-white focus:border-[#C5A059] outline-none disabled:opacity-50" 
                  placeholder="return-policy" 
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-[#C5A059] tracking-widest block mb-2">
              Page Content (Supports HTML)
            </label>
            <textarea 
              value={currentContent} 
              onChange={(e) => setCurrentContent(e.target.value)} 
              rows={15}
              className="w-full px-4 py-4 bg-[#051815] rounded-xl border border-[#C5A059]/30 text-sm text-white font-mono focus:border-[#C5A059] outline-none resize-y" 
              placeholder="<h1>Return Policy</h1><p>Our policy lasts 30 days...</p>" 
            />
            <p className="text-xs text-gray-400 mt-2">You can use standard HTML tags here to format your text (e.g. &lt;h2&gt;, &lt;strong&gt;, &lt;ul&gt;).</p>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              disabled={saving} 
              onClick={handleSave} 
              className="px-6 py-3 bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 shadow-lg disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save & Publish"}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 flex justify-between items-center border-b border-[#C5A059]/20">
            <h2 className="text-lg font-bold text-[#C5A059] uppercase tracking-widest">Published Pages</h2>
            <button 
              onClick={() => openEditor()} 
              className="px-4 py-2 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-[#C5A059]/10 transition-colors"
            >
              + Create New Page
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-200">
              <thead className="text-[10px] uppercase bg-[#0A3A35] text-[#C5A059] font-bold tracking-widest border-b border-[#C5A059]/30">
                <tr>
                  <th className="px-6 py-4">Page Title</th>
                  <th className="px-6 py-4">URL Route</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400 font-mono text-xs">
                      No static pages created yet.
                    </td>
                  </tr>
                ) : (
                  pages.map((page) => (
                    <tr key={page.id} className="border-b border-[#C5A059]/10 hover:bg-[#0A3A35]/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-white font-serif">{page.title}</td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-400">/p/{page.id}</td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <Link href={`/p/${page.id}`} target="_blank" className="text-xs text-[#C5A059] hover:text-white uppercase tracking-wider font-bold">
                          View
                        </Link>
                        <button onClick={() => openEditor(page)} className="text-xs text-[#C5A059] hover:text-white uppercase tracking-wider font-bold">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(page.id)} className="text-xs text-red-400 hover:text-red-300 uppercase tracking-wider font-bold">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
