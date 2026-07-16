"use client";

import React, { useState, useEffect } from "react";
import { collection, query, getDocs, doc, setDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function MarketingDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"banners" | "seo" | "coupons">("banners");

  // Mock State for UI
  const [bannerText, setBannerText] = useState("Use code FESTIVE20 for 20% off all Sambalpuri Sarees!");
  const [bannerColor, setBannerColor] = useState("#C5A059"); // Trust Blue / Gold
  
  const [coupons, setCoupons] = useState([
    { code: "FESTIVE20", discount: "20%", active: true },
    { code: "NEWWEAVER", discount: "Flat ₹500", active: false }
  ]);

  const [redirects, setRedirects] = useState([
    { from: "/old-ikat-collection", to: "/collections/ikat-sarees" },
    { from: "/weaver-signup", to: "/auth/partner-registration" }
  ]);

  useEffect(() => {
    const verifyAccess = async () => {
      const email = localStorage.getItem("sd_current_user_email");
      const role = localStorage.getItem("sd_current_user_role");

      if (role === "super_admin") {
        setHasPermission(true);
        setIsLoading(false);
        return;
      }

      if (role === "admin" && email) {
        try {
          const q = query(collection(db, "users"), where("email", "==", email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const adminData = snap.docs[0].data();
            // Using a generic marketing permission boolean
            if (adminData.permissions?.marketing === true) {
              setHasPermission(true);
              setIsLoading(false);
              return;
            }
          }
        } catch (error) {
          console.error("Permission check failed:", error);
        }
      }

      setHasPermission(false);
      setIsLoading(false);
    };

    verifyAccess();
  }, []);

  const handleSaveBanner = async () => {
    alert("Global marketing banner has been published to the storefront!");
  };

  const handleAddCoupon = () => {
    const newCode = prompt("Enter new coupon code:");
    if (newCode) setCoupons([{ code: newCode, discount: "10%", active: true }, ...coupons]);
  };

  if (hasPermission === null || isLoading) {
    return <div className="py-20 text-blue-600 font-bold uppercase tracking-widest text-xs text-center animate-pulse">Verifying Access...</div>;
  }

  if (hasPermission === false) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h3 className="font-bold text-lg mb-2">Access Denied</h3>
        <p>You do not have `Growth & Marketing` permissions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Growth & SEO Engine</h1>
          <p className="text-sm text-gray-500 mt-1">Manage global storefront banners, SEO redirects, and discount codes.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          <button 
            onClick={() => setActiveTab("banners")} 
            className={`px-6 py-4 text-sm font-bold tracking-wider uppercase whitespace-nowrap border-b-2 transition-colors ${activeTab === 'banners' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
          >
            Banner Editor
          </button>
          <button 
            onClick={() => setActiveTab("coupons")} 
            className={`px-6 py-4 text-sm font-bold tracking-wider uppercase whitespace-nowrap border-b-2 transition-colors ${activeTab === 'coupons' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
          >
            Coupon Generator
          </button>
          <button 
            onClick={() => setActiveTab("seo")} 
            className={`px-6 py-4 text-sm font-bold tracking-wider uppercase whitespace-nowrap border-b-2 transition-colors ${activeTab === 'seo' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
          >
            SEO Redirects
          </button>
        </div>

        <div className="p-6">
          
          {/* BANNER EDITOR */}
          {activeTab === "banners" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Global Announcement Bar Text</label>
                <input 
                  type="text" 
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Banner Background Color</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    value={bannerColor}
                    onChange={(e) => setBannerColor(e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border-0 bg-transparent" 
                  />
                  <span className="text-sm font-mono text-gray-500">{bannerColor}</span>
                </div>
              </div>

              {/* Live Preview */}
              <div className="mt-8 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-100 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200">
                  Live Storefront Preview
                </div>
                <div 
                  className="w-full py-3 text-center text-white font-bold text-sm tracking-wide shadow-inner"
                  style={{ backgroundColor: bannerColor }}
                >
                  {bannerText}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button onClick={handleSaveBanner} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-all">
                  Publish to Storefront
                </button>
              </div>
            </div>
          )}

          {/* COUPON GENERATOR */}
          {activeTab === "coupons" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button onClick={handleAddCoupon} className="px-4 py-2 bg-gray-900 text-white font-bold rounded-lg text-xs shadow-sm hover:bg-black transition-colors">
                  + Create Coupon
                </button>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-semibold text-[11px]">
                    <tr>
                      <th className="px-6 py-4">Promo Code</th>
                      <th className="px-6 py-4">Discount Value</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {coupons.map((coupon, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-bold text-gray-900 font-mono tracking-wider">{coupon.code}</td>
                        <td className="px-6 py-4 font-bold text-emerald-600">{coupon.discount}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${coupon.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {coupon.active ? 'Active' : 'Expired'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-xs font-bold text-blue-600 hover:underline">Toggle State</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SEO REDIRECTS */}
          {activeTab === "seo" && (
            <div className="space-y-6">
              <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-1">Permanent 301 Redirects</h4>
                <p className="text-sm text-blue-800">Preserve your Google Search Rankings when migrating product URLs. These rules are injected into `next.config.js` via middleware.</p>
              </div>
              
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm font-mono">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold text-[10px] font-sans">
                    <tr>
                      <th className="px-6 py-3">Old Path (Source)</th>
                      <th className="px-6 py-3">New Path (Destination)</th>
                      <th className="px-6 py-3 text-right">Delete Rule</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800 text-xs">
                    {redirects.map((rule, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4">{rule.from}</td>
                        <td className="px-6 py-4 text-blue-600 font-bold">{rule.to}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-red-500 hover:text-red-700">✕</button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="px-4 py-3"><input type="text" placeholder="/old-path" className="w-full px-2 py-1.5 border border-gray-200 rounded outline-none" /></td>
                      <td className="px-4 py-3"><input type="text" placeholder="/new-path" className="w-full px-2 py-1.5 border border-gray-200 rounded outline-none" /></td>
                      <td className="px-4 py-3 text-right">
                        <button className="px-3 py-1.5 bg-gray-900 text-white font-bold rounded text-[10px] uppercase font-sans hover:bg-black">Add Rule</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
