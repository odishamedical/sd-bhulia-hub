import type { Metadata } from "next";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.toLowerCase();
  
  try {
    const q = query(collection(db, "weavers"), where("slug", "==", slug));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const weaver = snapshot.docs[0].data();
      return {
        title: `${weaver.title || weaver.name} - Master Weaver | Bhulia Hub`,
        description: weaver.desc || `Discover authentic Sambalpuri handlooms directly from ${weaver.title || weaver.name}.`,
        openGraph: {
          title: `${weaver.title || weaver.name} - Master Weaver | Bhulia Hub`,
          description: weaver.desc || `Discover authentic Sambalpuri handlooms directly from ${weaver.title || weaver.name}.`,
          images: weaver.img ? [weaver.img] : ["/bhulia-hero.png"],
          type: "profile"
        },
        twitter: {
          card: "summary_large_image",
          title: `${weaver.title || weaver.name} - Master Weaver | Bhulia Hub`,
          description: weaver.desc || `Discover authentic Sambalpuri handlooms directly from ${weaver.title || weaver.name}.`,
          images: weaver.img ? [weaver.img] : ["/bhulia-hero.png"],
        }
      };
    }
  } catch (error) {
    console.error("Metadata fetch error for weaver:", error);
  }

  return {
    title: "Weaver Profile | Bhulia Hub",
  };
}

export default function WeaverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
