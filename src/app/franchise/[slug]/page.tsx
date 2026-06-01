"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import UserMenu from "@/components/UserMenu";
import Link from "next/link";
import { useParams } from "next/navigation";

interface FranchiseListing {
  id: string;
  slug: string;
  name: string;
  region: string;
  city: string;
  phygitalOutletsCount: number;
  referralsTracked: number;
  totalCommissionPaid: string;
  specialtyTags: string[];
  description: string;
  img: string;
  outletsList: string[];
  contactDetails?: {
    address: string;
    phone: string;
    whatsapp: string;
    email: string;
  };
}

const MASTER_FRANCHISES: FranchiseListing[] = [
  {
    id: "FRA-001",
    slug: "bargarh-phygital-hub",
    name: "Bargarh Phygital Hub & Logistics Center",
    region: "Western Odisha",
    city: "Bargarh Town",
    phygitalOutletsCount: 12,
    referralsTracked: 1450,
    totalCommissionPaid: "₹ 1,84,500",
    specialtyTags: ["Drop-off Center", "Phygital Showrooms", "Local Referral Tracking"],
    description: "Serving as the primary regional drop-off and pickup terminal in Western Odisha. Integrating local weavers with physical franchise outlets for direct customer inspections.",
    img: "/bhulia-hero.png",
    outletsList: ["Barpali Craft Stall", "Bargarh Main Showroom", "Attabira Weaver Point"],
    contactDetails: {
      address: "Logistics Hub Road, Bargarh, Odisha 768028",
      phone: "+91 99370 11111",
      whatsapp: "919937011111",
      email: "bargarh.franchise@bhulia.com"
    }
  },
  {
    id: "FRA-002",
    slug: "sonepur-heritage-center",
    name: "Sonepur Heritage Center & Commission Hub",
    region: "Central-West Odisha",
    city: "Sonepur Town",
    phygitalOutletsCount: 8,
    referralsTracked: 920,
    totalCommissionPaid: "₹ 1,12,000",
    specialtyTags: ["Silk Mark Verification", "Quality Testing", "Fast Disbursal"],
    description: "Bridging the gap between rural master weavers and international customers. Operating quality testing laboratories and direct Jan Dhan payout disbursements.",
    img: "/bhulia-hero.png",
    outletsList: ["Sonepur Palace Craft Wing", "Dasrajpur Weaver Collective Hub"],
    contactDetails: {
      address: "Heritage Way, Sonepur Town, Odisha 767017",
      phone: "+91 99370 22222",
      whatsapp: "919937022222",
      email: "sonepur.franchise@bhulia.com"
    }
  }
];

const DEFAULT_FRANCHISE: FranchiseListing = {
  id: "FRA-999",
  slug: "bhubaneswar-craft-depot",
  name: "Bhubaneswar Central Craft Depot & Franchise Network",
  region: "Coastal Odisha",
  city: "Bhubaneswar",
  phygitalOutletsCount: 25,
  referralsTracked: 5200,
  totalCommissionPaid: "₹ 5,60,000",
  specialtyTags: ["Statewide Distribution", "Bulk Corporate Deals"],
  description: "Main metropolitan distribution hub and admin franchise network covering capital region physical retail locations.",
  img: "/bhulia-hero.png",
  outletsList: ["Janpath Experience Center", "Patia Craft Outlet", "Cuttack Link Depot"],
  contactDetails: {
    address: "Infocity Road, Patia, Bhubaneswar, Odisha 751024",
    phone: "+91 99370 33333",
    whatsapp: "919937033333",
    email: "central.franchise@bhulia.com"
  }
};

