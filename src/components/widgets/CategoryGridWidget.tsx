import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function CategoryGridWidget({ data }: { data: any }) {
  const categories = data.categories || [
    { title: "Pure Silk Pata", imgUrl: "/bhulia-hero.png", link: "/search?category=Pure Silk Pata" },
    { title: "Cotton Daily", imgUrl: "/hero_loom.jpg", link: "/search?category=Cotton" },
    { title: "Bomkai", imgUrl: "/hero_silk.jpg", link: "/search?design=Bomkai" },
    { title: "Pasapalli", imgUrl: "/bhulia-hero.png", link: "/search?category=Pasapalli" }
  ];

  return (
    <section className="w-full space-y-8">
      {data.title && (
        <div className="flex flex-col items-center text-center">
          <h3 className="text-3xl sm:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C5A059] mb-2">
            {data.title}
          </h3>
          {data.subtitle && <p className="text-xs text-gray-400 uppercase tracking-widest">{data.subtitle}</p>}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {categories.map((cat: any, idx: number) => (
          <Link key={idx} href={cat.link || "/search"} className="group relative rounded-2xl overflow-hidden aspect-square border border-[#C5A059]/20 hover:border-[#C5A059] transition-all">
            <Image src={cat.imgUrl || "/bhulia-hero.png"} alt={cat.title || "Category"} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A2520]/90 via-[#0A2520]/20 to-transparent"></div>
            <div className="absolute bottom-6 left-0 right-0 text-center px-4">
              <h4 className="text-lg sm:text-xl font-serif font-bold text-white mb-2 drop-shadow-md">{cat.title}</h4>
              <span className="inline-block text-[#C5A059] text-[10px] font-bold uppercase tracking-widest border border-[#C5A059]/30 px-4 py-1.5 rounded-full group-hover:bg-[#C5A059] group-hover:text-[#051815] transition-all bg-[#051815]/50 backdrop-blur-sm">
                Shop Category →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
