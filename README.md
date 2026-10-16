# GoWorld.Digital — Atlas Sales Workforce

GoWorld.Digital (GWD) is the AtlasHub sales workforce platform for affiliates, sellers, teams, training, performance, gamification and commercial attribution.

## Source of truth

This GitHub repository is the canonical technical source of truth for GWD architecture, contracts, ADRs and implementation status.

- **GitHub:** technical truth, versioned decisions, code, contracts, tests and release evidence.
- **Notion:** operational coordination, portfolio visibility, tasks and meeting context.
- **GitBook:** no longer canonical for this project.

## Ecosystem boundary

```text
AMF
 │ content + campaigns
 ▼
Novidades.Store
 │ consumer experience / sales pages / offers
 ▼
ARO
 │ checkout / payment / order / entitlement truth
 ▼
GoWorld.Digital
   affiliates / sellers / attribution / commissions
   training / goals / ranking / gamification
```

### Novidades.Store
Owns catalog, content, sales pages, funnels, bundles, consumer campaigns and delivery experience.

### GoWorld.Digital
Owns affiliate/seller identity, referrals, teams, campaign access, training, certifications, points, rankings, goals, commission/margin accrual and future Sales Copilot capabilities.

### ARO
Owns checkout, payment status, commercial order truth and entitlement. GWD must not become a payment processor or provider ledger.

### AMF
Owns content and creative production workflows used by the commerce surfaces.

## Canonical repositories

- `atlashub-digital/gwd-atlas-salesworkforce` — GWD.
- `atlashub-digital/novidades-platform` — Novidades.Store storefront / commerce surface; legacy architecture requires audit.
- `atlashub-digital/novidades-digital` — digital-product application; legacy direct-payment integration requires audit.

## Domains

- `goworld.digital` — GWD domain under AtlasHub Cloudflare.
- `novidades.store` — Novidades.Store domain; production cutover remains gated.
- `xpay.expert` — domain available for the commerce/payment surface; public role and routing remain gated.

No DNS cutover, LIVE activation or payment execution is authorized by this documentation baseline.

## V1 operating model

- Novidades + GWD may share one physical Postgres/Supabase database initially.
- Logical isolation is mandatory: `novidades` schema and `gwd` schema.
- ARO remains a separate transactional data plane.
- Repositories remain separate.
- Do not create unnecessary microservices before the first attributed-sale flow is proven.
- Commission or seller margin is accrued in GWD; payout is manual in V1.
- Provider split automation is explicitly out of scope for V1.

## First flow to prove

```text
Affiliate/Seller in GWD
  -> selects eligible campaign/offer
  -> generates referral link/code
  -> customer lands on Novidades sales page
  -> attribution is preserved
  -> Novidades creates checkout through ARO
  -> ARO approves order
  -> signed/idempotent order event reaches GWD
  -> GWD records attributed sale
  -> commission or seller margin becomes PENDING
  -> points / goal / ranking are updated
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Governance](docs/GOVERNANCE.md)
- [Roadmap & gates](docs/ROADMAP.md)
- [ARO integration contract baseline](docs/contracts/ARO-INTEGRATION-V0.md)
- [ADR-001 — Dual Sales Model](docs/adr/ADR-001-dual-sales-model.md)
- [ADR-002 — Shared DB, Separate Schemas](docs/adr/ADR-002-shared-db-separate-schemas.md)
- [ADR-003 — ARO as Commerce Authority](docs/adr/ADR-003-aro-commerce-authority.md)
- [ADR-004 — Attribution and Accrual Ledger](docs/adr/ADR-004-attribution-and-accrual-ledger.md)

## Current execution gates

1. **NOV-001** — audit `novidades-platform` and `novidades-digital`; classify keep / migrate / remove.
2. **GWD-001** — establish GWD foundation and referral/attribution spine.
3. **ARO integration** — implement signed, idempotent order/event contract.
4. **Preview gate** — CI, browser/E2E and security validation.
5. **Domain cutover** — only after explicit operational GO.

## Non-negotiable rules

- Do not activate real payments without an explicit gate.
- Do not deploy provider secrets to Novidades or GWD when ARO can own that responsibility.
- Do not duplicate ARO's financial/provider ledger into GWD.
- Do not treat legacy direct XPAYMENTS code as approved target architecture.
- Architecture changes require an ADR and reviewable Git history.
