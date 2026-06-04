"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWeaverBySlug, useProducts } from "@/lib/db-hooks";
import PublicProfileTemplate from "@/components/PublicProfileTemplate";

export default function WeaverStorePage() {
  const params = useParams();
  const rawSlug = typeof params?.slug === "string" ? params.slug : "";
  const weaverSlug = rawSlug.toLowerCase();

  const { weaver, loading: weaverLoading } = useWeaverBySlug(weaverSlug);
  const { products, loading: productsLoading } = useProducts();

  const [mappedProfile, setMappedProfile] = useState<any>(null);
  const [mappedProducts, setMappedProducts] = useState<any[]>([]);

  useEffect(() => {
    if (weaver) {
      setMappedProfile({
        name: weaver.title || "Master Weaver",
        image: weaver.img || "/bhulia-hero.png",
        district: weaver.address?.split(",")?.[1]?.trim() || "Sambalpur",
        state: weaver.address?.split(",")?.[2]?.trim()?.split("-")?.[0]?.trim() || "Odisha",
        description: weaver.desc || "Odishan Master Weaver specializing in traditional handlooms.",
        address: weaver.address || "Address not provided.",
        phone: weaver.phone || "N/A",
        whatsapp: weaver.whatsapp || "N/A",
      });

      // Filter products belonging to this weaver
      const wProducts = products.filter(p => 
        p.ownerId === weaver.id || 
        (p.weaverName && p.weaverName.toLowerCase().includes(weaver.title?.toLowerCase() || ""))
      );
      setMappedProducts(wProducts);
    }
  }, [weaver, products]);

  if (weaverLoading || productsLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-[#051815]">
        <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!weaver) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-[#051815] p-6">
        <div className="text-center py-16 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl w-full max-w-2xl">
          <span className="text-5xl mb-4 block">🚫</span>
          <h2 className="text-3xl font-serif font-bold text-white mb-3">Weaver Not Found</h2>
          <p className="text-gray-300">This weaver profile does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (!mappedProfile) return null;

  return (
    <main className="relative flex-1 w-full bg-[#051815] text-white font-sans flex flex-col min-h-screen">
      <PublicProfileTemplate 
        type="weaver" 
        profile={mappedProfile} 
        products={mappedProducts} 
      />
    </main>
  );
}
