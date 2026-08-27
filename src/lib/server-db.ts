import { db } from './firebase';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';

export async function getProfileMeta(collectionName: string, slug: string) {
  try {
    const q = query(collection(db, collectionName), where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const data = snapshot.docs[0].data();
    
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
    let snapshot = await adminDb
      .collection('products')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    let data = null;

    if (snapshot.empty) {
      // Fallback: Check if slug is the doc ID
      const doc = await adminDb.collection('products').doc(slug).get();
      if (doc.exists) {
        data = doc.data();
      }
    } else {
      data = snapshot.docs[0].data();
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
