# MealQuest 🍽️

MealQuest is a React Native (Expo) recipe app that lets you search meals from [TheMealDB](https://www.themealdb.com/) API, view detailed ingredients and step‑by‑step instructions, save favourite recipes, and sign in with Firebase using email/password, Google, or as a guest. [web:392][web:488]

---

## Features

- 🔍 Search recipes by name (e.g. “biryani”, “pasta”) using TheMealDB API. [web:392]
- 🧾 Detailed recipe view with ingredients list and numbered step‑by‑step instructions.
- ⭐ Favourites system (per‑user) stored locally via AsyncStorage with Firebase `uid`‑scoped keys.
- 📂 Drawer navigation with:
  - Recipes (home)
  - Favorites
  - Profile (user info, appearance toggle, logout)
- 👤 Authentication with Firebase:
  - Email/password
  - Google sign‑in
  - Anonymous “Continue as guest” login. [web:467][web:481]
- 👋 Onboarding screens shown only on first launch (AsyncStorage flag). [web:457]
- 🎨 Custom dark UI, custom app icon, and splash. [web:440]

---

## Tech Stack

- **Frontend**: React Native (Expo managed workflow). [web:427]
- **Navigation**: React Navigation (Native Stack + Drawer). [web:300]
- **Auth**: Firebase Authentication (email/password, Google, anonymous). [web:467][web:481]
- **Data**: TheMealDB public REST API for recipes. [web:392]
- **Storage**: AsyncStorage for favourites and onboarding flag. [web:350]

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/mealquest.git
cd mealquest
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

Make sure you have the Expo CLI / EAS CLI set up if you plan to build native binaries. [web:427][web:438]

### 3. Configure Firebase

Create `src/firebaseConfig.ts` and add your Firebase config:

```ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  // @ts-ignore
  getReactNativePersistence,
  type Auth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

let app;
let authInstance: Auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  // @ts-ignore
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  app = getApp();
  authInstance = getAuth(app);
}

export const auth = authInstance;
export { app };
```

In the Firebase console, enable these sign‑in methods under **Authentication → Sign-in method**: [web:467][web:481]

- Email/Password  
- Google  
- Anonymous  

### 4. Configure app.json

Point to your icon/splash assets in `app.json` (paths may differ):

```json
{
  "expo": {
    "name": "MealQuest",
    "slug": "mealquest",
    "scheme": "mealquest",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.<yourname>.mealquest"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```
[web:440][web:454]

### 5. Run in development

```bash
npx expo start
```

Scan the QR code with Expo Go on Android, or run on an emulator/simulator.

---

## Favourites & Storage

- Favourites are stored in AsyncStorage under a per‑user key:
  - `mealquest:favorites:<uid>` for signed‑in users
  - `mealquest:favorites:guest` for anonymous users
- The favourites screen re-fetches meal details from TheMealDB by ID. [web:392]
- Onboarding uses a boolean flag `mealquest:onboarded` to show intro slides only once. [web:457]

---

## Building an APK (Android)

This project uses **EAS Build**.

1. Create `eas.json`:

```json
{
  "cli": {
    "version": ">= 0.52.0"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```
[web:432][web:433]

2. Run:

```bash
eas build -p android --profile preview
```

Download the APK from the Expo build page and install it on your device. [web:426][web:438]

---

## Project Structure

```text
.
├── App.tsx
├── app.json
├── eas.json
├── src
│   ├── firebaseConfig.ts
│   └── screens
│       ├── LoginScreen.tsx
│       ├── RecipeListScreen.tsx
│       ├── RecipeDetailScreen.tsx
│       ├── FavoritesScreen.tsx
│       ├── ProfileScreen.tsx
│       └── OnboardingScreen.tsx
└── assets
    ├── icon.png
    ├── adaptive-icon.png
    ├── splash-icon.png
    └── favicon.png
```

---

## Possible Improvements

- Sync favourites to Firestore so they are shared across devices per user. [web:492][web:494]
- Real dark/light theme using React Context and Expo color themes. [web:463]
- Ingredient‑based search (“cook with what I have”) and AI‑generated recipe suggestions. [web:388][web:389]

---

## License

Add your preferred license here (e.g. MIT).
```