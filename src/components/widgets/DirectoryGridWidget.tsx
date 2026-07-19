"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface DirectoryGridData {
  title: string;
  subtitle: string;
  role: "weaver" | "store" | "reseller" | "b2b" | "raw_material";
  itemLimit: number;
}

export default function DirectoryGridWidget({ data }: { data: DirectoryGridData }) {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPartners() {
      try {
        const collectionName = data.role === "weaver" ? "weavers" 
                            : data.role === "store" ? "stores" 
                            : data.role === "reseller" ? "resellers" 
                            : data.role === "b2b" ? "b2b" 
                            : "suppliers"; // Ensure these match your DB collections
        
        const q = query(
          collection(db, collectionName), 
          where("status", "in", ["approved", "active"]), 
          limit(data.itemLimit || 8)
        );
        
        const snapshot = await getDocs(q);
        
        // Let's do a simple client-side sort to show featured (tier) first, then random
        let fetchedPartners: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        fetchedPartners.sort((a, b) => {
           const aTier = a.tier === "Diamond" ? 3 : a.tier === "Gold" ? 2 : 1;
           const bTier = b.tier === "Diamond" ? 3 : b.tier === "Gold" ? 2 : 1;
           return bTier - aTier;
        });

        setPartners(fetchedPartners);
      } catch (error) {
        console.error("Error fetching directory partners:", error);
      } finally {
        setLoading(false);
      }
    }

    if (data.role) fetchPartners();
  }, [data]);

  return (
    <section className="w-full space-y-8 my-12">
      <div className="flex flex-col items-center text-center">
        <h3 className="text-3xl sm:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C5A059] mb-2">
          {data.title}
        </h3>
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">{data.subtitle}</p>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent mb-6"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          [...Array(data.itemLimit || 4)].map((_, i) => <div key={i} className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-2xl h-[380px] animate-pulse"></div>)
        ) : partners.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-500 italic">No partners found in this category yet.</div>
        ) : (
          partners.map((item, idx) => {
            const title = item.title || item.name || item.businessName || "Verified Partner";
            const desc = item.desc || item.address || item.district || "Verified Ecosystem Partner";
            const img = item.img || item.photoURL || "/bhulia-hero.png";
            
            const isVerified = item.status === "approved" || item.status === "active";
            const roleLink = data.role === "store" ? `/store/${item.slug || item.id}` : (data.role === "weaver" ? `/weaver/${item.slug || item.id}` : `/directory`);

            return (
              <Link key={idx} href={roleLink} className="group flex flex-col relative rounded-2xl overflow-hidden h-[380px] border border-[#C5A059]/20 hover:border-[#C5A059] transition-all bg-[#0A2520]">
                <div className="relative w-full h-48 shrink-0 overflow-hidden bg-[#051815]">
                  <Image src={img} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A2520] to-transparent"></div>
                </div>
                
                <div className="absolute top-4 right-4 z-10">
                  {isVerified && (
                    <div className="bg-gradient-to-br from-[#FFF5C0] via-[#D4AF37] to-[#8A5A00] text-[#051815] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center gap-1 border border-[#FFF5C0]/50">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                      Verified
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1 justify-center items-center text-center">
                  <h4 className="text-xl font-serif font-bold text-white mb-2 line-clamp-1">{title}</h4>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4">{desc}</p>
                  <span className="mt-auto text-[#C5A059] text-[10px] font-bold uppercase tracking-widest border border-[#C5A059]/30 px-4 py-1.5 rounded-full group-hover:bg-[#C5A059] group-hover:text-[#051815] transition-all">
                    View Profile →
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
      
      {partners.length > 0 && (
        <div className="flex justify-center mt-8">
          <Link href="/directory" className="px-10 py-4 border border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059] hover:text-[#051815] text-xs font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-[0_0_25px_rgba(197,160,89,0.5)] rounded-full">
            Explore {data.role}s
          </Link>
        </div>
      )}
    </section>
  );
}
