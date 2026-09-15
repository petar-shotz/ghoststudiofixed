import "server-only";

import {
  applicationDefault,
  getApp,
  getApps,
  initializeApp,
  type App,
  type AppOptions,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function firebaseOptions(): AppOptions | undefined {
  const projectId =
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    process.env.GOOGLE_CLOUD_PROJECT?.trim() ||
    process.env.GCLOUD_PROJECT?.trim();

  // Firebase App Hosting provides FIREBASE_CONFIG and Application Default
  // Credentials automatically, so initializeApp() needs no checked-in key.
  if (!projectId) return undefined;

  return {
    credential: applicationDefault(),
    projectId,
  };
}

export function getFirebaseAdminApp(): App {
  if (getApps().length > 0) return getApp();

  const options = firebaseOptions();
  return options ? initializeApp(options) : initializeApp();
}

export function getFirebaseAdminDb(): Firestore {
  return getFirestore(getFirebaseAdminApp());
}
