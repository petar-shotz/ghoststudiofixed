import { applicationDefault, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId =
  process.env.FIREBASE_PROJECT_ID?.trim() ||
  process.env.GOOGLE_CLOUD_PROJECT?.trim() ||
  process.env.GCLOUD_PROJECT?.trim();

if (
  !projectId &&
  !process.env.FIREBASE_CONFIG &&
  !process.env.GOOGLE_APPLICATION_CREDENTIALS
) {
  console.error(
    "Firebase is not configured. Set FIREBASE_PROJECT_ID and authenticate with Application Default Credentials first.",
  );
  process.exitCode = 1;
} else {
  try {
    const options = projectId
      ? { credential: applicationDefault(), projectId }
      : undefined;
    const app = getApps().length
      ? getApp()
      : options
        ? initializeApp(options)
        : initializeApp();

    await getFirestore(app).collection("project_briefs").limit(1).get();
    console.log(`Firestore connection successful (project: ${app.options.projectId || projectId || "auto"}).`);
  } catch (error) {
    console.error(
      "Firestore connection failed:",
      error instanceof Error ? error.message : String(error),
    );
    process.exitCode = 1;
  }
}
