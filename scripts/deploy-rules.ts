/**
 * Publishes a Firestore rules file via the Rules REST API using the Admin
 * service-account credential (no firebase CLI / interactive login needed).
 *
 * Dry-run (default) — shows the diff vs the live ruleset, publishes nothing:
 *   FIREBASE_SERVICE_ACCOUNT_JSON=/abs/key.json npx -y tsx scripts/deploy-rules.ts
 *
 * Publish — actually releases the new ruleset:
 *   CONFIRM=1 FIREBASE_SERVICE_ACCOUNT_JSON=/abs/key.json npx -y tsx scripts/deploy-rules.ts
 *
 * RULES_FILE env overrides the source (default: the configuracoes/firebase file).
 */
import * as admin from 'firebase-admin';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectId =
  process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'vetting-63c6d';
const rulesFile = resolve(
  process.env.RULES_FILE ?? '../../configuracoes/firebase/firestore.rules',
);
// configuracoes/firebase is canonical; this second copy targets the same project and
// must stay byte-identical so a deploy from either folder is safe (see review #6).
const mirrorFile = resolve(
  process.env.MIRROR_RULES_FILE ?? '../../vetting-legado/dhl-vetting-tracker/firestore.rules',
);
const base = 'https://firebaserules.googleapis.com/v1';

async function main() {
  const saPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!saPath) {
    console.error('✗ Set FIREBASE_SERVICE_ACCOUNT_JSON to the key file path.');
    process.exit(1);
  }
  const cred = admin.credential.cert(require(saPath));
  const { access_token } = await cred.getAccessToken();
  const auth = { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' };

  const newContent = readFileSync(rulesFile, 'utf8');
  console.log(`Source file : ${rulesFile} (${newContent.split('\n').length} lines)`);

  // Drift guard: the mirror copy must match the canonical source (review #6).
  if (existsSync(mirrorFile)) {
    const mirrorContent = readFileSync(mirrorFile, 'utf8');
    if (mirrorContent !== newContent) {
      console.error(`\n✗ Rules drift: ${mirrorFile} differs from the canonical source.`);
      console.error('  Sync the two firestore.rules files before deploying (or set FORCE=1 to override).');
      if (process.env.FORCE !== '1') process.exit(1);
      console.error('  FORCE=1 set — continuing despite drift.\n');
    } else {
      console.log('Mirror file : in sync ✓');
    }
  }

  // current live source
  const relRes = await fetch(`${base}/projects/${projectId}/releases`, { headers: auth });
  const relJson = (await relRes.json()) as { releases?: Array<{ name: string; rulesetName: string }> };
  const fsRelease = relJson.releases?.find((r) => r.name.endsWith('cloud.firestore'));
  let liveContent = '';
  if (fsRelease) {
    const rsRes = await fetch(`${base}/${fsRelease.rulesetName}`, { headers: auth });
    const rsJson = (await rsRes.json()) as { source?: { files?: Array<{ content: string }> } };
    liveContent = rsJson.source?.files?.map((f) => f.content).join('\n') ?? '';
  }
  console.log(`Live ruleset: ${fsRelease?.rulesetName ?? 'none'} (${liveContent.split('\n').length} lines)`);

  // drift check: lines that exist live but NOT in the new file (would be removed)
  const newLines = new Set(newContent.split('\n').map((l) => l.trim()).filter(Boolean));
  const removed = liveContent
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !newLines.has(l));
  const liveLines = new Set(liveContent.split('\n').map((l) => l.trim()).filter(Boolean));
  const added = newContent
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !liveLines.has(l));

  console.log(`\nLines added by this deploy   : ${added.length}`);
  added.slice(0, 40).forEach((l) => console.log(`  + ${l}`));
  console.log(`\nLines removed by this deploy : ${removed.length}`);
  removed.slice(0, 40).forEach((l) => console.log(`  - ${l}`));

  if (process.env.CONFIRM !== '1') {
    console.log('\n(dry-run) Re-run with CONFIRM=1 to publish.');
    process.exit(0);
  }

  // 1. create ruleset
  const createRes = await fetch(`${base}/projects/${projectId}/rulesets`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ source: { files: [{ name: 'firestore.rules', content: newContent }] } }),
  });
  const created = (await createRes.json()) as { name?: string; error?: unknown };
  if (!createRes.ok || !created.name) {
    console.error('✗ createRuleset failed:', JSON.stringify(created));
    process.exit(1);
  }
  console.log(`\nCreated ruleset: ${created.name}`);

  // 2. point the cloud.firestore release at it
  const relName = `projects/${projectId}/releases/cloud.firestore`;
  const patchRes = await fetch(`${base}/${relName}`, {
    method: 'PATCH',
    headers: auth,
    body: JSON.stringify({ release: { name: relName, rulesetName: created.name } }),
  });
  const patched = (await patchRes.json()) as { error?: unknown };
  if (!patchRes.ok) {
    console.error('✗ updateRelease failed:', JSON.stringify(patched));
    process.exit(1);
  }
  console.log('✔ Published. cloud.firestore now points at the new ruleset.');
  process.exit(0);
}

main().catch((e) => {
  console.error('✗ Failed:', e instanceof Error ? e.message : e);
  process.exit(1);
});
