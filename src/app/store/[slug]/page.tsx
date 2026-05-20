"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

interface StoreListing {
  id: string;
  slug: string;
  name: string;
  cluster: string;
  village: string;
  activeWeaversCount: number;
  giTagNumber: string;
  warehouseCapacity: string;
  specialtyTags: string[];
  description: string;
  img: string;
  memberRoster: string[];
  contactDetails?: {
    address: string;
    phone: string;
    whatsapp: string;
    email: string;
  };
}

const MASTER_STORES: StoreListing[] = [
  {
    id: "STR-001",
    slug: "maa-samaleswari-weavers",
    name: "Maa Samaleswari Weavers Cooperative Society (PWCS)",
    cluster: "Bargarh Cluster",
    village: "Barpali, Bargarh",
    activeWeaversCount: 142,
    giTagNumber: "GI-Cert: #OD-7492-SB",
    warehouseCapacity: "4,500 units/month",
    specialtyTags: ["Pasapalli Ikat", "Mercerized Cotton", "Traditional Phoda Kumbha"],
    description: "Authentic GI-Tagged Sambalpuri saree collective operating 142 active pit looms in Barpali. Specializing in high-density handspun cotton Pasapalli Ikat and traditional temple borders.",
    img: "/bhulia-hero.png",
    memberRoster: ["Weaver Kishore Meher", "Weaver Trilochana Meher", "Weaver Pramod Meher", "Weaver Subodh Meher"],
    contactDetails: {
      address: "Main Handloom Depot, Barpali, Bargarh, Odisha 768028",
      phone: "+91 94370 12345",
      whatsapp: "919437012345",
      email: "samaleswari.pwcs@bhulia.com"
    }
  },
  {
    id: "STR-002",
    slug: "sonepur-royal-silk",
    name: "Sonepur Royal Silk PWCS",
    cluster: "Sonepur Cluster",
    village: "Sonepur Town",
    activeWeaversCount: 85,
    giTagNumber: "GI-Cert: #OD-9921-SP",
    warehouseCapacity: "2,200 units/month",
    specialtyTags: ["Pure Mulberry Silk", "Sonepur Bomkai", "Silk Mark Gold"],
    description: "Premier Primary Weaving Cooperative Society producing luxurious 3-ply Mulberry silk Bomkai sarees. Featuring rich extra-weft gold thread work and certified Silk Mark tags.",
    img: "/bhulia-hero.png",
    memberRoster: ["Weaver Gopinath Meher", "Weaver Janardan Meher", "Weaver Raghunath Meher"],
    contactDetails: {
      address: "Subarnapur Royal Guild, Sonepur, Odisha 767017",
      phone: "+91 94371 54321",
      whatsapp: "919437154321",
      email: "royal.silk@bhulia.com"
    }
  },
  {
    id: "STR-003",
    slug: "bhagabata-meher",
    name: "Bhagabata Meher Master Ikat Workshop",
    cluster: "Bargarh Cluster",
    village: "Bijepur, Bargarh",
    activeWeaversCount: 28,
    giTagNumber: "GI-Cert: #OD-8832-BJ",
    warehouseCapacity: "900 units/month",
    specialtyTags: ["Bijepur Cotton Ikat", "Natural Vegetable Dyes", "Custom Bandha"],
    description: "Elite independent master weaver workshop producing world-class Bijepur cotton Ikat sarees. Renowned for flawless mathematical symmetry and organic vegetable dye formulations.",
    img: "/bhulia-hero.png",
    memberRoster: ["Weaver Bhagabata Meher", "Weaver Sarat Meher", "Weaver Dibakar Meher"],
    contactDetails: {
      address: "Weaving Hamlet, Bijepur, Bargarh, Odisha 768032",
      phone: "+91 94372 98765",
      whatsapp: "919437298765",
      email: "bhagabata.workshop@bhulia.com"
    }
  }
];

