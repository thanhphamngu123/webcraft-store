/**
 * Firebase Config & Cloud Engine for WebCraft Store
 * Provides Firestore Database & Firebase Storage integration for zero-cost instant cloud storage.
 * 
 * Instructions:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a free project -> Add Web App
 * 3. Copy your firebaseConfig object and paste it below.
 */

window.firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "webcraft-store.firebaseapp.com",
  projectId: "webcraft-store",
  storageBucket: "webcraft-store.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
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
