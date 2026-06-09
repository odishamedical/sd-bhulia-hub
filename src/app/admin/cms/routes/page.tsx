"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs, query, where } from "firebase/firestore";
import { ActiveRoutes, PlatformPage } from "@/types/cms";

export default function ActiveRoutesManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeRoutes, setActiveRoutes] = useState<ActiveRoutes>({});
  const [pages, setPages] = useState<PlatformPage[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Active Routes
        const routesSnap = await getDoc(doc(db, "platform_settings", "active_routes"));
        if (routesSnap.exists()) {
          setActiveRoutes(routesSnap.data() as ActiveRoutes);
        }

        // Fetch Published Pages
        const pagesRef = collection(db, "platform_pages");
        // We only want to select from published or premium_template pages, not drafts.
        const q = query(pagesRef, where("status", "in", ["published", "premium_template"]));
        const querySnapshot = await getDocs(q);
        
        const fetchedPages: PlatformPage[] = [];
        querySnapshot.forEach((docSnap) => {
          fetchedPages.push({ id: docSnap.id, ...docSnap.data() } as PlatformPage);
        });
        setPages(fetchedPages);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "platform_settings", "active_routes"), activeRoutes);
      alert("Active routes saved successfully!");
    } catch (error) {
      console.error("Error saving active routes:", error);
      alert("Failed to save routes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Loading Active Routes...</div>;
  }

  const homepages = pages.filter(p => p.type === "homepage");
  const storePages = pages.filter(p => p.type === "store");
  const weaverPages = pages.filter(p => p.type === "weaver");
  const productPages = pages.filter(p => p.type === "product");
  const directoryPages = pages.filter(p => p.type === "directory");

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059]">Active Routes Manager</h1>
        <p className="text-gray-300 text-xs mt-1">Map your published templates to the live public URLs.</p>
      </div>

      <div className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl p-6 shadow-xl space-y-6">
        
        {/* Homepage Route */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C5A059]/20 pb-6">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white mb-1">Active Homepage</h2>
            <p className="text-xs text-gray-400">Select the template that will be displayed at the root URL (bhulia.com/).</p>
          </div>
          <div className="w-full sm:w-64">
            <select 
              value={activeRoutes.activeHomepageId || ""} 
              onChange={(e) => setActiveRoutes({ ...activeRoutes, activeHomepageId: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#051815] border border-[#C5A059]/40 rounded-xl text-sm text-white focus:border-[#C5A059] outline-none"
            >
              <option value="">-- Hardcoded Legacy Homepage --</option>
              {homepages.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Directory Route */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C5A059]/20 pb-6">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white mb-1">Active Directory Page</h2>
            <p className="text-xs text-gray-400">Select the template that will be displayed at the public /directory URL.</p>
          </div>
          <div className="w-full sm:w-64">
            <select 
              value={activeRoutes.activeDirectoryId || ""} 
              onChange={(e) => setActiveRoutes({ ...activeRoutes, activeDirectoryId: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#051815] border border-[#C5A059]/40 rounded-xl text-sm text-white focus:border-[#C5A059] outline-none"
            >
              <option value="">-- Hardcoded Legacy Directory --</option>
              {directoryPages.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Default Store Layout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C5A059]/20 pb-6">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white mb-1">Default Storefront Template</h2>
            <p className="text-xs text-gray-400">The default layout applied to all Vendor/Store pages, unless overridden in their specific profile.</p>
          </div>
          <div className="w-full sm:w-64">
            <select 
              value={activeRoutes.defaultStoreTemplateId || ""} 
              onChange={(e) => setActiveRoutes({ ...activeRoutes, defaultStoreTemplateId: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#051815] border border-[#C5A059]/40 rounded-xl text-sm text-white focus:border-[#C5A059] outline-none"
            >
              <option value="">-- Standard Legacy Layout --</option>
              {storePages.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Default Weaver Layout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C5A059]/20 pb-6">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white mb-1">Default Weaver Template</h2>
            <p className="text-xs text-gray-400">The default layout applied to all Weaver profiles.</p>
          </div>
          <div className="w-full sm:w-64">
            <select 
              value={activeRoutes.defaultWeaverTemplateId || ""} 
              onChange={(e) => setActiveRoutes({ ...activeRoutes, defaultWeaverTemplateId: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#051815] border border-[#C5A059]/40 rounded-xl text-sm text-white focus:border-[#C5A059] outline-none"
            >
              <option value="">-- Standard Legacy Layout --</option>
              {weaverPages.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Default Product Layout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white mb-1">Default Product Page Template</h2>
            <p className="text-xs text-gray-400">The default layout applied to individual product pages.</p>
          </div>
          <div className="w-full sm:w-64">
            <select 
              value={activeRoutes.defaultProductTemplateId || ""} 
              onChange={(e) => setActiveRoutes({ ...activeRoutes, defaultProductTemplateId: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#051815] border border-[#C5A059]/40 rounded-xl text-sm text-white focus:border-[#C5A059] outline-none"
            >
              <option value="">-- Standard Legacy Layout --</option>
              {productPages.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bhulia-gold-button px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2"
        >
          {saving ? "Saving..." : "Save Active Routes"}
        </button>
      </div>
    </div>
  );
}
