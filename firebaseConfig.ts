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
  apiKey: "AIzaSyA3rYG6c38wQpBTXze6cmbjBUcs56egqno",
  authDomain: "chatpaygo.firebaseapp.com",
  projectId: "chatpaygo",
  storageBucket: "chatpaygo.firebasestorage.app",
  messagingSenderId: "733349592691",
  appId: "1:733349592691:web:912f1e502ce926f0567406",
  measurementId: "G-LBLF7GZ5WE"
};


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