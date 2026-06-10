"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useVendorBySlug, useProducts } from "@/lib/db-hooks";
import PublicProfileTemplate from "@/components/PublicProfileTemplate";
import GlobalBannerSlot from "@/components/GlobalBannerSlot";

export default function VendorDetailPage() {
  const params = useParams();
  const rawSlug = typeof params?.slug === "string" ? params.slug : "";
  const vendorSlug = rawSlug.toLowerCase(); // keep for legacy if needed

  const { vendor, loading: vendorLoading } = useVendorBySlug(rawSlug);
  const { products, loading: productsLoading } = useProducts();

  const [mappedProfile, setMappedProfile] = useState<any>(null);
  const [mappedProducts, setMappedProducts] = useState<any[]>([]);

  useEffect(() => {
    if (vendor) {
      setMappedProfile({
        name: vendor.title || "Retail Shop",
        image: vendor.img || "/bhulia-hero.png",
        district: vendor.address?.split(",")?.[1]?.trim() || "Sambalpur",
        state: vendor.address?.split(",")?.[2]?.trim()?.split("-")?.[0]?.trim() || "Odisha",
        country: vendor.country || "India",
        description: vendor.desc || "Verified Retail Shop for Authentic Handlooms.",
        address: vendor.address || "Address not provided.",
        phone: vendor.phone || "N/A",
        whatsapp: vendor.whatsapp || "N/A",
        status: vendor.status,
        googlePlaceId: vendor.googlePlaceId,
        googleRating: vendor.googleRating,
        googleReviewsCount: vendor.googleReviewsCount,
      });

      // Filter products belonging to this vendor
      const sProducts = products.filter(p => 
        p.sellerId === vendor.id || 
        (p.vendorName && p.vendorName.toLowerCase().includes(vendor.title?.toLowerCase() || ""))
      );
      setMappedProducts(sProducts);
    }
  }, [vendor, products]);

  if (vendorLoading || productsLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-[#051815]">
        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-[#051815] p-6">
        <div className="text-center py-16 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl w-full max-w-2xl">
          <span className="text-5xl mb-4 block">🚫</span>
          <h2 className="text-3xl font-serif font-bold text-white mb-3">Shop Not Found</h2>
          <p className="text-gray-300">This retail shop profile does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (!mappedProfile) return null;

  return (
    <main className="relative flex-1 w-full bg-[#051815] text-white font-sans flex flex-col min-h-screen">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <GlobalBannerSlot placementId="content_top" context={{ audience: "shops", specificId: vendor.slug }} />
      </div>
      <PublicProfileTemplate 
        type="vendor" 
        profile={mappedProfile} 
        products={mappedProducts} 
      />
    </main>
  );
}
