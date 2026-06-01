import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// We use the same config as lib/firebase.ts
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data
import { MASTER_PRODUCTS } from "../src/lib/products";
import { MASTER_STORES } from "../src/app/store/data";
import { MASTER_FRANCHISES } from "../src/app/franchise/data";

function stripUndefined(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}

async function seed() {
  console.log("Starting seeding...");
  
  // Seed Products
  for (const product of MASTER_PRODUCTS) {
    await setDoc(doc(db, "products", product.id), stripUndefined(product));
    console.log(`Seeded product ${product.id}`);
  }

  // Seed Stores
  for (const store of MASTER_STORES) {
    await setDoc(doc(db, "stores", store.id), stripUndefined(store));
    console.log(`Seeded store ${store.id}`);
  }

  // Seed Franchises
  for (const franchise of MASTER_FRANCHISES) {
    await setDoc(doc(db, "franchises", franchise.id), stripUndefined(franchise));
    console.log(`Seeded franchise ${franchise.id}`);
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
