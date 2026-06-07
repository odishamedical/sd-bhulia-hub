"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import UserMenu from "../components/UserMenu";
import Header from "../components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProducts, useWeavers } from "../lib/db-hooks";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import ProductCard from "../components/ProductCard";

interface CMSRow {
  id: string;
  type: "hero" | "gateways" | "products" | "banner";
  title?: string;
  category?: string;
  bannerText?: string;
  themeStyle?: string;
}

export default function Home() {
  const { products, loading: productsLoading } = useProducts();
  const { weavers, loading: weaversLoading } = useWeavers();

  const cottonSambalpuri = products.filter(p => p?.category === "Cotton Classics");
  const pataSambalpuri = products.filter(p => p?.category === "Silk Masterpieces");
  const cottonBomkai = products.filter(p => p?.weave?.includes("Bomkai"));
  const { user, loginWithGoogle } = useAuth();
  
  const userAvatar = user?.photoURL || null;
  const userName = user?.displayName || user?.email?.split("@")[0] || null;
  const userRole = typeof window !== "undefined" ? localStorage.getItem("sd_current_user_role") || "user" : "user";
  const userUid = user?.uid || "guest";
  
  const { cartCount, addToCart } = useCart();
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  
  // CMS State
  const [cmsLayout, setCmsLayout] = useState<{ dynamicEnabled: boolean, rows: CMSRow[] } | null>(null);

  useEffect(() => {
    async function fetchCms() {
      try {
        const docSnap = await getDoc(doc(db, "platform_settings", "cms_homepage"));
        if (docSnap.exists()) {
          setCmsLayout(docSnap.data() as any);
        }
      } catch (err) {
        console.error("Error fetching CMS layout", err);
      }
    };
    fetchCms();
  }, []);

  const heroSlides = [
    {
      badge: "Odisha Handloom Sovereign Hub",
      title: "Bhulia.com:",
      subtitle: "The Collective of Odisha's Master Weavers.",
      desc: "Direct access to thousands of authentic handloom artisans, primary weaving societies, and Bhulia.com verified masterpieces from multiple tenant stores.",
      img: "/hero_qc.png",
      btn: "Shop the Collections"
    },
    {
      badge: "Bhulia.com Verified Heritage",
      title: "Silk Masterpieces:",
      subtitle: "Authentic Double Ikat Pata.",
      desc: "Invest in 800 years of living heritage. Every silk thread is tie-dyed with mathematical precision and secured with D2C Jan Dhan payout.",
      img: "/hero_silk.jpg",
      btn: "Explore Silk Pata"
    },
    {
      badge: "Empowering Artisans directly",
      title: "Cotton Handlooms:",
      subtitle: "Everyday Luxury, Direct from Pit Looms.",
      desc: "Discover breathable, incredibly comfortable Cotton Sambalpuri and Bomkai sarees sourced right from the village weaving clusters.",
      img: "/hero_loom.jpg",
      btn: "Shop Cotton Deals"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const router = useRouter();


  // Capture Referral ID from URL parameters and log promoter visit
  useEffect(() => {
    const trackReferral = async () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        // Preserve original page before auth redirect
        const redirectPath = params.get('redirect_uri');
        if (redirectPath) {
          sessionStorage.setItem('sd_post_login_path', redirectPath);
        }
        const ref = params.get("ref");
        if (ref) {
          localStorage.setItem("sd_referral_id", ref);
          console.log("Captured Referral ID:", ref);
          
          const hasLoggedVisit = sessionStorage.getItem(`sd_ref_logged_${ref}`);
          if (!hasLoggedVisit) {
            try {
              const { db, doc, updateDoc, increment } = await import("../lib/firebase");
              const docRef = doc(db, "franchises", ref);
              await updateDoc(docRef, {
                invitedCount: increment(1)
              });
              sessionStorage.setItem(`sd_ref_logged_${ref}`, "true");
              console.log("Logged visit for promoter:", ref);
            } catch (err) {
              console.error("Error updating tracking stats in Firestore:", err);
            }
          }
        }
      }
    };
    trackReferral();
  }, []);

  // Dynamic Social Share Handler with Affiliate Tracking ID
  const handleSocialShare = (platform: "whatsapp" | "facebook", productName: string) => {
    const shareUrl = `${window.location.origin}/product/${encodeURIComponent(productName.toLowerCase().replace(/\s+/g, "-"))}?ref=${userUid}`;
    const message = `Explore the authentic Bhulia.com Verified ${productName} directly from Odisha master weavers on Bhulia Hub! ${shareUrl}`;

    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
    }
  };

  return (
    <main className="relative flex-1 w-full bg-[#051815] text-white font-sans flex flex-col min-h-screen">
      


      {/* Background Gold Glows & Ikat Texture */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C5A059 1px, transparent 0)', backgroundSize: '48px 48px' }} />
      <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-[#C5A059]/10 blur-[160px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-[#D4AF37]/10 blur-[160px] rounded-full pointer-events-none z-0" />

      

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden sticky top-[57px] z-40 bg-[#0B2B26]/98 backdrop-blur-md border-b border-[#C5A059]/40 px-6 py-6 space-y-4 shadow-2xl animate-fadeIn">
          <div className="flex flex-col space-y-3 text-xs font-bold uppercase tracking-widest text-gray-200">
            <Link href="/" onClick={() => setMobileNavOpen(false)} className="text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Home</Link>
            <div className="space-y-2 border-b border-[#C5A059]/20 pb-2">
              <span className="text-gray-400 block text-[10px]">Products:</span>
              <div className="grid grid-cols-2 gap-2 pl-2 text-[11px] font-medium text-gray-300 capitalize">
                <a href="#cotton-sambalpuri" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] block py-1">Cotton Sambalpuri</a>
                <a href="#pata-sambalpuri" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] block py-1">Pata Sambalpuri (Silk)</a>
                <a href="#cotton-bomkai" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] block py-1">Cotton Bomkai</a>
              </div>
            </div>
            <a href="#weaver-boutiques" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Weaver Boutiques</a>
            <Link href="/" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">About Us</Link>
            <Link href="/" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] pb-1 block">Contact Us</Link>

            {/* Mobile-Only Dedicated Sign In in Drawer */}
            {!userAvatar && (
              <button onClick={() => window.dispatchEvent(new Event("sd_auth_login_request"))} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow cursor-pointer">
                <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                <span>Sign In / Register</span>
              </button>
            )}

            {/* Mobile Cart Button */}
            <button onClick={() => router.push('/checkout')} className="w-full mt-2 flex items-center justify-center gap-2 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#0D4B45] transition-all cursor-pointer shadow">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              <span>View Cart ({cartCount} Items)</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 space-y-6 md:space-y-12 overflow-hidden">
        
        {/* 1. Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          
          {/* Main Hero Banner E.g. Span 7 (Dynamic Slider) */}
          <div className="lg:col-span-7 bg-[#051815] border border-[#C5A059] rounded-3xl overflow-hidden relative shadow-[0_0_35px_rgba(197,160,89,0.2)] group h-[280px] md:h-[315px]">
            {/* Background Image Slider */}
            {heroSlides.map((slide, idx) => (
              <div 
                key={idx} 
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentSlide === idx ? "opacity-100 z-10" : "opacity-0 z-0"}`}
              >
                <Image src={slide.img} alt={slide.title} fill className="object-cover transform scale-105 transition-transform duration-[10000ms] ease-linear" style={{ transform: currentSlide === idx ? 'scale(1)' : 'scale(1.05)' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
              </div>
            ))}
            
            {/* Overlay Content (Bottom Aligned with Reverse Text Highlight) */}
            <div className="relative z-20 h-full p-5 md:p-8 flex flex-col sm:flex-row justify-end sm:justify-between items-start sm:items-end gap-4 w-full">
              
              <div className="flex-1 max-w-xl">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-serif font-bold text-white leading-[1.6] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  <span className="bg-[#051815]/70 backdrop-blur-md px-3 py-1 box-decoration-clone rounded-sm">
                    {heroSlides[currentSlide].title} <span className="text-[#C5A059]">{heroSlides[currentSlide].subtitle}</span>
                  </span>
                </h2>
              </div>

              <div className="shrink-0 mt-2 sm:mt-0 sm:pb-1">
                <button className="px-8 py-3 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] font-black text-xs uppercase tracking-widest rounded-lg hover:brightness-110 hover:scale-105 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.5)] cursor-pointer whitespace-nowrap">
                  {heroSlides[currentSlide].btn}
                </button>
              </div>

            </div>
          </div>

          {/* Two Side Cards E.g. Span 5 */}
          <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch h-auto lg:h-[315px]">
            
            {/* Side Card 1: New Weaver Collective Arrivals */}
            <div className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-[#C5A059] transition-all shadow-xl">
              <div className="relative w-full h-32 rounded-xl overflow-hidden mb-4 border border-[#C5A059]/20 group-hover:border-[#C5A059]/50 transition-colors">
                <Image src="/bhulia-hero.png" alt="New Weaver Arrivals" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A3A35] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#C5A059] text-[#0A1021] text-[9px] font-bold uppercase tracking-widest rounded shadow">New Arrivals</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-serif font-bold text-white group-hover:text-[#C5A059] transition-colors leading-tight line-clamp-2">New Weaver Collective Arrivals</h3>
                <p className="text-[11px] text-gray-300 font-sans leading-relaxed line-clamp-2">Discover fresh Mulberry Silk & Cotton Ikat weaves directly from Bargarh & Sonepur pit looms.</p>
              </div>
              <button className="w-full mt-3 py-2 bg-[#0A3A35] border border-[#C5A059]/40 group-hover:border-[#C5A059] text-[11px] font-bold uppercase tracking-widest text-[#C5A059] rounded-lg transition-all cursor-pointer">
                Inspect Lot
              </button>
            </div>

            {/* Side Card 2: Meet Our Tenant Stores */}
            <div className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-[#C5A059] transition-all shadow-xl">
              <div className="relative w-full h-32 rounded-xl overflow-hidden mb-4 border border-[#C5A059]/20 group-hover:border-[#C5A059]/50 transition-colors">
                <Image src="/bhulia-hero.png" alt="Featured Artisans" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A3A35] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#D4AF37] text-[#0A1021] text-[9px] font-bold uppercase tracking-widest rounded shadow">Tenant Stores</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-serif font-bold text-white group-hover:text-[#C5A059] transition-colors leading-tight line-clamp-2">Meet Our Tenant Stores: Featured Artisans</h3>
                <p className="text-[11px] text-gray-300 font-sans leading-relaxed line-clamp-2">Explore verified Primary Weavers Cooperative Societies (PWCS) and master workshops.</p>
              </div>
              <a href="#weaver-boutiques" className="w-full mt-3 py-2 bg-[#0A3A35] border border-[#C5A059]/40 group-hover:border-[#C5A059] text-[11px] font-bold uppercase tracking-widest text-[#C5A059] rounded-lg transition-all cursor-pointer text-center block">
                View Stores
              </a>
            </div>

          </div>

        </div>

        {/* --- ALGORITHMIC PRODUCT ROWS --- */}
        {!productsLoading && products.length > 0 && (
          <div className="space-y-12 pb-8">
            {/* Trending This Week Row */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl md:text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C5A059] flex items-center gap-2">
                    <span className="text-2xl">🔥</span> Trending This Week
                  </h3>
                  <div className="hidden sm:block flex-1 w-32 h-[1px] bg-gradient-to-r from-[#C5A059]/60 to-transparent"></div>
                </div>
                <Link href="/search" className="text-xs font-bold text-[#C5A059] uppercase tracking-widest hover:underline whitespace-nowrap">View All</Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 pt-2">
                {[...products].sort(() => 0.5 - Math.random()).slice(0, 12).map(item => (
                  <ProductCard key={item.id} product={item} role={userRole} />
                ))}
              </div>
            </div>

            {/* Special Offers Row */}
            {products.some(p => p.isSpecialOffer) && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl md:text-3xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 flex items-center gap-2">
                      <span className="text-2xl animate-bounce">🔥</span> Special Discount Sales
                    </h3>
                    <div className="hidden sm:block flex-1 w-32 h-[1px] bg-gradient-to-r from-red-500/60 to-transparent"></div>
                  </div>
                  <Link href="/search?specialOffer=true" className="text-xs font-bold text-red-400 uppercase tracking-widest hover:underline whitespace-nowrap">View All Deals</Link>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 pt-2">
                  {[...products].filter(p => p.isSpecialOffer).slice(0, 12).map(item => (
                    <ProductCard key={item.id} product={item} role={userRole} />
                  ))}
                </div>
              </div>
            )}

            {/* New Arrivals Row */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl md:text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C5A059] flex items-center gap-2">
                    <span className="text-2xl">✨</span> New Arrivals
                  </h3>
                  <div className="hidden sm:block flex-1 w-32 h-[1px] bg-gradient-to-r from-[#C5A059]/60 to-transparent"></div>
                </div>
                <Link href="/search?sort=newest" className="text-xs font-bold text-[#C5A059] uppercase tracking-widest hover:underline whitespace-nowrap">View All</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 pt-2">
                {[...products].slice(-12).reverse().map(item => (
                  <ProductCard key={item.id} product={item} role={userRole} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- DYNAMIC CMS RENDERER --- */}
        {cmsLayout?.dynamicEnabled ? (
          <div className="space-y-8 md:space-y-12">
            {cmsLayout.rows.map(row => {
              if (row.type === "products") {
                const categoryProducts = products.filter(p => p?.category === row.category || p?.weave === row.category || (p?.category || "").toLowerCase().includes(row.category?.toLowerCase() || ""));
                
                // Theme Logic
                const isModern = row.themeStyle === "modern";
                const isVintage = row.themeStyle === "vintage";
                
                const titleColor = isVintage ? "text-amber-500 font-serif italic drop-shadow" : isModern ? "text-white font-sans font-bold" : "text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C5A059]";
                const cardStyle = isVintage ? "bg-[#1A1A1A] border-2 border-amber-900 shadow-inner rounded-none" : isModern ? "bg-zinc-900 border border-zinc-700 rounded-3xl" : "bg-[#0B2B26] border border-[#C5A059]/40 rounded-2xl";

                return (
                  <div key={row.id} className="space-y-4 scroll-mt-24">
                    <div>
                      <div className="flex items-center gap-4 mb-1">
                        <h3 className={`text-xl md:text-3xl tracking-wider ${titleColor}`}>{row.title || "Products"}</h3>
                        <div className="flex-1 h-[1px] bg-gradient-to-r from-[#C5A059]/60 to-transparent"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {categoryProducts.length === 0 ? <p className="text-gray-400 text-xs">No products in this category.</p> : null}
                      {categoryProducts.slice(0, 4).map(p => (
                        <Link href={`/product/${p.title.toLowerCase().replace(/\s+/g, "-")}`} key={p.id} className={`${cardStyle} p-4 flex flex-col justify-between group hover:border-[#C5A059] transition-all`}>
                          <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3">
                            <Image src={(p as any).images?.[0] || (p as any).image || "/bhulia-hero.png"} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                            {p.isSpecialOffer && (
                              <div className="absolute top-0 right-0 m-1.5 px-1.5 py-0.5 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[8px] font-black uppercase tracking-widest rounded shadow flex items-center gap-1 z-10">
                                <span>🔥</span> {p.specialOfferTag || "Offer"}
                              </div>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white line-clamp-2">{p.title}</h4>
                          <p className="text-[#C5A059] font-bold mt-2">{p.price}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }
              
              if (row.type === "banner") {
                return (
                  <div key={row.id} className="bg-gradient-to-r from-[#0A3A35] to-[#051815] border-y border-[#C5A059]/30 py-8 px-4 text-center">
                    <h3 className="text-2xl md:text-4xl font-serif font-bold text-[#C5A059] uppercase tracking-widest">{row.bannerText}</h3>
                  </div>
                );
              }

              return null; // Hero and Gateways are already hardcoded at the top for now
            })}
          </div>
        ) : (
          /* --- STATIC LEGACY RENDERER --- */
          <>
            {/* 2. Explore Master Weaver Flagship Boutiques */}
        <div id="weaver-boutiques" className="space-y-3 md:space-y-4 scroll-mt-24">
          <div>
            <div className="flex items-center gap-4 mb-1">
              <h3 className="text-xl md:text-3xl font-serif font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C5A059] drop-shadow-[0_0_8px_rgba(197,160,89,0.3)] whitespace-nowrap">Explore Master Weaver Flagships</h3>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-[#C5A059]/60 to-transparent shadow-[0_0_8px_rgba(197,160,89,0.5)]"></div>
            </div>
            <p className="text-[10px] md:text-xs text-gray-300 uppercase tracking-widest font-semibold">Browse verified sovereign D2C boutiques, village clusters, and Bhulia.com registries</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {weaversLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-2xl h-[380px] animate-pulse"></div>
              ))
            ) : weavers.map((dir, idx) => (
              <Link key={idx} href={`/weaver/${dir.slug}`} className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#C5A059] transition-all shadow-xl cursor-pointer block">
                <div>
                  {/* Image Thumbnail (100% Clean & Unobstructed Face) */}
                  <div className="relative w-full h-48 overflow-hidden bg-[#051815]">
                    <Image src={dir.img} alt={dir.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A3A35] via-transparent to-transparent" />
                  </div>

                  <div className="p-4 sm:p-5 pb-0">
                    {/* Unifying Sovereign Real Gold 3D Water Wave Ripple Plaque Underneath Image */}
                    <div className="relative inline-flex items-center justify-center mb-3 w-full">
                      {/* Outer Expanding Water Wave Ripple Layers */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#FFF2B2] to-[#D4AF37] opacity-60 animate-ping pointer-events-none blur-sm" style={{ animationDuration: '2.5s' }} />
                      <div className="absolute -inset-1 rounded-2xl bg-[#C5A059] opacity-30 animate-pulse pointer-events-none blur-md" />

                      {/* Real 3D Metallic Gold Plaque Button */}
                      <div className="relative z-10 w-full py-2.5 px-4 rounded-2xl bg-gradient-to-b from-[#FFF5C0] via-[#D4AF37] via-[#C5A059] to-[#8A5A00] border-2 border-[#FFF0A5] shadow-[0_12px_30px_rgba(0,0,0,0.85),inset_0_3px_4px_rgba(255,255,255,0.9),inset_0_-4px_6px_rgba(120,75,0,0.9)] flex flex-col items-center justify-center transform hover:scale-[1.02] transition-transform duration-300">
                        <span className="text-[10px] sm:text-[11px] font-serif font-black tracking-widest text-[#0A1021] uppercase leading-none mb-1 drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">
                          Bhulia Verified
                        </span>
                        <span className="text-[11px] sm:text-xs font-serif font-black tracking-wider text-[#0A1021] uppercase leading-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] text-center">
                          {dir.badge.replace("Bhulia Verified ", "")}
                        </span>
                      </div>
                    </div>
                    <h4 className="text-lg font-serif font-bold text-white mb-2 group-hover:text-[#C5A059] transition-colors leading-tight">{dir.title}</h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">{dir.desc}</p>
                  </div>
                </div>
                <div className="p-4 sm:p-5 pt-3 mt-3 border-t border-[#C5A059]/20 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[#C5A059]">
                  <span>Visit Flagship Store</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 3. Operational Onboarding Gateways (Sovereign Pillars 4-Column Grid) */}
        <div className="space-y-3 md:space-y-4">
          <div>
            <div className="flex items-center gap-4 mb-1">
              <h3 className="text-xl md:text-2xl font-serif font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C5A059] drop-shadow-[0_0_8px_rgba(197,160,89,0.3)] whitespace-nowrap">Operational Onboarding Gateways</h3>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-[#C5A059]/60 to-transparent shadow-[0_0_8px_rgba(197,160,89,0.5)]"></div>
            </div>
            <p className="text-[10px] md:text-xs text-gray-300 uppercase tracking-widest">Select your dedicated operational pillar to initiate secure, verified onboarding</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { title: "Weavers Onboarding", desc: "List your traditional pit looms, mint Bhulia.com Verified sarees, and receive direct D2C payout payouts.", icon: "🧵", btn: "Apply as Weaver", href: "/register-weaver" },
              { title: "Store Owners Gateway", desc: "Register your Primary Weaving Cooperative Society (PWCS) or master boutique for global Spree sync.", icon: "🏛️", btn: "Apply as Store Owner", href: "/register-store" },
              { title: "Wholesalers Portal", desc: "Access bulk B2B handloom requisitions, custom Ikat commissioning lots, and tax-exempt export billing.", icon: "📦", btn: "Apply as Wholesaler", href: "#" },
              { title: "Franchises Network", desc: "Curate regional Phygital dropshipping hubs and expand the Shyam Dash global artisan footprint.", icon: "⭐", btn: "Apply as Franchise", href: "/register-franchise" }
            ].map((gate, idx) => (
              <div key={idx} className="bhulia-premium-card p-4 sm:p-5 flex flex-col justify-between group">
                <div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#051815] border border-[#C5A059]/40 flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),_0_0_10px_rgba(197,160,89,0.3)]">
                    <span className="drop-shadow-[0_0_8px_rgba(197,160,89,0.8)]">{gate.icon}</span>
                  </div>
                  <h4 className="text-lg font-serif font-bold text-white mb-2 group-hover:text-[#C5A059] transition-colors">{gate.title}</h4>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">{gate.desc}</p>
                </div>
                <Link href={gate.href} className="bhulia-plaque w-full mt-6 py-3 rounded-xl block text-center flex items-center justify-center gap-2">
                  {gate.btn} <span className="opacity-70 font-sans">»</span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* 4. 5-7 Product Category Grids E.g. Cotton Sambalpuri */}
        <div id="cotton-sambalpuri" className="space-y-3 md:space-y-4">
          <div className="flex justify-between items-end border-b border-[#C5A059]/30 pb-3 md:pb-4">
            <div>
              <div className="flex items-center gap-4">
                <h3 className="text-xl md:text-3xl font-serif font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C5A059] drop-shadow-[0_0_8px_rgba(197,160,89,0.3)] whitespace-nowrap">Cotton Sambalpuri Sarees</h3>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-[#C5A059]/60 to-transparent shadow-[0_0_8px_rgba(197,160,89,0.5)]"></div>
              </div>
              <p className="text-[10px] md:text-xs text-gray-300 uppercase tracking-widest mt-1 font-semibold">Breathable, traditional daily luxury direct from grassroots pit looms</p>
            </div>
            <button className="hidden sm:block px-4 py-2 bg-[#0B2B26] border border-[#C5A059]/40 hover:border-[#C5A059] text-[#C5A059] text-xs font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer">
              View All Cotton
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
            {productsLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl h-[380px] animate-pulse"></div>
              ))
            ) : cottonSambalpuri.map((item, idx) => (
              <div key={idx} className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#C5A059] transition-all duration-300 shadow-xl p-0.5">
                <div className="relative w-full h-48 sm:h-64 overflow-hidden bg-[#0B2B26] rounded-t-xl">
                  <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-2.5 right-2.5 bg-[#0B2B26]/80 backdrop-blur-md px-2 py-0.5 rounded border border-[#C5A059]/40 text-[9px] font-mono text-[#C5A059] font-bold">
                    {item.id}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0B2B26] to-transparent p-3 pt-8">
                    <p className="text-[9px] text-[#C5A059] uppercase tracking-widest font-bold">Sold by: {item.cluster}</p>
                  </div>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-[#C5A059] transition-colors mb-0.5 leading-tight line-clamp-1">{item.title}</h4>
                    <p className="text-base font-serif font-bold text-[#C5A059]">{item.price}</p>
                  </div>

                  {/* Social Share Affiliate Buttons */}
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
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Bottom Ticket */}
                <div className="bg-[#0A2520] px-3 py-1.5 border-t border-[#C5A059]/20 text-[9px] font-mono text-gray-300 flex items-center justify-center gap-1 text-center leading-tight">
                  <span className="truncate">{item.escrowStatus || "🛡️ 100% Bhulia.com Verified"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interspersed Advertisement Banner 1 */}
        <div className="bg-gradient-to-r from-[#0A3A35] via-[#0D3630] to-[#0A3A35] border-2 border-[#C5A059] rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-[0_0_40px_rgba(197,160,89,0.3)] flex flex-col md:flex-row items-center justify-between gap-8 group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C5A059]/15 via-transparent to-transparent pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
          
          <div className="space-y-4 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse"></span>
              <span>800 Years of Living Heritage</span>
            </div>
            
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight">
              Empowering Grassroots Artisans <br />
              <span className="text-[#C5A059]">Through Sovereign D2C & B2B Channels.</span>
            </h3>

            <p className="text-sm text-gray-200 font-sans leading-relaxed">
              Every purchase on Bhulia Hub directly funds the master weavers of Bargarh, Sonepur, and Boudh, eliminating predatory middlemen and ensuring 100% transparent wage payout.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
            <button className="px-8 py-4 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_0_25px_rgba(197,160,89,0.4)] cursor-pointer">
              Commission B2B Lot
            </button>
          </div>
        </div>

        {/* 5. Product Category Grid 2 E.g. Pata Sambalpuri Silk */}
        <div id="pata-sambalpuri" className="space-y-4 md:space-y-6 pt-4 md:pt-6">
          <div className="flex justify-between items-end border-b border-[#C5A059]/30 pb-3 md:pb-4">
            <div>
              <div className="flex items-center gap-4">
                <h3 className="text-xl md:text-3xl font-serif font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C5A059] drop-shadow-[0_0_8px_rgba(197,160,89,0.3)] whitespace-nowrap">Pata Sambalpuri Sarees (Pure Silk)</h3>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-[#C5A059]/60 to-transparent shadow-[0_0_8px_rgba(197,160,89,0.5)]"></div>
              </div>
              <p className="text-[10px] md:text-xs text-gray-300 uppercase tracking-widest mt-1 font-semibold">Exquisite Mulberry & Tussar silk masterpieces for weddings and royal connoisseurs</p>
            </div>
            <button className="hidden sm:block px-4 py-2 bg-[#0B2B26] border border-[#C5A059]/40 hover:border-[#C5A059] text-[#C5A059] text-xs font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer">
              View All Silk
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
            {productsLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl h-[380px] animate-pulse"></div>
              ))
            ) : pataSambalpuri.map((item, idx) => (
              <div key={idx} className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#C5A059] transition-all duration-300 shadow-xl p-0.5">
                <div className="relative w-full h-48 sm:h-64 overflow-hidden bg-[#0B2B26] rounded-t-xl">
                  <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-2.5 right-2.5 bg-[#0B2B26]/80 backdrop-blur-md px-2 py-0.5 rounded border border-[#C5A059]/40 text-[9px] font-mono text-[#C5A059] font-bold">
                    {item.id}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0B2B26] to-transparent p-3 pt-8">
                    <p className="text-[9px] text-[#C5A059] uppercase tracking-widest font-bold">Sold by: {item.cluster}</p>
                  </div>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-[#C5A059] transition-colors mb-0.5 leading-tight line-clamp-1">{item.title}</h4>
                    <p className="text-base font-serif font-bold text-[#C5A059]">{item.price}</p>
                  </div>

                  {/* Social Share Affiliate Buttons */}
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
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Bottom Ticket */}
                <div className="bg-[#0A2520] px-3 py-1.5 border-t border-[#C5A059]/20 text-[9px] font-mono text-gray-300 flex items-center justify-center gap-1 text-center leading-tight">
                  <span className="truncate">{item.escrowStatus || "🛡️ 100% Bhulia.com Verified"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interspersed Advertisement Banner 2 */}
        <div className="bg-[#0B2B26] border-2 border-[#C5A059] rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-[0_0_40px_rgba(197,160,89,0.3)] flex flex-col md:flex-row items-center justify-between gap-8 group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C5A059]/15 via-transparent to-transparent pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
          
          <div className="space-y-4 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse"></span>
              <span>100% Silk Mark & Bhulia.com Payout Protection</span>
            </div>
            
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight">
              Sovereign Handloom Verification <br />
              <span className="text-[#C5A059]">Backed by Jan Dhan Artisan Welfare.</span>
            </h3>

            <p className="text-sm text-gray-200 font-sans leading-relaxed">
              Every masterpiece includes an immutable physical GI Certificate and Silk Mark hologram, guaranteeing absolute authenticity and protecting Odisha's ancient weaving heritage.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
            <button className="px-8 py-4 bg-[#0A3A35] border border-[#C5A059] hover:bg-[#0D4B45] text-[#C5A059] hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer">
              Inspect GI Registry
            </button>
          </div>
        </div>

        {/* 6. Product Category Grid 3 E.g. Cotton Bomkai */}
        <div id="cotton-bomkai" className="space-y-4 md:space-y-6 pt-4 md:pt-6">
          <div className="flex justify-between items-end border-b border-[#C5A059]/30 pb-3 md:pb-4">
            <div>
              <div className="flex items-center gap-4">
                <h3 className="text-xl md:text-3xl font-serif font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C5A059] drop-shadow-[0_0_8px_rgba(197,160,89,0.3)] whitespace-nowrap">Cotton Bomkai</h3>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-[#C5A059]/60 to-transparent shadow-[0_0_8px_rgba(197,160,89,0.5)]"></div>
              </div>
              <p className="text-[10px] md:text-xs text-gray-300 uppercase tracking-widest mt-1 font-semibold">Intricate extra-weft thread work on comfortable cotton bases</p>
            </div>
            <button className="hidden sm:block px-4 py-2 bg-[#0B2B26] border border-[#C5A059]/40 hover:border-[#C5A059] text-[#C5A059] text-xs font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer">
              View All Bomkai
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
            {productsLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl h-[380px] animate-pulse"></div>
              ))
            ) : cottonBomkai.map((item, idx) => (
              <div key={idx} className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#C5A059] transition-all duration-300 shadow-xl p-0.5">
                <div className="relative w-full h-48 sm:h-64 overflow-hidden bg-[#0B2B26] rounded-t-xl">
                  <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-2.5 right-2.5 bg-[#0B2B26]/80 backdrop-blur-md px-2 py-0.5 rounded border border-[#C5A059]/40 text-[9px] font-mono text-[#C5A059] font-bold">
                    {item.id}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0B2B26] to-transparent p-3 pt-8">
                    <p className="text-[9px] text-[#C5A059] uppercase tracking-widest font-bold">Sold by: {item.cluster}</p>
                  </div>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-[#C5A059] transition-colors mb-0.5 leading-tight line-clamp-1">{item.title}</h4>
                    <p className="text-base font-serif font-bold text-[#C5A059]">{item.price}</p>
                  </div>

                  {/* Social Share Affiliate Buttons */}
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
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Bottom Ticket */}
                <div className="bg-[#0A2520] px-3 py-1.5 border-t border-[#C5A059]/20 text-[9px] font-mono text-gray-300 flex items-center justify-center gap-1 text-center leading-tight">
                  <span className="truncate">{item.escrowStatus || "🛡️ 100% Bhulia.com Verified"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explore by Category & Mission Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch pt-4 md:pt-6">
          
          {/* Explore by Category E.g. Span 5 */}
          <div className="lg:col-span-5 bg-[#0B2B26] border border-[#C5A059]/30 rounded-3xl p-8 flex flex-col justify-between shadow-xl space-y-6">
            <div>
              <div className="flex items-center gap-4 mb-1">
                <h3 className="text-xl md:text-2xl font-serif font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C5A059] drop-shadow-[0_0_8px_rgba(197,160,89,0.3)] whitespace-nowrap">Explore by Category</h3>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-[#C5A059]/60 to-transparent shadow-[0_0_8px_rgba(197,160,89,0.5)]"></div>
              </div>
              <p className="text-xs text-gray-300 uppercase tracking-widest">Curated collections of authentic weaves</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Sarees", img: "/bhulia-hero.png", count: "1,240+ Weaves" },
                { name: "Dress Materials", img: "/bhulia-hero.png", count: "450+ Sets" },
                { name: "Dupattas", img: "/bhulia-hero.png", count: "890+ Pieces" },
                { name: "Home Decor", img: "/bhulia-hero.png", count: "320+ Items" }
              ].map((cat, idx) => (
                <div key={idx} className="bg-[#0A3A35] border border-[#C5A059]/40 rounded-2xl p-4 flex flex-col items-center text-center group hover:border-[#C5A059] transition-all cursor-pointer shadow">
                  <div className="w-16 h-16 rounded-full overflow-hidden relative mb-3 border border-[#C5A059]/40 group-hover:scale-110 transition-transform duration-500">
                    <Image src={cat.img} alt={cat.name} fill className="object-cover" />
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-[#C5A059] transition-colors">{cat.name}</h4>
                  <span className="text-[10px] text-gray-400 font-mono mt-0.5">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Our Mission Showcase E.g. Span 7 */}
          <div className="lg:col-span-7 bg-[#0B2B26] border border-[#C5A059]/30 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden shadow-xl group">
            <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-50 transition-opacity duration-700">
              <Image src="/bhulia-hero.png" alt="Weaver Loom Mission" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A3A35] via-[#0A3A35]/90 to-transparent"></div>
            </div>

            <div className="relative z-10 space-y-6 max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold uppercase tracking-widest">
                <span>Sustainable Craftsmanship</span>
              </div>
              
              <h3 className="text-3xl font-serif font-bold text-white leading-tight">
                Our Mission: Preserving a Legacy, <br />
                <span className="text-[#C5A059]">Supporting a Community.</span>
              </h3>

              <p className="text-sm text-gray-200 font-sans leading-relaxed">
                Bhulia.com provides a global stage for Odisha's artisan communities, connecting you directly to individual weaver stores. We are more than a store; we are a sustainable ecosystem for craftsmanship.
              </p>
            </div>

            <div className="relative z-10 pt-6">
              <button className="px-6 py-3 bg-[#0A3A35] border border-[#C5A059] hover:bg-[#0D4B45] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer">
                Read the Weaver's Story
              </button>
            </div>
          </div>

          </div>
          </>
        )}

      </div>

      {/* Global Footer Area */}
      

    </main>
  );
}
