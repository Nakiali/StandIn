// ══════════════════════════════════════════════════════════════
//  STANDIN CORP — FIREBASE CONFIGURATION
//  Replace the values below with your own Firebase project config.
//
//  HOW TO GET YOUR CONFIG:
//  1. Go to https://console.firebase.google.com
//  2. Create a project (or open an existing one)
//  3. Click the gear icon → Project Settings
//  4. Scroll to "Your apps" → Web app → copy the firebaseConfig object
//  5. Also enable Firestore: Build → Firestore Database → Create database
// ══════════════════════════════════════════════════════════════

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

export default firebaseConfig;
