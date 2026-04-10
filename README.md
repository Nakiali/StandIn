# StandIn Corp — PWA Deployment Guide

## Files in this folder (deploy everything flat)
```
index.html       ← Main app
sw.js            ← Service worker
manifest.json    ← PWA manifest
netlify.toml     ← Netlify config
icon-192.png     ← App icon 192x192
icon-512.png     ← App icon 512x512
README.md        ← This file
```

---

## Step 1 — Set up Firebase

1. Go to https://console.firebase.google.com
2. Create a project (e.g. standin-corp)
3. Add app → Web, copy the firebaseConfig object
4. Enable Firestore Database → Start in test mode → region: europe-west1

Firestore security rules (paste in Rules tab):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## Step 2 — Paste Firebase config into index.html

Find this block near line 30 of index.html:
```js
var firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
```
Replace with your real values.

---

## Step 3 — Deploy

### Netlify drag-and-drop
1. app.netlify.com → drag this folder onto the deploy area
2. Done

### GitHub + Netlify
```bash
git init && git add . && git commit -m "deploy"
git remote add origin https://github.com/YOU/standin-pwa.git
git push -u origin main
```
Then in Netlify: New site → Import from Git → no build command, publish dir = /

---

## Admin Login (unchanged)
Email:    nakibongochiali@gmail.com
Password: Wanjala@2018

---

## Firestore Collections
- standin_users/{email}     — user accounts
- standin_clients/registry  — registered clients list
- standin_reps/roster       — representatives list
- standin_engagements/log   — all engagements list
