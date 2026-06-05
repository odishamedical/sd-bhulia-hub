"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/firebase";

export type NavItem = {
  id: string;
  label: string;
  icon?: string;
};

interface DashboardLayoutProps {
  userName: string;
  userRole: string;
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: React.ReactNode;
}

export default function DashboardLayout({
  userName,
  userRole,
  navItems,
  activeTab,
  onTabChange,
  children
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#051815] text-gray-200 font-sans flex flex-col items-center">
      {/* STICKY TOP BRANDING HEADER */}
      <header className="sticky top-0 w-full bg-[#0B2B26] border-b border-[#C5A059]/30 shadow-[0_4px_30px_rgba(0,0,0,0.5)] z-50 px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button 
            className="lg:hidden text-[#C5A059] mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <Link href="/">
            <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-[0_0_15px_rgba(197,160,89,0.4)] cursor-pointer border-2 border-[#C5A059]">
              <Image src="/bhulia_logo_final.jpg" alt="Bhulia Logo" fill className="object-cover" />
            </div>
          </Link>
          <div>
            <span className="font-serif font-black text-xl tracking-widest text-[#C5A059] leading-none uppercase">BHULIA <span className="font-sans font-normal text-gray-400 capitalize hidden sm:inline tracking-normal">{userRole === "customer" ? "" : userRole + " "}Hub</span></span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#C5A059] hidden md:block transition-colors">Marketplace</Link>
        </div>
      </header>

      <div className="max-w-[1500px] w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-8">
        
        {/* MOBILE BACKDROP */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* LEFT SIDEBAR - SLIDE IN DRAWER */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-72 shrink-0 space-y-6 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="bg-[#0B2B26] lg:rounded-3xl shadow-2xl lg:border border-[#C5A059]/20 p-6 h-full overflow-y-auto">
            
            {/* Top Identity Block */}
            <div className="flex items-center gap-4 border-b border-[#C5A059]/20 pb-5 mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-[#996515] to-[#C5A059] text-[#0A1021] rounded-full flex items-center justify-center font-bold text-xl uppercase shadow-[0_0_15px_rgba(197,160,89,0.3)]">
                {userName?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white truncate">{userName || "User"}</h3>
                <p className="text-[10px] tracking-widest text-[#C5A059] font-mono truncate uppercase">{userRole}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }} 
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all ${activeTab === item.id ? "bg-[#0A3A35] text-[#C5A059] border border-[#C5A059]/40 shadow-inner" : "text-gray-400 hover:bg-[#0A3A35]/50 hover:text-white border border-transparent"}`}
                >
                  <span className="text-lg">{item.icon || "▪"}</span> {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-6 border-t border-[#C5A059]/20">
              <button onClick={() => auth.signOut()} className="w-full text-center text-[10px] uppercase tracking-widest font-bold text-red-400 hover:text-red-300 transition-colors block">
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT */}
        <div className="flex-1 space-y-8 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
