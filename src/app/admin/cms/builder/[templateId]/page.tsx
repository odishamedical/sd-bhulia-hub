"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { PlatformPage, CMSRow, GlobalTheme, PageStatus } from "@/types/cms";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ImageUploader from "@/components/ImageUploader";
import { useVendors, useWeavers } from "@/lib/db-hooks";

const CATEGORIES = [
  "Saree",
  "Dress material",
  "Bedsheet",
  "RedyMade shirts",
  "Redy made Kurti",
  "Kurti dress material"
];
const MATERIALS = [
  "Pure Cotton",
  "Pure Silk (Pata)",
  "Mix Silk(Pata) (Silk+Polyster)",
  "Mix Cotton (Cotton+Polyster)"
];
const DESIGNS = [
  "Sambalpuri Ikat (Bandha)",
  "Sambalpuri Traditional Ikat Design",
  "Sambalpuri Modern Ikat Design",
  "Sambalpuri Double Ikat (Pashapali/Saptapar)",
  "Bomkei",
  "Bomkei+Ikat"
];

export default function CMSBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = typeof params?.templateId === "string" ? params.templateId : "";
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageData, setPageData] = useState<PlatformPage | null>(null);

  const { vendors: storeList } = useVendors();
  const { weavers: weaverList } = useWeavers();
  const allSellers = [
    ...storeList.map(v => ({ id: v.id, name: v.storeName, type: "Store" })),
    ...weaverList.map(w => ({ id: w.id, name: w.weaverName, type: "Weaver" }))
  ];

  useEffect(() => {
    async function fetchTemplate() {
      if (!templateId) return;
      try {
        const docSnap = await getDoc(doc(db, "platform_pages", templateId));
        if (docSnap.exists()) {
          setPageData({ id: docSnap.id, ...docSnap.data() } as PlatformPage);
        } else {
          alert("Template not found.");
          router.push("/admin/cms");
        }
      } catch (e) {
        console.error("Error fetching template", e);
      }
      setLoading(false);
    }
    fetchTemplate();
  }, [templateId, router]);

  const handleSave = async (statusOverride?: PageStatus) => {
    if (!pageData) return;
    setSaving(true);
    try {
      const updatedStatus = statusOverride || pageData.status;
      const dataToSave = {
        ...pageData,
        status: updatedStatus,
        updatedAt: new Date().toISOString()
      };
      
      // Clean up undefined
      const cleanData = JSON.parse(JSON.stringify(dataToSave));
      
      await updateDoc(doc(db, "platform_pages", templateId), cleanData);
      setPageData(dataToSave);
      alert(`Template saved successfully as ${updatedStatus.replace('_', ' ')}!`);
    } catch (e) {
      console.error(e);
      alert("Error saving template");
    }
    setSaving(false);
  };

  const updateGlobalTheme = (field: keyof GlobalTheme, value: string) => {
    if (!pageData) return;
    setPageData({
      ...pageData,
      theme: {
        ...pageData.theme,
        [field]: value
      }
    });
  };

  const addRow = (type: CMSRow["type"]) => {
    if (!pageData) return;
    setPageData(prev => ({
      ...prev!,
      rows: [...prev!.rows, { id: Date.now().toString(), type, title: "New Section" }]
    }));
  };

  const removeRow = (id: string) => {
    if (!pageData) return;
    setPageData(prev => ({
      ...prev!,
      rows: prev!.rows.filter(r => r.id !== id)
    }));
  };

  const updateRow = (id: string, field: keyof CMSRow, value: any) => {
    if (!pageData) return;
    setPageData(prev => ({
      ...prev!,
      rows: prev!.rows.map(r => r.id === id ? { ...r, [field]: value } : r)
    }));
  };

  const moveRow = (index: number, direction: "up" | "down") => {
    if (!pageData) return;
    const newRows = [...pageData.rows];
    if (direction === "up" && index > 0) {
      [newRows[index - 1], newRows[index]] = [newRows[index], newRows[index - 1]];
    } else if (direction === "down" && index < newRows.length - 1) {
      [newRows[index + 1], newRows[index]] = [newRows[index], newRows[index + 1]];
    }
    setPageData({ ...pageData, rows: newRows });
  };

  if (loading) return <div className="p-8 text-[#C5A059] animate-pulse">Loading Visual Editor...</div>;
  if (!pageData) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#C5A059]/30 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/cms" className="text-gray-400 hover:text-white transition-colors">← Back</Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059]">Visual Editor</h1>
            <p className="text-gray-300 text-xs mt-1">Editing: <span className="text-white font-bold">{pageData.title}</span> ({pageData.type} layout)</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="px-6 py-2.5 bg-[#051815] border border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059]/10 rounded-xl text-xs uppercase tracking-wider font-bold transition-colors"
          >
            Save as Draft
          </button>
          <button 
            onClick={() => handleSave("premium_template")}
            disabled={saving}
            className="bg-[#C5A059] text-[#0A1021] hover:brightness-110 transition-all font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg"
          >
            Publish Premium Template
          </button>
        </div>
      </div>

      {/* Global Theme Editor */}
      <section className="bg-[#0B2B26]/80 border border-[#C5A059]/30 rounded-3xl p-6 shadow-xl sticky top-4 z-10 backdrop-blur-md">
        <h2 className="text-lg font-bold text-white mb-4 border-b border-[#C5A059]/20 pb-2 flex justify-between items-center">
          1. Global Design Theme
          <span className="text-xs font-mono text-gray-400 font-normal tracking-widest uppercase">Visual Roots</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-[#C5A059] uppercase tracking-widest mb-1">Background Color</label>
            <div className="flex items-center gap-2 bg-[#051815] border border-[#C5A059]/30 rounded-xl px-3 py-2">
              <input type="color" value={pageData.theme.backgroundColor || "#0A1021"} onChange={e => updateGlobalTheme("backgroundColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0" />
              <input type="text" value={pageData.theme.backgroundColor || "#0A1021"} onChange={e => updateGlobalTheme("backgroundColor", e.target.value)} className="w-full bg-transparent text-white text-sm outline-none font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#C5A059] uppercase tracking-widest mb-1">Heading Color</label>
            <div className="flex items-center gap-2 bg-[#051815] border border-[#C5A059]/30 rounded-xl px-3 py-2">
              <input type="color" value={pageData.theme.headingColor || "#C5A059"} onChange={e => updateGlobalTheme("headingColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0" />
              <input type="text" value={pageData.theme.headingColor || "#C5A059"} onChange={e => updateGlobalTheme("headingColor", e.target.value)} className="w-full bg-transparent text-white text-sm outline-none font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#C5A059] uppercase tracking-widest mb-1">Text Color</label>
            <div className="flex items-center gap-2 bg-[#051815] border border-[#C5A059]/30 rounded-xl px-3 py-2">
              <input type="color" value={pageData.theme.textColor || "#E2E8F0"} onChange={e => updateGlobalTheme("textColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0" />
              <input type="text" value={pageData.theme.textColor || "#E2E8F0"} onChange={e => updateGlobalTheme("textColor", e.target.value)} className="w-full bg-transparent text-white text-sm outline-none font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#C5A059] uppercase tracking-widest mb-1">Accent / Ticket Color</label>
            <div className="flex items-center gap-2 bg-[#051815] border border-[#C5A059]/30 rounded-xl px-3 py-2">
              <input type="color" value={pageData.theme.ticketColor || "#C5A059"} onChange={e => updateGlobalTheme("ticketColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0" />
              <input type="text" value={pageData.theme.ticketColor || "#C5A059"} onChange={e => updateGlobalTheme("ticketColor", e.target.value)} className="w-full bg-transparent text-white text-sm outline-none font-mono" />
            </div>
          </div>
        </div>
      </section>

      {/* Row Manager */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">2. Content Rows</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => addRow("hero")} className="px-3 py-1.5 bg-[#0A3A35] hover:bg-[#0A3A35]/80 text-[#C5A059] text-[10px] uppercase tracking-widest font-bold rounded">+ Hero</button>
            <button type="button" onClick={() => addRow("products")} className="px-3 py-1.5 bg-[#0A3A35] hover:bg-[#0A3A35]/80 text-[#C5A059] text-[10px] uppercase tracking-widest font-bold rounded">+ Product Grid</button>
            <button type="button" onClick={() => addRow("multi_banner")} className="px-3 py-1.5 bg-[#0A3A35] hover:bg-[#0A3A35]/80 text-[#C5A059] text-[10px] uppercase tracking-widest font-bold rounded">+ Multi Banner</button>
            <button type="button" onClick={() => addRow("split_banner_products")} className="px-3 py-1.5 bg-[#0A3A35] hover:bg-[#0A3A35]/80 text-[#C5A059] text-[10px] uppercase tracking-widest font-bold rounded">+ Split Section</button>
          </div>
        </div>

        {pageData.rows.map((row, index) => (
          <div key={row.id} className="bg-[#051815] border border-[#C5A059]/20 rounded-2xl p-6 relative group shadow-lg">
            
            <div className="absolute top-4 right-4 flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
              <button type="button" onClick={() => moveRow(index, "up")} disabled={index === 0} className="p-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-30">↑</button>
              <button type="button" onClick={() => moveRow(index, "down")} disabled={index === pageData.rows.length - 1} className="p-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-30">↓</button>
              <button type="button" onClick={() => removeRow(row.id)} className="p-2 bg-red-900/50 text-red-400 rounded hover:bg-red-900/80">✕</button>
            </div>

            <div className="mb-4">
              <span className="px-2 py-1 bg-[#C5A059]/20 text-[#C5A059] text-[10px] uppercase font-bold tracking-widest rounded border border-[#C5A059]/40">{row.type} Row</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Common Title */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Section Title</label>
                <input type="text" value={row.title || ""} onChange={e => updateRow(row.id, "title", e.target.value)} className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-white text-sm outline-none" placeholder="e.g. Featured Collection" />
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" checked={row.hideTitle || false} onChange={e => updateRow(row.id, "hideTitle", e.target.checked)} className="w-3 h-3 bg-[#051815] border-[#C5A059] text-[#C5A059] rounded" />
                  <label className="text-[10px] text-gray-400">Hide title on public storefront (Internal use only)</label>
                </div>
              </div>

              {/* Hero Specific */}
              {row.type === "hero" && (
                <div className="md:col-span-2 space-y-6 border-t border-[#C5A059]/20 pt-4 mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hero Layout Style</label>
                      <select value={row.heroLayout || "full"} onChange={e => updateRow(row.id, "heroLayout", e.target.value)} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-white text-sm outline-none">
                        <option value="full">Full Width Slider / Image</option>
                        <option value="split_75_25">75% Left Slider | 25% Right Ad Image</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Headline Text (Optional)</label>
                      <input type="text" value={row.heroHeadline || ""} onChange={e => updateRow(row.id, "heroHeadline", e.target.value)} className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-white text-sm outline-none" placeholder="e.g. Summer Collection" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Subheadline (Optional)</label>
                      <input type="text" value={row.heroSubheadline || ""} onChange={e => updateRow(row.id, "heroSubheadline", e.target.value)} className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-white text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Button Text (Optional)</label>
                      <input type="text" value={row.heroButtonText || ""} onChange={e => updateRow(row.id, "heroButtonText", e.target.value)} className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-white text-sm outline-none" placeholder="e.g. Shop Now" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Button Link (Optional)</label>
                      <input type="text" value={row.heroButtonLink || ""} onChange={e => updateRow(row.id, "heroButtonLink", e.target.value)} className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-white text-sm outline-none" placeholder="/category/silk" />
                    </div>
                  </div>

                  <div className="bg-[#051815] p-4 rounded-xl border border-[#C5A059]/10">
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest">Main Hero Slider Images (Left Side if Split)</label>
                      <button type="button" onClick={() => {
                        const newImages = [...(row.heroImages || []), ""];
                        updateRow(row.id, "heroImages", newImages);
                      }} className="text-xs text-[#C5A059] hover:underline font-bold">+ Add Slide</button>
                    </div>
                    
                    {(row.heroImages || []).length === 0 && (
                      <div className="text-xs text-gray-400 italic mb-4">No images added. You can leave this blank if you only want text.</div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(row.heroImages || []).map((img, idx) => (
                        <div key={idx} className="relative">
                          <button type="button" onClick={() => {
                            const newImages = [...row.heroImages!];
                            newImages.splice(idx, 1);
                            updateRow(row.id, "heroImages", newImages);
                          }} className="absolute top-2 right-2 bg-red-900/80 text-white rounded px-2 py-1 text-xs z-10">Remove</button>
                          <ImageUploader 
                            value={img} 
                            onChange={val => {
                              const newImages = [...row.heroImages!];
                              newImages[idx] = val;
                              updateRow(row.id, "heroImages", newImages);
                            }} 
                            label={`Slide ${idx + 1}`} 
                            aspectRatio="landscape" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {row.heroLayout === "split_75_25" && (
                    <div className="bg-[#051815] p-4 rounded-xl border border-[#C5A059]/10 mt-4">
                      <div className="flex justify-between items-end mb-4 border-b border-[#C5A059]/20 pb-4">
                        <div>
                          <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest">Right Side Content (25%)</label>
                          <p className="text-[10px] text-gray-400 mt-1">Choose whether to show an Advertisement Image or a vertical list of Products.</p>
                        </div>
                        <select value={row.heroRightContentType || "ad"} onChange={e => updateRow(row.id, "heroRightContentType", e.target.value)} className="w-64 bg-[#0B2B26] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-white text-sm outline-none">
                          <option value="ad">Single Ad Banner</option>
                          <option value="products">Product List</option>
                        </select>
                      </div>

                      {(!row.heroRightContentType || row.heroRightContentType === "ad") ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <ImageUploader value={row.heroRightImage || ""} onChange={val => updateRow(row.id, "heroRightImage", val)} label="Ad Image" aspectRatio="portrait" />
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ad Link Destination</label>
                            <input type="text" value={row.heroRightLink || ""} onChange={e => updateRow(row.id, "heroRightLink", e.target.value)} className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-white text-sm outline-none" placeholder="/sale" />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Filter by Category</label>
                            <select value={row.category || ""} onChange={e => updateRow(row.id, "category", e.target.value)} className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-white text-sm outline-none">
                              <option value="">-- All Categories --</option>
                              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Product Limit (1 or 2 recommended)</label>
                            <input type="number" value={row.productLimit || 2} onChange={e => updateRow(row.id, "productLimit", parseInt(e.target.value))} className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-white text-sm outline-none" />
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={row.featuredOnly || false} onChange={e => updateRow(row.id, "featuredOnly", e.target.checked)} className="w-4 h-4 bg-[#0A1021] border-[#C5A059] text-[#C5A059] rounded" />
                            <label className="text-xs font-bold text-gray-300">Show Only Featured Products</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={row.discountOnly || false} onChange={e => updateRow(row.id, "discountOnly", e.target.checked)} className="w-4 h-4 bg-[#0A1021] border-[#C5A059] text-[#C5A059] rounded" />
                            <label className="text-xs font-bold text-gray-300">Show Only Heavy Discount</label>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Products Specific */}
              {row.type === "products" && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Filter by Category</label>
                    <select value={row.category || ""} onChange={e => updateRow(row.id, "category", e.target.value)} className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-white text-sm outline-none">
                      <option value="">-- All Categories --</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Filter by Material</label>
                    <select value={row.productMaterial || ""} onChange={e => updateRow(row.id, "productMaterial", e.target.value)} className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-white text-sm outline-none">
                      <option value="">-- All Materials --</option>
                      {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Filter by Design</label>
                    <select value={row.productDesign || ""} onChange={e => updateRow(row.id, "productDesign", e.target.value)} className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-white text-sm outline-none">
                      <option value="">-- All Designs --</option>
                      {DESIGNS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Filter by Vendor / Weaver</label>
                    <select value={row.vendorId || ""} onChange={e => updateRow(row.id, "vendorId", e.target.value)} className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-white text-sm outline-none">
                      <option value="">-- All Vendors & Weavers --</option>
                      {allSellers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.type})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Product Limit</label>
                    <input type="number" value={row.productLimit || 10} onChange={e => updateRow(row.id, "productLimit", parseInt(e.target.value))} className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-white text-sm outline-none" />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input type="checkbox" checked={row.featuredOnly || false} onChange={e => updateRow(row.id, "featuredOnly", e.target.checked)} className="w-4 h-4 bg-[#051815] border-[#C5A059] text-[#C5A059] rounded" />
                    <label className="text-xs font-bold text-gray-300">Show Only Featured Products</label>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input type="checkbox" checked={row.discountOnly || false} onChange={e => updateRow(row.id, "discountOnly", e.target.checked)} className="w-4 h-4 bg-[#051815] border-[#C5A059] text-[#C5A059] rounded" />
                    <label className="text-xs font-bold text-gray-300">Show Only Heavy Discount Products</label>
                  </div>
                </>
              )}

              {/* Multi Banner Specific */}
              {row.type === "multi_banner" && (
                <div className="md:col-span-2 space-y-4 border-t border-[#C5A059]/20 pt-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Banners Grid</label>
                    <button type="button" onClick={() => {
                      const newBanners = [...(row.banners || []), { image: "", link: "" }];
                      updateRow(row.id, "banners", newBanners);
                    }} className="text-xs text-[#C5A059] hover:underline font-bold">+ Add Banner</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(row.banners || []).map((b, bIdx) => (
                      <div key={bIdx} className="bg-[#0B2B26] p-4 rounded-xl border border-[#C5A059]/10 relative">
                        <button type="button" onClick={() => {
                          const newBanners = [...row.banners!];
                          newBanners.splice(bIdx, 1);
                          updateRow(row.id, "banners", newBanners);
                        }} className="absolute top-2 right-2 text-red-400 text-xs font-bold z-10">✕</button>
                        <ImageUploader value={b.image} onChange={val => {
                          const newBanners = [...row.banners!];
                          newBanners[bIdx].image = val;
                          updateRow(row.id, "banners", newBanners);
                        }} label={`Banner ${bIdx + 1} Image`} aspectRatio="landscape" />
                        <div className="mt-4">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Link Destination</label>
                          <input type="text" value={b.link} onChange={e => {
                            const newBanners = [...row.banners!];
                            newBanners[bIdx].link = e.target.value;
                            updateRow(row.id, "banners", newBanners);
                          }} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-white text-sm outline-none" placeholder="/category/silk" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Split Banner & Products Specific (Modular Grid) */}
              {row.type === "split_banner_products" && (
                <div className="md:col-span-2 border-t border-[#C5A059]/20 pt-4 mt-2">
                  <div className="flex justify-between items-end mb-6 bg-[#051815] p-4 rounded-xl border border-[#C5A059]/20">
                    <div>
                      <h3 className="text-sm font-bold text-[#C5A059] uppercase tracking-widest">Modular Grid Configuration</h3>
                      <p className="text-[10px] text-gray-400 mt-1">Select 2, 3, or 4 columns. You can configure each column independently.</p>
                    </div>
                    <div>
                      <select 
                        value={row.splitColumnsCount || 2} 
                        onChange={e => {
                          const newCount = parseInt(e.target.value) as 2 | 3 | 4;
                          // Initialize columns if missing
                          let newCols = [...(row.splitColumns || [])];
                          if (newCols.length === 0) {
                            newCols = [
                              { id: "1", type: "ad" },
                              { id: "2", type: "products" }
                            ];
                          }
                          // Add or remove columns to match count
                          while (newCols.length < newCount) {
                            newCols.push({ id: Date.now().toString() + Math.random(), type: "ad" });
                          }
                          while (newCols.length > newCount) {
                            newCols.pop();
                          }
                          updateRow(row.id, "splitColumnsCount", newCount);
                          updateRow(row.id, "splitColumns", newCols);
                        }} 
                        className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-white text-sm outline-none font-bold"
                      >
                        <option value={2}>2 Columns (50% / 50%)</option>
                        <option value={3}>3 Columns (33% / 33% / 33%)</option>
                        <option value={4}>4 Columns (25% / 25% / 25% / 25%)</option>
                      </select>
                    </div>
                  </div>

                  {/* Render Columns */}
                  {(row.splitColumnsCount && row.splitColumns) ? (
                    <div className={`grid grid-cols-1 md:grid-cols-${row.splitColumnsCount} gap-4`}>
                      {row.splitColumns.map((col, colIdx) => (
                        <div key={col.id} className="bg-[#0A1021] border border-[#C5A059]/20 p-4 rounded-xl relative group shadow-inner">
                          <div className="absolute -top-3 left-4 bg-[#C5A059] text-[#0A1021] text-[10px] font-bold px-2 py-0.5 rounded shadow">Column {colIdx + 1}</div>
                          
                          <div className="mt-2 mb-4 pb-4 border-b border-[#C5A059]/10">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Content Type</label>
                            <select 
                              value={col.type} 
                              onChange={e => {
                                const newCols = [...row.splitColumns!];
                                newCols[colIdx].type = e.target.value as "ad" | "products";
                                updateRow(row.id, "splitColumns", newCols);
                              }} 
                              className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-3 py-1.5 text-[#C5A059] font-bold text-xs outline-none"
                            >
                              <option value="ad">Ad Banner</option>
                              <option value="products">Product List</option>
                            </select>
                          </div>

                          {col.type === "ad" ? (
                            <div className="space-y-4">
                              <ImageUploader 
                                value={col.bannerImage || ""} 
                                onChange={val => {
                                  const newCols = [...row.splitColumns!];
                                  newCols[colIdx].bannerImage = val;
                                  updateRow(row.id, "splitColumns", newCols);
                                }} 
                                label="Ad Image" 
                                aspectRatio="portrait" 
                              />
                              <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Overlay Text (Optional)</label>
                                <input 
                                  type="text" 
                                  value={col.bannerText || ""} 
                                  onChange={e => {
                                    const newCols = [...row.splitColumns!];
                                    newCols[colIdx].bannerText = e.target.value;
                                    updateRow(row.id, "splitColumns", newCols);
                                  }} 
                                  className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-lg px-3 py-1.5 text-white text-xs outline-none" 
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Click Link (Optional)</label>
                                <input 
                                  type="text" 
                                  value={col.bannerLink || ""} 
                                  onChange={e => {
                                    const newCols = [...row.splitColumns!];
                                    newCols[colIdx].bannerLink = e.target.value;
                                    updateRow(row.id, "splitColumns", newCols);
                                  }} 
                                  className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-lg px-3 py-1.5 text-white text-xs outline-none" 
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Category</label>
                                <select 
                                  value={col.category || ""} 
                                  onChange={e => {
                                    const newCols = [...row.splitColumns!];
                                    newCols[colIdx].category = e.target.value;
                                    updateRow(row.id, "splitColumns", newCols);
                                  }} 
                                  className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-lg px-3 py-1.5 text-white text-xs outline-none"
                                >
                                  <option value="">-- All --</option>
                                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Material</label>
                                <select 
                                  value={col.productMaterial || ""} 
                                  onChange={e => {
                                    const newCols = [...row.splitColumns!];
                                    newCols[colIdx].productMaterial = e.target.value;
                                    updateRow(row.id, "splitColumns", newCols);
                                  }} 
                                  className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-lg px-3 py-1.5 text-white text-xs outline-none"
                                >
                                  <option value="">-- All --</option>
                                  {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Design</label>
                                <select 
                                  value={col.productDesign || ""} 
                                  onChange={e => {
                                    const newCols = [...row.splitColumns!];
                                    newCols[colIdx].productDesign = e.target.value;
                                    updateRow(row.id, "splitColumns", newCols);
                                  }} 
                                  className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-lg px-3 py-1.5 text-white text-xs outline-none"
                                >
                                  <option value="">-- All --</option>
                                  {DESIGNS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Vendor / Weaver</label>
                                <select 
                                  value={col.vendorId || ""} 
                                  onChange={e => {
                                    const newCols = [...row.splitColumns!];
                                    newCols[colIdx].vendorId = e.target.value;
                                    updateRow(row.id, "splitColumns", newCols);
                                  }} 
                                  className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-lg px-3 py-1.5 text-white text-xs outline-none"
                                >
                                  <option value="">-- All --</option>
                                  {allSellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Min Price</label>
                                  <input 
                                    type="number" 
                                    value={col.minPrice || ""} 
                                    onChange={e => {
                                      const newCols = [...row.splitColumns!];
                                      newCols[colIdx].minPrice = e.target.value ? parseInt(e.target.value) : undefined;
                                      updateRow(row.id, "splitColumns", newCols);
                                    }} 
                                    placeholder="₹0"
                                    className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-lg px-3 py-1.5 text-white text-xs outline-none" 
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Max Price</label>
                                  <input 
                                    type="number" 
                                    value={col.maxPrice || ""} 
                                    onChange={e => {
                                      const newCols = [...row.splitColumns!];
                                      newCols[colIdx].maxPrice = e.target.value ? parseInt(e.target.value) : undefined;
                                      updateRow(row.id, "splitColumns", newCols);
                                    }} 
                                    placeholder="₹Any"
                                    className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-lg px-3 py-1.5 text-white text-xs outline-none" 
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Product Limit</label>
                                <input 
                                  type="number" 
                                  value={col.productLimit || 2} 
                                  onChange={e => {
                                    const newCols = [...row.splitColumns!];
                                    newCols[colIdx].productLimit = parseInt(e.target.value);
                                    updateRow(row.id, "splitColumns", newCols);
                                  }} 
                                  className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-lg px-3 py-1.5 text-white text-xs outline-none" 
                                />
                              </div>
                              <div className="flex flex-col gap-2 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={col.featuredOnly || false} 
                                    onChange={e => {
                                      const newCols = [...row.splitColumns!];
                                      newCols[colIdx].featuredOnly = e.target.checked;
                                      updateRow(row.id, "splitColumns", newCols);
                                    }} 
                                    className="w-3 h-3 bg-[#0A1021] border-[#C5A059] text-[#C5A059] rounded" 
                                  />
                                  <span className="text-[10px] font-bold text-gray-300">Featured Only</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={col.discountOnly || false} 
                                    onChange={e => {
                                      const newCols = [...row.splitColumns!];
                                      newCols[colIdx].discountOnly = e.target.checked;
                                      updateRow(row.id, "splitColumns", newCols);
                                    }} 
                                    className="w-3 h-3 bg-[#0A1021] border-[#C5A059] text-[#C5A059] rounded" 
                                  />
                                  <span className="text-[10px] font-bold text-gray-300">Heavy Discount</span>
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-[#051815] rounded-xl border border-dashed border-[#C5A059]/30">
                      <p className="text-gray-400 text-sm mb-4">You have an older version of the Split Section.</p>
                      <button type="button" onClick={() => {
                        updateRow(row.id, "splitColumnsCount", 2);
                        updateRow(row.id, "splitColumns", [
                          { id: "1", type: "ad", bannerImage: row.bannerImage, bannerLink: row.bannerLink, bannerText: row.bannerText },
                          { id: "2", type: "products", category: row.category, productLimit: row.productLimit, featuredOnly: row.featuredOnly, discountOnly: row.discountOnly }
                        ]);
                      }} className="bg-[#C5A059] text-[#0A1021] px-4 py-2 rounded font-bold text-xs uppercase">Upgrade to Modular Grid</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {pageData.rows.length === 0 && (
          <div className="py-16 text-center border-2 border-dashed border-[#C5A059]/20 rounded-3xl">
            <p className="text-gray-400 font-mono text-sm">This layout is empty. Add a content row above.</p>
          </div>
        )}
      </section>
    </div>
  );
}
