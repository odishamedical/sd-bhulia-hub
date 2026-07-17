"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export interface HeroBannerData {
  badge: string;
  title: string;
  subtitle: string;
  imgUrl: string;
  btnText: string;
  btnLink: string;
}

export default function HeroSliderWidget({ banners }: { banners: HeroBannerData[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  return (
    <section className="relative w-full h-[60vh] sm:h-[70vh] rounded-3xl overflow-hidden border border-[#C5A059]/40 shadow-2xl group">
      {banners.map((slide, idx) => (
        <div key={idx} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentSlide === idx ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
          <Image src={slide.imgUrl || "/hero_silk.jpg"} alt={slide.title} fill className="object-cover transform scale-105 transition-transform duration-[10000ms] ease-linear" style={{ transform: currentSlide === idx ? 'scale(1)' : 'scale(1.05)' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#051815] via-[#051815]/40 to-transparent opacity-90"></div>
        </div>
      ))}
      
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-16 text-center px-4">
        <span className="text-[#C5A059] text-xs sm:text-sm font-bold uppercase tracking-[0.3em] mb-4 drop-shadow-md">
          {banners[currentSlide]?.badge}
        </span>
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white mb-2 drop-shadow-xl tracking-tight">
          {banners[currentSlide]?.title}
        </h2>
        <p className="text-lg sm:text-2xl text-gray-300 font-serif italic mb-8 drop-shadow-md">
          {banners[currentSlide]?.subtitle}
        </p>
        <Link href={banners[currentSlide]?.btnLink || "/"} className="px-10 py-4 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] font-black text-sm uppercase tracking-widest rounded-none hover:brightness-110 transition-all shadow-xl cursor-pointer inline-block">
          {banners[currentSlide]?.btnText}
        </Link>
      </div>
    </section>
  );
}
