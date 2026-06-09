"use client";

import React from "react";
import Link from "next/link";
import { ODISHA_DISTRICTS } from "@/lib/locations";

export default function DistrictLinksRow() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-wrap gap-2 justify-center">
        {ODISHA_DISTRICTS.map((district) => (
          <Link 
            key={district} 
            href={`/directory?district=${encodeURIComponent(district)}`}
            className="bg-[#051815] border border-[#C5A059]/20 text-gray-400 hover:text-[#C5A059] hover:border-[#C5A059]/60 px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest transition-all duration-300 hover:bg-[#0B2B26] shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            {district}
          </Link>
        ))}
      </div>
    </div>
  );
}
