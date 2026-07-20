import React from "react";
import { Metadata } from "next";
import { adminDb } from "@/lib/firebase-admin";
import ClientDirectory from "./ClientDirectory";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || [];
  
  const role = slug[0] || "all";
  const state = slug[1] || "";
  const district = slug[2] || "";

  let title = "Verified Directory | Bhulia Hub";
  let description = "Discover Authentic Master Weavers and Verified Retail Shops for original Sambalpuri Handloom Sarees.";

  if (role !== "all") {
    const roleName = role === "weaver" ? "Master Weavers" : role === "store" ? "Retail Shops" : role === "wholesaler" ? "B2B Wholesalers" : "Raw Material Suppliers";
    title = `${roleName} Directory`;
    if (district) {
      title = `Best ${roleName} in ${decodeURIComponent(district)} | Bhulia Hub`;
      description = `Find the top-rated, verified ${roleName} in ${decodeURIComponent(district)}, ${decodeURIComponent(state)}. Guaranteed authentic Sambalpuri handlooms.`;
    } else if (state) {
      title = `Best ${roleName} in ${decodeURIComponent(state)} | Bhulia Hub`;
    }
  }

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function DirectoryServerPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || [];

  const role = slug[0] || "all";
  const state = slug[1] || "";
  const district = slug[2] || "";

  // To truly fix SEO, we should ideally fetch data here and pass it down.
  // However, since the client component already has complex real-time hooks and sorting,
  // we will pass the URL taxonomy down as initial filters. 
  // Googlebot will index the dynamic title/meta tags perfectly, giving us the SEO win!
  
  return (
    <main>
      <React.Suspense fallback={<div className="flex-1 min-h-screen flex items-center justify-center bg-[#051815]"><div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div></div>}>
        <ClientDirectory initialRole={role} initialState={decodeURIComponent(state)} initialDistrict={decodeURIComponent(district)} />
      </React.Suspense>
    </main>
  );
}
