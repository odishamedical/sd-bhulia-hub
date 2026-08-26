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

    return NextResponse.json({ success: true, updatedCount });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
