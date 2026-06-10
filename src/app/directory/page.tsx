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
  const renderGridWithAds = (items: any[]) => {
    const result = [];
    let currentAdIndex = 1;
    
    for (let i = 0; i < items.length; i += 15) {
      const chunk = items.slice(i, i + 15);
      
      result.push(
        <div key={`chunk-${i}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chunk.map(item => (
            <Link key={item.id} href={`/${item.role}/${item.id}`} className="group flex items-center bg-[#0B2B26] rounded-xl overflow-hidden border border-[#C5A059]/20 hover:border-[#C5A059]/80 transition-all duration-300 hover:shadow-[0_0_20px_rgba(197,160,89,0.2)] hover:-translate-y-0.5">
              
              {/* Thumbnail Image Left Side */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 relative bg-[#051815] border-r border-[#C5A059]/20">
                <img 
                  src={item.image || item.photo || item.photoUrl || item.imageUrl || item.thumbnail || item.cover_image || item.featured_image || item.picture || item.avatar || item.business_logo || item['Profile Photo'] || item['Business Logo'] || item.logo || item.profileImage || item.img || "/bhulia-hero.png"} 
                  alt={item.title || "Listing"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0B2B26]/50"></div>
                <div className="absolute top-2 left-2 z-10">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-bold tracking-widest border shadow-sm backdrop-blur-md ${
                    item.role === 'weaver' ? 'bg-amber-900/80 text-amber-300 border-amber-500/50' : 'bg-blue-900/80 text-blue-300 border-blue-500/50'
                  }`}>
                    {item.displayType}
                  </span>
                </div>
              </div>

              {/* Details Right Side */}
              <div className="p-3 sm:p-4 flex-1 flex flex-col justify-center min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-white text-sm sm:text-base truncate group-hover:text-[#C5A059] transition-colors">{item.title}</h3>
                  {item.status === 'approved' && (
                    <span className="shrink-0 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(220,38,38,0.6)]" title="Verified Partner">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </span>
                  )}
                </div>
                
                <p className="text-gray-400 text-[10px] sm:text-xs truncate mb-2">{item.address || "Odisha, India"}</p>
                
                <div className="flex items-center gap-2 mt-auto">
                  <span className="text-[#C5A059] text-[10px] sm:text-xs font-bold uppercase tracking-wider group-hover:underline">View Profile</span>
                  <span className="text-[#C5A059] text-xs transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      );

      if (i + 15 < items.length || chunk.length === 15) {
        result.push(
          <div key={`ad-${currentAdIndex}`} className="w-full my-8">
            <GlobalBannerSlot placement={`directory_grid_ad_${currentAdIndex}`} fallbackColor="from-[#0B2B26] to-[#051815]" />
          </div>
        );
        currentAdIndex++;
      }
    }
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
