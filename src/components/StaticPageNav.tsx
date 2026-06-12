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
        <ul className="flex flex-wrap justify-center items-center gap-4">
          {navCategories.map((category) => (
            <li 
              key={category.title} 
              className="relative group"
              onMouseEnter={() => setActiveDropdown(category.title)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button 
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-full
                  bg-[#0066CC]/90 hover:bg-[#0052A3] text-white
                  border border-white/30 shadow-lg backdrop-blur-md transition-all
                  text-xs md:text-sm font-bold uppercase tracking-widest
                  ${activeDropdown === category.title ? "ring-4 ring-[#0066CC]/30 -translate-y-1" : ""}
                `}
              >
                {category.title}
                <svg className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === category.title ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>

              {/* Dropdown Menu */}
              {activeDropdown === category.title && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-64 animate-fade-in z-50">
                  <div className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="py-2">
                      {category.links.map((link) => (
                        <Link 
                          key={link.slug} 
                          href={link.slug.startsWith('/') ? link.slug : `/p/${link.slug}`}
                          className="block px-6 py-3 text-sm font-bold text-[#0A1021] hover:bg-[#0066CC]/10 hover:text-[#0066CC] transition-colors border-b border-gray-100 last:border-0"
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
