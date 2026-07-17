"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePendingCounts } from "@/hooks/usePendingCounts";

// Modularized Components
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminKyc from "@/components/admin/AdminKyc";
import AdminAds from "@/components/admin/AdminAds";
import AdminHelp from "@/components/admin/AdminHelp";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminPageBuilder from "@/components/admin/AdminPageBuilder";

const SIDEBAR_CATEGORIES = [
  {
    title: "1. Overview & Insights",
    icon: "📊",
    id: "dashboard",
    subLinks: [
      { name: "Global Dashboard", id: "dashboard" }
    ]
  },
  {
    title: "2. User Identity & CRM",
    icon: "👥",
    badgeId: "kyc",
    subLinks: [
      { name: "User Directory", id: "users" },
      { name: "Verification Queue", id: "kyc" },
      { name: "Ecosystem Guidelines", id: "guide" }
    ]
  },
  {
    title: "3. Catalog & Commerce",
    icon: "🛍️",
    subLinks: [
      { name: "Product Catalog", id: "products" }
    ]
  },
  {
    title: "4. Orders & Fulfillment",
    icon: "📦",
    badgeId: "orders",
    subLinks: [
      { name: "All Orders", id: "orders" },
      { name: "Active Dispatch", id: "logistics-dispatch" },
      { name: "Returns & B2B", id: "orders-returns" }
    ]
  },
  {
    title: "5. Finance & Revenue",
    icon: "💰",
    subLinks: [
      { name: "Seller Payouts", id: "payouts" },
      { name: "Reseller Commissions", id: "commissions" },
      { name: "SaaS Subscriptions", id: "subscriptions" },
      { name: "Tax & Compliance", id: "tax" }
    ]
  },
  {
    title: "6. Growth & Engagement",
    icon: "📢",
    subLinks: [
      { name: "Global Ads", id: "ads" },
      { name: "Coupons & Offers", id: "coupons" },
      { name: "Google Importer", id: "importer" }
    ]
  },
  {
    title: "7. Support & Disputes",
    icon: "🛡️",
    subLinks: [
      { name: "Customer Tickets", id: "tickets" },
      { name: "Disputes", id: "disputes" },
      { name: "Fraud Analysis", id: "fraud" }
    ]
  },
  {
    title: "8. Platform Settings",
    icon: "⚙️",
    subLinks: [
      { name: "Visual Page Builder", id: "cms" },
      { name: "Platform Settings", id: "settings" },
      { name: "Global Audit Log", id: "audit" },
      { name: "Staff Delegation", id: "staff" }
    ]
  },
  {
    title: "9. Help & Documentation",
    icon: "📖",
    id: "help",
    subLinks: [
      { name: "System Guide", id: "help" }
    ]
  }
];

