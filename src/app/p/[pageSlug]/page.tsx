"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";

export default function StaticContentPage() {
  const params = useParams();
  const slug = typeof params?.pageSlug === "string" ? params.pageSlug : "";

  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#051815] text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs uppercase tracking-widest text-[#C5A059]">Loading Document...</p>
        </div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen bg-[#051815] text-white flex flex-col items-center justify-center font-sans p-6 text-center">
        <div className="text-5xl mb-4">📄</div>
        <h2 className="text-2xl font-serif text-[#C5A059] font-bold mb-2">Page Not Found</h2>
        <p className="text-sm text-gray-300 max-w-md mb-6 leading-relaxed">
          The document you are looking for does not exist or has been removed.
        </p>
        <Link href="/" className="bg-[#C5A059] text-[#0A1021] px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all">
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#051815] text-white font-sans py-16 px-4">
      <div className="max-w-4xl mx-auto bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-8 md:p-12 shadow-2xl">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#C5A059] mb-8 border-b border-[#C5A059]/20 pb-6">
          {pageData.title}
        </h1>
        
        {/* We use dangerouslySetInnerHTML to render the rich text (HTML) from the CMS */}
        <div 
          className="prose prose-invert prose-gold max-w-none prose-headings:text-[#C5A059] prose-a:text-[#C5A059] hover:prose-a:text-white"
          dangerouslySetInnerHTML={{ __html: pageData.content }}
        />
      </div>
    </main>
  );
}
