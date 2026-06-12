"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useProducts } from "@/lib/db-hooks";
import { useCart } from "@/context/CartContext";
import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, loading } = useProducts({ status: "approved" });
  const { addToCart } = useCart();

  const [filteredProducts, setFilteredProducts] = useState(products);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
          }
        } catch (error) {
          console.error("Error fetching user role", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Filters state from URL
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get("category") || "");
  const [selectedMaterial, setSelectedMaterial] = useState(searchParams?.get("material") || "");
  const [selectedDesign, setSelectedDesign] = useState(searchParams?.get("design") || "");
  
  const minPriceParam = searchParams?.get("minPrice");
  const maxPriceParam = searchParams?.get("maxPrice");
  const priceRange = (minPriceParam && maxPriceParam) ? `${minPriceParam}-${maxPriceParam}` : "";
  const [selectedPrice, setSelectedPrice] = useState(priceRange);
  
  const [selectedSort, setSelectedSort] = useState(searchParams?.get("sort") || "newest");
  const specialOfferOnly = searchParams?.get("specialOffer") === "true";
  const [showResellerOnly, setShowResellerOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    let result = [...products];

    if (selectedCategory) {
      result = result.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (selectedMaterial) {
      result = result.filter(p => (p.material || p.sareeType)?.toLowerCase() === selectedMaterial.toLowerCase());
    }
    if (selectedDesign) {
      result = result.filter(p => p.design?.toLowerCase() === selectedDesign.toLowerCase() || p.title?.toLowerCase().includes(selectedDesign.toLowerCase()));
    }

    if (selectedPrice) {
      const [min, max] = selectedPrice.split("-").map(Number);
      result = result.filter(p => {
        const productPrice = typeof p.price === 'number' ? p.price : Number(String(p.price).replace(/[^0-9.]/g, '')) || 0;
        return productPrice >= min && productPrice <= max;
      });
    }

    if (selectedSort === "price-low-high") {
      result.sort((a, b) => {
        const pa = typeof a.price === 'number' ? a.price : Number(String(a.price).replace(/[^0-9.]/g, '')) || 0;
        const pb = typeof b.price === 'number' ? b.price : Number(String(b.price).replace(/[^0-9.]/g, '')) || 0;
        return pa - pb;
      });
    } else if (selectedSort === "price-high-low") {
      result.sort((a, b) => {
        const pa = typeof a.price === 'number' ? a.price : Number(String(a.price).replace(/[^0-9.]/g, '')) || 0;
        const pb = typeof b.price === 'number' ? b.price : Number(String(b.price).replace(/[^0-9.]/g, '')) || 0;
        return pb - pa;
      });
    } else if (selectedSort === "margin-high-low" && role === "reseller") {
      result.sort((a, b) => {
        return (Number(b.resellerMarginPercentage) || 0) - (Number(a.resellerMarginPercentage) || 0);
      });
    }

    if (specialOfferOnly) {
      result = result.filter(p => p.isSpecialOffer);
    }

    if (showResellerOnly && role === "reseller") {
      result = result.filter(p => p.allowResellerMargin);
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, selectedMaterial, selectedDesign, selectedPrice, selectedSort, specialOfferOnly, showResellerOnly, role]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value) {
      if (key === "price") {
        const [min, max] = value.split("-");
        params.set("minPrice", min);
        params.set("maxPrice", max);
      } else {
        params.set(key, value);
      }
    } else {
      if (key === "price") {
        params.delete("minPrice");
        params.delete("maxPrice");
      } else {
        params.delete(key);
      }
    }
    router.push(`/search?${params.toString()}`);
  };

  const handleSocialShare = (platform: "whatsapp" | "facebook", productName: string) => {
    const shareUrl = `${window.location.origin}/product/${encodeURIComponent(productName.toLowerCase().replace(/\s+/g, "-"))}`;
    const message = `Explore the authentic Bhulia.com Verified ${productName} directly from Odisha master weavers on Bhulia Hub! ${shareUrl}`;

    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
    }
  };
  const FilterContent = (
    <>
      {/* Category Filter */}
      <div>
        <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-3">Category</label>
        <select 
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            updateFilters("category", e.target.value);
          }}
          className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-[#C5A059]"
        >
          <option value="">All Categories</option>
          <option value="Saree">Saree</option>
          <option value="Dress material">Dress material</option>
          <option value="Bedsheet">Bedsheet</option>
          <option value="RedyMade shirts">RedyMade shirts</option>
          <option value="Redy made Kurti">Redy made Kurti</option>
          <option value="Kurti dress material">Kurti dress material</option>
        </select>
      </div>

      {/* Material Filter */}
      <div>
        <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-3">Material</label>
        <select 
          value={selectedMaterial}
          onChange={(e) => {
            setSelectedMaterial(e.target.value);
            updateFilters("material", e.target.value);
          }}
          className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-[#C5A059]"
        >
          <option value="">All Materials</option>
          <option value="Pure Cotton">Pure Cotton</option>
          <option value="Pure Silk (Pata)">Pure Silk (Pata)</option>
          <option value="Mix Silk(Pata) (Silk+Polyster)">Mix Silk(Pata) (Silk+Polyster)</option>
          <option value="Mix Cotton (Cotton+Polyster)">Mix Cotton (Cotton+Polyster)</option>
        </select>
      </div>

      {/* Design Filter */}
      <div>
        <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-3">Design</label>
        <select 
          value={selectedDesign}
          onChange={(e) => {
            setSelectedDesign(e.target.value);
            updateFilters("design", e.target.value);
          }}
          className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-[#C5A059]"
        >
          <option value="">All Designs</option>
          <option value="Sambalpuri Ikat (Bandha)">Sambalpuri Ikat (Bandha)</option>
          <option value="Sambalpuri Traditional Ikat Design">Sambalpuri Traditional Ikat Design</option>
          <option value="Sambalpuri Modern Ikat Design">Sambalpuri Modern Ikat Design</option>
          <option value="Sambalpuri Double Ikat (Pashapali/Saptapar)">Sambalpuri Double Ikat</option>
          <option value="Bomkei">Bomkei</option>
          <option value="Bomkei+Ikat">Bomkei+Ikat</option>
        </select>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#051815] font-sans pt-0 pb-20">
      
      {/* Top Blue Pill Filter Menus - Full Width */}
      <div className="w-full bg-[#E5D3B3] border-b border-[#C5A059]/20 relative z-40 mb-6 py-3 px-4 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-center gap-4">
          
          {/* Type Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0066CC]/90 hover:bg-[#0052A3] text-white border border-white/30 shadow-md backdrop-blur-md transition-all text-xs md:text-sm font-bold uppercase tracking-widest">
              <span>{selectedCategory || "Browse By Type"}</span>
              <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 min-w-[220px]">
              <div className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl p-2 flex flex-col">
                <button onClick={() => { setSelectedCategory(""); updateFilters("category", ""); }} className="text-left px-4 py-2 text-xs font-bold text-gray-700 hover:text-[#0066CC] hover:bg-[#0066CC]/10 rounded-lg">All Types</button>
                {["Saree", "Dress material", "Bedsheet", "RedyMade shirts", "Redy made Kurti", "Kurti dress material"].map(cat => (
                  <button key={cat} onClick={() => { setSelectedCategory(cat); updateFilters("category", cat); }} className={`text-left px-4 py-2 text-xs font-bold rounded-lg transition-colors ${selectedCategory === cat ? 'bg-[#0066CC] text-white' : 'text-gray-700 hover:text-[#0066CC] hover:bg-[#0066CC]/10'}`}>{cat}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Material Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0066CC]/90 hover:bg-[#0052A3] text-white border border-white/30 shadow-md backdrop-blur-md transition-all text-xs md:text-sm font-bold uppercase tracking-widest">
              <span>{selectedMaterial || "Browse By Material"}</span>
              <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 min-w-[220px]">
              <div className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl p-2 flex flex-col">
                <button onClick={() => { setSelectedMaterial(""); updateFilters("material", ""); }} className="text-left px-4 py-2 text-xs font-bold text-gray-700 hover:text-[#0066CC] hover:bg-[#0066CC]/10 rounded-lg">All Materials</button>
                {["Pure Cotton", "Pure Silk (Pata)", "Mix Silk(Pata) (Silk+Polyster)", "Mix Cotton (Cotton+Polyster)"].map(mat => (
                  <button key={mat} onClick={() => { setSelectedMaterial(mat); updateFilters("material", mat); }} className={`text-left px-4 py-2 text-xs font-bold rounded-lg transition-colors ${selectedMaterial === mat ? 'bg-[#0066CC] text-white' : 'text-gray-700 hover:text-[#0066CC] hover:bg-[#0066CC]/10'}`}>{mat}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Design Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0066CC]/90 hover:bg-[#0052A3] text-white border border-white/30 shadow-md backdrop-blur-md transition-all text-xs md:text-sm font-bold uppercase tracking-widest">
              <span>{selectedDesign || "Browse By Design"}</span>
              <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 min-w-[260px]">
              <div className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl p-2 flex flex-col">
                <button onClick={() => { setSelectedDesign(""); updateFilters("design", ""); }} className="text-left px-4 py-2 text-xs font-bold text-gray-700 hover:text-[#0066CC] hover:bg-[#0066CC]/10 rounded-lg">All Designs</button>
                {["Sambalpuri Ikat (Bandha)", "Sambalpuri Traditional Ikat Design", "Sambalpuri Modern Ikat Design", "Sambalpuri Double Ikat (Pashapali/Saptapar)", "Bomkei", "Bomkei+Ikat"].map(des => (
                  <button key={des} onClick={() => { setSelectedDesign(des); updateFilters("design", des); }} className={`text-left px-4 py-2 text-xs font-bold rounded-lg transition-colors ${selectedDesign === des ? 'bg-[#0066CC] text-white' : 'text-gray-700 hover:text-[#0066CC] hover:bg-[#0066CC]/10'}`}>{des}</button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Breadcrumbs items={[{ label: "All Products" }]} />
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C5A059] mb-2">Global Catalog Search</h1>
          <p className="text-gray-300 text-sm">Browse 100% Bhulia.com verified sovereign handloom masterpieces directly from the weavers.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 2xl:grid-cols-6 gap-8">
          
          {/* PC View: Sticky Left Sidebar */}
          <div className="hidden lg:block lg:col-span-1 space-y-6 bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl p-6 h-fit sticky top-24">
            <h3 className="text-xl font-serif font-bold text-white mb-4 border-b border-[#C5A059]/20 pb-2">Filter Catalog</h3>
            {/* Price Brackets */}
            <div>
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-3">Price Bracket</label>
              <div className="space-y-2">
                {["100-5000", "5000-6000", "6000-7000", "7000-15000", "15000-50000"].map((range) => {
                  const [min, max] = range.split("-");
                  return (
                    <label key={range} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="priceFilter"
                        checked={selectedPrice === range}
                        onChange={() => {
                          setSelectedPrice(range);
                          updateFilters("price", range);
                        }}
                        className="form-radio text-[#C5A059] focus:ring-[#C5A059] bg-[#051815] border-[#C5A059]/40" 
                      />
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        ₹ {Number(min).toLocaleString()} - ₹ {Number(max).toLocaleString()}
                      </span>
                    </label>
                  );
                })}
                <button 
                  onClick={() => { setSelectedPrice(""); updateFilters("price", ""); }}
                  className="text-[10px] text-gray-500 hover:text-[#C5A059] uppercase tracking-widest mt-2 underline"
                >
                  Clear Price Filter
                </button>
              </div>
            </div>

            {FilterContent}
            {FilterContent}
          </div>

          {/* Mobile Filter Floating Button */}
          <button 
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-gradient-to-r from-[#0B2B26] to-[#051815] border border-[#C5A059] text-[#C5A059] px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            Filter & Sort
          </button>

          {/* Mobile Filter Drawer */}
          <div className={`fixed inset-0 z-[70] transition-transform duration-300 lg:hidden ${mobileFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)}></div>
            <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-[#051815] shadow-2xl border-l border-[#C5A059]/30 flex flex-col">
              <div className="p-4 flex justify-between items-center border-b border-[#C5A059]/20 bg-[#0B2B26]">
                <h3 className="text-lg font-serif font-bold text-white">Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {FilterContent}
              </div>
              <div className="p-4 border-t border-[#C5A059]/20 bg-[#0B2B26]">
                <button onClick={() => setMobileFilterOpen(false)} className="w-full bg-[#C5A059] hover:bg-yellow-600 text-[#0A1021] py-3 rounded-xl font-bold uppercase tracking-widest transition-colors">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-4 2xl:col-span-5">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-gray-400">{filteredProducts.length} Results Found</span>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-xs text-[#C5A059] font-bold uppercase tracking-widest">Sort By:</span>
                <select 
                  value={selectedSort}
                  onChange={(e) => {
                    setSelectedSort(e.target.value);
                    updateFilters("sort", e.target.value);
                  }}
                  className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-[#C5A059] cursor-pointer"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  {role === "reseller" && <option value="margin-high-low">Highest Reseller Margin</option>}
                </select>
              </div>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl aspect-[9/16] animate-pulse"></div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-3xl p-12 text-center shadow-xl">
                <span className="text-4xl block mb-4">🔍</span>
                <h3 className="text-xl font-bold text-white mb-2">No Products Found</h3>
                <p className="text-gray-400 text-sm">We couldn't find any masterpieces matching your exact filters. Try clearing some options.</p>
                <button 
                  onClick={() => router.push("/search")}
                  className="mt-6 px-6 py-2 bg-[#051815] border border-[#C5A059]/40 text-[#C5A059] rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#0A3A35]"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                {filteredProducts.map((item) => (
                  <ProductCard key={item.id} product={item} role={role} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Sticky Filter Button */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 p-4 z-40 pointer-events-none flex justify-center">
        <button 
          onClick={() => setMobileFilterOpen(true)}
          className="pointer-events-auto flex items-center gap-2 bg-[#0A3A35] border-2 border-[#C5A059] text-[#C5A059] px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest shadow-[0_4px_20px_rgba(197,160,89,0.3)]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
          Sort & Filter
        </button>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      {mobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)}></div>
          <div className="relative bg-[#051815] w-full rounded-t-3xl border-t border-[#C5A059]/40 p-6 flex flex-col max-h-[85vh] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] animate-[slideUp_0.3s_ease-out]">
            <div className="flex justify-between items-center mb-6 border-b border-[#C5A059]/20 pb-4">
              <h3 className="text-xl font-serif font-bold text-[#C5A059]">Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="text-gray-400 p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 pb-20">
               {/* Mobile Category */}
               <div>
                <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-3">Category</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); updateFilters("category", e.target.value); }}
                  className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-sm outline-none"
                >
                  <option value="">All Categories</option>
                  <option value="Saree">Saree</option>
                  <option value="Dress material">Dress material</option>
                  <option value="Bedsheet">Bedsheet</option>
                </select>
              </div>

              {/* Mobile Material */}
              <div>
                <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-3">Material</label>
                <select 
                  value={selectedMaterial}
                  onChange={(e) => { setSelectedMaterial(e.target.value); updateFilters("material", e.target.value); }}
                  className="w-full bg-[#0B2B26] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-sm outline-none"
                >
                  <option value="">All Materials</option>
                  <option value="Pure Cotton">Pure Cotton</option>
                  <option value="Pure Silk (Pata)">Pure Silk (Pata)</option>
                  <option value="Mix Silk(Pata) (Silk+Polyster)">Mix Silk(Pata) (Silk+Polyster)</option>
                </select>
              </div>

              {/* Mobile Price */}
              <div>
                <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-3">Price Range</label>
                <div className="space-y-3">
                  {["100-5000", "5000-6000", "6000-7000", "7000-15000", "15000-50000"].map((range) => {
                    const [min, max] = range.split("-");
                    return (
                      <label key={range} className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="mobilePriceFilter"
                          checked={selectedPrice === range}
                          onChange={() => { setSelectedPrice(range); updateFilters("price", range); }}
                          className="w-5 h-5 form-radio text-[#C5A059] bg-[#051815] border-[#C5A059]/40 focus:ring-[#C5A059]" 
                        />
                        <span className="text-sm text-gray-200 font-bold">₹ {Number(min).toLocaleString()} - ₹ {Number(max).toLocaleString()}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#051815] border-t border-[#C5A059]/20 flex gap-4 pb-safe">
              <button 
                onClick={() => { router.push("/search"); setMobileFilterOpen(false); }}
                className="w-1/3 py-3 border border-[#C5A059]/40 text-[#C5A059] rounded-xl font-bold text-xs uppercase tracking-wider"
              >
                Clear
              </button>
              <button 
                onClick={() => setMobileFilterOpen(false)}
                className="w-2/3 py-3 bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg"
              >
                Apply & View {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#051815] text-white flex justify-center items-center">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
