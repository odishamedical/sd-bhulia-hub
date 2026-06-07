"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface CMSRow {
  id: string;
  type: "hero" | "gateways" | "products" | "banner" | "adsense";
  title?: string;
  category?: string;
  bannerText?: string;
  htmlCode?: string;
  themeStyle?: string; // e.g. "free", "paid-1", "paid-2" (tied to themes)
}

interface CMSLayout {
  dynamicEnabled: boolean;
  rows: CMSRow[];
}

export default function CMSAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [layout, setLayout] = useState<CMSLayout>({ dynamicEnabled: false, rows: [] });

  useEffect(() => {
    async function fetchCMS() {
      try {
        const docSnap = await getDoc(doc(db, "platform_settings", "cms_homepage"));
        if (docSnap.exists()) {
          setLayout(docSnap.data() as CMSLayout);
        } else {
          // Initialize default layout
          const defaultLayout: CMSLayout = {
            dynamicEnabled: false,
            rows: [
              { id: "1", type: "hero" },
              { id: "2", type: "gateways" },
              { id: "3", type: "products", title: "Cotton Sambalpuri Sarees", category: "cotton-sambalpuri", themeStyle: "default" }
            ]
          };
          setLayout(defaultLayout);
        }
      } catch (e) {
        console.error("Error fetching CMS settings", e);
      }
      setLoading(false);
    };
    fetchCMS();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "platform_settings", "cms_homepage"), layout);
      alert("CMS Layout Saved Successfully! The homepage will immediately reflect these changes if dynamic mode is enabled.");
    } catch (e) {
      console.error(e);
      alert("Error saving CMS Layout");
    }
    setSaving(false);
  };

  const addRow = (type: CMSRow["type"]) => {
    setLayout(prev => ({
      ...prev,
      rows: [...prev.rows, { id: Date.now().toString(), type, title: "New Section", category: "", themeStyle: "default" }]
    }));
  };

  const removeRow = (id: string) => {
    setLayout(prev => ({
      ...prev,
      rows: prev.rows.filter(r => r.id !== id)
    }));
  };

  const updateRow = (id: string, field: keyof CMSRow, value: string) => {
    setLayout(prev => ({
      ...prev,
      rows: prev.rows.map(r => r.id === id ? { ...r, [field]: value } : r)
    }));
  };

  const moveRow = (index: number, direction: "up" | "down") => {
    const newRows = [...layout.rows];
    if (direction === "up" && index > 0) {
      [newRows[index - 1], newRows[index]] = [newRows[index], newRows[index - 1]];
    } else if (direction === "down" && index < newRows.length - 1) {
      [newRows[index + 1], newRows[index]] = [newRows[index], newRows[index + 1]];
    }
    setLayout({ ...layout, rows: newRows });
  };

  if (loading) return <div className="text-[#C5A059] animate-pulse">Loading CMS Data...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059]">CMS Settings & Theme Builder</h1>
        <p className="text-gray-300 text-xs mt-1">Control the structure and look of the platform directly from the frontend.</p>
      </div>

      {/* Master Toggle */}
      <div className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl p-6 flex justify-between items-center shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Dynamic Homepage System</h2>
          <p className="text-xs text-gray-400">If enabled, the public homepage will use the JSON configuration below instead of the hardcoded React code.</p>
        </div>
        <button 
          onClick={() => setLayout({ ...layout, dynamicEnabled: !layout.dynamicEnabled })}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${layout.dynamicEnabled ? "bg-[#C5A059]" : "bg-gray-600"}`}
        >
          <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${layout.dynamicEnabled ? "translate-x-7" : "translate-x-1"}`} />
        </button>
      </div>

      {/* Row Editor */}
      <div className="bg-[#0A2520] border border-[#C5A059]/20 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-[#C5A059] uppercase tracking-widest">Homepage Rows</h2>
          <div className="flex gap-2">
            <button onClick={() => addRow("products")} className="px-3 py-1.5 bg-[#051815] border border-[#C5A059]/40 text-[#C5A059] text-[10px] font-bold uppercase rounded hover:bg-[#C5A059]/10 transition-colors">+ Product Grid</button>
            <button onClick={() => addRow("banner")} className="px-3 py-1.5 bg-[#051815] border border-[#C5A059]/40 text-[#C5A059] text-[10px] font-bold uppercase rounded hover:bg-[#C5A059]/10 transition-colors">+ Banner</button>
            <button onClick={() => addRow("adsense")} className="px-3 py-1.5 bg-[#051815] border border-[#C5A059]/40 text-[#C5A059] text-[10px] font-bold uppercase rounded hover:bg-[#C5A059]/10 transition-colors">+ AdSense / HTML</button>
          </div>
        </div>

        <div className="space-y-4">
          {layout.rows.map((row, idx) => (
            <div key={row.id} className="bg-[#0B2B26] border border-[#C5A059]/30 p-4 rounded-xl flex items-start gap-4">
              <div className="flex flex-col gap-1">
                <button disabled={idx === 0} onClick={() => moveRow(idx, "up")} className="text-gray-400 hover:text-white disabled:opacity-30">▲</button>
                <button disabled={idx === layout.rows.length - 1} onClick={() => moveRow(idx, "down")} className="text-gray-400 hover:text-white disabled:opacity-30">▼</button>
              </div>
              
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#C5A059] tracking-widest block mb-1">Row Type</span>
                  <div className="px-3 py-2 bg-[#051815] rounded border border-[#C5A059]/20 text-sm text-gray-300 capitalize">{row.type.replace("-", " ")}</div>
                </div>
                
                {row.type === "products" && (
                  <>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#C5A059] tracking-widest block mb-1">Section Title</span>
                      <input type="text" value={row.title || ""} onChange={(e) => updateRow(row.id, "title", e.target.value)} className="w-full px-3 py-2 bg-[#051815] rounded border border-[#C5A059]/20 text-sm text-white focus:border-[#C5A059] outline-none" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#C5A059] tracking-widest block mb-1">Category Slug</span>
                      <input type="text" value={row.category || ""} onChange={(e) => updateRow(row.id, "category", e.target.value)} className="w-full px-3 py-2 bg-[#051815] rounded border border-[#C5A059]/20 text-sm text-white focus:border-[#C5A059] outline-none" placeholder="e.g. cotton-sambalpuri" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#C5A059] tracking-widest block mb-1">Theme (Tier Based)</span>
                      <select value={row.themeStyle || "default"} onChange={(e) => updateRow(row.id, "themeStyle", e.target.value)} className="w-full px-3 py-2 bg-[#051815] rounded border border-[#C5A059]/20 text-sm text-white focus:border-[#C5A059] outline-none">
                        <option value="default">Default (Minimal) - Free Tier</option>
                        <option value="modern">Modern - Paid Tier 1</option>
                        <option value="vintage">Vintage Heritage - Paid Tier 2</option>
                      </select>
                    </div>
                  </>
                )}

                {row.type === "banner" && (
                  <div className="sm:col-span-2">
                    <span className="text-[10px] uppercase font-bold text-[#C5A059] tracking-widest block mb-1">Banner Text</span>
                    <input type="text" value={row.bannerText || ""} onChange={(e) => updateRow(row.id, "bannerText", e.target.value)} className="w-full px-3 py-2 bg-[#051815] rounded border border-[#C5A059]/20 text-sm text-white focus:border-[#C5A059] outline-none" />
                  </div>
                )}

                {row.type === "adsense" && (
                  <div className="sm:col-span-2">
                    <span className="text-[10px] uppercase font-bold text-[#C5A059] tracking-widest block mb-1">Custom HTML / Google AdSense Code</span>
                    <textarea value={row.htmlCode || ""} onChange={(e) => updateRow(row.id, "htmlCode", e.target.value)} rows={4} className="w-full px-3 py-2 bg-[#051815] rounded border border-[#C5A059]/20 text-sm text-white focus:border-[#C5A059] outline-none font-mono placeholder:text-gray-600" placeholder="<script async src='https://pagead2.googlesyndication.com/...'>..." />
                  </div>
                )}
              </div>

              <button onClick={() => removeRow(row.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors" title="Delete Row">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button disabled={saving} onClick={handleSave} className="px-6 py-3 bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 shadow-lg disabled:opacity-50">
            {saving ? "Saving CMS Configuration..." : "Save Active Layout"}
          </button>
        </div>
      </div>
    </div>
  );
}
