"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

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
        { name: "Artisan Payout Guide", slug: "artisan-payout-guide" },
        { name: "Live Silk & Yarn Rates", slug: "live-silk-rates" },
      ]
    }
  ];

  return (
    <div className="w-full relative z-40 bg-[#0A1021]">
      {/* Navigation Bar */}
      <div className="max-w-[1920px] mx-auto px-4 md:px-8">
        <ul className="flex flex-wrap justify-center md:justify-between items-center py-3 md:py-4 gap-4 md:gap-8">
          {navCategories.map((category) => (
            <li 
              key={category.title} 
              className="relative group"
              onMouseEnter={() => setActiveDropdown(category.title)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="text-[#C5A059] font-bold text-xs md:text-sm uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1">
                {category.title}
                <svg className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === category.title ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>

              {/* Dropdown Menu */}
              {activeDropdown === category.title && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white border-2 border-[#C5A059] rounded-xl shadow-2xl overflow-hidden animate-fade-in z-50">
                  <div className="py-2">
                    {category.links.map((link) => (
                      <Link 
                        key={link.slug} 
                        href={`/p/${link.slug}`}
                        className="block px-6 py-3 text-sm font-bold text-[#0A1021] hover:bg-[#FBF8F1] hover:text-[#C5A059] transition-colors border-b border-gray-100 last:border-0"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Seamless Ikat Border Pattern */}
      <div className="w-full h-8 md:h-12 overflow-hidden relative border-t-4 border-b-4 border-[#8B0000]">
        {/* We use a repeating background image for the seamless pattern */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/static-pages/Seamless Ikat Border Pattern.png')",
            backgroundSize: "contain",
            backgroundRepeat: "repeat-x",
            backgroundPosition: "center",
          }}
        />
      </div>
    </div>
  );
}
