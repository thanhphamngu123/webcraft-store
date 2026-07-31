/**
 * Firebase Config & Automatic Cloud Sync Engine for WebCraft Store
 * Connected to Firebase Project: webstore-a19ea
 */

window.firebaseConfig = {
  apiKey: "AIzaSyBWTvE9SBnNnblvUyt2E57bDJ37lJ8leEs",
  authDomain: "webstore-a19ea.firebaseapp.com",
  projectId: "webstore-a19ea",
  storageBucket: "webstore-a19ea.firebasestorage.app",
  messagingSenderId: "315684270789",
  appId: "1:315684270789:web:d9062a2b1875356dc5b6ac",
  measurementId: "G-HCBR076R0J"
};

// Initialize Firebase & Auto-Sync with Firestore Cloud Database
window.initFirebaseStore = async function() {
  if (window.firebase && !window.firebase.apps.length) {
    try {
      window.firebase.initializeApp(window.firebaseConfig);
      window.db = window.firebase.firestore();
      console.log("⚡ Firebase Cloud Database (webstore-a19ea) connected & active!");
      
      // Auto-sync default templates to Firestore if empty
      await syncInitialTemplatesToFirebase();
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
      console.log(`✅ Successfully seeded ${defaults.length} template projects to Firebase Firestore!`);
    }
  } catch (err) {
    console.warn("Firebase Firestore Sync notice (Ensure Firestore is created in Test Mode):", err);
  }
}

// Auto init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.initFirebaseStore();
});
