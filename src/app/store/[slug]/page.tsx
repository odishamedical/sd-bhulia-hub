"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useStoreBySlug, useProducts, useStores } from "@/lib/db-hooks";
import PublicProfileTemplate from "@/components/PublicProfileTemplate";
import GlobalBannerSlot from "@/components/GlobalBannerSlot";

export default function VendorDetailPage() {
  const params = useParams();
  const rawSlug = typeof params?.slug === "string" ? params.slug : "";
  const storeSlug = rawSlug.toLowerCase(); // keep for legacy if needed

  const { store, loading: storeLoading } = useStoreBySlug(rawSlug);
  const { products, loading: productsLoading } = useProducts({ status: "approved" });
  const { stores, loading: storesLoading } = useStores();

  const [mappedProfile, setMappedProfile] = useState<any>(null);
  const [mappedProducts, setMappedProducts] = useState<any[]>([]);

  useEffect(() => {
    if (store) {
      let addressStr = "";
      if (typeof store.address === "object" && store.address !== null) {
        addressStr = `${store.address.streetAddress || ""}, ${store.address.cityTownVillage || ""}, ${store.address.district || ""}, ${store.address.state || ""}, India`;
      } else {
        addressStr = store.address || "";
      }

      const addressParts = addressStr.split(",").map((s: string) => s.trim()).filter((s: string) => s !== "");
      let extDistrict = addressParts.length >= 3 ? addressParts[addressParts.length - 3] : (store.district || "Sambalpur");
      if (extDistrict.toLowerCase() === "subarnapur" || extDistrict.toLowerCase() === "suvernpur") extDistrict = "Sonepur";
      const extState = addressParts.length >= 2 ? addressParts[addressParts.length - 2].split(" ")[0].replace(/[^a-zA-Z]/g, '') : (store.state || "Odisha");
      const extCountry = addressParts.length >= 1 ? addressParts[addressParts.length - 1].replace(/[^a-zA-Z ]/g, '').trim() : (store.country || "India");

      setMappedProfile({
        name: store.title || "Retail Shop",
        image: store.img || "/bhulia-hero.png",
        district: store.district || extDistrict,
        state: store.state || extState,
        country: store.country || (extCountry === "India" || extCountry === "Odisha" ? "India" : extCountry),
        description: store.desc || "Verified Retail Shop for Authentic Handlooms.",
        address: addressStr || "Address not provided.",
        rawAddress: typeof store.address === "object" ? store.address : null,
        phone: store.phone || "N/A",
        whatsapp: store.whatsapp || "N/A",
        status: store.status,
        googlePlaceId: store.googlePlaceId,
        googleRating: store.googleRating,
        googleReviewsCount: store.googleReviewsCount,
        handloomExperience: store.handloomExperience,
        generations: store.generations,
        specialties: store.specialties,
        materials: store.materials,
        scale: store.scale,
        googlePin: store.googlePin,
        gallery: store.gallery,
        videoUrl: store.videoUrl,
        facebookUrl: store.facebookUrl,
        instagramUrl: store.instagramUrl,
      });

      // Filter products belonging to this store
      const sProducts = products.filter(p => 
        p.sellerId === store.id || 
        (p.storeName && p.storeName.toLowerCase().includes(store.title?.toLowerCase() || ""))
      );
      setMappedProducts(sProducts);
    }
  }, [store, products]);

  if (storeLoading || productsLoading || storesLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-[#051815]">
        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!store || store.status === "pending_approval" || store.status === "pending" || store.status === "rejected") {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-[#051815] p-6">
        <div className="text-center py-16 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl w-full max-w-2xl">
          <span className="text-5xl mb-4 block">🚫</span>
          <h2 className="text-3xl font-serif font-bold text-white mb-3">Shop Not Found</h2>
          <p className="text-gray-300">This retail shop profile does not exist or is currently under review.</p>
        </div>
      </div>
    );
  }

  if (!mappedProfile) return null;

  return (
    <main className="relative flex-1 w-full bg-[#051815] text-white font-sans flex flex-col min-h-screen">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <GlobalBannerSlot placementId="content_top" context={{ audience: "shops", specificId: store.slug }} />
      </div>
      <PublicProfileTemplate 
        type="store" 
        profile={mappedProfile} 
        products={mappedProducts} 
        allProducts={products}
        allProfiles={stores}
      />
    </main>
  );
}
