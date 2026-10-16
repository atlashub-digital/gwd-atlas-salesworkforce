# ADR-001 — Dual Sales Model

Status: **Accepted**  
Date: 2026-10-15

## Context

GWD must support two commercially distinct participant models without forcing both into a single “affiliate commission” abstraction.

## Decision

GWD supports:

### Affiliate
- sells an approved Novidades offer using referral identity;
- customer price is the approved offer price;
- earns a configured percentage or fixed commission;
- commission is accrued only after an ARO-approved order event.

### Authorized Seller
- receives an approved base/floor price;
- may publish an allowed seller price at or above that floor and within any campaign ceiling/rules;
- seller economic benefit is the approved margin between commercial base and seller price, subject to fees/rules;
- seller price must be validated server-side before checkout creation.

A participant may have one or more roles, but each attributed sale must resolve one unambiguous compensation rule.

## V1 settlement

- GWD calculates and accrues commission/margin.
- Accrual begins as `PENDING`.
- Payout is manual/controlled in V1.
- Instant provider split is out of scope.
- Refunds/chargebacks/reversals create compensating ledger events.

## Consequences

Positive:
- affiliate and reseller economics remain explicit;
- no dependency on provider-specific split capabilities;
- payout automation can evolve independently.

Trade-offs:
- manual settlement creates operational work;
- compensation rules require versioning per campaign/offer.

## Guardrails

- Browser input never defines an authoritative payable amount.
- A seller cannot undercut the approved floor.
- GWD cannot turn a payment into `APPROVED`; only ARO commercial truth can trigger accrual.
- Historical compensation rules must remain reconstructable.
