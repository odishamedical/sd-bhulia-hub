"use client";

import React, { useState, useEffect } from "react";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminPageBuilder() {
  const [widgets, setWidgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadLayout() {
      try {
        const docSnap = await getDoc(doc(db, "page_layouts", "home_page"));
        if (docSnap.exists()) {
          setWidgets(docSnap.data().widgets || []);
        } else {
          // Pre-populate with the current layout so the admin has a starting point
          setWidgets([
            {
              type: "HeroSlider",
              data: {
                banners: [
                  { badge: "Bhulia.com Verified Heritage", title: "The Silk Masterpieces", subtitle: "Authentic Double Ikat Pata", imgUrl: "/hero_silk.jpg", btnText: "Discover the Collection", btnLink: "/search?category=Pure Silk Pata" },
                  { badge: "Empowering Artisans directly", title: "Everyday Luxury", subtitle: "Direct from Pit Looms", imgUrl: "/hero_loom.jpg", btnText: "Explore Cotton", btnLink: "/search?category=Cotton" }
                ]
              }
            },
            { type: "ArtisanCircles" },
            { type: "BannerSlot", data: { id: "homepage_middle" } },
            {
              type: "ProductCarousel",
              data: { title: "The Vault", filterType: "trending", itemLimit: 6 }
            },
            { type: "HeritageStory" },
            {
              type: "DirectoryGrid",
              data: { title: "Ecosystem Directory", subtitle: "Discover our network of verified partners", role: "weaver", itemLimit: 8 }
            },
            { type: "BannerSlot", data: { id: "content_bottom" } }
          ]);
        }
      } catch (e) {
        console.error("Error loading layout:", e);
      } finally {
        setLoading(false);
      }
    }
    loadLayout();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "page_layouts", "home_page"), { widgets, updatedAt: new Date().toISOString() });
      alert("Page layout saved successfully!");
      setEditingIndex(null);
    } catch (e) {
      console.error("Error saving layout:", e);
      alert("Failed to save layout.");
    } finally {
      setSaving(false);
    }
  };

  const addWidget = (type: string) => {
    const newWidget = { type, data: {} };
    if (type === "HeroSlider") {
      newWidget.data = {
        banners: [
          { badge: "New Badge", title: "New Title", subtitle: "New Subtitle", imgUrl: "", btnText: "Shop Now", btnLink: "/" }
        ]
      };
    } else if (type === "ProductCarousel") {
      newWidget.data = { title: "New Carousel", filterType: "trending", itemLimit: 6 };
    } else if (type === "DirectoryGrid") {
      newWidget.data = { title: "Directory", subtitle: "Meet our partners", role: "weaver", itemLimit: 4 };
    }
    
    setWidgets([...widgets, newWidget]);
    setShowAddMenu(false);
    setEditingIndex(widgets.length);
  };

  const removeWidget = (index: number) => {
    if (confirm("Are you sure you want to remove this widget?")) {
      setWidgets(widgets.filter((_, i) => i !== index));
    }
  };

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newWidgets = [...widgets];
      [newWidgets[index - 1], newWidgets[index]] = [newWidgets[index], newWidgets[index - 1]];
      setWidgets(newWidgets);
    } else if (direction === 'down' && index < widgets.length - 1) {
      const newWidgets = [...widgets];
      [newWidgets[index], newWidgets[index + 1]] = [newWidgets[index + 1], newWidgets[index]];
      setWidgets(newWidgets);
    }
  };

  if (loading) return <div className="p-8">Loading Page Builder...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-900">Visual Page Builder</h2>
          <p className="text-gray-500 mt-1">Design your Home Page layout by adding and configuring modular widgets.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded shadow flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Live Layout"}
        </button>
      </div>

      <div className="space-y-4">
        {widgets.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border-2 border-dashed border-gray-300">
            <h3 className="text-xl font-bold text-gray-700 mb-2">Your Home Page is Empty</h3>
            <p className="text-gray-500">Add a widget to start building your layout.</p>
          </div>
        ) : (
          widgets.map((widget, index) => (
            <div key={index} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center cursor-move">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <button disabled={index === 0} onClick={() => moveWidget(index, 'up')} className="text-gray-400 hover:text-blue-500 disabled:opacity-30">▲</button>
                    <button disabled={index === widgets.length - 1} onClick={() => moveWidget(index, 'down')} className="text-gray-400 hover:text-blue-500 disabled:opacity-30">▼</button>
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 uppercase tracking-wider text-sm">{widget.type}</span>
                    <span className="ml-4 text-xs text-gray-500">Block #{index + 1}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingIndex(editingIndex === index ? null : index)} className="text-sm bg-blue-100 text-blue-700 px-4 py-1.5 rounded hover:bg-blue-200 font-semibold">
                    {editingIndex === index ? "Close Editor" : "Configure"}
                  </button>
                  <button onClick={() => removeWidget(index)} className="text-sm bg-red-100 text-red-700 px-4 py-1.5 rounded hover:bg-red-200 font-semibold">
                    Remove
                  </button>
                </div>
              </div>

              {/* Editor Panel */}
              {editingIndex === index && (
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                  {widget.type === "ProductCarousel" && (
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Title</label>
                        <input 
                          type="text" 
                          value={widget.data.title || ""} 
                          onChange={(e) => {
                            const newWidgets = [...widgets];
                            newWidgets[index].data.title = e.target.value;
                            setWidgets(newWidgets);
                          }}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Filter Type</label>
                        <select 
                          value={widget.data.filterType || "trending"}
                          onChange={(e) => {
                            const newWidgets = [...widgets];
                            newWidgets[index].data.filterType = e.target.value;
                            setWidgets(newWidgets);
                          }}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800"
                        >
                          <option value="trending">Trending</option>
                          <option value="new">New Arrivals</option>
                          <option value="offers">Flash Sales</option>
                          <option value="category">Specific Category</option>
                        </select>
                      </div>
                      {widget.data.filterType === "category" && (
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Category Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Pure Silk Pata"
                            value={widget.data.category || ""} 
                            onChange={(e) => {
                              const newWidgets = [...widgets];
                              newWidgets[index].data.category = e.target.value;
                              setWidgets(newWidgets);
                            }}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {widget.type === "DirectoryGrid" && (
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Title</label>
                        <input 
                          type="text" 
                          value={widget.data.title || ""} 
                          onChange={(e) => {
                            const newWidgets = [...widgets];
                            newWidgets[index].data.title = e.target.value;
                            setWidgets(newWidgets);
                          }}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Role Displayed</label>
                        <select 
                          value={widget.data.role || "weaver"}
                          onChange={(e) => {
                            const newWidgets = [...widgets];
                            newWidgets[index].data.role = e.target.value;
                            setWidgets(newWidgets);
                          }}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800"
                        >
                          <option value="weaver">Weavers</option>
                          <option value="store">Retail Stores</option>
                          <option value="reseller">Resellers</option>
                          <option value="b2b">B2B Partners</option>
                          <option value="raw_material">Suppliers</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {widget.type === "HeroSlider" && (
                    <div>
                      <p className="text-sm text-gray-500 mb-4">Hero Sliders can have multiple banners. (Image upload requires URL for now in Phase 1)</p>
                      {widget.data.banners?.map((banner: any, bIdx: number) => (
                        <div key={bIdx} className="bg-white p-4 border border-gray-200 rounded mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-gray-800 text-sm">Banner {bIdx + 1}</h4>
                            <button 
                              onClick={() => {
                                const newWidgets = [...widgets];
                                newWidgets[index].data.banners.splice(bIdx, 1);
                                setWidgets(newWidgets);
                              }}
                              className="text-red-500 text-xs font-bold"
                            >
                              Remove Banner
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Title</label>
                              <input 
                                type="text" 
                                value={banner.title || ""} 
                                onChange={(e) => {
                                  const newWidgets = [...widgets];
                                  newWidgets[index].data.banners[bIdx].title = e.target.value;
                                  setWidgets(newWidgets);
                                }}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-gray-800 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Image URL</label>
                              <input 
                                type="text" 
                                value={banner.imgUrl || ""} 
                                onChange={(e) => {
                                  const newWidgets = [...widgets];
                                  newWidgets[index].data.banners[bIdx].imgUrl = e.target.value;
                                  setWidgets(newWidgets);
                                }}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-gray-800 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const newWidgets = [...widgets];
                          newWidgets[index].data.banners.push({ badge: "", title: "New Banner", subtitle: "", imgUrl: "", btnText: "Click Here", btnLink: "/" });
                          setWidgets(newWidgets);
                        }}
                        className="mt-2 text-sm bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 font-semibold"
                      >
                        + Add Another Banner
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>
          ))
        )}

        <div className="relative mt-8">
          <button 
            onClick={() => setShowAddMenu(!showAddMenu)} 
            className="w-full bg-white border-2 border-dashed border-gray-300 hover:border-[#C5A059] text-gray-600 hover:text-[#C5A059] font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add New Widget
          </button>
          
          {showAddMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-4 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-bold text-gray-800">Select Widget Type</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-4">
                <button onClick={() => addWidget("HeroSlider")} className="p-4 border border-gray-200 rounded hover:border-[#C5A059] hover:bg-[#FFF8E7] text-left group transition-colors">
                  <div className="font-bold text-gray-800 group-hover:text-[#C5A059] mb-1">Hero Slider</div>
                  <div className="text-xs text-gray-500">Large sliding banners at the top of the page.</div>
                </button>
                <button onClick={() => addWidget("ProductCarousel")} className="p-4 border border-gray-200 rounded hover:border-[#C5A059] hover:bg-[#FFF8E7] text-left group transition-colors">
                  <div className="font-bold text-gray-800 group-hover:text-[#C5A059] mb-1">Product Carousel</div>
                  <div className="text-xs text-gray-500">Show a row of products by category or trend.</div>
                </button>
                <button onClick={() => addWidget("DirectoryGrid")} className="p-4 border border-gray-200 rounded hover:border-[#C5A059] hover:bg-[#FFF8E7] text-left group transition-colors">
                  <div className="font-bold text-gray-800 group-hover:text-[#C5A059] mb-1">Directory Grid</div>
                  <div className="text-xs text-gray-500">Showcase a grid of verified partners.</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
