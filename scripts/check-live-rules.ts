/**
 * Fetches the LIVE published Firestore security rules for the project and prints
 * whether the `assessments` block is present. Uses the Admin service-account
 * credential to mint an access token (scope cloud-platform).
 *
 *   FIREBASE_SERVICE_ACCOUNT_JSON=/abs/path/key.json npx -y tsx scripts/check-live-rules.ts
 */
import * as admin from 'firebase-admin';

const projectId =
  process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'vetting-63c6d';

async function main() {
  const saPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!saPath) {
    console.error('✗ Set FIREBASE_SERVICE_ACCOUNT_JSON to the key file path.');
    process.exit(1);
  }
  const cred = admin.credential.cert(require(saPath));
  const { access_token } = await cred.getAccessToken();

  const base = 'https://firebaserules.googleapis.com/v1';
  const auth = { Authorization: `Bearer ${access_token}` };

  // 1. Which ruleset is live for cloud.firestore?
  const relRes = await fetch(`${base}/projects/${projectId}/releases`, { headers: auth });
  const relJson = (await relRes.json()) as {
    releases?: Array<{ name: string; rulesetName: string; updateTime?: string }>;
  };
  if (!relRes.ok) {
    console.error('✗ releases API error:', JSON.stringify(relJson));
    process.exit(1);
  }
  const fsRelease = relJson.releases?.find((r) => r.name.endsWith('cloud.firestore'));
  if (!fsRelease) {
    console.error('✗ No cloud.firestore release found.');
    process.exit(1);
  }
  console.log(`Live firestore ruleset : ${fsRelease.rulesetName}`);
  console.log(`Last updated           : ${fsRelease.updateTime ?? 'n/a'}`);

  // 2. Fetch that ruleset's source.
  const rsRes = await fetch(`${base}/${fsRelease.rulesetName}`, { headers: auth });
  const rsJson = (await rsRes.json()) as {
    source?: { files?: Array<{ name: string; content: string }> };
  };
  const content = rsJson.source?.files?.map((f) => f.content).join('\n') ?? '';

  const hasAssessments = /match\s+\/assessments\//.test(content);
  const hasCandidateFn = /onlyCandidateAssessmentUpdate/.test(content);
  console.log(`\nContains  match /assessments/  : ${hasAssessments ? 'YES ✓' : 'NO ✗'}`);
  console.log(`Contains  onlyCandidateAssessmentUpdate : ${hasCandidateFn ? 'YES ✓' : 'NO ✗'}`);

  if (!hasAssessments) {
    console.log('\n→ The published rules do NOT include the assessments block.');
    console.log('  The deploy did not publish your edited file. Redeploy from the correct folder.');
  } else {
    console.log('\n→ The assessments block IS live. The permission error is NOT the missing rule.');
  }
  process.exit(0);
}

main().catch((e) => {
  console.error('✗ Failed:', e instanceof Error ? e.message : e);
  process.exit(1);
});
