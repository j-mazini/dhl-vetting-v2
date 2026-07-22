# 🐙 Session Plan — Vetting Pipeline (8-Epic Backlog)

**Created:** 2026-06-29
**Intent Contract:** `.claude/session-intent.md`
**Protocol:** BA Express Driver Vetting v2.0 / DHL Master Vetting v3.0
**Supersedes:** the 2026-06-16 architecture plan (stack now settled: Next.js `front-logix-sphere` + NestJS + Firestore).

---

## What You'll End Up With
A **sequenced, dependency-ordered build roadmap** for the vetting pipeline — `VettingCase`
model + state machine + non-waivable gates + reference workflow + risk assessment + DHL
doc-pack/handoff — phased P0→P2 so the **compliance spine ships first**, reusing the
existing Firestore drivers model and CDR audit log.

---

## Architecture-Fit Decisions (resolve in Define before building)
These are the load-bearing choices; everything downstream depends on them.

1. **Where does `VettingCase` live?** — Recommended: a **`vettingCase` sub-object on the
   existing Firestore `drivers/{id}` document**, not a separate top-level collection. Reuses
   the central driver record, the existing security rules, and the CDR audit instrumentation.
   *Trade-off:* document-size growth & query patterns. Alternative: `vettingCases/{caseId}`
   collection keyed by `candidate_id` if cases need independent lifecycle/history.
2. **State machine engine** — central guarded-transition module (single source of truth for
   `CaseStatus`), invoked by both frontend and a NestJS service. Every transition writes an
   audit entry (reuse CDR audit log, obs 1819).
3. **Auto-reject as one rule engine, not scattered ifs** — implement §9 matrix as shared
   guards the state machine calls on each transition. Keeps the 8 non-waivable gates testable
   and audited in one place. **High-stakes core.**
4. **Reuse, don't rebuild:** CDR per-field audit log (X1), Vetting 2.0 14-item checklist
   (EPIC A likely partly exists), and backend email/DocuSign infra (for EPIC D chases).

> ⚠️ **Verify before building:** the codebase exploration was interrupted. First task of
> Develop is to confirm the current Firestore drivers schema, the CDR audit module API, and
> how much of EPIC A's checklist already exists in `front-logix-sphere`.

---

## Dependency Graph
```
            ┌─────────────────────────────────────────────┐
P0 FOUNDATION│ Data model + enums  ·  State machine engine  │
            │ Auto-reject rule engine (§9)  ·  X1 audit     │
            └─────────────────────────────────────────────┘
                                │ everything depends on this
        ┌───────────────┬───────┴────────┬──────────────┐
   A4 intake gate ──> B DBS gate ──> C timeline/gap ──> (signals)
        │                                  │                │
   A2/A3 checklist                    D refs workflow ──────┤
        │                                  │                │
        └──────────────> E Risk Assessment <────(B minor / C gap / D neg / DVLA)
                                   │
                          F DHL doc pack (needs all 14 = COMPLIANT + APPROVED)
                                   │
                          G DHL handoff + Golden Rule
   X (audit/GDPR) = transversal, instrument every transition as you build
```

---

## Phasing (sequenced for solo build, compliance-first)

### P0 — Compliance Spine (build first; legal core)
| Order | Work | Epics | Why first |
|---|---|---|---|
| 1 | `VettingCase` model + enums in Firestore; reconcile with drivers doc | §0 | Foundation for all |
| 2 | State machine engine (guarded transitions) | §1 | Controls every status change |
| 3 | Auto-reject rule engine (shared guards) | §9 | Non-waivable; highest legal risk |
| 4 | X1 immutable audit trail (reuse CDR log) on every transition | X1 | Compliance + traceability |
| 5 | **EPIC B** — DBS gate (B1–B5: source/hard-copy/10-week window/decision) | B | Single highest-stakes gate |
| 6 | **EPIC C** — gap engine + C4/C5/C6 gates (5-yr timeline, abroad CRC, cross-check) | C | Drives REJECTED auto-stops |
| 7 | **A4** intake gate (Identity+RTW+Licence COMPLIANT → DBS_CHECK) | A | Entry guard into B |

