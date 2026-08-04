import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { bhuliaGuideArticles } from "../data";
import { notFound } from "next/navigation";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const article = bhuliaGuideArticles[params.slug as keyof typeof bhuliaGuideArticles];
  if (!article) return { title: "Not Found" };
  
  return {
    title: `${article.title} | Bhulia.com`,
    description: article.description,
  };
}

export default async function GuideArticlePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const article = bhuliaGuideArticles[params.slug as keyof typeof bhuliaGuideArticles];
  
  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F5F1E6] text-[#2C1810] pt-24 pb-16">
      <Header />
      
      <main className="max-w-[800px] mx-auto px-6 py-12">
        <Link href="/guide" className="inline-flex items-center text-[#8C2E2E] hover:text-[#C5A059] font-bold text-sm tracking-widest uppercase mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-2" /> Back to Guide
        </Link>
        
        <article className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-[#E8DFC9]">
          <header className="mb-12 border-b border-[#E8DFC9] pb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-serif text-[#8C2E2E] font-bold mb-6 leading-tight drop-shadow-sm">
              {article.title}
            </h1>
            <p className="text-xl text-[#C5A059] font-medium leading-relaxed max-w-2xl mx-auto">
              {article.description}
            </p>
          </header>
          
          <div 
            className="text-[#5A4A42] leading-relaxed font-light space-y-6 text-lg"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>
        
        {/* Footer CTA */}
        <div className="mt-16 p-8 md:p-12 rounded-2xl bg-gradient-to-br from-[#8C2E2E] to-[#5a1c1c] text-center shadow-xl">
          <h3 className="text-3xl font-serif text-[#FDFBF7] font-bold mb-4">Support Our Artisans</h3>
          <p className="text-[#E8DFC9] mb-8 max-w-lg mx-auto font-light text-lg">
            Every genuine Sambalpuri you buy directly supports the ancient weaving communities of Western Odisha.
          </p>
          <Link href="/" className="inline-block bg-[#FDFBF7] hover:bg-[#C5A059] text-[#8C2E2E] hover:text-white px-8 py-4 rounded-lg font-bold uppercase tracking-widest transition-colors shadow-lg">
            Shop Authentic Handlooms
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
