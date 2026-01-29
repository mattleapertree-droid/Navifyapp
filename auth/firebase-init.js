// Fill these values with your real Firebase project configuration
// from the Firebase console (Web app settings).
// Do NOT paste AndroidManifest.xml here – only the firebaseConfig object.
window.NAVIFY_FIREBASE_CONFIG = {
  apiKey: "AIzaSyADAAL8kEH5vkbhyyXW3wPafqGhyX9FX-8",
  authDomain: "navify-703b8.firebaseapp.com",
  projectId: "navify-703b8",
  storageBucket: "navify-703b8.firebasestorage.app",
  messagingSenderId: "727754095633",
  appId: "1:727754095633:web:42aaefaef766504496c5b0",
  measurementId: "G-0WHQDRRW5R"
};

(function initFirebase() {
  if (!window.firebase) {
    console.warn('Firebase SDK not loaded; Navify auth is disabled.');
    return;
  }
  try {
    window.navifyFirebaseApp = firebase.initializeApp(window.NAVIFY_FIREBASE_CONFIG);
    window.navifyAuth = firebase.auth();
  } catch (err) {
    console.error('Failed to initialize Firebase for Navify:', err);
  }
})();
