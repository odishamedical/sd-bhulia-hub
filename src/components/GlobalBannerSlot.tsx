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
    category?: string;
    material?: string;
    design?: string;
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

  const handleAdClick = (banner: AdCampaign) => {
    if (banner.id) trackClick(banner.id);
    if (banner.linkUrl) {
      window.open(banner.linkUrl, "_blank");
    }
  };

  // Always use a 12-column grid to allow precise layout mapping
  return (
    <div className={`grid grid-cols-12 gap-4 w-full my-6`}>
      {activeBanners.map(banner => {
        
        let colClass = "col-span-12"; // full width
        if (banner.layoutSize === "half") colClass = "col-span-12 md:col-span-6";
        else if (banner.layoutSize === "third") colClass = "col-span-12 md:col-span-4";
        else if (banner.layoutSize === "quarter") colClass = "col-span-12 md:col-span-6 lg:col-span-3";

        return (
        <div key={banner.id} className={`${colClass} relative rounded-2xl overflow-hidden shadow-lg group border border-[#C5A059]/30 hover:border-[#C5A059] transition-all bg-[#0B2B26]`}>
          {banner.type === "image" ? (
            <div 
              className="relative w-full cursor-pointer flex items-center justify-center"
              onClick={() => handleAdClick(banner)}
            >
              <img 
                src={banner.content} 
                alt={banner.title} 
                className="w-full h-auto object-contain group-hover:opacity-90 transition-opacity duration-500" 
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
        );
      })}
    </div>
  );
}
