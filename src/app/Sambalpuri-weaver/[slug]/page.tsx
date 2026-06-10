"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWeaverBySlug, useProducts, useWeavers } from "@/lib/db-hooks";
import PublicProfileTemplate from "@/components/PublicProfileTemplate";
import GlobalBannerSlot from "@/components/GlobalBannerSlot";

export default function WeaverStorePage() {
  const params = useParams();
  const rawSlug = typeof params?.slug === "string" ? params.slug : "";
  const weaverSlug = rawSlug.toLowerCase(); // keep for legacy if needed

  const { weaver, loading: weaverLoading } = useWeaverBySlug(rawSlug);
  const { products, loading: productsLoading } = useProducts();
  const { weavers, loading: weaversLoading } = useWeavers();

  const [mappedProfile, setMappedProfile] = useState<any>(null);
  const [mappedProducts, setMappedProducts] = useState<any[]>([]);

  useEffect(() => {
    if (weaver) {
      const addressParts = (weaver.address || "").split(",").map((s: string) => s.trim()).filter((s: string) => s !== "");
      let extDistrict = addressParts.length >= 3 ? addressParts[addressParts.length - 3] : "Sambalpur";
      if (extDistrict.toLowerCase() === "subarnapur" || extDistrict.toLowerCase() === "suvernpur") extDistrict = "Sonepur";
      const extState = addressParts.length >= 2 ? addressParts[addressParts.length - 2].split(" ")[0].replace(/[^a-zA-Z]/g, '') : "Odisha";
      const extCountry = addressParts.length >= 1 ? addressParts[addressParts.length - 1].replace(/[^a-zA-Z ]/g, '').trim() : "India";

      setMappedProfile({
        name: weaver.title || "Master Weaver",
        image: weaver.img || "/bhulia-hero.png",
        district: weaver.district || extDistrict,
        state: weaver.state || extState,
        country: weaver.country || (extCountry === "India" || extCountry === "Odisha" ? "India" : extCountry),
        description: weaver.desc || "Odishan Master Weaver specializing in traditional handlooms.",
        address: weaver.address || "Address not provided.",
        phone: weaver.phone || "N/A",
        whatsapp: weaver.whatsapp || "N/A",
        status: weaver.status,
        googlePlaceId: weaver.googlePlaceId,
        googleRating: weaver.googleRating,
        googleReviewsCount: weaver.googleReviewsCount,
      });

      // Filter products belonging to this weaver
      const wProducts = products.filter(p => 
        p.sellerId === weaver.id || 
        (p.weaverName && p.weaverName.toLowerCase().includes(weaver.title?.toLowerCase() || ""))
      );
      setMappedProducts(wProducts);
    }
  }, [weaver, products]);

  if (weaverLoading || productsLoading || weaversLoading) {
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
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <GlobalBannerSlot placementId="content_top" context={{ audience: "weavers", specificId: weaver.slug }} />
      </div>
      <PublicProfileTemplate 
        type="weaver" 
        profile={mappedProfile} 
        products={mappedProducts}
        allProducts={products}
        allProfiles={weavers}
      />
    </main>
  );
}
