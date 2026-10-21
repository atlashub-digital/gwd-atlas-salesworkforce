# Roadmap & Gates

This roadmap prioritizes a working attributed-sale spine over broad feature construction.

## Phase 0 — Governance baseline

Deliverables:

- repository ownership fixed;
- GitHub-first source-of-truth policy;
- bounded contexts documented;
- ADR baseline;
- Notion project linked for coordination.

Exit condition: baseline PR reviewed and merged.

## Phase 1 — NOV-001: Novidades audit

Audit both:

- `atlashub-digital/novidades-platform`
- `atlashub-digital/novidades-digital`

Classify each relevant component as:

- KEEP;
- MIGRATE;
- REMOVE;
- UNKNOWN / needs evidence.

Mandatory audit surfaces:

- direct XPAYMENTS calls;
- checkout routes;
- webhooks/payment polling;
- entitlement/delivery;
- Supabase project/schema assumptions;
- Prisma migrations;
- environment variables/secrets;
- product/offer registries;
- attribution support;
- domains and redirects;
- CI/build state.

Exit condition: target architecture delta is explicit and no payment path is ambiguous.

## Phase 2 — GWD-001: Foundation

P0 functional scope:

- auth/profile;
- `AFFILIATE` and `SELLER` capabilities;
- campaign/offer catalog;
- referral links/codes;
- seller offer basics;
- attribution records;
- ARO-approved order ingestion skeleton;
- commission/margin accrual ledger;
- basic dashboard;
- basic points/leaderboard;
- training library skeleton.

Do not build advanced Academy/gamification first.

Exit condition: a seeded participant can generate a referral and the system can deterministically resolve who should receive an accrual for a synthetic approved order.

## Phase 3 — ARO-INT-001: Real integration

- Novidades checkout goes through ARO.
- Attribution is carried to ARO.
- ARO sends signed/idempotent approved/reversal events to GWD.
- GWD creates/reverses accrual exactly once.

Exit condition: automated integration tests plus controlled non-production E2E.

## Phase 4 — Preview / hardening

- migrations validated;
- CI green;
- auth/RLS review;
- browser/mobile review;
- observability;
- webhook replay tests;
- failure-mode tests;
- backup/rollback procedure.

Exit condition: READY FOR CONTROLLED PROD CUTOVER decision.

## Phase 5 — Domain cutover

Only after explicit operational GO:

- move `novidades.store` from old Vercel/domain binding to approved deployment;
- activate `goworld.digital` when GWD preview passes;
- define/activate `xpay.expert` only for its approved production role.

Real payment tests require a separate explicit gate.

## Phase 6 — Expansion

After the spine proves reliable:

- Academy;
- certification;
- teams/hierarchies;
- advanced gamification;
- Sales Copilot;
- CRM features;
- automations;
- payout automation/provider split when economics, KYC/KYB, refunds and chargebacks are mature.
