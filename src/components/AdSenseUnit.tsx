"use client";

import React, { useEffect, useRef } from "react";

interface AdSenseUnitProps {
  adSlot?: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}

export default function AdSenseUnit({
  adSlot,
  format = "auto",
  responsive = true,
  className = "",
  style = {},
  label = "Advertisement",
}: AdSenseUnitProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const isPushed = useRef(false);

  useEffect(() => {
    // Prevent duplicate push calls during React re-renders or hydration
    if (isPushed.current) return;

    try {
      if (typeof window !== "undefined") {
        const adsbygoogle = ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
          (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []);
        adsbygoogle.push({});
        isPushed.current = true;
      }
    } catch (err) {
      console.error("AdSense push error:", err);
    }
  }, []);

  return (
    <div className={`w-full overflow-hidden flex flex-col justify-center items-center my-4 ${className}`}>
      {label && (
        <div className="w-full text-right mb-1 px-1">
          <span className="text-[9px] uppercase tracking-widest text-[#C5A059]/70 font-medium">
            {label}
          </span>
        </div>
      )}
      <div className="w-full min-h-[90px] flex items-center justify-center bg-[#0B2B26]/60 border border-[#C5A059]/30 rounded-2xl overflow-hidden p-2 shadow-lg backdrop-blur-sm">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block", minWidth: "250px", width: "100%", ...style }}
          data-ad-client="ca-pub-1792783864518197"
          {...(adSlot ? { "data-ad-slot": adSlot } : {})}
          data-ad-format={format}
          data-full-width-responsive={responsive ? "true" : "false"}
        />
      </div>
    </div>
  );
}
