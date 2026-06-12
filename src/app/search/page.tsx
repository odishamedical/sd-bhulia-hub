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

  return (
    <div className="min-h-screen bg-[#051815] font-sans pt-6 pb-20">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
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

            {role === "reseller" && (
              <div className="bg-[#051815] border border-[#C5A059]/30 rounded-xl p-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showResellerOnly} 
                    onChange={e => setShowResellerOnly(e.target.checked)} 
                    className="form-checkbox text-[#C5A059] rounded w-4 h-4 mt-0.5 focus:ring-[#C5A059] bg-[#0B2B26] border-[#C5A059]/40" 
                  />
                  <div>
                    <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest block">Reseller Promotable Only</span>
                    <span className="text-[10px] text-gray-400 leading-tight">Only show products that offer you a commission</span>
                  </div>
                </label>
              </div>
            )}

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
