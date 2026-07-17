"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "../ProductCard";
import { useProducts } from "@/lib/db-hooks";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface ProductCarouselData {
  title: string;
  filterType: "trending" | "new" | "offers" | "category";
  category?: string;
  itemLimit: number;
}

export default function ProductCarouselWidget({ data, userRole = "user" }: { data: ProductCarouselData, userRole?: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        let q;
        const productsRef = collection(db, "products");

        if (data.filterType === "offers") {
          q = query(productsRef, where("status", "==", "approved"), where("isSpecialOffer", "==", true), limit(data.itemLimit || 6));
        } else if (data.filterType === "category" && data.category) {
          q = query(productsRef, where("status", "==", "approved"), where("category", "==", data.category), limit(data.itemLimit || 6));
        } else {
          // Default to just getting recent approved products, then sorting client-side for "trending" or "new"
          q = query(productsRef, where("status", "==", "approved"), orderBy("createdAt", "desc"), limit(20));
        }

        const snapshot = await getDocs(q);
        let fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (data.filterType === "trending") {
          fetchedProducts = fetchedProducts.sort(() => 0.5 - Math.random()).slice(0, data.itemLimit || 6);
        } else if (data.filterType === "new") {
          fetchedProducts = fetchedProducts.slice(0, data.itemLimit || 6);
        }

        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching carousel products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [data]);

  return (
    <section className="w-full space-y-6 my-12">
      <div className="flex flex-col items-center text-center">
        <h3 className="text-3xl sm:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C5A059] mb-2">
          {data.title}
        </h3>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent mt-2"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 pt-4">
        {loading ? (
          [...Array(data.itemLimit || 6)].map((_, i) => <div key={i} className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl h-[380px] animate-pulse"></div>)
        ) : products.length > 0 ? (
          products.map(item => <ProductCard key={item.id} product={item} role={userRole} />)
        ) : (
          <div className="col-span-full text-center text-gray-500 py-10">No products found for this section.</div>
        )}
      </div>
      
      {products.length > 0 && (
        <div className="flex justify-center mt-8">
          <Link href={data.filterType === "category" ? `/search?category=${data.category}` : "/search"} className="px-8 py-3 border border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059]/10 text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(197,160,89,0.2)] hover:shadow-[0_0_25px_rgba(197,160,89,0.4)]">
            View Collection
          </Link>
        </div>
      )}
    </section>
  );
}
