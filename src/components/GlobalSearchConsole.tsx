"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function GlobalSearchConsole() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide on Admin, Dashboard, Auth
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/franchise/dashboard") ||
    pathname?.startsWith("/login")
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
    <div className="hidden lg:flex w-full bg-[#FDFBF7]/95 backdrop-blur-xl border-b border-[#C5A059]/40 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] z-40 relative">
      <div className="w-full px-6 lg:px-8 py-5 flex items-center justify-between gap-6">
        
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-[#051815] flex items-center justify-center shadow-inner">
            <svg className="w-5 h-5 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <span className="text-sm font-black uppercase tracking-widest text-[#051815]">Quick Search</span>
        </div>

        <div className="flex-1 flex items-center gap-4 justify-end">
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
            className="bg-white border-2 border-[#C5A059]/20 hover:border-[#C5A059]/50 rounded-xl px-4 py-3 text-[#051815] text-sm font-bold outline-none focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/10 transition-all cursor-pointer min-w-[180px] shadow-sm appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23051815%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem top 50%", backgroundSize: "0.65rem auto" }}
          >
            <option value="">All Categories</option>
            <option value="Saree">Saree</option>
            <option value="Dress material">Dress material</option>
            <option value="Bedsheet">Bedsheet</option>
            <option value="RedyMade shirts">RedyMade shirts</option>
            <option value="Redy made Kurti">Redy made Kurti</option>
            <option value="Kurti dress material">Kurti dress material</option>
          </select>

          <select 
            value={material} 
            onChange={(e) => setMaterial(e.target.value)} 
            className="bg-white border-2 border-[#C5A059]/20 hover:border-[#C5A059]/50 rounded-xl px-4 py-3 text-[#051815] text-sm font-bold outline-none focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/10 transition-all cursor-pointer min-w-[180px] shadow-sm appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23051815%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem top 50%", backgroundSize: "0.65rem auto" }}
          >
            <option value="">All Materials</option>
            <option value="Pure Cotton">Pure Cotton</option>
            <option value="Pure Silk (Pata)">Pure Silk (Pata)</option>
            <option value="Mix Silk(Pata) (Silk+Polyster)">Mix Silk(Pata) (Silk+Polyster)</option>
            <option value="Mix Cotton (Cotton+Polyster)">Mix Cotton (Cotton+Polyster)</option>
          </select>

          <select 
            value={design} 
            onChange={(e) => setDesign(e.target.value)} 
            className="bg-white border-2 border-[#C5A059]/20 hover:border-[#C5A059]/50 rounded-xl px-4 py-3 text-[#051815] text-sm font-bold outline-none focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/10 transition-all cursor-pointer min-w-[200px] shadow-sm appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23051815%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem top 50%", backgroundSize: "0.65rem auto" }}
          >
            <option value="">All Designs</option>
            <option value="Sambalpuri Ikat (Bandha)">Sambalpuri Ikat (Bandha)</option>
            <option value="Sambalpuri Traditional Ikat Design">Sambalpuri Traditional Ikat Design</option>
            <option value="Sambalpuri Modern Ikat Design">Sambalpuri Modern Ikat Design</option>
            <option value="Sambalpuri Double Ikat (Pashapali/Saptapar)">Sambalpuri Double Ikat</option>
            <option value="Bomkei">Bomkei</option>
            <option value="Bomkei+Ikat">Bomkei+Ikat</option>
          </select>

          <select 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            className="bg-white border-2 border-[#C5A059]/20 hover:border-[#C5A059]/50 rounded-xl px-4 py-3 text-[#051815] text-sm font-bold outline-none focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/10 transition-all cursor-pointer min-w-[180px] shadow-sm appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23051815%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem top 50%", backgroundSize: "0.65rem auto" }}
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
            className="bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:brightness-110 hover:scale-105 transition-all shadow-[0_10px_20px_-10px_rgba(197,160,89,0.8)] shrink-0 cursor-pointer ml-2"
          >
            Explore
          </button>
        </div>

      </div>
    </div>
  );
}
