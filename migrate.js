const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function migrate() {
  const collectionsToMigrate = ['stores', 'weavers', 'wholesalers', 'franchises', 'resellers', 'suppliers'];
  let updatedCount = 0;
  
  for (const collName of collectionsToMigrate) {
    const snapshot = await db.collection(collName).get();
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      if (!data.ownerUid && data.status !== 'unclaimed') {
        const isLikelyUserUid = doc.id.length >= 28 && !doc.id.includes('-');
        
        if (isLikelyUserUid) {
          await doc.ref.update({ ownerUid: doc.id });
          updatedCount++;
          console.log(`Updated ${collName}/${doc.id} with ownerUid`);
        }
      }
    }
  }
  console.log(`Migration complete! Updated ${updatedCount} documents.`);
}

migrate().catch(console.error);
