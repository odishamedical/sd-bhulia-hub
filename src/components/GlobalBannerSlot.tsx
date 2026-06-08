"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useBanners } from "@/hooks/useBanners";
import { AdCampaign } from "@/types/cms";

interface Props {
  placementId: AdCampaign["placement"];
  context: {
    audience: "global" | "weavers" | "shops" | "products";
    specificId?: string;
  };
}

export default function GlobalBannerSlot({ placementId, context }: Props) {
  const { banners, loading, getBannersForPlacement, trackClick, trackImpression } = useBanners();
  const [activeBanners, setActiveBanners] = useState<AdCampaign[]>([]);
  const [hasLoggedImpressions, setHasLoggedImpressions] = useState(false);

  useEffect(() => {
    if (!loading) {
      const match = getBannersForPlacement(placementId, context);
      setActiveBanners(match);
    }
  }, [loading, banners, placementId, context]);

  useEffect(() => {
    // Log impression once when banners are rendered
    if (activeBanners.length > 0 && !hasLoggedImpressions) {
      activeBanners.forEach(b => {
        if (b.id) trackImpression(b.id);
      });
      setHasLoggedImpressions(true);
    }
  }, [activeBanners, hasLoggedImpressions]);

  if (loading || activeBanners.length === 0) return null;

  const getGridClass = (count: number) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-1 md:grid-cols-2";
    if (count === 3) return "grid-cols-1 md:grid-cols-3";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"; // 4 or more
  };

  const handleAdClick = (banner: AdCampaign) => {
    if (banner.id) trackClick(banner.id);
    if (banner.linkUrl) {
      window.open(banner.linkUrl, "_blank");
    }
  };

  return (
    <div className={`grid gap-4 w-full ${getGridClass(activeBanners.length)} my-6`}>
      {activeBanners.map(banner => (
        <div key={banner.id} className="w-full relative rounded-2xl overflow-hidden shadow-lg group border border-[#C5A059]/30 hover:border-[#C5A059] transition-all bg-[#0B2B26]">
          {banner.type === "image" ? (
            <div 
              className="relative w-full aspect-[4/1] md:aspect-[5/2] cursor-pointer"
              onClick={() => handleAdClick(banner)}
            >
              <Image 
                src={banner.content} 
                alt={banner.title} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute top-2 right-2 bg-black/60 text-white text-[8px] uppercase px-1.5 py-0.5 rounded backdrop-blur">Ad</div>
            </div>
          ) : (
            <div className="w-full p-4 flex items-center justify-center min-h-[120px] bg-white/5 relative">
              <div className="absolute top-2 right-2 bg-black/60 text-white text-[8px] uppercase px-1.5 py-0.5 rounded backdrop-blur z-10">Ad</div>
              <div dangerouslySetInnerHTML={{ __html: banner.content }} className="w-full text-center" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
