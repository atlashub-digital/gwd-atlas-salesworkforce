# GWD Soft Launch V1 — Execution Contract

Status: ACTIVE EXECUTION BRIEF
Date: 2026-10-18

## Product definition

GoWorld.Digital is a Community-Powered Sales Workforce Platform specialized in the digital market.

Public promise:
- learn;
- join a community;
- discover opportunities and products;
- create/distribute content;
- operate as Social Media, Affiliate or Authorized Seller;
- grow through journeys, gamification and seller success.

Architecture boundary remains unchanged:
- Novidades.Store owns products/offers/sales surfaces;
- GWD owns participants/workforce/community/campaign access/referrals/gamification/accrual projection;
- ARO owns checkout/payment/order/entitlement truth;
- AMF owns content/creative production.

## Ownership

### Codex — Engineering Lead
Owns implementation in this repository:
- monorepo/workspace evolution;
- web/app/api/worker code;
- contracts, domain model and migrations;
- tests, CI and preview readiness;
- no root VPS access and no production secrets.

### Helena — Release & Infrastructure Operator
Owns operational execution:
- Vercel projects and environment wiring;
- VPS containers/services for API and worker;
- Supabase migration execution after review;
- Redis/network/routing;
- DNS only after explicit GO;
- secrets/runtime permissions;
- deployment evidence and rollback.

### ChatGPT / Architecture
Owns:
- product/architecture alignment;
- canonical documentation;
- scope/gate definition;
- audit/review of evidence;
- no silent production activation.

## Repository target

```
apps/
  web/       # goworld.digital
  app/       # app.goworld.digital
  api/       # api.goworld.digital
  worker/    # async jobs / events

packages/
  domain/
  contracts/
  ui/
  db/
  config/
```

Recommended workspace: pnpm workspaces. Avoid unnecessary services.

## Deployment target

- apps/web -> Vercel -> goworld.digital
- apps/app -> Vercel -> app.goworld.digital
- apps/api -> AtlasHub VPS -> api.goworld.digital
- apps/worker -> AtlasHub VPS, internal only
- Supabase/Postgres -> shared physical project with logical `gwd` schema
- Redis -> queues/cache/locks/rate limiting, never source of truth

## Soft Launch scope

### Public web — functional
Routes:
- /
- /comunidade
- /oportunidades
- /oportunidades/europa
- /oportunidades/brasil
- /social-media
- /afiliados
- /revendedores
- /academy
- /entrar

Required functional paths:
- homepage;
- lead capture;
- market/source/UTM capture;
- clear non-employment positioning;
- community CTA;
- responsive/mobile;
- approved GWD media only.

### Member app — frontend complete, functionality staged
Routes/screens:
- /dashboard
- /jornada
- /academy
- /oportunidades
- /campanhas
- /toolkit
- /comunidade
- /pontos
- /ranking
- /vendas
- /ganhos
- /perfil
- /configuracoes

Every route must exist in UI V1.
Inactive features must render honest states such as:
- EM PREPARAÇÃO
- EM BREVE
- AINDA NÃO ATIVADO
Never fake sales, earnings, rankings or campaign availability.

Functional in V1:
- auth;
- participant profile;
- onboarding;
- journey/progress;
- basic Academy content;
- opportunities/catalog read;
- community links;
- points summary from real points events;
- feature flags.

Staged/inactive initially:
- real seller pricing;
- real referral generation unless commercial spine is ready;
- ARO production event ingestion;
- accrual availability/payout;
- advanced ranking;
- dedicated Hermes;
- CRM/Sales Copilot;
- automated payouts.

## Backend minimum operational

API modules:
- health
- auth/context
- leads
- participants
- capabilities
- journeys
- academy
- opportunities/campaigns read model
- community
- gamification
- feature-flags
- audit

Initial API endpoints should include:
- GET /health
- POST /v1/leads
- GET /v1/me
- PATCH /v1/me
- GET /v1/journeys
- POST /v1/journeys/:id/progress
- GET /v1/opportunities
- GET /v1/community
- GET /v1/gamification/summary

Commercial modules may exist structurally but remain disabled by feature flag until GWD-001 / ARO-INT gates pass.

## Worker minimum

Worker exists and boots, but only low-risk jobs are active initially:
- notification outbox;
- journey reminders;
- points projection/recalculation;
- audit maintenance.

ARO commercial event processing remains OFF until the signed/idempotent integration gate is approved.

## Database V1

Minimum tables/entities:
- leads
- participants
- participant_capabilities
- journeys
- journey_steps
- journey_progress
- academy_items
- community_memberships
- campaigns
- campaign_participants
- points_events
- badges
- participant_badges
- feature_flags
- audit_events
- agent_bindings

Commercial spine tables remain part of schema design:
- referrals
- seller_offers
- attributed_sales
- accrual_ledger

They may be migrated but must not imply live commerce.

## Participant capabilities

Baseline:
- COMMUNITY
- LEARNING
- SOCIAL_MEDIA
- AFFILIATE
- AUTHORIZED_SELLER
- MENTOR
- TEAM_LEAD

A participant is not automatically an Affiliate or Seller.

## Core AI team

- Diana Matos — Product, Operations & Growth
- Tomás Rocha — Research & Content Intelligence
- Elisa Duarte — Learning Product & Media
- Maia Valente — Community, Seller Success & Gamification

V1 journey owner: Maia.
V1 learning owner: Elisa.
No new Mentor persona required for launch.

## Human + Hermes

Architecture may include `agent_bindings` with:
- NONE
- SHARED
- DEDICATED

Only SHARED is expected for Soft Launch.
Dedicated Human + Hermes Digital Pods remain experimental and inactive.

## Gates

SL0 Canon aligned
SL1 Monorepo/build green
SL2 Public web preview
SL3 API/worker staging healthy
SL4 DB migration + RLS/auth review
SL5 Member app preview
SL6 Lead -> Participant -> Journey E2E
SL7 Community connections
SL8 Controlled domain cutover

Commercial activation remains a separate gate:
Referral -> Novidades -> ARO -> attributed sale -> accrual.

## Hard prohibitions

Until separately approved:
- no real payment execution;
- no provider secrets in GWD;
- no browser-authoritative payment state;
- no fabricated sales/earnings/rankings;
- no autonomous payout;
- no destructive database migration;
- no production DNS cutover;
- no public claim that community membership is employment.

## Definition of Done — Soft Launch V1

A real visitor can:
1. open goworld.digital;
2. understand GWD;
3. submit /entrar;
4. create/authenticate an account;
5. become a participant;
6. complete onboarding;
7. see and advance a starter journey;
8. access Academy/community;
9. browse real or clearly marked coming-soon opportunities;
10. see truthful gamification state.

All other platform surfaces already exist visually and are feature-gated.
