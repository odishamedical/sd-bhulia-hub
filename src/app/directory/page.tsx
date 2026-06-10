"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useVendors, useWeavers } from "@/lib/db-hooks";
import { ODISHA_DISTRICTS } from "@/lib/locations";
import GlobalBannerSlot from "@/components/GlobalBannerSlot";
import AdBannerCard from "@/components/AdBannerCard";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function GlobalDirectoryPage() {
  const { vendors, loading: vendorsLoading } = useVendors(50);
  const { weavers, loading: weaversLoading } = useWeavers(50);

  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnverified, setShowUnverified] = useState(false);

  const combinedDirectory = useMemo(() => {
    const vList = vendors.map(v => ({ ...v, role: "vendor", displayType: "Retail Shop" }));
    const wList = weavers.map(w => ({ ...w, role: "weaver", displayType: "Master Weaver" }));
    const all = [...vList, ...wList].filter(item => item.status === "approved" || item.status === "unclaimed");
    return all.sort(() => Math.random() - 0.5);
  }, [vendors, weavers]);

  const districts = useMemo(() => {
    const dSet = new Set<string>();
    combinedDirectory.forEach(item => {
      const d = (item as any).district || item.address?.split(",")?.[1]?.trim() || "Odisha";
      if (d) dSet.add(d);
    });
    return Array.from(dSet).sort();
  }, [combinedDirectory]);

  const filteredDirectory = useMemo(() => {
    return combinedDirectory.filter(item => {
      if (selectedRole !== "all" && item.role !== selectedRole) return false;
      let d = (item as any).district || item.address?.split(",")?.[1]?.trim() || "Odisha";
      if (d.toLowerCase() === "subarnapur" || d.toLowerCase() === "suvernpur") d = "Sonepur";
      
      if (selectedDistrict !== "all" && d !== selectedDistrict) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!item.title?.toLowerCase().includes(q) && !item.address?.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [combinedDirectory, selectedRole, selectedDistrict, searchQuery]);

  const verifiedListings = filteredDirectory.filter(item => item.status === "approved");
  const unverifiedListings = filteredDirectory.filter(item => item.status !== "approved");

  const loading = vendorsLoading || weaversLoading;

  // Render a list layout with ads injected every 15 items
  const renderGridWithAds = (listings: any[]) => {
    const result = [];
    let currentAdIndex = 1;
    
    // Group into an actual grid container
    result.push(
      <div key="grid-start" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
    );

    for (let i = 0; i < listings.length; i++) {
      const item = listings[i];
      const isVerified = item.status === "approved";
      
      result.push(
        <div key={item.id} className="group relative bg-[#0B2B26] rounded-2xl border border-[#C5A059]/20 hover:border-[#C5A059]/80 overflow-hidden shadow-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(197,160,89,0.3)] hover:-translate-y-1 flex flex-col h-full">
          
          <Link href={item.role === 'weaver' ? `/weaver/${item.slug}` : `/vendor/${item.slug}`} className="flex flex-col h-full cursor-pointer">
            
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
    
    // Close the grid container
    result.push(</div>);
    
    return result;
  };

  return (
    <div className="min-h-screen bg-[#051815] font-sans pt-12 pb-20 relative overflow-hidden">
      
      <div className="w-full px-4 md:px-8 lg:px-12 relative z-10">
        
        {/* Breadcrumbs Navigation */}
        <div className="mb-4">
          <Breadcrumbs items={[{ label: "Verified Directory" }]} />
        </div>

        {/* Sleek Header - Left Aligned */}
        <div className="mb-8 text-left w-full">
          <h1 className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C5A059] mb-3 leading-tight truncate-multiline">
            The Original Sambalpuri: Weavers, Stores, and Raw Material Suppliers.
          </h1>
          <p className="text-gray-300 w-full text-sm md:text-base leading-relaxed">
            Discover Authentic Master Weavers and Verified Retail Shops for original Sambalpuri Handloom Sarees, Dress Materials, Bedsheets, and Fabrics Direct from Odisha.
          </p>
        </div>

        {/* SEO District Links - Fluid Width */}
        <div className="mb-10 flex flex-wrap gap-2 justify-between w-full">
          {ODISHA_DISTRICTS.map((district) => (
            <button 
              key={district} 
              onClick={() => setSelectedDistrict(district)}
              className={`border px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                selectedDistrict === district 
                  ? 'bg-[#C5A059] text-[#051815] border-[#C5A059]' 
                  : 'bg-[#051815] border-[#C5A059]/20 text-gray-400 hover:text-[#C5A059] hover:border-[#C5A059]/60 hover:bg-[#0B2B26]'
              }`}
            >
              {district}
            </button>
          ))}
          {selectedDistrict !== "all" && (
            <button 
              onClick={() => setSelectedDistrict("all")}
              className="bg-red-900/40 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest hover:bg-red-900/60 transition-all"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Global Top Banner / Ads */}
        <div className="mb-10">
          <GlobalBannerSlot placement="directory_top" fallbackColor="from-[#0B2B26] to-[#051815]" />
        </div>

        {/* Search and Filters Bar - Glass Effect */}
        <div className="bg-[#C5A059]/10 backdrop-blur-md border border-[#C5A059]/30 rounded-2xl p-4 md:p-6 mb-12 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-wrap gap-4 items-center">
          <div className="w-full md:flex-1">
            <input 
              type="text" 
              placeholder="Search name or location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#C5A059] transition-colors placeholder-gray-400"
            />
          </div>
          <div className="w-full md:w-56">
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-black/40 border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#C5A059] cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="weaver">Master Weavers</option>
              <option value="vendor">Retail Stores</option>
              <option value="raw_material">Raw Material Supplier</option>
            </select>
          </div>
          <div className="w-full md:w-56">
            <select 
              className="w-full bg-black/40 border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#C5A059] cursor-pointer"
            >
              <option value="all">All Regions</option>
              <option value="odisha">Odisha</option>
              <option value="india">All India</option>
            </select>
          </div>
          <div className="w-full md:w-auto flex justify-center md:justify-end min-w-[100px]">
            <div className="text-center md:text-right">
              <div className="text-[#C5A059] font-bold text-xl">{filteredDirectory.length}</div>
              <div className="text-gray-400 text-[10px] uppercase tracking-widest">Total Listings</div>
            </div>
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
                {unverifiedListings.filter(item => item.role === "vendor").length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-6 opacity-80">
                      <h2 className="text-xl font-serif font-bold text-[#C5A059]">Other Retail Shops</h2>
                      <div className="h-px flex-1 bg-gradient-to-r from-[#C5A059]/50 to-transparent"></div>
                    </div>
                    {renderGridWithAds(unverifiedListings.filter(item => item.role === "vendor"))}
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
    </div>
  );
}
