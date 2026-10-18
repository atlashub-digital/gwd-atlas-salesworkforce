# Soft Launch V1 — Engineering migration

Source of authority: Issue #6, SOFT-LAUNCH-V1.md and HELENA-SOFT-LAUNCH-V1.md.
Baseline: b7c07f8096ad39aa111e3db1173603f2107c00e6.

## Target
- apps/web: public Next acquisition site, localhost:3000, goworld.digital.
- apps/app: member Next app and same-origin BFF, localhost:3001, app.goworld.digital.
- apps/api: Node HTTP API, localhost:8080, api.goworld.digital.
- apps/worker: internal bootable process, no commercial consumer.
- packages/domain, contracts, ui, db, config: real shared workspace packages.
- pnpm 10.28.0; Node >=22.12; Next 16.3.8; React 19.2.3.
- Next upgraded from the 16.1.1 foundation to 16.3.8; dependencies pinned and lockfile committed.

## Shell migration
1. Keep all existing docs/ and data/ files byte-for-byte.
2. Replace root src/app with the public app in apps/web/app.
3. Remove production imports and definitions of demo participant/campaign.
4. Preserve Foundation V0 commercial type definitions in packages/domain/src/commercial.ts, inactive.
5. Extract tokens/components to packages/ui; use actual workspace dependencies.
6. Build independent Next apps with a common domain/config layer.
7. Add API + Postgres and a separate worker, not a Next payment backend.
8. Keep sales, gains, campaigns, toolkit, ranking visible but staged.
9. Do not activate domains or any commercial integration.

## Operational slice
Public lead submission persists name/email/market/interest/source/UTM/consent version.
After email OTP verification, the API gets the user from Supabase Auth /user, never browser identity.
Participant creation links the latest lead matching the verified email; no lead id is trusted from the browser.
Only COMMUNITY + LEARNING capabilities are granted. Interest is not authorization.
Onboarding is persisted. GWD Start has four ordered stages, each grants 10 nonfinancial points exactly once.
Progress + points + audit are committed in the same transaction.
Academy offers three introductory texts curated for V1, with Elisa as learning owner.
Community records acceptance of rules; external-group membership is not inferred from a click.
Only server-approved links are shown. Opportunities expose only APPROVED read-model records.
No commercial campaign is seeded.

## DB proposal and security
packages/db/schema.sql is an additive review proposal, not an executed production migration.
Creates only the gwd schema/tables and a NOLOGIN gwd_api role; no changes to other product schemas.
All gwd tables have RLS. No grants to anon/authenticated. Do not expose gwd via the Data API.
Helena creates a dedicated login and grants membership in gwd_api separately.
The runtime MUST NOT use a superuser, owner or service_role connection.
Each transaction SET LOCAL ROLE gwd_api and sets the verified identity; role/claims reset on commit.
The API has no runtime privileges on commercial tables.
The schema proposal intentionally fails if previously-created tables conflict; review existing schema before applying.
Generate/version the approved migration through the operational Supabase CLI workflow.
Run advisors and repeat RLS tests on target staging. No destructive rollback; stop services/revert code.

## Auth operation
App tokens are HttpOnly + SameSite=Lax cookies, Secure in production.
Browser calls only the app BFF. Mutations require an exact same-origin Origin header.
API independently validates access tokens via Supabase Auth on every authenticated request.
OTP uses /otp + /verify type=email; new identity creation is supported.
Helena must configure both Signup and Magic Link email templates to include {{ .Token }}, SMTP/delivery, rate limits and allowed URLs.
Refresh runs in the BFF when the access cookie expires. Revoked/invalid tokens fail closed.
No production credential is needed to build the frontends.

## Gates
Implemented code does not mean SL3/SL4/SL6/SL7 are operationally approved.
Staging DB/auth + email delivery + confirmed external group URLs + live E2E are infrastructure evidence.
No production DNS, payments, ARO ingestion, seller links, pricing or payouts.
Redis is not used as source of truth. Distributed rate limiting/queues remain an infrastructure follow-up before scaled acquisition.
The API currently has bounded in-process request limiting. At the gateway enforce per-client limits for leads/auth.
Privacy contact and retention policy require operational validation before public acquisition.

## Commands
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm test:integration
pnpm build
pnpm --filter @gwd/web dev
pnpm --filter @gwd/app dev
pnpm dev:api
pnpm dev:worker

Set runtime env using the deploy platform or node --env-file; pnpm does not auto-load root .env into services.
Next apps use their own .env.local during local development.

## Ownership
Codex: code/tests/CI/handoff. Helena: staging secrets, migrations, Vercel/VPS, networks, DNS after explicit GO.
Diana: product/ops/growth. Tomas: research/content. Elisa: learning. Maia: journey/community.
No new mentor persona or dedicated agent created.
