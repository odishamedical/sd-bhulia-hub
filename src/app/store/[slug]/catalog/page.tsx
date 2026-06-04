"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MASTER_STORES, DEFAULT_STORE, STORE_CATALOG_SAREES } from "../../data";

export default function StoreCatalogPage() {
  const params = useParams();
  const rawSlug = typeof params?.slug === "string" ? params.slug : "maa-samaleswari-weavers";
  const storeSlug = rawSlug.toLowerCase();

  const store = MASTER_STORES.find((s) => s.slug === storeSlug || s.id.toLowerCase() === storeSlug) || {
    ...DEFAULT_STORE,
    id: storeSlug.toUpperCase(),
    slug: storeSlug,
    name: `Store/PWCS (${storeSlug.replace(/-/g, " ")})`,
  };

  const [userUid, setUserUid] = useState<string>("sd_super_admin_custom_uid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState(30000);

  

  // Filter logic
  const filteredSarees = STORE_CATALOG_SAREES.filter((saree) => {
    const matchesSearch = saree.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          saree.weave.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || saree.category === selectedCategory;
    const priceNum = parseInt(saree.price.replace(/[^\d]/g, ""));
    const matchesPrice = priceNum <= maxPrice;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const categories = ["all", "Cotton Classics", "Silk Masterpieces"];

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8 relative z-10">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl md:text-3xl font-serif text-[#C5A059] font-bold tracking-wider">
          Saree Warehouse Inventory
        </h2>
        <p className="text-[10px] md:text-xs text-gray-300 uppercase tracking-widest font-semibold">
          Filter and order authentic handloom sarees directly from {store.name}
        </p>
      </div>

      {/* Filter / Search Panel */}
      <div className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 shadow-xl text-white">
        
        {/* Search */}
        <div className="md:col-span-4 space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Search Weaves</label>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, motif or weave..."
            className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-sm focus:border-[#C5A059] focus:outline-none"
          />
        </div>

        {/* Category Toggles */}
        <div className="md:col-span-4 space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Filter by Category</label>
          <div className="flex bg-[#051815] border border-[#C5A059]/20 rounded-xl p-1 w-full justify-between">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all text-center ${
                  selectedCategory === cat
                    ? "bg-[#C5A059] text-[#0A1021]"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {cat === "all" ? "All" : cat.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Price Slider */}
        <div className="md:col-span-4 space-y-1">
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">
            <span>Max Price</span>
            <span>₹ {maxPrice.toLocaleString()}</span>
          </div>
          <input 
            type="range" 
            min="4000" 
            max="30000" 
            step="1000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(parseInt(e.target.value))}
            className="w-full h-1 bg-[#051815] rounded-lg appearance-none cursor-pointer accent-[#C5A059] mt-3"
          />
        </div>

      </div>

      {/* Product Grid */}
      {filteredSarees.length === 0 ? (
        <div className="bg-[#0B2B26]/50 border border-[#C5A059]/20 rounded-2xl p-12 text-center text-gray-400">
          <span className="text-3xl block mb-2">🔍</span>
          <p className="text-sm font-semibold">No sarees match your selected filters.</p>
          <button 
            onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setMaxPrice(30000); }} 
            className="text-xs text-[#C5A059] underline font-bold mt-2 hover:opacity-80"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSarees.map((saree) => (
            <div key={saree.id} className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#C5A059] transition-all duration-300 shadow-xl p-0.5 text-white">
              
              <div className="relative w-full h-56 sm:h-72 overflow-hidden bg-[#0B2B26] rounded-t-xl">
                <Image src={saree.img} alt={saree.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-[#C5A059] text-[#0A1021] text-[9px] font-bold uppercase tracking-widest rounded shadow">{saree.weave}</span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-[#C5A059] transition-colors mb-1 line-clamp-1">{saree.title}</h4>
                  <p className="text-[10px] text-gray-300 leading-relaxed font-sans line-clamp-2">{saree.desc}</p>
                </div>

                <div className="flex justify-between items-center border-t border-[#C5A059]/20 pt-2.5">
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest block">Direct Price</span>
                    <span className="text-base font-serif font-bold text-[#C5A059]">{saree.price}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest block">Sourcing Location</span>
                    <span className="text-[10px] font-mono text-gray-200 font-bold">{saree.time}</span>
                  </div>
                </div>

                {/* Share buttons on cards */}
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#C5A059]/10">
                  <button onClick={() => {
                    const shareUrl = `${window.location.origin}/product/${encodeURIComponent(saree.title.toLowerCase().replace(/\s+/g, "-"))}?ref=${userUid}`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent("Check out this " + saree.title + ": " + shareUrl)}`, "_blank");
                  }} className="flex items-center justify-center gap-1 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                    <span>📲 Share</span>
                  </button>
                  <button onClick={() => {
                    const shareUrl = `${window.location.origin}/product/${encodeURIComponent(saree.title.toLowerCase().replace(/\s+/g, "-"))}?ref=${userUid}`;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
                  }} className="flex items-center justify-center gap-1 py-1.5 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                    <span>📘 Share</span>
                  </button>
                </div>

                <Link href={`/product/${encodeURIComponent(saree.title.toLowerCase().replace(/\s+/g, "-"))}`} className="bhulia-gold-button w-full py-2 text-[#0A1021] font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition-all text-center block">
                  View Details
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
