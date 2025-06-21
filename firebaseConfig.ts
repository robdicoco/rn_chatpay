// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate required environment variables
if (!process.env.EXPO_PUBLIC_FIREBASE_API_KEY) {
  throw new Error("EXPO_PUBLIC_FIREBASE_API_KEY is not set in your environment file");
}

if (!process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN) {
  throw new Error("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN is not set in your environment file");
}

if (!process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) {
  throw new Error("EXPO_PUBLIC_FIREBASE_PROJECT_ID is not set in your environment file");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Only initialize analytics in web environment
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };