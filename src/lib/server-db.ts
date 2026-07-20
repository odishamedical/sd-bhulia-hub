import { adminDb } from './firebase-admin';

export async function getProfileMeta(collectionName: string, slug: string) {
  try {
    const snapshot = await adminDb
      .collection(collectionName)
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const data = snapshot.docs[0].data();
    
    return {
      title: data.title || data.name || data.storeName || data.companyName || 'Profile',
      description: data.desc || data.description || data.about || 'Check out this profile on Bhulia Hub.',
      image: data.img || data.image || data.logo || data.coverImage || '/bhulia-hero.png',
      status: data.status,
    };
  } catch (error) {
    console.error(`Error fetching meta for ${collectionName}/${slug}:`, error);
    return null;
  }
}
