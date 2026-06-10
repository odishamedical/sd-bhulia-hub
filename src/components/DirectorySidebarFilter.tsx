"use client";

import React from "react";
import * as Icons from "lucide-react";

interface SidebarProps {
  districts: string[];
  selectedDistrict: string;
  setSelectedDistrict: (v: string) => void;
  selectedRole: string;
  setSelectedRole: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
}

export default function DirectorySidebarFilter({
  districts,
  selectedDistrict,
  setSelectedDistrict,
  selectedRole,
  setSelectedRole,
  searchQuery,
  setSearchQuery
}: SidebarProps) {

  const clearAllFilters = () => {
    setSelectedDistrict("all");
    setSelectedRole("all");
    setSearchQuery("");
  };

  return (
    <aside className="w-full h-full rounded-2xl p-5 space-y-6 flex flex-col bg-[#051815] border border-[#C5A059]/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      
      <div className="flex justify-between items-center pb-4 border-b border-[#C5A059]/10">
        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-white">
          <Icons.Search className="w-4 h-4 text-[#C5A059]" />
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
            <Icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#C5A059]/60" />
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
              onChange={e => setSelectedRole(e.target.value)}
              className="w-full bg-[#0B2B26] border border-[#C5A059]/30 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C5A059] appearance-none cursor-pointer transition-colors"
            >
              <option value="all">All Roles</option>
              <option value="weaver">Master Weavers</option>
              <option value="vendor">Retail Stores</option>
              <option value="raw_material">Raw Material Suppliers</option>
            </select>
            <Icons.ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#C5A059]/60 pointer-events-none" />
          </div>
        </div>

        {/* District */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">District (Odisha)</label>
          <div className="relative">
            <select 
              value={selectedDistrict} 
              onChange={e => setSelectedDistrict(e.target.value)}
              className="w-full bg-[#0B2B26] border border-[#C5A059]/30 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C5A059] appearance-none cursor-pointer transition-colors"
            >
              <option value="all">All Districts</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <Icons.ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#C5A059]/60 pointer-events-none" />
          </div>
        </div>

      </div>

    </aside>
  );
}
