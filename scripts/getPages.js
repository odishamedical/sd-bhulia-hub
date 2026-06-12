const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

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

async function run() {
  const querySnapshot = await getDocs(collection(db, "pages"));
  const pages = [];
  querySnapshot.forEach((doc) => {
    pages.push({ id: doc.id, title: doc.data().title });
  });
  console.log(JSON.stringify(pages, null, 2));
  process.exit(0);
}

run();
