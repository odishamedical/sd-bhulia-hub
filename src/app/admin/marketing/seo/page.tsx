"use client";

import React, { useState } from "react";

export default function SEOPage() {
  const [seoData, setSeoData] = useState([
    { id: 1, route: "/", title: "Shyam Dash Hub | Authentic Sambalpuri Handlooms", description: "Buy 100% authentic GI-tagged Sambalpuri cotton and silk sarees directly from the weavers of Odisha.", keywords: "sambalpuri saree, handloom, odisha weavers, silk saree, ikat", status: "Optimized" },
    { id: 2, route: "/admin", title: "Super Admin Hub | SD Ecosystem", description: "Secure internal administration panel for Shyam Dash Hub ecosystem.", keywords: "admin, dashboard", status: "No Index" },
    { id: 3, route: "/store/[slug]", title: "Official Franchise Store | SD Hub", description: "Visit our verified B2B franchise stores across India.", keywords: "franchise, b2b, retail, sambalpuri", status: "Needs Review" }
  ]);

  const handleUpdate = () => {
    alert("Simulating Save to Next.js global Head state...");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Global SEO Manager</h1>
          <p className="text-gray-800 mt-2 font-semibold">Control Meta Tags, Titles, and OpenGraph data across all dynamic Next.js routes.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-green-100 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Google Index Status</h3>
          <p className="text-4xl font-black text-green-600">Healthy</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-orange-100 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Routes Needing Review</h3>
          <p className="text-4xl font-black text-orange-600">14</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Avg Organic Traffic / mo</h3>
          <p className="text-4xl font-black text-gray-900">42.5K</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Route Level SEO Overrides</h2>
        <div className="space-y-6">
          {seoData.map(item => (
            <div key={item.id} className="border border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border mb-2 inline-block ${
                    item.status === 'Optimized' ? 'bg-green-50 text-green-700 border-green-200' :
                    item.status === 'No Index' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                    'bg-orange-50 text-orange-700 border-orange-200'
                  }`}>
                    {item.status}
                  </span>
                  <h3 className="font-mono text-gray-500 text-sm">{item.route}</h3>
                </div>
                <button onClick={handleUpdate} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-all">Save Changes</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Title Tag</label>
                  <input type="text" defaultValue={item.title} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Meta Description</label>
                  <textarea defaultValue={item.description} rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none resize-none" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
