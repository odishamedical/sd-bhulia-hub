"use client";

import React, { useState } from "react";

export default function AdsPage() {
  const [banners, setBanners] = useState([
    { id: 1, title: "Diwali Handloom Sale", location: "Homepage Hero", status: "Active", impressions: 45200, clicks: 3200 },
    { id: 2, title: "Free Shipping on B2B", location: "Cart Page", status: "Active", impressions: 12500, clicks: 840 },
    { id: 3, title: "New Sambalpuri Arrivals", location: "Category Sidebar", status: "Paused", impressions: 0, clicks: 0 }
  ]);

  const handleToggle = (id: number) => {
    setBanners(prev => prev.map(b => {
      if (b.id === id) {
        return { ...b, status: b.status === "Active" ? "Paused" : "Active" };
      }
      return b;
    }));
  };

  const handleDelete = (id: number) => {
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Banner Ads Manager</h1>
          <p className="text-gray-800 mt-2 font-semibold">Control promotional banners across all customer-facing apps.</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgb(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:bg-blue-700 transition-all flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Upload New Banner
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
                <th className="py-4 px-4 font-bold">Status</th>
                <th className="py-4 px-4 font-bold text-right">Impressions</th>
                <th className="py-4 px-4 font-bold text-right">Clicks (CTR)</th>
                <th className="py-4 px-4 font-bold text-right rounded-tr-xl">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {banners.map(banner => {
                const ctr = banner.impressions > 0 ? ((banner.clicks / banner.impressions) * 100).toFixed(1) : "0.0";
                return (
                  <tr key={banner.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-gray-900">{banner.title}</td>
                    <td className="py-4 px-4 text-gray-600 font-medium">{banner.location}</td>
                    <td className="py-4 px-4">
                      <button 
                        onClick={() => handleToggle(banner.id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        banner.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
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
                      <button onClick={() => handleDelete(banner.id)} className="text-red-500 hover:text-red-700 font-bold text-xs p-2">Delete</button>
                    </td>
                  </tr>
                );
              })}
              {banners.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-500 font-medium">No banner ads found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
