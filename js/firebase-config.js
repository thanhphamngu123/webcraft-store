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

// Safe helper to obtain or initialize Firebase Firestore
window.getDb = function() {
  if (window.db) return window.db;
  if (typeof firebase !== 'undefined') {
    try {
      if (!firebase.apps || !firebase.apps.length) {
        if (window.firebaseConfig) {
          firebase.initializeApp(window.firebaseConfig);
        }
      }
      if (typeof firebase.firestore === 'function') {
        window.db = firebase.firestore();
        console.log("⚡ Firebase Cloud Database (webstore-a19ea) connected!");
        return window.db;
      }
    } catch (e) {
      console.warn("Firestore getDb error:", e);
    }
  }
  return null;
};

// Auto-seed default templates to Firebase Firestore if collection is empty
window.syncInitialTemplatesToFirebase = async function() {
  const db = window.getDb();
  if (!db) return;
  try {
    const snapshot = await db.collection('web_templates').get();
    if (snapshot.empty) {
      console.log("🔄 Initializing Firebase Firestore collection 'web_templates'...");
      const defaults = typeof DEFAULT_TEMPLATES !== 'undefined' ? DEFAULT_TEMPLATES : [];
      for (const tpl of defaults) {
        await db.collection('web_templates').doc(tpl.id).set(tpl);
      }
      console.log(`✅ Successfully seeded ${defaults.length} template projects to Firebase Firestore!`);
    }
  } catch (err) {
    console.warn("Firebase Firestore Sync Notice:", err.message);
  }
};

// Try initializing when window loads completely
window.addEventListener('load', () => {
  window.getDb();
  window.syncInitialTemplatesToFirebase();
});
