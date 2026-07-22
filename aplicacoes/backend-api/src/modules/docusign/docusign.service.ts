import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createSign } from 'crypto';
import * as admin from 'firebase-admin';
import { getFirebaseApp } from '../../shared/firebase-admin';

/**
 * DocuSign integration for the BA Express / Driver Application Form.
 *
 * Flow (email / remote signing):
 *   1. createEnvelopeForDriver() — JWT auth → create an envelope from the
 *      template, with the candidate as an email recipient → DocuSign emails
 *      them the form. We store the envelopeId and mark signature.status = SENT.
 *   2. handleConnectWebhook() — DocuSign Connect calls us when the envelope is
 *      completed → we mark signature.status = SIGNED (the authoritative result)
 *      and, optionally, archive the signed PDF.
 *
 * ⚠️ Items that still need to be VERIFIED before this works end-to-end are
 * marked with `TODO(verify:...)`. Until DOCUSIGN_* env vars are set the service
 * stays inert and the controller returns 503 — the candidate's application is
 * still saved, it just isn't sent for signature automatically yet.
 */
@Injectable()
export class DocuSignService {
  private readonly logger = new Logger(DocuSignService.name);

  constructor(private readonly config: ConfigService) {}

  // ── configuration ──────────────────────────────────────────────────────────

  private cfg(key: string): string | undefined {
    return this.config.get<string>(key);
  }

  /** True once the minimum DocuSign credentials are present. */
  isConfigured(): boolean {
    return Boolean(
      this.cfg('DOCUSIGN_INTEGRATION_KEY') &&
        this.cfg('DOCUSIGN_USER_ID') &&
        this.cfg('DOCUSIGN_PRIVATE_KEY') &&
        this.cfg('DOCUSIGN_ACCOUNT_ID') &&
        this.cfg('DOCUSIGN_TEMPLATE_ID'),
    );
  }

