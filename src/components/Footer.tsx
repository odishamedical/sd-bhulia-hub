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
            <h3 className="text-lg font-serif font-bold tracking-widest text-[#C5A059] uppercase mb-1">Shyam Dash Global Network</h3>
            <p className="text-xs text-gray-300 uppercase tracking-widest">Continuous Global Ecosystem Menu E.g. Trust • Heritage • Innovation • Future</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-gray-300">Ecosystem Status:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              All 4 Hub Nodes Operational
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 border-b border-[#C5A059]/20 pb-6 md:pb-8">
          
          {/* Hub 1: Gold Hub */}
          <div className="bg-[#0A3A35] border border-[#C5A059]/30 rounded-2xl p-5 flex flex-col justify-between hover:border-[#C5A059] transition-all group shadow-lg">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-mono font-bold text-[#C5A059] bg-[#C5A059]/20 px-2.5 py-1 rounded border border-[#C5A059]/30">HUB 01</span>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-[#C5A059] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </div>
              <h4 className="text-base font-serif font-bold text-white mb-2 group-hover:text-[#C5A059] transition-colors">shyamdash.com</h4>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">Our flagship Productive Luxury Gold Jewelry Marketplace. Featuring live MCX tickers & Sequel Armored transit.</p>
            </div>
            <a href="https://sd-gold-hub.vercel.app" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C5A059] hover:text-white transition-colors">
              Explore Gold Hub →
            </a>
          </div>

          {/* Hub 2: Bhulia Hub (Active) */}
          <div className="bg-[#0D4B45] border-2 border-[#C5A059] rounded-2xl p-5 flex flex-col justify-between shadow-[0_0_25px_rgba(197,160,89,0.3)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#C5A059]/20 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-mono font-bold text-[#C5A059] bg-[#C5A059]/30 px-2.5 py-1 rounded border border-[#C5A059]">ACTIVE HUB</span>
                <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse"></span>
              </div>
              <h4 className="text-base font-serif font-bold text-[#C5A059] mb-2">bhulia.com</h4>
              <p className="text-xs text-gray-200 leading-relaxed font-sans">Our sovereign Sambalpuri Saree & Handloom Collective. Direct artisan empowerment & Bhulia.com verification.</p>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-300">
              Currently Exploring
            </div>
          </div>

          {/* Hub 3: Dehapa Hub */}
          <div className="bg-[#0A3A35] border border-[#C5A059]/30 rounded-2xl p-5 flex flex-col justify-between hover:border-cyan-400 transition-all group shadow-lg">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/20 px-2.5 py-1 rounded border border-cyan-500/30">HUB 03</span>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-cyan-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </div>
              <h4 className="text-base font-serif font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">dehapa.com</h4>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">Our Medplum-powered Healthcare Operating System. Providing world-class telemedicine & secure patient portals.</p>
            </div>
            <a href="https://sd-dehapa-hub.vercel.app" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-300 hover:text-white transition-colors">
              Explore Health Hub →
            </a>
          </div>

          {/* Hub 4: IT Hub */}
          <div className="bg-[#0A3A35] border border-[#C5A059]/30 rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-400 transition-all group shadow-lg">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded border border-indigo-500/30">HUB 04</span>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </div>
              <h4 className="text-base font-serif font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">SD IT Hub</h4>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">Our Enterprise SaaS & Technology Infrastructure Division. Automated Stripe billing & Support OS ticketing.</p>
            </div>
            <a href="https://sd-it-hub.vercel.app" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-300 hover:text-white transition-colors">
              Explore IT Hub →
            </a>
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
