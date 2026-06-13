"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import UserMenu from "./UserMenu";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import CartDrawer from "./CartDrawer";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop Sarees", href: "/search" },
  { label: "Directory", href: "/directory" },
  { label: "About Us", href: "/p/about-us" }
];

export default function Header() {
  const { user, loginWithGoogle } = useAuth();
  const { cartCount, walletBalance } = useCart();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Mobile UI State for Collapsible Menus
  const [openMobileMenus, setOpenMobileMenus] = useState<Record<string, boolean>>({});

  const router = useRouter();
  const pathname = usePathname();

  // Hide the global public header on the dashboard page so we don't get double headers
  if (pathname?.startsWith("/franchise/dashboard") || pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard")) {
    return null;
  }

  const toggleMobileMenu = (label: string) => {
    setOpenMobileMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  return (
    <>
      {/* Top Sticky Header */}
      <header className="sticky top-0 w-full z-50 bg-[#6B1D2F] border-b border-[#4A1020] shadow-xl flex flex-col transition-all duration-300">
        <div className="flex justify-between items-center gap-2 w-full px-4 sm:px-6 py-2 sm:py-3">
          {/* Left Side: Gold Logo, Bhulia.com & Slogan */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0 cursor-pointer hover:opacity-90 transition-opacity">
            <div className="relative w-10 sm:w-14 h-10 sm:h-14 rounded-full overflow-hidden shadow-[0_0_20px_rgba(197,160,89,0.4)] shrink-0 bg-[#0B2B26]">
              <Image src="/logo.png" alt="Bhulia Gold Logo" fill className="object-cover scale-[1.15]" />
            </div>
            <div className="min-w-0 flex flex-col items-stretch">
              <h1 className="text-xl sm:text-2xl font-serif font-black tracking-wider text-[#C5A059] leading-none">Bhulia.com</h1>
              <div className="hidden sm:block text-[8px] sm:text-[9px] text-white/80 font-semibold uppercase mt-1 tracking-widest text-center">
                SAMBALPURI HANDLOOM MARKETPLACE
              </div>
            </div>
          </Link>

          {/* Center: Dedicated Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-4 text-sm font-semibold tracking-wide text-white whitespace-nowrap">
            {NAV_LINKS.map((navItem, index) => (
              <Link key={index} href={navItem.href!} className="px-4 py-2 rounded-lg hover:bg-[#0A2B26] hover:text-[#C5A059] transition-all border border-transparent hover:border-[#C5A059]/30">
                {navItem.label}
              </Link>
            ))}
          </nav>

          {/* Right Side: User Menu & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <UserMenu />

            {/* Desktop Sign In Button */}
            {!user && (
              <button onClick={() => router.push('/login')} className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow cursor-pointer hover:brightness-110 transition-all">
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

        {/* Golden Texture Border */}
        <div className="w-full h-1.5 sm:h-2 bg-gradient-to-r from-[#8B5A2B] via-[#D4AF37] to-[#8B5A2B] opacity-90 shadow-[0_2px_4px_rgba(0,0,0,0.3)] border-b border-[#5C3A21]"></div>

        {/* Scrolling SEO Ticker */}
        <div className="w-full bg-[#051815] py-1.5 overflow-hidden flex border-t border-[#C5A059]/20">
          <div className="whitespace-nowrap animate-marquee flex gap-16 text-[10px] sm:text-xs text-white/90 font-medium tracking-[0.2em] uppercase shrink-0 min-w-full">
            <span>BHULIA.COM - AUTHENTIC SAMBALPURI SAREES DIRECT FROM WEAVERS</span>
            <span>PURE SILK PATA • COTTON IKAT • BOMKAI • PASAPALLI</span>
            <span>BHULIA.COM VERIFIED SAMBALPURI PRODUCTS</span>
            <span>BHULIA.COM - AUTHENTIC SAMBALPURI SAREES DIRECT FROM WEAVERS</span>
            <span>PURE SILK PATA • COTTON IKAT • BOMKAI • PASAPALLI</span>
            <span>BHULIA.COM VERIFIED SAMBALPURI PRODUCTS</span>
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
                <button onClick={() => { setMobileNavOpen(false); router.push('/login'); }} className="w-full bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center shadow-lg">
                  Sign In / Register
                </button>
              )}
            </div>

            {/* Middle Section: Categorized Links from NAV_LINKS */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {NAV_LINKS.map((navItem, index) => (
                <Link key={index} href={navItem.href!} onClick={() => setMobileNavOpen(false)} className="block px-4 py-3 text-sm font-bold text-gray-200 hover:bg-white/5 hover:text-[#C5A059] rounded-xl transition-colors uppercase tracking-widest">
                  {navItem.label}
                </Link>
              ))}
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
