"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/franchise/dashboard") || pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="w-full bg-[#051815] border-t border-[#C5A059]/40 text-white py-8 px-6 z-50 relative shadow-[0_-4_30px_rgba(0,0,0,0.6)] mt-auto font-sans">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6 md:gap-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#C5A059]/20 pb-4 md:pb-6">
          <div>
            <h3 className="text-lg font-serif font-bold tracking-widest text-[#C5A059] uppercase mb-1">Join The Bhulia Ecosystem</h3>
            <p className="text-xs text-gray-300 uppercase tracking-widest">Empowering Artisans • Connecting Buyers • Growing Together</p>
          </div>
        </div>

        <div className="flex md:grid overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 border-b border-[#C5A059]/20 pb-6 md:pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* Ticket 1: Resellers - Bronze/Gold */}
          <div className="w-[75vw] sm:w-[260px] md:w-auto md:min-w-0 snap-center shrink-0 bg-gradient-to-br from-[#4A2E1B] to-[#1A100A] border border-[#C5A059]/40 rounded-2xl p-6 flex flex-col justify-between hover:border-[#C5A059] hover:-translate-y-2 transition-all duration-500 group shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(197,160,89,0.3)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C5A059]/20 to-transparent rounded-bl-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute -inset-[100%] group-hover:animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,rgba(197,160,89,0.1)_50%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5 border-b border-[#C5A059]/20 pb-3">
                <span className="text-2xl drop-shadow-[0_0_10px_rgba(197,160,89,0.8)]">🤝</span>
                <h4 className="text-lg font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D1] to-[#C5A059]">Resellers</h4>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans italic opacity-90 group-hover:opacity-100 transition-opacity">“Start your journey as a Bhulia Reseller — grow with us, no upfront cost.”</p>
            </div>
            <Link href="/login?redirect=%2Fdashboard%3Fapply%3Dreseller" className="relative z-10 mt-6 w-full text-center py-3 rounded-xl bg-gradient-to-r from-[#C5A059]/10 to-transparent border border-[#C5A059]/40 text-[#C5A059] text-[10px] sm:text-xs font-bold uppercase tracking-widest group-hover:bg-[#C5A059] group-hover:text-[#0A1021] transition-all duration-500 shadow-inner">
              Apply as Reseller
            </Link>
          </div>

          {/* Ticket 2: Weavers - Heritage Maroon */}
          <div className="w-[75vw] sm:w-[260px] md:w-auto md:min-w-0 snap-center shrink-0 bg-gradient-to-br from-[#5A1827] to-[#1F080D] border border-[#C5A059]/40 rounded-2xl p-6 flex flex-col justify-between hover:border-[#C5A059] hover:-translate-y-2 transition-all duration-500 group shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(197,160,89,0.3)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C5A059]/20 to-transparent rounded-bl-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute -inset-[100%] group-hover:animate-[spin_4s_linear_infinite_reverse] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,rgba(197,160,89,0.1)_50%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5 border-b border-[#C5A059]/20 pb-3">
                <span className="text-2xl drop-shadow-[0_0_10px_rgba(197,160,89,0.8)]">🧵</span>
                <h4 className="text-lg font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D1] to-[#C5A059]">Weavers</h4>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans italic opacity-90 group-hover:opacity-100 transition-opacity">“Showcase your craft to the world — Bhulia empowers real Sambalpuri weavers.”</p>
            </div>
            <Link href="/login?redirect=%2Fdashboard%3Fapply%3Dweaver" className="relative z-10 mt-6 w-full text-center py-3 rounded-xl bg-gradient-to-r from-[#C5A059]/10 to-transparent border border-[#C5A059]/40 text-[#C5A059] text-[10px] sm:text-xs font-bold uppercase tracking-widest group-hover:bg-[#C5A059] group-hover:text-[#0A1021] transition-all duration-500 shadow-inner">
              Join as Weaver
            </Link>
          </div>

          {/* Ticket 3: Store Owners - Royal Indigo */}
          <div className="w-[75vw] sm:w-[260px] md:w-auto md:min-w-0 snap-center shrink-0 bg-gradient-to-br from-[#1A2B4C] to-[#0A1121] border border-[#C5A059]/40 rounded-2xl p-6 flex flex-col justify-between hover:border-[#C5A059] hover:-translate-y-2 transition-all duration-500 group shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(197,160,89,0.3)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C5A059]/20 to-transparent rounded-bl-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute -inset-[100%] group-hover:animate-[spin_5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,rgba(197,160,89,0.1)_50%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5 border-b border-[#C5A059]/20 pb-3">
                <span className="text-2xl drop-shadow-[0_0_10px_rgba(197,160,89,0.8)]">🏪</span>
                <h4 className="text-lg font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D1] to-[#C5A059]">Store Owners</h4>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans italic opacity-90 group-hover:opacity-100 transition-opacity">“Expand your reach — list your store and connect with thousands of customers.”</p>
            </div>
            <Link href="/login?redirect=%2Fdashboard%3Fapply%3Dvendor" className="relative z-10 mt-6 w-full text-center py-3 rounded-xl bg-gradient-to-r from-[#C5A059]/10 to-transparent border border-[#C5A059]/40 text-[#C5A059] text-[10px] sm:text-xs font-bold uppercase tracking-widest group-hover:bg-[#C5A059] group-hover:text-[#0A1021] transition-all duration-500 shadow-inner">
              Apply as Store Owner
            </Link>
          </div>

          {/* Ticket 4: Raw Material Suppliers - Emerald */}
          <div className="w-[75vw] sm:w-[260px] md:w-auto md:min-w-0 snap-center shrink-0 bg-gradient-to-br from-[#0B3B24] to-[#041A0F] border border-[#C5A059]/40 rounded-2xl p-6 flex flex-col justify-between hover:border-[#C5A059] hover:-translate-y-2 transition-all duration-500 group shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(197,160,89,0.3)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C5A059]/20 to-transparent rounded-bl-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute -inset-[100%] group-hover:animate-[spin_6s_linear_infinite_reverse] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,rgba(197,160,89,0.1)_50%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5 border-b border-[#C5A059]/20 pb-3">
                <span className="text-2xl drop-shadow-[0_0_10px_rgba(197,160,89,0.8)]">🧶</span>
                <h4 className="text-lg font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D1] to-[#C5A059]">Suppliers</h4>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans italic opacity-90 group-hover:opacity-100 transition-opacity">“Support the handloom ecosystem — supply authentic raw materials to artisans.”</p>
            </div>
            <Link href="/login?redirect=%2Fdashboard%3Fapply%3Draw_material" className="relative z-10 mt-6 w-full text-center py-3 rounded-xl bg-gradient-to-r from-[#C5A059]/10 to-transparent border border-[#C5A059]/40 text-[#C5A059] text-[10px] sm:text-xs font-bold uppercase tracking-widest group-hover:bg-[#C5A059] group-hover:text-[#0A1021] transition-all duration-500 shadow-inner">
              Join as Supplier
            </Link>
          </div>

          {/* Ticket 5: B2B Partners - Deep Amethyst */}
          <div className="w-[75vw] sm:w-[260px] md:w-auto md:min-w-0 snap-center shrink-0 bg-gradient-to-br from-[#331C42] to-[#12091A] border border-[#C5A059]/40 rounded-2xl p-6 flex flex-col justify-between hover:border-[#C5A059] hover:-translate-y-2 transition-all duration-500 group shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(197,160,89,0.3)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C5A059]/20 to-transparent rounded-bl-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute -inset-[100%] group-hover:animate-[spin_4.5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,rgba(197,160,89,0.1)_50%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5 border-b border-[#C5A059]/20 pb-3">
                <span className="text-2xl drop-shadow-[0_0_10px_rgba(197,160,89,0.8)]">🏢</span>
                <h4 className="text-lg font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D1] to-[#C5A059]">B2B Partners</h4>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans italic opacity-90 group-hover:opacity-100 transition-opacity">“Collaborate with Bhulia for bulk orders, corporate gifting, and global trade.”</p>
            </div>
            <Link href="/login?redirect=%2Fdashboard%3Fapply%3Db2b" className="relative z-10 mt-6 w-full text-center py-3 rounded-xl bg-gradient-to-r from-[#C5A059]/10 to-transparent border border-[#C5A059]/40 text-[#C5A059] text-[10px] sm:text-xs font-bold uppercase tracking-widest group-hover:bg-[#C5A059] group-hover:text-[#0A1021] transition-all duration-500 shadow-inner">
              Partner with Us
            </Link>
          </div>

        </div>

        {/* Bottom Section: Corporate Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2 pb-4">
          
          {/* Col 1: Branding & Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity w-fit">
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                <Image src="/logo.png" alt="Bhulia Logo" fill className="object-cover scale-[1.15]" />
              </div>
              <div>
                <h4 className="text-lg font-serif font-bold text-[#C5A059] leading-none">Bhulia.com</h4>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Only original Sambalpuri</p>
              </div>
            </Link>
            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              Discover 100% Authentic Sambalpuri Handloom Sarees at Bhulia.com — each piece carries the Bhulia Verified Seal, connecting you directly to real weavers. By choosing us, you help preserve Odisha’s 800‑year heritage while supporting artisans at fair prices.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">Quick Links</h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><Link href="/directory" className="hover:text-[#C5A059] transition-colors">Our Weaver Network</Link></li>
              <li><Link href="/verify" className="hover:text-[#C5A059] transition-colors">Verify Bhulia.com Certificate</Link></li>
              <li><Link href="/p/live-silk-rates" className="hover:text-[#C5A059] transition-colors">Live Silk & Yarn Rates</Link></li>
              <li><Link href="/p/sd-digital-services" className="hover:text-[#C5A059] transition-colors">SD Digital Services</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">Customer Care</h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><Link href="/p/artisan-payout-guide" className="hover:text-[#C5A059] transition-colors">Artisan Payout Guide</Link></li>
              <li><Link href="/p/secure-bvc-armored-transit" className="hover:text-[#C5A059] transition-colors">Secure BVC Armored Transit</Link></li>
              <li><Link href="/p/platform-return-policy" className="hover:text-[#C5A059] transition-colors">Platform Return Policy</Link></li>
              <li><Link href="/p/contact-us" className="hover:text-[#C5A059] transition-colors">24/7 Concierge Support</Link></li>
            </ul>
          </div>

          {/* Col 4: Stay Updated (Newsletter) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">Stay Updated</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Subscribe for daily live silk rates, artisan drop announcements, and exclusive Bhulia.com verified collection releases.
            </p>
            <div className="flex items-center gap-2 bg-[#0B2B26] border border-[#C5A059]/40 rounded-xl p-1.5 shadow-inner">
              <input type="email" placeholder="Email Address" className="w-full bg-transparent px-3 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none" />
              <button className="bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_15px_rgba(197,160,89,0.3)] shrink-0 cursor-pointer">
                Join
              </button>
            </div>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-[#C5A059]/20 text-xs text-gray-400 font-mono">
          <p>© 2026 Shyam Dash Creation. All sovereign rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/p/privacy-policy" className="hover:text-[#C5A059] transition-colors">Privacy Policy</Link>
            <Link href="/p/terms-of-service" className="hover:text-[#C5A059] transition-colors">Terms of Service</Link>
            <Link href="/p/bhulia-registry-clearance" className="hover:text-[#C5A059] transition-colors">Bhulia.com Registry Clearance</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
