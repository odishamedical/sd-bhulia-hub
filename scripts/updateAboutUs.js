const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBUpo-Mc3aDs38LtkjgmUxSQNCVzg9XK2o",
  authDomain: "sd-bhulia.firebaseapp.com",
  projectId: "sd-bhulia",
  storageBucket: "sd-bhulia.firebasestorage.app",
  messagingSenderId: "847168799219",
  appId: "1:847168799219:web:58c134aaa139274f831286"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const htmlContent = `
<h3>🌸 About Us – Bhulia.com</h3>
<p><strong>Sambalpuri Saree</strong> is a living heritage of Western Odisha. For over 800 years, the local Bhulia community has been weaving this special GI‑tagged masterpiece, cherished by generations and proudly worn as a symbol of Odisha’s identity.</p>

<p>As natives of Western Odisha, we created Bhulia.com to honor and support our weavers while preserving this rich cultural legacy. Our platform connects you directly to authentic Sambalpuri weavers and trusted retail stores, ensuring that every product you receive is real, original, and verified.</p>

<p>We meticulously authenticate each saree and handloom product with the <strong>Bhulia Verified Seal</strong>, safeguarding originality and protecting artisans from imitation. This platform is dedicated exclusively to Sambalpuri Handloom — from cotton sarees, pata sarees, and dress materials to bedsheets and more.</p>

<p>At Bhulia.com, every purchase is more than a transaction — it is a contribution to sustaining families, empowering artisans, and keeping alive the timeless pride of Odisha.</p>

<div style="margin-top: 2rem; border-top: 1px solid #C5A059; padding-top: 1rem; font-size: 0.875rem;">
  <strong>Developed by:</strong><br/>
  Shyam Dash Creation<br/>
  R7/A2 – Jagannath Mandir Colony, Budharaja, Sambalpur, Odisha, India – Pin 768004
</div>
`;

async function run() {
  await setDoc(doc(db, "pages", "about-us"), {
    title: "About Bhulia.com",
    content: htmlContent,
    updatedAt: new Date().toISOString()
  });
  console.log("Updated about-us page successfully.");
  process.exit(0);
}

run();
