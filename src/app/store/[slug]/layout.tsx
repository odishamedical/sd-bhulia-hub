import type { Metadata } from "next";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.toLowerCase();
  
  try {
    const q = query(collection(db, "stores"), where("slug", "==", slug));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const store = snapshot.docs[0].data();
      return {
        title: `${store.title || store.name} - Verified Shop | Bhulia Hub`,
        description: store.desc || `Explore the curated Sambalpuri collection at ${store.title || store.name}.`,
        openGraph: {
          title: `${store.title || store.name} - Verified Shop | Bhulia Hub`,
          description: store.desc || `Explore the curated Sambalpuri collection at ${store.title || store.name}.`,
          images: store.img ? [store.img] : ["/bhulia-hero.png"],
          type: "profile"
        },
        twitter: {
          card: "summary_large_image",
          title: `${store.title || store.name} - Verified Shop | Bhulia Hub`,
          description: store.desc || `Explore the curated Sambalpuri collection at ${store.title || store.name}.`,
          images: store.img ? [store.img] : ["/bhulia-hero.png"],
        }
      };
    }
  } catch (error) {
    console.error("Metadata fetch error for vendor:", error);
  }

  return {
    title: "Vendor Profile | Bhulia Hub",
  };
}

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
