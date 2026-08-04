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
import ArtisanCirclesWidget from "@/components/widgets/ArtisanCirclesWidget";
import HeritageStoryWidget from "@/components/widgets/HeritageStoryWidget";

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
        <h1 className="sr-only">Original Sambalpuri Saree & Sambalpuri Handloom from Odisha - Buy Sambalpuri Silk Saree, Sambalpuri Cotton, Sambalpuri Ikat, Bandha, and Sambalpuri Pata Saree</h1>
        
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
            return <ArtisanCirclesWidget key={`widget-${idx}`} data={widget.data || {}} />;
          }

          if (widget.type === "HeritageStory") {
            return <HeritageStoryWidget key={`widget-${idx}`} data={widget.data || {}} />;
          }

          return null;
        })}
        
        {/* Sambalpuri Handloom Guide Section */}
        <section className="relative z-10 py-16 bg-[#051815] border-t border-[#C5A059]/20 mt-16">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 pb-4 border-b border-[#C5A059]/20">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif text-[#C5A059] mb-2 tracking-widest uppercase">
                Handloom Heritage Guide
              </h2>
              <p className="text-[#9CA3AF] font-light text-sm">Empowering you with knowledge before you buy.</p>
            </div>
            <Link href="/guide" className="text-[#C5A059] text-sm hover:text-white transition-colors flex items-center gap-1 mt-4 md:mt-0 font-light uppercase tracking-widest font-bold">
              View Full Guide <span className="text-lg leading-none ml-1">→</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { slug: "history-of-sambalpuri", title: "History & Heritage", desc: "Discover the 800-year-old legacy of Western Odisha's weaving tradition." },
              { slug: "the-baandha-technique", title: "The Baandha Technique", desc: "Step-by-step into the magical tie-and-dye process." },
              { slug: "identifying-authentic", title: "Identifying Authentic Handloom", desc: "How to distinguish a genuine masterpiece from fakes." },
              { slug: "care-and-maintenance", title: "Care & Maintenance", desc: "Preserve the beauty of your cotton and silk sarees." }
            ].map((topic, i) => (
              <Link href={`/guide/${topic.slug}`} key={i} className="group bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-[#C5A059]/50 transition-all flex flex-col justify-between h-full shadow-lg">
                <div>
                  <h3 className="text-lg font-serif text-white mb-2 group-hover:text-[#C5A059] transition-colors">{topic.title}</h3>
                  <p className="text-sm text-slate-400 font-light leading-relaxed">{topic.desc}</p>
                </div>
                <div className="mt-6 text-[#C5A059] text-xs font-bold uppercase tracking-widest flex items-center">
                  Read Article <span className="ml-1 group-hover:translate-x-1 transition-transform leading-none text-base">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
