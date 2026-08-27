import { db } from './firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export async function getProfileMeta(collectionName: string, slug: string) {
  try {
    const q = query(collection(db, collectionName), where('slug', '==', slug));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    let docSnap = snapshot.docs[0];
    for (const d of snapshot.docs) {
      const data = d.data();
      if (data.status === 'active' || data.status === 'approved') {
        docSnap = d;
        break;
      }
    }

    const data = docSnap.data();
    
    return {
      title: data.title || data.name || data.storeName || data.companyName || 'Profile',
      description: data.desc || data.description || data.about || 'Check out this profile on Bhulia Hub.',
      image: data.img || data.image || data.logo || data.coverImage || '/bhulia-hero.png',
      status: data.status,
      district: data.district || data.city || '',
      state: data.state || '',
    };
  } catch (error) {
    console.error(`Error fetching meta for ${collectionName}/${slug}:`, error);
    return null;
  }
}

export async function getProductMeta(slug: string) {
  try {
    const q = query(collection(db, 'products'), where('slug', '==', slug));
    const snapshot = await getDocs(q);

    let data: any = null;

    if (snapshot.empty) {
      // Fallback: Check if slug is the doc ID
      const docRef = doc(db, 'products', slug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        data = docSnap.data();
      }
    } else {
      let docSnap = snapshot.docs[0];
      for (const d of snapshot.docs) {
        if (d.data().status === 'active' || d.data().status === 'approved') {
          docSnap = d;
          break;
        }
      }
      data = docSnap.data();
    }

    if (!data) return null;
    
    return {
      title: data.title || data.name || 'Sambalpuri Product',
      description: data.desc || data.description || 'Check out this authentic Sambalpuri product on Bhulia Hub.',
      image: (data.images && data.images.length > 0) ? data.images[0] : (data.img || data.image || '/bhulia-hero.png'),
    };
  } catch (error) {
    console.error(`Error fetching meta for product/${slug}:`, error);
    return null;
  }
}
