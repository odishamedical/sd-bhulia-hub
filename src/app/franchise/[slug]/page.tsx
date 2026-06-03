"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function ResellerStorefrontPage() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = typeof params?.slug === "string" ? params.slug : "";
  const franchiseSlug = rawSlug.toLowerCase();

  const [franchise, setFranchise] = useState<any>(null);
  const [loadingRealData, setLoadingRealData] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [userUid, setUserUid] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  // Default empty catalog, should ideally be fetched from a curated array in the future
  const FRANCHISE_CATALOG_SAREES = [
    { id: "SAR-101", title: "Handwoven Cotton Saree", price: "₹ 2,800", weave: "Cotton Ikat", time: "Ready to Ship", img: "https://images.unsplash.com/photo-1583391733958-d20f6fb6a10f?w=400&q=80" },
    { id: "SAR-102", title: "Premium Silk Pasapalli", price: "₹ 18,500", weave: "Double Ikat Silk", time: "Ready to Ship", img: "https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?w=400&q=80" }
  ];

  useEffect(() => {
    const checkAuth = () => {
      const uid = localStorage.getItem("sd_current_user_uid");
      setUserUid(uid);
    };
    checkAuth();
    window.addEventListener("sd_auth_change", checkAuth);

    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const ref = p.get("ref");
      if (ref) {
        localStorage.setItem("sd_referral_id", ref);
      }
    }

    return () => window.removeEventListener("sd_auth_change", checkAuth);
  }, []);

  useEffect(() => {
    const fetchLiveFranchise = async () => {
      try {
        const { db } = await import("@/lib/firebase");
        const { query, collection, where, getDocs } = await import("firebase/firestore");
        const q = query(collection(db, "franchises"), where("slug", "==", franchiseSlug));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
          const doc = snap.docs[0];
          const data = doc.data();
          data.id = doc.id;
          setFranchise(data);
        } else {
          setError("Storefront not found.");
        }
      } catch (err) {
        console.error("Failed to load live franchise data:", err);
        setError("Error loading storefront.");
      } finally {
        setLoadingRealData(false);
      }
    };

    if (franchiseSlug) {
      fetchLiveFranchise();
    } else {
      setLoadingRealData(false);
      setError("Invalid Storefront URL");
    }
  }, [franchiseSlug]);

  // Privacy Logic Validation
  useEffect(() => {
    if (!loadingRealData && franchise) {
      // Check if it's a free tier (Silver / free)
      if (franchise.tier === "Silver" || franchise.subscriptionTier === "free") {
        // Must be the owner to view it
        const currentUserUid = localStorage.getItem("sd_current_user_uid");
        if (currentUserUid !== franchise.userId) {
          // Redirect unauthorized visitors to the homepage
          router.replace("/");
        }
      }
    }
  }, [loadingRealData, franchise, router]);

  const handleSocialShare = (platform: "whatsapp" | "facebook") => {
    if (!franchise) return;
    const shareUrl = `${window.location.origin}/franchise/${franchise.slug}?ref=${userUid || franchise.userId}`;
    const message = `Check out my curated collection at ${franchise.name}: ${shareUrl}`;

    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
    }
  };

  if (loadingRealData) {
    return (
      <div className="min-h-screen bg-[#051815] flex items-center justify-center text-[#C5A059] font-serif animate-pulse">
        Loading Storefront...
      </div>
    );
  }

  if (error || !franchise) {
    return (
      <div className="min-h-screen bg-[#051815] flex flex-col items-center justify-center space-y-4">
        <h1 className="text-3xl text-[#C5A059] font-serif font-bold">404 - Store Not Found</h1>
        <p className="text-gray-300">The storefront you are looking for does not exist or is private.</p>
        <Link href="/" className="px-6 py-2 bg-[#C5A059] text-[#0A1021] font-bold rounded-xl text-xs uppercase tracking-wider">
          Return Home
        </Link>
      </div>
    );
  }

  // If we are still rendering and it's free and userUid doesn't match, we return null to avoid flash of content before router push completes.
  if ((franchise.tier === "Silver" || franchise.subscriptionTier === "free") && userUid !== franchise.userId) {
     return null;
  }

  return (
    <main className="relative flex-1 w-full bg-[#051815] text-white font-sans flex flex-col min-h-screen">
      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden sticky top-[57px] z-40 bg-[#0B2B26]/98 backdrop-blur-md border-b border-[#C5A059]/40 px-6 py-6 space-y-4 shadow-2xl">
          <div className="flex flex-col space-y-3 text-xs font-bold uppercase tracking-widest text-gray-200">
            <Link href="/" className="text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Home</Link>
          </div>
        </div>
      )}

      {/* Franchise main layout */}
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8 relative z-10">
        
        {/* Info panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Block: Profile Image and Counters */}
          <div className="lg:col-span-4 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 flex flex-col justify-between shadow-xl text-white">
            <div className="space-y-6">
              <div className="relative w-full h-80 rounded-2xl overflow-hidden border-2 border-[#C5A059]/50 shadow-lg bg-[#051815] flex items-center justify-center">
                {franchise.img ? (
                   <Image src={franchise.img} alt={franchise.name} fill className="object-cover" />
                ) : (
                   <div className="text-gray-500 font-mono text-xs">No Cover Image</div>
                )}
                <div className="absolute bottom-4 left-4 bg-[#0B2B26]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#C5A059]/40 text-xs font-mono text-[#C5A059] font-bold">
                  {franchise.city || "Unknown Location"}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block mb-1">Partner Location</span>
                <p className="text-sm font-semibold text-white font-serif">{franchise.city || "Digital First"}</p>
              </div>
            </div>

            <div className="mt-6 border-t border-[#C5A059]/20 pt-4 space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-gray-300 font-bold block">Share Store Collection</span>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleSocialShare("whatsapp")} className="flex items-center justify-center gap-1 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-xl font-bold text-[10px] uppercase tracking-wider cursor-pointer">
                  <span>📲 Share WA</span>
                </button>
                <button onClick={() => handleSocialShare("facebook")} className="flex items-center justify-center gap-1 py-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] rounded-xl font-bold text-[10px] uppercase tracking-wider cursor-pointer">
                  <span>📘 Share FB</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Block: Store Description */}
          <div className="lg:col-span-8 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 flex flex-col shadow-xl text-white">
            <div className="space-y-6 flex-1">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold uppercase tracking-widest mb-3">
                  <span>Verified Reseller Partner</span>
                </span>
                <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#C5A059] leading-tight">{franchise.name}</h2>
              </div>

              <div className="space-y-4 leading-relaxed text-sm font-sans text-gray-200">
                <p className="border-l-2 border-[#C5A059] pl-3 py-1 text-gray-300 text-lg italic">
                  {franchise.description || "Welcome to my curated collection of authentic Sambalpuri handlooms. Browse my top picks below!"}
                </p>
              </div>
            </div>

            {(franchise.tier === "Silver" || franchise.subscriptionTier === "free") && (
              <div className="mt-8 bg-[#051815] p-4 rounded-xl border border-[#C5A059]/20">
                <p className="text-[#C5A059] text-xs font-mono font-bold">🔒 Private Sandbox Mode</p>
                <p className="text-[10px] text-gray-400 mt-1">This storefront is currently only visible to you. Upgrade your plan to make this link public to buyers.</p>
              </div>
            )}
          </div>
        </div>

        {/* Localized Catalog */}
        <div id="inventory" className="space-y-4 pt-6 border-t border-[#C5A059]/20">
          <h3 className="text-xl md:text-3xl font-serif text-[#C5A059] font-bold tracking-wider">Curated Collection</h3>
          <p className="text-[10px] md:text-xs text-gray-300 uppercase tracking-widest font-semibold">Examine top selections exclusively offered by this partner</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-4">
            {FRANCHISE_CATALOG_SAREES.map((saree) => (
              <div key={saree.id} className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#C5A059] transition-all duration-300 shadow-xl p-0.5 text-white">
                <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-[#0B2B26] rounded-t-xl">
                  <Image src={saree.img} alt={saree.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-[#C5A059] text-[#0A1021] text-[9px] font-bold uppercase tracking-widest rounded shadow">{saree.weave}</span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-[#C5A059] transition-colors mb-1 line-clamp-1">{saree.title}</h4>
                  </div>

                  <div className="flex justify-between items-center border-t border-[#C5A059]/20 pt-2.5">
                    <div>
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest block">Price</span>
                      <span className="text-sm font-serif font-bold text-[#C5A059]">{saree.price}</span>
                    </div>
                  </div>

                  {/* Share buttons on cards */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#C5A059]/10">
                    <button onClick={() => {
                      const shareUrl = `${window.location.origin}/product/${encodeURIComponent(saree.title.toLowerCase().replace(/\s+/g, "-"))}?ref=${userUid || franchise.userId}`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent("Check out this " + saree.title + ": " + shareUrl)}`, "_blank");
                    }} className="flex items-center justify-center gap-1 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                      <span>📲 Share</span>
                    </button>
                    <button onClick={() => {
                      const shareUrl = `${window.location.origin}/product/${encodeURIComponent(saree.title.toLowerCase().replace(/\s+/g, "-"))}?ref=${userUid || franchise.userId}`;
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
                    }} className="flex items-center justify-center gap-1 py-1.5 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                      <span>📘 Share</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
