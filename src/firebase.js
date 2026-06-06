// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuqvEA2_4GlnYn6dnEchUVEFJEgjbtWPA",
  authDomain: "spark-a73bb.firebaseapp.com",
  projectId: "spark-a73bb",
  storageBucket: "spark-a73bb.firebasestorage.app",
  messagingSenderId: "726402748544",
  appId: "1:726402748544:web:c8d51e6e8557266e0d5665",
  measurementId: "G-7E3VJFJWEG"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app); // Also initialize and export auth since it's an authentication flow
