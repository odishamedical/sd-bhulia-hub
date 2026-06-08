"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { AdCampaign } from "@/types/cms";

export default function AdsPage() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"image" | "adsense">("image");
  const [placement, setPlacement] = useState<AdCampaign["placement"]>("homepage_middle");
  const [targetAudience, setTargetAudience] = useState<AdCampaign["targetAudience"]>("global");
  const [targetSpecificIdsStr, setTargetSpecificIdsStr] = useState("all");
  const [linkUrl, setLinkUrl] = useState("");
  const [htmlCode, setHtmlCode] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const snap = await getDocs(collection(db, "ad_campaigns"));
      const data: AdCampaign[] = [];
      snap.forEach(d => {
        data.push({ id: d.id, ...d.data() } as AdCampaign);
      });
      setCampaigns(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleToggle = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "paused" : "active";
      await updateDoc(doc(db, "ad_campaigns", id), { status: newStatus });
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
    } catch (e) {
      console.error(e);
      alert("Error toggling status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await deleteDoc(doc(db, "ad_campaigns", id));
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error(e);
      alert("Error deleting campaign.");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let contentValue = "";

      if (type === "image") {
        if (!selectedFile) {
          alert("Please select an image file.");
          setIsUploading(false);
          return;
        }
        const storage = getStorage();
        const fileRef = ref(storage, `ads/${Date.now()}_${selectedFile.name}`);
        await uploadBytesResumable(fileRef, selectedFile);
        contentValue = await getDownloadURL(fileRef);
      } else {
        contentValue = htmlCode;
        if (!contentValue) {
          alert("Please provide AdSense or HTML code.");
          setIsUploading(false);
          return;
        }
      }

      const newId = doc(collection(db, "ad_campaigns")).id;
      
      const idsArray = targetSpecificIdsStr.split(",").map(id => id.trim()).filter(id => id);

      const campaign: AdCampaign = {
        title,
        type,
        content: contentValue,
        linkUrl: type === "image" ? linkUrl : "",
        placement,
        targetAudience,
        targetSpecificIds: idsArray.length > 0 ? idsArray : ["all"],
        status: "active",
        impressions: 0,
        clicks: 0,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "ad_campaigns", newId), campaign);
      
      setCampaigns([{ id: newId, ...campaign }, ...campaigns]);
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      alert("Error creating campaign.");
    }
    
    setIsUploading(false);
  };

  const resetForm = () => {
    setTitle("");
    setType("image");
    setPlacement("homepage_middle");
    setTargetAudience("global");
    setTargetSpecificIdsStr("all");
    setLinkUrl("");
    setHtmlCode("");
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Banner Ads Manager</h1>
          <p className="text-gray-800 mt-2 font-semibold">Control promotional banners across all customer-facing apps globally.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgb(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Create New Campaign
        </button>
      </header>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Active Campaigns</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-100 bg-gray-50">
                <th className="py-4 px-4 font-bold rounded-tl-xl">Campaign Title</th>
                <th className="py-4 px-4 font-bold">Placement</th>
                <th className="py-4 px-4 font-bold">Targeting</th>
                <th className="py-4 px-4 font-bold">Status</th>
                <th className="py-4 px-4 font-bold text-right">Impressions</th>
                <th className="py-4 px-4 font-bold text-right">Clicks (CTR)</th>
                <th className="py-4 px-4 font-bold text-right rounded-tr-xl">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center text-gray-500 font-medium">Loading campaigns...</td></tr>
              ) : campaigns.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-gray-500 font-medium">No banner ads found. Create one above.</td></tr>
              ) : (
                campaigns.map(banner => {
                  const ctr = banner.impressions > 0 ? ((banner.clicks / banner.impressions) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={banner.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-900">{banner.title}</div>
                        <div className="text-[10px] text-gray-500 font-mono mt-1">{banner.type.toUpperCase()}</div>
                      </td>
                      <td className="py-4 px-4 text-gray-600 font-medium">{banner.placement}</td>
                      <td className="py-4 px-4">
                        <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md inline-block">
                          {banner.targetAudience}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1 truncate max-w-[150px]" title={banner.targetSpecificIds.join(", ")}>
                          {banner.targetSpecificIds.join(", ")}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <button 
                          onClick={() => handleToggle(banner.id as string, banner.status)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                          banner.status === 'active' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        }`}>
                          {banner.status}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-gray-600">{banner.impressions.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right font-mono">
                        <span className="text-gray-900 font-bold">{banner.clicks.toLocaleString()}</span>
                        <span className="text-gray-400 text-xs ml-1">({ctr}%)</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button onClick={() => handleDelete(banner.id as string)} className="text-red-500 hover:text-red-700 font-bold text-xs p-2">Delete</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur">
              <h2 className="text-xl font-bold text-gray-900">Create New Campaign</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest border-b pb-2">1. Campaign Details</h3>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Campaign Title</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="e.g. Diwali Silk Promo" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Ad Type</label>
                    <select value={type} onChange={e => setType(e.target.value as any)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                      <option value="image">Image Banner</option>
                      <option value="adsense">AdSense / Custom HTML</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Placement Slot</label>
                    <select value={placement} onChange={e => setPlacement(e.target.value as any)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                      <option value="homepage_top">Homepage Top</option>
                      <option value="homepage_middle">Homepage Middle</option>
                      <option value="sidebar">Sidebar</option>
                      <option value="content_top">Content Top (Above grids)</option>
                      <option value="content_bottom">Content Bottom</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest border-b pb-2">2. Targeting Rules</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Target Audience</label>
                    <select value={targetAudience} onChange={e => setTargetAudience(e.target.value as any)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                      <option value="global">Global (Everywhere)</option>
                      <option value="weavers">Weaver Profiles</option>
                      <option value="shops">Shop Profiles</option>
                      <option value="products">Product Pages</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Specific Target IDs (Comma separated)</label>
                    <input type="text" value={targetSpecificIdsStr} onChange={e => setTargetSpecificIdsStr(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono" placeholder="e.g. all, silk-sarees, prod-123" />
                    <p className="text-[10px] text-gray-500 mt-1">Use "all" to target everything in the audience category, or provide slugs/IDs.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest border-b pb-2">3. Ad Content</h3>
                
                {type === "image" ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Banner Image</label>
                      <input type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Click Destination URL</label>
                      <input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="https://..." />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">HTML / AdSense Code</label>
                    <textarea value={htmlCode} onChange={e => setHtmlCode(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono h-32" placeholder="<script async src='...'></script>..." />
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={isUploading} className="px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 disabled:opacity-50">
                  {isUploading ? "Creating..." : "Launch Campaign"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
