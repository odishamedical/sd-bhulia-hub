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
            <Link href="/" className="hover:text-[#C5A059] transition-colors pb-1">Home</Link>
            <div className="relative group py-1">
              <button className="flex items-center gap-1 hover:text-[#C5A059] transition-colors cursor-pointer">
                <span>Products</span>
                <span className="text-[10px]">▼</span>
              </button>
              <div className="absolute top-full left-0 mt-2 w-56 bg-[#0D3630] border border-[#C5A059]/40 rounded-xl shadow-2xl py-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-50">
                <Link href="/#cotton-sambalpuri" className="block px-4 py-2 text-xs hover:bg-[#0B2B26] hover:text-[#C5A059]">Cotton Sambalpuri</Link>
                <Link href="/#pata-sambalpuri" className="block px-4 py-2 text-xs hover:bg-[#0B2B26] hover:text-[#C5A059]">Pata Sambalpuri (Silk)</Link>
                <Link href="/#cotton-bomkai" className="block px-4 py-2 text-xs hover:bg-[#0B2B26] hover:text-[#C5A059]">Cotton Bomkai</Link>
              </div>
            </div>
            <Link href="/#weaver-boutiques" className="hover:text-[#C5A059] transition-colors pb-1">Weaver Boutiques</Link>
            <Link href="/search" className="hover:text-[#C5A059] transition-colors pb-1 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> Search</Link>
            <Link href="/" className="hover:text-[#C5A059] transition-colors pb-1">About Us</Link>
            <Link href="/" className="hover:text-[#C5A059] transition-colors pb-1">Contact Us</Link>
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
              <div className="hidden sm:flex items-center gap-2 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] px-4 py-2 rounded-xl font-bold text-xs shadow-inner">
                <span className="text-[10px] uppercase text-gray-400">Wallet</span>
                <span className="text-white">₹{walletBalance.toLocaleString()}</span>
              </div>
            )}
            
            <Link href="/search" className="hidden sm:flex items-center justify-center w-10 h-10 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] rounded-xl hover:bg-[#0D4B45] transition-all cursor-pointer shrink-0 shadow">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </Link>

            <button onClick={() => setIsCartOpen(true)} className="hidden sm:flex items-center gap-2 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#0D4B45] transition-all cursor-pointer shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              <span>Cart ({cartCount})</span>
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
                <Link href="/#cotton-sambalpuri" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] block py-1">Cotton Sambalpuri</Link>
                <Link href="/#pata-sambalpuri" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] block py-1">Pata Sambalpuri (Silk)</Link>
                <Link href="/#cotton-bomkai" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] block py-1">Cotton Bomkai</Link>
              </div>
            </div>
            <Link href="/#weaver-boutiques" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] block py-2 border-b border-[#C5A059]/20">Weaver Boutiques</Link>
            <Link href="/search" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] block py-2 border-b border-[#C5A059]/20 flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> Search Collections</Link>
            <Link href="/" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] block py-2 border-b border-[#C5A059]/20">About Us</Link>
            <Link href="/" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] block py-2 border-b border-[#C5A059]/20">Contact Us</Link>
            
            <div className="pt-2 flex flex-col gap-3">
              {!user && (
                <button onClick={() => { setMobileNavOpen(false); loginWithGoogle(); }} className="w-full bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center">
                  Sign In
                </button>
              )}
              <button onClick={() => { setMobileNavOpen(false); setIsCartOpen(true); }} className="w-full bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center">
                Cart ({cartCount})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer Overlay */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
