# ADR-003 — ARO Is the Commerce Authority

Status: **Accepted**  
Date: 2026-10-15

## Context

Legacy Novidades code contains direct XPAYMENTS integration. The target AtlasHub architecture introduces ARO as the central commerce/revenue orchestration layer.

## Decision

For the target architecture, ARO is authoritative for:

- checkout creation/orchestration;
- payable commercial amount validation;
- payment transaction state;
- provider routing;
- order approval/reversal;
- entitlement events;
- provider credentials and transaction ledger.

Novidades and GWD integrate with ARO, not directly with payment providers for the target production path.

## Required behavior

### Novidades
- sends offer/cart context and attribution to ARO;
- receives checkout/session state through the approved ARO contract;
- must not require direct provider secrets for the target path.

### GWD
- consumes ARO-approved/reversed order events;
- does not poll payment providers;
- does not infer success from client redirect/query parameters.

### ARO
- signs outbound events;
- supports idempotency/deduplication identifiers;
- exposes stable order identifiers;
- communicates reversal/refund/chargeback outcomes relevant to accrual.

## Migration rule

Direct XPAYMENTS code currently present in Novidades repositories is **legacy to audit**. It may be removed, isolated, or migrated, but it must not silently remain the approved target production route.

## Consequences

- provider changes do not force GWD redesign;
- commerce truth has one authority;
- secret sprawl is reduced;
- integration quality depends on a clear ARO contract and reliable event handling.
