"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useVendors, useWeavers } from "@/lib/db-hooks";
import { ODISHA_DISTRICTS } from "@/lib/locations";
import GlobalBannerSlot from "@/components/GlobalBannerSlot";

export default function GlobalDirectoryPage() {
  const { vendors, loading: vendorsLoading } = useVendors();
  const { weavers, loading: weaversLoading } = useWeavers();

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
      const d = (item as any).district || item.address?.split(",")?.[1]?.trim() || "Odisha";
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

  // Render a grid with ads injected every 3 rows (15 items in a 5-col grid)
  const renderGridWithAds = (items: any[]) => {
    const result = [];
    let currentAdIndex = 1;
    
    for (let i = 0; i < items.length; i += 15) {
      const chunk = items.slice(i, i + 15);
      
      result.push(
        <div key={`chunk-${i}`} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {chunk.map(item => (
            <Link key={item.id} href={`/${item.role}/${item.id}`} className="group block bg-[#0B2B26] rounded-2xl overflow-hidden border border-[#C5A059]/20 hover:border-[#C5A059]/80 transition-all duration-300 hover:shadow-[0_0_20px_rgba(197,160,89,0.3)] hover:-translate-y-1 relative">
              <div className="aspect-[4/3] w-full relative bg-[#051815]">
                {item.logo || item.profileImage ? (
                  <Image src={item.logo || item.profileImage} alt={item.title || "Listing"} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#C5A059]/30 text-4xl">
                    {item.role === 'weaver' ? '🧵' : '🏪'}
                  </div>
                )}
                <div className="absolute top-2 left-2 z-10 flex gap-1">
                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-widest border shadow-sm backdrop-blur-sm ${
                    item.role === 'weaver' ? 'bg-amber-900/60 text-amber-300 border-amber-500/50' : 'bg-blue-900/60 text-blue-300 border-blue-500/50'
                  }`}>
                    {item.displayType}
                  </span>
                </div>
                {item.status === 'approved' && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-widest bg-red-600/90 text-white border border-red-400 shadow-lg">
                      Verified
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#051815] via-transparent to-transparent opacity-90"></div>
              </div>
              <div className="p-4 relative">
                <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-[#C5A059] transition-colors">{item.title}</h3>
                <p className="text-gray-400 text-[10px] mt-1 line-clamp-1">{item.address || "Odisha, India"}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-wider group-hover:underline">View Profile</span>
                  <span className="text-gray-500 text-xs">→</span>
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
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Sleek Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C5A059] mb-4 leading-tight">
            The original Sambalpuri : Saree, Dress, Bedsheet,<br/>Cloth Weavers, store and Rawmaterial supplier.
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto md:text-sm">
            Discover authentic Master Weavers and Verified Retail Shops for original Sambalpuri Handloom Sarees straight from Odisha. Support the heritage directly.
          </p>
        </div>

        {/* SEO District Links */}
        <div className="mb-10 flex flex-wrap gap-2 justify-center max-w-5xl mx-auto">
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

        {/* Search and Filters Bar */}
        <div className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl p-4 md:p-6 mb-8 shadow-xl flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:w-1/3">
            <input 
              type="text" 
              placeholder="Search name or location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#C5A059] transition-colors"
            />
          </div>
          <div className="w-full md:w-1/4">
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#C5A059] cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="weaver">Master Weavers</option>
              <option value="vendor">Retail Stores</option>
            </select>
          </div>
          <div className="w-full md:w-auto flex-1 flex justify-end">
            <div className="text-right">
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

            {/* Unverified Listings (Collapsible) */}
            {unverifiedListings.length > 0 && (
              <div className="pt-8 border-t border-[#C5A059]/10">
                <div className="text-center mb-8">
                  <button 
                    onClick={() => setShowUnverified(!showUnverified)}
                    className="bg-transparent border border-gray-500 text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-300 font-bold px-8 py-3 rounded-full text-xs uppercase tracking-widest shadow-lg hover:-translate-y-1"
                  >
                    {showUnverified ? "Hide Other Listings" : `Show More List (${unverifiedListings.length} Unverified)`}
                  </button>
                </div>

                {showUnverified && (
                  <div className="animate-fade-in">
                    <div className="flex items-center gap-3 mb-6 opacity-60">
                      <h2 className="text-xl font-serif font-bold text-gray-400">Other Listings</h2>
                      <div className="h-px flex-1 bg-gradient-to-r from-gray-700 to-transparent"></div>
                    </div>
                    <div className="opacity-80 hover:opacity-100 transition-opacity duration-500">
                      {renderGridWithAds(unverifiedListings)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
