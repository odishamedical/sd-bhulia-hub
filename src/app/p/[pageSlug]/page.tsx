import React from "react";
import PageClient from "./PageClient";

export const dynamic = "force-dynamic";

async function fetchPageData(slug: string) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'sd-bhulia';
  const fbApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBUpo-Mc3aDs38LtkjgmUxSQNCVzg9XK2o'; // Bhulia Hub default
  
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/pages/${slug}?key=${fbApiKey}`;
  
  try {
    const res = await fetch(firestoreUrl, { cache: 'no-store' });
    if (!res.ok) return null;
    
    const data = await res.json();
    if (!data.fields) return null;
    
    return {
      title: data.fields.title?.stringValue || '',
      content: data.fields.content?.stringValue || ''
    };
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { pageSlug: string } }) {
  const pageData = await fetchPageData(params.pageSlug);
  
  if (!pageData) {
    return { title: "Page Not Found | Bhulia.com" };
  }

  return {
    title: `${pageData.title} | Bhulia.com`,
    description: pageData.content ? pageData.content.substring(0, 150).replace(/<[^>]*>?/gm, '') + "..." : "Authentic Sambalpuri Handloom Marketplace.",
  };
}

export default async function ServerStaticPage({ params }: { params: { pageSlug: string } }) {
  const pageData = await fetchPageData(params.pageSlug);
  

  return <PageClient slug={params.pageSlug} initialData={pageData} />;
}


