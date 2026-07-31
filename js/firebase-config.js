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
  appId: "1:315684270789:web:a344bcd61ce638d7c5b6ac",
  measurementId: "G-EZNSTYWGFG"
};

// Initialize Firebase & Firestore Cloud Database immediately
window.initFirebaseStore = async function() {
  if (window.firebase) {
    try {
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(window.firebaseConfig);
      }
      window.db = window.firebase.firestore();
      console.log("⚡ Firebase Cloud Database (webstore-a19ea) initialized successfully!");
      
      await syncInitialTemplatesToFirebase();
    } catch (e) {
      console.warn("Firebase Init Error:", e);
    }
  } else {
    console.warn("⚠️ Firebase SDK not loaded from CDN yet.");
  }
};

/**
 * Automatically seeds default templates to Firebase Firestore if collection is empty
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
    console.error("Firebase Firestore Sync Notice:", err);
  }
}

// Execute immediately upon script load
window.initFirebaseStore();

// Also run on DOMContentLoaded just in case
document.addEventListener('DOMContentLoaded', () => {
  window.initFirebaseStore();
});
