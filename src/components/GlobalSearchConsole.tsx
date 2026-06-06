"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function GlobalSearchConsole() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide on Admin, Dashboard, Auth, and the dedicated /search page itself.
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/franchise/dashboard") ||
    pathname?.startsWith("/login") ||
    pathname === "/search"
  ) {
    return null;
  }

  const [category, setCategory] = useState("");
  const [material, setMaterial] = useState("");
  const [design, setDesign] = useState("");
  const [price, setPrice] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (material) params.set("material", material);
    if (design) params.set("design", design);
    
    if (price) {
      const [min, max] = price.split("-");
      if (min) params.set("minPrice", min);
      if (max) params.set("maxPrice", max);
    }

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="hidden lg:flex w-full bg-[#08221D] border-b border-[#C5A059]/20 shadow-md z-40 relative">
      <div className="max-w-7xl mx-auto w-full px-6 py-3 flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-2 shrink-0">
          <svg className="w-5 h-5 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">Quick Search</span>
        </div>

        <div className="flex-1 flex items-center gap-3 justify-end">
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
            className="bg-[#051815] border border-[#C5A059]/30 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-[#C5A059] transition-all cursor-pointer min-w-[140px]"
          >
            <option value="">All Categories</option>
            <option value="Saree">Saree</option>
            <option value="Dress material">Dress material</option>
            <option value="Bedsheet">Bedsheet</option>
            <option value="Redy made Kurti">Kurti</option>
          </select>

          <select 
            value={material} 
            onChange={(e) => setMaterial(e.target.value)} 
            className="bg-[#051815] border border-[#C5A059]/30 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-[#C5A059] transition-all cursor-pointer min-w-[140px]"
          >
            <option value="">All Materials</option>
            <option value="Pure Cotton">Pure Cotton</option>
            <option value="Pure Silk (Pata)">Pure Silk (Pata)</option>
            <option value="Mix Silk">Mix Silk</option>
          </select>

          <select 
            value={design} 
            onChange={(e) => setDesign(e.target.value)} 
            className="bg-[#051815] border border-[#C5A059]/30 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-[#C5A059] transition-all cursor-pointer min-w-[160px]"
          >
            <option value="">All Designs</option>
            <option value="Sambalpuri Ikat (Bandha)">Traditional Ikat</option>
            <option value="Sambalpuri Double Ikat (Pashapali/Saptapar)">Double Ikat (Pasapalli)</option>
            <option value="Bomkei">Bomkai</option>
          </select>

          <select 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            className="bg-[#051815] border border-[#C5A059]/30 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-[#C5A059] transition-all cursor-pointer min-w-[140px]"
          >
            <option value="">Any Price</option>
            <option value="100-5000">₹100 - ₹5,000</option>
            <option value="5000-6000">₹5,000 - ₹6,000</option>
            <option value="6000-7000">₹6,000 - ₹7,000</option>
            <option value="7000-15000">₹7,000 - ₹15,000</option>
            <option value="15000-50000">₹15,000 - ₹50,000</option>
            <option value="50000-999999">Above ₹50,000</option>
          </select>

          <button 
            onClick={handleSearch}
            className="bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] px-5 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-md shrink-0 cursor-pointer"
          >
            Search
          </button>
        </div>

      </div>
    </div>
  );
}
