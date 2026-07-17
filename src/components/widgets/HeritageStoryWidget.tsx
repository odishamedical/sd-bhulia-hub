import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function HeritageStoryWidget({ data }: { data: any }) {
  const badge = data.badge || "Our Promise";
  const title = data.title || "Discover 100% Authentic Sambalpuri Handloom Sarees at Bhulia.com";
  const content = data.content || "Each piece carries the Bhulia Verified Seal, connecting you directly to real weavers. By choosing us, you help preserve Odisha's 800-year heritage while supporting artisans at fair prices.";
  const btnText = data.btnText || "Learn About Our Process";
  const btnLink = data.btnLink || "/directory";
  const imgUrl = data.imgUrl || "/bhulia-hero.png";

  return (
    <section className="relative w-full rounded-3xl overflow-hidden border border-[#C5A059]/40 shadow-2xl flex flex-col md:flex-row items-stretch bg-[#0A2520]">
      <div className="w-full md:w-1/2 relative h-[300px] md:h-auto">
        <Image src={imgUrl} alt="Heritage" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      <div className="w-full md:w-1/2 p-8 sm:p-16 flex flex-col justify-center text-center md:text-left">
        <span className="text-[#C5A059] text-xs font-bold uppercase tracking-[0.2em] mb-4">{badge}</span>
        <h3 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">{title}</h3>
        <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8">
          {content}
        </p>
        <div>
          <Link href={btnLink} className="inline-block px-8 py-3 bg-[#051815] border border-[#C5A059] text-[#C5A059] font-bold text-xs uppercase tracking-widest hover:bg-[#C5A059] hover:text-[#0A1021] transition-all">
            {btnText}
          </Link>
        </div>
      </div>
    </section>
  );
}
