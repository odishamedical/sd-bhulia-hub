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
        
        {/* LEFT SIDEBAR - WHITE SAAS STYLE */}
        <aside className={`w-full lg:w-72 shrink-0 space-y-6 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
            
            {/* Top Identity Block */}
            <div className="flex items-center gap-4 border-b border-gray-100 pb-5 mb-5">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl uppercase shadow-sm">
                {userName?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{userName || "User"}</h3>
                <p className="text-xs text-gray-500 font-mono truncate uppercase">{userRole}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }} 
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${activeTab === item.id ? "bg-[#FFF4ED] text-[#E57138]" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <span className="text-lg">{item.icon || "▪"}</span> {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <button onClick={() => auth.signOut()} className="w-full text-center text-xs font-semibold text-red-500 hover:text-red-700 transition-colors block">
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
