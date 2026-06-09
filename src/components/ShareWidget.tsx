"use client";

import React, { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { useResellers } from "@/lib/db-hooks";

interface ShareWidgetProps {
  title?: string;
  shareUrl?: string;
  className?: string;
  shareTextOverride?: string;
  layout?: "horizontal" | "vertical";
}

export default function ShareWidget({ title = "Bhulia Hub", shareUrl, className = "", shareTextOverride, layout = "horizontal" }: ShareWidgetProps) {
  const [copied, setCopied] = useState(false);
  const [finalUrl, setFinalUrl] = useState("");
  const { resellers } = useResellers();

  useEffect(() => {
    let base = shareUrl || (typeof window !== "undefined" ? window.location.href : "");
    if (base.includes("?ref=")) {
      base = base.split("?ref=")[0];
    } else if (base.includes("&ref=")) {
      base = base.split("&ref=")[0];
    }

    const user = auth?.currentUser;
    if (user) {
      const reseller = resellers.find(r => r.id === user.uid);
      let refId = "";
      if (reseller && reseller.referralId) {
        refId = reseller.referralId;
      } else {
        refId = `SDA-${user.uid.substring(0, 6).toUpperCase()}`;
      }
      
      const separator = base.includes("?") ? "&" : "?";
      setFinalUrl(`${base}${separator}ref=${refId}`);
    } else {
      setFinalUrl(base);
    }
  }, [shareUrl, resellers]);

  const message = `Check out ${title} on Bhulia Hub! ${finalUrl}`;

  const handleShare = (platform: "whatsapp" | "facebook" | "copy") => {
    if (platform === "copy") {
      navigator.clipboard.writeText(finalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    
    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(finalUrl)}`, "_blank");
    }
  };

  return (
    <div className={`bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 shadow-xl text-white ${className}`}>
      <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block mb-4">Share & Track</span>
      
      <div className={`grid ${layout === "vertical" ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3"} gap-3`}>
        <button 
          onClick={() => handleShare("whatsapp")} 
          className="flex items-center justify-center gap-2 py-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
        >
          <span>💬 WhatsApp</span>
        </button>
        
        <button 
          onClick={() => handleShare("facebook")} 
          className="flex items-center justify-center gap-2 py-3 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
        >
          <span>📘 Facebook</span>
        </button>

        <button 
          onClick={() => handleShare("copy")} 
          className="flex items-center justify-center gap-2 py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-600 text-gray-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
        >
          <span className={copied ? "text-green-400" : ""}>{copied ? "✅ Copied!" : "📋 Copy Link"}</span>
        </button>
      </div>

      <p className="text-[10px] text-gray-400 leading-normal mt-4 text-center">
        {auth?.currentUser 
          ? (shareTextOverride || "Promote original Sambalpuri Saree. OUR SAMBALPURI - OUR PRIDE. Share the link to your network and promote our weavers!")
          : "Sign in to automatically attach your tracking ID to shared links!"}
      </p>
    </div>
  );
}
