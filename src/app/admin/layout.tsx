"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePendingCounts } from "@/hooks/usePendingCounts";

// Consolidate sidebar into 6 Core Hubs for better UX
const SIDEBAR_CATEGORIES = [
  {
    title: "Ecosystem Dashboard",
    icon: "📊",
    path: "/admin/dashboard",
    subLinks: [
      { name: "Global Overview", path: "/admin/dashboard" },
      { name: "Staff & Delegation", path: "/admin/staff" }
    ]
  },
  {
    title: "Commerce Hub",
    icon: "🛒",
    badgeId: "orders",
    subLinks: [
      { name: "All Orders", path: "/admin/orders/all" },
      { name: "Vendor Payouts", path: "/admin/finance/payouts" },
      { name: "Live Inventory DB", path: "/admin/products/live" },
      { name: "Product Catalog", path: "/admin/products" },
      { name: "Bhulia.com Audit", path: "/admin/products/audit" },
      { name: "Returns & B2B", path: "/admin/orders/returns" }
    ]
  },
  {
    title: "User Management",
    icon: "👥",
    subLinks: [
      { name: "Master Weavers", path: "/admin/weavers" },
      { name: "Retail Stores", path: "/admin/stores" },
      { name: "Franchises / Resellers", path: "/admin/franchises" },
      { name: "All Registered Users", path: "/admin/users" }
    ]
  },
  {
    title: "Logistics & Support",
    icon: "🚚",
    badgeId: "logistics",
    subLinks: [
      { name: "Active Dispatch", path: "/admin/logistics/dispatch" },
      { name: "Carrier Sync & Tracking", path: "/admin/logistics/tracking" },
      { name: "Customer Tickets", path: "/admin/support/tickets" },
      { name: "Disputes", path: "/admin/support/disputes" }
    ]
  },
  {
    title: "Growth Engine",
    icon: "🚀",
    subLinks: [
      { name: "Visual Page Builder", path: "/admin/cms" },
      { name: "Global Ads & Banners", path: "/admin/marketing/ads" },
      { name: "Coupons & Offers", path: "/admin/marketing/coupons" },
      { name: "WhatsApp & Email", path: "/admin/marketing/push" },
      { name: "Google Places Importer", path: "/dashboard" },
      { name: "SEO & Campaigns", path: "/admin/marketing/seo" }
    ]
  },
  {
    title: "Settings & Trust",
    icon: "⚙️",
    badgeId: "kyc",
    subLinks: [
      { name: "Global Settings", path: "/admin/settings" },
      { name: "KYC Verification", path: "/admin/trust/kyc" },
      { name: "Fraud Analysis", path: "/admin/trust/fraud" },
      { name: "API & Webhooks", path: "/admin/developer/webhooks" }
    ]
  }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const pathname = usePathname();
  const pendingCounts = usePendingCounts();

  useEffect(() => {
    // Check local storage for the auth credentials set by sd-auth ecosystem
    const role = localStorage.getItem("sd_current_user_role");
    if (role === "super_admin" || role === "admin") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleCategory = (title: string) => {
    setExpandedCategory(expandedCategory === title ? null : title);
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-blue-600 font-medium tracking-widest text-sm uppercase">Authenticating...</div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 max-w-md w-full">
          <div className="text-5xl mb-6">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Restricted Access</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            You do not have permission to view the Super Admin Hub. Please authenticate with an authorized account.
          </p>
          <div className="flex flex-col gap-3">
            <a href="https://sd-auth-center.vercel.app/launcher" className="w-full px-6 py-3 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20">
              Login via SD Auth
            </a>
            <Link href="/" className="w-full px-6 py-3 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors">
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 text-gray-800 font-sans flex flex-col md:flex-row overflow-hidden w-full">
      
      {/* Mobile Header (Visible only on small screens) */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">Bhulia Admin</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-sm border border-blue-200"></div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:relative top-0 left-0 h-full w-72 bg-[#0074E4] border-r border-[#0052A3] flex flex-col shrink-0 z-50
        transition-transform duration-300 ease-in-out shadow-[4px_0_30px_rgba(0,116,228,0.3)]
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-[#0052A3] flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white font-serif tracking-tight">Bhulia Hub</h1>
            <p className="text-[10px] text-blue-100 font-bold mt-1 uppercase tracking-widest flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Super Admin
            </p>
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden p-2 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Total Notifications Global Indicator */}
        {pendingCounts.total > 0 && (
          <div className="px-6 py-2 bg-red-50/50 border-b border-red-100 flex items-center gap-2">
             <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] text-[10px] text-white font-bold">
              {pendingCounts.total}
            </span>
            <span className="text-xs font-bold text-red-600 tracking-wide">PENDING ACTIONS</span>
          </div>
        )}

        {/* Sidebar Links (Accordion) */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {SIDEBAR_CATEGORIES.map((category) => {
            const hasSubLinks = category.subLinks.length > 0;
            const isExpanded = expandedCategory === category.title;
            const isPathActive = pathname === category.path || category.subLinks.some(s => pathname?.startsWith(s.path));

            return (
              <div key={category.title} className="mb-1">
                {hasSubLinks ? (
                  // Accordion Button
                  <button 
                    onClick={() => toggleCategory(category.title)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full transition-all border border-transparent ${isPathActive ? 'bg-white/20 text-white border-white/20 shadow-md font-bold' : 'hover:bg-white/20 text-white/90'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{category.icon}</span>
                      <span className={`text-sm font-semibold ${isPathActive ? 'text-white' : 'text-white/90'}`}>
                        {category.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* @ts-expect-error Type string cannot be used to index pendingCounts */}
                      {category.badgeId && pendingCounts[category.badgeId] > 0 && (
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] text-[10px] text-white font-bold">
                          {/* @ts-expect-error Type string cannot be used to index pendingCounts */}
                          {pendingCounts[category.badgeId]}
                        </span>
                      )}
                      <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </button>
                ) : (
                  // Direct Link
                  <Link 
                    href={category.path || "#"}
                    className={`w-full flex items-center px-4 py-2.5 rounded-full transition-all border border-transparent ${pathname === category.path ? 'bg-white/20 text-white border-white/20 shadow-md font-bold' : 'text-white/90 hover:bg-white/20'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{category.icon}</span>
                      <span className={`text-sm font-semibold ${pathname === category.path ? 'text-white' : ''}`}>{category.title}</span>
                    </div>
                  </Link>
                )}

                {/* Expanded Sub-links */}
                {hasSubLinks && isExpanded && (
                  <div className="mt-1 mb-2 ml-10 pl-3 border-l-2 border-white/20 flex flex-col space-y-1">
                    {category.subLinks.map((sub) => {
                      const isSubActive = pathname?.startsWith(sub.path);
                      return (
                        <Link 
                          key={sub.name} 
                          href={sub.path}
                          className={`px-4 py-2 rounded-full text-[13px] transition-colors ${isSubActive ? 'text-white font-bold bg-[#0052A3] shadow-inner' : 'text-blue-100 font-medium hover:text-white hover:bg-white/10'}`}
                        >
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#0052A3] bg-[#0052A3]/30">
          <a href="https://sd-auth-center.vercel.app/launcher" className="flex items-center justify-center gap-2 w-full py-2.5 border border-white/20 text-white bg-[#0074E4] rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-all shadow-sm">
            Exit to Launcher
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden flex flex-col h-screen overflow-y-auto">
        {/* Desktop Header */}
        <header className="hidden md:flex sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 justify-between items-center shadow-[0_4px_30px_rgb(0,0,0,0.02)]">
          <div className="flex items-center gap-6">
            <h2 className="text-sm font-bold text-gray-800 tracking-tight">Trust Blue Enterprise Engine</h2>
            <div className="h-4 w-[1px] bg-gray-200"></div>
            <Link href="/" className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1.5">
              View Public Storefront <span className="text-lg leading-none mb-0.5">↗</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-gray-900">Admin Session</span>
              <span className="text-[10px] text-gray-500 font-medium">Secured by SD Auth</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xs">
              AD
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
      
      {/* Global CSS for hiding scrollbar visually but keeping functionality */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e5e7eb;
          border-radius: 20px;
        }
      `}} />
    </div>
  );
}
