import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function activate() {
  const directoryDocId = `template_global_directory_${Date.now()}`;
  const directoryData = {
    id: directoryDocId,
    title: "The Sambalpuri Global Directory",
    type: "directory",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    theme: { backgroundColor: "#051815", headingColor: "#C5A059", textColor: "#E2E8F0", ticketColor: "#C5A059" },
    rows: [
      {
        id: "dir-hero", type: "hero", title: "Directory Hero", hideTitle: true, heroLayout: "full",
        heroHeadline: "The original Sambalpuri : Saree, Dress, Bedsheet, Cloth Weavers, store and Rawmaterial supplier.",
        heroSubheadline: "Discover authentic Master Weavers and Verified Retail Shops for original Sambalpuri Handloom.",
        heroImages: [],
        aspectRatio: "widescreen"
      },
      { id: "dir-districts", type: "district_links" },
      { id: "dir-grid", type: "directory_listings" }
    ],
    status: "premium_template"
  };

  console.log("Adding directory template...");
  await setDoc(doc(db, "platform_pages", directoryDocId), directoryData);

  console.log("Setting active route...");
  const routesRef = doc(db, "platform_settings", "active_routes");
  const routesSnap = await getDoc(routesRef);
  
  let currentRoutes = {};
  if (routesSnap.exists()) {
    currentRoutes = routesSnap.data();
  }
  
  currentRoutes.activeDirectoryId = directoryDocId;
  await setDoc(routesRef, currentRoutes);

  console.log("Done! The directory is now active at /directory");
  process.exit(0);
}

activate().catch(console.error);
