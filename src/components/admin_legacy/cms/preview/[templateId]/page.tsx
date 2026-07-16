"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import DynamicRenderer from "@/components/cms/DynamicRenderer";
import { PlatformPage } from "@/types/cms";
import Link from "next/link";

export default function TemplatePreview() {
  const { templateId } = useParams();
  const [template, setTemplate] = useState<PlatformPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplate() {
      if (!templateId) return;
      try {
        const docSnap = await getDoc(doc(db, "platform_pages", templateId as string));
        if (docSnap.exists()) {
          setTemplate({ id: docSnap.id, ...docSnap.data() } as PlatformPage);
        }
      } catch (err) {
        console.error("Failed to load template", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplate();
  }, [templateId]);

  if (loading) {
    return <div className="p-8 text-[#C5A059] animate-pulse flex items-center justify-center min-h-screen">Loading Preview...</div>;
  }

  if (!template) {
    return <div className="p-8 text-red-500 flex items-center justify-center min-h-screen">Template not found.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#051815]">
      {/* Admin Preview Header */}
      <div className="bg-[#0B2B26] border-b border-[#C5A059]/40 p-4 sticky top-0 z-50 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <Link 
            href={`/admin/cms/builder/${templateId}`}
            className="text-[#C5A059] hover:text-white transition-colors font-bold text-sm flex items-center gap-2"
          >
            <span>←</span> Back to Editor
          </Link>
          <div className="h-4 w-px bg-[#C5A059]/30"></div>
          <div>
            <h1 className="text-white font-serif font-bold tracking-wider">{template.title} <span className="text-[#C5A059]/70 text-xs font-sans uppercase">({template.type})</span></h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-[10px] uppercase font-bold tracking-widest animate-pulse">
            Live Preview Mode
          </span>
        </div>
      </div>

      {/* Main Content Area (Exactly mimics public page background and constraints) */}
      <main className="relative flex-1 w-full bg-[#051815] text-white font-sans flex flex-col">
        {/* Background Gold Glows & Ikat Texture (Same as Homepage) */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C5A059 1px, transparent 0)', backgroundSize: '48px 48px' }} />
        <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-[#C5A059]/10 blur-[160px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-[#D4AF37]/10 blur-[160px] rounded-full pointer-events-none z-0" />

        <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 space-y-6 md:space-y-12 overflow-hidden">
          <DynamicRenderer rows={template.rows} />
        </div>
      </main>
    </div>
  );
}
