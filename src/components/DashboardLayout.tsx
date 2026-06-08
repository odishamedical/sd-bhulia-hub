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
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans flex flex-col items-center">
      {/* STICKY TOP BRANDING HEADER */}
      <header className="sticky top-0 w-full bg-white border-b border-gray-200 shadow-sm z-50 px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button 
            className="lg:hidden text-gray-500 mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <Link href="/">
            <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm cursor-pointer border border-gray-100">
              <Image src="/bhulia_logo_final.jpg" alt="Bhulia Logo" fill className="object-cover" />
            </div>
          </Link>
          <div>
            <span className="font-black text-xl tracking-tight text-gray-900 leading-none">BHULIA <span className="font-normal text-gray-600 capitalize hidden sm:inline">{userRole === "customer" ? "" : userRole + " "}Hub</span></span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-semibold text-gray-600 hover:text-[#E57138] hidden md:block transition-colors">Marketplace</Link>
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
                <div key={category} className="mb-6">
                  <h4 className="px-4 text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2 opacity-80">{category}</h4>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => {
                          onTabChange(item.id);
                          setMobileMenuOpen(false);
                        }} 
                        className={`w-full text-left px-4 py-2.5 rounded-full text-sm font-semibold flex items-center gap-3 transition-all border border-transparent ${activeTab === item.id ? "bg-white/20 text-white border-white/20 shadow-md font-bold" : "text-white/90 hover:text-white hover:bg-white/20"}`}
                      >
                        <span className={`text-lg transition-transform ${activeTab === item.id ? 'scale-110' : ''}`}>{item.icon || "▪"}</span> 
                        {item.label}
                      </button>
                    ))}
                  </div>
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
        <div className="flex-1 space-y-8 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