### P1 — Operational Workflow
| Order | Work | Epics |
|---|---|---|
| 8 | **EPIC A** full — A1 reference dates, A2 14-item checklist (extend existing), A3 counter | A |
| 9 | **EPIC D** — `EmployerReference` entity, D1 state machine, D2 days-counter, D3 SLA chase (reuse email infra), D4 outcome, D5 aggregation→case status | D |
| 10 | **EPIC E** — `requires_vra`, VRA form, risk classification (LOW/MEDIUM/HIGH), E4 human decision w/ justification | E |

### P2 — Handoff & Lifecycle
| Order | Work | Epics |
|---|---|---|
| 11 | **EPIC F** — DHL Documentation Checklist, `physical_copies_present`, `folder_organized`, F4 consolidated PDF | F |
| 12 | **EPIC G** — `hand_to_dhl`, DHL Review Form submission, `dhl_status`, `add_driver_to_dhl` w/ **Golden Rule** guard | G |
| 13 | **X2/X3** — retention (`rejected_at + 6mo`) + automated purge job; protocol versioning on case | X |

---

## Phase Weights (for `/octo:embrace`)
Fully specified + high stakes → light discover, real define (the data-model decision),
heavy develop, substantial deliver (compliance validation).

```
DISCOVER  ████ 10%   Confirm current Firestore schema, CDR audit API, existing EPIC A checklist
DEFINE    ████████ 20%   Resolve the 4 architecture-fit decisions above; lock state-machine + rule-engine design
DEVELOP   ██████████████████ 45%   Build P0 spine → P1 → P2 in order
DELIVER   ██████████ 25%   Compliance validation: gate correctness, audit immutability, GDPR purge, security rules
```

---

## 🔸 Debate Checkpoints (high-stakes → recommended ON)
- **After Define:** "Sub-object on `drivers/{id}` vs separate `vettingCases` collection — which survives audit, query, and retention/purge needs?" → 1-round adversarial.
- **After Define:** "Is the auto-reject rule engine design provably non-waivable and fully audited?" → 1-round adversarial.
- **After Develop (P0):** "Are the B/C/A4 gates + audit trail ready to trust for live cases?" → 1-round collaborative.

---

## Provider Availability
🔴 Codex CLI:  Not installed ✗
🟡 Gemini CLI: Available ✓ — second-opinion on data-model & gate design (debate gates)
🟤 OpenCode:   Not installed ✗
🟢 Copilot:    Available ✓ — supplementary review/codegen
🔵 Claude:     Available ✓ — lead planner / implementer / synthesis

---

## Execution Commands
Full 4-phase run:
```
/octo:embrace "Build the BA Express/DHL vetting pipeline (8-epic backlog) per .claude/session-plan.md, P0 spine first"
```
Or per phase:
```
/octo:discover  # confirm Firestore schema + CDR audit API + existing EPIC A
/octo:define    # resolve the 4 architecture-fit decisions (run debate gates)
/octo:develop   # build P0 → P1 → P2 in order
/octo:deliver   # compliance validation
```
Or build one epic at a time:
```
/octo:develop "EPIC B — DBS gate (B1–B5) on the VettingCase state machine"
```

## Your Involvement
**Checkpoints** — review at the 2 Define debates and the P0 gate sign-off; semi-autonomous within each phase.

## Time Estimate
Plan: done. Build (solo): P0 spine ~1–1.5 weeks · P1 ~1.5 weeks · P2 ~1 week, gated on architecture decisions landing in Define.

---

## Next Steps
1. Review this plan + the architecture-fit decisions.
2. Run the **After-Define debates** before writing data-model code (high stakes).
3. Execute with `/octo:embrace` (or `/octo:develop "EPIC B ..."` to start the spine).
