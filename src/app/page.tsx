"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userUid, setUserUid] = useState<string>("sd_super_admin_custom_uid");
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const heroSlides = [
    {
      badge: "Odisha Handloom Sovereign Hub",
      title: "Bhulia.com:",
      subtitle: "The Collective of Odisha's Master Weavers.",
      desc: "Direct access to thousands of authentic handloom artisans, primary weaving societies, and GI-Tag verified masterpieces from multiple tenant stores.",
      img: "/hero_qc.png",
      btn: "Shop the Collections"
    },
    {
      badge: "GI-Tag Verified Heritage",
      title: "Silk Masterpieces:",
      subtitle: "Authentic Double Ikat Pata.",
      desc: "Invest in 800 years of living heritage. Every silk thread is tie-dyed with mathematical precision and secured with D2C Jan Dhan escrow.",
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

  useEffect(() => {
    const checkAuth = () => {
      const email = localStorage.getItem("sd_current_user_email");
      const name = localStorage.getItem("sd_current_user_name");
      const avatar = localStorage.getItem("sd_current_user_avatar");
      const role = localStorage.getItem("sd_current_user_role");
      const uid = localStorage.getItem("sd_current_user_uid") || "sd_super_admin_custom_uid";

      if (email) {
        setUserName(name || email.split("@")[0]);
        setUserAvatar(avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80");
        setUserRole(role || "user");
        setUserUid(uid);
      } else {
        setUserName(null);
        setUserAvatar(null);
        setUserRole(null);
      }
    };

    checkAuth();
    window.addEventListener("sd_auth_change", checkAuth);
    return () => window.removeEventListener("sd_auth_change", checkAuth);
  }, []);

  // Capture Referral ID from URL parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) {
        localStorage.setItem("sd_referral_id", ref);
        console.log("Captured Referral ID:", ref);
      }
    }
  }, []);

  // Dynamic Social Share Handler with Affiliate Tracking ID
  const handleSocialShare = (platform: "whatsapp" | "facebook", productName: string) => {
    const shareUrl = `${window.location.origin}/product/${encodeURIComponent(productName.toLowerCase().replace(/\s+/g, "-"))}?ref=${userUid}`;
    const message = `Explore the authentic GI-Tagged ${productName} directly from Odisha master weavers on Bhulia Hub! ${shareUrl}`;

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

      {/* Top Sticky Header / Perfect Left-Center-Right Balance */}
      <header className="sticky top-0 w-full z-50 bg-[#0B2B26] border-b border-[#C5A059]/40 px-4 sm:px-6 py-3 sm:py-4 shadow-lg flex flex-col gap-3">
        <div className="flex justify-between items-center gap-2 w-full">
          {/* Left Side: Gold Logo, Bhulia.com & Slogan */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
            <div className="relative w-8 sm:w-14 h-8 sm:h-14 rounded-full overflow-hidden border border-[#C5A059] sm:border-2 shadow-[0_0_20px_rgba(197,160,89,0.6)] shrink-0">
              <Image src="/bhulia_logo_final.jpg" alt="Bhulia Gold Logo" fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-serif font-bold tracking-wider text-[#C5A059] leading-none">BHULIA.COM</h1>
              <p className="hidden sm:block text-[11px] text-gray-300 font-medium tracking-wide mt-1 truncate">Sambalpuri saree, Direct from Weavers</p>
            </div>
          </div>

          {/* Center: Dedicated Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-200">
            <Link href="/" className="text-[#C5A059] border-b-2 border-[#C5A059] pb-1">Home</Link>
            <div className="relative group py-1">
              <button className="flex items-center gap-1 hover:text-[#C5A059] transition-colors cursor-pointer">
                <span>Products</span>
                <span className="text-[10px]">▼</span>
              </button>
              <div className="absolute top-full left-0 mt-2 w-56 bg-[#0D3630] border border-[#C5A059]/40 rounded-xl shadow-2xl py-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-50">
                <a href="#cotton-sambalpuri" className="block px-4 py-2 text-xs hover:bg-[#0B2B26] hover:text-[#C5A059]">Cotton Sambalpuri</a>
                <a href="#pata-sambalpuri" className="block px-4 py-2 text-xs hover:bg-[#0B2B26] hover:text-[#C5A059]">Pata Sambalpuri (Silk)</a>
                <a href="#cotton-bomkai" className="block px-4 py-2 text-xs hover:bg-[#0B2B26] hover:text-[#C5A059]">Cotton Bomkai</a>
              </div>
            </div>
            <a href="#weaver-boutiques" className="hover:text-[#C5A059] transition-colors pb-1">Weaver Boutiques</a>
            <Link href="/" className="hover:text-[#C5A059] transition-colors pb-1">About Us</Link>
            <Link href="/" className="hover:text-[#C5A059] transition-colors pb-1">Contact Us</Link>
          </nav>

          {/* Right Side: User Menu / Sign In / Register (Desktop) & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {userAvatar ? (
              <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1 sm:py-2 bg-[#0A3A35] rounded-xl border border-[#C5A059]/50 shadow-inner shrink-0">
                <img src={userAvatar} alt="User Avatar" className="w-6 sm:w-8 h-6 sm:h-8 rounded-full border border-[#C5A059]" />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-none">{userName}</span>
                  <span className="text-[9px] text-[#C5A059] uppercase tracking-widest mt-0.5">{userRole}</span>
                </div>
              </div>
            ) : (
              <a href="https://sd-auth-center.vercel.app" className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(197,160,89,0.4)] hover:brightness-110 transition-all cursor-pointer shrink-0">
                <svg className="w-3.5 h-3.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                <span>Sign In / Register</span>
              </a>
            )}

            {/* Cart Button */}
            <button className="hidden sm:flex items-center gap-2 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#0D4B45] transition-all cursor-pointer shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              <span>Cart (2)</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="lg:hidden flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] rounded-xl hover:bg-[#0D4B45] transition-all cursor-pointer shrink-0 shadow">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileNavOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

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
              <a href="https://sd-auth-center.vercel.app" onClick={() => setMobileNavOpen(false)} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow">
                <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                <span>Sign In / Register</span>
              </a>
            )}

            {/* Mobile Cart Button */}
            <button className="w-full mt-2 flex items-center justify-center gap-2 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#0D4B45] transition-all cursor-pointer shadow">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              <span>View Cart (2 Items)</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 relative z-10 space-y-6 md:space-y-8 overflow-hidden">
        
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#010a08] via-[#051815]/80 to-transparent opacity-95"></div>
              </div>
            ))}
            
            {/* Overlay Content (Bottom Aligned) */}
            <div className="relative z-20 h-full p-5 md:p-8 flex flex-col justify-end">
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4 w-full">
                
                <div className="flex-1 max-w-xl">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-serif font-bold text-white leading-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] line-clamp-1 sm:line-clamp-2">
                    {heroSlides[currentSlide].title} <span className="text-[#C5A059]">{heroSlides[currentSlide].subtitle}</span>
                  </h2>
                </div>

                <div className="shrink-0 w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] font-bold text-[10px] sm:text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_0_25px_rgba(197,160,89,0.5)] cursor-pointer">
                    {heroSlides[currentSlide].btn}
                  </button>
                </div>

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

        {/* 2. Explore Master Weaver Flagship Boutiques */}
        <div id="weaver-boutiques" className="space-y-3 md:space-y-4 scroll-mt-24">
          <div>
            <h3 className="text-xl md:text-3xl font-serif text-[#C5A059] font-bold tracking-wider mb-1">Explore Master Weaver Flagships</h3>
            <p className="text-[10px] md:text-xs text-gray-300 uppercase tracking-widest font-semibold">Browse verified sovereign D2C boutiques, village clusters, and GI-Tag registries</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[
              { 
                title: "Master Weaver Nandalal Meher", 
                desc: "Award-winning master weaver from Dasrajpur, Sonepur. Preserving the rare mathematical alignment of authentic double ikat silk Pata.", 
                img: "/nandalal_meher.jpg", 
                badge: "Bhulia Verified Sambalpuri Master Weaver",
                link: "/weaver/nandalal-meher" 
              },
              { 
                title: "Creative Weaver Rabindra Meher", 
                desc: "Master of Sambalpuri Pata from Dasrajpur, Sonepur. Specializing in intricate Double Ikat, Pasapalli, Nabakothi, and narrative Sachitra silk canvases.", 
                img: "/rabindra_meher.jpg", 
                badge: "Bhulia Verified Sambalpuri Master Weaver",
                link: "/weaver/rabindra-meher" 
              },
              { 
                title: "Master Artisan Nagarjuna Meher", 
                desc: "Legendary master weaver from Dasrajpur, Sonepur. Devoted to handloom excellence since childhood, producing premium double ikat and narrative silk masterpieces.", 
                img: "/nagarjuna_meher.png", 
                badge: "Bhulia Verified Sambalpuri Master Weaver",
                link: "/weaver/nagarjuna-meher" 
              },
              { 
                title: "Master Weaver Ravi Meher", 
                desc: "Visionary Graph Artist from Lumunda, Bargarh. Merging architectural precision with Bandha Kala to create Pasapali and Sachipar masterpieces.", 
                img: "/ravi_meher_v3.png", 
                badge: "Bhulia Verified Sambalpuri Master Weaver",
                link: "/weaver/ravi-meher" 
              }
            ].map((dir, idx) => (
              <Link key={idx} href={dir.link} className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#C5A059] transition-all shadow-xl cursor-pointer block">
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
                          Sambalpuri Master Weaver
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
            <h3 className="text-xl md:text-2xl font-serif text-[#C5A059] font-bold tracking-wider mb-1">Operational Onboarding Gateways</h3>
            <p className="text-[10px] md:text-xs text-gray-300 uppercase tracking-widest">Select your dedicated operational pillar to initiate secure, verified onboarding</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { title: "Weavers Onboarding", desc: "List your traditional pit looms, mint GI-Tagged sarees, and receive direct D2C escrow payouts.", icon: "🧵", btn: "Apply as Weaver", href: "/register-weaver" },
              { title: "Store Owners Gateway", desc: "Register your Primary Weaving Cooperative Society (PWCS) or master boutique for global Spree sync.", icon: "🏛️", btn: "Apply as Store Owner", href: "#" },
              { title: "Wholesalers Portal", desc: "Access bulk B2B handloom requisitions, custom Ikat commissioning lots, and tax-exempt export billing.", icon: "📦", btn: "Apply as Wholesaler", href: "#" },
              { title: "Franchises Network", desc: "Curate regional Phygital dropshipping hubs and expand the Shyam Dash global artisan footprint.", icon: "⭐", btn: "Apply as Franchise", href: "#" }
            ].map((gate, idx) => (
              <div key={idx} className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between group hover:border-[#C5A059] transition-all shadow-xl">
                <div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0A3A35] border border-[#C5A059]/30 flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow">
                    {gate.icon}
                  </div>
                  <h4 className="text-lg font-serif font-bold text-white mb-2 group-hover:text-[#C5A059] transition-colors">{gate.title}</h4>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">{gate.desc}</p>
                </div>
                <Link href={gate.href} className="w-full mt-6 py-3 bg-[#0A3A35] border border-[#C5A059]/50 hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-[#0A1021] text-xs font-bold uppercase tracking-widest text-[#C5A059] rounded-xl transition-all shadow-md cursor-pointer text-center block">
                  {gate.btn} →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* 4. 5-7 Product Category Grids E.g. Cotton Sambalpuri */}
        <div id="cotton-sambalpuri" className="space-y-3 md:space-y-4">
          <div className="flex justify-between items-end border-b border-[#C5A059]/30 pb-3 md:pb-4">
            <div>
              <h3 className="text-xl md:text-3xl font-serif text-[#C5A059] font-bold tracking-wider">Cotton Sambalpuri Sarees</h3>
              <p className="text-[10px] md:text-xs text-gray-300 uppercase tracking-widest mt-1 font-semibold">Breathable, traditional daily luxury direct from grassroots pit looms</p>
            </div>
            <button className="hidden sm:block px-4 py-2 bg-[#0B2B26] border border-[#C5A059]/40 hover:border-[#C5A059] text-[#C5A059] text-xs font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer">
              View All Cotton
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
            {[
              { id: "GI-8492", name: "Traditional Red Cotton Ikat", vendor: "Pata Weaver Group", price: "₹ 4,899", img: "/bhulia-hero.png", ticket: "👁️ 18 Connoisseurs Viewing E.g. 1 Saree Left" },
              { id: "GI-7738", name: "Royal Blue Cotton Pasapalli", vendor: "Maa Samaleswari Handlooms", price: "₹ 5,299", img: "/bhulia-hero.png", ticket: "🛡️ 100% GI-Tag Verified E.g. Barpali Loom" },
              { id: "GI-6639", name: "Maroon & Black Cotton Bomkai", vendor: "Maa Samaleswari Handlooms", price: "₹ 5,899", img: "/bhulia-hero.png", ticket: "⏱️ Weaving Ends in 3 Days E.g. Reserve Now" },
              { id: "GI-5528", name: "Emerald Green Cotton Bandha", vendor: "Maa Samaleswari Handlooms", price: "₹ 4,999", img: "/bhulia-hero.png", ticket: "🔥 High Demand E.g. 12 Sold This Week" },
              { id: "GI-4419", name: "Mustard Yellow Cotton Ikat", vendor: "Pata Weaver Group", price: "₹ 5,499", img: "/bhulia-hero.png", ticket: "✨ Handspun Cotton E.g. Organic Dye" }
            ].map((item, idx) => (
              <div key={idx} className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#C5A059] transition-all duration-300 shadow-xl p-0.5">
                <div className="relative w-full h-48 sm:h-64 overflow-hidden bg-[#0B2B26] rounded-t-xl">
                  <Image src={item.img} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-2.5 right-2.5 bg-[#0B2B26]/80 backdrop-blur-md px-2 py-0.5 rounded border border-[#C5A059]/40 text-[9px] font-mono text-[#C5A059] font-bold">
                    {item.id}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0B2B26] to-transparent p-3 pt-8">
                    <p className="text-[9px] text-[#C5A059] uppercase tracking-widest font-bold">Sold by: {item.vendor}</p>
                  </div>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-[#C5A059] transition-colors mb-0.5 leading-tight line-clamp-1">{item.name}</h4>
                    <p className="text-base font-serif font-bold text-[#C5A059]">{item.price}</p>
                  </div>

                  {/* Social Share Affiliate Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#C5A059]/20">
                    <button onClick={() => handleSocialShare("whatsapp", item.name)} className="flex items-center justify-center gap-1 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                      <span>📲 Share</span>
                    </button>
                    <button onClick={() => handleSocialShare("facebook", item.name)} className="flex items-center justify-center gap-1 py-1.5 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                      <span>📘 Share</span>
                    </button>
                  </div>

                  <Link href={`/product/${encodeURIComponent(item.name.toLowerCase().replace(/\s+/g, "-"))}`} className="bhulia-gold-button w-full py-2 text-[#0A1021] font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition-all shadow-md text-center block">
                    View Details
                  </Link>
                </div>

                {/* Bottom Ticket */}
                <div className="bg-[#0A2520] px-3 py-1.5 border-t border-[#C5A059]/20 text-[9px] font-mono text-gray-300 flex items-center justify-center gap-1 text-center leading-tight">
                  <span className="truncate">{item.ticket}</span>
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
              Every purchase on Bhulia Hub directly funds the master weavers of Bargarh, Sonepur, and Boudh, eliminating predatory middlemen and ensuring 100% transparent wage escrow.
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
              <h3 className="text-xl md:text-3xl font-serif text-[#C5A059] font-bold tracking-wider">Pata Sambalpuri Sarees (Pure Silk)</h3>
              <p className="text-[10px] md:text-xs text-gray-300 uppercase tracking-widest mt-1 font-semibold">Exquisite Mulberry & Tussar silk masterpieces for weddings and royal connoisseurs</p>
            </div>
            <button className="hidden sm:block px-4 py-2 bg-[#0B2B26] border border-[#C5A059]/40 hover:border-[#C5A059] text-[#C5A059] text-xs font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer">
              View All Silk
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
            {[
              { id: "GI-9921", name: "Royal Crimson Pata Silk", vendor: "Pata Weaver Group", price: "₹ 14,899", img: "/bhulia-hero.png", ticket: "✨ Silk Mark Gold E.g. 3ply Mulberry Yarn" },
              { id: "GI-9832", name: "Midnight Blue Silk Pasapalli", vendor: "Maa Samaleswari Handlooms", price: "₹ 16,299", img: "/bhulia-hero.png", ticket: "🛡️ 100% GI-Tag Verified E.g. Sonepur Loom" },
              { id: "GI-9743", name: "Bridal Red & Gold Silk Bomkai", vendor: "Maa Samaleswari Handlooms", price: "₹ 18,899", img: "/bhulia-hero.png", ticket: "👁️ 24 Connoisseurs Viewing E.g. 1 Left" },
              { id: "GI-9654", name: "Peacock Green Silk Bandha", vendor: "Maa Samaleswari Handlooms", price: "₹ 15,999", img: "/bhulia-hero.png", ticket: "🔥 High Demand E.g. 8 Sold This Week" },
              { id: "GI-9565", name: "Pure Tussar Silk Ikat Saree", vendor: "Pata Weaver Group", price: "₹ 17,499", img: "/bhulia-hero.png", ticket: "⏱️ Weaving Ends in 2 Days E.g. Reserve" }
            ].map((item, idx) => (
              <div key={idx} className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#C5A059] transition-all duration-300 shadow-xl p-0.5">
                <div className="relative w-full h-48 sm:h-64 overflow-hidden bg-[#0B2B26] rounded-t-xl">
                  <Image src={item.img} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-2.5 right-2.5 bg-[#0B2B26]/80 backdrop-blur-md px-2 py-0.5 rounded border border-[#C5A059]/40 text-[9px] font-mono text-[#C5A059] font-bold">
                    {item.id}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0B2B26] to-transparent p-3 pt-8">
                    <p className="text-[9px] text-[#C5A059] uppercase tracking-widest font-bold">Sold by: {item.vendor}</p>
                  </div>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-[#C5A059] transition-colors mb-0.5 leading-tight line-clamp-1">{item.name}</h4>
                    <p className="text-base font-serif font-bold text-[#C5A059]">{item.price}</p>
                  </div>

                  {/* Social Share Affiliate Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#C5A059]/20">
                    <button onClick={() => handleSocialShare("whatsapp", item.name)} className="flex items-center justify-center gap-1 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                      <span>📲 Share</span>
                    </button>
                    <button onClick={() => handleSocialShare("facebook", item.name)} className="flex items-center justify-center gap-1 py-1.5 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                      <span>📘 Share</span>
                    </button>
                  </div>

                  <Link href={`/product/${encodeURIComponent(item.name.toLowerCase().replace(/\s+/g, "-"))}`} className="bhulia-gold-button w-full py-2 text-[#0A1021] font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition-all shadow-md text-center block">
                    View Details
                  </Link>
                </div>

                {/* Bottom Ticket */}
                <div className="bg-[#0A2520] px-3 py-1.5 border-t border-[#C5A059]/20 text-[9px] font-mono text-gray-300 flex items-center justify-center gap-1 text-center leading-tight">
                  <span className="truncate">{item.ticket}</span>
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
              <span>100% Silk Mark & GI-Tag Escrow Protection</span>
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
              <h3 className="text-xl md:text-3xl font-serif text-[#C5A059] font-bold tracking-wider">Cotton Bomkai</h3>
              <p className="text-[10px] md:text-xs text-gray-300 uppercase tracking-widest mt-1 font-semibold">Intricate extra-weft thread work on comfortable cotton bases</p>
            </div>
            <button className="hidden sm:block px-4 py-2 bg-[#0B2B26] border border-[#C5A059]/40 hover:border-[#C5A059] text-[#C5A059] text-xs font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer">
              View All Bomkai
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
            {[
              { id: "GI-8812", name: "Yellow & Red Cotton Bomkai", vendor: "Maa Samaleswari Handlooms", price: "₹ 5,699", img: "/bhulia-hero.png", ticket: "🔥 High Demand E.g. 14 Sold This Week" },
              { id: "GI-8823", name: "Forest Green Cotton Bomkai", vendor: "Pata Weaver Group", price: "₹ 5,899", img: "/bhulia-hero.png", ticket: "🛡️ 100% GI-Tag Verified E.g. Bargarh Loom" },
              { id: "GI-8834", name: "Black & Gold Cotton Bomkai", vendor: "Maa Samaleswari Handlooms", price: "₹ 6,299", img: "/bhulia-hero.png", ticket: "👁️ 15 Connoisseurs Viewing E.g. 2 Left" },
              { id: "GI-8845", name: "Maroon Tribal Border Bomkai", vendor: "Pata Weaver Group", price: "₹ 5,999", img: "/bhulia-hero.png", ticket: "✨ Extra-Weft Border E.g. Pure Cotton" },
              { id: "GI-8856", name: "Orange & Black Cotton Bomkai", vendor: "Maa Samaleswari Handlooms", price: "₹ 5,499", img: "/bhulia-hero.png", ticket: "⏱️ Weaving Ends in 4 Days E.g. Reserve" }
            ].map((item, idx) => (
              <div key={idx} className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#C5A059] transition-all duration-300 shadow-xl p-0.5">
                <div className="relative w-full h-48 sm:h-64 overflow-hidden bg-[#0B2B26] rounded-t-xl">
                  <Image src={item.img} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-2.5 right-2.5 bg-[#0B2B26]/80 backdrop-blur-md px-2 py-0.5 rounded border border-[#C5A059]/40 text-[9px] font-mono text-[#C5A059] font-bold">
                    {item.id}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0B2B26] to-transparent p-3 pt-8">
                    <p className="text-[9px] text-[#C5A059] uppercase tracking-widest font-bold">Sold by: {item.vendor}</p>
                  </div>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-[#C5A059] transition-colors mb-0.5 leading-tight line-clamp-1">{item.name}</h4>
                    <p className="text-base font-serif font-bold text-[#C5A059]">{item.price}</p>
                  </div>

                  {/* Social Share Affiliate Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#C5A059]/20">
                    <button onClick={() => handleSocialShare("whatsapp", item.name)} className="flex items-center justify-center gap-1 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                      <span>📲 Share</span>
                    </button>
                    <button onClick={() => handleSocialShare("facebook", item.name)} className="flex items-center justify-center gap-1 py-1.5 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                      <span>📘 Share</span>
                    </button>
                  </div>

                  <Link href={`/product/${encodeURIComponent(item.name.toLowerCase().replace(/\s+/g, "-"))}`} className="bhulia-gold-button w-full py-2 text-[#0A1021] font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition-all shadow-md text-center block">
                    View Details
                  </Link>
                </div>

                {/* Bottom Ticket */}
                <div className="bg-[#0A2520] px-3 py-1.5 border-t border-[#C5A059]/20 text-[9px] font-mono text-gray-300 flex items-center justify-center gap-1.5 text-center leading-tight">
                  <span className="truncate">{item.ticket}</span>
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
              <h3 className="text-xl md:text-2xl font-serif text-[#C5A059] font-bold tracking-wider mb-1">Explore by Category</h3>
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

      </div>

      {/* 7. Global Ecosystem Continuous Footer Bar */}
      <footer className="w-full bg-[#051815] border-t border-[#C5A059]/40 text-white py-8 px-6 z-50 relative shadow-[0_-4_30px_rgba(0,0,0,0.6)] mt-auto font-sans">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-6 md:gap-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#C5A059]/20 pb-4 md:pb-6">
            <div>
              <h3 className="text-lg font-serif font-bold tracking-widest text-[#C5A059] uppercase mb-1">Shyam Dash Global Network</h3>
              <p className="text-xs text-gray-300 uppercase tracking-widest">Continuous Global Ecosystem Menu E.g. Trust • Heritage • Innovation • Future</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-gray-300">Ecosystem Status:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                All 4 Hub Nodes Operational
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 border-b border-[#C5A059]/20 pb-6 md:pb-8">
            
            {/* Hub 1: Gold Hub */}
            <div className="bg-[#0A3A35] border border-[#C5A059]/30 rounded-2xl p-5 flex flex-col justify-between hover:border-[#C5A059] transition-all group shadow-lg">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono font-bold text-[#C5A059] bg-[#C5A059]/20 px-2.5 py-1 rounded border border-[#C5A059]/30">HUB 01</span>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-[#C5A059] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </div>
                <h4 className="text-base font-serif font-bold text-white mb-2 group-hover:text-[#C5A059] transition-colors">shyamdash.com</h4>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">Our flagship Productive Luxury Gold Jewelry Marketplace. Featuring live MCX tickers & Sequel Armored transit.</p>
              </div>
              <a href="https://sd-gold-hub.vercel.app" className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C5A059] hover:text-white transition-colors">
                Explore Gold Hub →
              </a>
            </div>

            {/* Hub 2: Bhulia Hub (Active) */}
            <div className="bg-[#0D4B45] border-2 border-[#C5A059] rounded-2xl p-5 flex flex-col justify-between shadow-[0_0_25px_rgba(197,160,89,0.3)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#C5A059]/20 rounded-full blur-2xl pointer-events-none"></div>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono font-bold text-[#C5A059] bg-[#C5A059]/30 px-2.5 py-1 rounded border border-[#C5A059]">ACTIVE HUB</span>
                  <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse"></span>
                </div>
                <h4 className="text-base font-serif font-bold text-[#C5A059] mb-2">bhulia.com</h4>
                <p className="text-xs text-gray-200 leading-relaxed font-sans">Our sovereign Sambalpuri Saree & Handloom Collective. Direct artisan empowerment & GI-Tag verification.</p>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-300">
                Currently Exploring
              </div>
            </div>

            {/* Hub 3: Dehapa Hub */}
            <div className="bg-[#0A3A35] border border-[#C5A059]/30 rounded-2xl p-5 flex flex-col justify-between hover:border-cyan-400 transition-all group shadow-lg">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/20 px-2.5 py-1 rounded border border-cyan-500/30">HUB 03</span>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-cyan-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </div>
                <h4 className="text-base font-serif font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">dehapa.com</h4>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">Our Medplum-powered Healthcare Operating System. Providing world-class telemedicine & secure patient portals.</p>
              </div>
              <a href="https://sd-dehapa-hub.vercel.app" className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-300 hover:text-white transition-colors">
                Explore Health Hub →
              </a>
            </div>

            {/* Hub 4: IT Hub */}
            <div className="bg-[#0A3A35] border border-[#C5A059]/30 rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-400 transition-all group shadow-lg">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded border border-indigo-500/30">HUB 04</span>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </div>
                <h4 className="text-base font-serif font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">SD IT Hub</h4>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">Our Enterprise SaaS & Technology Infrastructure Division. Automated Stripe billing & Support OS ticketing.</p>
              </div>
              <a href="https://sd-it-hub.vercel.app" className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-300 hover:text-white transition-colors">
                Explore IT Hub →
              </a>
            </div>

          </div>

          {/* Bottom Section: Gold Hub Corporate Footer Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2 pb-4">
            
            {/* Col 1: Branding & Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#C5A059] shrink-0">
                  <Image src="/bhulia_logo_final.jpg" alt="Bhulia Logo" fill className="object-cover" />
                </div>
                <div>
                  <h4 className="text-lg font-serif font-bold text-[#C5A059] leading-none">Shyam Dash</h4>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">India's Verified Handloom Marketplace.</p>
                </div>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                The premier luxury marketplace for authenticated, GI-Tagged Sambalpuri handlooms. Partnering exclusively with master weavers and primary cooperative societies across India.
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">Quick Links</h4>
              <ul className="space-y-2.5 text-xs text-gray-300">
                <li><Link href="/maa-samaleswari-weavers" className="hover:text-[#C5A059] transition-colors">Our Weaver Network</Link></li>
                <li><Link href="/bhagabata-meher" className="hover:text-[#C5A059] transition-colors">Verify GI-Tag Certificate</Link></li>
                <li><Link href="/" className="hover:text-[#C5A059] transition-colors">Live Silk & Yarn Rates</Link></li>
                <li><Link href="/" className="hover:text-[#C5A059] transition-colors">SD Digital Services</Link></li>
              </ul>
            </div>

            {/* Col 3: Customer Care */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">Customer Care</h4>
              <ul className="space-y-2.5 text-xs text-gray-300">
                <li><a href="#" className="hover:text-[#C5A059] transition-colors">Artisan Escrow Guide</a></li>
                <li><a href="#" className="hover:text-[#C5A059] transition-colors">Secure BVC Armored Transit</a></li>
                <li><a href="#" className="hover:text-[#C5A059] transition-colors">Platform Return Policy</a></li>
                <li><a href="#" className="hover:text-[#C5A059] transition-colors">24/7 Concierge Support</a></li>
              </ul>
            </div>

            {/* Col 4: Stay Updated (Newsletter) */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">Stay Updated</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Subscribe for daily live silk rates, artisan drop announcements, and exclusive GI collection releases.
              </p>
              <div className="flex items-center gap-2 bg-[#0B2B26] border border-[#C5A059]/40 rounded-xl p-1.5 shadow-inner">
                <input type="email" placeholder="Email Address" className="w-full bg-transparent px-3 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none" />
                <button className="bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_15px_rgba(197,160,89,0.3)] shrink-0 cursor-pointer">
                  Join
                </button>
              </div>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-[#C5A059]/20 text-xs text-gray-400 font-mono">
            <p>© 2026 Shyam Dash Creation. All sovereign rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#C5A059] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#C5A059] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#C5A059] transition-colors">GI Registry Clearance</a>
            </div>
          </div>

        </div>
      </footer>

    </main>
  );
}