  private assertConfigured(): void {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(
        'DocuSign is not configured yet. Set the DOCUSIGN_* environment variables.',
      );
    }
  }

  // ── public API ───────────────────────────────────────────────────────────────

  /**
   * Create the envelope and email it to the candidate for signature.
   * Returns the DocuSign envelopeId.
   */
  async createEnvelopeForDriver(params: {
    driverId: string;
    signerName: string;
    signerEmail: string;
    declarationVersion: string;
  }): Promise<{ envelopeId: string; status: string }> {
    this.assertConfigured();

    const accessToken = await this.getAccessToken();
    const basePath = this.cfg('DOCUSIGN_BASE_PATH'); // e.g. https://demo.docusign.net/restapi
    const accountId = this.cfg('DOCUSIGN_ACCOUNT_ID');
    const templateId = this.cfg('DOCUSIGN_TEMPLATE_ID');

    // TODO(verify:template-role): confirm the recipient role name configured on
    // the DocuSign template (the "Role" field on the template's recipient).
    const roleName = this.cfg('DOCUSIGN_TEMPLATE_ROLE') ?? 'Driver';

    // TODO(verify:prefill-tabs): map prefilled fields onto the template tabs.
    // The tab `tabLabel`s below must match the labels set on the template.
    // The candidate's other details (address, postcode, NIN…) should be read
    // from Firestore here and added as textTabs once the labels are confirmed.
    const envelopeDefinition = {
      templateId,
      status: 'sent', // 'sent' = email immediately; 'created' = draft
      emailSubject: 'Please sign your BA Express Driver Application Form',
      templateRoles: [
        {
          email: params.signerEmail,
          name: params.signerName,
          roleName,
          // tabs: { textTabs: [{ tabLabel: 'NIN', value: '...' }, ...] },
        },
      ],
      // Ties the envelope back to our record for the webhook + auditing.
      customFields: {
        textCustomFields: [
          { name: 'driverId', value: params.driverId, show: 'false' },
          {
            name: 'declarationVersion',
            value: params.declarationVersion,
            show: 'false',
          },
        ],
      },
    };

    const res = await fetch(
      `${basePath}/v2.1/accounts/${accountId}/envelopes`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(envelopeDefinition),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      this.logger.error(`DocuSign envelope creation failed: ${res.status} ${body}`);
      throw new ServiceUnavailableException('Could not create the signature envelope.');
    }

    const data = (await res.json()) as { envelopeId: string; status: string };

    await this.updateDriverSignature(params.driverId, {
      'signature.status': 'SENT',
      'signature.envelopeId': data.envelopeId,
      'signature.requestedAt': new Date().toISOString(),
    });

    this.logger.log(
      `Envelope ${data.envelopeId} sent to ${params.signerEmail} for driver ${params.driverId}`,
    );
    return { envelopeId: data.envelopeId, status: data.status };
  }

  /**
   * DocuSign Connect webhook. This is the authoritative source of the signed
   * status — never trust a browser redirect for completion.
   *
   * TODO(verify:connect-payload): confirm the Connect message format you
   * configure (JSON "Aggregate"/"SIM" payload). The parsing below assumes a
   * JSON payload exposing envelopeId, status and the driverId custom field.
   * TODO(verify:hmac): enable + verify the Connect HMAC signature header.
   */
  async handleConnectWebhook(payload: any): Promise<void> {
    const envelope = payload?.data?.envelopeSummary ?? payload?.envelopeSummary ?? payload;
    const envelopeId: string | undefined =
      payload?.data?.envelopeId ?? envelope?.envelopeId;
    const status: string | undefined = envelope?.status ?? payload?.event;

    const driverId =
      this.extractCustomField(envelope, 'driverId') ??
      payload?.data?.driverId;

    if (!driverId) {
      this.logger.warn(`Connect webhook without a driverId (envelope ${envelopeId}); ignoring.`);
      return;
    }

    const normalized = (status ?? '').toLowerCase();
    if (normalized === 'completed' || normalized === 'envelope-completed') {
      await this.updateDriverSignature(driverId, {
        'signature.status': 'SIGNED',
        'signature.completedAt': new Date().toISOString(),
        // TODO(verify:next-state): set the workflow state that should follow a
        // signed application form (e.g. 'PRE_REGISTERED' or 'PRE_SCREENING').
        currentStatus: 'SIGNED',
      });
      this.logger.log(`Driver ${driverId} application form SIGNED (envelope ${envelopeId}).`);

      // TODO(optional): fetch the signed PDF and archive it.
      // await this.archiveSignedDocument(driverId, envelopeId, accountId);
    } else if (['declined', 'voided'].includes(normalized)) {
      await this.updateDriverSignature(driverId, {
        'signature.status': normalized.toUpperCase(),
      });
      this.logger.warn(`Envelope ${envelopeId} for driver ${driverId} was ${normalized}.`);
    }
  }

  // ── DocuSign JWT (server-to-server) ──────────────────────────────────────────

  /**
   * JWT Grant access token. Requires one-time admin consent for the integration
   * key + impersonated user with scopes `signature impersonation`.
   */
  private async getAccessToken(): Promise<string> {
    // demo: account-d.docusign.com — prod: account.docusign.com
    const oauthBase = this.cfg('DOCUSIGN_OAUTH_BASE') ?? 'account-d.docusign.com';
    const integrationKey = this.cfg('DOCUSIGN_INTEGRATION_KEY')!;
    const userId = this.cfg('DOCUSIGN_USER_ID')!;
    const privateKey = this.normalizeKey(this.cfg('DOCUSIGN_PRIVATE_KEY')!);

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const claims = {
      iss: integrationKey,
      sub: userId,
      aud: oauthBase,
      iat: now,
      exp: now + 3600,
      scope: 'signature impersonation',
    };

    const unsigned = `${this.b64url(JSON.stringify(header))}.${this.b64url(
      JSON.stringify(claims),
    )}`;
    const signer = createSign('RSA-SHA256');
    signer.update(unsigned);
    const signature = signer.sign(privateKey).toString('base64url');
    const assertion = `${unsigned}.${signature}`;

    const res = await fetch(`https://${oauthBase}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      // A 'consent_required' here means an admin must grant consent once via
      // the DocuSign consent URL. See the setup checklist.
      this.logger.error(`DocuSign JWT grant failed: ${res.status} ${body}`);
      throw new ServiceUnavailableException('DocuSign authentication failed.');
    }

    const data = (await res.json()) as { access_token: string };
    return data.access_token;
  }

  // ── Firestore ───────────────────────────────────────────────────────────────

  private getDb(): admin.firestore.Firestore {
    return getFirebaseApp().firestore();
  }

  private async updateDriverSignature(
    driverId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    await this.getDb()
      .collection('drivers')
      .doc(driverId)
      .set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
  }

  // ── helpers ───────────────────────────────────────────────────────────────

  private b64url(value: string): string {
    return Buffer.from(value).toString('base64url');
  }

  /** Allow the private key to be supplied with literal "\n" in env files. */
  private normalizeKey(key: string): string {
    return key.includes('\\n') ? key.replace(/\\n/g, '\n') : key;
  }

  private extractCustomField(envelope: any, name: string): string | undefined {
    const fields = envelope?.customFields?.textCustomFields ?? [];
    return fields.find((f: any) => f?.name === name)?.value;
  }
}
