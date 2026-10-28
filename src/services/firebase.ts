import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';

// Values come from Firebase web app config 
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

type FirebaseServices = { auth: Auth; db: Firestore; functions: Functions };

function createFirebase(): FirebaseServices | null {
  if (!isFirebaseConfigured) return null;

  // Fast refresh re-runs this module; reuse the existing app instead of initializing twice.
  if (getApps().length) {
    const app = getApp();
    return { auth: getAuth(app), db: getFirestore(app), functions: getFunctions(app) };
  }

  const app = initializeApp(firebaseConfig);
  return {
    // Keeps the user signed in between app launches.
    auth: initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) }),
    // Optional fields like `region` may be undefined; Firestore rejects those by default.
    db: initializeFirestore(app, { ignoreUndefinedProperties: true }),
    functions: getFunctions(app),
  };
}

const services = createFirebase();

export const auth = services?.auth ?? null;
export const db = services?.db ?? null;
export const functions = services?.functions ?? null;
