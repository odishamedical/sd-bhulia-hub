import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export async function GET() {
  try {
    const collectionsToMigrate = ['stores', 'weavers', 'wholesalers', 'franchises', 'resellers', 'suppliers'];
    let updatedCount = 0;
    
    for (const collName of collectionsToMigrate) {
      const collRef = collection(db, collName);
      const snapshot = await getDocs(collRef);
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        
        // If it doesn't have an ownerUid, but it is NOT unclaimed, it was probably
        // created by the old flow where the doc ID is the auth UID.
        if (!data.ownerUid && data.status !== 'unclaimed') {
          // If the document ID is a standard 28-char Firebase Auth UID (alphanumeric, no hyphens)
          const isLikelyUserUid = docSnapshot.id.length >= 28 && !docSnapshot.id.includes('-');
          
          if (isLikelyUserUid) {
            await updateDoc(doc(db, collName, docSnapshot.id), {
              ownerUid: docSnapshot.id
            });
            updatedCount++;
          }
        }
      }
    }

    return NextResponse.json({ success: true, updatedCount, message: `Successfully backfilled ${updatedCount} documents with ownerUid.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
