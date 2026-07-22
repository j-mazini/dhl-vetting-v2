# DocuSign — BA Application Form e-signature (email/remote)

When a candidate submits the apply form, the record is saved as
`PENDING_SIGNATURE` and the BA Express / Driver Application Form is emailed to
them via DocuSign for electronic signature. The signed result is confirmed by a
DocuSign Connect webhook (not by the browser).

## Flow

```
Apply form (front)
  └─ writes drivers/{id}  currentStatus: PENDING_SIGNATURE, signature.status: PENDING
  └─ POST /api/v1/applications/{id}/signature-request
        └─ DocuSignService.createEnvelopeForDriver()
              JWT auth → create envelope from template (email recipient) → status SENT
DocuSign emails candidate → candidate signs
DocuSign Connect → POST /api/v1/docusign/connect
        └─ DocuSignService.handleConnectWebhook() → signature.status SIGNED
```

## Status model (Firestore drivers/{id})

```
currentStatus: PENDING_SIGNATURE → SIGNED
signature: { provider, method, status: PENDING|SENT|SIGNED|DECLINED|VOIDED,
             envelopeId, signedPdfPath, signerName, signerEmail,
             requestedAt, completedAt }
```

## ✅ To verify / finish before go-live

Search the code for `TODO(verify:...)`.

1. **DocuSign account** — sandbox (developer) first. Get Integration Key (GUID),
   API Account ID, and the impersonated User ID. Set the `DOCUSIGN_*` env vars
   (see `.env.example`).
2. **One-time admin consent** — grant the integration key the
   `signature impersonation` scopes once, or JWT grant returns
   `consent_required`.
3. **RSA keypair** — generate in DocuSign admin; put the private key in
   `DOCUSIGN_PRIVATE_KEY` (literal `\n` allowed on one line).
4. **Template** — upload `ba-express-vetting/public/documents/BA_Express_Application_Form.pdf`
   as a DocuSign template. Confirm:
   - the recipient **role name** → `DOCUSIGN_TEMPLATE_ROLE` (default `Driver`);
   - the **prefill/text tab labels** to map address/postcode/NIN/etc.
     (`createEnvelopeForDriver` → `templateRoles[].tabs.textTabs`);
   - SignHere/Date tabs are placed on the signature block.
   Paste the template id into `DOCUSIGN_TEMPLATE_ID`.
5. **Connect webhook** — point DocuSign Connect at
   `{public-host}/api/v1/docusign/connect`. Confirm the payload format the
   parser expects, and enable + verify the **HMAC** signature header.
6. **Next workflow state** — decide what `currentStatus` follows a signed form
   (`handleConnectWebhook`, `TODO(verify:next-state)`; currently `SIGNED`).
7. **Endpoint protection** — the signature-request endpoint is public (called
   from the apply page). Add throttling / shared secret / App Check before prod.
8. **Signed PDF archival** (optional) — implement `archiveSignedDocument` to pull
   the completed PDF into Firebase/GCS Storage and set `signature.signedPdfPath`.
9. **Firebase Admin creds** — `FIREBASE_SERVICE_ACCOUNT_JSON` (or ADC) so the
   webhook can write back to Firestore.

## Notes

- The frontend signature request is **best-effort**: if the backend/DocuSign is
  down, the application is still saved as `PENDING_SIGNATURE` and an operator can
  re-trigger the envelope. No submission is lost.
- The backend already sets the global prefix `api/v1` (matches the frontend
  `NEXT_PUBLIC_API_URL`).
