import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAuqvEA2_4GlnYn6dnEchUVEFJEgjbtWPA",
  // Use the default firebaseapp.com domain — required for redirect auth in Capacitor WebView.
  // Do NOT change to a custom domain here, as Capacitor's WebView won't handle the redirect.
  authDomain: "spark-a73bb.firebaseapp.com",
  projectId: "spark-a73bb",
  storageBucket: "spark-a73bb.firebasestorage.app",
  messagingSenderId: "726402748544",
  appId: "1:726402748544:web:c8d51e6e8557266e0d5665",
  measurementId: "G-7E3VJFJWEG"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence).catch(console.error);
