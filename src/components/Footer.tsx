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

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 border-b border-[#C5A059]/20 pb-6 md:pb-8">
          
          {/* Ticket 1: Resellers */}
          <div className="bg-gradient-to-b from-[#0A3A35] to-[#051815] border-2 border-dashed border-[#C5A059]/40 rounded-2xl p-5 flex flex-col justify-between hover:border-[#C5A059] transition-all group shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#C5A059]/10 rounded-bl-full pointer-events-none"></div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🤝</span>
                <h4 className="text-base font-serif font-bold text-[#C5A059]">Resellers</h4>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans italic">“Start your journey as a Bhulia Reseller — grow with us, no upfront cost.”</p>
            </div>
            <Link href="/register-franchise" className="mt-6 w-full text-center py-2.5 rounded-xl bg-[#C5A059]/10 text-[#C5A059] text-xs font-bold uppercase tracking-widest group-hover:bg-[#C5A059] group-hover:text-[#0A1021] transition-all border border-[#C5A059]/30 shadow-sm">
              Apply as Reseller
            </Link>
          </div>

          {/* Ticket 2: Weavers */}
          <div className="bg-gradient-to-b from-[#0A3A35] to-[#051815] border-2 border-dashed border-[#C5A059]/40 rounded-2xl p-5 flex flex-col justify-between hover:border-[#C5A059] transition-all group shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#C5A059]/10 rounded-bl-full pointer-events-none"></div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🧵</span>
                <h4 className="text-base font-serif font-bold text-[#C5A059]">Weavers</h4>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans italic">“Showcase your craft to the world — Bhulia empowers real Sambalpuri weavers.”</p>
            </div>
            <Link href="/register-weaver" className="mt-6 w-full text-center py-2.5 rounded-xl bg-[#C5A059]/10 text-[#C5A059] text-xs font-bold uppercase tracking-widest group-hover:bg-[#C5A059] group-hover:text-[#0A1021] transition-all border border-[#C5A059]/30 shadow-sm">
              Join as Weaver
            </Link>
          </div>

          {/* Ticket 3: Store Owners */}
          <div className="bg-gradient-to-b from-[#0A3A35] to-[#051815] border-2 border-dashed border-[#C5A059]/40 rounded-2xl p-5 flex flex-col justify-between hover:border-[#C5A059] transition-all group shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#C5A059]/10 rounded-bl-full pointer-events-none"></div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🏪</span>
                <h4 className="text-base font-serif font-bold text-[#C5A059]">Store Owners</h4>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans italic">“Expand your reach — list your store and connect with thousands of customers.”</p>
            </div>
            <Link href="/register-vendor" className="mt-6 w-full text-center py-2.5 rounded-xl bg-[#C5A059]/10 text-[#C5A059] text-xs font-bold uppercase tracking-widest group-hover:bg-[#C5A059] group-hover:text-[#0A1021] transition-all border border-[#C5A059]/30 shadow-sm">
              Apply as Store Owner
            </Link>
          </div>

          {/* Ticket 4: Raw Material Suppliers */}
          <div className="bg-gradient-to-b from-[#0A3A35] to-[#051815] border-2 border-dashed border-[#C5A059]/40 rounded-2xl p-5 flex flex-col justify-between hover:border-[#C5A059] transition-all group shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#C5A059]/10 rounded-bl-full pointer-events-none"></div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🧶</span>
                <h4 className="text-base font-serif font-bold text-[#C5A059]">Suppliers</h4>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans italic">“Support the handloom ecosystem — supply authentic raw materials to artisans.”</p>
            </div>
            <Link href="/register-vendor" className="mt-6 w-full text-center py-2.5 rounded-xl bg-[#C5A059]/10 text-[#C5A059] text-xs font-bold uppercase tracking-widest group-hover:bg-[#C5A059] group-hover:text-[#0A1021] transition-all border border-[#C5A059]/30 shadow-sm">
              Join as Supplier
            </Link>
          </div>

          {/* Ticket 5: B2B Partners */}
          <div className="bg-gradient-to-b from-[#0A3A35] to-[#051815] border-2 border-dashed border-[#C5A059]/40 rounded-2xl p-5 flex flex-col justify-between hover:border-[#C5A059] transition-all group shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#C5A059]/10 rounded-bl-full pointer-events-none"></div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🏢</span>
                <h4 className="text-base font-serif font-bold text-[#C5A059]">B2B Partners</h4>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans italic">“Collaborate with Bhulia for bulk orders, corporate gifting, and global trade.”</p>
            </div>
            <Link href="/register-franchise" className="mt-6 w-full text-center py-2.5 rounded-xl bg-[#C5A059]/10 text-[#C5A059] text-xs font-bold uppercase tracking-widest group-hover:bg-[#C5A059] group-hover:text-[#0A1021] transition-all border border-[#C5A059]/30 shadow-sm">
              Partner with Us
            </Link>
          </div>

        </div>

        {/* Bottom Section: Corporate Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2 pb-4">
          
          {/* Col 1: Branding & Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity w-fit">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#C5A059] shrink-0">
                <Image src="/bhulia_logo_final.jpg" alt="Bhulia Logo" fill className="object-cover" />
              </div>
              <div>
                <h4 className="text-lg font-serif font-bold text-[#C5A059] leading-none">Shyam Dash</h4>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">India's Verified Handloom Marketplace.</p>
              </div>
            </Link>
            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              The premier luxury marketplace for authenticated, Bhulia.com Verified Sambalpuri handlooms. Partnering exclusively with master weavers and primary cooperative societies across India.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">Quick Links</h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><Link href="/store/maa-samaleswari-weavers" className="hover:text-[#C5A059] transition-colors">Our Weaver Network</Link></li>
              <li><Link href="/store/bhagabata-meher" className="hover:text-[#C5A059] transition-colors">Verify Bhulia.com Certificate</Link></li>
              <li><Link href="/" className="hover:text-[#C5A059] transition-colors">Live Silk & Yarn Rates</Link></li>
              <li><Link href="/" className="hover:text-[#C5A059] transition-colors">SD Digital Services</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">Customer Care</h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><Link href="/p/artisan-payout-guide" className="hover:text-[#C5A059] transition-colors">Artisan Payout Guide</Link></li>
              <li><Link href="/p/secure-bvc-armored-transit" className="hover:text-[#C5A059] transition-colors">Secure BVC Armored Transit</Link></li>
              <li><Link href="/p/platform-return-policy" className="hover:text-[#C5A059] transition-colors">Platform Return Policy</Link></li>
              <li><Link href="/p/contact-support" className="hover:text-[#C5A059] transition-colors">24/7 Concierge Support</Link></li>
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
