# Diana — GWD Project Owner Handoff

Status: ACTIVE
Date: 2026-10-19
Project: GoWorld.Digital — Community-Powered Sales Workforce

## Decision

**Diana Matos is the single operational owner of GWD from this point forward.**

Canonical role:
**Product, Operations & Growth Lead / GWD Project Owner**

Diana owns:
- product direction within the approved canon;
- roadmap and sequencing;
- engineering orchestration;
- staging coordination;
- release readiness;
- cross-functional coordination with Maia, Elisa, Tomás and Helena;
- evidence consolidation;
- escalation to SERGIO_PRIMARY for product/architecture/go-live decisions.

## Runtime/tooling model

### Diana reasoning
Primary operational reasoning runtime:
- GLM 5.3 Flash

Use it for:
- continuous project context;
- planning;
- coordination;
- triage;
- summaries;
- operational decisions inside approved scope;
- handoffs;
- progress tracking.

### Diana coding
Engineering executor:
- Claude Code

Preferred model policy:
- Sonnet: default implementation, routine refactors, tests, frontend/backend work;
- Opus: architecture-sensitive changes, difficult debugging, security/auth/RLS, migration risk, large refactors or when Sonnet is insufficient.

Diana is accountable for the engineering result even when Claude Code performs the code changes.

## Helena role

Helena is **not the GWD project owner**.

Helena is the privileged Release / Infrastructure Operator and executes only scoped handoffs from Diana for:
- Vercel project configuration;
- AtlasHub VPS containers/services;
- Redis;
- Supabase runtime/migration execution after review;
- environment variables/secrets;
- DNS / Cloudflare;
- routing;
- operational logs;
- rollback;
- privileged infrastructure actions.

Helena must not independently redefine:
- product scope;
- architecture;
- visual system;
- data model;
- campaign rules;
- GWD participant model.

## Core GWD team

- Diana Matos — Project Owner / Product, Operations & Growth
- Tomás Rocha — Research & Content Intelligence
- Elisa Duarte — Learning Product & Media
- Maia Valente — Community, Seller Success & Gamification

Diana coordinates the four-agent team.

## Current engineering state

PR #7:
https://github.com/atlashub-digital/gwd-atlas-salesworkforce/pull/7

Accepted staging-review baseline:
- branch: `feat/gwd-soft-launch-v1`
- SHA: `e5c3f6118145ea94d5b41b07d1cce9b424ea9ddc`
- CI: GREEN
- VISUAL READY FOR STAGING REVIEW: YES
- PR remains DRAFT / OPEN / NOT MERGED
- no production cutover

Implemented:
- monorepo web/app/api/worker + packages;
- public web V1;
- participant app V1;
- Lead -> Auth stub -> Onboarding -> GWD Start -> Academy/Community -> Points;
- visual system V0;
- 23 routes responsive;
- API/worker bootable;
- DB schema proposal;
- staging/release checklist.

Not yet homologated:
- real Supabase Auth / OTP / SMTP;
- staging DB/RLS;
- Vercel previews;
- API/worker staging;
- real Lead -> OTP -> Participant E2E;
- community official links;
- privacy/support/retention operational settings;
- production domains.

Commercial functions remain OFF:
- real referrals;
- seller pricing;
- production ARO ingestion;
- payouts;
- provider secrets.

## Diana next mission

### Phase D1 — Audit current handoff
Before changing code:
1. read PR #7;
2. read `docs/SOFT-LAUNCH-V1.md`;
3. read `docs/VISUAL-SYSTEM-V0.md`;
4. read `docs/HELENA-V1-RELEASE-CHECKLIST.md`;
5. inspect current tree/config;
6. confirm no divergence from accepted SHA.

Output:
`DIANA BASELINE ACCEPTED: YES/NO`

### Phase D2 — Staging plan
Diana prepares one consolidated staging plan covering:
- Vercel web/app;
- API/worker VPS;
- Supabase target/schema;
- Redis;
- auth/OTP;
- environment variables;
- community URLs;
- privacy/support/retention;
- E2E;
- rollback.

Only tasks requiring privileged access are delegated to Helena.

### Phase D3 — Engineering fixes
If staging exposes code/config defects:
- Diana uses Claude Code;
- Sonnet by default;
- Opus for high-risk/complex changes;
- all changes go through the same branch/PR with CI evidence.

### Phase D4 — Staging evidence
Diana consolidates:
- web preview URL;
- app preview URL;
- API /health and /ready;
- worker boot evidence;
- migration checksum;
- auth/OTP evidence;
- RLS/account-isolation evidence;
- Lead -> Participant -> Journey E2E;
- screenshots desktop/mobile;
- blockers.

Final declaration:
`STAGING READY FOR HUMAN REVIEW: YES/NO`

### Phase D5 — Human review
SERGIO_PRIMARY reviews:
- visual;
- onboarding;
- community;
- journeys;
- opportunities;
- mobile;
- product positioning.

No production cutover before explicit GO.

## Governance

GitHub remains technical source of truth.
Notion remains operational coordination.
Drive remains canonical media/visual source.

Architecture-impacting changes require an ADR or explicit amendment.
Production activation remains a separate gate.
