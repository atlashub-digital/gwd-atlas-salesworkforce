# Governance

Status: **Active baseline**

## 1. Canonical information hierarchy

### GitHub — source of truth
GitHub is canonical for:

- architecture;
- ADRs;
- API/event contracts;
- migrations;
- source code;
- tests;
- CI evidence;
- release instructions;
- deployment manifests;
- operational runbooks that affect runtime behavior.

### Notion — operating layer
Notion is used for:

- project status;
- task coordination;
- meeting records;
- decisions requiring executive visibility;
- links to GitHub evidence;
- portfolio/gate tracking.

If Notion and GitHub disagree on a technical fact, GitHub wins unless a new approved change is committed.

### GitBook
GitBook is no longer canonical for this project. Existing material may be retained as historical reference, but decisions must be migrated into GitHub before being relied upon.

## 2. Repositories

- GWD: `atlashub-digital/gwd-atlas-salesworkforce`
- Novidades main commerce surface: `atlashub-digital/novidades-platform`
- Novidades digital products: `atlashub-digital/novidades-digital`

The AtlasHub-owned forks are the working repositories for future execution so collaborator authorization can be managed consistently.

## 3. Change policy

An architecture-impacting change must include:

1. an ADR or ADR amendment;
2. affected contract/schema updates;
3. implementation changes;
4. tests or explicit validation plan;
5. PR review;
6. deployment gate if runtime behavior changes.

Do not bury architectural decisions only in chat, Notion comments or deployment consoles.

## 4. Gate model

### G0 — Baseline
Boundaries, repositories, domains and source-of-truth rules recorded.

### G1 — Audit
Legacy code, secrets, data dependencies and direct provider integrations classified.

### G2 — Foundation
GWD auth/profile/referral/campaign primitives and target database schema implemented.

### G3 — Integration
Novidades → ARO → GWD contract implemented with signed/idempotent events.

### G4 — Preview validation
CI, migration validation, browser/E2E, security and observability checks pass.

### G5 — Production cutover
Explicit operational GO for DNS/deployment. Real-payment tests are separately controlled.

### G6 — Scale
Academy, advanced gamification, teams, Sales Copilot, automation and payout automation may expand after the commercial spine is proven.

## 5. Production protections

Without explicit GO, contributors must not:

- switch `novidades.store` DNS to a new deployment;
- activate `goworld.digital` production runtime;
- activate a public `xpay.expert` payment route;
- perform a real payment;
- provision production provider secrets into Novidades/GWD;
- merge code that bypasses ARO for the target payment path.

## 6. Evidence rules

“Ready” requires evidence, not intention.

Acceptable evidence includes:

- commit SHA;
- PR;
- CI run;
- migration checksum;
- test results;
- preview URL;
- signed-event replay test;
- controlled E2E transaction evidence where authorized.

A Notion status alone is not implementation evidence.

## 7. Operational identifiers

Workstreams use stable prefixes:

- `NOV-` — Novidades.Store.
- `GWD-` — GoWorld.Digital.
- `ARO-INT-` — cross-system ARO integration.
- `OPS-` — infrastructure/domain/release operations.

These identifiers should appear in GitHub Issues, PR titles and relevant commits.
