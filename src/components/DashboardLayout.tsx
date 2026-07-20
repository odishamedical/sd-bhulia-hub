"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/firebase";

export type NavItem = {
  id: string;
  label: string;
  icon?: string;
  category?: string;
};

interface DashboardLayoutProps {
  userName: string;
  userRole: string;
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  storeSlug?: string;
  children: React.ReactNode;
  isSellerMode?: boolean;
  onSellerModeToggle?: () => void;
  showDualRoleToggle?: boolean;
}

export default function DashboardLayout({
  userName,
  userRole,
  navItems,
  activeTab,
  onTabChange,
  storeSlug = "demo",
  children,
  isSellerMode,
  onSellerModeToggle,
  showDualRoleToggle
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  React.useEffect(() => {
    const activeItem = navItems.find(item => item.id === activeTab);
    if (activeItem?.category) {
      setExpandedCategory(activeItem.category);
    }
  }, [activeTab, navItems]);

  const toggleCategory = (category: string) => {
    setExpandedCategory(prev => prev === category ? null : category);
  };

  const CATEGORY_ICONS: Record<string, string> = {
    "Dashboard & Reports": "📊",
    "Catalog & Inventory": "🛍️",
    "Orders & Logistics": "📦",
    "User Management": "👥",
    "Support & Verification": "🛡️",
    "Marketing & Growth": "📢",
    "Finance & Accounting": "💰",
    "Platform & System": "⚙️",
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans flex flex-col items-center">
      {/* STICKY TOP BRANDING HEADER */}
      <header className="sticky top-0 w-full bg-[#0074E4] border-b border-[#0052A3] shadow-md z-50 px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center text-white">
        
        {/* Left Side: Logo & Brand */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button 
            className="lg:hidden text-white/80 hover:text-white mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <Link href="/">
            <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-sm cursor-pointer">
              <Image src="/logo.png" alt="Bhulia Logo" fill sizes="56px" className="object-cover scale-[1.15]" />
            </div>
          </Link>
          <div>
            <span className="font-black text-xl tracking-tight text-white leading-none">BHULIA <span className="font-normal text-blue-100 capitalize hidden sm:inline">{userRole === "customer" ? "" : userRole.replace("_staff", "") + " "}Hub</span></span>
          </div>
        </div>

        {/* Center: Buttons */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-3">
          {(userRole === "store" || userRole === "weaver" || userRole === "store_staff" || userRole === "weaver_staff") ? (
            <>
              <a href={`/${userRole.includes("weaver") ? "weaver" : "store"}/${storeSlug}`} target="_blank" className="px-5 py-2 text-sm font-bold flex items-center gap-2 rounded-full bg-white/20 text-white border border-white/20 shadow-sm hover:bg-white/30 transition-all">
                <span>🏪</span> View My Storefront
              </a>
              <a href="/" target="_blank" className="px-5 py-2 text-sm font-bold flex items-center gap-2 rounded-full bg-[#0052A3] text-blue-50 border border-[#003d7a] shadow-sm hover:bg-[#003d7a] transition-all">
                <span>🌐</span> View Main Marketplace
              </a>
            </>
          ) : userRole === "reseller" ? (
            <a href={`/reseller/${storeSlug}`} target="_blank" className="px-5 py-2 text-sm font-bold flex items-center gap-2 rounded-full bg-white/20 text-white border border-white/20 shadow-sm hover:bg-white/30 transition-all">
              <span>🔗</span> View Public Page
            </a>
          ) : (
            <a href="/" target="_blank" className="px-5 py-2 text-sm font-bold flex items-center gap-2 rounded-full bg-white/20 text-white border border-white/20 shadow-sm hover:bg-white/30 transition-all">
              <span>🌐</span> Marketplace
            </a>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <Link href="/" className="text-sm font-bold text-blue-100 hover:text-white md:hidden transition-colors">Marketplace</Link>
          
          {showDualRoleToggle && (
            <div className="hidden md:flex items-center gap-1 bg-[#0052A3] rounded-full p-1 border border-white/10 shadow-inner">
              <button 
                onClick={() => isSellerMode && onSellerModeToggle?.()}
                className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full transition-all ${!isSellerMode ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-200 hover:text-white'}`}
              >
                🛍️ Buyer
              </button>
              <button 
                onClick={() => !isSellerMode && onSellerModeToggle?.()}
                className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full transition-all ${isSellerMode ? 'bg-gradient-to-r from-[#C5A059] to-[#996515] text-white shadow-sm' : 'text-blue-200 hover:text-white'}`}
              >
                💼 Seller
              </button>
            </div>
          )}

          <div className="w-9 h-9 rounded-full bg-white/20 border border-white/20 flex items-center justify-center text-white font-bold uppercase hidden sm:flex shadow-sm">
             {userName?.charAt(0) || "U"}
          </div>
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
          <div className="bg-[#0074E4] lg:rounded-3xl shadow-[4px_0_30px_rgba(0,116,228,0.3)] border border-[#0052A3] p-6 h-full overflow-y-auto flex flex-col text-white">
            
            {/* Top Identity Block */}
            <div className="flex items-center gap-4 border-b border-[#0052A3] pb-6 mb-6">
              <div className="w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center font-bold text-xl uppercase shadow-sm border border-white/20">
                {userName?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white truncate">{userName || "User"}</h3>
                <p className="text-xs text-blue-100 font-bold truncate uppercase tracking-wider">{userRole}</p>
              </div>
            </div>

            {/* Mobile Dual Role Toggle */}
            {showDualRoleToggle && (
              <div className="md:hidden flex items-center gap-1 bg-[#0052A3] rounded-full p-1 border border-white/10 shadow-inner mb-6">
                <button 
                  onClick={() => isSellerMode && onSellerModeToggle?.()}
                  className={`flex-1 text-[10px] font-bold uppercase py-2 rounded-full transition-all text-center ${!isSellerMode ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-200 hover:text-white'}`}
                >
                  🛍️ Buyer Mode
                </button>
                <button 
                  onClick={() => !isSellerMode && onSellerModeToggle?.()}
                  className={`flex-1 text-[10px] font-bold uppercase py-2 rounded-full transition-all text-center ${isSellerMode ? 'bg-gradient-to-r from-[#C5A059] to-[#996515] text-white shadow-sm' : 'text-blue-200 hover:text-white'}`}
                >
                  💼 Seller Mode
                </button>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              {Object.entries(
                navItems.reduce((acc, item) => {
                  const cat = item.category || "Menu";
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(item);
                  return acc;
                }, {} as Record<string, NavItem[]>)
              ).map(([category, items]) => (
                <div key={category} className="mb-2">
                  <button 
                    onClick={() => toggleCategory(category)}
                    className={`w-full text-left px-4 py-3 rounded-full flex justify-between items-center group transition-all ${
                      expandedCategory === category ? "bg-white/10 shadow-inner" : "hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg opacity-90">{CATEGORY_ICONS[category] || "▪"}</span>
                      <h4 className="text-[14px] font-bold text-white tracking-wide">{category}</h4>
                    </div>
                    <span className={`text-blue-200 opacity-60 text-lg transition-transform duration-200 ${expandedCategory === category ? "rotate-180" : ""}`}>
                      ⌄
                    </span>
                  </button>
                  
                  {expandedCategory === category && (
                    <div className="space-y-1 mt-1 mb-3 animate-in slide-in-from-top-1 fade-in duration-200">
                      {items.map((item) => (
                        <button 
                          key={item.id}
                          id={`tour-tab-${item.id}`}
                          onClick={() => {
                            onTabChange(item.id);
                            setMobileMenuOpen(false);
                          }} 
                          className={`w-full text-left pl-14 pr-4 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === item.id ? "bg-white/20 text-white font-bold" : "text-blue-100 hover:text-white hover:bg-white/10"}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="mt-8 pt-6 border-t border-[#0052A3]">
              <button onClick={() => auth.signOut()} className="w-full text-left px-4 py-2.5 rounded-full text-sm font-semibold flex items-center gap-3 text-red-200 hover:text-white hover:bg-red-500/80 transition-all border border-transparent">
                <span className="text-lg">🚪</span> Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* MOBILE TOP NAVIGATION */}
          <div className="lg:hidden flex overflow-x-auto gap-2 pb-2 custom-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6 scroll-smooth snap-x">
            {navItems.map(item => (
              <button
                key={item.id}
                id={`tour-mobile-tab-${item.id}`}
                onClick={() => onTabChange(item.id)}
                className={`whitespace-nowrap snap-center px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center ${activeTab === item.id ? "bg-[#0074E4] text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
