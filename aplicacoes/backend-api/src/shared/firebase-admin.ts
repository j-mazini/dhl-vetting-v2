import * as admin from 'firebase-admin';

/**
 * Lazily initialise (once) and return the Firebase Admin app. Credentials come
 * from FIREBASE_SERVICE_ACCOUNT_JSON (a path to a service-account file) or, when
 * absent, Application Default Credentials.
 */
export function getFirebaseApp(): admin.app.App {
  if (admin.apps.length === 0) {
    const saPath = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket:
        process.env.GCP_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
      credential: saPath
        ? // eslint-disable-next-line @typescript-eslint/no-var-requires
          admin.credential.cert(require(saPath))
        : admin.credential.applicationDefault(),
    });
  }
  return admin.app();
}
