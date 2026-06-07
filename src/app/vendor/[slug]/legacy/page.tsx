"use client";

import React from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { MASTER_STORES, DEFAULT_STORE } from "../../data";

export default function StoreLegacyPage() {
  const params = useParams();
  const rawSlug = typeof params?.slug === "string" ? params.slug : "maa-samaleswari-weavers";
  const storeSlug = rawSlug.toLowerCase();

  const store = MASTER_STORES.find((s) => s.slug === storeSlug || s.id.toLowerCase() === storeSlug) || {
    ...DEFAULT_STORE,
    id: storeSlug.toUpperCase(),
    slug: storeSlug,
    name: `Store/PWCS (${storeSlug.replace(/-/g, " ")})`,
  };

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8 relative z-10">
      
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-3xl font-serif text-[#C5A059] font-bold tracking-wider">
          Our Weaving Legacy & Craft Guild
        </h2>
        <p className="text-[10px] md:text-xs text-gray-300 uppercase tracking-widest font-semibold">
          Preserving double-ikat heritage across generations at {store.name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Biography Block */}
        <div className="lg:col-span-8 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold uppercase tracking-widest">
              <span>ESTABLISHED TRADITION</span>
            </div>
            
            <h3 className="text-2xl font-serif font-bold text-[#C5A059]">The Hands Behind the Loom</h3>
            <p className="text-sm text-gray-200 leading-relaxed font-sans">
              Sambalpuri weaving (known as Bandha Kala) is a mathematically precise craft where warp and weft yarns are bound and resist-dyed before they touch the pit loom. Our society collects weavers from surrounding villages, ensuring standard wages, yarn supply, and direct market access.
            </p>
            <p className="text-sm text-gray-300 leading-relaxed font-sans">
              Each piece represents between 15 to 60 days of continuous, highly concentrated manual work. By maintaining the integrity of these patterns (such as Pasapalli grids and temple borders), we keep this Bhulia.comged artform alive without relying on automated power looms.
            </p>

            {/* Verification Steps Indicator */}
            <div className="bg-[#051815] border border-[#C5A059]/30 rounded-2xl p-5 space-y-4 font-sans text-xs">
              <h4 className="text-[#C5A059] uppercase tracking-wider font-bold">Bhulia.com Auditing Guarantee:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-300">
                <div className="space-y-1">
                  <span className="text-[#C5A059] font-bold block">1. Thread Count Checks</span>
                  <p className="text-[11px] text-gray-400">Yarn quality, ply metrics and material authentication.</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[#C5A059] font-bold block">2. Double-Ikat Purity</span>
                  <p className="text-[11px] text-gray-400">Verifying the geometric alignment of dyed threads.</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[#C5A059] font-bold block">3. Smart QR Seal</span>
                  <p className="text-[11px] text-gray-400">Pasting the immutable security sticker onto verified products.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Credentials Sidebar */}
        <div className="lg:col-span-4 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 flex flex-col justify-between shadow-xl text-white">
          <div className="space-y-6">
            <h3 className="text-lg font-serif font-bold text-[#C5A059] border-b border-[#C5A059]/20 pb-3">Government Registry</h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center bg-[#051815] p-3 rounded-xl border border-[#C5A059]/20">
                <span className="text-xs text-gray-400">Bhulia.com Certificate:</span>
                <span className="font-mono text-xs font-bold text-[#C5A059]">{store.giTagNumber.split(":")[1] || store.giTagNumber}</span>
              </div>

              <div className="flex justify-between items-center bg-[#051815] p-3 rounded-xl border border-[#C5A059]/20">
                <span className="text-xs text-gray-400">Active Pit Looms:</span>
                <span className="font-bold text-white text-sm">{store.activeWeaversCount} Looms</span>
              </div>

              <div className="flex justify-between items-center bg-[#051815] p-3 rounded-xl border border-[#C5A059]/20">
                <span className="text-xs text-gray-400">Specialty Mark:</span>
                <span className="text-xs font-bold text-green-400 uppercase tracking-wider">✓ Handloom Mark Passed</span>
              </div>
            </div>

            <div className="border-t border-[#C5A059]/20 pt-4 space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block">Verified Motifs Weaved</span>
              <div className="flex flex-wrap gap-1.5">
                {store.specialtyTags.map((tag) => (
                  <span key={tag} className="text-[9px] bg-[#0A3A35] px-2 py-1 rounded-lg border border-[#C5A059]/20 text-gray-200">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Roster detail grid */}
      <div className="space-y-4 pt-6 border-t border-[#C5A059]/20">
        <h3 className="text-xl font-serif text-[#C5A059] font-bold">Guild Master Craftsmen Roster</h3>
        <p className="text-xs text-gray-300">Weavers actively engaged in producing the dynamic catalog for this shop:</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {store.memberRoster.map((member) => (
            <div key={member} className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0A3A35] border border-[#C5A059]/40 flex items-center justify-center font-serif text-sm font-black text-[#C5A059] shadow-inner">
                {member.split(" ").slice(-1)[0][0]}
              </div>
              <div>
                <span className="text-xs font-bold text-white block">{member}</span>
                <span className="text-[9px] text-[#C5A059] uppercase tracking-widest block mt-0.5">Master Weaver</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
