"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import GlobalBannerSlot from "@/components/GlobalBannerSlot";

import HeroSliderWidget from "@/components/widgets/HeroSliderWidget";
import ProductCarouselWidget from "@/components/widgets/ProductCarouselWidget";
import DirectoryGridWidget from "@/components/widgets/DirectoryGridWidget";
import FeaturedProductWidget from "@/components/widgets/FeaturedProductWidget";
import CategoryGridWidget from "@/components/widgets/CategoryGridWidget";
import RichTextWidget from "@/components/widgets/RichTextWidget";

export default function HomeDraftV2() {
  const [widgets, setWidgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const userRole = typeof window !== "undefined" ? localStorage.getItem("sd_current_user_role") || "user" : "user";

  useEffect(() => {
    async function loadLayout() {
      try {
        const docSnap = await getDoc(doc(db, "page_layouts", "home_page"));
        if (docSnap.exists()) {
          setWidgets(docSnap.data().widgets || []);
        } else {
          // Fallback if no layout is saved yet
          setWidgets([
            {
              type: "HeroSlider",
              data: {
                banners: [
                  { badge: "Bhulia.com Verified Heritage", title: "The Silk Masterpieces", subtitle: "Authentic Double Ikat Pata", imgUrl: "/hero_silk.jpg", btnText: "Discover the Collection", btnLink: "/search?category=Pure Silk Pata" },
                  { badge: "Empowering Artisans directly", title: "Everyday Luxury", subtitle: "Direct from Pit Looms", imgUrl: "/hero_loom.jpg", btnText: "Explore Cotton", btnLink: "/search?category=Cotton" }
                ]
              }
            },
            { type: "ArtisanCircles" },
            { type: "BannerSlot", data: { id: "homepage_middle" } },
            {
              type: "ProductCarousel",
              data: { title: "The Vault", filterType: "trending", itemLimit: 6 }
            },
            { type: "HeritageStory" },
            {
              type: "DirectoryGrid",
              data: { title: "Ecosystem Directory", subtitle: "Discover our network of verified partners", role: "weaver", itemLimit: 8 }
            },
            { type: "BannerSlot", data: { id: "content_bottom" } }
          ]);
        }
      } catch (e) {
        console.error("Error loading layout:", e);
      } finally {
        setLoading(false);
      }
    }
    loadLayout();
  }, []);

  const storyCircles = [
    { title: "Pure Silk Pata", img: "/bhulia-hero.png", link: "/search?category=Pure Silk Pata" },
    { title: "Cotton Daily", img: "/bhulia-hero.png", link: "/search?category=Cotton Classics" },
    { title: "Bomkai", img: "/bhulia-hero.png", link: "/search?design=Bomkai" },
    { title: "Pasapalli", img: "/bhulia-hero.png", link: "/search?category=Pasapalli" },
    { title: "Master Weavers", img: "/bhulia-hero.png", link: "#ecosystem" },
    { title: "Bridal Collection", img: "/bhulia-hero.png", link: "/search?category=Bridal" },
    { title: "Corporate Gifts", img: "/bhulia-hero.png", link: "/search?category=Gifts" },
  ];

  if (loading) {
     return (
       <div className="min-h-screen bg-[#051815] flex items-center justify-center">
         <div className="w-16 h-16 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
       </div>
     );
  }

  return (
    <main className="relative flex-1 w-full bg-[#051815] text-white font-sans flex flex-col min-h-screen">
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C5A059 1px, transparent 0)', backgroundSize: '48px 48px' }} />
      
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 relative z-10 space-y-16 overflow-hidden max-w-[1600px] mx-auto">
        
        {widgets.map((widget, idx) => {
          
          if (widget.type === "HeroSlider") {
            return <HeroSliderWidget key={`widget-${idx}`} banners={widget.data?.banners} />;
          }
          
          if (widget.type === "ProductCarousel") {
            return <ProductCarouselWidget key={`widget-${idx}`} data={widget.data} userRole={userRole} />;
          }
          
          if (widget.type === "DirectoryGrid") {
            return <DirectoryGridWidget key={`widget-${idx}`} data={widget.data} />;
          }

          if (widget.type === "FeaturedProduct") {
            return <FeaturedProductWidget key={`widget-${idx}`} data={widget.data} userRole={userRole} />;
          }

          if (widget.type === "CategoryGrid") {
            return <CategoryGridWidget key={`widget-${idx}`} data={widget.data} />;
          }

          if (widget.type === "RichText") {
            return <RichTextWidget key={`widget-${idx}`} data={widget.data} />;
          }

          if (widget.type === "BannerSlot") {
            return <GlobalBannerSlot key={`widget-${idx}`} placementId={widget.data.id} context={{ audience: "global", specificId: "all" }} />;
          }

          if (widget.type === "ArtisanCircles") {
            return (
              <section key={`widget-${idx}`} className="w-full">
                <div className="flex overflow-x-auto gap-6 sm:gap-12 pb-4 scrollbar-hide snap-x justify-start sm:justify-center px-4">
                  {storyCircles.map((circle, i) => (
                    <Link key={i} href={circle.link} className="flex flex-col items-center gap-3 shrink-0 snap-center group cursor-pointer">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-[#C5A059]/40 group-hover:border-[#C5A059] group-hover:scale-105 transition-all shadow-lg p-1">
                        <div className="relative w-full h-full rounded-full overflow-hidden">
                          <Image src={circle.img} alt={circle.title} fill className="object-cover" />
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-300 group-hover:text-[#C5A059] transition-colors whitespace-nowrap">
                        {circle.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          }

          if (widget.type === "HeritageStory") {
            return (
              <section key={`widget-${idx}`} className="relative w-full rounded-3xl overflow-hidden border border-[#C5A059]/40 shadow-2xl flex flex-col md:flex-row items-stretch bg-[#0A2520]">
                <div className="w-full md:w-1/2 relative h-[300px] md:h-auto">
                  <Image src="/bhulia-hero.png" alt="Heritage" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/30"></div>
                </div>
                <div className="w-full md:w-1/2 p-8 sm:p-16 flex flex-col justify-center text-center md:text-left">
                  <span className="text-[#C5A059] text-xs font-bold uppercase tracking-[0.2em] mb-4">Our Promise</span>
                  <h3 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">Discover 100% Authentic Sambalpuri Handloom Sarees at Bhulia.com</h3>
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8">
                    Each piece carries the Bhulia Verified Seal, connecting you directly to real weavers. By choosing us, you help preserve Odisha's 800-year heritage while supporting artisans at fair prices.
                  </p>
                  <div>
                    <Link href="/directory" className="inline-block px-8 py-3 bg-[#051815] border border-[#C5A059] text-[#C5A059] font-bold text-xs uppercase tracking-widest hover:bg-[#C5A059] hover:text-[#0A1021] transition-all">
                      Learn About Our Process
                    </Link>
                  </div>
                </div>
              </section>
            );
          }

          return null;
        })}

      </div>
    </main>
  );
}
