import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export async function GET(request: Request) {
  try {
    let updatedCount = 0;
    
    // Check stores
    const storesSnap = await getDocs(query(collection(db, 'stores'), where('googlePlaceId', '!=', null)));
    for (const d of storesSnap.docs) {
      const data = d.data();
      if (!data.ownerUid && (data.status === 'approved' || data.status === 'active' || !data.status)) {
        await updateDoc(doc(db, 'stores', d.id), { status: 'unclaimed' });
        updatedCount++;
      }
    }
    
    // Check weavers
    const weaversSnap = await getDocs(query(collection(db, 'weavers'), where('googlePlaceId', '!=', null)));
    for (const d of weaversSnap.docs) {
      const data = d.data();
      if (!data.ownerUid && (data.status === 'approved' || data.status === 'active' || !data.status)) {
        await updateDoc(doc(db, 'weavers', d.id), { status: 'unclaimed' });
        updatedCount++;
      }
    }

    // Find Rajesh's new doc which has the old slug
    const oldSlug = "rajesh-meher-sambalpuri-saree-centre-6874";
    const storeQ = await getDocs(query(collection(db, 'stores'), where('slug', '==', oldSlug)));
    
    let oldSlugRestored = false;
    if (!storeQ.empty) {
      const rajeshStore = storeQ.docs[0].data();
      const uid = storeQ.docs[0].id;
      
      const seoDocRef = doc(db, 'stores', oldSlug);
      const existing = await getDoc(seoDocRef);
      
      if (!existing.exists()) {
        await setDoc(seoDocRef, {
          ...rajeshStore,
          ownerUid: uid,
          slug: oldSlug,
          status: 'active'
        });
        oldSlugRestored = true;
      } else {
        await updateDoc(seoDocRef, {
          ownerUid: uid,
          status: 'active'
        });
        oldSlugRestored = true;
      }
    }

    return NextResponse.json({ success: true, updatedCount, oldSlugRestored });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
