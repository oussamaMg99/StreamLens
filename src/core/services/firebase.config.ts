// src/core/services/firebase.config.ts
//
// Firebase bootstrap, in the same spirit as tmdb.config.ts: one place that owns the
// config and exports the initialised instances, so consumers import `auth`/`db` rather
// than re-deriving them via getAuth()/getFirestore() at every call site.
//
// initializeApp runs at module scope on purpose — ES modules evaluate depth-first, so
// importing anything from this file guarantees Firebase is initialized before the
// importing module's own body runs. That's what keeps ordering safe without needing
// lazy accessors downstream.
//
// Note the config values aren't secrets: Firebase web config ships to every browser by
// design, and access is governed by Firestore security rules / App Check, not by hiding
// these. They live in env vars for parity with VITE_TMDB_* and so dev/prod can point at
// different Firebase projects without editing source.

import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeUI } from '@firebase-oss/ui-core';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const ui = initializeUI({ app: firebaseApp, auth });

// getAnalytics() throws where measurement isn't available (unsupported browsers, blocked
// scripts, non-browser environments), so it's guarded rather than called outright.
isAnalyticsSupported()
  .then(supported => {
    if (supported) getAnalytics(firebaseApp);
  })
  .catch(() => {
    // Analytics is non-essential; never let it break app start-up.
  });
