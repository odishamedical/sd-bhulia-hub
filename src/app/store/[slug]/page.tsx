"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MASTER_STORES, DEFAULT_STORE, STORE_CATALOG_SAREES } from "../data";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export default function StoreDetailPage() {
  const params = useParams();
  const rawSlug = typeof params?.slug === "string" ? params.slug : "maa-samaleswari-weavers";
  const storeSlug = rawSlug.toLowerCase();

  const store = MASTER_STORES.find((s) => s.slug === storeSlug || s.id.toLowerCase() === storeSlug) || {
    ...DEFAULT_STORE,
    id: storeSlug.toUpperCase(),
    slug: storeSlug,
    name: `Store/PWCS (${storeSlug.replace(/-/g, " ")})`,
  };

  const [userUid, setUserUid] = useState<string>("sd_super_admin_custom_uid");
  const [liveStoreData, setLiveStoreData] = useState<any>(null);

  useEffect(() => {
    const uid = localStorage.getItem("sd_current_user_uid") || "sd_super_admin_custom_uid";
    setUserUid(uid);

    const fetchLiveStore = async () => {
      try {
        // Try by ID first
        let docSnap = await getDoc(doc(db, "franchises", store.id));
        if (docSnap.exists()) {
          setLiveStoreData(docSnap.data());
          return;
        }
        // Try by slug
        const q = query(collection(db, "franchises"), where("slug", "==", store.slug));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          setLiveStoreData(querySnap.docs[0].data());
        }
      } catch(err) {
        console.error(err);
      }
    };
    fetchLiveStore();
  }, [store.id, store.slug]);

  const handleSocialShare = (platform: "whatsapp" | "facebook") => {
    const shareUrl = `${window.location.origin}/store/${store.slug}?ref=${userUid}`;
    const message = `Explore the cooperative handloom collection from ${store.name}. Buy direct from verified weavers collectives. ${shareUrl}`;

    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
    }
  };

  // Only show the first 3 products as a spotlight preview
  const spotlightSarees = STORE_CATALOG_SAREES.slice(0, 3);

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8 relative z-10">
      
      {/* Dynamic Alert Banner */}
      <div className="bg-[#0A3A35] border border-[#C5A059]/40 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          <p className="text-xs text-gray-200">
            Every product purchased from <strong>{store.name}</strong> is physically routed to the Bhulia Hub for authenticity validation before shipment.
          </p>
        </div>
        <Link 
          href={`/store/${store.slug}/contact`}
          className="text-xs text-[#C5A059] font-bold uppercase tracking-wider hover:underline shrink-0"
        >
          Verify Certificates →
        </Link>
      </div>

      {/* Info Panel & Intro */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Block: Image & Cooperative details */}
        <div className="lg:col-span-4 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-6">
            <div className="relative w-full h-80 rounded-2xl overflow-hidden border-2 border-[#C5A059]/50 shadow-lg bg-[#051815]">
              <Image src={store.img} alt={store.name} fill className="object-cover" />
              <div className="absolute bottom-4 left-4 bg-[#0B2B26]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#C5A059]/40 text-xs font-mono text-[#C5A059] font-bold">
                {store.giTagNumber}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block mb-1">Cooperative Hub</span>
              <p className="text-sm font-semibold text-white font-serif">{store.village}, {store.cluster}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-[#C5A059]/20 pt-4">
              <div className="bg-[#0A3A35] rounded-xl p-3 border border-[#C5A059]/20">
                <span className="text-[9px] uppercase tracking-widest text-gray-300 block mb-1">Active Weavers</span>
                <p className="text-xl font-black text-[#C5A059]">{store.activeWeaversCount}</p>
              </div>
              <div className="bg-[#0A3A35] rounded-xl p-3 border border-[#C5A059]/20">
                <span className="text-[9px] uppercase tracking-widest text-gray-300 block mb-1">Monthly Capacity</span>
                <p className="text-xs font-black text-[#C5A059] uppercase mt-1">{store.warehouseCapacity}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-[#C5A059]/20 pt-4 space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-gray-300 font-bold block">Share Cooperative Profile</span>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handleSocialShare("whatsapp")} className="flex items-center justify-center gap-1 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-xl font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer">
                <span>📲 Share WA</span>
              </button>
              <button onClick={() => handleSocialShare("facebook")} className="flex items-center justify-center gap-1 py-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] rounded-xl font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer">
                <span>📘 Share FB</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Block: Store Description & Member Roster */}
        <div className="lg:col-span-8 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold uppercase tracking-widest mb-3">
                <span>Verified PWCS Store</span>
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#C5A059] leading-tight">{store.name}</h2>
            </div>

            <div className="space-y-4 leading-relaxed text-sm font-sans text-gray-200">
              <p className="border-l-2 border-[#C5A059] pl-3 py-1 text-gray-300">
                {store.description}
              </p>
            </div>

            {/* Roster Preview */}
            <div className="border-t border-[#C5A059]/20 pt-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs uppercase tracking-widest text-[#C5A059] font-bold">Weaver Guild Member Roster</h3>
                <Link 
                  href={`/store/${store.slug}/legacy`}
                  className="text-[10px] text-[#C5A059] font-bold hover:underline uppercase tracking-wider"
                >
                  View All Awards →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {store.memberRoster.map((member, idx) => (
                  <div key={idx} className="bg-[#0A3A35] border border-[#C5A059]/30 rounded-xl p-3 text-center">
                    <span className="text-xs font-semibold text-white block">{member}</span>
                    <span className="text-[9px] text-[#C5A059] uppercase tracking-widest block mt-0.5">Master Weaver</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-[#C5A059]/20 pt-6 mt-6">
            <h3 className="text-xs uppercase tracking-widest text-[#C5A059] font-bold mb-3">Specialty Blueprints</h3>
            <div className="flex flex-wrap gap-2">
              {store.specialtyTags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-[#0A3A35] border border-[#C5A059]/30 text-white rounded-lg text-xs font-semibold">{tag}</span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Workspace Identity Images */}
      {liveStoreData?.workspaceImages && liveStoreData.workspaceImages.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-[#C5A059]/20">
          <div>
            <h3 className="text-xl md:text-3xl font-serif text-[#C5A059] font-bold tracking-wider">Workspace Identity</h3>
            <p className="text-[10px] md:text-xs text-gray-300 uppercase tracking-widest font-semibold">Behind the scenes at {store.name}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {liveStoreData.workspaceImages.map((img: any, idx: number) => (
              <div key={idx} className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl overflow-hidden shadow-lg p-2">
                <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-[#C5A059]/20 bg-[#051815]">
                  <Image src={img.url} alt="Workspace" fill className="object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                {img.description && (
                  <p className="text-center text-xs text-gray-300 font-bold uppercase tracking-widest mt-3 mb-1">
                    {img.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saree Catalog Spotlight Grid */}
      <div className="space-y-6 pt-6 border-t border-[#C5A059]/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl md:text-3xl font-serif text-[#C5A059] font-bold tracking-wider">Product Spotlight</h3>
            <p className="text-[10px] md:text-xs text-gray-300 uppercase tracking-widest font-semibold">Featured handloom items from this weaver society</p>
          </div>
          <Link 
            href={`/store/${store.slug}/catalog`}
            className="bhulia-gold-button px-6 py-2 text-[#0A1021] font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition-all text-center block shrink-0"
          >
            Browse Full Catalog ({STORE_CATALOG_SAREES.length} Sarees)
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {spotlightSarees.map((saree) => (
            <div key={saree.id} className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#C5A059] transition-all duration-300 shadow-xl p-0.5 text-white">
              <div className="relative w-full h-56 sm:h-72 overflow-hidden bg-[#0B2B26] rounded-t-xl">
                <Image src={saree.img} alt={saree.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-[#C5A059] text-[#0A1021] text-[9px] font-bold uppercase tracking-widest rounded shadow">{saree.weave}</span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-[#C5A059] transition-colors mb-1 line-clamp-1">{saree.title}</h4>
                  <p className="text-[10px] text-gray-300 leading-relaxed font-sans line-clamp-2">{saree.desc}</p>
                </div>

                <div className="flex justify-between items-center border-t border-[#C5A059]/20 pt-2.5">
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest block">Direct Price</span>
                    <span className="text-base font-serif font-bold text-[#C5A059]">{saree.price}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest block">Sourcing Location</span>
                    <span className="text-[10px] font-mono text-gray-200 font-bold">{saree.time}</span>
                  </div>
                </div>

                {/* Share buttons on cards */}
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#C5A059]/10">
                  <button onClick={() => {
                    const shareUrl = `${window.location.origin}/product/${encodeURIComponent(saree.title.toLowerCase().replace(/\s+/g, "-"))}?ref=${userUid}`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent("Check out this " + saree.title + ": " + shareUrl)}`, "_blank");
                  }} className="flex items-center justify-center gap-1 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                    <span>📲 Share</span>
                  </button>
                  <button onClick={() => {
                    const shareUrl = `${window.location.origin}/product/${encodeURIComponent(saree.title.toLowerCase().replace(/\s+/g, "-"))}?ref=${userUid}`;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
                  }} className="flex items-center justify-center gap-1 py-1.5 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                    <span>📘 Share</span>
                  </button>
                </div>

                <Link href={`/product/${encodeURIComponent(saree.title.toLowerCase().replace(/\s+/g, "-"))}`} className="bhulia-gold-button w-full py-2 text-[#0A1021] font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition-all text-center block">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
