"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const email = localStorage.getItem("sd_current_user_email");
      const name = localStorage.getItem("sd_current_user_name");
      const avatar = localStorage.getItem("sd_current_user_avatar");
      const role = localStorage.getItem("sd_current_user_role");

      if (email) {
        setUserName(name || email.split("@")[0]);
        setUserAvatar(avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80");
        setUserRole(role || "user");
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

  return (
    <main className="relative min-h-screen bg-[#060A14] text-white overflow-hidden font-sans flex flex-col">
      
      {/* Background Glows & Texture */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C5A059 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#C5A059]/10 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#996515]/10 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* Top Header / Navigation Bar */}
      <header className="relative z-50 bg-[#0A1021]/90 backdrop-blur-md border-b border-[#C5A059]/30 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          {/* Round Gold-Carved Logo */}
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#C5A059] shadow-[0_0_15px_rgba(197,160,89,0.5)] shrink-0">
            <Image src="/bhulia_logo_final.jpg" alt="Bhulia Gold Logo" fill className="object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold tracking-wider text-[#C5A059] leading-none">Bhulia.com</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Authentic Handloom Collective | Multi-Vendor Marketplace</p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-300">
          <a href="#" className="text-[#C5A059] border-b-2 border-[#C5A059] pb-1">Home</a>
          <a href="#" className="hover:text-[#C5A059] transition-colors pb-1">Sarees</a>
          <a href="#" className="hover:text-[#C5A059] transition-colors pb-1">Dress Materials</a>
          <a href="#" className="hover:text-[#C5A059] transition-colors pb-1">Accessories</a>
        </nav>

        {/* Right Login Portals & Cart */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-[#141C33] border border-[#2A344A] p-1.5 rounded-xl shadow-inner">
            
            {/* User Account Portal */}
            {userAvatar ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0E1528] rounded-lg border border-[#C5A059]/50">
                <img src={userAvatar} alt="User Avatar" className="w-6 h-6 rounded-full border border-[#C5A059]" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-white leading-none">{userName}</span>
                  <span className="text-[8px] text-[#C5A059] uppercase tracking-widest">{userRole}</span>
                </div>
              </div>
            ) : (
              <a href="https://sd-auth-center.vercel.app" className="flex flex-col items-center px-4 py-1.5 hover:bg-[#0E1528] rounded-lg transition-colors border border-transparent hover:border-[#C5A059]/30 text-center">
                <svg className="w-4 h-4 text-[#C5A059] mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-tight">User Account<br/>/ Login</span>
              </a>
            )}

            {/* Weaver Portal Login */}
            <a href="https://sd-auth-center.vercel.app" className="flex flex-col items-center px-4 py-1.5 hover:bg-[#0E1528] rounded-lg transition-colors border border-transparent hover:border-[#C5A059]/30 text-center">
              <svg className="w-4 h-4 text-[#C5A059] mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-tight">Weaver Portal<br/>Login</span>
            </a>

            {/* Shop Owner / Admin Login */}
            <a href="https://sd-auth-center.vercel.app" className="flex flex-col items-center px-4 py-1.5 hover:bg-[#0E1528] rounded-lg transition-colors border border-transparent hover:border-[#C5A059]/30 text-center">
              <svg className="w-4 h-4 text-[#C5A059] mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-tight">Shop Owner<br/>/ Admin Login</span>
            </a>

          </div>

          {/* Cart Button */}
          <button className="flex items-center gap-2 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(197,160,89,0.3)] hover:brightness-110 transition-all shrink-0 cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            <span>Cart (2)</span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="flex-1 container mx-auto px-6 py-8 relative z-10 space-y-12">
        
        {/* 1. Hero Section E.g. Perfectly Aligned Height (Eliminating Yellow Border Gap) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Hero Banner E.g. Span 7 */}
          <div className="lg:col-span-7 bg-gradient-to-br from-[#141C33] via-[#0E1528] to-[#0A1021] border border-[#C5A059] rounded-3xl p-8 md:p-12 flex flex-col justify-between relative overflow-hidden shadow-[0_0_30px_rgba(197,160,89,0.15)] group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A059]/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
            
            <div className="relative z-10 space-y-6 max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] text-xs font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse"></span>
                <span>Odisha Handloom Sovereign Hub</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                Bhulia.com: <br />
                <span className="text-[#C5A059]">The Collective of Odisha's Master Weavers.</span>
              </h2>

              <p className="text-sm md:text-base text-gray-300 leading-relaxed font-sans">
                Direct access to thousands of authentic handloom artisans, primary weaving societies, and GI-Tag verified masterpieces from multiple tenant stores.
              </p>
            </div>

            <div className="relative z-10 pt-8 flex items-center gap-4">
              <button className="px-8 py-4 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_0_25px_rgba(197,160,89,0.4)] cursor-pointer">
                Shop the Collections
              </button>
              <button className="px-8 py-4 bg-[#141C33] border border-[#2A344A] hover:border-[#C5A059] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer">
                Explore Village Directory
              </button>
            </div>
          </div>

          {/* Two Side Cards E.g. Span 5 E.g. Perfectly Aligned to Match Hero Height */}
          <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Side Card 1: New Weaver Collective Arrivals */}
            <div className="bg-[#0E1528] border border-[#2A344A] rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group hover:border-[#C5A059]/50 transition-colors shadow-xl">
              <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-6 border border-[#2A344A] group-hover:border-[#C5A059]/30 transition-colors">
                <Image src="/bhulia-hero.png" alt="New Weaver Arrivals" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1528] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#C5A059] text-[#0A1021] text-[9px] font-bold uppercase tracking-widest rounded shadow">New Arrivals</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-serif font-bold text-white group-hover:text-[#C5A059] transition-colors">New Weaver Collective Arrivals</h3>
                <p className="text-xs text-gray-400 font-sans leading-relaxed">Discover fresh Mulberry Silk & Cotton Ikat weaves directly from Bargarh & Sonepur pit looms.</p>
              </div>
              <button className="w-full mt-4 py-3 bg-[#141C33] border border-[#2A344A] group-hover:border-[#C5A059] text-xs font-bold uppercase tracking-widest text-[#C5A059] rounded-xl transition-all cursor-pointer">
                Inspect Lot
              </button>
            </div>

            {/* Side Card 2: Meet Our Tenant Stores */}
            <div className="bg-[#0E1528] border border-[#2A344A] rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group hover:border-[#C5A059]/50 transition-colors shadow-xl">
              <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-6 border border-[#2A344A] group-hover:border-[#C5A059]/30 transition-colors">
                <Image src="/bhulia-hero.png" alt="Featured Artisans" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1528] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-blue-500 text-white text-[9px] font-bold uppercase tracking-widest rounded shadow">Tenant Stores</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-serif font-bold text-white group-hover:text-[#C5A059] transition-colors">Meet Our Tenant Stores: Featured Artisans</h3>
                <p className="text-xs text-gray-400 font-sans leading-relaxed">Explore verified Primary Weavers Cooperative Societies (PWCS) and award-winning master workshops.</p>
              </div>
              <button className="w-full mt-4 py-3 bg-[#141C33] border border-[#2A344A] group-hover:border-[#C5A059] text-xs font-bold uppercase tracking-widest text-[#C5A059] rounded-xl transition-all cursor-pointer">
                View Stores
              </button>
            </div>

          </div>

        </div>

        {/* Trust Badges Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0E1528] border border-[#2A344A] p-6 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-[#141C33] border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] text-xl shrink-0">🛡️</div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Authenticity Certified</h4>
              <p className="text-xs text-gray-400 mt-0.5">100% GI-Tag & Silk Mark verified across all stores.</p>
            </div>
          </div>
          <div className="bg-[#0E1528] border border-[#2A344A] p-6 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-[#141C33] border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] text-xl shrink-0">🚚</div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Free Insured Shipping</h4>
              <p className="text-xs text-gray-400 mt-0.5">BVC Armored delivery on all qualifying orders.</p>
            </div>
          </div>
          <div className="bg-[#0E1528] border border-[#2A344A] p-6 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-[#141C33] border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] text-xl shrink-0">🔄</div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Platform-Wide Easy Returns</h4>
              <p className="text-xs text-gray-400 mt-0.5">Hassle-free exchange & artisan escrow protection.</p>
            </div>
          </div>
        </div>

        {/* 2. Featured Products Grid (with Gold Hub Bottom Tickets) */}
        <div className="space-y-6 pt-6">
          <div className="flex justify-between items-end border-b border-[#2A344A] pb-4">
            <div>
              <h3 className="text-2xl font-serif text-[#C5A059] font-bold tracking-wider">Featured Masterpieces</h3>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Direct from the looms of Western Odisha</p>
            </div>
            <button className="px-4 py-2 bg-[#141C33] border border-[#2A344A] hover:border-[#C5A059] text-[#C5A059] text-xs font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer">
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { id: "GI-8492", name: "Red Ikat Saree", vendor: "Pata Weaver Group", price: "₹ 12,899", img: "/bhulia-hero.png", ticket: "👁️ 18 Connoisseurs Viewing E.g. 1 Saree Left" },
              { id: "GI-7738", name: "Blue Pasapalli Saree", vendor: "Maa Samaleswari Handlooms", price: "₹ 14,899", img: "/bhulia-hero.png", ticket: "🛡️ 100% GI-Tag Verified E.g. Barpali Loom" },
              { id: "GI-6639", name: "Black & Red Bomkai Saree", vendor: "Maa Samaleswari Handlooms", price: "₹ 16,899", img: "/bhulia-hero.png", ticket: "⏱️ Weaving Ends in 3 Days E.g. Reserve Now" },
              { id: "GI-5528", name: "Green Bandha Saree", vendor: "Maa Samaleswari Handlooms", price: "₹ 16,499", img: "/bhulia-hero.png", ticket: "🔥 High Demand E.g. 12 Sold This Week" },
              { id: "GI-4419", name: "Tussar Silk Ikat Saree", vendor: "Pata Weaver Group", price: "₹ 18,499", img: "/bhulia-hero.png", ticket: "✨ Silk Mark Gold E.g. Handspun Yarn" }
            ].map((item, idx) => (
              <div key={idx} className="bg-[#0E1528] border border-[#2A344A] rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#C5A059] transition-all duration-300 shadow-xl">
                <div className="relative w-full h-64 overflow-hidden bg-[#141C33]">
                  <Image src={item.img} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-3 right-3 bg-[#0A1021]/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-[#C5A059]/40 text-[9px] font-mono text-[#C5A059] font-bold">
                    {item.id}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0E1528] to-transparent p-4 pt-10">
                    <p className="text-[10px] text-[#C5A059] uppercase tracking-widest font-bold">Sold by: {item.vendor}</p>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="font-bold text-white text-base group-hover:text-[#C5A059] transition-colors mb-1">{item.name}</h4>
                    <p className="text-lg font-serif font-bold text-[#C5A059]">{item.price}</p>
                  </div>

                  <button className="w-full py-2.5 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition-all shadow-[0_0_15px_rgba(197,160,89,0.3)] cursor-pointer">
                    Add to Cart
                  </button>
                </div>

                {/* Bottom Ticket (Inherited from Gold Hub) */}
                <div className="bg-[#141C33] px-4 py-2.5 border-t border-[#2A344A] text-[10px] font-mono text-gray-300 flex items-center justify-center gap-1.5 text-center leading-tight">
                  <span className="truncate">{item.ticket}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Promotional Banner In Between Grid */}
        <div className="bg-gradient-to-r from-[#141C33] via-[#0E1528] to-[#141C33] border border-[#C5A059] rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-[0_0_40px_rgba(197,160,89,0.2)] flex flex-col md:flex-row items-center justify-between gap-8 group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C5A059]/10 via-transparent to-transparent pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
          
          <div className="space-y-4 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse"></span>
              <span>800 Years of Living Heritage</span>
            </div>
            
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight">
              Empowering Grassroots Artisans <br />
              <span className="text-[#C5A059]">Through Sovereign D2C & B2B Channels.</span>
            </h3>

            <p className="text-sm text-gray-300 font-sans leading-relaxed">
              Every purchase on Bhulia Hub directly funds the master weavers of Bargarh, Sonepur, and Boudh, eliminating predatory middlemen and ensuring 100% transparent wage escrow.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
            <button className="px-8 py-4 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_0_25px_rgba(197,160,89,0.4)] cursor-pointer">
              Commission B2B Lot
            </button>
            <button className="px-8 py-4 bg-[#141C33] border border-[#2A344A] hover:border-[#C5A059] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer">
              Explore Weaver Registry
            </button>
          </div>
        </div>

        {/* Explore by Category & Mission Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-6">
          
          {/* Explore by Category E.g. Span 5 */}
          <div className="lg:col-span-5 bg-[#0E1528] border border-[#2A344A] rounded-3xl p-8 flex flex-col justify-between shadow-xl space-y-6">
            <div>
              <h3 className="text-xl font-serif text-[#C5A059] font-bold tracking-wider mb-1">Explore by Category</h3>
              <p className="text-xs text-gray-400 uppercase tracking-widest">Curated collections of authentic weaves</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Sarees", img: "/bhulia-hero.png", count: "1,240+ Weaves" },
                { name: "Dress Materials", img: "/bhulia-hero.png", count: "450+ Sets" },
                { name: "Dupattas", img: "/bhulia-hero.png", count: "890+ Pieces" },
                { name: "Home Decor", img: "/bhulia-hero.png", count: "320+ Items" }
              ].map((cat, idx) => (
                <div key={idx} className="bg-[#141C33] border border-[#2A344A] rounded-2xl p-4 flex flex-col items-center text-center group hover:border-[#C5A059] transition-all cursor-pointer shadow">
                  <div className="w-16 h-16 rounded-full overflow-hidden relative mb-3 border border-[#C5A059]/40 group-hover:scale-110 transition-transform duration-500">
                    <Image src={cat.img} alt={cat.name} fill className="object-cover" />
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-[#C5A059] transition-colors">{cat.name}</h4>
                  <span className="text-[10px] text-gray-500 font-mono mt-0.5">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Our Mission Showcase E.g. Span 7 */}
          <div className="lg:col-span-7 bg-[#0E1528] border border-[#2A344A] rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden shadow-xl group">
            <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-50 transition-opacity duration-700">
              <Image src="/bhulia-hero.png" alt="Weaver Loom Mission" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0E1528] via-[#0E1528]/90 to-transparent"></div>
            </div>

            <div className="relative z-10 space-y-6 max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] text-xs font-bold uppercase tracking-widest">
                <span>Sustainable Craftsmanship</span>
              </div>
              
              <h3 className="text-3xl font-serif font-bold text-white leading-tight">
                Our Mission: Preserving a Legacy, <br />
                <span className="text-[#C5A059]">Supporting a Community.</span>
              </h3>

              <p className="text-sm text-gray-300 font-sans leading-relaxed">
                Bhulia.com provides a global stage for Odisha's artisan communities, connecting you directly to individual weaver stores. We are more than a store; we are a sustainable ecosystem for craftsmanship.
              </p>
            </div>

            <div className="relative z-10 pt-6">
              <button className="px-6 py-3 bg-[#141C33] border border-[#2A344A] hover:border-[#C5A059] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer">
                Read the Weaver's Story
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 4. Global Ecosystem Continuous Footer Bar */}
      <footer className="bg-[#060A14] border-t border-[#C5A059]/30 text-white py-12 px-6 z-50 relative shadow-[0_-4_25px_rgba(0,0,0,0.5)] mt-auto font-sans">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-10">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#2A344A] pb-10">
            <div>
              <h3 className="text-lg font-serif font-bold tracking-widest text-[#C5A059] uppercase mb-1">Shyam Dash Global Network</h3>
              <p className="text-xs text-gray-400 uppercase tracking-widest">Continuous Global Ecosystem Menu E.g. Trust • Heritage • Innovation • Future</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-gray-400">Ecosystem Status:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                All 4 Hub Nodes Operational
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Hub 1: Gold Hub */}
            <div className="bg-[#0E1528] border border-[#2A344A] rounded-2xl p-6 flex flex-col justify-between hover:border-[#C5A059] transition-all group shadow-lg">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono font-bold text-[#C5A059] bg-[#C5A059]/10 px-2.5 py-1 rounded border border-[#C5A059]/20">HUB 01</span>
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-[#C5A059] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </div>
                <h4 className="text-base font-serif font-bold text-white mb-2 group-hover:text-[#C5A059] transition-colors">shyamdash.com</h4>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">Our flagship Productive Luxury Gold Jewelry Marketplace. Featuring live MCX tickers & Sequel Armored transit.</p>
              </div>
              <a href="https://sd-gold-hub.vercel.app" className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C5A059] hover:text-white transition-colors">
                Explore Gold Hub →
              </a>
            </div>

            {/* Hub 2: Bhulia Hub (Active) */}
            <div className="bg-[#141C33] border-2 border-[#C5A059] rounded-2xl p-6 flex flex-col justify-between shadow-[0_0_20px_rgba(197,160,89,0.2)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#C5A059]/10 rounded-full blur-2xl pointer-events-none"></div>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono font-bold text-[#C5A059] bg-[#C5A059]/20 px-2.5 py-1 rounded border border-[#C5A059]">ACTIVE HUB</span>
                  <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse"></span>
                </div>
                <h4 className="text-base font-serif font-bold text-[#C5A059] mb-2">bhulia.com</h4>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">Our sovereign Sambalpuri Saree & Handloom Collective. Direct artisan empowerment & GI-Tag verification.</p>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                Currently Exploring
              </div>
            </div>

            {/* Hub 3: Dehapa Hub */}
            <div className="bg-[#0E1528] border border-[#2A344A] rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-500/50 transition-all group shadow-lg">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">HUB 03</span>
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </div>
                <h4 className="text-base font-serif font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">dehapa.com</h4>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">Our Medplum-powered Healthcare Operating System. Providing world-class telemedicine & secure patient portals.</p>
              </div>
              <a href="https://sd-dehapa-hub.vercel.app" className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400 hover:text-white transition-colors">
                Explore Health Hub →
              </a>
            </div>

            {/* Hub 4: IT Hub */}
            <div className="bg-[#0E1528] border border-[#2A344A] rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/50 transition-all group shadow-lg">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">HUB 04</span>
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </div>
                <h4 className="text-base font-serif font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">SD IT Hub</h4>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">Our Enterprise SaaS & Technology Infrastructure Division. Automated Stripe billing & Support OS ticketing.</p>
              </div>
              <a href="https://sd-it-hub.vercel.app" className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">
                Explore IT Hub →
              </a>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-[#2A344A] text-xs text-gray-500 font-mono">
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
