import React from "react";
import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import PageClient from "./PageClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { pageSlug: string } }) {
  const docSnap = await adminDb.collection("pages").doc(params.pageSlug).get();
  
  if (!docSnap.exists) {
    return { title: "Page Not Found | Bhulia.com" };
  }

  const data = docSnap.data() as { title: string; content?: string };
  return {
    title: `${data.title} | Bhulia.com`,
    description: data.content ? data.content.substring(0, 150).replace(/<[^>]*>?/gm, '') + "..." : "Authentic Sambalpuri Handloom Marketplace.",
  };
}

export default async function ServerStaticPage({ params }: { params: { pageSlug: string } }) {
  const docSnap = await adminDb.collection("pages").doc(params.pageSlug).get();
  
  if (!docSnap.exists) {
    notFound();
  }

  const pageData = docSnap.data() as { title: string; content: string };

  return <PageClient slug={params.pageSlug} initialData={pageData} />;
}
