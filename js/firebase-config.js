/**
 * Firebase Config & Automatic Cloud Sync Engine for WebCraft Store
 * Automatically syncs & seeds template projects directly into Firebase Firestore Cloud Database.
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

// Initialize Firebase & Auto-Sync with Firestore
window.initFirebaseStore = async function() {
  if (window.firebase && !window.firebase.apps.length) {
    try {
      if (window.firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY") {
        window.firebase.initializeApp(window.firebaseConfig);
        window.db = window.firebase.firestore();
        console.log("⚡ Firebase Cloud Store connected & ready!");
        
        // Auto-seed default templates if Firestore collection is empty
        await syncInitialTemplatesToFirebase();
      } else {
        console.warn("⚠️ Firebase notice: Vui lòng dán apiKey của bạn vào js/firebase-config.js để đồng bộ với Firebase Console!");
      }
    } catch (e) {
      console.warn("Firebase Init Error:", e);
    }
  }
};

/**
 * Automatically uploads default templates to Firebase Firestore if empty
 */
async function syncInitialTemplatesToFirebase() {
  if (!window.db) return;
  try {
    const snapshot = await window.db.collection('web_templates').get();
    if (snapshot.empty) {
      console.log("🔄 Initializing Firebase Firestore collection 'web_templates'...");
      const defaults = typeof DEFAULT_TEMPLATES !== 'undefined' ? DEFAULT_TEMPLATES : [];
      for (const tpl of defaults) {
        await window.db.collection('web_templates').doc(tpl.id).set(tpl);
      }
      console.log(`✅ Successfully uploaded ${defaults.length} default template projects to Firebase Firestore!`);
    }
  } catch (err) {
    console.warn("Firebase Firestore Sync notice:", err);
  }
}

// Auto init on script load
document.addEventListener('DOMContentLoaded', () => {
  window.initFirebaseStore();
});
