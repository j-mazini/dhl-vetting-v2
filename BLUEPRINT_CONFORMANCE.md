# System Steps — Conformance to Strategic Blueprint v2

**Purpose:** Register how the implemented vetting pipeline maps to the authoritative
process documented in `projetos/ba-express-dos-prototipo/docs/BA_Express_Strategic_Blueprint_v2.html`
(flowchart "Target architecture — the upgraded pipeline" + Central Driver Record model).
This is a **read-only verification** — no code or wording was changed. It exists so the
next steps are defined up front and discovery time is not repeated.

- **Source of truth:** Strategic Blueprint v2.0 (7 May 2026), flowchart `flowchart TD`.
- **System verified:** `aplicacoes/ba-express-vetting` — `checklist.ts` (admin steps),
  `app/vetting/dashboard/page.tsx` (`PROCESS`), `app/admin/vetting/data/candidates.ts`
  (`STAGES` / `STATUS_TO_STAGE`), `components/vetting/PreRegistrationForm.tsx`,
  `modules/central-driver-record/model.ts` (CDR).
- **Legend:** ✅ Conforms · 🟡 Partial (present but not to the Blueprint's full spec) · ❌ Missing.

---

## 1. Pipeline conformance matrix

| # | Blueprint node (SLA) | Implemented as | Status |
|---|----------------------|----------------|--------|
| 1 | **Apply** — online multi-step form, *save & resume* (same day) | `PreRegistrationForm` (sectioned single page) | 🟡 Form exists; no multi-step progress bar / save-&-resume |
| 2 | **CDR** — single source of truth, *audit log on every field* | `drivers` Firestore doc + `mapDriverDoc` (CDR) | 🟡 Single record ✅; per-field audit log ❌ (only `updatedAt`) |
| 3 | **Self-service status tracker** — auto-emails & SMS | Candidate dashboard `PROCESS` timeline | 🟡 Status visible ✅; automated email/SMS ❌ |
| 4 | **Pre-screen rules** (< 1 hour) | `Pre-screen` step (5-agent pipeline) | 🟡 Outcomes match; admin-led, not <1h automated |
| 4a | — No RTW → auto-reject + explain | Hard Reject outcome + rejection flow | ✅ |
| 4b | — Age <25 / exp <1yr → Insurance Exception (24h) | `prescreenFlags.insuranceExceptionRequired` + `ON_HOLD` | 🟡 Flag ✅; broker-quote workflow ❌ |
| 4c | — All clear → Interview booked | All Clear outcome | ✅ |
| 5 | **Interview booked** — auto-calendar invite (48h) | — | ❌ No discrete booking step / calendar invite |
| 6 | **Interview** + abilities/aptitude notes (same day) | `Interview` step + `InterviewWorkspace` | ✅ |
| 7 | **Director Suitability Declaration** | Dashboard `Suitability` step + `suitability` field + checklist "Declaration of Suitability" | ✅ |
| 8 | **Document request** — auto-email w/ upload links | `Documents` step + `DocumentSubmissionForm` (mailto) | 🟡 Manual/mailto, not automated server email |
| 9 | **Driver uploads** via self-service portal (72h) | Dashboard document submission | ✅ (SLA documented) |
| 10 | **Automated checks** — Onfido/Yoti ID+liveness, RTW share-code, DVLA share-code, sanctions | Pre-screen "agents" reference these as **manual** checks | ❌ No live API automation (Blueprint Level 3) |
| 11 | **Vetting Officer review** — UK/intl CRC, references, 5-yr history (5 days) | `Vetting checks` step | ✅ |
| 12 | **Checks pass? gap > 28 days?** | Vetting checks decision logic | ✅ |
| 13 | **VRA** — Vetting Risk Assessment | `VRA_REQUIRED` / `VRA_APPROVED` statuses + step | ✅ |
| 14 | **Client allocation** — fit-scoring, multi-client | — (DHL hardcoded) | ❌ No multi-client module / fit-scoring |
| 15 | **DHL Vetting Form** auto-populated + APHIDS (same day) | `DHL submission` step + artefact generation | 🟡 Step ✅; 35-field auto-populate partial |
| 16 | **DHL approval?** Pending → Hold, auto-chase D+3 | `DHL_SUBMITTED`/`DHL_APPROVED` + `ON_HOLD` | 🟡 States ✅; auto-chase D+3 ❌ |
| 17 | **Van hire + handover** — e-signed contract + deductions (48h) | `Van hire` step | 🟡 Step ✅; e-signature ❌ |
| 18 | **Training + induction** — online portal, route familiarisation (3 days) | `Training` step | ✅ |
| 19 | **Driver Portal go-live** — schedule, payslips, SOPs, comms | Candidate dashboard (portal) | 🟡 Portal exists; payslips/schedule/SOPs ❌ |
| 20 | **Active driver** — first route assigned | `APPROVED` / `ACTIVE` | ✅ |
| 21 | **Lifecycle loop** — DVLA annual, CRC 3yr, RTW expiry, incident re-vet | `Lifecycle loop` step (content) | 🟡 Documented in step; automated calendar ❌ |
| 22 | **Analytics layer** — funnel, time-to-active, drop-offs | Admin vetting dashboard (stages, SLA breach) | 🟡 Stage view ✅; full funnel analytics ❌ |
| 23 | **CDR feeds Payroll record** | — | ❌ Not implemented |

**Backbone verdict:** the **sequential spine conforms** — Apply → CDR → Pre-screen →
Interview → Suitability → Documents → Vetting/VRA → DHL → Van hire → Training → Active →
Lifecycle. Divergences are concentrated in **automation, multi-client, and the analytics/
payroll/portal richness** (Blueprint Level 3+), not in the step order.

## 2. Central Driver Record (CDR) — data-model conformance

Blueprint CDR blocks vs. `model.ts` / `drivers` doc:

| CDR block (Blueprint) | In system | Status |
|-----------------------|-----------|--------|
| Personal & Contact | `personalInfo` | ✅ |
| Licence & Driving (categories, points, convictions, experience) | `dvla` (number/type/expiry/country/shareCode/years) | 🟡 categories/points/convictions not structured |
| Eligibility (RTW + share code, age, exception flags) | `rtw` + `prescreenFlags` | ✅ |
| 5-year History (employment, gaps, references) | checklist `Vetting checks` docs | 🟡 captured in checklist, not a structured CDR sub-object |
| Vetting Results (ID, sanctions, DVLA, CRC, intl CRC, VRA) | checklist docs + statuses | 🟡 partial / not consolidated |
| Client Allocation (DHL APHIDS ref; future Amazon/FedEx/UPS) | — | ❌ |
| Operational (van reg, insurance, fuel card, deductions) | — | ❌ |
| Training & Compliance (induction, H&S, GDPR, renewal calendar) | `Training`/`Lifecycle` steps | 🟡 |
| Audit Log (every field change, who/when/why) | `updatedAt` only | ❌ |

## 3. Known document-vs-document conflicts (flagged, not resolved)

1. **CRC re-vetting interval:** Blueprint v2 says **every 3 years**; Master Vetting
   Protocol v3.0 says **2.5 years** (internal BA Express audit rule). The system's
   Lifecycle step should follow one — **decision pending** (Master v3.0 is the stricter,
   later authority).
2. **Reject email justification:** Process Protocol v2.0 §2A asks for a clear justification;
   the implemented candidate email is generic (compliance decision, TASK 11). Reconcilable
   if "justification" = generic professional wording. **Confirm intent.**
3. **"Other" driving licence:** Protocol v2.0 lists `British / EU / Other`; system removed
   "Other" (TASK 07). System is the newer decision; **docs are stale.**

## 4. Defined next-steps backlog (so time is not re-spent)

Prioritised against the Blueprint's own maturity model (Level 2 → Level 3).

**P0 — close Level-2 gaps (the Blueprint's 90-day target):**
- [ ] Interview booking step with auto-calendar invite (node 5).
- [ ] CDR per-field **audit log** (who/when/why) — required for DHL/CAA audit pack (node 2 / CDR block 9).
- [ ] Server-side automated candidate emails: submission confirmation, document request, decision (nodes 3, 8, 16).
- [ ] Multi-step apply form with save-&-resume + progress bar (node 1).

**P1 — Level-3 automation:**
- [ ] Automated checks lane: RTW share-code, DVLA share-code, Onfido/Yoti ID, sanctions (node 10) — see `DVLA_INTEGRATION.md` for the DVLA path.
- [ ] Auto-chase DHL at D+3 while `ON_HOLD` (node 16).
- [ ] Renewal/expiry calendar driving the Lifecycle loop (node 21) — DVLA annual, CRC interval, RTW expiry.
- [ ] GDPR auto-purge of rejected candidates at 6 months (both protocols).

**P2 — scale & richness:**
- [ ] Client-allocation module + fit-scoring; Amazon/FedEx/UPS output branches (node 14).
- [ ] Payroll record feed from CDR (node 23).
- [ ] Analytics funnel (applications → active, time-to-active, drop-offs) (node 22).
- [ ] Driver portal: schedule, payslips, SOPs, vehicle status (node 19).

**Consistency fixes (cheap, no new infra):**
- [ ] Resolve CRC interval (2.5 vs 3 years) and align Lifecycle step.
- [ ] Decide reject-email justification wording (generic vs reasoned).
- [ ] Reconcile candidate-dashboard "Suitability" milestone with admin checklist (admin has it inside Interview, not as a discrete step).

---

*Generated as a verification record. No system code or wording was modified.*
