"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useVendorBySlug, useProducts, useVendors } from "@/lib/db-hooks";
import PublicProfileTemplate from "@/components/PublicProfileTemplate";
import GlobalBannerSlot from "@/components/GlobalBannerSlot";

export default function VendorDetailPage() {
  const params = useParams();
  const rawSlug = typeof params?.slug === "string" ? params.slug : "";
  const vendorSlug = rawSlug.toLowerCase(); // keep for legacy if needed

  const { vendor, loading: vendorLoading } = useVendorBySlug(rawSlug);
  const { products, loading: productsLoading } = useProducts({ status: "approved" });
  const { vendors, loading: vendorsLoading } = useVendors();

  const [mappedProfile, setMappedProfile] = useState<any>(null);
  const [mappedProducts, setMappedProducts] = useState<any[]>([]);

  useEffect(() => {
    if (vendor) {
      const addressParts = (vendor.address || "").split(",").map((s: string) => s.trim()).filter((s: string) => s !== "");
      let extDistrict = addressParts.length >= 3 ? addressParts[addressParts.length - 3] : "Sambalpur";
      if (extDistrict.toLowerCase() === "subarnapur" || extDistrict.toLowerCase() === "suvernpur") extDistrict = "Sonepur";
      const extState = addressParts.length >= 2 ? addressParts[addressParts.length - 2].split(" ")[0].replace(/[^a-zA-Z]/g, '') : "Odisha";
      const extCountry = addressParts.length >= 1 ? addressParts[addressParts.length - 1].replace(/[^a-zA-Z ]/g, '').trim() : "India";

      setMappedProfile({
        name: vendor.title || "Retail Shop",
        image: vendor.img || "/bhulia-hero.png",
        district: vendor.district || extDistrict,
        state: vendor.state || extState,
        country: vendor.country || (extCountry === "India" || extCountry === "Odisha" ? "India" : extCountry),
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

  if (vendorLoading || productsLoading || vendorsLoading) {
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
        allProducts={products}
        allProfiles={vendors}
      />
    </main>
  );
}
