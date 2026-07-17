import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function ArtisanCirclesWidget({ data }: { data: any }) {
  const circles = data.circles || [
    { title: "Pure Silk Pata", img: "/bhulia-hero.png", link: "/search?category=Pure Silk Pata" },
    { title: "Cotton Daily", img: "/bhulia-hero.png", link: "/search?category=Cotton Classics" },
    { title: "Bomkai", img: "/bhulia-hero.png", link: "/search?design=Bomkai" },
    { title: "Pasapalli", img: "/bhulia-hero.png", link: "/search?category=Pasapalli" },
    { title: "Master Weavers", img: "/bhulia-hero.png", link: "#ecosystem" },
    { title: "Bridal Collection", img: "/bhulia-hero.png", link: "/search?category=Bridal" },
    { title: "Corporate Gifts", img: "/bhulia-hero.png", link: "/search?category=Gifts" },
  ];

  return (
    <section className="w-full">
      <div className="flex overflow-x-auto gap-6 sm:gap-12 pb-4 scrollbar-hide snap-x justify-start sm:justify-center px-4">
        {circles.map((circle: any, idx: number) => (
          <Link key={idx} href={circle.link || "/search"} className="flex flex-col items-center gap-3 shrink-0 snap-center group cursor-pointer">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-[#C5A059]/40 group-hover:border-[#C5A059] group-hover:scale-105 transition-all shadow-lg p-1">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image src={circle.img || "/bhulia-hero.png"} alt={circle.title || "Category"} fill className="object-cover" />
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
