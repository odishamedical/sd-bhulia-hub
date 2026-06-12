"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import StaticPageNav from "@/components/StaticPageNav";
import { useProducts } from "@/lib/db-hooks";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";

export default function PremiumStaticPage() {
  const params = useParams();
  const slug = typeof params?.pageSlug === "string" ? params.pageSlug : "";

  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<{ title: string; content: string } | null>(null);

  const { products, loading: productsLoading } = useProducts({ status: "approved" });

  useEffect(() => {
    async function fetchPage() {
      try {
        const docSnap = await getDoc(doc(db, "pages", slug));
        if (docSnap.exists()) {
          setPageData(docSnap.data() as { title: string; content: string });
        } else {
          setPageData(null);
        }
      } catch (e) {
        console.error("Error fetching page:", e);
      }
      setLoading(false);
    };
    if (slug) fetchPage();
  }, [slug]);

  // Randomize Images (client-side only to avoid hydration mismatch)
  const [randomFamily, setRandomFamily] = useState("/static-pages/Beautiful Family.png");
  const [randomWeaving, setRandomWeaving] = useState("/static-pages/Sambalpuri Saree Weaving.png");
  const [randomModels, setRandomModels] = useState<string[]>([]);

  useEffect(() => {
    const families = ["/static-pages/Beautiful Family.png", "/static-pages/Beautiful Family1.png"];
    const weavings = ["/static-pages/Sambalpuri Saree Weaving.png", "/static-pages/Sambalpuri Saree Weaving1.png"];
    const models = [
      "/static-pages/High-Class Fashionable Models-1.PNG",
      "/static-pages/High-Class Fashionable Models-2.PNG",
      "/static-pages/High-Class Fashionable Models-3.PNG",
      "/static-pages/High-Class Fashionable Models-4.PNG",
      "/static-pages/High-Class Fashionable Models-5.PNG",
      "/static-pages/High-Class Fashionable Models-6.PNG",
      "/static-pages/High-Class Fashionable Models-7.PNG",
      "/static-pages/High-Class Fashionable Models.PNG"
    ];
    
    setRandomFamily(families[Math.floor(Math.random() * families.length)]);
    setRandomWeaving(weavings[Math.floor(Math.random() * weavings.length)]);
    
    // Pick 4 random unique models
    const shuffledModels = [...models].sort(() => 0.5 - Math.random());
    setRandomModels(shuffledModels.slice(0, 4));
  }, [slug]);

  const liveProducts = products.slice(0, 4); // First 4 live products

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF8F1] text-[#0A1021] flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs uppercase tracking-widest text-[#C5A059] font-bold">Loading Premium Document...</p>
        </div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen bg-[#FBF8F1] text-[#0A1021] flex flex-col items-center justify-center font-sans p-6 text-center">
        <h2 className="text-2xl font-serif text-[#C5A059] font-bold mb-2">Page Not Found</h2>
        <Link href="/" className="bg-[#C5A059] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all mt-4">
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F1] font-sans">
      <StaticPageNav />

      <main className="max-w-[1920px] mx-auto px-4 md:px-8 pt-2 pb-8 md:pt-4 md:pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: Decorative Images */}
          <div className="lg:w-[25%] flex flex-col gap-8 order-2 lg:order-1">
            <div className="bg-white p-3 rounded-2xl shadow-xl border border-[#C5A059]/30 relative overflow-hidden group">
              <div className="absolute inset-0 border-2 border-[#C5A059] m-2 pointer-events-none z-10" style={{ borderStyle: "double" }}></div>
              <div className="aspect-[3/4] relative rounded-xl overflow-hidden">
                <Image src={randomFamily} alt="Sambalpuri Family" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <h3 className="text-center font-bold uppercase tracking-widest text-[#0A1021] text-xs mt-3 mb-1">Beautiful Family</h3>
            </div>
            
            <div className="bg-white p-3 rounded-2xl shadow-xl border border-[#C5A059]/30 relative overflow-hidden group">
              <div className="absolute inset-0 border-2 border-[#C5A059] m-2 pointer-events-none z-10" style={{ borderStyle: "double" }}></div>
              <div className="aspect-[4/3] relative rounded-xl overflow-hidden bg-gray-100">
                <Image src={randomWeaving} alt="Sambalpuri Saree Weaving" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <h3 className="text-center font-bold uppercase tracking-widest text-[#0A1021] text-xs mt-3 mb-1">Sambalpuri Saree Weaving</h3>
            </div>
          </div>

          {/* MIDDLE COLUMN: Text Content & Models */}
          <div className="lg:w-[50%] flex flex-col gap-8 order-1 lg:order-2">
            <div className="bg-white border-2 border-[#C5A059]/20 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent"></div>
              
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#0A1021] mb-8 border-b border-gray-200 pb-6">
                {pageData.title}
              </h1>
              
              <div 
                className="prose prose-lg max-w-none prose-headings:text-[#0A1021] prose-h3:font-serif prose-h3:text-2xl prose-a:text-[#C5A059] hover:prose-a:text-[#0A1021] text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: pageData.content }}
              />
            </div>

            {/* High Class Fashionable Models Grid */}
            {randomModels.length > 0 && (
              <div className="mt-4 bg-white border border-[#C5A059]/20 rounded-3xl p-6 shadow-xl">
                <h3 className="text-center text-xl font-serif font-bold text-[#0A1021] mb-6">High-Class Fashionable Models</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {randomModels.map((modelSrc, i) => (
                    <div key={i} className="bg-[#FBF8F1] p-2 rounded-xl shadow-md border border-[#C5A059]/20 relative group">
                       <div className="aspect-[3/4] relative rounded-lg overflow-hidden">
                         <Image src={modelSrc} alt="Fashionable Model" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Live Products */}
          <div className="lg:w-[25%] flex flex-col gap-6 order-3">
            <div className="bg-white p-4 rounded-t-2xl shadow-sm border border-b-0 border-[#C5A059]/30 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-[#C5A059]"></div>
               <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A1021]">Featured Original Masterpieces</h3>
            </div>
            
            <div className="flex flex-col gap-6">
              {productsLoading ? (
                <div className="text-center text-[#C5A059] text-xs font-bold uppercase animate-pulse py-8">Loading Live Masterpieces...</div>
              ) : (
                liveProducts.map(product => (
                   <div key={product.id} className="relative shadow-xl rounded-2xl overflow-hidden border border-[#C5A059]/20">
                      <ProductCard product={product} role="customer" />
                      <div className="absolute top-2 right-2 bg-green-600 text-white text-[9px] font-black uppercase px-2 py-1 rounded shadow-md z-10 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        LIVE
                      </div>
                   </div>
                ))
              )}
            </div>
            
            {liveProducts.length > 0 && (
               <Link href="/search" className="block w-full py-4 text-center bg-[#0A1021] text-[#C5A059] font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-black transition-colors shadow-lg">
                 Explore All Masterpieces
               </Link>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
