"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStores, useWeavers, useProducts } from "@/lib/db-hooks";
import { ODISHA_DISTRICTS } from "@/lib/locations";
import GlobalBannerSlot from "@/components/GlobalBannerSlot";
import Breadcrumbs from "@/components/Breadcrumbs";
import DirectorySidebarFilter from "@/components/DirectorySidebarFilter";
import ProductCard from "@/components/ProductCard";

function DirectoryContent() {
  const { stores, loading: storesLoading } = useStores(50);
  const { weavers, loading: weaversLoading } = useWeavers(50);

  const [selectedRole, setSelectedRole] = useState<string>("all");
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("newest");
  
  // Products for Right Sidebar
  const { products, loading: productsLoading } = useProducts({ status: "approved" });

  useEffect(() => {
    if (searchParams?.get("search")) {
      setSearchQuery(searchParams.get("search") || "");
    }
  }, [searchParams]);
  
  // Cascading Location States
  const [selectedCountry, setSelectedCountry] = useState<string>("India");
  const [selectedState, setSelectedState] = useState<string>("Odisha");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedBlock, setSelectedBlock] = useState<string>("");
  const [selectedVillage, setSelectedVillage] = useState<string>("");

  const combinedDirectory = useMemo(() => {
    const vList = stores.map(v => ({ ...v, role: "store", displayType: "Retail Shop" }));
    const wList = weavers.map(w => ({ ...w, role: "weaver", displayType: "Master Weaver" }));
    const all = [...vList, ...wList].filter(item => item.status === "approved" || item.status === "unclaimed");
    return all.sort(() => Math.random() - 0.5);
  }, [stores, weavers]);

  const districts = useMemo(() => {
    const dSet = new Set<string>();
    combinedDirectory.forEach(item => {
      const d = (item as any).district || item.address?.split(",")?.[1]?.trim() || "Odisha";
      if (d) dSet.add(d);
    });
    return Array.from(dSet).sort();
  }, [combinedDirectory]);

  const filteredDirectory = useMemo(() => {
    const filtered = combinedDirectory.filter(item => {
      // 1. Role Filter
      if (selectedRole !== "all" && item.role !== selectedRole) return false;
      
      // 2. Search Query Filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!item.title?.toLowerCase().includes(q) && !item.address?.toLowerCase().includes(q)) {
          return false;
        }
      }

      // Location matching logic - assuming format like "Village, Block, District, State, Country" or similar
      const addr = (item.address || "").toLowerCase();
      const dist = ((item as any).district || "").toLowerCase();
      const st = ((item as any).state || "").toLowerCase();
      const cntry = ((item as any).country || "").toLowerCase();
      const blk = ((item as any).block || "").toLowerCase();
      const vill = ((item as any).townVillage || "").toLowerCase();

      // 3. Country Filter
      if (selectedCountry && selectedCountry !== "India") { // Assuming default is India
         if (!cntry.includes(selectedCountry.toLowerCase()) && !addr.includes(selectedCountry.toLowerCase())) return false;
      }

      // 4. State Filter
      if (selectedState && selectedState !== "all") {
        if (!st.includes(selectedState.toLowerCase()) && !addr.includes(selectedState.toLowerCase())) return false;
      }

      // 5. District Filter
      if (selectedDistrict && selectedDistrict !== "all") {
        let dTarget = selectedDistrict.toLowerCase();
        if (dTarget === "sonepur") dTarget = "subarnapur"; // alias
        if (dTarget === "subarnapur") dTarget = "sonepur"; // alias

        const matchDist = dist.includes(dTarget) || dist.includes(selectedDistrict.toLowerCase());
        const matchAddr = addr.includes(dTarget) || addr.includes(selectedDistrict.toLowerCase());
        if (!matchDist && !matchAddr) return false;
      }

      // 6. Block Filter
      if (selectedBlock) {
        if (!blk.includes(selectedBlock.toLowerCase()) && !addr.includes(selectedBlock.toLowerCase())) return false;
      }

      // 7. Village/Town Filter
      if (selectedVillage) {
        if (!vill.includes(selectedVillage.toLowerCase()) && !addr.includes(selectedVillage.toLowerCase())) return false;
      }

      return true;
    });

    // Apply Sorting
    return filtered.sort((a, b) => {
      if (selectedSort === "newest") {
        return (((b as any).createdAt || 0) as number) - (((a as any).createdAt || 0) as number);
      }
      if (selectedSort === "rating") {
        return ((b as any).googleRating || 0) - ((a as any).googleRating || 0);
      }
      if (selectedSort === "reviews") {
        return ((b as any).googleReviewsCount || 0) - ((a as any).googleReviewsCount || 0);
      }
      if (selectedSort === "alpha") {
        const nameA = (a.title || (a as any).name || "").toLowerCase();
        const nameB = (b.title || (b as any).name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      }
      return 0;
    });
  }, [combinedDirectory, selectedRole, selectedCountry, selectedState, selectedDistrict, selectedBlock, selectedVillage, searchQuery, selectedSort]);
  const verifiedListings = filteredDirectory.filter(item => item.status === "approved");
  const unverifiedListings = filteredDirectory.filter(item => item.status !== "approved");

  const loading = storesLoading || weaversLoading;

  // Render a list layout with ads injected every 15 items
  const renderGridWithAds = (listings: any[]) => {
    const result = [];
    let currentAdIndex = 1;

    for (let i = 0; i < listings.length; i++) {
      const item = listings[i];
      const isVerified = item.status === "approved";
      
      result.push(
        <div key={item.id} className="group relative bg-[#0B2B26] rounded-2xl border border-[#C5A059]/20 hover:border-[#C5A059]/80 overflow-hidden shadow-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(197,160,89,0.3)] hover:-translate-y-1 flex flex-col h-full">
          
          <Link href={item.role === 'weaver' ? `/weaver/${item.slug}` : `/store/${item.slug}`} className="flex flex-col h-full cursor-pointer">
            
            {/* Massive Square Thumbnail */}
            <div className="w-full aspect-square relative bg-[#051815] overflow-hidden">
              <img 
                src={(item as any).image || (item as any).photo || (item as any).photoUrl || (item as any).imageUrl || (item as any).thumbnail || (item as any).cover_image || (item as any).featured_image || (item as any).picture || (item as any).avatar || (item as any).business_logo || (item as any)['Profile Photo'] || (item as any)['Business Logo'] || (item as any).logo || (item as any).profileImage || (item as any).img || "/bhulia-hero.png"} 
                alt={item.title || "Listing"}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B2B26] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
              
              <div className="absolute top-3 left-3 z-10">
                <span className={`px-2 py-1 rounded shadow-md backdrop-blur-md text-[9px] uppercase font-bold tracking-widest border ${
                  item.role === 'weaver' ? 'bg-amber-900/90 text-amber-300 border-amber-500/50' : 'bg-blue-900/90 text-blue-300 border-blue-500/50'
                }`}>
                  {item.role === 'weaver' ? 'Master Weaver' : 'Retail Shop'}
                </span>
              </div>
            </div>

            {/* Content Underneath */}
            <div className="p-4 sm:p-5 flex flex-col flex-grow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#C5A059] transition-colors line-clamp-2 leading-snug">
                  {item.title || item.name}
                </h3>
                {isVerified && (
                  <div className="shrink-0 bg-green-500 rounded-full p-0.5 mt-0.5" title="Verified Partner">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </div>

              <div className="text-gray-400 text-xs mb-4 flex items-center gap-1.5 opacity-80">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="truncate">{item.district || item.townVillage || item.state || "N/A"}</span>
              </div>

              <div className="flex items-center gap-2 mt-auto pt-3 border-t border-[#C5A059]/10">
                <span className="text-[#C5A059] text-[10px] sm:text-xs font-bold uppercase tracking-wider group-hover:underline">View Profile</span>
                <span className="text-[#C5A059] text-xs transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>
        </div>
      );

      // Inject Global Ad Slot every 10 listings inside the grid
      if ((i + 1) % 10 === 0) {
        result.push(
          <div key={`ad-${currentAdIndex}`} className="col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5 w-full my-2">
            <GlobalBannerSlot placement={`directory_grid_ad_${currentAdIndex}`} fallbackColor="from-[#0B2B26] to-[#051815]" />
          </div>
        );
        currentAdIndex++;
      }
    }
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {result}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#051815] font-sans pt-0 pb-20 relative overflow-hidden">
      
      {/* Top Blue Pill Filter Menus for Roles - Full Width */}
      <div className="w-full bg-[#E5D3B3] border-b border-[#C5A059]/20 relative z-40 mb-6 py-3 px-4 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex overflow-x-auto whitespace-nowrap hide-scrollbar items-center md:justify-center gap-4 pb-1">
          {[
            { label: "All Directory", value: "all" },
            { label: "Master Weavers", value: "weaver" },
            { label: "Retail Shops", value: "store" },
            { label: "B2B Wholesalers", value: "wholesaler" },
            { label: "Raw Materials", value: "raw_material" }
          ].map(roleOption => (
            <button 
              key={roleOption.value}
              onClick={() => setSelectedRole(roleOption.value)}
              className={`px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${
                selectedRole === roleOption.value 
                  ? 'bg-[#0052A3] text-white shadow-md ring-4 ring-[#0066CC]/30 -translate-y-1' 
                  : 'bg-[#0066CC]/90 hover:bg-[#0052A3] text-white border border-white/30 shadow-md backdrop-blur-md'
              }`}
            >
              {roleOption.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full px-4 md:px-8 lg:px-12 relative z-10">
        
        {/* Breadcrumbs Navigation */}
        <div className="mb-8">
          <Breadcrumbs items={[{ label: "Verified Directory" }]} />
        </div>

        {/* Global Top Banner / Ads */}
        <div className="mb-10">
          <GlobalBannerSlot placement="directory_top" fallbackColor="from-[#0B2B26] to-[#051815]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Mobile Filter Button */}
          <div className="lg:hidden w-full -mt-2 mb-2">
            <button 
              onClick={() => setIsMobileFilterOpen(true)}
              className="w-full bg-[#0B2B26] border border-[#C5A059]/30 text-[#C5A059] py-3 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              Show Advanced Filters
            </button>
          </div>

          {/* Mobile Overlay */}
          {isMobileFilterOpen && (
            <div 
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setIsMobileFilterOpen(false)}
            />
          )}

          {/* Sidebar Drawer */}
          <div className={`fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm bg-[#051815] shadow-[0_0_50px_rgba(0,0,0,0.8)] transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0 lg:col-span-3 lg:z-auto lg:shadow-none lg:bg-transparent overflow-y-auto border-r border-[#C5A059]/20 lg:border-none ${isMobileFilterOpen ? "translate-x-0" : "-translate-x-full"}`}>
            
            {/* Mobile Close Button */}
            <div className="lg:hidden p-4 flex justify-between items-center border-b border-[#C5A059]/20 mb-4 bg-[#0B2B26]">
              <span className="text-[#C5A059] font-bold uppercase tracking-widest text-xs">Filters</span>
              <button onClick={() => setIsMobileFilterOpen(false)} className="text-[#C5A059] p-2 bg-[#051815] rounded-full border border-[#C5A059]/30">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="sticky top-24 px-4 lg:px-0 pb-10 lg:pb-0">
              <DirectorySidebarFilter 
                selectedCountry={selectedCountry}
                setSelectedCountry={setSelectedCountry}
                selectedState={selectedState}
                setSelectedState={setSelectedState}
                districts={districts}
                selectedDistrict={selectedDistrict}
                setSelectedDistrict={setSelectedDistrict}
                selectedBlock={selectedBlock}
                setSelectedBlock={setSelectedBlock}
                selectedVillage={selectedVillage}
                setSelectedVillage={setSelectedVillage}
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>
          </div>

          {/* Center Main Content */}
          <div className="lg:col-span-6 xl:col-span-6">
            {/* Sleek Sort By Bar */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-gray-400">{filteredDirectory.length} Listings Found</span>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-xs text-[#C5A059] font-bold uppercase tracking-widest">Sort By:</span>
                <select 
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-[#C5A059] cursor-pointer"
                >
                  <option value="newest">Newest Members</option>
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="alpha">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Grid Area */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#C5A059] text-sm uppercase tracking-widest animate-pulse">Loading Directory...</p>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Verified Listings */}
            {verifiedListings.length > 0 ? (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-[#C5A059]">Verified Partners</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#C5A059]/30 to-transparent"></div>
                </div>
                {renderGridWithAds(verifiedListings)}
              </div>
            ) : (
              <div className="bg-[#0B2B26] p-8 rounded-2xl border border-[#C5A059]/20 text-center">
                <p className="text-[#C5A059] font-medium">No verified listings match your search criteria.</p>
              </div>
            )}

            {/* Unverified Listings Grouped by Role */}
            {unverifiedListings.length > 0 && (
              <div className="pt-12 space-y-12">
                {/* Master Weavers Group */}
                {unverifiedListings.filter(item => item.role === "weaver").length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-6 opacity-80">
                      <h2 className="text-xl font-serif font-bold text-[#C5A059]">Other Master Weavers</h2>
                      <div className="h-px flex-1 bg-gradient-to-r from-[#C5A059]/50 to-transparent"></div>
                    </div>
                    {renderGridWithAds(unverifiedListings.filter(item => item.role === "weaver"))}
                  </div>
                )}

                {/* Retail Shops Group */}
                {unverifiedListings.filter(item => item.role === "store").length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-6 opacity-80">
                      <h2 className="text-xl font-serif font-bold text-[#C5A059]">Other Retail Shops</h2>
                      <div className="h-px flex-1 bg-gradient-to-r from-[#C5A059]/50 to-transparent"></div>
                    </div>
                    {renderGridWithAds(unverifiedListings.filter(item => item.role === "store"))}
                  </div>
                )}
                
                <div className="text-center pt-8">
                  <button className="bg-transparent border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-[#051815] transition-all duration-300 font-bold px-10 py-4 rounded-full text-sm uppercase tracking-widest shadow-lg hover:-translate-y-1">
                    Load More Listings
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
          </div>

          {/* Right Sidebar: Featured Products */}
          <div className="hidden lg:flex flex-col lg:col-span-3 xl:col-span-3 space-y-4 h-fit sticky top-24">
            <h3 className="text-lg xl:text-xl font-serif font-bold text-[#C5A059] mb-2 border-b border-[#C5A059]/20 pb-2">New Arrivals</h3>
            {productsLoading ? (
               <div className="grid grid-cols-2 gap-3">
                 {[1,2,3,4].map(i => <div key={i} className="w-full aspect-[9/16] bg-[#0B2B26] border border-[#C5A059]/20 rounded-xl animate-pulse"></div>)}
               </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {products.slice(0, 4).map(product => (
                  <ProductCard key={product.id} product={product} role="customer" />
                ))}
              </div>
            ) : (
              <div className="p-4 bg-[#0B2B26] rounded-xl text-xs text-gray-400 text-center border border-[#C5A059]/20">No products yet.</div>
            )}
          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="mt-12 bg-gradient-to-r from-[#0066CC] to-[#0052A3] rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[#C5A059]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-white mb-4 relative z-10">Are you a Master Weaver or Retailer?</h2>
          <p className="text-blue-100 text-sm md:text-base mb-8 max-w-2xl mx-auto relative z-10">
            Join the Bhulia.com directory to get a verified badge, priority ranking in search results, and access to the seller dashboard.
          </p>
          <Link href="/verify" className="inline-block bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A1021] font-black text-sm uppercase tracking-widest px-10 py-4 rounded-full transition-all shadow-lg hover:-translate-y-1 hover:shadow-xl relative z-10">
            Register Your Business Here
          </Link>
        </div>

        {/* SEO Content at Bottom */}
        <div className="mt-16 pt-8 border-t border-[#C5A059]/10">
          <div className="mb-6 text-center max-w-4xl mx-auto">
            <h2 className="text-lg md:text-xl font-serif font-bold text-gray-400 mb-2">
              The Original Sambalpuri: Weavers, Stores, and Raw Material Suppliers.
            </h2>
            <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
              Discover Authentic Master Weavers and Verified Retail Shops for original Sambalpuri Handloom Sarees, Dress Materials, Bedsheets, and Fabrics Direct from Odisha.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center w-full max-w-5xl mx-auto opacity-70 hover:opacity-100 transition-opacity">
            {ODISHA_DISTRICTS.map((district) => (
              <button 
                key={district} 
                onClick={() => {
                  setSelectedDistrict(district);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`border px-2 py-1 rounded-md text-[9px] uppercase font-bold tracking-wider transition-all duration-300 ${
                  selectedDistrict === district 
                    ? 'bg-[#C5A059] text-[#051815] border-[#C5A059]' 
                    : 'bg-transparent border-[#C5A059]/20 text-gray-500 hover:text-[#C5A059] hover:border-[#C5A059]/40'
                }`}
              >
                {district}
              </button>
            ))}
            {selectedDistrict !== "all" && (
              <button 
                onClick={() => setSelectedDistrict("all")}
                className="bg-red-900/20 text-red-400 border border-red-500/20 px-2 py-1 rounded-md text-[9px] uppercase font-bold tracking-wider hover:bg-red-900/40 transition-all"
              >
                Clear
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function GlobalDirectoryPage() {
  return (
    <Suspense fallback={<div className="flex-1 min-h-screen flex items-center justify-center bg-[#051815]"><div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div></div>}>
      <DirectoryContent />
    </Suspense>
  );
}
