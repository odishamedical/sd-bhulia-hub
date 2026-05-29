import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBhuliaHubMasterKey092834710293847",
  authDomain: "sd-bhulia.firebaseapp.com",
  projectId: "sd-bhulia",
  storageBucket: "sd-bhulia.firebasestorage.app",
  messagingSenderId: "849201928374",
  appId: "1:849201928374:web:b8c9d0e1f2a3b4c5d6e7f8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const MASTER_PRODUCTS = [
  {
    id: "SAR-N101",
    slug: "dasrajpur-royal-pasapalli-double-ikat-pata",
    title: "Dasrajpur Royal Pasapalli Double Ikat Pata Saree",
    category: "Silk Masterpieces",
    desc: "Flawless mathematical alignment where both warp and weft silk threads are tie-dyed before mounting on the pit loom.",
    longDesc: "This masterpiece represents the absolute pinnacle of Odishan double ikat (Bandhakala) weaving. Both the warp and weft pure mulberry silk threads are bound and dyed with mathematical precision on graphs before mounting on the loom. The iconic checkered Pasapalli design reflects royalty and pristine symmetry, perfect for heirloom collection.",
    price: "₹ 34,500",
    mrp: "₹ 42,000",
    weave: "Double Ikat Pata",
    time: "45 Days Handweaving",
    cluster: "Sonepur Cluster",
    village: "Dasrajpur, Sonepur",
    yarnType: "3-Ply Mulberry Silk (Silk Mark Gold)",
    isGI: true,
    escrowStatus: "100% Escrow Protected Payouts Enabled",
    rating: "5.0 (18 Reviews)",
    img: "/bhulia-hero.png",
    inStock: true
  },
  {
    id: "SAR-N102",
    slug: "sonepur-temple-spire-conch-double-ikat-silk",
    title: "Sonepur Temple Spire & Conch Double Ikat Silk Saree",
    category: "Silk Masterpieces",
    desc: "Intricate temple borders and conch shell motifs tie-dyed with absolute micro-millimeter precision across the silk matrix.",
    longDesc: "Woven over 52 days of intensive manual craftsmanship in Sonepur, this premium silk saree exhibits the sacred Shankha (conch shell) and Phoda Kumbha (temple spire) motifs.",
    price: "₹ 38,000",
    mrp: "₹ 46,000",
    weave: "Double Ikat Pata",
    time: "52 Days Handweaving",
    cluster: "Sonepur Cluster",
    village: "Dasrajpur, Sonepur",
    yarnType: "3-Ply Mulberry Silk (Silk Mark Gold)",
    isGI: true,
    escrowStatus: "100% Escrow Protected Payouts Enabled",
    rating: "5.0 (12 Reviews)",
    img: "/bhulia-hero.png",
    inStock: true
  },
  {
    id: "SAR-101",
    slug: "royal-pasapalli-mercerized-cotton-ikat",
    title: "Royal Pasapalli Mercerized Cotton Ikat Saree",
    category: "Cotton Classics",
    desc: "Handspun, high-density traditional cotton weave featuring flawless mathematical symmetry.",
    longDesc: "Crafted using 100% pure high-density mercerized cotton for exceptional breathability and crisp fall.",
    price: "₹ 12,500",
    mrp: "₹ 18,000",
    weave: "Cotton Double Ikat",
    time: "18 Days Handweaving",
    cluster: "Bargarh Cluster",
    village: "Barpali, Bargarh",
    yarnType: "100/2s Mercerized Cotton",
    isGI: true,
    escrowStatus: "100% Escrow Protected Payouts Enabled",
    rating: "4.9 (32 Reviews)",
    img: "/bhulia-hero.png",
    inStock: true
  },
  {
    id: "SAR-105",
    slug: "bomkai-cotton-daily-drape-saree",
    title: "Bomkai Cotton Daily Drape Saree",
    category: "Cotton Classics",
    desc: "Lightweight premium handspun cotton Bomkai with classic thread borders.",
    longDesc: "A beautiful everyday cotton drape showcasing high-contrast thread panels, ideal for daily elegance and extreme breathability.",
    price: "₹ 6,500",
    mrp: "₹ 8,000",
    weave: "Bomkai Cotton",
    time: "Sonepur Hub Ready",
    cluster: "Sonepur Cluster",
    village: "Sonepur Town",
    yarnType: "100% Handspun Cotton",
    isGI: true,
    escrowStatus: "100% Escrow Protected Payouts Enabled",
    rating: "4.8 (11 Reviews)",
    img: "/bhulia-hero.png",
    inStock: true
  }
];

const MASTER_WEAVERS = [
  { 
    id: "weaver_nandalal",
    slug: "nandalal-meher",
    title: "Master Weaver Nandalal Meher", 
    desc: "Award-winning master weaver from Dasrajpur, Sonepur. Preserving the rare mathematical alignment of authentic double ikat silk Pata.", 
    img: "/nandalal_meher.jpg", 
    badge: "Bhulia Verified Sambalpuri Master Weaver"
  },
  { 
    id: "weaver_rabindra",
    slug: "rabindra-meher",
    title: "Creative Weaver Rabindra Meher", 
    desc: "Master of Sambalpuri Pata from Dasrajpur, Sonepur. Specializing in intricate Double Ikat, Pasapalli, Nabakothi, and narrative Sachitra silk canvases.", 
    img: "/rabindra_meher.jpg", 
    badge: "Bhulia Verified Sambalpuri Master Weaver"
  },
  { 
    id: "weaver_nagarjuna",
    slug: "nagarjuna-meher",
    title: "Master Artisan Nagarjuna Meher", 
    desc: "Legendary master weaver from Dasrajpur, Sonepur. Devoted to handloom excellence since childhood, producing premium double ikat and narrative silk masterpieces.", 
    img: "/nagarjuna_meher.png", 
    badge: "Bhulia Verified Sambalpuri Master Weaver"
  },
  { 
    id: "weaver_ravi",
    slug: "ravi-meher",
    title: "Master Weaver Ravi Meher", 
    desc: "Visionary Graph Artist from Lumunda, Bargarh. Merging architectural precision with Bandha Kala to create Pasapali and Sachipar masterpieces.", 
    img: "/ravi_meher_v3.png", 
    badge: "Bhulia Verified Sambalpuri Master Weaver"
  }
];

async function seed() {
  console.log("Seeding products...");
  for (const product of MASTER_PRODUCTS) {
    await setDoc(doc(db, "products", product.id), product);
    console.log(`Saved product: ${product.id}`);
  }

  console.log("Seeding weavers...");
  for (const weaver of MASTER_WEAVERS) {
    await setDoc(doc(db, "weavers", weaver.id), weaver);
    console.log(`Saved weaver: ${weaver.id}`);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(console.error);