export default function AdminSPA() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("1. Overview & Insights");
  const [activeTab, setActiveTab] = useState("dashboard");
  const pendingCounts = usePendingCounts();

  useEffect(() => {
    const role = localStorage.getItem("sd_current_user_role");
    if (role === "super_admin" || role === "admin") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, []);

  const toggleCategory = (title: string) => {
    setExpandedCategory(expandedCategory === title ? null : title);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard />;
      case "users":
        return <AdminUsers />;
      case "kyc":
        return <AdminKyc />;
      case "products":
        return <AdminProducts />;
      case "orders":
        return <AdminOrders />;
      case "ads":
        return <AdminAds />;
      case "cms":
        return <AdminPageBuilder />;
      case "help":
        return <AdminHelp />;
      case "subscriptions":
        return <div className="p-8 text-gray-500">SaaS Subscriptions module coming soon.</div>;
      case "settings":
        return <AdminSettings />;
      default:
        return (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center bg-white p-12 rounded-3xl border border-gray-100 shadow-sm max-w-lg w-full">
              <div className="text-4xl mb-4">🚧</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Module In Development</h2>
              <p className="text-gray-500 text-sm">
                The <span className="font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded uppercase">{activeTab}</span> module is currently being migrated to the new unified SPA architecture.
              </p>
            </div>
          </div>
        );
    }
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
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
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
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMobileOpen(true)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">Bhulia Admin</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-sm border border-blue-200"></div>
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:relative top-0 left-0 h-full w-72 bg-[#0074E4] border-r border-[#0052A3] flex flex-col shrink-0 z-50
        transition-transform duration-300 ease-in-out shadow-[4px_0_30px_rgba(0,116,228,0.3)]
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
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

        {pendingCounts.total > 0 && (
          <div className="px-6 py-2 bg-red-50/50 border-b border-red-100 flex items-center gap-2">
             <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] text-[10px] text-white font-bold">
              {pendingCounts.total}
            </span>
            <span className="text-xs font-bold text-red-600 tracking-wide">PENDING ACTIONS</span>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {SIDEBAR_CATEGORIES.map((category) => {
            const hasSubLinks = category.subLinks && category.subLinks.length > 0;
            const isExpanded = expandedCategory === category.title;
            const isPathActive = activeTab === category.id || (hasSubLinks && category.subLinks.some(s => activeTab === s.id));

            return (
              <div key={category.title} className="mb-1">
                {hasSubLinks ? (
                  <button 
                    onClick={() => toggleCategory(category.title)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full transition-all border border-transparent ${isPathActive ? 'bg-white/20 text-white border-white/20 shadow-md font-bold' : 'hover:bg-white/20 text-white/90'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{category.icon}</span>
                      <span className={`text-sm font-semibold ${isPathActive ? 'text-white' : 'text-white/90'}`}>{category.title}</span>
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
                  <button 
                    onClick={() => { setActiveTab(category.id as string); setIsMobileOpen(false); }}
                    className={`w-full flex items-center px-4 py-2.5 rounded-full transition-all border border-transparent ${activeTab === category.id ? 'bg-white/20 text-white border-white/20 shadow-md font-bold' : 'text-white/90 hover:bg-white/20'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{category.icon}</span>
                      <span className={`text-sm font-semibold ${activeTab === category.id ? 'text-white' : ''}`}>{category.title}</span>
                    </div>
                  </button>
                )}

                {hasSubLinks && isExpanded && (
                  <div className="mt-1 mb-2 ml-10 pl-3 border-l-2 border-white/20 flex flex-col space-y-1">
                    {category.subLinks.map((sub) => {
                      const isSubActive = activeTab === sub.id;
                      return (
                        <button 
                          key={sub.name} 
                          onClick={() => { setActiveTab(sub.id); setIsMobileOpen(false); }}
                          className={`text-left px-4 py-2 rounded-full text-[13px] transition-colors ${isSubActive ? 'text-white font-bold bg-[#0052A3] shadow-inner' : 'text-blue-100 font-medium hover:text-white hover:bg-white/10'}`}
                        >
                          {sub.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#0052A3] bg-[#0052A3]/30">
          <a href="https://sd-auth-center.vercel.app/launcher" className="flex items-center justify-center gap-2 w-full py-2.5 border border-white/20 text-white bg-[#0074E4] rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-all shadow-sm">
            Exit to Launcher
          </a>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden flex flex-col h-screen overflow-y-auto bg-gray-50">
        <header className="hidden md:flex sticky top-0 z-40 bg-[#0074E4] border-b border-[#0052A3] shadow-md px-8 py-3 justify-between items-center text-white">
          <div className="flex items-center gap-6 shrink-0">
            <h2 className="text-sm font-bold text-white tracking-tight">Enterprise Engine</h2>
            <div className="h-4 w-[1px] bg-white/20"></div>
          </div>

          <div className="flex-1 flex justify-center items-center gap-2 px-4 overflow-x-auto custom-scrollbar">
            <a href="/" target="_blank" className="px-4 py-1.5 text-xs font-bold flex items-center gap-2 rounded-full bg-white/20 text-white border border-white/20 shadow-sm hover:bg-white/30 transition-all shrink-0">
              <span>🌐</span> Storefront
            </a>
            
            <div className="h-6 w-[1px] bg-white/20 mx-2 self-center shrink-0"></div>
            <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider mr-1 shrink-0">Demo Hubs:</span>
            
            {["customer", "reseller", "store", "weaver"].map(role => (
              <button 
                key={role}
                onClick={() => {
                  localStorage.setItem("sd_view_as_uid", "demo-" + role);
                  localStorage.setItem("sd_view_as_role", role);
                  localStorage.setItem("sd_view_as_name", "Demo " + role.charAt(0).toUpperCase() + role.slice(1));
                  if (role === "store" || role === "weaver") {
                    localStorage.setItem("sd_seller_mode", "true");
                  }
                  window.open("/dashboard", "_blank");
                }}
                className="px-4 py-1.5 text-xs font-bold rounded-full bg-[#0052A3] text-blue-50 border border-[#003d7a] shadow-sm hover:bg-[#003d7a] hover:text-white transition-all shrink-0 capitalize"
              >
                {role}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-white">Admin Session</span>
              <span className="text-[10px] text-blue-200 font-medium">Secured by SD Auth</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/20 border-2 border-white/30 shadow-md flex items-center justify-center text-white font-bold text-xs">
              AD
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 animate-in fade-in zoom-in-95 duration-200">
          {renderContent()}
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e5e7eb; border-radius: 20px; }
      `}} />
    </div>
  );
}
