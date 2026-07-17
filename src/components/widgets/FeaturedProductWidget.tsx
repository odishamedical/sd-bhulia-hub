import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useProducts } from "@/lib/db-hooks";
import ProductCard from "../ProductCard";

export default function FeaturedProductWidget({ data, userRole }: { data: any, userRole: string }) {
  const { products, loading } = useProducts({ status: "approved" });
  
  if (loading) return <div className="w-full h-[500px] bg-[#0B2B26] animate-pulse rounded-2xl border border-[#C5A059]/30"></div>;

  // Find the specific product by ID, or just pick the first featured one
  const product = products.find(p => p.id === data.productId) || products.find(p => p.isSpecialOffer) || products[0];

  if (!product) return null;

  return (
    <section className="w-full relative rounded-3xl overflow-hidden border border-[#C5A059]/40 shadow-2xl flex flex-col md:flex-row bg-gradient-to-br from-[#0A2520] to-[#051815]">
      <div className="w-full md:w-1/2 relative min-h-[400px]">
        {product.images && product.images[0] ? (
          <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">No Image</div>
        )}
        {data.badgeText && (
          <div className="absolute top-6 left-6 bg-[#C5A059] text-[#0A1021] text-xs font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg z-10">
            {data.badgeText}
          </div>
        )}
      </div>
      <div className="w-full md:w-1/2 p-8 sm:p-16 flex flex-col justify-center">
        <h2 className="text-sm font-bold text-[#C5A059] uppercase tracking-[0.2em] mb-2">{data.subtitle || "Featured Item"}</h2>
        <h3 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">{data.title || product.name}</h3>
        <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8 line-clamp-3">
          {product.description || "Discover the intricate details and unmatched craftsmanship of this handloom masterpiece."}
        </p>
        <div className="flex gap-4 items-center">
          <Link href={`/product/${product.id}`} className="px-8 py-4 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-xl rounded-sm">
            {data.btnText || "Shop Now"}
          </Link>
          <span className="text-3xl font-serif font-bold text-white tracking-tight">₹{product.price?.toLocaleString()}</span>
        </div>
      </div>
    </section>
  );
}
