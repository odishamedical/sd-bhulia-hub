"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useStoreBySlug, useProducts } from "@/lib/db-hooks";
import PublicProfileTemplate from "@/components/PublicProfileTemplate";

export default function StoreDetailPage() {
  const params = useParams();
  const rawSlug = typeof params?.slug === "string" ? params.slug : "";
  const storeSlug = rawSlug.toLowerCase();

  const { store, loading: storeLoading } = useStoreBySlug(storeSlug);
  const { products, loading: productsLoading } = useProducts();

  const [mappedProfile, setMappedProfile] = useState<any>(null);
  const [mappedProducts, setMappedProducts] = useState<any[]>([]);

  useEffect(() => {
    if (store) {
      setMappedProfile({
        name: store.title || "Retail Shop",
        image: store.img || "/bhulia-hero.png",
        district: store.address?.split(",")?.[1]?.trim() || "Sambalpur",
        state: store.address?.split(",")?.[2]?.trim()?.split("-")?.[0]?.trim() || "Odisha",
        description: store.desc || "Verified Retail Shop for Authentic Handlooms.",
        address: store.address || "Address not provided.",
        phone: store.phone || "N/A",
        whatsapp: store.whatsapp || "N/A",
      });

      // Filter products belonging to this store
      const sProducts = products.filter(p => 
        p.ownerId === store.id || 
        (p.storeName && p.storeName.toLowerCase().includes(store.title?.toLowerCase() || ""))
      );
      setMappedProducts(sProducts);
    }
  }, [store, products]);

  if (storeLoading || productsLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-[#051815]">
        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!store) {
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
      <PublicProfileTemplate 
        type="store" 
        profile={mappedProfile} 
        products={mappedProducts} 
      />
    </main>
  );
}
