"use client";

import React, { useState, useEffect } from "react";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export default function AdminPageBuilder() {
  const [widgets, setWidgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState<{ [key: string]: boolean }>({});

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, widgetIndex: number, bannerIndex: number) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const uploadId = `${widgetIndex}-${bannerIndex}`;
    
    setUploadingImage(prev => ({ ...prev, [uploadId]: true }));
    try {
      const storageRef = ref(storage, `banners/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      const newWidgets = [...widgets];
      newWidgets[widgetIndex].data.banners[bannerIndex].imgUrl = downloadURL;
      setWidgets(newWidgets);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(prev => ({ ...prev, [uploadId]: false }));
    }
  };

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
    } else if (type === "FeaturedProduct") {
      newWidget.data = { title: "Featured Product", subtitle: "Spotlight", productId: "", btnText: "Shop Now", badgeText: "Top Pick" };
    } else if (type === "CategoryGrid") {
      newWidget.data = { title: "Shop by Category", subtitle: "Explore our collections", categories: [
        { title: "Pure Silk Pata", imgUrl: "", link: "/search?category=Pure Silk Pata" },
        { title: "Cotton Daily", imgUrl: "", link: "/search?category=Cotton" }
      ]};
    } else if (type === "RichText") {
      newWidget.data = { title: "Our Story", content: "<p>Write something beautiful here...</p>" };
    } else if (type === "ArtisanCircles") {
      newWidget.data = { circles: [
        { title: "Sarees", link: "/search", img: "/bhulia-hero.png" },
        { title: "Gifts", link: "/search", img: "/bhulia-hero.png" }
      ] };
    } else if (type === "HeritageStory") {
      newWidget.data = { badge: "Our Promise", title: "Handloom Legacy", content: "Write your heritage story.", btnText: "Learn More", btnLink: "/directory", imgUrl: "/bhulia-hero.png" };
    } else if (type === "BannerSlot") {
      newWidget.data = { id: "custom_slot" };
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
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500 mb-4">Hero Sliders can have multiple banners. You can upload an image directly from your computer.</p>
                      {widget.data.banners?.map((banner: any, bIdx: number) => (
                        <div key={bIdx} className="bg-white p-4 border border-gray-200 rounded mb-4">
                          <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                            <h4 className="font-bold text-[#C5A059] text-sm">Banner {bIdx + 1}</h4>
                            <button 
                              onClick={() => {
                                const newWidgets = [...widgets];
                                newWidgets[index].data.banners.splice(bIdx, 1);
                                setWidgets(newWidgets);
                              }}
                              className="text-red-500 text-xs font-bold hover:underline"
                            >
                              Remove Banner
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Image Section */}
                            <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 border border-gray-200 rounded flex items-center gap-4">
                              {banner.imgUrl ? (
                                <img src={banner.imgUrl} alt="Preview" className="w-24 h-16 object-cover rounded border border-gray-300 shadow-sm" />
                              ) : (
                                <div className="w-24 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No Image</div>
                              )}
                              <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-700 mb-1">Upload New Banner Image</label>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, index, bIdx)}
                                  disabled={uploadingImage[`${index}-${bIdx}`]}
                                  className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#C5A059] file:text-white hover:file:bg-[#996515] transition-colors"
                                />
                                {uploadingImage[`${index}-${bIdx}`] && <span className="text-xs text-blue-600 ml-2 font-bold animate-pulse">Uploading...</span>}
                              </div>
                            </div>

                            {/* Text Fields */}
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Top Badge Text</label>
                              <input 
                                type="text" 
                                value={banner.badge || ""} 
                                onChange={(e) => {
                                  const newWidgets = [...widgets];
                                  newWidgets[index].data.banners[bIdx].badge = e.target.value;
                                  setWidgets(newWidgets);
                                }}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-gray-800 text-sm focus:border-[#C5A059] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Main Title</label>
                              <input 
                                type="text" 
                                value={banner.title || ""} 
                                onChange={(e) => {
                                  const newWidgets = [...widgets];
                                  newWidgets[index].data.banners[bIdx].title = e.target.value;
                                  setWidgets(newWidgets);
                                }}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-gray-800 text-sm focus:border-[#C5A059] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Subtitle</label>
                              <input 
                                type="text" 
                                value={banner.subtitle || ""} 
                                onChange={(e) => {
                                  const newWidgets = [...widgets];
                                  newWidgets[index].data.banners[bIdx].subtitle = e.target.value;
                                  setWidgets(newWidgets);
                                }}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-gray-800 text-sm focus:border-[#C5A059] focus:outline-none"
                              />
                            </div>
                            
                            {/* Button Fields */}
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Button Text</label>
                              <input 
                                type="text" 
                                value={banner.btnText || ""} 
                                onChange={(e) => {
                                  const newWidgets = [...widgets];
                                  newWidgets[index].data.banners[bIdx].btnText = e.target.value;
                                  setWidgets(newWidgets);
                                }}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-gray-800 text-sm focus:border-[#C5A059] focus:outline-none"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-gray-700 mb-1">Button Link URL</label>
                              <input 
                                type="text" 
                                value={banner.btnLink || ""} 
                                onChange={(e) => {
                                  const newWidgets = [...widgets];
                                  newWidgets[index].data.banners[bIdx].btnLink = e.target.value;
                                  setWidgets(newWidgets);
                                }}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-gray-800 text-sm focus:border-[#C5A059] focus:outline-none"
                                placeholder="/search?category=Silk"
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

                  {widget.type === "RichText" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Heading</label>
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
                        <label className="block text-xs font-bold text-gray-700 mb-1">Content (HTML)</label>
                        <textarea 
                          value={widget.data.content || ""} 
                          onChange={(e) => {
                            const newWidgets = [...widgets];
                            newWidgets[index].data.content = e.target.value;
                            setWidgets(newWidgets);
                          }}
                          rows={6}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 font-mono text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {widget.type === "FeaturedProduct" && (
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Main Title (Optional override)</label>
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
                        <label className="block text-xs font-bold text-gray-700 mb-1">Subtitle</label>
                        <input 
                          type="text" 
                          value={widget.data.subtitle || ""} 
                          onChange={(e) => {
                            const newWidgets = [...widgets];
                            newWidgets[index].data.subtitle = e.target.value;
                            setWidgets(newWidgets);
                          }}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Product ID (Leave blank to use first active offer)</label>
                        <input 
                          type="text" 
                          value={widget.data.productId || ""} 
                          onChange={(e) => {
                            const newWidgets = [...widgets];
                            newWidgets[index].data.productId = e.target.value;
                            setWidgets(newWidgets);
                          }}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Badge Text</label>
                        <input 
                          type="text" 
                          value={widget.data.badgeText || ""} 
                          onChange={(e) => {
                            const newWidgets = [...widgets];
                            newWidgets[index].data.badgeText = e.target.value;
                            setWidgets(newWidgets);
                          }}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Button Text</label>
                        <input 
                          type="text" 
                          value={widget.data.btnText || ""} 
                          onChange={(e) => {
                            const newWidgets = [...widgets];
                            newWidgets[index].data.btnText = e.target.value;
                            setWidgets(newWidgets);
                          }}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800"
                        />
                      </div>
                    </div>
                  )}

                  {widget.type === "CategoryGrid" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Section Title</label>
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
                          <label className="block text-xs font-bold text-gray-700 mb-1">Subtitle</label>
                          <input 
                            type="text" 
                            value={widget.data.subtitle || ""} 
                            onChange={(e) => {
                              const newWidgets = [...widgets];
                              newWidgets[index].data.subtitle = e.target.value;
                              setWidgets(newWidgets);
                            }}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">Categories</label>
                        {widget.data.categories?.map((cat: any, cIdx: number) => (
                          <div key={cIdx} className="bg-white p-4 border border-gray-200 rounded mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-bold text-[#C5A059] text-sm">Category {cIdx + 1}</h4>
                              <button 
                                onClick={() => {
                                  const newWidgets = [...widgets];
                                  newWidgets[index].data.categories.splice(cIdx, 1);
                                  setWidgets(newWidgets);
                                }}
                                className="text-red-500 text-xs font-bold hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 border border-gray-200 rounded flex items-center gap-4">
                                {cat.imgUrl ? (
                                  <img src={cat.imgUrl} alt="Preview" className="w-16 h-16 object-cover rounded border border-gray-300 shadow-sm" />
                                ) : (
                                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">Img</div>
                                )}
                                <div className="flex-1">
                                  <label className="block text-xs font-bold text-gray-700 mb-1">Upload Image</label>
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={async (e) => {
                                      if (!e.target.files || e.target.files.length === 0) return;
                                      const file = e.target.files[0];
                                      const uploadId = `cat-${index}-${cIdx}`;
                                      setUploadingImage(prev => ({ ...prev, [uploadId]: true }));
                                      try {
                                        const storageRef = ref(storage, `categories/${Date.now()}_${file.name}`);
                                        await uploadBytes(storageRef, file);
                                        const downloadURL = await getDownloadURL(storageRef);
                                        const newWidgets = [...widgets];
                                        newWidgets[index].data.categories[cIdx].imgUrl = downloadURL;
                                        setWidgets(newWidgets);
                                      } catch (error) {
                                        console.error("Error uploading image:", error);
                                      } finally {
                                        setUploadingImage(prev => ({ ...prev, [uploadId]: false }));
                                      }
                                    }}
                                    disabled={uploadingImage[`cat-${index}-${cIdx}`]}
                                    className="text-sm text-gray-600 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#C5A059] file:text-white"
                                  />
                                  {uploadingImage[`cat-${index}-${cIdx}`] && <span className="text-xs text-blue-600 ml-2 font-bold animate-pulse">Uploading...</span>}
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Title</label>
                                <input 
                                  type="text" 
                                  value={cat.title || ""} 
                                  onChange={(e) => {
                                    const newWidgets = [...widgets];
                                    newWidgets[index].data.categories[cIdx].title = e.target.value;
                                    setWidgets(newWidgets);
                                  }}
                                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-gray-800 text-sm focus:border-[#C5A059] focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Link URL</label>
                                <input 
                                  type="text" 
                                  value={cat.link || ""} 
                                  onChange={(e) => {
                                    const newWidgets = [...widgets];
                                    newWidgets[index].data.categories[cIdx].link = e.target.value;
                                    setWidgets(newWidgets);
                                  }}
                                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-gray-800 text-sm focus:border-[#C5A059] focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const newWidgets = [...widgets];
                            newWidgets[index].data.categories.push({ title: "New Category", imgUrl: "", link: "/" });
                            setWidgets(newWidgets);
                          }}
                          className="text-sm bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 font-semibold"
                        >
                          + Add Category
                        </button>
                      </div>
                    </div>
                  {widget.type === "HeritageStory" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Badge</label>
                          <input 
                            type="text" 
                            value={widget.data.badge || ""} 
                            onChange={(e) => {
                              const newWidgets = [...widgets];
                              newWidgets[index].data.badge = e.target.value;
                              setWidgets(newWidgets);
                            }}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800"
                            placeholder="Our Promise"
                          />
                        </div>
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
                            placeholder="Main Heading"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Content (Paragraph)</label>
                        <textarea 
                          value={widget.data.content || ""} 
                          onChange={(e) => {
                            const newWidgets = [...widgets];
                            newWidgets[index].data.content = e.target.value;
                            setWidgets(newWidgets);
                          }}
                          rows={4}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Button Text</label>
                          <input 
                            type="text" 
                            value={widget.data.btnText || ""} 
                            onChange={(e) => {
                              const newWidgets = [...widgets];
                              newWidgets[index].data.btnText = e.target.value;
                              setWidgets(newWidgets);
                            }}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Button Link</label>
                          <input 
                            type="text" 
                            value={widget.data.btnLink || ""} 
                            onChange={(e) => {
                              const newWidgets = [...widgets];
                              newWidgets[index].data.btnLink = e.target.value;
                              setWidgets(newWidgets);
                            }}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Side Image URL</label>
                        <input 
                          type="text" 
                          value={widget.data.imgUrl || ""} 
                          onChange={(e) => {
                            const newWidgets = [...widgets];
                            newWidgets[index].data.imgUrl = e.target.value;
                            setWidgets(newWidgets);
                          }}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800"
                          placeholder="/bhulia-hero.png"
                        />
                      </div>
                    </div>
                  )}

                  {widget.type === "ArtisanCircles" && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500">Configure the top navigation circles.</p>
                      {widget.data.circles?.map((circle: any, cIdx: number) => (
                        <div key={cIdx} className="flex items-center gap-4 bg-gray-50 p-2 rounded border border-gray-200">
                          <img src={circle.img || "/bhulia-hero.png"} alt="circle" className="w-10 h-10 rounded-full object-cover border border-gray-300" />
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            <input 
                              type="text" 
                              value={circle.title || ""} 
                              onChange={(e) => {
                                const newWidgets = [...widgets];
                                newWidgets[index].data.circles[cIdx].title = e.target.value;
                                setWidgets(newWidgets);
                              }}
                              className="col-span-1 border border-gray-300 rounded px-2 py-1 text-sm"
                              placeholder="Title"
                            />
                            <input 
                              type="text" 
                              value={circle.link || ""} 
                              onChange={(e) => {
                                const newWidgets = [...widgets];
                                newWidgets[index].data.circles[cIdx].link = e.target.value;
                                setWidgets(newWidgets);
                              }}
                              className="col-span-1 border border-gray-300 rounded px-2 py-1 text-sm"
                              placeholder="Link"
                            />
                            <input 
                              type="text" 
                              value={circle.img || ""} 
                              onChange={(e) => {
                                const newWidgets = [...widgets];
                                newWidgets[index].data.circles[cIdx].img = e.target.value;
                                setWidgets(newWidgets);
                              }}
                              className="col-span-1 border border-gray-300 rounded px-2 py-1 text-sm"
                              placeholder="Image URL"
                            />
                          </div>
                          <button onClick={() => {
                            const newWidgets = [...widgets];
                            newWidgets[index].data.circles.splice(cIdx, 1);
                            setWidgets(newWidgets);
                          }} className="text-red-500 font-bold hover:underline">X</button>
                        </div>
                      ))}
                      <button onClick={() => {
                        const newWidgets = [...widgets];
                        if (!newWidgets[index].data.circles) newWidgets[index].data.circles = [];
                        newWidgets[index].data.circles.push({ title: "New", link: "/", img: "/bhulia-hero.png" });
                        setWidgets(newWidgets);
                      }} className="bg-gray-200 text-gray-800 px-4 py-2 text-sm rounded font-bold hover:bg-gray-300">+ Add Circle</button>
                    </div>
                  )}

                  {widget.type === "BannerSlot" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Ad Banner Slot ID</label>
                        <input 
                          type="text" 
                          value={widget.data.id || ""} 
                          onChange={(e) => {
                            const newWidgets = [...widgets];
                            newWidgets[index].data.id = e.target.value;
                            setWidgets(newWidgets);
                          }}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800"
                          placeholder="e.g. content_bottom"
                        />
                        <p className="text-xs text-gray-500 mt-1">This will render an ad from the global active promotions matching this slot ID.</p>
                      </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2 p-4">
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
                <button onClick={() => addWidget("FeaturedProduct")} className="p-4 border border-gray-200 rounded hover:border-[#C5A059] hover:bg-[#FFF8E7] text-left group transition-colors">
                  <div className="font-bold text-gray-800 group-hover:text-[#C5A059] mb-1">Featured Product</div>
                  <div className="text-xs text-gray-500">Highlight a single product to drive conversions.</div>
                </button>
                <button onClick={() => addWidget("CategoryGrid")} className="p-4 border border-gray-200 rounded hover:border-[#C5A059] hover:bg-[#FFF8E7] text-left group transition-colors">
                  <div className="font-bold text-gray-800 group-hover:text-[#C5A059] mb-1">Category Grid</div>
                  <div className="text-xs text-gray-500">Visual navigation for different product lines.</div>
                </button>
                <button onClick={() => addWidget("RichText")} className="p-4 border border-gray-200 rounded hover:border-[#C5A059] hover:bg-[#FFF8E7] text-left group transition-colors">
                  <div className="font-bold text-gray-800 group-hover:text-[#C5A059] mb-1">Rich Text & HTML</div>
                  <div className="text-xs text-gray-500">Add SEO paragraphs or embed code snippets.</div>
                </button>
                <button onClick={() => addWidget("ArtisanCircles")} className="p-4 border border-gray-200 rounded hover:border-[#C5A059] hover:bg-[#FFF8E7] text-left group transition-colors">
                  <div className="font-bold text-gray-800 group-hover:text-[#C5A059] mb-1">Artisan Circles</div>
                  <div className="text-xs text-gray-500">Row of circular navigation icons.</div>
                </button>
                <button onClick={() => addWidget("HeritageStory")} className="p-4 border border-gray-200 rounded hover:border-[#C5A059] hover:bg-[#FFF8E7] text-left group transition-colors">
                  <div className="font-bold text-gray-800 group-hover:text-[#C5A059] mb-1">Heritage Story</div>
                  <div className="text-xs text-gray-500">Large split image & text block for branding.</div>
                </button>
                <button onClick={() => addWidget("BannerSlot")} className="p-4 border border-gray-200 rounded hover:border-[#C5A059] hover:bg-[#FFF8E7] text-left group transition-colors">
                  <div className="font-bold text-gray-800 group-hover:text-[#C5A059] mb-1">Global Banner Ad</div>
                  <div className="text-xs text-gray-500">Injects a promotional banner ad slot.</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
