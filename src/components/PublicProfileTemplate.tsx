"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/products";
import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import ShareWidget from "./ShareWidget";
import Breadcrumbs, { BreadcrumbItem } from "./Breadcrumbs";
import { useRouter } from "next/navigation";
import { Star, ShieldCheck, Building, User, Wallet } from "lucide-react";

export interface PublicProfileProps {
  type: "weaver" | "store" | "wholesaler" | "supplier";
  profile: {
    name: string;
    image: string;
    district: string;
    state: string;
    country?: string;
    description: string;
    address: string;
    rawAddress?: any;
    phone: string;
    whatsapp: string;
    status?: string;
    googlePlaceId?: string;
    googleRating?: number;
    googleReviewsCount?: number;
    listingType?: string;
    productsOffered?: string;
    weaverExperience?: string;
    handloomExperience?: string;
    generations?: string;
    specialties?: string[];
    materials?: string[];
    scale?: string;
    googlePin?: string;
    gallery?: string[];
    videoUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    subscriptionTier?: string;
    kycDocumentUrl?: string;
    bankHolder?: string;
    bankName?: string;
    bankAccount?: string;
    bankIfsc?: string;
    bankUpi?: string;
  };
  products: Product[];
  allProducts?: Product[];
  allProfiles?: any[];
}

