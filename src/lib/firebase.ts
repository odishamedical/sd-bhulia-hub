import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, query, where, getDocs, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export const firebaseConfig = {
  apiKey: "AIzaSyBUpo-Mc3aDs38LtkjgmUxSQNCVzg9XK2o",
  authDomain: "sd-bhulia.firebaseapp.com",
  projectId: "sd-bhulia",
  storageBucket: "sd-bhulia.firebasestorage.app",
  messagingSenderId: "847168799219",
  appId: "1:847168799219:web:58c134aaa139274f831286"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, storage, googleProvider, doc, getDoc, setDoc, onSnapshot, collection, query, where, getDocs, serverTimestamp, updateDoc, increment, ref, uploadBytes, getDownloadURL, deleteObject };
