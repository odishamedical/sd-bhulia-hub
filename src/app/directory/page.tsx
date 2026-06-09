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
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const combinedDirectory = useMemo(() => {
    const vList = vendors.map(v => ({ ...v, role: "vendor", displayType: "Retail Shop" }));
    const wList = weavers.map(w => ({ ...w, role: "weaver", displayType: "Master Weaver" }));
    return [...vList, ...wList].filter(item => item.status === "approved" || item.status === "unclaimed");
  }, [vendors, weavers]);

  const districts = useMemo(() => {
    const dSet = new Set<string>();
    combinedDirectory.forEach(item => {
      // Very basic district extraction if it's stored in 'district' or parsed from 'address'
      const d = (item as any).district || item.address?.split(",")?.[1]?.trim() || "Odisha";
      if (d) dSet.add(d);
    });
    return Array.from(dSet).sort();
  }, [combinedDirectory]);

  const filteredDirectory = useMemo(() => {
    return combinedDirectory.filter(item => {
      // Role Filter
      if (selectedRole !== "all" && item.role !== selectedRole) return false;
      // Status Filter
      if (selectedStatus === "verified" && item.status !== "approved") return false;
      if (selectedStatus === "unclaimed" && item.status !== "unclaimed") return false;
      // District Filter
      const d = (item as any).district || item.address?.split(",")?.[1]?.trim() || "Odisha";
      if (selectedDistrict !== "all" && d !== selectedDistrict) return false;
      // Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!item.title?.toLowerCase().includes(q) && !item.address?.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      // verified (approved) first, then unclaimed
      if (a.status === "approved" && b.status !== "approved") return -1;
      if (a.status !== "approved" && b.status === "approved") return 1;
      return 0;
    });
  }, [combinedDirectory, selectedRole, selectedStatus, selectedDistrict, searchQuery]);

  const loading = vendorsLoading || weaversLoading;

  return (
    <div className="min-h-screen bg-[#051815] font-sans pt-6 pb-20 relative overflow-hidden">
      
      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C5A059] mb-4">
            The Global Sambalpuri Handloom Directory
          </h1>
          <p className="text-gray-300 max-w-3xl md:text-lg">
            Discover authentic Master Weavers and Verified Retail Shops for original Sambalpuri Handloom Sarees straight from Odisha. Support the heritage directly.
          </p>
        </div>

        {/* Global Banner / Ads */}
        <div className="mb-8">
          <GlobalBannerSlot placement="directory_top" fallbackColor="from-[#0B2B26] to-[#051815]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar (Filters) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl p-6 sticky top-24 shadow-xl">
              <h3 className="text-xl font-serif font-bold text-white mb-6 border-b border-[#C5A059]/20 pb-2">Filter Directory</h3>
              
              <div className="mb-6">
                <input 
                  type="text" 
                  placeholder="Search name or location..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#C5A059]"
                />
              </div>

              {/* District Quick Links (Pills) */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-3">Quick Filter by District</label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                  <button 
                    onClick={() => setSelectedDistrict("all")}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all border ${selectedDistrict === "all" ? 'bg-[#C5A059] text-[#051815] border-[#C5A059]' : 'bg-[#051815] text-[#C5A059] border-[#C5A059]/30 hover:border-[#C5A059]/80'}`}
                  >
                    All Districts
                  </button>
                  {ODISHA_DISTRICTS.map(d => (
                    <button 
                      key={d}
                      onClick={() => setSelectedDistrict(d)}
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all border ${selectedDistrict === d ? 'bg-[#C5A059] text-[#051815] border-[#C5A059]' : 'bg-[#051815] text-[#C5A059] border-[#C5A059]/30 hover:border-[#C5A059]/80'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Role */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-3">Listing Type</label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="role" checked={selectedRole === "all"} onChange={() => setSelectedRole("all")} className="form-radio text-[#C5A059] focus:ring-[#C5A059] bg-[#051815] border-[#C5A059]/40" />
                    <span className="text-sm text-gray-300 group-hover:text-white">All Listings</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="role" checked={selectedRole === "weaver"} onChange={() => setSelectedRole("weaver")} className="form-radio text-[#C5A059] focus:ring-[#C5A059] bg-[#051815] border-[#C5A059]/40" />
                    <span className="text-sm text-gray-300 group-hover:text-white">Master Weavers</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="role" checked={selectedRole === "vendor"} onChange={() => setSelectedRole("vendor")} className="form-radio text-[#C5A059] focus:ring-[#C5A059] bg-[#051815] border-[#C5A059]/40" />
                    <span className="text-sm text-gray-300 group-hover:text-white">Retail Shops</span>
                  </label>
                </div>
              </div>

              {/* Status */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-3">Verification</label>
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-[#C5A059]"
                >
                  <option value="all">All Listings</option>
                  <option value="verified">Verified Only</option>
                  <option value="unclaimed">Unverified (Verify Yours)</option>
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-3">Location</label>
                <select 
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-[#C5A059]"
                >
                  <option value="all">All Districts</option>
                  {districts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Right Content (Grid) */}
          <div className="lg:col-span-3">
            <div className="mb-6 text-sm text-gray-400 font-semibold uppercase tracking-widest">
              Showing {filteredDirectory.length} Listings
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-[#0B2B26] border border-[#C5A059]/20 rounded-2xl h-64 animate-pulse"></div>
                ))}
              </div>
            ) : filteredDirectory.length === 0 ? (
              <div className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-3xl p-16 text-center">
                <span className="text-5xl block mb-4">🔍</span>
                <h3 className="text-xl font-bold text-white mb-2">No Profiles Found</h3>
                <p className="text-gray-400 text-sm mb-6">We couldn't find any listings matching your filters.</p>
                <button 
                  onClick={() => { setSelectedRole("all"); setSelectedStatus("all"); setSelectedDistrict("all"); setSearchQuery(""); }}
                  className="px-6 py-2 bg-[#0A3A35] text-[#C5A059] border border-[#C5A059]/40 rounded-xl font-bold text-xs uppercase tracking-wider"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDirectory.map((item, idx) => (
                  <Link 
                    key={`${item.role}-${item.id}-${idx}`} 
                    href={`/${item.role}/${item.slug}`}
                    className="group block bg-[#0B2B26] border border-[#C5A059]/20 hover:border-[#C5A059]/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(197,160,89,0.15)] hover:-translate-y-1 relative"
                  >
                    {/* Image Header */}
                    <div className="h-32 w-full relative bg-[#051815]">
                      {item.img && <Image src={item.img} alt={item.title || "Profile"} fill className="object-cover opacity-60 group-hover:opacity-80 transition-opacity" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B2B26] to-transparent"></div>
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md ${item.role === 'weaver' ? 'bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/50' : 'bg-blue-900/40 text-blue-300 border border-blue-500/50'}`}>
                          {item.displayType}
                        </span>
                      </div>
                      
                      {item.status === "unclaimed" && (
                        <div className="absolute top-4 right-4 bg-red-600/90 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md border border-red-400 shadow-lg animate-pulse">
                          Verify your page
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col h-[calc(100%-8rem)]">
                      <h3 className="text-xl font-serif font-bold text-white group-hover:text-[#C5A059] transition-colors mb-1 truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 truncate">
                        📍 {(item as any).district || item.address?.split(",")?.[1]?.trim() || "Odisha"}
                      </p>

                      {/* Google Rating Data */}
                      {item.googleRating ? (
                        <div className="flex items-center gap-1 mb-4">
                          <span className="text-yellow-400 text-xs">★</span>
                          <span className="font-bold text-gray-300 text-xs">{item.googleRating}</span>
                          <span className="text-[10px] text-gray-500">({item.googleReviewsCount} Google Reviews)</span>
                        </div>
                      ) : (
                        <div className="mb-4 text-[10px] text-gray-600 uppercase tracking-widest">No rating data</div>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#C5A059]/10">
                        {item.status === "approved" || item.isBhuliaVerified ? (
                          <div className="flex items-center gap-1 bg-[#C5A059]/10 px-2 py-1 rounded border border-[#C5A059]/30 text-[#C5A059] text-[10px] font-bold uppercase tracking-wider">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            <span>Bhulia.com Verified</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">
                            Imported from Google
                          </div>
                        )}
                        <span className="text-[#C5A059] opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
