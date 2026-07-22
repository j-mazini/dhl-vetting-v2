# 🐙 Session Intent Contract — Vetting Pipeline (8-Epic Backlog)

**Created:** 2026-06-29
**Protocol:** BA Express Driver Vetting v2.0 / DHL Master Vetting v3.0
**Plan:** `.claude/session-plan.md`
**Supersedes:** the 2026-06-16 "Vetting 2.0 System Architecture" intent (tech stack now settled: Next.js + NestJS + Firestore).

---

## Job Statement
Build the full BA Express / DHL driver **vetting pipeline module** — the `VettingCase`
data model, the case state machine, the non-waivable auto-reject gates, the employer
reference workflow + SLAs, risk assessment, the DHL documentation pack, and handoff —
sequenced across the existing `front-logix-sphere` (Next.js) + NestJS backend + Firestore
stack, reusing the existing CDR audit-log infrastructure.

## Success Criteria
1. **Clear sequenced roadmap** — every epic (A–G, X) ordered with dependencies and P0/P1/P2 phasing.
2. **Fits existing architecture** — reconciles with the current Firestore drivers model
   (`personalInfo`/`rtw`/`dvla`), the CDR per-field audit log, and the Vetting 2.0 checklist.
3. **Compliance-safe** — GDPR retention + purge, immutable audit trail, and the
   non-waivable auto-reject + Golden Rule gates are provably correct.
4. **Ready to execute** — detailed enough to hand to `/octo:embrace` or build epic-by-epic.

## Boundaries
- **Must fit architecture:** no greenfield rewrite; extend the existing Firestore + NestJS + Next.js system.
- **High stakes:** compliance/legal risk (ICO/GDPR, DHL Golden Rule) if gates are wrong → favor validation + a design debate gate.
- **Time pressure:** deliver a usable plan fast; phase work so the compliance spine ships first.
- **Solo / small team:** sequence for one builder; avoid parallel-team assumptions.

## Context (from intent questions)
- **Goal:** Build something
- **Scope:** Full backlog, sequenced (all 8 epics)
- **Knowledge:** Expert on domain (spec is author-grade)
- **Clarity:** Fully specified
- **Constraints:** Must fit architecture · High stakes · Time pressure · Solo/small team

## Routing
`/octo:auto` → MEDIUM confidence (build, broad target across 8 epics) → user chose **Plan** → `/octo:plan`.
