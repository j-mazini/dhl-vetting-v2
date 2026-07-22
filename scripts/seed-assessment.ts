/**
 * Seed a candidate assessment directly into Firestore via the Admin SDK
 * (bypasses security rules — useful for testing the candidate flow without the
 * admin Release button).
 *
 * Credentials: set ONE of these to a service-account key file:
 *   FIREBASE_SERVICE_ACCOUNT_JSON=/abs/path/to/serviceAccount.json
 *   GOOGLE_APPLICATION_CREDENTIALS=/abs/path/to/serviceAccount.json
 * (Download from Firebase console → Project settings → Service accounts →
 *  Generate new private key.)
 *
 * Run:
 *   npx -y tsx scripts/seed-assessment.ts --name "Jane Driver" [--driver <driverId>]
 *
 * Optional env:
 *   BASE_URL=https://your-app.com   (default http://localhost:3000)
 *   FIREBASE_PROJECT_ID=vetting-63c6d
 */
import * as admin from 'firebase-admin';
import { ASSESSMENT_BANK_ID, releaseQuestions } from '../src/app/admin/interview/assessment-bank';
import { newAssessmentToken } from '../src/app/admin/interview/assessment-types';

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const candidateName = arg('--name') ?? 'Test Candidate';
const driverId = arg('--driver'); // optional: also links the test to a driver record
const baseUrl = (process.env.BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const projectId =
  process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'vetting-63c6d';

function initAdmin(): admin.app.App {
  if (admin.apps.length) return admin.app();
  const saPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!saPath) {
    console.error(
      '\n✗ No service-account credential found.\n' +
        '  Set FIREBASE_SERVICE_ACCOUNT_JSON (or GOOGLE_APPLICATION_CREDENTIALS) to the\n' +
        '  path of a key file downloaded from the Firebase console.\n',
    );
    process.exit(1);
  }
  return admin.initializeApp({
    projectId,
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    credential: admin.credential.cert(require(saPath)),
  });
}

async function main() {
  const app = initAdmin();
  const db = app.firestore();

  const token = newAssessmentToken();
  const questions = releaseQuestions();

  await db
    .collection('assessments')
    .doc(token)
    .set({
      token,
      driver: { id: driverId ?? 'seed-test', source: 'drivers' },
      candidateName,
      bankId: ASSESSMENT_BANK_ID,
      questions,
      totalQuestions: questions.length,
      status: 'released',
      answers: {},
      currentIndex: 0,
      releasedAt: admin.firestore.FieldValue.serverTimestamp(),
      score: null,
    });

  // Optionally surface it in the admin Assessment tab for that driver.
  if (driverId) {
    await db
      .collection('drivers')
      .doc(driverId)
      .set({ interview: { assessmentToken: token } }, { merge: true });
  }

  console.log('\n✔ Assessment seeded');
  console.log(`  candidate : ${candidateName}`);
  console.log(`  token     : ${token}`);
  console.log(`  questions : ${questions.length}`);
  if (driverId) console.log(`  linked to : drivers/${driverId}`);
  console.log(`\n  Candidate link:\n  ${baseUrl}/assessment/${token}\n`);
  process.exit(0);
}

main().catch((e) => {
  console.error('\n✗ Seed failed:', e instanceof Error ? e.message : e, '\n');
  process.exit(1);
});
