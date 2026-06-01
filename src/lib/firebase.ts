import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, query, where, getDocs, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBhuliaHubMasterKey092834710293847",
  authDomain: "sd-bhulia.firebaseapp.com",
  projectId: "sd-bhulia",
  storageBucket: "sd-bhulia.firebasestorage.app",
  messagingSenderId: "849201928374",
  appId: "1:849201928374:web:b8c9d0e1f2a3b4c5d6e7f8"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, googleProvider, doc, getDoc, setDoc, onSnapshot, collection, query, where, getDocs, serverTimestamp, updateDoc, increment };
