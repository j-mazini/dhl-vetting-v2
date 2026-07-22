# DVLA Driving Licence Validation — Integration Options & Recommendation

**Task:** Vetting 2.0 — TASK 05 (Investigate DVLA API / Integration)
**Status:** Research complete — recommendation below
**Date:** 2026-06-24

---

## Question

Is there an official or reliable API/integration to validate a candidate's UK
driving licence during vetting, and what should our process use?

## Short answer

There is **no official, real-time, self-serve DVLA API that an employer can call
to validate an arbitrary driving licence on demand.** The supported, government-
backed route for employers is the **candidate-generated Share Code**, checked
manually at the DVLA "Check someone's driving licence information" service.
Automated/bulk access exists only through **authorised commercial resellers** under
contract.

**Recommendation:** keep the current **Share Code + manual check** flow (already
implemented). Treat a paid reseller integration as a future enhancement, gated on
volume.

---

## Options evaluated

### 1. Manual Share Code check (current approach) — RECOMMENDED

- Candidate generates a one-time **Check Code** at
  [gov.uk/view-driving-licence](https://www.gov.uk/view-driving-licence).
- Vetting officer enters the code + the driver's licence number + NI number at
  [gov.uk/check-driving-information](https://www.gov.uk/check-driving-information)
  ("Check someone else's driving licence information").
- Returns: licence validity, categories, endorsements/points, disqualifications.

**Pros:** free, official, GDPR-clean (driver consents by generating the code), no
contract. Already wired into the app — the apply form collects the DVLA Share Code
and the admin checklist links to the DVLA check service.

**Cons:** manual step; the Check Code **expires after 21 days** and is single-use,
so it must be checked promptly; not automatable.

### 2. DVLA Access to Driver Data (ADD) via authorised resellers

- DVLA does **not** sell direct API access to employers. Real-time/bulk electronic
  access to driver data is provided through DVLA-authorised intermediaries
  (e.g. **GB Group / GBG**, **Descartes**, **Licence Check / DAVIS**, **Driver Hub**).
- These wrap DVLA's Electronic Driver Entitlement Checking Service (EDECS) and
  return structured licence data via API.

**Pros:** automatable, structured response, supports periodic re-checking.

**Cons:** requires a **commercial contract + per-check fee**, onboarding/KYB,
documented **driver consent** (mandate) retained for audit, and a data-processing
agreement. Overkill at low volume.

### 3. Generic identity/background providers (Onfido, GBG, etc.)

- Some KYC vendors bundle a licence-check product on top of option 2.

**Pros:** one vendor for ID + RTW + licence.
**Cons:** highest cost; only worthwhile if consolidating multiple checks.

---

## Recommended process

1. **Now (no change):** continue collecting the **DVLA Share Code** on the apply
   form and perform the manual check at gov.uk during vetting. Record the outcome
   in the DVLA section of the checklist (`Licence status`, categories, points).
2. **Operational guardrail:** because the Share Code expires in **21 days**, check
   it (or request a fresh code) early in the vetting window. Surface a reminder if
   the code is stale.
3. **Future enhancement (volume-gated):** if manual checks become a bottleneck,
   procure an **authorised reseller API** (option 2) and automate the DVLA section.

### If we adopt a reseller API later — technical requirements

- Authorised-reseller contract + DPA; KYB onboarding.
- Stored, auditable **driver consent/mandate** before each check.
- Server-side integration only (API keys never in the browser); call from a
  backend endpoint, not the client.
- Map the reseller response into the existing `dvla` document fields
  (`type`, `number`, `expirationDate`, `shareCode`, `country`) and the checklist
  `dvla_doc` / `Licence status` options already defined in
  `src/app/admin/checklist/data/checklist.ts`.
- Handle expiry/points logic to drive the existing pass/flag/reject outcomes.

---

## References

- Check someone's driving licence: https://www.gov.uk/check-driving-information
- View/share your own licence: https://www.gov.uk/view-driving-licence
- DVLA Access to Driver Data (ADD): https://www.gov.uk/government/collections/access-to-driver-data