const DEFAULT_STORE: StoreListing = {
  id: "STR-999",
  slug: "odisha-handloom-cooperative",
  name: "Odisha Central Handloom Cooperative Society",
  cluster: "Central Odisha Belt",
  village: "Bhubaneswar",
  activeWeaversCount: 350,
  giTagNumber: "GI-Cert: #OD-0001-CO",
  warehouseCapacity: "10,000 units/month",
  specialtyTags: ["Traditional Ikat", "Escrow Logistics"],
  description: "Centralized warehouse coordinating logistics and payouts for grassroots primary weaving cooperative societies.",
  img: "/bhulia-hero.png",
  memberRoster: ["Master Weaver Syndicate Group"],
  contactDetails: {
    address: "Janpath Road, Bhubaneswar, Odisha 751001",
    phone: "+91 674 2540123",
    whatsapp: "916742540123",
    email: "cooperative.central@bhulia.com"
  }
};

const STORE_CATALOG_SAREES = [
  { id: "SAR-S101", title: "Maa Samaleswari Cotton Pasapalli", category: "Cotton Classics", desc: "Cooperative woven dense checker-board cotton saree with traditional phoda border.", price: "₹ 5,299", weave: "Pasapalli Cotton", time: "Barpali Hub Stock", img: "/bhulia-hero.png" },
  { id: "SAR-S102", title: "Sonepur Royal Zari Bomkai Pata", category: "Silk Masterpieces", desc: "Gold zari extra-weft thread work on pure silk mulberry weave.", price: "₹ 18,500", weave: "Bomkai Pata", time: "Sonepur Town Stock", img: "/bhulia-hero.png" },
  { id: "SAR-S103", title: "Bijepur Natural Dye Cotton Ikat", category: "Cotton Classics", desc: "Organic madder root red and indigo dyed geometric bandha pattern.", price: "₹ 5,899", weave: "Vegetable Dye Cotton", time: "Bijepur Workshop Stock", img: "/bhulia-hero.png" }
];

