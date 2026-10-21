# Architecture — Novidades.Store + GoWorld.Digital + ARO

Status: **Baseline / target architecture**  
Decision date: 2026-10-15

## 1. Context map

```text
                         AMF
                          │
                 content + creatives
                          ▼
                   NOVIDADES.STORE
           catalog / content / sales surfaces
                          │
                 checkout intent + attribution
                          ▼
                         ARO
        checkout / payment / order / entitlement truth
                          │
              approved/reversed order events
                          ▼
                  GOWORLD.DIGITAL
       affiliates / sellers / teams / commissions
       goals / training / ranking / gamification
```

The core design principle is:

> **Novidades.Store sells products. GoWorld.Digital manages people who sell. ARO decides the transactional truth.**

These are separate bounded contexts even when they initially share infrastructure.

## 2. Bounded contexts and ownership

### 2.1 Novidades.Store

Owns:

- public catalog and content;
- sales pages and funnels;
- bundles and consumer-facing offers;
- campaign landing surfaces;
- consumer UX and conversion;
- delivery/reader metadata where relevant;
- attribution capture until checkout creation;
- official campaign/vendor-parametrized URLs.

Must not own:

- affiliate hierarchy;
- commission ledger;
- seller gamification;
- provider routing;
- provider credentials;
- payment settlement truth.

### 2.2 GoWorld.Digital

Owns:

- affiliate/seller profile;
- role and eligibility;
- teams;
- referral links and codes;
- campaigns available to each seller;
- seller-specific offers within approved commercial rules;
- training / Academy;
- certifications;
- goals;
- points;
- badges;
- leaderboards;
- attributed sales projection;
- commission/margin accrual;
- payout eligibility state;
- future AI Sales Copilot.

Must not own:

- provider payment state;
- payment provider secrets;
- checkout provider routing;
- authoritative order approval;
- authoritative entitlement.

### 2.3 ARO

Owns:

- checkout orchestration;
- payment transaction status;
- order approval/reversal;
- commercial amount accepted for an order;
- provider routing;
- payment-provider credentials;
- entitlement decision/event;
- transaction-level idempotency;
- financial/provider ledger.

GWD consumes approved commercial events; it does not infer payment success from the browser.

### 2.4 AMF

Owns content/creative production and distribution assets. AMF may feed Novidades and GWD campaign material, but it is not the commerce authority.

## 3. Data architecture V1

Target V1:

```text
Physical Postgres / Supabase
│
├── auth
│   └── shared identity primitives when explicitly appropriate
├── novidades
│   ├── content
│   ├── catalog
│   ├── campaigns
│   ├── funnels
│   └── delivery metadata
└── gwd
    ├── seller_profiles
    ├── teams
    ├── referrals
    ├── campaign_access
    ├── seller_offers
    ├── attributed_sales
    ├── accrual_ledger
    ├── goals
    ├── points
    └── training

ARO = separate transactional data plane
```

The physical Supabase project to carry this target must be ratified during **NOV-001**. Existing Novidades code currently references an older shared AutoHub360 commerce database; that reference is evidence of legacy implementation, not automatic approval of the target architecture.

## 4. Repository model

Repositories are deliberately separate because lifecycle and product ownership differ:

- `atlashub-digital/novidades-platform`
- `atlashub-digital/novidades-digital`
- `atlashub-digital/gwd-atlas-salesworkforce`

Do not collapse them into a monorepo solely because V1 may share a database.

## 5. Domain model

Current AtlasHub-controlled domains:

- `goworld.digital`
- `novidades.store`
- `xpay.expert`

Domain ownership does not imply deployment authorization. DNS/routing changes are a separate operational gate.

## 6. First production-worthy business path

The first architecture slice is not “build all of GWD”. It is the attributed-sale spine:

1. Seller/affiliate is authenticated in GWD.
2. GWD shows only eligible campaigns/offers.
3. GWD issues a stable referral code/link.
4. Novidades receives the referral.
5. Attribution survives navigation to checkout intent.
6. Novidades creates checkout via ARO.
7. ARO validates and processes the transaction.
8. ARO emits a signed, idempotent commercial order event.
9. GWD records one attributed sale per ARO order/event.
10. GWD computes a PENDING accrual.
11. GWD updates points/goal/ranking.
12. Refund/reversal events create compensating ledger entries; prior rows are not silently mutated away.

## 7. Security boundaries

- Provider secrets belong to ARO, not browser code.
- Service-role credentials must remain server-side.
- Referral parameters are not payment authorization.
- GWD cannot mark an order approved based on client-side redirects.
- ARO events must be signed and deduplicated.
- Event consumers must be idempotent.
- PII replicated to GWD should be minimized to what attribution/support genuinely require.
- Payment instruments and provider payloads should not be copied into GWD.

## 8. Legacy migration warnings

At baseline, the Novidades repositories still contain direct XPAYMENTS concepts and an older shared-commerce design. Therefore:

- no existing payment integration is automatically target architecture;
- no legacy Supabase project reference is automatically canonical;
- no domain should be cut over until the audit identifies dependencies;
- no production payment path should be activated before ARO integration is verified.

## 9. Architectural quality tests

Before declaring the ecosystem ready for a production cutover, verify:

- Novidades can create ARO checkout without provider secrets.
- GWD can attribute an approved order without querying a payment provider.
- Duplicate ARO events do not duplicate commission/margin.
- Refund/reversal produces correct negative/compensating accrual.
- A seller cannot set a price below the approved floor.
- Ineligible campaigns cannot generate working seller offers.
- Removing GWD does not break consumer payment truth.
- Removing Novidades UI does not erase ARO order truth.
- ARO outage fails safely without fabricating success.
