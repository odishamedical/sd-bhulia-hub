"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/products";
import { useState, useEffect } from "react";

export interface PublicProfileProps {
  type: "weaver" | "store";
  profile: {
    name: string;
    image: string;
    district: string;
    state: string;
    description: string;
    address: string;
    phone: string;
    whatsapp: string;
  };
  products: Product[];
}

export default function PublicProfileTemplate({ type, profile, products }: PublicProfileProps) {
  const isWeaver = type === "weaver";
  const badgeText = isWeaver ? "Bhulia.com Verified Weavers" : "Bhulia.com Verified Sambalpuri Shop";
  const badgeColor = isWeaver ? "text-[#C5A059] border-[#C5A059]" : "text-blue-400 border-blue-400";
  const badgeBg = isWeaver ? "bg-[#C5A059]/10" : "bg-blue-400/10";
  const [userRole, setUserRole] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("sd_current_user_role"));
    }
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8 relative z-10">
      
      {/* Hero Section */}
      <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row gap-8 shadow-xl">
        
        {/* Left: Image */}
        <div className="lg:w-1/4 shrink-0">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-[#C5A059]/50 shadow-lg bg-[#051815]">
            <Image src={profile.image || "/bhulia-hero.png"} alt={profile.name} fill className="object-cover" />
          </div>
        </div>

        {/* Center: Details */}
        <div className="lg:w-1/2 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-[#C5A059]/20 pb-6 lg:pb-0 lg:pr-8">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-widest mb-4 w-max ${badgeColor} ${badgeBg}`}>
            <span>{badgeText}</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#C5A059] leading-tight mb-2">
            {profile.name}
          </h1>
          
          <div className="text-sm font-semibold text-white uppercase tracking-widest mb-4 opacity-90">
            📍 {profile.district}, {profile.state}
          </div>
          
          <p className="text-sm text-gray-300 leading-relaxed font-sans border-l-2 border-[#C5A059] pl-3 py-1">
            {profile.description || "Dedicated to preserving the rich heritage of Sambalpuri handlooms."}
          </p>
        </div>

        {/* Right: Contact & Address */}
        <div className="lg:w-1/4 flex flex-col justify-center space-y-6">
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Full Address</h3>
            <p className="text-sm text-white font-medium">{profile.address || "Address not provided."}</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#C5A059]/20">
            <h3 className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Contact Direct</h3>
            
            <button onClick={() => {
              const msg = `Hello ${profile.name}, I found your profile on Bhulia.com. I am interested in your handlooms.`;
              window.open(`https://api.whatsapp.com/send?phone=${profile.whatsapp.replace(/[^0-9]/g,'')}&text=${encodeURIComponent(msg)}`, "_blank");
            }} className="w-full flex items-center justify-center gap-2 py-3 bg-green-600/20 hover:bg-green-600/40 border border-green-500/50 text-green-400 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer">
              <span>💬 WhatsApp</span>
            </button>
            
            <a href={`tel:${profile.phone}`} className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-400 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer">
              <span>📞 Call Direct</span>
            </a>
          </div>
        </div>

      </div>

      {/* Product Grid Section */}
      <div className="space-y-6 pt-6 border-t border-[#C5A059]/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl md:text-3xl font-serif text-[#C5A059] font-bold tracking-wider">Product Catalog</h3>
            <p className="text-[10px] md:text-xs text-gray-300 uppercase tracking-widest font-semibold">Authentic handlooms directly from {profile.name}</p>
          </div>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#C5A059] transition-all duration-300 shadow-xl text-white">
                <div className="relative w-full aspect-square overflow-hidden bg-[#051815]">
                  <Image src={product.images?.[0] || "/bhulia-hero.png"} alt={product.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-white text-sm group-hover:text-[#C5A059] transition-colors mb-1 line-clamp-2">{product.title}</h4>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">{product.category}</p>
                  </div>
                  <div className="flex justify-between items-center border-t border-[#C5A059]/20 pt-3">
                    <div className="flex flex-col">
                      <span className={`text-lg font-serif font-bold ${userRole === "reseller" && product.allowResellerMargin ? "text-gray-400 line-through text-sm" : "text-[#C5A059]"}`}>₹{product.price?.toLocaleString() || product.price}</span>
                      {userRole === "reseller" && product.allowResellerMargin && product.resellerPrice && (
                        <span className="text-lg font-serif font-bold text-green-400">₹{product.resellerPrice}</span>
                      )}
                    </div>
                    <Link href={`/product/${product.slug || product.id}`} className="px-3 py-1.5 bg-[#C5A059]/20 text-[#C5A059] text-xs font-bold uppercase rounded hover:bg-[#C5A059] hover:text-[#0A1021] transition-colors">
                      View
                    </Link>
                  </div>
                </div>
              </div>
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

    </div>
  );
}
