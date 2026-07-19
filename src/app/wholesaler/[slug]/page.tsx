"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWholesalerBySlug, useProducts, useWholesalers } from "@/lib/db-hooks";
import PublicProfileTemplate from "@/components/PublicProfileTemplate";
import GlobalBannerSlot from "@/components/GlobalBannerSlot";

export default function WholesalerPublicPage() {
  const params = useParams();
  const rawSlug = typeof params?.slug === "string" ? params.slug : "";

  const { wholesaler, loading: wholesalerLoading } = useWholesalerBySlug(rawSlug);
  const { products, loading: productsLoading } = useProducts({ status: "approved" });
  const { wholesalers, loading: wholesalersLoading } = useWholesalers();

  const [mappedProfile, setMappedProfile] = useState<any>(null);
  const [mappedProducts, setMappedProducts] = useState<any[]>([]);

  useEffect(() => {
    if (wholesaler) {
      let addressStr = "";
      if (typeof wholesaler.address === "object" && wholesaler.address !== null) {
        addressStr = `${wholesaler.address.streetAddress || ""}, ${wholesaler.address.cityTownVillage || ""}, ${wholesaler.address.district || ""}, ${wholesaler.address.state || ""}, India`;
      } else {
        addressStr = wholesaler.address || "";
      }

      const addressParts = addressStr.split(",").map((s: string) => s.trim()).filter((s: string) => s !== "");
      let extDistrict = addressParts.length >= 3 ? addressParts[addressParts.length - 3] : (wholesaler.district || "Sambalpur");
      if (extDistrict.toLowerCase() === "subarnapur" || extDistrict.toLowerCase() === "suvernpur") extDistrict = "Sonepur";
      const extState = addressParts.length >= 2 ? addressParts[addressParts.length - 2].split(" ")[0].replace(/[^a-zA-Z]/g, '') : (wholesaler.state || "Odisha");
      const extCountry = addressParts.length >= 1 ? addressParts[addressParts.length - 1].replace(/[^a-zA-Z ]/g, '').trim() : (wholesaler.country || "India");

      setMappedProfile({
        name: wholesaler.companyName || wholesaler.businessName || "Verified Wholesaler",
        image: wholesaler.profileImage || wholesaler.img || "/bhulia-hero.png",
        district: wholesaler.district || extDistrict,
        state: wholesaler.state || extState,
        country: wholesaler.country || (extCountry === "India" || extCountry === "Odisha" ? "India" : extCountry),
        description: wholesaler.companyDesc || wholesaler.desc || "Verified B2B Wholesaler for Authentic Handlooms.",
        address: addressStr || wholesaler.businessAddress || "Address not provided.",
        rawAddress: typeof wholesaler.address === "object" ? wholesaler.address : null,
        phone: wholesaler.phone || "N/A",
        whatsapp: wholesaler.whatsapp || "N/A",
        status: wholesaler.status,
        googlePlaceId: wholesaler.googlePlaceId,
        googleRating: wholesaler.googleRating,
        googleReviewsCount: wholesaler.googleReviewsCount,
        handloomExperience: wholesaler.handloomExperience,
        generations: wholesaler.generations,
        specialties: wholesaler.specialties,
        materials: wholesaler.materials,
        scale: wholesaler.scale,
        googlePin: wholesaler.googlePin,
        gallery: wholesaler.gallery,
        videoUrl: wholesaler.videoUrl,
        facebookUrl: wholesaler.facebookUrl,
        instagramUrl: wholesaler.instagramUrl,
      });

      // Filter products belonging to this wholesaler
      const wProducts = products.filter(p => 
        p.sellerId === wholesaler.id || 
        (p.storeName && p.storeName.toLowerCase().includes((wholesaler.companyName || "").toLowerCase()))
      );
      setMappedProducts(wProducts);
    }
  }, [wholesaler, products]);

  if (wholesalerLoading || productsLoading || wholesalersLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-[#051815]">
        <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!wholesaler || wholesaler.status === "pending_approval" || wholesaler.status === "pending" || wholesaler.status === "rejected") {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-[#051815] p-6">
        <div className="text-center py-16 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl w-full max-w-2xl">
          <span className="text-5xl mb-4 block">🚫</span>
          <h2 className="text-3xl font-serif font-bold text-white mb-3">Wholesaler Not Found</h2>
          <p className="text-gray-300">This wholesaler profile does not exist or is currently under review.</p>
        </div>
      </div>
    );
  }

  if (!mappedProfile) return null;

  return (
    <main className="relative flex-1 w-full bg-[#051815] text-white font-sans flex flex-col min-h-screen">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <GlobalBannerSlot placementId="content_top" context={{ audience: "wholesalers", specificId: wholesaler.slug }} />
      </div>
      <PublicProfileTemplate 
        type="wholesaler" 
        profile={mappedProfile} 
        products={mappedProducts} 
        allProducts={products}
        allProfiles={wholesalers}
      />
    </main>
  );
}
