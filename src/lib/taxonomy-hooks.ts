import { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, onSnapshot, setDoc, getDoc, arrayUnion } from "firebase/firestore";

const TAXONOMY_DOC_REF = "settings/taxonomy";

export interface TaxonomyState {
  categories: string[];
  materials: string[];
  designs: string[];
}

const DEFAULT_TAXONOMY: TaxonomyState = {
  categories: [
    "Saree",
    "Dress material",
    "Bedsheet",
    "RedyMade shirts",
    "Redy made Kurti",
    "Kurti dress material"
  ],
  materials: [
    "Pure Cotton",
    "Pure Silk (Pata)",
    "Mix Silk(Pata) (Silk+Polyster)",
    "Mix Cotton (Cotton+Polyster)"
  ],
  designs: [
    "Sambalpuri Ikat (Bandha)",
    "Sambalpuri Traditional Ikat Design",
    "Sambalpuri Modern Ikat Design",
    "Sambalpuri Double Ikat (Pashapali/Saptapar)",
    "Bomkei",
    "Bomkei+Ikat"
  ]
};

export function useTaxonomy() {
  const [taxonomy, setTaxonomy] = useState<TaxonomyState>(DEFAULT_TAXONOMY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, TAXONOMY_DOC_REF);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<TaxonomyState>;
        setTaxonomy({
          categories: data.categories || DEFAULT_TAXONOMY.categories,
          materials: data.materials || DEFAULT_TAXONOMY.materials,
          designs: data.designs || DEFAULT_TAXONOMY.designs,
        });
      } else {
        // Initialize doc with defaults if it doesn't exist
        setDoc(docRef, DEFAULT_TAXONOMY).catch(console.error);
        setTaxonomy(DEFAULT_TAXONOMY);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching taxonomy:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { taxonomy, loading };
}

export async function addTaxonomyItem(type: keyof TaxonomyState, newItem: string, source: string = "Admin") {
  if (!newItem.trim()) return;
  
  const docRef = doc(db, TAXONOMY_DOC_REF);
  
  try {
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await setDoc(docRef, DEFAULT_TAXONOMY);
    }
    
    // Add to taxonomy list
    await setDoc(docRef, {
      [type]: arrayUnion(newItem.trim())
    }, { merge: true });

    // If added by someone other than admin, send a notification
    if (source !== "Admin") {
      const notifRef = doc(db, "notifications", Date.now().toString());
      await setDoc(notifRef, {
        title: "New Taxonomy Item Added",
        message: `${source} has added a new ${type}: "${newItem}". Please review.`,
        type: "taxonomy_alert",
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    return true;
  } catch (err) {
    console.error("Failed to add taxonomy item:", err);
    return false;
  }
}
