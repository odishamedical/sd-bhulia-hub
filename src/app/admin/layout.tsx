"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Check local storage for the auth credentials set by sd-auth ecosystem
    const email = localStorage.getItem("sd_current_user_email");
    const role = localStorage.getItem("sd_current_user_role");

    if (role === "super_admin") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, []);

  if (isAdmin === null) {
    return <div className="min-h-screen bg-[#051815] flex items-center justify-center"><div className="animate-pulse text-[#C5A059] font-mono text-xs">Authenticating...</div></div>;
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-[#051815] text-white flex flex-col items-center justify-center p-6 text-center">
        <span className="text-6xl mb-4">🔐</span>
        <h1 className="text-2xl sm:text-4xl font-serif text-[#C5A059] font-bold mb-4">Secure Sector</h1>
        <p className="text-gray-300 font-sans max-w-md text-sm leading-relaxed mb-8">
          This panel is restricted to the Super Admin of the Bhulia Hub ecosystem. You must sign in through the Central SD Auth Launcher.
        </p>
        <div className="flex gap-4">
          <Link href="/" className="px-6 py-2 border border-[#C5A059]/40 text-[#C5A059] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#C5A059]/10 transition-colors">
            Return to Store
          </Link>
          <a href="https://sd-auth-center.vercel.app/launcher" className="px-6 py-2 bg-[#C5A059] text-[#0A1021] font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition-all shadow-lg">
            Login via SD Auth
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#051815] text-white font-sans flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0B2B26] border-r border-[#C5A059]/30 flex flex-col shrink-0">
        <div className="p-6 border-b border-[#C5A059]/20">
          <h1 className="text-xl font-serif font-bold text-[#C5A059] tracking-wider leading-tight">BHULIA<br/>ADMIN PORTAL</h1>
          <p className="text-[10px] text-green-400 font-mono mt-1 uppercase tracking-widest">● Super Admin Access</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${pathname === "/admin" ? "bg-[#C5A059] text-[#0A1021]" : "text-gray-300 hover:bg-[#0A3A35] hover:text-[#C5A059]"}`}>
            <span>📊</span> Dashboard
          </Link>
          <Link href="/admin/products" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${pathname?.includes("/admin/products") ? "bg-[#C5A059] text-[#0A1021]" : "text-gray-300 hover:bg-[#0A3A35] hover:text-[#C5A059]"}`}>
            <span>🛍️</span> Products
          </Link>
          <Link href="/admin/weavers" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${pathname?.includes("/admin/weavers") ? "bg-[#C5A059] text-[#0A1021]" : "text-gray-300 hover:bg-[#0A3A35] hover:text-[#C5A059]"}`}>
            <span>🧵</span> Weavers
          </Link>
          <Link href="/admin/stores" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${pathname?.includes("/admin/stores") ? "bg-[#C5A059] text-[#0A1021]" : "text-gray-300 hover:bg-[#0A3A35] hover:text-[#C5A059]"}`}>
            <span>🏛️</span> Stores
          </Link>
          <Link href="/admin/franchises" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${pathname?.includes("/admin/franchises") ? "bg-[#C5A059] text-[#0A1021]" : "text-gray-300 hover:bg-[#0A3A35] hover:text-[#C5A059]"}`}>
            <span>🏪</span> Franchises
          </Link>
          <Link href="/admin/users" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${pathname?.includes("/admin/users") ? "bg-[#C5A059] text-[#0A1021]" : "text-gray-300 hover:bg-[#0A3A35] hover:text-[#C5A059]"}`}>
            <span>👥</span> Users
          </Link>
          <Link href="/admin/cms" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${pathname?.includes("/admin/cms") ? "bg-[#C5A059] text-[#0A1021]" : "text-gray-300 hover:bg-[#0A3A35] hover:text-[#C5A059]"}`}>
            <span>⚙️</span> CMS Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-[#C5A059]/20">
          <a href="https://sd-auth-center.vercel.app/launcher" className="flex items-center justify-center gap-2 w-full py-2.5 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-500/10 transition-colors">
            Exit to Launcher
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden flex flex-col h-screen overflow-y-auto bg-[url('/noise.png')] bg-repeat opacity-95">
        <header className="sticky top-0 z-40 bg-[#0B2B26]/95 backdrop-blur-sm border-b border-[#C5A059]/30 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-gray-200 uppercase tracking-widest hidden sm:block">Live Database Sync Active</h2>
            <Link href="/" className="px-3 py-1.5 border border-[#C5A059]/50 text-[#C5A059] text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#C5A059]/10 transition-colors hidden sm:flex items-center gap-1.5">
              <span>Public Store</span>
              <span className="text-lg leading-none">↗</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-400 font-mono">odishamedical@gmail.com</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#996515] to-[#C5A059] border border-[#C5A059] shadow-[0_0_10px_rgba(197,160,89,0.5)]"></div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
