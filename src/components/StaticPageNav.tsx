"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function StaticPageNav() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navCategories = [
    {
      title: "ABOUT BHULIA",
      links: [
        { name: "About Us", slug: "about-us" },
        { name: "The Sambalpuri Masterpieces", slug: "about-our-products" },
        { name: "Bhulia Registry Clearance", slug: "bhulia-registry-clearance" },
      ]
    },
    {
      title: "LEGAL & POLICIES",
      links: [
        { name: "Privacy Policy", slug: "privacy-policy" },
        { name: "Terms of Service", slug: "terms-of-service" },
        { name: "Platform Return Policy", slug: "platform-return-policy" },
      ]
    },
    {
      title: "HELP & SUPPORT",
      links: [
        { name: "24/7 Concierge Support", slug: "contact-us" },
        { name: "Secure BVC Armored Transit", slug: "secure-bvc-armored-transit" },
      ]
    },
    {
      title: "ARTISANS & SELLERS",
      links: [
        { name: "Register Your Business", slug: "/verify" },
        { name: "Artisan Payout Guide", slug: "artisan-payout-guide" },
        { name: "Live Silk & Yarn Rates", slug: "live-silk-rates" },
      ]
    }
  ];

  return (
    <div className="w-full bg-[#E5D3B3] border-b border-[#C5A059]/20 shadow-sm relative z-40 py-3 px-4 mb-6">
      {/* Navigation Bar */}
      <div className="max-w-[1400px] mx-auto">
        <ul className="flex overflow-x-auto whitespace-nowrap hide-scrollbar items-center md:justify-center gap-3 pb-1">
          {navCategories.map((category) => (
            <li 
              key={category.title} 
              className="relative group"
              onMouseEnter={() => setActiveDropdown(category.title)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button 
                onClick={() => {
                  if (activeDropdown === category.title) {
                    setActiveDropdown(null);
                  } else {
                    setActiveDropdown(category.title);
                  }
                }}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-full
                  bg-[#0066CC]/90 hover:bg-[#0052A3] text-white
                  border border-white/30 shadow-lg backdrop-blur-md transition-all
                  text-xs md:text-sm font-bold uppercase tracking-widest
                  ${activeDropdown === category.title ? "ring-4 ring-[#0066CC]/30 lg:-translate-y-1" : ""}
                `}
              >
                {category.title}
                <svg className={`w-4 h-4 shrink-0 transition-transform duration-200 ${activeDropdown === category.title ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>

              {/* Mobile Overlay */}
              {activeDropdown === category.title && (
                <div 
                  className="fixed inset-0 bg-black/60 z-[90] lg:hidden backdrop-blur-sm"
                  onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }}
                />
              )}

              {/* Dropdown Menu / Bottom Sheet */}
              {activeDropdown === category.title && (
                <div className="fixed bottom-0 left-0 right-0 lg:absolute lg:bottom-auto lg:top-full lg:left-1/2 lg:-translate-x-1/2 lg:pt-3 lg:w-64 animate-[slideUp_0.3s_ease-out] lg:animate-fade-in z-[100] lg:z-50 pb-safe lg:pb-0">
                  <div className="bg-[#051815] lg:bg-white/95 lg:backdrop-blur-xl border-t border-[#C5A059]/40 lg:border lg:border-gray-100 rounded-t-3xl lg:rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] lg:shadow-2xl overflow-hidden p-6 lg:p-0 flex flex-col max-h-[80vh]">
                    
                    {/* Mobile Header */}
                    <div className="lg:hidden flex justify-between items-center mb-4 border-b border-[#C5A059]/20 pb-4 shrink-0">
                      <h3 className="text-lg font-serif font-bold text-[#C5A059]">{category.title}</h3>
                      <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }} className="text-gray-400 p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>

                    <div className="py-2 overflow-y-auto">
                      {category.links.map((link) => (
                        <Link 
                          key={link.slug} 
                          href={link.slug.startsWith('/') ? link.slug : `/p/${link.slug}`}
                          onClick={() => setActiveDropdown(null)}
                          className="block px-6 py-4 lg:py-3 text-sm font-bold text-gray-200 lg:text-[#0A1021] hover:bg-[#0066CC]/10 hover:text-[#C5A059] lg:hover:text-[#0066CC] transition-colors border-b border-[#C5A059]/10 lg:border-gray-100 last:border-0"
                        >
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
