import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CMSRow } from "@/types/cms";
import ShareWidget from "@/components/ShareWidget";
import DirectoryGridRow from "@/components/cms/DirectoryGridRow";
import DistrictLinksRow from "@/components/cms/DistrictLinksRow";

// Fully implemented HeroBlock
const HeroBlock = ({ row }: { row: CMSRow }) => {
  const hasImages = row.heroImages && row.heroImages.length > 0;
  
  return (
    <div className={`relative w-full overflow-hidden rounded-3xl ${row.aspectRatio === 'widescreen' ? 'aspect-[21/9]' : 'min-h-[400px] md:min-h-[500px]'} flex items-center justify-center group`}>
      {/* Background Image/Color */}
      <div className="absolute inset-0 z-0">
        {hasImages ? (
          <Image 
            src={row.heroImages![0]} 
            alt={row.heroHeadline || "Hero Image"} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-1000" 
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#051815] via-[#0B2B26] to-[#051815]"></div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-[#051815]/90 via-black/40 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6">
        {!row.hideTitle && row.title && (
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#C5A059]/40 bg-[#C5A059]/10 backdrop-blur-sm mb-4">
            <span className="text-[#C5A059] text-xs font-bold uppercase tracking-[0.2em]">{row.title}</span>
          </div>
        )}
        
        {row.heroHeadline && (
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#C5A059] to-[#D4AF37] drop-shadow-xl leading-tight">
            {row.heroHeadline}
          </h2>
        )}
        
        {row.heroSubheadline && (
          <p className="text-gray-300 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            {row.heroSubheadline}
          </p>
        )}
        
        {row.heroButtonText && row.heroButtonLink && (
          <div className="pt-6">
            <Link 
              href={row.heroButtonLink} 
              className="inline-block bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#051815] px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:scale-105 hover:shadow-[0_0_30px_rgba(197,160,89,0.4)] transition-all duration-300"
            >
              {row.heroButtonText}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Countdown Timer Component
const CountdownTimer = ({ endTime }: { endTime: string }) => {
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(() => {
    const timer = setInterval(() => {
      const difference = new Date(endTime).getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="flex items-center gap-4 bg-[#051815] p-4 rounded-xl border border-[#C5A059]/40 mb-6 inline-flex">
      <div className="text-[#C5A059] font-bold uppercase tracking-widest text-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        Flash Sale Ends In
      </div>
      <div className="flex gap-2 text-white font-mono text-lg">
        <div className="flex flex-col items-center"><span className="bg-[#0B2B26] px-2 py-1 rounded">{String(timeLeft.days).padStart(2, '0')}</span><span className="text-[10px] text-[#C5A059]">DAYS</span></div>
        <span className="py-1">:</span>
        <div className="flex flex-col items-center"><span className="bg-[#0B2B26] px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}</span><span className="text-[10px] text-[#C5A059]">HRS</span></div>
        <span className="py-1">:</span>
        <div className="flex flex-col items-center"><span className="bg-[#0B2B26] px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span><span className="text-[10px] text-[#C5A059]">MIN</span></div>
        <span className="py-1">:</span>
        <div className="flex flex-col items-center"><span className="bg-[#0B2B26] px-2 py-1 rounded">{String(timeLeft.seconds).padStart(2, '0')}</span><span className="text-[10px] text-[#C5A059]">SEC</span></div>
      </div>
    </div>
  );
};

const ProductsBlock = ({ title, category, flashSaleEndTime, themeStyle }: any) => (
  <div className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-3xl p-8 shadow-xl">
    {title && <h3 className="text-xl font-bold text-[#C5A059] mb-4">{title}</h3>}
    {flashSaleEndTime && <CountdownTimer endTime={flashSaleEndTime} />}
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

const TestimonialsBlock = ({ testimonials, title }: any) => (
  <div className="bg-[#051815] py-12">
    {title && <h3 className="text-2xl font-serif text-[#C5A059] text-center mb-8">{title}</h3>}
    <div className="flex overflow-x-auto gap-6 pb-8 snap-x px-4 no-scrollbar">
      {(testimonials || []).map((t: any, i: number) => (
        <div key={i} className="snap-center shrink-0 w-[300px] md:w-[400px] bg-[#0B2B26] border border-[#C5A059]/20 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex text-[#C5A059] mb-4">
              {Array(t.rating || 5).fill("★").map((star, idx) => <span key={idx}>{star}</span>)}
            </div>
            <p className="text-gray-300 italic mb-6 leading-relaxed">"{t.text}"</p>
          </div>
          <div className="flex items-center gap-3 border-t border-[#C5A059]/10 pt-4 mt-auto">
            <div className="w-10 h-10 rounded-full bg-[#051815] border border-[#C5A059]/50 flex items-center justify-center text-[#C5A059] font-bold">
              {t.authorName.charAt(0)}
            </div>
            <div className="font-bold text-white text-sm">{t.authorName}</div>
          </div>
        </div>
      ))}
    </div>
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
            return <HeroBlock key={row.id} row={row} />;
          case "products":
            return <ProductsBlock key={row.id} title={!row.hideTitle ? row.title : undefined} category={row.category} flashSaleEndTime={row.flashSaleEndTime} themeStyle={row.themeStyle} />;
          case "banner":
            return <BannerBlock key={row.id} bannerText={row.bannerText} bannerImage={row.bannerImage} />;
          case "adsense":
            return <AdSenseBlock key={row.id} htmlCode={row.htmlCode} />;
          case "testimonials":
            return <TestimonialsBlock key={row.id} title={!row.hideTitle ? row.title : undefined} testimonials={row.testimonials} />;
          case "directory_listings":
            return <DirectoryGridRow key={row.id} />;
          case "district_links":
            return <DistrictLinksRow key={row.id} />;
          case "share_widget":
            return (
              <div key={row.id} className="max-w-4xl mx-auto w-full my-8 px-4">
                <ShareWidget 
                  layout={row.shareLayout as any} 
                  shareTextOverride={row.shareText} 
                  title={row.title}
                />
              </div>
            );
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
