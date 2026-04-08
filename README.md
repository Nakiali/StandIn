# StandIn Corp Platform — PWA + Firebase + Netlify

A production-ready Progressive Web App deployment package for the StandIn Corp platform.
All data is stored permanently in **Firebase Firestore** (no more browser-only localStorage).
The app can be installed on any device as a native-like PWA.

---

## 📁 Project Structure

```
standin-corp/
├── index.html          ← Main app (Firebase-integrated, PWA-ready)
├── sw.js               ← Service Worker (offline caching)
├── manifest.json       ← PWA manifest (install metadata)
├── netlify.toml        ← Netlify deployment config
├── firestore.rules     ← Firebase security rules
├── firebase-config.js  ← Reference config (values go in index.html)
├── icons/
│   ├── icon-192.png    ← PWA icon (home screen)
│   └── icon-512.png    ← PWA splash icon
└── README.md           ← This file
```

---

## 🔥 Step 1 — Set Up Firebase

### 1a. Create a Firebase Project
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → give it a name (e.g. `standin-corp`)
3. Disable Google Analytics if not needed → **Create project**

### 1b. Enable Firestore Database
1. In your project, click **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (you'll tighten rules later)
4. Select a region close to Kenya: **`europe-west1`** or **`us-central1`**
5. Click **Done**

### 1c. Register a Web App & Get Config
1. Click the gear icon ⚙ → **Project Settings**
2. Scroll to **"Your apps"** → click the **`</>`** (Web) icon
3. Give it a nickname: `StandIn Corp Web`
4. Click **"Register app"**
5. Copy the `firebaseConfig` object — it looks like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "standin-corp.firebaseapp.com",
     projectId: "standin-corp",
     storageBucket: "standin-corp.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

### 1d. Paste Config Into index.html
Open `index.html` and find this block near the top (around line 20):

```javascript
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  ...
};
```

Replace the placeholder values with your actual Firebase config values.

### 1e. Deploy Firestore Security Rules (Optional but Recommended)
1. In Firebase Console → **Firestore → Rules tab**
2. Paste the contents of `firestore.rules`
3. Click **Publish**

---

## 🚀 Step 2 — Deploy to Netlify

### Option A — Drag & Drop (Fastest)
1. Go to [https://app.netlify.com](https://app.netlify.com) and log in
2. Click **"Add new site" → "Deploy manually"**
3. Drag the entire `standin-corp/` folder onto the upload area
4. Your site is live in ~30 seconds at a URL like `https://random-name.netlify.app`

### Option B — GitHub + Auto Deploy (Recommended for Updates)
1. Create a new GitHub repository
2. Push all files in this folder to the repo root
3. In Netlify: **"Add new site" → "Import an existing project"**
4. Connect to GitHub → select your repo
5. Build settings:
   - **Build command:** *(leave empty)*
   - **Publish directory:** `.` *(dot = root)*
6. Click **Deploy site**

Every `git push` to `main` will auto-redeploy.

### Set a Custom Domain (Optional)
1. Netlify dashboard → **Domain settings → Add custom domain**
2. Follow DNS instructions to point your domain to Netlify

---

## 📱 Step 3 — Test the PWA

After deploying, visit your Netlify URL:

1. **Desktop Chrome:** Look for the install icon (⊕) in the address bar
2. **Android Chrome:** Tap the browser menu → "Add to Home Screen"
3. **iOS Safari:** Tap Share → "Add to Home Screen"

The app will install as a standalone app with the StandIn Corp icon.

---

## 🗄️ How Firebase Data Storage Works

| Collection | Description |
|------------|-------------|
| `config/users` | All user accounts (email → credentials map) |
| `clients` | Registered client organisations |
| `reps` | Representative profiles and status |
| `engagements` | All booked engagements |

### Data Flow
```
User action (register/book/update)
  → In-memory cache updated instantly (UI stays fast)
  → localStorage mirror written (offline fallback)
  → Firestore async write (permanent, cross-device)
```

On every page load, the app fetches fresh data from Firestore and updates
the cache. If Firestore is unreachable (offline), it falls back to the
last-known localStorage mirror automatically.

---

## 🔧 Local Development

Open `index.html` directly in a browser.

- If Firebase is configured, it connects to your live Firestore.
- If not yet configured (keys still say `YOUR_API_KEY`), the app falls back
  to localStorage automatically — all features still work, data just won't
  be permanent across devices until you add your config.

---

## 🔐 Admin Login

| Email | Password |
|-------|----------|
| `nakibongochiali@gmail.com` | `Wanjala@2018` |

This is seeded automatically on first run. You can add more accounts
via the Register tab in the app (or directly in Firestore Console).

---

## 🛡️ Security Notes

- The current setup stores passwords in plain text in Firestore.
  This matches the existing app design. For a production upgrade,
  integrate **Firebase Authentication** (email/password provider)
  to get proper hashed auth, session tokens, and security rules
  tied to `request.auth.uid`.
- The `firestore.rules` file currently allows all reads/writes.
  Tighten these rules once you add Firebase Auth.

---

## 📞 Support

Built for deployment on Netlify + Firebase by StandIn Corp.
For updates, re-upload the folder to Netlify or push to your GitHub repo.
