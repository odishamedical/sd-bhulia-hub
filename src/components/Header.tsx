"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import UserMenu from "./UserMenu";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import CartDrawer from "./CartDrawer";

export default function Header() {
  const { user, loginWithGoogle } = useAuth();
  const { cartCount, walletBalance } = useCart();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Hide the global public header on the dashboard page so we don't get double headers
  if (pathname?.startsWith("/franchise/dashboard") || pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <>
      {/* Top Sticky Header */}
      <header className="sticky top-0 w-full z-50 bg-[#0074E4] border-b border-[#0052A3] shadow-[0_10px_30px_-10px_rgba(0,116,228,0.4)] flex flex-col transition-all duration-300">
        <div className="flex justify-between items-center gap-2 w-full px-4 sm:px-6 py-4 sm:py-6">
          {/* Left Side: Gold Logo, Bhulia.com & Slogan */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
            <div className="relative w-10 sm:w-16 h-10 sm:h-16 rounded-full overflow-hidden border border-[#C5A059] sm:border-2 shadow-[0_0_20px_rgba(197,160,89,0.6)] shrink-0">
              <Image src="/bhulia_logo_final.jpg" alt="Bhulia Gold Logo" fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-sans font-black tracking-tight text-white leading-none">Bhulia.com</h1>
              <p className="hidden sm:block text-[9px] text-[#C5A059] font-black tracking-[0.3em] uppercase mt-1.5 truncate drop-shadow-sm">AUTHENTIC HANDLOOMS • DIRECT FROM WEAVERS</p>
            </div>
          </div>

          {/* Center: Dedicated Navigation Links */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-4 text-[10px] font-extrabold uppercase tracking-[0.15em] text-white whitespace-nowrap">
            <Link href="/" className="hover:bg-white/20 px-4 py-2 rounded-full transition-all">HOME</Link>
            
            <div className="relative group">
              <button className="flex items-center gap-1 hover:bg-white/20 px-4 py-2 rounded-full transition-all cursor-pointer">
                <span>PRODUCTS</span>
                <span className="text-[10px]">▼</span>
              </button>
              
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[400px] bg-[#0A1128]/95 backdrop-blur-xl border border-[#C5A059]/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-5 px-6 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-50 flex gap-6 text-left normal-case tracking-normal">
                
                {/* By Material */}
                <div className="flex-1 space-y-3">
                  <h3 className="text-[#C5A059] border-b border-[#C5A059]/20 pb-2 text-[10px] uppercase tracking-widest font-bold">By Material</h3>
                  <div className="flex flex-col gap-3">
                    <Link href="/search?category=Pure Silk Pata" className="text-xs text-gray-300 hover:text-white hover:translate-x-1 transition-transform">Pure Silk (Pata)</Link>
                    <Link href="/search?category=Pure Cotton" className="text-xs text-gray-300 hover:text-white hover:translate-x-1 transition-transform">Pure Cotton</Link>
                    <Link href="/search?category=Mix Blends" className="text-xs text-gray-300 hover:text-white hover:translate-x-1 transition-transform">Mix Blends</Link>
                  </div>
                </div>

                {/* By Design */}
                <div className="flex-1 space-y-3 border-l border-[#C5A059]/10 pl-6">
                  <h3 className="text-[#C5A059] border-b border-[#C5A059]/20 pb-2 text-[10px] uppercase tracking-widest font-bold">By Design</h3>
                  <div className="flex flex-col gap-3">
                    <Link href="/search?category=Sambalpuri Ikat" className="text-xs text-gray-300 hover:text-white hover:translate-x-1 transition-transform">Sambalpuri Ikat</Link>
                    <Link href="/search?category=Pasapalli" className="text-xs text-gray-300 hover:text-white hover:translate-x-1 transition-transform">Pasapalli Double Ikat</Link>
                    <Link href="/search?category=Bomkai" className="text-xs text-gray-300 hover:text-white hover:translate-x-1 transition-transform">Bomkai</Link>
                  </div>
                </div>

              </div>
            </div>

            <Link href="/#weaver-boutiques" className="hover:bg-white/20 px-4 py-2 rounded-full transition-all">PARTNERS</Link>
            
            <div className="relative group">
              <button className="flex items-center gap-1 hover:bg-white/20 px-4 py-2 rounded-full transition-all cursor-pointer">
                <span>ABOUT US</span>
                <span className="text-[10px]">▼</span>
              </button>
              
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[220px] bg-[#0A1128]/95 backdrop-blur-xl border border-[#C5A059]/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-3 px-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-50 flex flex-col gap-3 text-left normal-case tracking-normal">
                <Link href="/" className="text-xs text-gray-300 hover:text-white hover:translate-x-1 transition-transform">About Us</Link>
                <Link href="/" className="text-xs text-gray-300 hover:text-white hover:translate-x-1 transition-transform">Contact Us</Link>
                <Link href="/" className="text-xs text-gray-300 hover:text-white hover:translate-x-1 transition-transform">About Our Products</Link>
                <Link href="/" className="text-xs text-gray-300 hover:text-white hover:translate-x-1 transition-transform">Our Privacy Policy</Link>
              </div>
            </div>
          </nav>

          {/* Right Side: User Menu / Sign In / Register (Desktop) & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <UserMenu />

            {/* Desktop Sign In / Register Button (Visible when logged out) */}
            {!user && (
              <button onClick={() => loginWithGoogle()} className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow cursor-pointer hover:brightness-110 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                <span>Sign In</span>
              </button>
            )}

            {/* Wallet & Cart Button */}
            {user && (
              <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-inner">
                <span className="text-[10px] uppercase text-gray-300">Wallet</span>
                <span className="text-white">₹{walletBalance.toLocaleString()}</span>
              </div>
            )}
            
            <Link href="/search" className="hidden sm:flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all cursor-pointer shrink-0 shadow">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </Link>

            <button onClick={() => setIsCartOpen(true)} className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all cursor-pointer shrink-0 shadow">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              <span>Cart ({cartCount})</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="lg:hidden flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all cursor-pointer shrink-0 shadow">
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

        {/* Scrolling SEO Ticker */}
        <div className="w-full bg-[#051815] py-1.5 overflow-hidden flex border-t border-[#C5A059]/20">
          <div className="whitespace-nowrap animate-marquee flex gap-16 text-[10px] sm:text-xs text-white/90 font-medium tracking-[0.2em] uppercase shrink-0 min-w-full">
            <span>BHULIA.COM - AUTHENTIC SAMBALPURI SAREES DIRECT FROM WEAVERS</span>
            <span>PURE SILK PATA • COTTON IKAT • BOMKAI • PASAPALLI</span>
            <span>SAMBALPURI PRODUCTS APPROVED FOR GI TAG</span>
            <span>BHULIA.COM - AUTHENTIC SAMBALPURI SAREES DIRECT FROM WEAVERS</span>
            <span>PURE SILK PATA • COTTON IKAT • BOMKAI • PASAPALLI</span>
            <span>SAMBALPURI PRODUCTS APPROVED FOR GI TAG</span>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer Overlay */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileNavOpen(false)}
          ></div>
          
          {/* Drawer (Slide in from Left) */}
          <div className="relative w-4/5 max-w-sm bg-[#051815] h-full flex flex-col shadow-2xl border-r border-[#C5A059]/30 animate-[slideInLeft_0.3s_ease-out]">
            {/* Top Section: User Profile or Sign In */}
            <div className="p-6 border-b border-[#C5A059]/20 bg-gradient-to-b from-[#0B2B26] to-[#051815]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[#C5A059] font-serif font-bold text-xl tracking-wider">BHULIA.COM</h2>
                <button onClick={() => setMobileNavOpen(false)} className="text-gray-400 hover:text-white p-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              {user ? (
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-12 h-12 rounded-full border-2 border-[#C5A059] object-cover shadow-lg" />
                  ) : (
                    <div className="w-12 h-12 rounded-full border-2 border-[#C5A059] bg-[#0A3A35] flex items-center justify-center text-[#C5A059] font-bold text-lg shadow-lg">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-bold text-sm">{user.displayName || "User"}</p>
                    <p className="text-gray-400 text-xs truncate max-w-[150px]">{user.email}</p>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setMobileNavOpen(false); loginWithGoogle(); }} className="w-full bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center shadow-lg">
                  Sign In / Register
                </button>
              )}
            </div>

            {/* Middle Section: Categorized Links */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest border-b border-[#C5A059]/10 pb-2">Collections</h3>
                <Link href="/search?category=Cotton Classics" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 text-sm font-bold text-gray-200 hover:text-[#C5A059] transition-colors">
                  <span className="w-2 h-2 rounded-full bg-[#C5A059]/50"></span> Cotton Sambalpuri
                </Link>
                <Link href="/search?category=Silk Masterpieces" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 text-sm font-bold text-gray-200 hover:text-[#C5A059] transition-colors">
                  <span className="w-2 h-2 rounded-full bg-[#C5A059]/50"></span> Pata Sambalpuri (Silk)
                </Link>
                <Link href="/search?design=Bomkai" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 text-sm font-bold text-gray-200 hover:text-[#C5A059] transition-colors">
                  <span className="w-2 h-2 rounded-full bg-[#C5A059]/50"></span> Cotton Bomkai
                </Link>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest border-b border-[#C5A059]/10 pb-2">Discover</h3>
                <Link href="/search" onClick={() => setMobileNavOpen(false)} className="block text-sm font-bold text-gray-200 hover:text-[#C5A059] transition-colors">Search All Products</Link>
                <Link href="/#weaver-boutiques" onClick={() => setMobileNavOpen(false)} className="block text-sm font-bold text-gray-200 hover:text-[#C5A059] transition-colors">Weaver Boutiques</Link>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest border-b border-[#C5A059]/10 pb-2">Support</h3>
                <Link href="/" onClick={() => setMobileNavOpen(false)} className="block text-sm font-bold text-gray-200 hover:text-[#C5A059] transition-colors">About Us</Link>
                <Link href="/" onClick={() => setMobileNavOpen(false)} className="block text-sm font-bold text-gray-200 hover:text-[#C5A059] transition-colors">Contact Us</Link>
              </div>
            </div>

            {/* Bottom Section: Account Management */}
            {user && (
              <div className="p-6 border-t border-[#C5A059]/20 bg-[#0A1021]/50 space-y-4">
                <Link href="/dashboard" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 text-sm font-bold text-[#C5A059]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  My Dashboard
                </Link>
                <button onClick={() => { setMobileNavOpen(false); /* sign out logic usually in UserMenu */ }} className="flex items-center gap-3 text-sm font-bold text-gray-400 hover:text-red-400 transition-colors w-full text-left">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart Drawer Overlay */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
