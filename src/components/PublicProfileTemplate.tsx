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

export interface PublicProfileProps {
  type: "weaver" | "store";
  profile: {
    name: string;
    image: string;
    district: string;
    state: string;
    country?: string;
    description: string;
    address: string;
    phone: string;
    whatsapp: string;
    status?: string;
    googlePlaceId?: string;
    googleRating?: number;
    googleReviewsCount?: number;
    listingType?: string;
    productsOffered?: string;
    weaverExperience?: string;
    generations?: string;
    specialties?: string[];
    materials?: string[];
    scale?: string;
    googlePin?: string;
    gallery?: string[];
    videoUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
  };
  products: Product[];
  allProducts?: Product[];
  allProfiles?: any[];
}

export default function PublicProfileTemplate({ type, profile, products = [], allProducts = [], allProfiles = [] }: PublicProfileProps) {
  const isWeaver = type === "weaver";
  const badgeText = isWeaver ? "Bhulia.com Verified Weavers" : "Bhulia.com Verified Sambalpuri Shop";
  const badgeColor = isWeaver ? "text-[#C5A059] border-[#C5A059]" : "text-blue-400 border-blue-400";
  const badgeBg = isWeaver ? "bg-[#C5A059]/10" : "bg-blue-400/10";
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
          
          {/* Hero Section */}
          <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 flex flex-col gap-8 shadow-xl relative overflow-hidden">
            {profile.status === "unclaimed" && (
              <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-bl-xl z-10">
                Not Verified
              </div>
            )}
            
            {/* Top Row: Image + Details + Share */}
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left: Image */}
              <div className="md:w-1/3 lg:w-1/4 shrink-0">
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-[#C5A059]/50 shadow-lg bg-[#051815]">
                <Image src={profile.image || "/bhulia-hero.png"} alt={profile.name} fill className="object-cover" unoptimized={true} />
              </div>
            </div>

            {/* Right Side Column (Details + Share) */}
            <div className="flex-1 flex flex-col md:flex-row gap-6 md:gap-10">
              

                
                {/* Details Section */}
                <div className="flex-1 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#C5A059]/20 pb-6 md:pb-0 md:pr-6">
              <h2 className="text-lg md:text-xl font-sans font-bold text-white mb-1">
                {profile.listingType === "weaver" ? "Sambalpuri Master Weaver" : profile.listingType === "raw_material" ? "Sambalpuri Raw Material Supplier" : "Sambalpuri Handloom Store"}
              </h2>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#C5A059] leading-tight mb-4">
                {profile.name}
              </h1>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <a href={profile.facebookUrl || "https://facebook.com/bhuliacom"} target="_blank" rel="noopener noreferrer" className="bg-[#C5A059] hover:bg-[#D4AF37] text-[#051815] font-bold text-[11px] uppercase tracking-wider px-4 py-2 rounded-lg transition-colors shadow-sm">
                  Fb Link
                </a>
                
                <a href={profile.instagramUrl || "https://instagram.com/bhuliacom"} target="_blank" rel="noopener noreferrer" className="bg-[#C5A059] hover:bg-[#D4AF37] text-[#051815] font-bold text-[11px] uppercase tracking-wider px-4 py-2 rounded-lg transition-colors shadow-sm">
                  Insta Link
                </a>
                
                <a href={profile.videoUrl || "https://youtube.com/@bhuliacom"} target="_blank" rel="noopener noreferrer" className="bg-[#C5A059] hover:bg-[#D4AF37] text-[#051815] font-bold text-[11px] uppercase tracking-wider px-4 py-2 rounded-lg transition-colors shadow-sm">
                  YouTube Link
                </a>
                
              </div>
            </div>
              
              {/* Share Widget Section (moved up next to Details) */}
              <div className="md:w-1/4 lg:w-64 shrink-0 flex flex-col justify-center">
                <ShareWidget 
                  title={profile.name} 
                  layout="vertical" 
                  className="!bg-transparent !border-0 !shadow-none !p-0" 
                  shareTextOverride="Promote original Sambalpuri Saree. Share this link to your network and support our weavers!"
                />
              </div>
            </div>
            </div>

            {/* Bottom Row: Address & Contact (spans full width of hero) */}
            <div className="pt-5 border-t border-[#C5A059]/20">
              <span className="text-white/60 font-bold block mb-3 uppercase tracking-widest text-[10px]">Location & Contact</span>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                
                {/* Left: Address Badges */}
                <div className="flex-1">
                  {profile.rawAddress && typeof profile.rawAddress === "object" ? (
                    <div className="flex flex-wrap gap-2">
                    {profile.rawAddress.streetAddress && (
                      <span className="bg-[#051815] border border-[#C5A059]/30 text-white/90 text-[11px] px-3 py-1.5 rounded-md shadow-sm">📍 {profile.rawAddress.streetAddress}</span>
                    )}
                    {profile.rawAddress.block && (
                      <span className="bg-[#051815] border border-[#C5A059]/30 text-white/90 text-[11px] px-3 py-1.5 rounded-md shadow-sm">🏢 Block: {profile.rawAddress.block}</span>
                    )}
                    {profile.rawAddress.district && (
                      <span className="bg-[#051815] border border-[#C5A059]/30 text-white/90 text-[11px] px-3 py-1.5 rounded-md shadow-sm">🌆 Dist: {profile.rawAddress.district}</span>
                    )}
                    {profile.rawAddress.state && (
                      <span className="bg-[#051815] border border-[#C5A059]/30 text-white/90 text-[11px] px-3 py-1.5 rounded-md shadow-sm">🗺️ {profile.rawAddress.state}</span>
                    )}
                    {profile.rawAddress.pincode && (
                      <span className="bg-[#051815] border border-[#C5A059]/30 text-white/90 text-[11px] px-3 py-1.5 rounded-md shadow-sm">📮 PIN: {profile.rawAddress.pincode}</span>
                    )}
                    {profile.rawAddress.country && (
                      <span className="bg-[#051815] border border-[#C5A059]/30 text-white/90 text-[11px] px-3 py-1.5 rounded-md shadow-sm">🌍 {profile.rawAddress.country}</span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <span className="text-white/90 font-semibold">{profile.address || "Address not provided."}</span>
                  </div>
                )}
                </div>

                {/* Right: Contact Buttons */}
                <div className="flex items-center gap-3 shrink-0">
                  <a href={`tel:${profile.phone}`} className="bg-transparent border border-[#C5A059] hover:bg-[#C5A059]/10 text-[#C5A059] font-bold text-[11px] uppercase tracking-wider px-4 py-2 rounded-lg transition-colors shadow-sm">
                    Call
                  </a>
                  <button onClick={() => {
                    const msg = `Hello ${profile.name}, I found your profile on Bhulia.com. I am interested in your handlooms.`;
                    window.open(`https://api.whatsapp.com/send?phone=${profile.whatsapp.replace(/[^0-9]/g,'')}&text=${encodeURIComponent(msg)}`, "_blank");
                  }} className="bg-transparent border border-[#C5A059] hover:bg-[#C5A059]/10 text-[#C5A059] font-bold text-[11px] uppercase tracking-wider px-4 py-2 rounded-lg transition-colors shadow-sm">
                    WhatsApp
                  </button>
                </div>
              </div>
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

          {/* Middle Section: Full Width Map */}
          {(profile.address || profile.googlePlaceId) && (
            <div className="w-full h-48 sm:h-64 rounded-3xl overflow-hidden border border-[#C5A059]/40 shadow-xl bg-[#051815]">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(profile.name + ' ' + (profile.address || ''))}&output=embed`}
              ></iframe>
            </div>
          )}

          {/* Artisan Heritage & Visual Showcase Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: Artisan Heritage & Craft */}
            <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 shadow-xl flex flex-col h-full">
              <h3 className="text-xl font-serif text-[#C5A059] font-bold tracking-wider mb-6">Artisan Heritage & Craft</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-4 flex-1">
                {profile.generations && (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-[#C5A059]/10 rounded-full flex items-center justify-center mb-3">
                      <span className="text-[#C5A059] text-xl">👨‍👩‍👧‍👦</span>
                    </div>
                    <div className="text-sm text-white font-bold">{profile.generations}</div>
                    <div className="text-[10px] text-white/60 uppercase font-semibold mt-1">Generations Legacy</div>
                  </div>
                )}
                
                {profile.weaverExperience && (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-[#C5A059]/10 rounded-full flex items-center justify-center mb-3">
                      <span className="text-[#C5A059] text-xl">⏳</span>
                    </div>
                    <div className="text-sm text-white font-bold">{profile.weaverExperience}</div>
                    <div className="text-[10px] text-white/60 uppercase font-semibold mt-1">Experience</div>
                  </div>
                )}

                {profile.specialties && profile.specialties.length > 0 && (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-[#C5A059]/10 rounded-full flex items-center justify-center mb-3">
                      <span className="text-[#C5A059] text-xl">🧵</span>
                    </div>
                    <div className="text-sm text-white font-bold line-clamp-2 leading-tight">{profile.specialties[0]}</div>
                    <div className="text-[10px] text-white/60 uppercase font-semibold mt-1">Handwoven Craft</div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Visual Showcase */}
            {profile.gallery && profile.gallery.length > 0 ? (
              <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 shadow-xl flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-serif text-[#C5A059] font-bold tracking-wider">Visual Showcase</h3>
                  <span className="text-xs text-[#C5A059] uppercase font-bold tracking-wider cursor-pointer hover:underline">View Gallery →</span>
                </div>
                
                <div className="grid grid-cols-3 gap-3 flex-1">
                  {profile.gallery.map((imgUrl, i) => (
                    <div key={i} className="relative w-full h-full min-h-[120px] rounded-xl overflow-hidden border border-white/10 shadow-lg bg-[#051815]">
                      <Image src={imgUrl} alt={`Showcase ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" unoptimized />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-[#0B2B26]/50 border border-white/10 rounded-3xl p-6 flex items-center justify-center h-full">
                 <p className="text-white/40 italic text-sm">No photos uploaded yet.</p>
              </div>
            )}
            
          </div>

          {/* Bottom Section: Description */}
          <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 shadow-xl">
             <h3 className="text-sm uppercase tracking-widest text-[#C5A059] font-bold mb-4">About the Weaver</h3>
             <p className="text-sm md:text-base text-white/90 font-sans leading-relaxed">
               {profile.status === "unclaimed" 
                 ? "This profile was collected from a reliable source but is not yet verified. If you are the owner, please verify it to claim and update your information."
                 : (profile.description || "Dedicated to preserving the rich heritage of Sambalpuri handlooms.")}
             </p>
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
                      <div className="text-[#C5A059] text-xs font-bold mt-1">₹{sp.price.toLocaleString("en-IN")}</div>
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
