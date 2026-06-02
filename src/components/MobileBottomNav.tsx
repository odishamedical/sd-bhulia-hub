"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount } = useCart();

  // If we are on admin pages, we might want to hide the bottom nav or show a different one
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 lg:hidden bg-[#051815]/95 backdrop-blur-md border-t border-[#C5A059]/30 shadow-[0_-10px_20px_rgba(0,0,0,0.3)] pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        
        {/* Home */}
        <Link href="/" className="flex flex-col items-center justify-center w-16 h-full text-center relative group">
          <svg className={`w-6 h-6 mb-1 transition-all ${pathname === "/" ? "text-[#C5A059]" : "text-gray-400 group-hover:text-gray-200"}`} fill={pathname === "/" ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={pathname === "/" ? "0" : "2"}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className={`text-[10px] font-bold tracking-wider ${pathname === "/" ? "text-[#C5A059]" : "text-gray-400"}`}>Home</span>
        </Link>

        {/* Shop */}
        <button onClick={() => router.push('/#cotton-sambalpuri')} className="flex flex-col items-center justify-center w-16 h-full text-center relative group">
          <svg className="w-6 h-6 mb-1 text-gray-400 group-hover:text-gray-200 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="text-[10px] font-bold tracking-wider text-gray-400">Shop</span>
        </button>

        {/* Cart */}
        <Link href="/checkout" className="flex flex-col items-center justify-center w-16 h-full text-center relative group">
          <div className="relative">
            <svg className={`w-6 h-6 mb-1 transition-all ${pathname === "/checkout" ? "text-[#C5A059]" : "text-gray-400 group-hover:text-gray-200"}`} fill={pathname === "/checkout" ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={pathname === "/checkout" ? "0" : "2"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-[#051815]">
                {cartCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] font-bold tracking-wider ${pathname === "/checkout" ? "text-[#C5A059]" : "text-gray-400"}`}>Cart</span>
        </Link>

        {/* Profile */}
        <Link href="/profile" className="flex flex-col items-center justify-center w-16 h-full text-center relative group">
          <svg className={`w-6 h-6 mb-1 transition-all ${pathname === "/profile" ? "text-[#C5A059]" : "text-gray-400 group-hover:text-gray-200"}`} fill={pathname === "/profile" ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={pathname === "/profile" ? "0" : "2"}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className={`text-[10px] font-bold tracking-wider ${pathname === "/profile" ? "text-[#C5A059]" : "text-gray-400"}`}>Profile</span>
        </Link>

      </div>
    </div>
  );
}
