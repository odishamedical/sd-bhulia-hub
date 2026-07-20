"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSupplierBySlug, useProducts, useSuppliers } from "@/lib/db-hooks";
import PublicProfileTemplate from "@/components/PublicProfileTemplate";
import GlobalBannerSlot from "@/components/GlobalBannerSlot";

export default function ClientSupplierPage() {
  const params = useParams();
  const rawSlug = typeof params?.slug === "string" ? params.slug : "";

  const { supplier, loading: supplierLoading } = useSupplierBySlug(rawSlug);
  const { products, loading: productsLoading } = useProducts({ status: "approved" });
  const { suppliers, loading: suppliersLoading } = useSuppliers();

  const [mappedProfile, setMappedProfile] = useState<any>(null);
  const [mappedProducts, setMappedProducts] = useState<any[]>([]);

  useEffect(() => {
    if (supplier) {
      let addressStr = "";
      if (typeof supplier.address === "object" && supplier.address !== null) {
        addressStr = `${supplier.address.streetAddress || ""}, ${supplier.address.cityTownVillage || ""}, ${supplier.address.district || ""}, ${supplier.address.state || ""}, India`;
      } else {
        addressStr = supplier.address || "";
      }

      const addressParts = addressStr.split(",").map((s: string) => s.trim()).filter((s: string) => s !== "");
      let extDistrict = addressParts.length >= 3 ? addressParts[addressParts.length - 3] : (supplier.district || "Sambalpur");
      if (extDistrict.toLowerCase() === "subarnapur" || extDistrict.toLowerCase() === "suvernpur") extDistrict = "Sonepur";
      const extState = addressParts.length >= 2 ? addressParts[addressParts.length - 2].split(" ")[0].replace(/[^a-zA-Z]/g, '') : (supplier.state || "Odisha");
      const extCountry = addressParts.length >= 1 ? addressParts[addressParts.length - 1].replace(/[^a-zA-Z ]/g, '').trim() : (supplier.country || "India");

      setMappedProfile({
        name: supplier.companyName || supplier.businessName || "Verified Raw Material Supplier",
        image: supplier.profileImage || supplier.img || "/bhulia-hero.png",
        district: supplier.district || extDistrict,
        state: supplier.state || extState,
        country: supplier.country || (extCountry === "India" || extCountry === "Odisha" ? "India" : extCountry),
        description: supplier.companyDesc || supplier.desc || "Verified Raw Material Supplier for Handloom Industry.",
        address: addressStr || supplier.businessAddress || "Address not provided.",
        rawAddress: typeof supplier.address === "object" ? supplier.address : null,
        phone: supplier.phone || "N/A",
        whatsapp: supplier.whatsapp || "N/A",
        status: supplier.status,
        googlePlaceId: supplier.googlePlaceId,
        googleRating: supplier.googleRating,
        googleReviewsCount: supplier.googleReviewsCount,
        handloomExperience: supplier.handloomExperience,
        generations: supplier.generations,
        specialties: supplier.specialties,
        materials: supplier.materials,
        scale: supplier.scale,
        googlePin: supplier.googlePin,
        gallery: supplier.gallery,
        videoUrl: supplier.videoUrl,
        facebookUrl: supplier.facebookUrl,
        instagramUrl: supplier.instagramUrl,
      });

      // Filter products belonging to this supplier
      const sProducts = products.filter(p => 
        p.sellerId === supplier.id || 
        (p.storeName && p.storeName.toLowerCase().includes((supplier.companyName || "").toLowerCase()))
      );
      setMappedProducts(sProducts);
    }
  }, [supplier, products]);

  if (supplierLoading || productsLoading || suppliersLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-[#051815]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!supplier || supplier.status === "pending_approval" || supplier.status === "pending" || supplier.status === "rejected") {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-[#051815] p-6">
        <div className="text-center py-16 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl w-full max-w-2xl">
          <span className="text-5xl mb-4 block">🚫</span>
          <h2 className="text-3xl font-serif font-bold text-white mb-3">Supplier Not Found</h2>
          <p className="text-gray-300">This supplier profile does not exist or is currently under review.</p>
        </div>
      </div>
    );
  }

  if (!mappedProfile) return null;

  return (
    <main className="relative flex-1 w-full bg-[#051815] text-white font-sans flex flex-col min-h-screen">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <GlobalBannerSlot placementId="content_top" context={{ audience: "suppliers", specificId: supplier.slug }} />
      </div>
      <PublicProfileTemplate 
        type="supplier" 
        profile={mappedProfile} 
        products={mappedProducts} 
        allProducts={products}
        allProfiles={suppliers}
      />
    </main>
  );
}
