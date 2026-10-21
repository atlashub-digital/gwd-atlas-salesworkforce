# GoWorld.Digital — Soft Launch V1

Community-Powered Sales Workforce Platform specialized in the digital market.

Canonical mission: [Issue #6](https://github.com/atlashub-digital/gwd-atlas-salesworkforce/issues/6),
[SOFT-LAUNCH-V1](docs/SOFT-LAUNCH-V1.md).
Engineering details: [migration and architecture](docs/SOFT-LAUNCH-V1-ENGINEERING.md),
[release checklist](docs/HELENA-V1-RELEASE-CHECKLIST.md).

| Workspace | Target | Start |
|---|---|---|
| apps/web | goworld.digital | pnpm --filter @gwd/web dev |
| apps/app | app.goworld.digital | pnpm --filter @gwd/app dev |
| apps/api | api.goworld.digital | pnpm dev:api |
| apps/worker | internal jobs | pnpm dev:worker |

Shared packages: domain, contracts, ui, db, config. Node >=22.12, pnpm 10.28.0.

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm test:integration
pnpm build
```

The complete V1 navigation exists. Lead, authenticated profile/onboarding, GWD Start, Academy, community and real points ledger are implemented.
Runtime requires reviewed staging DB/auth configuration; without it, UI shows honest unavailable states.
Sales, earnings, ranking, campaigns and toolkit are staged.
No payment provider credentials, real payments, production ARO consumer, pricing, referrals or payout.

## Existing canon
All documentation and persona/campaign data remain references.
Maia owns the V1 journey/community; Elisa owns learning.
Foundation V0 commercial contracts are retained in packages/domain/src/commercial.ts and not activated.

Boundaries: Novidades owns offers/sales surfaces; GWD owns workforce/participation; ARO owns transactional truth; AMF owns content production.
