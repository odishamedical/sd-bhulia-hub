import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";

interface ProductCardProps {
  product: any;
  role?: string | null;
}

export default function ProductCard({ product, role }: ProductCardProps) {
  const priceNum = typeof product.price === 'number' ? product.price : Number(String(product.price).replace(/[^0-9.]/g, '')) || 0;
  
  let finalPrice = priceNum;
  if (product.allowResellerMargin && product.resellerMarginPercentage) {
    finalPrice += finalPrice * (product.resellerMarginPercentage / 100);
  }

  // Handle special offers
  if (product.isSpecialOffer && product.specialOfferPrice) {
    const specialOfferPriceNum = typeof product.specialOfferPrice === 'number' 
      ? product.specialOfferPrice 
      : Number(String(product.specialOfferPrice).replace(/[^0-9.]/g, '')) || 0;
    
    if (specialOfferPriceNum > 0 && specialOfferPriceNum < finalPrice) {
      finalPrice = specialOfferPriceNum;
    }
  }

  const isB2BApproved = role === "reseller" || role === "wholesaler" || role === "shop" || role === "store" || role === "weaver" || role === "super_admin";
  const isRetail = product.availableForRetail !== false; // defaults to true
  const isWholesale = product.availableForWholesale === true;

  // Hide Wholesale-Only products from public users
  if (!isB2BApproved && !isRetail && isWholesale) {
    return null;
  }

  return (
    <div className="group relative flex flex-col w-full bg-[#051815] border border-[#C5A059]/20 rounded-2xl overflow-hidden shadow-md hover:shadow-[0_0_20px_rgba(197,160,89,0.3)] hover:-translate-y-1 transition-all duration-300 h-full">
      
      {/* Aspect Ratio 9:16 Image Container */}
      <div className="relative w-full pt-[177.77%] bg-[#0A1021] overflow-hidden">
        <Image
          src={product.img || product.image || product.images?.[0] || "/bhulia-hero.png"}
          alt={product.title}
          fill
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Verification Badge */}
        {product.isGiVerified && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] text-[9px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider shadow-lg flex items-center gap-1 z-10">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
            Bhulia.com Verified
          </div>
        )}

        {/* Sold Out Badge */}
        {(product.inStock === false || (product.stockQuantity !== undefined && product.stockQuantity <= 0)) && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <div className="border-2 border-red-500 text-red-500 font-black text-xl tracking-[0.2em] uppercase px-4 py-2 rotate-[-15deg] bg-black/40">
              SOLD OUT
            </div>
          </div>
        )}

        {/* Hover Quick View / Add to Cart Overlay (PC Only) */}
        {!(product.inStock === false || (product.stockQuantity !== undefined && product.stockQuantity <= 0)) && (
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#0A1021]/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden lg:flex flex-col gap-2 z-10">
            <button 
              onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('sd_add_to_cart', { detail: product }));
              }}
              className="w-full py-2 bg-white text-gray-900 text-xs font-bold uppercase tracking-wider rounded shadow-lg hover:bg-gray-100 transition-colors"
            >
              Quick Add
            </button>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-[#0B2B26]/30">
        <div>
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="text-sm md:text-base font-bold text-gray-100 leading-tight line-clamp-2 font-serif group-hover:text-[#C5A059] transition-colors">
              {product.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-1.5 mb-3">
             <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-medium bg-[#C5A059]/10 px-1.5 py-0.5 rounded">
                {(product.material || product.sareeType || "Handloom").slice(0, 15)}
             </span>
             {product.storeName && (
               <span className="text-[9px] uppercase tracking-widest text-gray-500 truncate">
                 By {product.storeName}
               </span>
             )}
          </div>
        </div>

        <div className="mt-auto border-t border-[#C5A059]/10 pt-3 flex items-center justify-between">
          <div>
            {isB2BApproved && isWholesale ? (
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-black text-[#C5A059] font-sans tracking-tight">
                  ₹{product.commercialPrice?.toLocaleString() || finalPrice.toLocaleString()} 
                  <span className="text-[10px] text-[#C5A059] bg-[#C5A059]/10 px-1 py-0.5 rounded font-medium uppercase tracking-widest ml-1.5 border border-[#C5A059]/20">B2B</span>
                </span>
                {isRetail && (
                  <span className="text-[10px] text-gray-500 line-through">Retail: ₹{priceNum.toLocaleString()}</span>
                )}
                {!isRetail && (
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Wholesale Only</span>
                )}
              </div>
            ) : (
              <>
                <span className="text-lg md:text-xl font-black text-white font-sans tracking-tight">₹{finalPrice.toLocaleString()}</span>
                {product.isSpecialOffer && priceNum > finalPrice && (
                  <span className="text-xs text-gray-500 line-through ml-2">₹{priceNum.toLocaleString()}</span>
                )}
              </>
            )}
          </div>
          <Link href={`/product/${product.id}`} className="w-8 h-8 rounded-full bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059] hover:bg-[#C5A059] hover:text-[#0A1021] transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </Link>
        </div>

        {/* Reseller Info (Only visible to resellers) */}
        {role === "reseller" && product.allowResellerMargin && isRetail && (
          <div className="mt-3 pt-3 border-t border-dashed border-[#C5A059]/30">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400 font-bold uppercase tracking-widest">Dropship Margin</span>
              <span className="text-green-400 font-black">{product.resellerMarginPercentage}% (₹{Math.round(priceNum * (product.resellerMarginPercentage / 100)).toLocaleString()})</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
