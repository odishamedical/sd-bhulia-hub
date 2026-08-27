import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export async function GET(request: Request) {
  try {
    const oldSlug = "rajesh-meher-sambalpuri-saree-centre-6874";
    const storeQ = await getDocs(query(collection(db, 'stores'), where('slug', '==', oldSlug)));
    
    const docs = storeQ.docs.map(d => ({ id: d.id, ownerUid: d.data().ownerUid, status: d.data().status }));
    
    return NextResponse.json({ docs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