export default function PublicProfileTemplate({ type, profile, products = [], allProducts = [], allProfiles = [] }: PublicProfileProps) {
  const isWeaver = type === "weaver";
  const isStore = type === "store";
  const isWholesaler = type === "wholesaler";
  const isSupplier = type === "supplier";
  
  let badgeText = "Bhulia.com Verified Partner";
  if (isWeaver) badgeText = "Bhulia.com Verified Weavers";
  if (isStore) badgeText = "Bhulia.com Verified Sambalpuri Shop";
  if (isWholesaler) badgeText = "Bhulia.com Verified Wholesaler";
  if (isSupplier) badgeText = "Bhulia.com Verified Raw Material Supplier";

  let badgeColor = "text-purple-400 border-purple-400";
  if (isWeaver) badgeColor = "text-[#C5A059] border-[#C5A059]";
  if (isStore) badgeColor = "text-blue-400 border-blue-400";
  if (isSupplier) badgeColor = "text-emerald-500 border-emerald-500";

  let badgeBg = "bg-purple-400/10";
  if (isWeaver) badgeBg = "bg-[#C5A059]/10";
  if (isStore) badgeBg = "bg-blue-400/10";
  if (isSupplier) badgeBg = "bg-emerald-500/10";
  const [userRole, setUserRole] = useState<string | null>(null);
  const [quickSearch, setQuickSearch] = useState("");
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("sd_current_user_role"));
    }
  }, []);

  const breadcrumbItems: BreadcrumbItem[] = [];
  if (profile.country) breadcrumbItems.push({ label: profile.country, href: "/directory" });
  if (profile.state) breadcrumbItems.push({ label: profile.state, href: "/directory" });
  if (profile.district) breadcrumbItems.push({ label: profile.district, href: "/directory" });
  breadcrumbItems.push({ label: profile.name });

  // Get similar products (exclude current weaver's products, randomize 4)
  const similarProducts = React.useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    const safeProducts = Array.isArray(products) ? products : [];
    const currentProductIds = new Set(safeProducts.map(p => p.id));
    const others = allProducts.filter(p => !currentProductIds.has(p.id));
    return others.sort(() => Math.random() - 0.5).slice(0, 4);
  }, [allProducts, products]);

  // Get similar profiles (exclude current profile, randomize 4)
  const similarProfiles = React.useMemo(() => {
    if (!allProfiles || allProfiles.length === 0) return [];
    // We match roughly by the fact they are in allProfiles
    // Filter out the current one by name or phone/googlePlaceId (since we don't pass the exact ID in profile easily)
    const others = allProfiles.filter(p => p.title !== profile.name);
    return others.sort(() => Math.random() - 0.5).slice(0, 4);
  }, [allProfiles, profile.name]);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      router.push(`/directory?search=${encodeURIComponent(quickSearch)}`);
    } else {
      router.push(`/directory`);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 relative z-10">
      
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs items={breadcrumbItems} />

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Content (Left) */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          
          {/* Compact Hero Header */}
          <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {profile.status === "unclaimed" && (
              <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-bl-xl z-10">
                Not Verified
              </div>
            )}
            
            <div className="flex items-center gap-5 w-full">
              {/* Small Logo Box */}
              <div className="w-16 h-16 md:w-24 md:h-24 shrink-0 relative rounded-2xl overflow-hidden border-2 border-[#C5A059]/50 shadow-lg bg-[#051815]">
                {profile.image ? (
                  <Image src={profile.image} alt={profile.name} fill className="object-cover" unoptimized={true} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#C5A059]/10">
                    <span className="text-3xl md:text-5xl font-serif text-[#C5A059]">{profile.name.charAt(0)}</span>
                  </div>
                )}
              </div>

              {/* Title and Badges */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xs md:text-sm font-sans font-bold text-white/70 mb-1 tracking-wider uppercase">
                  {profile.listingType === "weaver" ? "Sambalpuri Master Weaver" : profile.listingType === "raw_material" ? "Sambalpuri Raw Material Supplier" : "Sambalpuri Handloom Store"}
                </h2>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#C5A059] leading-tight mb-3 truncate">
                  {profile.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border shadow-sm ${badgeBg} ${badgeColor}`}>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    {badgeText}
                  </span>
                  
                  {profile.rawAddress ? (
                    <span className="text-white/80 text-[11px] sm:text-xs flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full border border-white/10">
                      📍 {profile.rawAddress.cityTownVillage || profile.rawAddress.block || profile.rawAddress.district}, {profile.rawAddress.state}
                    </span>
                  ) : profile.address ? (
                    <span className="text-white/80 text-[11px] sm:text-xs flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full border border-white/10">
                      📍 {profile.address}
                    </span>
                  ) : null}

                  {profile.subscriptionTier === 'advance' && (
                    <span className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/50 px-3 py-1 rounded-full text-amber-500 text-[11px] sm:text-xs font-bold shadow-inner">
                      <Star className="w-3.5 h-3.5 fill-amber-500" /> Advance Pro
                    </span>
                  )}
                  {profile.subscriptionTier === 'pro' && (
                    <span className="flex items-center gap-1 bg-blue-500/20 border border-blue-500/50 px-3 py-1 rounded-full text-blue-400 text-[11px] sm:text-xs font-bold shadow-inner">
                      <Star className="w-3.5 h-3.5 fill-blue-500" /> Pro Partner
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Quick Contact Buttons */}
            <div className="flex items-center gap-3 shrink-0 self-start md:self-center mt-4 md:mt-0">
              <a href={`tel:${profile.phone}`} className="bg-transparent border border-[#C5A059] hover:bg-[#C5A059]/10 text-[#C5A059] font-bold text-[11px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-2">
                📞 Call
              </a>
              <button onClick={() => {
                const msg = `Hello ${profile.name}, I found your profile on Bhulia.com. I am interested in your handlooms.`;
                window.open(`https://api.whatsapp.com/send?phone=${profile.whatsapp.replace(/[^0-9]/g,'')}&text=${encodeURIComponent(msg)}`, "_blank");
              }} className="bg-[#C5A059] hover:bg-[#D4AF37] text-[#051815] font-bold text-[11px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-2">
                💬 WhatsApp
              </button>
            </div>
          </div>

          {/* Verification Call to action (if unclaimed) */}
          {profile.status === "unclaimed" && (
            <div className="bg-blue-900/30 border border-blue-500/50 p-4 rounded-xl flex items-center justify-between gap-4">
              <div>
                <h3 className="text-white font-bold text-sm">Is this your store?</h3>
                <p className="text-blue-200 text-xs mt-1">Claim and verify this profile to edit details and upload your products.</p>
              </div>
              <Link href={`/verify?id=${profile.googlePlaceId || ''}&type=${type}&name=${encodeURIComponent(profile.name)}`} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase px-6 py-3 rounded-lg transition-colors shadow-sm shrink-0 whitespace-nowrap">
                Verify Now
              </Link>
            </div>
          )}

          {/* 5-Image Bento Box Gallery */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-3xl overflow-hidden border border-[#C5A059]/30 shadow-2xl bg-[#051815]">
            {Array.from({ length: 5 }).map((_, i) => {
              const img = profile.gallery?.[i] || (i === 0 && profile.image ? profile.image : "https://placehold.co/600x400/051815/333333?text=Add+Photo");
              return (
                <div key={i} className={`bg-[#051815] relative group overflow-hidden ${i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'col-span-1 row-span-1 aspect-square'}`}>
                  <Image src={img} fill className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" alt={`Showroom ${i+1}`} unoptimized />
                  {!profile.gallery?.[i] && profile.status === "unclaimed" && (
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm">
                       <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-widest px-4 py-2 border border-[#C5A059] rounded-full">Upload</span>
                     </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions & Details Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Description & Socials */}
            <div className="lg:col-span-2 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 shadow-xl h-full relative overflow-hidden flex flex-col">
               <div className="absolute top-0 right-0 w-48 h-48 bg-[#C5A059]/5 blur-[50px] rounded-full pointer-events-none" />
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-[#C5A059]/20 pb-4">
                 <h3 className="text-sm uppercase tracking-widest text-[#C5A059] font-bold">About the {isWeaver ? "Weaver" : "Shop"}</h3>
                 
                 {/* Social Links */}
                 <div className="flex flex-wrap items-center gap-2">
                   <a href={profile.facebookUrl || "https://facebook.com/bhuliacom"} target="_blank" rel="noopener noreferrer" className="bg-[#051815] border border-[#C5A059]/30 hover:border-[#C5A059] text-[#C5A059] font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                     Fb
                   </a>
                   <a href={profile.instagramUrl || "https://instagram.com/bhuliacom"} target="_blank" rel="noopener noreferrer" className="bg-[#051815] border border-[#C5A059]/30 hover:border-[#C5A059] text-[#C5A059] font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                     Insta
                   </a>
                   <a href={profile.videoUrl || "https://youtube.com/@bhuliacom"} target="_blank" rel="noopener noreferrer" className="bg-[#051815] border border-[#C5A059]/30 hover:border-[#C5A059] text-[#C5A059] font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                     YouTube
                   </a>
                 </div>
               </div>
               
               <p className="text-sm md:text-base text-white/90 font-sans leading-relaxed relative z-10 flex-1">
                 {profile.status === "unclaimed" 
                   ? "This profile was collected from a reliable source but is not yet verified. If you are the owner, please verify it to claim and update your information."
                   : (profile.description || "Dedicated to preserving the rich heritage of Sambalpuri handlooms.")}
               </p>
               
               {/* Share Widget */}
               <div className="mt-6 pt-4 border-t border-[#C5A059]/20 flex items-center justify-between">
                 <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Spread the word</span>
                 <ShareWidget 
                   title={profile.name} 
                   layout="horizontal" 
                   className="!bg-transparent !border-0 !shadow-none !p-0" 
                   shareTextOverride="Promote original Sambalpuri Saree. Share this link to your network and support our weavers!"
                 />
               </div>
            </div>

            {/* Middle/Right: Artisan Heritage & Craft */}
            <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 shadow-xl flex flex-col h-full relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C5A059]/5 blur-[50px] rounded-full pointer-events-none" />
              <h3 className="text-sm uppercase tracking-widest text-[#C5A059] font-bold mb-4 relative z-10">
                {type === "store" ? "Store Details & Legacy" : "Artisan Heritage & Craft"}
              </h3>
              
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 flex-1 relative z-10 mb-6 border-b border-[#C5A059]/20 pb-6">
                {profile.generations && (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-[#C5A059]/10 rounded-full flex items-center justify-center mb-2">
                      <span className="text-[#C5A059] text-lg">👨‍👩‍👧‍👦</span>
                    </div>
                    <div className="text-xs text-white font-bold">{profile.generations}</div>
                    <div className="text-[9px] text-white/60 uppercase font-semibold mt-1">Legacy</div>
                  </div>
                )}
                
                {(profile.weaverExperience || profile.handloomExperience) && (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-[#C5A059]/10 rounded-full flex items-center justify-center mb-2">
                      <span className="text-[#C5A059] text-lg">⏳</span>
                    </div>
                    <div className="text-xs text-white font-bold">{profile.weaverExperience || profile.handloomExperience}</div>
                    <div className="text-[9px] text-white/60 uppercase font-semibold mt-1">Experience</div>
                  </div>
                )}
              </div>

              {/* Trust & Payment Section */}
              <div className="relative z-10 space-y-4">
                <h3 className="text-sm uppercase tracking-widest text-[#C5A059] font-bold">Trust & Payments</h3>
                
                {profile.kycDocumentUrl ? (
                  <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-green-500/30">
                    <ShieldCheck className="w-8 h-8 text-green-500 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold text-green-400 uppercase">KYC Verified Vendor</span>
                      <span className="block text-[10px] text-white/60">Govt. ID verified by Bhulia Hub</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-amber-500/30">
                    <ShieldCheck className="w-8 h-8 text-amber-500 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold text-amber-400 uppercase">Unverified KYC</span>
                      <span className="block text-[10px] text-white/60">Vendor has not submitted ID</span>
                    </div>
                  </div>
                )}

                {(profile.bankUpi || profile.bankAccount) && (
                  <div className="bg-[#C5A059]/5 p-4 rounded-xl border border-[#C5A059]/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Wallet className="w-4 h-4 text-[#C5A059]" />
                      <span className="text-[11px] font-bold text-white uppercase tracking-wider">Direct Payment Info</span>
                    </div>
                    {profile.bankUpi && (
                      <div className="mb-2">
                        <span className="block text-[9px] text-white/50 uppercase">UPI ID</span>
                        <span className="block text-xs font-mono text-white/90 bg-black/30 px-2 py-1 rounded select-all">{profile.bankUpi}</span>
                      </div>
                    )}
                    {profile.bankAccount && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                           <span className="block text-[9px] text-white/50 uppercase">Account</span>
                           <span className="block text-[10px] font-mono text-white/90 bg-black/30 px-2 py-1 rounded select-all">{profile.bankAccount}</span>
                        </div>
                        <div>
                           <span className="block text-[9px] text-white/50 uppercase">IFSC</span>
                           <span className="block text-[10px] font-mono text-white/90 bg-black/30 px-2 py-1 rounded select-all">{profile.bankIfsc}</span>
                        </div>
                        <div className="col-span-2 mt-1">
                           <span className="block text-[9px] text-white/50 uppercase">Bank / Holder</span>
                           <span className="block text-[10px] text-white/90">{profile.bankName} - {profile.bankHolder}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        {/* Product Grid Section */}
        <div className="space-y-6 pt-6 border-t border-[#C5A059]/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl md:text-3xl font-serif text-[#C5A059] font-bold tracking-wider">Product Catalog</h3>
            <p className="text-[10px] md:text-xs text-gray-300 uppercase tracking-widest font-semibold">Authentic handlooms directly from {profile.name}</p>
          </div>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} role={userRole} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-[#0B2B26] border border-[#C5A059]/20 rounded-3xl">
            <span className="text-4xl mb-4 block">📦</span>
            <h3 className="text-xl font-bold text-white mb-2">No Products Found</h3>
            <p className="text-sm text-gray-400">This profile hasn't uploaded any catalog items yet.</p>
          </div>
        )}
        </div>
      </div> {/* End Main Content */}

      {/* Sidebar (Right) */}
      <div className="w-full lg:w-80 shrink-0 space-y-6">
        <div className="sticky top-24 space-y-6">
          
          {/* Map Sidebar Widget (Glassmorphism) */}
          {(profile.address || profile.googlePlaceId) && (
            <div className="relative group">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#C5A059]/5 blur-[60px] rounded-[40px] pointer-events-none -z-10" />
              <div className="bg-[#051815]/80 backdrop-blur-md border border-[#C5A059]/30 shadow-xl rounded-2xl p-5 relative overflow-hidden transition-transform duration-300">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-2 drop-shadow-md">
                  📍 Find us on Google Maps
                </h3>
                <div className="w-full aspect-square rounded-xl overflow-hidden border border-[#C5A059]/20 relative shadow-inner bg-black/20">
                  <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" src={`https://maps.google.com/maps?q=${encodeURIComponent(profile.name + " " + (profile.address || ''))}&t=&z=14&ie=UTF8&iwloc=&output=embed`}></iframe>
                </div>
              </div>
            </div>
          )}

          {/* Quick Search Widget */}
          <div className="bg-[#051815] border border-[#C5A059]/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/5 blur-3xl rounded-full"></div>
            <h3 className="text-[#C5A059] font-bold text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Quick Search
            </h3>
            <form onSubmit={handleQuickSearch} className="mb-4">
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#C5A059]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                  type="text" 
                  placeholder="Find Weavers, Stores..."
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  className="w-full bg-[#0B2B26] border border-[#C5A059]/30 text-white text-xs pl-9 pr-4 py-3 rounded-xl outline-none focus:border-[#C5A059] transition-colors"
                />
              </div>
            </form>
            <Link href="/directory" className="block w-full text-center bg-[#C5A059]/10 hover:bg-[#C5A059] text-[#C5A059] hover:text-[#051815] border border-[#C5A059]/50 transition-all duration-300 py-3 rounded-xl text-xs font-bold uppercase tracking-widest">
              Explore All Listings →
            </Link>
          </div>

          {/* Similar Profiles Widget */}
          {similarProfiles.length > 0 && (
            <div className="bg-[#0B2B26] border border-white/10 rounded-2xl p-5 shadow-lg">
              <h3 className="text-white font-serif text-lg font-bold mb-1">Explore More Profiles</h3>
              <p className="text-[#C5A059] text-[10px] uppercase tracking-widest mb-4">
                {isWeaver ? "Other Master Weavers" : "Other Authentic Stores"}
              </p>
              
              <div className="space-y-4">
                {similarProfiles.map((sp) => (
                  <Link key={sp.id || sp.slug} href={`/${isWeaver ? 'weaver' : 'store'}/${sp.slug}`} className="group flex gap-3 items-center hover:bg-white/5 p-2 rounded-xl transition-colors">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/10">
                      <Image src={sp.img || "/bhulia-hero.png"} alt={sp.title || "Profile"} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-xs font-bold truncate group-hover:text-[#C5A059] transition-colors">{sp.title}</h4>
                      <div className="text-gray-400 text-[10px] truncate mt-0.5">{sp.district || "Odisha"}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Similar Products Widget */}
          {similarProducts.length > 0 && (
            <div className="bg-[#0B2B26] border border-white/10 rounded-2xl p-5 shadow-lg">
              <h3 className="text-white font-serif text-lg font-bold mb-1">More to Explore</h3>
              <p className="text-[#C5A059] text-[10px] uppercase tracking-widest mb-4">Similar Products</p>
              
              <div className="space-y-4">
                {similarProducts.map((sp) => (
                  <Link key={sp.id} href={`/product/${sp.id}`} className="group flex gap-3 items-center hover:bg-white/5 p-2 rounded-xl transition-colors">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10">
                      <Image src={(sp.images && sp.images.length > 0) ? sp.images[0] : "/bhulia-hero.png"} alt={sp.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-xs font-bold truncate group-hover:text-[#C5A059] transition-colors">{sp.title}</h4>
                      <div className="text-gray-400 text-[10px] truncate mt-0.5">{sp.weaverName || sp.storeName}</div>
                      <div className="text-[#C5A059] text-xs font-bold mt-1">₹{Number(sp.price).toLocaleString("en-IN")}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </div>

      </div> {/* End 2-column flex */}
    </div>
  );
}
