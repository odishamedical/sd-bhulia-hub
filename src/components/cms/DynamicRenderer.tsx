import React from "react";
import Image from "next/image";
import { CMSRow } from "@/types/cms";

// Placeholder components for the blocks - we will build these out fully later
const HeroBlock = () => (
  <div className="bg-[#051815] border border-[#C5A059] rounded-3xl p-8 flex items-center justify-center h-[300px]">
    <h2 className="text-[#C5A059] text-2xl font-bold">Dynamic Hero Block</h2>
  </div>
);

const ProductsBlock = ({ title, category, themeStyle }: any) => (
  <div className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-3xl p-8 shadow-xl">
    <h3 className="text-xl font-bold text-[#C5A059] mb-4">{title || "Featured Products"}</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Placeholders for dynamic products */}
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-[#0A2520] h-48 rounded-xl border border-[#C5A059]/20 flex items-center justify-center">
          <span className="text-gray-500 text-xs">Product from {category || "all"}</span>
        </div>
      ))}
    </div>
  </div>
);

const BannerBlock = ({ bannerText, bannerImage }: any) => (
  <div className="relative rounded-3xl overflow-hidden shadow-lg group">
    {bannerImage ? (
      <div className="w-full aspect-[5/2] relative">
        <Image src={bannerImage} alt={bannerText || "Promotional Banner"} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-black/40"></div>
        {bannerText && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
            <h2 className="text-white text-xl sm:text-3xl font-black uppercase tracking-widest drop-shadow-lg">{bannerText}</h2>
          </div>
        )}
      </div>
    ) : (
      <div className="bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] p-6 text-center">
        <h2 className="text-[#0A1021] text-2xl font-black uppercase tracking-widest">{bannerText || "PROMOTIONAL BANNER"}</h2>
      </div>
    )}
  </div>
);

const AdSenseBlock = ({ htmlCode }: any) => (
  <div className="w-full my-4 flex justify-center bg-black/20 p-4 rounded-xl border border-dashed border-gray-600">
    {htmlCode ? (
      <div dangerouslySetInnerHTML={{ __html: htmlCode }} />
    ) : (
      <span className="text-gray-500 text-xs">AdSense / Custom HTML Block</span>
    )}
  </div>
);

export default function DynamicRenderer({ rows }: { rows: CMSRow[] }) {
  if (!rows || rows.length === 0) {
    return <div className="text-center p-8 text-gray-400 border border-dashed border-gray-600 rounded-xl">No CMS rows configured.</div>;
  }

  return (
    <div className="space-y-6 md:space-y-12">
      {rows.map((row) => {
        switch (row.type) {
          case "hero":
            return <HeroBlock key={row.id} />;
          case "products":
            return <ProductsBlock key={row.id} title={row.title} category={row.category} themeStyle={row.themeStyle} />;
          case "banner":
            return <BannerBlock key={row.id} bannerText={row.bannerText} bannerImage={row.bannerImage} />;
          case "adsense":
            return <AdSenseBlock key={row.id} htmlCode={row.htmlCode} />;
          default:
            return (
              <div key={row.id} className="p-4 border border-red-500/50 bg-red-500/10 rounded-xl text-red-400 text-xs">
                Unknown block type: {row.type}
              </div>
            );
        }
      })}
    </div>
  );
}
