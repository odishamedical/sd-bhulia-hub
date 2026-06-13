"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProducts, useWeavers, useStores, useResellers } from "../lib/db-hooks";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import GlobalBannerSlot from "@/components/GlobalBannerSlot";

export default function HomeDraftV2() {
  const { products, loading: productsLoading } = useProducts({ status: "approved" });
  const { weavers, loading: weaversLoading } = useWeavers(100);
  const { stores, loading: storesLoading } = useStores(100);
  const { resellers, loading: resellersLoading } = useResellers(100);
  const { user } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();

  const userRole = typeof window !== "undefined" ? localStorage.getItem("sd_current_user_role") || "user" : "user";
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<"trending" | "new" | "offers">("trending");

  // Ecosystem Directory States
  const [dirTab, setDirTab] = useState<"weavers" | "stores" | "b2b" | "suppliers">("weavers");
  const [dirSort, setDirSort] = useState<"featured" | "recent">("featured");

  const heroSlides = [
    {
      badge: "Bhulia.com Verified Heritage",
      title: "The Silk Masterpieces",
      subtitle: "Authentic Double Ikat Pata",
      img: "/hero_silk.jpg",
      btn: "Discover the Collection"
    },
    {
      badge: "Empowering Artisans directly",
      title: "Everyday Luxury",
      subtitle: "Direct from Pit Looms",
      img: "/hero_loom.jpg",
      btn: "Explore Cotton"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Story Circles Data
  const storyCircles = [
    { title: "Pure Silk Pata", img: "/bhulia-hero.png", link: "/search?category=Pure Silk Pata" },
    { title: "Cotton Daily", img: "/bhulia-hero.png", link: "/search?category=Cotton Classics" },
    { title: "Bomkai", img: "/bhulia-hero.png", link: "/search?design=Bomkai" },
    { title: "Pasapalli", img: "/bhulia-hero.png", link: "/search?category=Pasapalli" },
    { title: "Master Weavers", img: "/bhulia-hero.png", link: "#ecosystem" },
    { title: "Bridal Collection", img: "/bhulia-hero.png", link: "/search?category=Bridal" },
    { title: "Corporate Gifts", img: "/bhulia-hero.png", link: "/search?category=Gifts" },
  ];

  // Vault Tab Logic
  const getVaultProducts = () => {
    if (productsLoading) return [];
    if (activeTab === "trending") return [...products].sort(() => 0.5 - Math.random()).slice(0, 6);
    if (activeTab === "new") return [...products].slice(-6).reverse();
    if (activeTab === "offers") return [...products].filter(p => p.isSpecialOffer).slice(0, 6);
    return [];
  };

  // Directory Logic
  const getDirectoryData = () => {
    let data: any[] = [];
    if (dirTab === "weavers" && !weaversLoading) data = [...weavers];
    if (dirTab === "stores" && !storesLoading) data = [...stores];
    if (dirTab === "b2b" && !resellersLoading) data = [...resellers];
    if (dirTab === "suppliers") data = []; // Placeholder

    if (dirSort === "featured") {
      data.sort((a, b) => {
        const aTier = a.tier === "Diamond" ? 3 : a.tier === "Gold" ? 2 : 1;
        const bTier = b.tier === "Diamond" ? 3 : b.tier === "Gold" ? 2 : 1;
        const aScore = aTier + (a.status === "approved" || a.status === "active" ? 10 : 0);
        const bScore = bTier + (b.status === "approved" || b.status === "active" ? 10 : 0);
        return bScore - aScore;
      });
    } else {
      data.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    return data.slice(0, 8); // 8 Profiles (2 rows of 4)
  };

  const directoryLoading = (dirTab === "weavers" && weaversLoading) || (dirTab === "stores" && storesLoading) || (dirTab === "b2b" && resellersLoading);

  return (
    <main className="relative flex-1 w-full bg-[#051815] text-white font-sans flex flex-col min-h-screen">
      {/* Background Gold Glows & Ikat Texture */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C5A059 1px, transparent 0)', backgroundSize: '48px 48px' }} />
      
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 relative z-10 space-y-16 overflow-hidden max-w-[1600px] mx-auto">
        
        {/* 1. The "Hero" Narrative */}
        <section className="relative w-full h-[60vh] sm:h-[70vh] rounded-3xl overflow-hidden border border-[#C5A059]/40 shadow-2xl group">
          {heroSlides.map((slide, idx) => (
            <div key={idx} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentSlide === idx ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
              <Image src={slide.img} alt={slide.title} fill className="object-cover transform scale-105 transition-transform duration-[10000ms] ease-linear" style={{ transform: currentSlide === idx ? 'scale(1)' : 'scale(1.05)' }} />
              {/* Elegant Gradient Fade */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#051815] via-[#051815]/40 to-transparent opacity-90"></div>
            </div>
          ))}
          
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-16 text-center px-4">
            <span className="text-[#C5A059] text-xs sm:text-sm font-bold uppercase tracking-[0.3em] mb-4 drop-shadow-md">
              {heroSlides[currentSlide].badge}
            </span>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white mb-2 drop-shadow-xl tracking-tight">
              {heroSlides[currentSlide].title}
            </h2>
            <p className="text-lg sm:text-2xl text-gray-300 font-serif italic mb-8 drop-shadow-md">
              {heroSlides[currentSlide].subtitle}
            </p>
            <button className="px-10 py-4 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] font-black text-sm uppercase tracking-widest rounded-none hover:brightness-110 transition-all shadow-xl cursor-pointer">
              {heroSlides[currentSlide].btn}
            </button>
          </div>
        </section>

        {/* 2. The Artisan Circle (Navigation) */}
        <section className="w-full">
          <div className="flex overflow-x-auto gap-6 sm:gap-12 pb-4 scrollbar-hide snap-x justify-start sm:justify-center px-4">
            {storyCircles.map((circle, idx) => (
              <Link key={idx} href={circle.link} className="flex flex-col items-center gap-3 shrink-0 snap-center group cursor-pointer">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-[#C5A059]/40 group-hover:border-[#C5A059] group-hover:scale-105 transition-all shadow-lg p-1">
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image src={circle.img} alt={circle.title} fill className="object-cover" />
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-300 group-hover:text-[#C5A059] transition-colors whitespace-nowrap">
                  {circle.title}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <GlobalBannerSlot placementId="homepage_middle" context={{ audience: "global", specificId: "all" }} />

        {/* 3. The Vault (Curated Arrivals & Trending) */}
        <section className="w-full space-y-8">
          <div className="flex flex-col items-center text-center">
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C5A059] mb-6">
              The Vault
            </h3>
            
            {/* Elegant Tabs */}
            <div className="flex gap-4 sm:gap-8 border-b border-[#C5A059]/20 pb-2">
              <button onClick={() => setActiveTab("trending")} className={`text-xs sm:text-sm uppercase tracking-widest font-bold pb-2 transition-all ${activeTab === "trending" ? "text-[#C5A059] border-b-2 border-[#C5A059]" : "text-gray-500 hover:text-gray-300"}`}>Trending</button>
              <button onClick={() => setActiveTab("new")} className={`text-xs sm:text-sm uppercase tracking-widest font-bold pb-2 transition-all ${activeTab === "new" ? "text-[#C5A059] border-b-2 border-[#C5A059]" : "text-gray-500 hover:text-gray-300"}`}>New Arrivals</button>
              <button onClick={() => setActiveTab("offers")} className={`text-xs sm:text-sm uppercase tracking-widest font-bold pb-2 transition-all ${activeTab === "offers" ? "text-[#C5A059] border-b-2 border-[#C5A059]" : "text-gray-500 hover:text-gray-300"}`}>Flash Sales</button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 pt-4">
            {productsLoading ? (
              [...Array(6)].map((_, i) => <div key={i} className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl h-[380px] animate-pulse"></div>)
            ) : (
              getVaultProducts().map(item => <ProductCard key={item.id} product={item} role={userRole} />)
            )}
          </div>
          <div className="flex justify-center mt-8">
            <Link href="/search" className="px-8 py-3 border border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059]/10 text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(197,160,89,0.2)] hover:shadow-[0_0_25px_rgba(197,160,89,0.4)]">View Entire Vault Collection</Link>
          </div>
        </section>

        {/* 4. Heritage Storytelling Section */}
        <section className="relative w-full rounded-3xl overflow-hidden border border-[#C5A059]/40 shadow-2xl flex flex-col md:flex-row items-stretch bg-[#0A2520]">
          <div className="w-full md:w-1/2 relative h-[300px] md:h-auto">
            <Image src="/bhulia-hero.png" alt="Heritage" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
          <div className="w-full md:w-1/2 p-8 sm:p-16 flex flex-col justify-center text-center md:text-left">
            <span className="text-[#C5A059] text-xs font-bold uppercase tracking-[0.2em] mb-4">Our Promise</span>
            <h3 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">Discover 100% Authentic Sambalpuri Handloom Sarees at Bhulia.com</h3>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8">
              Each piece carries the Bhulia Verified Seal, connecting you directly to real weavers. By choosing us, you help preserve Odisha's 800-year heritage while supporting artisans at fair prices.
            </p>
            <div>
              <Link href="/directory" className="inline-block px-8 py-3 bg-[#051815] border border-[#C5A059] text-[#C5A059] font-bold text-xs uppercase tracking-widest hover:bg-[#C5A059] hover:text-[#0A1021] transition-all">
                Learn About Our Process
              </Link>
            </div>
          </div>
        </section>

        {/* 5. Ecosystem Directory Grid */}
        <section id="ecosystem" className="w-full space-y-8">
          <div className="flex flex-col items-center text-center">
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C5A059] mb-2">
              Ecosystem Directory
            </h3>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">Discover our network of verified partners</p>
            
            {/* Category Tabs & Sorting Controls */}
            <div className="w-full max-w-4xl flex flex-col sm:flex-row justify-between items-center border-b border-[#C5A059]/20 pb-2 gap-4">
              <div className="flex overflow-x-auto gap-4 sm:gap-8 w-full sm:w-auto scrollbar-hide">
                <button onClick={() => setDirTab("weavers")} className={`text-xs sm:text-sm uppercase tracking-widest font-bold pb-2 transition-all whitespace-nowrap ${dirTab === "weavers" ? "text-[#C5A059] border-b-2 border-[#C5A059]" : "text-gray-500 hover:text-gray-300"}`}>Weavers</button>
                <button onClick={() => setDirTab("stores")} className={`text-xs sm:text-sm uppercase tracking-widest font-bold pb-2 transition-all whitespace-nowrap ${dirTab === "stores" ? "text-[#C5A059] border-b-2 border-[#C5A059]" : "text-gray-500 hover:text-gray-300"}`}>Retail Stores</button>
                <button onClick={() => setDirTab("b2b")} className={`text-xs sm:text-sm uppercase tracking-widest font-bold pb-2 transition-all whitespace-nowrap ${dirTab === "b2b" ? "text-[#C5A059] border-b-2 border-[#C5A059]" : "text-gray-500 hover:text-gray-300"}`}>B2B</button>
                <button onClick={() => setDirTab("suppliers")} className={`text-xs sm:text-sm uppercase tracking-widest font-bold pb-2 transition-all whitespace-nowrap ${dirTab === "suppliers" ? "text-[#C5A059] border-b-2 border-[#C5A059]" : "text-gray-500 hover:text-gray-300"}`}>Suppliers</button>
              </div>

              {/* Sorting Toggle */}
              <div className="flex bg-[#0B2B26] rounded-full p-1 border border-[#C5A059]/30 shrink-0">
                <button onClick={() => setDirSort("featured")} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${dirSort === "featured" ? "bg-[#C5A059] text-[#051815]" : "text-gray-400 hover:text-white"}`}>Featured</button>
                <button onClick={() => setDirSort("recent")} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${dirSort === "recent" ? "bg-[#C5A059] text-[#051815]" : "text-gray-400 hover:text-white"}`}>Recent</button>
              </div>
            </div>
          </div>

          {/* 8-Item Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {directoryLoading ? (
              [...Array(8)].map((_, i) => <div key={i} className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-2xl h-[380px] animate-pulse"></div>)
            ) : getDirectoryData().length === 0 ? (
              <div className="col-span-full py-20 text-center text-gray-500 italic">No partners found in this category yet. Check back soon!</div>
            ) : (
              getDirectoryData().map((item, idx) => {
                const title = item.title || item.name || "Partner";
                const desc = item.desc || item.address || "Verified Ecosystem Partner";
                const img = item.img || "/bhulia-hero.png";
                
                // Determine Verification Status
                const isVerified = item.status === "approved" || item.status === "active";
                const roleLink = dirTab === "stores" ? `/store/${item.slug}` : (dirTab === "weavers" ? `/weaver/${item.slug}` : `/directory`);

                return (
                  <Link key={idx} href={roleLink} className="group flex flex-col relative rounded-2xl overflow-hidden h-[380px] border border-[#C5A059]/20 hover:border-[#C5A059] transition-all bg-[#0A2520]">
                    <div className="relative w-full h-48 shrink-0 overflow-hidden">
                      <Image src={img} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A2520] to-transparent"></div>
                    </div>
                    
                    <div className="absolute top-4 right-4 z-10">
                      {isVerified ? (
                        <div className="bg-gradient-to-br from-[#FFF5C0] via-[#D4AF37] to-[#8A5A00] text-[#051815] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center gap-1 border border-[#FFF5C0]/50">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                          Verified
                        </div>
                      ) : (
                        <div className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-gray-600 shadow-md">
                          Unverified
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-1 justify-center items-center text-center">
                      <h4 className="text-xl font-serif font-bold text-white mb-2 line-clamp-1">{title}</h4>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-4">{desc}</p>
                      <span className="mt-auto text-[#C5A059] text-[10px] font-bold uppercase tracking-widest border border-[#C5A059]/30 px-4 py-1.5 rounded-full group-hover:bg-[#C5A059] group-hover:text-[#051815] transition-all">
                        View Profile →
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
          
          <div className="flex justify-center mt-8">
            <Link href="/directory" className="px-10 py-4 border border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059] hover:text-[#051815] text-xs font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-[0_0_25px_rgba(197,160,89,0.5)] rounded-full">
              Explore Entire Ecosystem
            </Link>
          </div>
        </section>

        <GlobalBannerSlot placementId="content_bottom" context={{ audience: "global", specificId: "all" }} />

      </div>
    </main>
  );
}
