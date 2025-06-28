// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyA3rYG6c38wQpBTXze6cmbjBUcs56egqno",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "chatpaygo.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "chatpaygo",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "chatpaygo.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "733399999999",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:733399999999:android:1234567890abcdef",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)  
});

//const analytics = getAnalytics(app);

export { app, db, auth };