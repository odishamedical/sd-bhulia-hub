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
          <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row gap-8 shadow-xl">
        
        {/* Left: Image */}
        <div className="lg:w-1/4 shrink-0">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-[#C5A059]/50 shadow-lg bg-[#051815]">
            <Image src={profile.image || "/bhulia-hero.png"} alt={profile.name} fill className="object-cover" unoptimized={true} />
          </div>
        </div>

        {/* Center: Details */}
        <div className="lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-[#C5A059]/20 pb-6 lg:pb-0 lg:pr-8">
          
          <h2 className="text-xl md:text-2xl font-sans font-bold text-white mb-1 mt-2">
            {profile.listingType === "weaver" ? "Sambalpuri Master Weaver" : profile.listingType === "raw_material" ? "Sambalpuri Raw Material Supplier" : "Sambalpuri Handloom Store"}
          </h2>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#C5A059] leading-tight mb-4">
            {profile.name}
          </h1>
          
          <div className="border border-white/20 rounded-xl p-4 mb-4">
            <h3 className="text-xs text-white/60 mb-2 font-sans">Description:</h3>
            <p className="text-sm text-white font-sans leading-relaxed">
              {profile.status === "unclaimed" 
                ? "This profile was collected from reliable source but Not verified. If you are the owner, please verify it."
                : (profile.description || "Dedicated to preserving the rich heritage of Sambalpuri handlooms.")}
            </p>
          </div>

          {profile.productsOffered && (
            <div className="border border-white/20 rounded-xl p-4 mb-4">
              <h3 className="text-xs text-white/60 mb-2 font-sans">Product Specialist:</h3>
              <p className="text-sm text-white font-sans font-bold">
                {profile.productsOffered}
              </p>
            </div>
          )}

          <div className="border border-white/20 rounded-xl p-4 mb-4">
            <h3 className="text-xs text-white/60 mb-2 font-sans">Address:</h3>
            <p className="text-sm text-white font-sans font-bold">
              {profile.address || "Address not provided."}
            </p>
          </div>

        </div>

        {/* Right: Contact & Address */}
        <div className="lg:w-1/4 flex flex-col space-y-4">
          
          {profile.status === "unclaimed" && (
            <div className="bg-red-900 border border-red-500 p-4 rounded-xl w-full text-center shadow-lg">
              <h3 className="text-white font-bold text-sm mb-1">Not Verified by Bhulia.com</h3>
              <p className="text-white/80 text-xs mb-3">This store is not yet verified. Are you the owner?</p>
              <Link href={`/verify?id=${profile.googlePlaceId || ''}&type=${type}&name=${encodeURIComponent(profile.name)}`} className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase px-4 py-2 rounded-lg transition-colors shadow-sm w-full">
                Verify your page
              </Link>
            </div>
          )}

          {profile.googleRating ? (
            <div className="flex items-center gap-3 bg-[#051815] p-3 rounded-xl border border-white/10">
              <div className="flex text-[#D4AF37] text-sm">
                <span>★</span>
              </div>
              <div className="text-xs font-bold text-gray-300">
                <span className="text-white">{profile.googleRating}/5</span> ({profile.googleReviewsCount} Reviews)
              </div>
            </div>
          ) : null}

          {(profile.address || profile.googlePlaceId) && (
            <div className="w-full h-40 rounded-xl overflow-hidden border border-white/20 shadow-inner">
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

          <div className="pt-2 border-t border-[#C5A059]/20">
            <h3 className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold mb-3">Contact Direct</h3>
            
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => {
                const msg = `Hello ${profile.name}, I found your profile on Bhulia.com. I am interested in your handlooms.`;
                window.open(`https://api.whatsapp.com/send?phone=${profile.whatsapp.replace(/[^0-9]/g,'')}&text=${encodeURIComponent(msg)}`, "_blank");
              }} className="w-full flex flex-col items-center justify-center gap-1 py-3 bg-green-600/20 hover:bg-green-600/40 border border-green-500/50 text-green-400 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer text-center">
                <span className="text-sm">💬</span>
                <span>WhatsApp</span>
              </button>
              
              <a href={`tel:${profile.phone}`} className="w-full flex flex-col items-center justify-center gap-1 py-3 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-400 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer text-center">
                <span className="text-sm">📞</span>
                <span>Call</span>
              </a>
            </div>
          </div>
        </div>

        </div>
        
        <ShareWidget title={profile.name} />

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
                  <Link key={sp.id || sp.slug} href={`/${isWeaver ? 'Sambalpuri-weaver' : 'Sambalpuri-store'}/${sp.slug}`} className="group flex gap-3 items-center hover:bg-white/5 p-2 rounded-xl transition-colors">
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
                      <div className="text-gray-400 text-[10px] truncate mt-0.5">{sp.weaverName || sp.vendorName}</div>
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
