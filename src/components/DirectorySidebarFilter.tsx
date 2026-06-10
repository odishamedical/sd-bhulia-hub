"use client";

import React from "react";
import { INDIAN_STATES, ODISHA_DISTRICT_BLOCKS, ODISHA_DISTRICTS } from "@/lib/locations";

interface SidebarProps {
  selectedCountry: string;
  setSelectedCountry: (v: string) => void;
  selectedState: string;
  setSelectedState: (v: string) => void;
  districts: string[];
  selectedDistrict: string;
  setSelectedDistrict: (v: string) => void;
  selectedBlock: string;
  setSelectedBlock: (v: string) => void;
  selectedVillage: string;
  setSelectedVillage: (v: string) => void;
  selectedRole: string;
  setSelectedRole: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
}

export default function DirectorySidebarFilter({
  selectedCountry,
  setSelectedCountry,
  selectedState,
  setSelectedState,
  districts,
  selectedDistrict,
  setSelectedDistrict,
  selectedBlock,
  setSelectedBlock,
  selectedVillage,
  setSelectedVillage,
  selectedRole,
  setSelectedRole,
  searchQuery,
  setSearchQuery
}: SidebarProps) {

  const clearAllFilters = () => {
    setSelectedCountry("India");
    setSelectedState("Odisha");
    setSelectedDistrict("all");
    setSelectedBlock("");
    setSelectedVillage("");
    setSelectedRole("all");
    setSearchQuery("");
  };

  return (
    <aside className="w-full h-full rounded-2xl p-5 space-y-6 flex flex-col bg-[#051815] border border-[#C5A059]/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      
      <div className="flex justify-between items-center pb-4 border-b border-[#C5A059]/10">
        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-white">
          <svg className="w-4 h-4 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <span>Advanced Filters</span>
        </span>
        <button 
          onClick={clearAllFilters}
          className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059] hover:underline"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-5 flex-1">
        
        {/* Search Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Search</label>
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#C5A059]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Name or location..."
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B2B26] border border-[#C5A059]/30 text-white text-xs pl-9 pr-4 py-3 rounded-xl outline-none focus:border-[#C5A059] transition-colors"
            />
          </div>
        </div>

        {/* Category / Role */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Category</label>
          <div className="relative">
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-[#0B2B26] border border-[#C5A059]/30 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C5A059] appearance-none cursor-pointer transition-colors"
            >
              <option value="all">All Categories</option>
              <option value="weaver">Master Weavers</option>
              <option value="vendor">Retail Stores</option>
              <option value="wholesaler">Wholesaler (B2B)</option>
              <option value="raw_material">Raw Material Suppliers</option>
            </select>
            <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#C5A059]/60 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        {/* Country */}
        <div className="space-y-2 pt-2 border-t border-[#C5A059]/10">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059]">Country</label>
          <input 
            type="text" 
            value={selectedCountry} 
            onChange={e => setSelectedCountry(e.target.value)}
            disabled
            className="w-full bg-[#051815] border border-[#C5A059]/10 text-gray-400 text-xs px-4 py-3 rounded-xl outline-none cursor-not-allowed"
          />
        </div>

        {/* State */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059]">State</label>
          <div className="relative">
            <select 
              value={selectedState} 
              onChange={e => {
                setSelectedState(e.target.value);
                setSelectedDistrict("all");
                setSelectedBlock("");
                setSelectedVillage("");
              }}
              className="w-full bg-[#0B2B26] border border-[#C5A059]/30 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C5A059] appearance-none cursor-pointer transition-colors"
            >
              <option value="all">Select State</option>
              {INDIAN_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#C5A059]/60 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        {/* District */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059]">District</label>
          {selectedState === "Odisha" ? (
            <div className="relative">
              <select 
                value={selectedDistrict} 
                onChange={e => {
                  setSelectedDistrict(e.target.value);
                  setSelectedBlock("");
                }}
                disabled={!selectedState}
                className="w-full bg-[#0B2B26] border border-[#C5A059]/30 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C5A059] appearance-none cursor-pointer transition-colors disabled:opacity-50"
              >
                <option value="all">All Districts</option>
                {ODISHA_DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#C5A059]/60 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          ) : (
            <input 
              type="text" 
              value={selectedDistrict === "all" ? "" : selectedDistrict} 
              onChange={e => setSelectedDistrict(e.target.value)}
              placeholder="Enter District Name"
              disabled={!selectedState}
              className="w-full bg-[#0B2B26] border border-[#C5A059]/30 text-white text-xs px-4 py-3 rounded-xl outline-none focus:border-[#C5A059] transition-colors disabled:opacity-50"
            />
          )}
        </div>

        {/* Block */}
        {selectedState === "Odisha" ? (
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059]">Block</label>
            <div className="relative">
              <select 
                value={selectedBlock} 
                onChange={e => setSelectedBlock(e.target.value)}
                disabled={!selectedDistrict || selectedDistrict === "all"}
                className="w-full bg-[#0B2B26] border border-[#C5A059]/30 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C5A059] appearance-none cursor-pointer transition-colors disabled:opacity-50"
              >
                <option value="">All Blocks</option>
                {(selectedDistrict && selectedDistrict !== "all" && ODISHA_DISTRICT_BLOCKS[selectedDistrict]) && 
                  ODISHA_DISTRICT_BLOCKS[selectedDistrict].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))
                }
              </select>
              <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#C5A059]/60 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059]">Block <span className="opacity-60 lowercase">(optional)</span></label>
            <input 
              type="text" 
              value={selectedBlock} 
              onChange={e => setSelectedBlock(e.target.value)}
              placeholder="Enter Block Name"
              disabled={selectedState === "all" || !selectedDistrict}
              className="w-full bg-[#0B2B26] border border-[#C5A059]/30 text-white text-xs px-4 py-3 rounded-xl outline-none focus:border-[#C5A059] transition-colors disabled:opacity-50"
            />
          </div>
        )}

        {/* Town / Village */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059]">Town / Village</label>
          <input 
            type="text" 
            value={selectedVillage} 
            onChange={e => setSelectedVillage(e.target.value)}
            placeholder="Enter Town or Village"
            disabled={!selectedState}
            className="w-full bg-[#0B2B26] border border-[#C5A059]/30 text-white text-xs px-4 py-3 rounded-xl outline-none focus:border-[#C5A059] transition-colors disabled:opacity-50"
          />
        </div>

      </div>

    </aside>
  );
}
