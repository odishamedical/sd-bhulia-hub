import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBUpo-Mc3aDs38LtkjgmUxSQNCVzg9XK2o",
  authDomain: "sd-bhulia.firebaseapp.com",
  projectId: "sd-bhulia",
  storageBucket: "sd-bhulia.firebasestorage.app",
  messagingSenderId: "847168799219",
  appId: "1:847168799219:web:58c134aaa139274f831286"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const pages = [
  {
    slug: "about-us",
    title: "About Bhulia.com",
    content: `
      <h2>The Legacy of Shyam Dash</h2>
      <p>Bhulia.com is the definitive global marketplace for authenticated, luxury Sambalpuri handlooms. Built under the visionary umbrella of Shyam Dash Creation, we represent the bridge between 800 years of Odisha's weaving heritage and the modern luxury connoisseur.</p>
      <p>Every piece presented on this platform is verified through our strict authentication protocols, ensuring that you receive only 100% original Pure Silk Pata, Pasapalli, Bomkai, and Cotton Ikat.</p>
      <h3>Direct to Master Weavers</h3>
      <p>We partner exclusively with Master Weavers and Primary Weavers Cooperative Societies. By eliminating the middleman, we guarantee fair trade and ethical payouts directly to the artisans preserving this immaculate craft.</p>
    `
  },
  {
    slug: "contact-us",
    title: "24/7 Concierge Support",
    content: `
      <h2>We are here to assist you</h2>
      <p>For inquiries regarding bespoke orders, verification of Bhulia.com certificates, or VIP transit logistics, our dedicated concierge team is available 24/7.</p>
      <ul>
        <li><strong>Email:</strong> support@bhulia.com</li>
        <li><strong>Phone:</strong> +91 (Toll-Free Placeholder)</li>
        <li><strong>Headquarters:</strong> Shyam Dash Creation, Odisha, India</li>
      </ul>
      <p>If you are an artisan seeking to join the Bhulia.com Registry, please contact our artisan onboarding team directly.</p>
    `
  },
  {
    slug: "about-our-products",
    title: "The Sambalpuri Masterpieces",
    content: `
      <h2>The Pinnacle of Handloom Luxury</h2>
      <p>Sambalpuri Ikat is renowned globally for its intricate tie-and-dye artistry. Unlike printed fabrics, every thread is dyed precisely before weaving to create mathematically perfect motifs inspired by nature and temple architecture.</p>
      <h3>Pure Silk Pata</h3>
      <p>Woven using only the highest grade of mulberry silk, our Silk Pata sarees are heirloom pieces characterized by their deep luster, intricate border work, and exceptional durability.</p>
      <h3>The GI Tag Guarantee</h3>
      <p>Every handloom listed on Bhulia.com is protected by the Geographical Indication (GI) tag, guaranteeing its origin, authenticity, and traditional weaving method.</p>
    `
  },
  {
    slug: "privacy-policy",
    title: "Global Privacy Policy",
    content: `
      <h2>Data Protection at Bhulia.com</h2>
      <p>Your privacy is of utmost importance to Shyam Dash Creation. We employ bank-grade encryption to protect your personal data, payment information, and order history.</p>
      <p>We strictly comply with international data protection laws, ensuring that your information is never sold to third parties. Data is utilized exclusively to enhance your bespoke shopping experience and manage BVC Armored Transit logistics.</p>
    `
  },
  {
    slug: "terms-of-service",
    title: "Terms of Service",
    content: `
      <h2>Luxury Marketplace Terms</h2>
      <p>By accessing Bhulia.com, you agree to our sovereign terms of service. All content, imagery, and registry protocols are the intellectual property of Shyam Dash Creation.</p>
      <p>Prices listed for handlooms are subject to real-time fluctuations based on the live silk and cotton yarn market indices. All sales are bound by the Bhulia.com Registry Clearance protocol.</p>
    `
  },
  {
    slug: "artisan-payout-guide",
    title: "Artisan Payout Guide",
    content: `
      <h2>Ethical Transparency Protocol</h2>
      <p>Bhulia.com is committed to zero-middleman exploitation. When a purchase is made, funds are placed into a secure escrow system.</p>
      <p>Upon verification and dispatch of the authentic handloom, payouts are triggered directly to the Master Weaver or Cooperative Society's registered bank account within 24 hours.</p>
      <p>We provide full transparency. Our artisan partners receive 100% of the agreed-upon wholesale price, empowering communities and preserving the craft.</p>
    `
  },
  {
    slug: "secure-bvc-armored-transit",
    title: "Secure BVC Armored Transit",
    content: `
      <h2>Uncompromising Logistics</h2>
      <p>Due to the high intrinsic value of Pure Silk Pata masterpieces, Bhulia.com partners with BVC Logistics for secure, armored transit.</p>
      <p>Every shipment is fully insured, climate-controlled, and tracked via GPS from the weaver's loom directly to your doorstep, globally.</p>
      <p>For international bespoke orders, we handle all customs clearance under the Bhulia Registry protocol to ensure pristine delivery.</p>
    `
  },
  {
    slug: "platform-return-policy",
    title: "Platform Return Policy",
    content: `
      <h2>Luxury Return Protocol</h2>
      <p>To maintain the hygienic integrity and crisp fold of authentic handlooms, Bhulia.com enforces a strict 7-day luxury return policy.</p>
      <p>Returns are only accepted if the Bhulia Verified Seal remains completely intact and the garment is un-draped. Any breach of the security tag voids the return policy to protect the next buyer.</p>
      <p>In the rare event of a defect, our concierge team will arrange an immediate armored pickup.</p>
    `
  },
  {
    slug: "bhulia-registry-clearance",
    title: "Bhulia.com Registry Clearance",
    content: `
      <h2>The Global Authentication Standard</h2>
      <p>The Bhulia.com Registry Clearance is our proprietary 4-step verification protocol for every handloom sold.</p>
      <ul>
        <li><strong>Step 1:</strong> Weaver Verification (Cross-referenced with Gov. ID & Cooperative databases).</li>
        <li><strong>Step 2:</strong> Thread Count & Silk Purity Analysis.</li>
        <li><strong>Step 3:</strong> GI Tag Cross-Check.</li>
        <li><strong>Step 4:</strong> Application of the tamper-proof Bhulia Verified Seal.</li>
      </ul>
      <p>Every purchase comes with a digital Certificate of Authenticity permanently recorded in our registry.</p>
    `
  },
  {
    slug: "live-silk-rates",
    title: "Live Silk & Yarn Rates",
    content: `
      <h2>Transparent Market Pricing</h2>
      <p>At Bhulia.com, we believe in absolute pricing transparency. The cost of a masterpiece is directly correlated with the live market value of pure mulberry silk and premium cotton yarn.</p>
      <div style="background: rgba(197,160,89,0.1); padding: 20px; border-radius: 12px; border: 1px solid rgba(197,160,89,0.3); margin-top: 20px;">
        <h3 style="margin-top:0;">Today's Index (Estimated)</h3>
        <ul>
          <li><strong>Pure Mulberry Silk (Bangalore):</strong> ₹4,800 - ₹5,200 / kg</li>
          <li><strong>Premium Cotton Yarn:</strong> ₹800 - ₹1,100 / kg</li>
          <li><strong>Zari (Gold Threading):</strong> Subject to daily bullion rates.</li>
        </ul>
      </div>
      <p>We automatically adjust our base costs to reflect fair compensation for weavers based on these live indices.</p>
    `
  }
];

async function seed() {
  console.log("Seeding Bhulia.com Global Policy Pages...");
  try {
    for (const page of pages) {
      const docRef = doc(db, "pages", page.slug);
      await setDoc(docRef, {
        title: page.title,
        content: page.content,
        updatedAt: new Date().toISOString()
      });
      console.log(`✅ Seeded: ${page.slug}`);
    }
    console.log("🎉 All pages successfully seeded to Firebase!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding pages:", error);
    process.exit(1);
  }
}

seed();
