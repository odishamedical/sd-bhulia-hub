import { NextResponse } from 'next/server';
import { adminDb as db } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  try {
    let updatedCount = 0;
    
    // Check stores
    const storesSnap = await db.collection('stores').where('googlePlaceId', '!=', null).get();
    for (const doc of storesSnap.docs) {
      const data = doc.data();
      if (!data.ownerUid && (data.status === 'approved' || data.status === 'active' || !data.status)) {
        await doc.ref.update({ status: 'unclaimed' });
        updatedCount++;
      }
    }
    
    // Check weavers
    const weaversSnap = await db.collection('weavers').where('googlePlaceId', '!=', null).get();
    for (const doc of weaversSnap.docs) {
      const data = doc.data();
      if (!data.ownerUid && (data.status === 'approved' || data.status === 'active' || !data.status)) {
        await doc.ref.update({ status: 'unclaimed' });
        updatedCount++;
      }
    }

    // Find Rajesh's new doc which has the old slug
    const oldSlug = "rajesh-meher-sambalpuri-saree-centre-6874";
    const storeSnap = await db.collection('stores').where('slug', '==', oldSlug).get();
    
    let oldSlugRestored = false;
    if (!storeSnap.empty) {
      const rajeshStore = storeSnap.docs[0].data();
      const uid = storeSnap.docs[0].id;
      
      const seoDocRef = db.collection('stores').doc(oldSlug);
      const existing = await seoDocRef.get();
      
      if (!existing.exists) {
        await seoDocRef.set({
          ...rajeshStore,
          ownerUid: uid,
          slug: oldSlug,
          status: 'active'
        });
        oldSlugRestored = true;
      } else {
        await seoDocRef.update({
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
