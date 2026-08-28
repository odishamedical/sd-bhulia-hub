import { parseFirestoreDocument } from './restParser';

const PROJECT_ID = "sd-bhulia";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

/**
 * Runs a Firestore query via the REST API.
 */
async function runQuery(collectionName: string, field: string, value: string) {
  const url = `${BASE_URL}:runQuery`;
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: collectionName }],
        where: {
          fieldFilter: {
            field: { fieldPath: field },
            op: "EQUAL",
            value: { stringValue: value }
          }
        },
        limit: 10
      }
    }),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Firestore REST API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  // REST API runQuery returns an array of objects like { document: {...}, readTime: "..." }
  return data
    .filter((item: any) => item.document)
    .map((item: any) => parseFirestoreDocument(item.document));
}

/**
 * Fetches a document by its ID via the REST API.
 */
async function getDocumentById(collectionName: string, docId: string) {
  const url = `${BASE_URL}/${collectionName}/${docId}`;
  const response = await fetch(url, { cache: 'no-store' });
  
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Firestore REST API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return parseFirestoreDocument(data);
}

export async function getProfileMeta(collectionName: string, slug: string) {
  try {
    const docs = await runQuery(collectionName, 'slug', slug);

    if (docs.length === 0) {
      return null;
    }

    let docSnap = docs[0];
    for (const d of docs) {
      if (d.status === 'active' || d.status === 'approved') {
        docSnap = d;
        break;
      }
    }

    const data = docSnap;
    
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
    const docs = await runQuery('products', 'slug', slug);

    let data: any = null;

    if (docs.length === 0) {
      // Fallback: Check if slug is the doc ID
      const fallbackDoc = await getDocumentById('products', slug);
      if (fallbackDoc) {
        data = fallbackDoc;
      }
    } else {
      let docSnap = docs[0];
      for (const d of docs) {
        if (d.status === 'active' || d.status === 'approved') {
          docSnap = d;
          break;
        }
      }
      data = docSnap;
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
