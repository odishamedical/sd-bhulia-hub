import React from "react";
import PageClient from "./PageClient";

export const dynamic = "force-dynamic";

async function fetchPageData(slug: string) {
  const projectId = 'sd-bhulia';
  const fbApiKey = 'AIzaSyBUpo-Mc3aDs38LtkjgmUxSQNCVzg9XK2o';
  
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

export async function generateMetadata(props: { params: Promise<{ pageSlug: string }> }) {
  const params = await props.params;
  const pageData = await fetchPageData(params.pageSlug);
  
  if (!pageData) {
    return { title: "Page Not Found | Bhulia.com" };
  }

  return {
    title: `${pageData.title} | Bhulia.com`,
    description: pageData.content ? pageData.content.substring(0, 150).replace(/<[^>]*>?/gm, '') + "..." : "Authentic Sambalpuri Handloom Marketplace.",
  };
}

export default async function ServerStaticPage(props: { params: Promise<{ pageSlug: string }> }) {
  const params = await props.params;
  const pageData = await fetchPageData(params.pageSlug);
  
  return <PageClient slug={params.pageSlug} initialData={pageData} />;
}
