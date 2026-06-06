"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useProducts } from "@/lib/db-hooks";
import { useCart } from "@/context/CartContext";
import { Suspense } from "react";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();

  const [filteredProducts, setFilteredProducts] = useState(products);

  // Filters state from URL
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get("category") || "");
  const [selectedMaterial, setSelectedMaterial] = useState(searchParams?.get("material") || "");
  const [selectedDesign, setSelectedDesign] = useState(searchParams?.get("design") || "");
  
  const minPriceParam = searchParams?.get("minPrice");
  const maxPriceParam = searchParams?.get("maxPrice");
  const priceRange = (minPriceParam && maxPriceParam) ? `${minPriceParam}-${maxPriceParam}` : "";
  const [selectedPrice, setSelectedPrice] = useState(priceRange);
  
  const [selectedSort, setSelectedSort] = useState(searchParams?.get("sort") || "newest");

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
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, selectedMaterial, selectedDesign, selectedPrice, selectedSort]);

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
    const message = `Explore the authentic GI-Tagged ${productName} directly from Odisha master weavers on Bhulia Hub! ${shareUrl}`;

    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-[#051815] font-sans pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C5A059] mb-2">Global Catalog Search</h1>
          <p className="text-gray-300 text-sm">Browse 100% GI-Tag verified sovereign handloom masterpieces directly from the weavers.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6 bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl p-6 h-fit sticky top-24">
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

          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3">
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
                </select>
              </div>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl h-[380px] animate-pulse"></div>
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
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((item) => (
                  <div key={item.id} className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#C5A059] transition-all duration-300 shadow-xl p-0.5">
                    <div className="relative w-full aspect-[3/4] sm:aspect-[9/16] overflow-hidden bg-[#0B2B26] rounded-t-xl">
                      <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-2.5 right-2.5 bg-[#0B2B26]/80 backdrop-blur-md px-2 py-0.5 rounded border border-[#C5A059]/40 text-[9px] font-mono text-[#C5A059] font-bold">
                        {item.id}
                      </div>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                      <div>
                        <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-[#C5A059] transition-colors mb-0.5 leading-tight line-clamp-1">{item.title}</h4>
                        <p className="text-base font-serif font-bold text-[#C5A059]">₹{item.price}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#C5A059]/20">
                        <button onClick={() => handleSocialShare("whatsapp", item.title)} className="flex items-center justify-center gap-1 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                          <span>📲 Share</span>
                        </button>
                        <button onClick={() => handleSocialShare("facebook", item.title)} className="flex items-center justify-center gap-1 py-1.5 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                          <span>📘 Share</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => addToCart(item)} className="bhulia-gold-button w-full py-2 bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition-all shadow-md text-center block cursor-pointer">
                          Add to Cart
                        </button>
                        <Link href={`/product/${item.slug}`} className="w-full py-2 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-xl hover:bg-[#0D4B45] transition-all shadow-md text-center flex items-center justify-center">
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
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
