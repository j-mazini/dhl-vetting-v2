import * as admin from 'firebase-admin';

export function initializeAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID || 'vetting-63c6d',
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
      };

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
    projectId: process.env.FIREBASE_PROJECT_ID || 'vetting-63c6d',
  });
}