export default function StoreDetailPage() {
  const params = useParams();
  const rawSlug = typeof params?.slug === "string" ? params.slug : "maa-samaleswari-weavers";
  const storeSlug = rawSlug.toLowerCase();

  const store = MASTER_STORES.find((s) => s.slug === storeSlug || s.id.toLowerCase() === storeSlug) || {
    ...DEFAULT_STORE,
    id: storeSlug.toUpperCase(),
    slug: storeSlug,
    name: `Store/PWCS (${storeSlug.replace(/-/g, " ")})`,
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
    const shareUrl = `${window.location.origin}/store/${store.slug}?ref=${userUid}`;
    const message = `Explore the cooperative handloom collection from ${store.name}. Buy direct from verified weavers collectives. ${shareUrl}`;

    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
    }
  };

  return (
    <main className="relative flex-1 w-full bg-[#FDFBF7] text-[#0D1917] font-sans flex flex-col min-h-screen">
      
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
              <p className="hidden sm:block text-[11px] text-gray-300 font-medium tracking-wide mt-1 truncate">Sambalpuri Store/PWCS Portal</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-200">
            <Link href="/" className="hover:text-[#C5A059] transition-colors pb-1">Home</Link>
            <a href="#roster" className="hover:text-[#C5A059] transition-colors pb-1">Weaver Roster</a>
            <a href="#warehouse" className="hover:text-[#C5A059] transition-colors pb-1">Warehouse Specs</a>
            <a href="#inventory" className="hover:text-[#C5A059] transition-colors pb-1">Bulk Inventory</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {userAvatar ? (
              <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1 sm:py-2 bg-[#0A3A35] rounded-xl border border-[#C5A059]/50 shadow-inner">
                <img src={userAvatar} alt="User Avatar" className="w-6 sm:w-8 h-6 sm:h-8 rounded-full border border-[#C5A059]" />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-none">{userName}</span>
                  <span className="text-[9px] text-[#C5A059] uppercase tracking-widest mt-0.5">{userRole}</span>
                </div>
              </div>
            ) : (
              <a href="https://sd-auth-center.vercel.app" className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow">
                <span>Sign In / Register</span>
              </a>
            )}

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
            <a href="#roster" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Weaver Roster</a>
            <a href="#warehouse" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Warehouse Specs</a>
            {!userAvatar && (
              <a href="https://sd-auth-center.vercel.app" onClick={() => setMobileNavOpen(false)} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider">
                <span>Sign In / Register</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Store Front main display */}
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8 relative z-10">
        
        {/* Info panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Block: Image, GI tag details */}
          <div className="lg:col-span-4 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 flex flex-col justify-between shadow-xl text-white">
            <div className="space-y-6">
              <div className="relative w-full h-80 rounded-2xl overflow-hidden border-2 border-[#C5A059]/50 shadow-lg bg-[#051815]">
                <Image src={store.img} alt={store.name} fill className="object-cover" />
                <div className="absolute bottom-4 left-4 bg-[#0B2B26]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#C5A059]/40 text-xs font-mono text-[#C5A059] font-bold">
                  {store.giTagNumber}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block mb-1">Cooperative Hub</span>
                <p className="text-sm font-semibold text-white font-serif">{store.village}, {store.cluster}</p>
              </div>

              <div id="warehouse" className="grid grid-cols-2 gap-4 border-t border-[#C5A059]/20 pt-4">
                <div className="bg-[#0A3A35] rounded-xl p-3 border border-[#C5A059]/20">
                  <span className="text-[9px] uppercase tracking-widest text-gray-300 block mb-1">Active Weavers</span>
                  <p className="text-xl font-black text-[#C5A059]">{store.activeWeaversCount}</p>
                </div>
                <div className="bg-[#0A3A35] rounded-xl p-3 border border-[#C5A059]/20">
                  <span className="text-[9px] uppercase tracking-widest text-gray-300 block mb-1">Monthly Capacity</span>
                  <p className="text-xs font-black text-[#C5A059] uppercase mt-1">{store.warehouseCapacity}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-[#C5A059]/20 pt-4 space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-gray-300 font-bold block">Share Cooperative Catalog</span>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleSocialShare("whatsapp")} className="flex items-center justify-center gap-1 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-xl font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer">
                  <span>📲 Share WA</span>
                </button>
                <button onClick={() => handleSocialShare("facebook")} className="flex items-center justify-center gap-1 py-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] rounded-xl font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer">
                  <span>📘 Share FB</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Block: Store Description & Member Roster */}
          <div className="lg:col-span-8 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl text-white">
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold uppercase tracking-widest mb-3">
                  <span>Verified PWCS Store</span>
                </span>
                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#C5A059] leading-tight">{store.name}</h2>
              </div>

              <div className="space-y-4 leading-relaxed text-sm font-sans text-gray-200">
                <p className="border-l-2 border-[#C5A059] pl-3 py-1 text-gray-300">
                  {store.description}
                </p>
              </div>

              {/* Roster Section */}
              <div id="roster" className="border-t border-[#C5A059]/20 pt-6">
                <h3 className="text-xs uppercase tracking-widest text-[#C5A059] font-bold mb-3">Weaver Guild Member Roster</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {store.memberRoster.map((member, idx) => (
                    <div key={idx} className="bg-[#0A3A35] border border-[#C5A059]/30 rounded-xl p-3 text-center">
                      <span className="text-xs font-semibold text-white block">{member}</span>
                      <span className="text-[9px] text-[#C5A059] uppercase tracking-widest block mt-0.5">Master Weaver</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-[#C5A059]/20 pt-6 mt-6">
              <h3 className="text-xs uppercase tracking-widest text-[#C5A059] font-bold mb-3">Specialty Blueprints</h3>
              <div className="flex flex-wrap gap-2">
                {store.specialtyTags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-[#0A3A35] border border-[#C5A059]/30 text-white rounded-lg text-xs font-semibold">{tag}</span>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Store Catalog */}
        <div id="inventory" className="space-y-4 pt-6 border-t border-[#C5A059]/20">
          <h3 className="text-xl md:text-3xl font-serif text-[#0B2B26] font-bold tracking-wider">Bulk Warehouse Inventory Catalog</h3>
          <p className="text-[10px] md:text-xs text-neutral-600 uppercase tracking-widest font-semibold">Reserve bulk or individual cooperative items directly from the warehouse depot</p>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
            {STORE_CATALOG_SAREES.map((saree) => (
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
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest block">Logistics Sourcing</span>
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
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Sovereign Cooperative Ecosystem</p>
          </div>
          <span className="text-[10px] font-mono text-gray-400">© 2026 Bhulia.com. All Rights Reserved.</span>
        </div>
      </footer>
    </main>
  );
}
