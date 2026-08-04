import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { BookOpen, Sparkles, ShieldCheck, HeartHandshake } from "lucide-react";

export const metadata = {
  title: "Sambalpuri Handloom Guide | Bhulia.com",
  description: "Your comprehensive guide to understanding, identifying, and caring for authentic Sambalpuri handlooms.",
};

const guideTopics = [
  {
    slug: "history-of-sambalpuri",
    title: "History & Heritage",
    description: "Discover the 800-year-old legacy of Western Odisha's weaving tradition.",
    icon: <Sparkles className="w-6 h-6 text-[#C5A059]" />
  },
  {
    slug: "the-baandha-technique",
    title: "The Baandha Technique",
    description: "Step-by-step into the magical tie-and-dye process of Sambalpuri fabrics.",
    icon: <BookOpen className="w-6 h-6 text-[#C5A059]" />
  },
  {
    slug: "identifying-authentic",
    title: "Identifying Authentic Handloom",
    description: "Learn to distinguish a genuine hand-woven masterpiece from power-loom fakes.",
    icon: <ShieldCheck className="w-6 h-6 text-[#C5A059]" />
  },
  {
    slug: "care-and-maintenance",
    title: "Care & Maintenance",
    description: "Preserve the beauty and longevity of your pure cotton and silk sarees.",
    icon: <HeartHandshake className="w-6 h-6 text-[#C5A059]" />
  }
];

export default function GuideIndexPage() {
  return (
    <div className="min-h-screen bg-[#F5F1E6] text-[#2C1810]">
      <Header />
      
      {/* Hero Section */}
      <div className="relative py-20 overflow-hidden border-b border-[#E8DFC9]">
        <div className="absolute inset-0 bg-[url('/hero-bg-texture.jpg')] opacity-20 bg-cover bg-center mix-blend-multiply pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#8C2E2E]/5 to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-[#8C2E2E] font-bold mb-6 tracking-wide drop-shadow-sm">
            Handloom Heritage Guide
          </h1>
          <p className="text-lg text-[#5A4A42] leading-relaxed max-w-2xl mx-auto">
            Explore the rich history, intricate craftsmanship, and cultural significance of authentic Sambalpuri handlooms. Empower yourself with the knowledge to identify and care for these timeless masterpieces.
          </p>
        </div>
      </div>

      {/* Grid Section */}
      <div className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {guideTopics.map((topic, index) => (
            <Link href={`/guide/${topic.slug}`} key={index} className="group block h-full">
              <div className="bg-white border border-[#E8DFC9] p-10 rounded-2xl h-full flex flex-col hover:border-[#8C2E2E]/40 hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C5A059]/10 to-transparent rounded-bl-full pointer-events-none"></div>
                
                <div className="w-14 h-14 rounded-full bg-[#FDFBF7] flex items-center justify-center shrink-0 border border-[#E8DFC9] mb-8 group-hover:scale-110 group-hover:border-[#C5A059]/50 transition-all shadow-sm">
                  {topic.icon}
                </div>
                <h2 className="text-2xl font-serif text-[#8C2E2E] font-bold mb-4 group-hover:text-[#C5A059] transition-colors">{topic.title}</h2>
                <p className="text-[#5A4A42] text-base leading-relaxed mb-8 flex-grow">
                  {topic.description}
                </p>
                <div className="text-[#C5A059] font-bold uppercase tracking-widest text-sm flex items-center mt-auto">
                  Read Article <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
