import React from "react";
import { Metadata } from "next";
import ClientDirectory from "@/app/directory/[[...slug]]/ClientDirectory";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const rawCategory = decodeURIComponent(resolvedParams.category);
  const categoryParts = rawCategory.split('-');
  const categoryName = categoryParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

  const title = `Original Sambalpuri ${categoryName} Saree | Authentic Odisha Handloom`;
  const description = `Shop original Sambalpuri ${categoryName} sarees directly from Odisha's master weavers. Explore our collection of 100% Handloom mark certified Sambalpuri handloom, including Sambalpuri silk saree, Sambalpuri cotton, Sambalpuri Ikat, Bandha, and Sambalpuri pata saree.`;

  return {
    title,
    description,
    openGraph: { title, description, images: ["https://bhulia.com/bhulia-hero.png"] },
    twitter: { card: "summary_large_image", title, description, images: ["https://bhulia.com/bhulia-hero.png"] }
  };
}

export default async function CategorySareePage({ params }: PageProps) {
  const resolvedParams = await params;
  const rawCategory = decodeURIComponent(resolvedParams.category);
  const categoryParts = rawCategory.split('-');
  const categoryName = categoryParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

  return (
    <main>
      <h1 className="sr-only">Premium Sambalpuri {categoryName}</h1>
      
      <React.Suspense fallback={<div className="flex-1 min-h-screen flex items-center justify-center bg-[#051815]"><div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div></div>}>
        <ClientDirectory initialRole="all" initialState="" initialDistrict="" />
      </React.Suspense>
    </main>
  );
}