const FRANCHISE_CATALOG_SAREES = [
  { id: "SAR-F101", title: "Franchise Certified Silk Pasapalli Pata", category: "Silk Masterpieces", desc: "Double ikat pure silk pata, certified by franchise inspection specialists.", price: "₹ 28,000", weave: "Double Ikat Silk", time: "Bargarh Hub Ready", img: "/bhulia-hero.png" },
  { id: "SAR-F102", title: "Bomkai Cotton Daily Drape Saree", category: "Cotton Classics", desc: "Lightweight premium handspun cotton Bomkai with classic thread borders.", price: "₹ 6,500", weave: "Bomkai Cotton", time: "Sonepur Hub Ready", img: "/bhulia-hero.png" }
];

export default function FranchiseDetailPage() {
  const params = useParams();
  const rawSlug = typeof params?.slug === "string" ? params.slug : "bargarh-phygital-hub";
  const franchiseSlug = rawSlug.toLowerCase();

  const franchise = MASTER_FRANCHISES.find((f) => f.slug === franchiseSlug || f.id.toLowerCase() === franchiseSlug) || {
    ...DEFAULT_FRANCHISE,
    id: franchiseSlug.toUpperCase(),
    slug: franchiseSlug,
    name: `Franchise Hub (${franchiseSlug.replace(/-/g, " ")})`,
  };

  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userUid, setUserUid] = useState<string>("sd_super_admin_custom_uid");
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = () => {
      const email = localStorage.getItem("sd_current_user_email");
      const name = localStorage.getItem("sd_current_user_name");
      const avatar = localStorage.getItem("sd_current_user_avatar");
      const role = localStorage.getItem("sd_current_user_role");
      const uid = localStorage.getItem("sd_current_user_uid") || "sd_super_admin_custom_uid";

      if (email) {
        setUserName(name || email.split("@")[0]);
        setUserAvatar(avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80");
        setUserRole(role || "user");
        setUserUid(uid);
      } else {
        setUserName(null);
        setUserAvatar(null);
        setUserRole(null);
        setUserUid("sd_super_admin_custom_uid");
      }
    };

    checkAuth();
    window.addEventListener("sd_auth_change", checkAuth);

    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const ref = p.get("ref");
      if (ref) {
        localStorage.setItem("sd_referral_id", ref);
      }
    }

    return () => window.removeEventListener("sd_auth_change", checkAuth);
  }, []);

  const handleSocialShare = (platform: "whatsapp" | "facebook") => {
    const shareUrl = `${window.location.origin}/franchise/${franchise.slug}?ref=${userUid}`;
    const message = `Explore the phygital craft collection and franchise hub of ${franchise.name}. Direct logistics and tracking enabled. ${shareUrl}`;

    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
    }
  };

  return (
    <main className="relative flex-1 w-full bg-[#051815] text-white font-sans flex flex-col min-h-screen">
      
      {/* Top Sticky Header */}
      <header className="sticky top-0 w-full z-50 bg-[#0B2B26] border-b border-[#C5A059]/40 px-4 sm:px-6 py-3 sm:py-4 shadow-lg flex flex-col gap-3">
        <div className="flex justify-between items-center gap-2 w-full">
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
            <div className="relative w-8 sm:w-14 h-8 sm:h-14 rounded-full overflow-hidden border border-[#C5A059] sm:border-2 shadow-[0_0_20px_rgba(197,160,89,0.6)] shrink-0">
              <Image src="/bhulia_logo_final.jpg" alt="Bhulia Gold Logo" fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <Link href="/">
                <h1 className="text-lg sm:text-2xl font-serif font-bold tracking-wider text-[#C5A059] leading-none hover:opacity-80 transition-opacity">BHULIA.COM</h1>
              </Link>
              <p className="hidden sm:block text-[11px] text-gray-300 font-medium tracking-wide mt-1 truncate">Sambalpuri Franchise Portal</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-200">
            <Link href="/" className="hover:text-[#C5A059] transition-colors pb-1">Home</Link>
            <a href="#outlets" className="hover:text-[#C5A059] transition-colors pb-1">Phygital Outlets</a>
            <a href="#commission" className="hover:text-[#C5A059] transition-colors pb-1">Commission Ticker</a>
            <a href="#inventory" className="hover:text-[#C5A059] transition-colors pb-1">Local Catalog</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <UserMenu />

            <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="lg:hidden flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] rounded-xl hover:bg-[#0D4B45] transition-all">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileNavOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden sticky top-[57px] z-40 bg-[#0B2B26]/98 backdrop-blur-md border-b border-[#C5A059]/40 px-6 py-6 space-y-4 shadow-2xl">
          <div className="flex flex-col space-y-3 text-xs font-bold uppercase tracking-widest text-gray-200">
            <Link href="/" className="text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Home</Link>
            <a href="#outlets" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Phygital Outlets</a>
            <a href="#commission" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Commission Ticker</a>
            {!userAvatar && (
              <a href="https://sd-auth-center.vercel.app" onClick={() => setMobileNavOpen(false)} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider">
                <span>Sign In / Register</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Franchise main layout */}
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8 relative z-10">
        
        {/* Info panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Block: Outlets and counters */}
          <div className="lg:col-span-4 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 flex flex-col justify-between shadow-xl text-white">
            <div className="space-y-6">
              <div className="relative w-full h-80 rounded-2xl overflow-hidden border-2 border-[#C5A059]/50 shadow-lg bg-[#051815]">
                <Image src={franchise.img} alt={franchise.name} fill className="object-cover" />
                <div className="absolute bottom-4 left-4 bg-[#0B2B26]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#C5A059]/40 text-xs font-mono text-[#C5A059] font-bold">
                  {franchise.region}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block mb-1">Franchise Head Office</span>
                <p className="text-sm font-semibold text-white font-serif">{franchise.city}</p>
              </div>

              <div id="commission" className="grid grid-cols-3 gap-2 border-t border-[#C5A059]/20 pt-4">
                <div className="bg-[#0A3A35] rounded-xl p-2.5 border border-[#C5A059]/20 text-center">
                  <span className="text-[8px] uppercase tracking-widest text-gray-300 block mb-1">Outlets</span>
                  <p className="text-base font-black text-[#C5A059]">{franchise.phygitalOutletsCount}</p>
                </div>
                <div className="bg-[#0A3A35] rounded-xl p-2.5 border border-[#C5A059]/20 text-center">
                  <span className="text-[8px] uppercase tracking-widest text-gray-300 block mb-1">Referrals</span>
                  <p className="text-base font-black text-[#C5A059]">{franchise.referralsTracked}</p>
                </div>
                <div className="bg-[#0A3A35] rounded-xl p-2.5 border border-[#C5A059]/20 text-center">
                  <span className="text-[8px] uppercase tracking-widest text-gray-300 block mb-1">Paid Out</span>
                  <p className="text-[9px] font-black text-green-400 mt-1 uppercase tracking-widest leading-none">{franchise.totalCommissionPaid}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-[#C5A059]/20 pt-4 space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-gray-300 font-bold block">Share Franchise Network</span>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleSocialShare("whatsapp")} className="flex items-center justify-center gap-1 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-xl font-bold text-[10px] uppercase tracking-wider cursor-pointer">
                  <span>📲 Share WA</span>
                </button>
                <button onClick={() => handleSocialShare("facebook")} className="flex items-center justify-center gap-1 py-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] rounded-xl font-bold text-[10px] uppercase tracking-wider cursor-pointer">
                  <span>📘 Share FB</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Block: Franchise Outlets and Live Tickers */}
          <div className="lg:col-span-8 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl text-white">
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold uppercase tracking-widest mb-3">
                  <span>Verified Franchise Hub</span>
                </span>
                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#C5A059] leading-tight">{franchise.name}</h2>
              </div>

              <div className="space-y-4 leading-relaxed text-sm font-sans text-gray-200">
                <p className="border-l-2 border-[#C5A059] pl-3 py-1 text-gray-300">
                  {franchise.description}
                </p>
              </div>

              {/* Phygital outlets Roster */}
              <div id="outlets" className="border-t border-[#C5A059]/20 pt-6">
                <h3 className="text-xs uppercase tracking-widest text-[#C5A059] font-bold mb-3">Phygital outlets locations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {franchise.outletsList.map((outlet, idx) => (
                    <div key={idx} className="bg-[#0A3A35] border border-[#C5A059]/30 rounded-xl p-3 text-center">
                      <span className="text-xs font-semibold text-white block">{outlet}</span>
                      <span className="text-[9px] text-green-400 uppercase tracking-widest block mt-1">● Active Drop-off</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-[#C5A059]/20 pt-6 mt-6">
              <h3 className="text-xs uppercase tracking-widest text-[#C5A059] font-bold mb-3">Specialty Operations</h3>
              <div className="flex flex-wrap gap-2">
                {franchise.specialtyTags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-[#0A3A35] border border-[#C5A059]/30 text-white rounded-lg text-xs font-semibold">{tag}</span>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Localized Catalog */}
        <div id="inventory" className="space-y-4 pt-6 border-t border-[#C5A059]/20">
          <h3 className="text-xl md:text-3xl font-serif text-[#C5A059] font-bold tracking-wider">Local Franchise Depot Catalog</h3>
          <p className="text-[10px] md:text-xs text-gray-300 uppercase tracking-widest font-semibold">Examine physical products at drop-off locations or purchase online with immediate delivery dispatch</p>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
            {FRANCHISE_CATALOG_SAREES.map((saree) => (
              <div key={saree.id} className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#C5A059] transition-all duration-300 shadow-xl p-0.5 text-white">
                <div className="relative w-full h-56 sm:h-72 overflow-hidden bg-[#0B2B26] rounded-t-xl">
                  <Image src={saree.img} alt={saree.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-[#C5A059] text-[#0A1021] text-[9px] font-bold uppercase tracking-widest rounded shadow">{saree.weave}</span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-[#C5A059] transition-colors mb-1 line-clamp-1">{saree.title}</h4>
                    <p className="text-[10px] text-gray-300 leading-relaxed font-sans line-clamp-2">{saree.desc}</p>
                  </div>

                  <div className="flex justify-between items-center border-t border-[#C5A059]/20 pt-2.5">
                    <div>
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest block">Direct Price</span>
                      <span className="text-base font-serif font-bold text-[#C5A059]">{saree.price}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest block">Drop-off Hub</span>
                      <span className="text-[10px] font-mono text-gray-200 font-bold">{saree.time}</span>
                    </div>
                  </div>

                  {/* Share buttons on cards */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#C5A059]/10">
                    <button onClick={() => {
                      const shareUrl = `${window.location.origin}/product/${encodeURIComponent(saree.title.toLowerCase().replace(/\s+/g, "-"))}?ref=${userUid}`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent("Check out this " + saree.title + ": " + shareUrl)}`, "_blank");
                    }} className="flex items-center justify-center gap-1 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                      <span>📲 Share</span>
                    </button>
                    <button onClick={() => {
                      const shareUrl = `${window.location.origin}/product/${encodeURIComponent(saree.title.toLowerCase().replace(/\s+/g, "-"))}?ref=${userUid}`;
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
                    }} className="flex items-center justify-center gap-1 py-1.5 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                      <span>📘 Share</span>
                    </button>
                  </div>

                  <Link href={`/product/${encodeURIComponent(saree.title.toLowerCase().replace(/\s+/g, "-"))}`} className="bhulia-gold-button w-full py-2 text-[#0A1021] font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition-all text-center block">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Global Footer */}
      <footer className="w-full bg-[#051815] border-t border-[#C5A059]/40 text-white py-8 px-6 mt-auto">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-sm font-serif font-bold tracking-widest text-[#C5A059] uppercase mb-1">Shyam Dash Global Network</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Sovereign Franchise Ecosystem</p>
          </div>
          <span className="text-[10px] font-mono text-gray-400">© 2026 Bhulia.com. All Rights Reserved.</span>
        </div>
      </footer>
    </main>
  );
}
