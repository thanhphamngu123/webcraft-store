/**
 * Firebase Config & Cloud Engine for WebCraft Store
 * Provides Firestore Database & Firebase Storage integration for zero-cost instant cloud storage.
 * 
 * Instructions:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a free project -> Add Web App
 * 3. Copy your firebaseConfig object and paste it below.
 */

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWTvE9SBnNnblvUyt2E57bDJ37lJ8leEs",
  authDomain: "webstore-a19ea.firebaseapp.com",
  projectId: "webstore-a19ea",
  storageBucket: "webstore-a19ea.firebasestorage.app",
  messagingSenderId: "315684270789",
  appId: "1:315684270789:web:d9062a2b1875356dc5b6ac",
  measurementId: "G-HCBR076R0J"
};

// Initialize Firebase if CDN script is loaded
window.initFirebaseStore = function() {
  if (window.firebase && !window.firebase.apps.length) {
    try {
      window.firebase.initializeApp(window.firebaseConfig);
      window.db = window.firebase.firestore();
      console.log("⚡ Firebase Cloud Store initialized successfully!");
    } catch (e) {
      console.warn("Firebase Init notice (Config needs user credentials):", e);
    }
  }
};
