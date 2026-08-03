import React from "react";
import { Metadata } from "next";
import ClientDirectory from "@/app/directory/[[...slug]]/ClientDirectory";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ location: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const rawLocation = decodeURIComponent(resolvedParams.location);
  
  const locationParts = rawLocation.split('-');
  const locationName = locationParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

  const title = `Original Sambalpuri Saree in ${locationName}, Odisha | Buy Direct from Weavers`;
  const description = `Find 100% original handloom mark certified Sambalpuri handloom directly from weavers and retail shops in ${locationName}, Odisha. Best collection of Sambalpuri silk saree, Sambalpuri cotton, Sambalpuri Ikat, Bandha, and Sambalpuri pata saree.`;

  return {
    title,
    description,
    openGraph: { title, description, images: ["https://bhulia.com/bhulia-hero.png"] },
    twitter: { card: "summary_large_image", title, description, images: ["https://bhulia.com/bhulia-hero.png"] }
  };
}

export default async function GeoTargetedSareePage({ params }: PageProps) {
  const resolvedParams = await params;
  const rawLocation = decodeURIComponent(resolvedParams.location);
  const locationParts = rawLocation.split('-');
  
  const districtName = locationParts.length > 0 ? locationParts[0].charAt(0).toUpperCase() + locationParts[0].slice(1) : "";
  const stateName = locationParts.length > 1 ? locationParts[1].charAt(0).toUpperCase() + locationParts[1].slice(1) : "";

  return (
    <main>
      <h1 className="sr-only">Authentic Sambalpuri Sarees in {districtName} {stateName}</h1>
      
      <React.Suspense fallback={<div className="flex-1 min-h-screen flex items-center justify-center bg-[#051815]"><div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div></div>}>
        <ClientDirectory initialRole="all" initialState={stateName} initialDistrict={districtName} />
      </React.Suspense>
    </main>
  );
}
