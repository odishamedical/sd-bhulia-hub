import type { Metadata } from "next";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function generateMetadata({ params }: { params: Promise<{ productId: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.productId.toLowerCase();
  
  try {
    const q = query(collection(db, "products"), where("slug", "==", slug));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const product = snapshot.docs[0].data();
      return {
        title: `${product.title} | Bhulia Hub`,
        description: product.desc || "Authentic Sambalpuri Handloom direct from weavers.",
        openGraph: {
          title: `${product.title} | Bhulia Hub`,
          description: product.desc || "Authentic Sambalpuri Handloom direct from weavers.",
          images: product.img ? [product.img] : ["/bhulia-hero.png"],
          type: "website"
        },
        twitter: {
          card: "summary_large_image",
          title: `${product.title} | Bhulia Hub`,
          description: product.desc || "Authentic Sambalpuri Handloom direct from weavers.",
          images: product.img ? [product.img] : ["/bhulia-hero.png"],
        }
      };
    }
  } catch (error) {
    console.error("Metadata fetch error for product:", error);
  }

  return {
    title: "Product | Bhulia Hub",
  };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
