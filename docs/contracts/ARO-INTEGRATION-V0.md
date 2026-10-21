# ARO Integration Contract — V0 Baseline

Status: **Contract design baseline — not yet implemented**

This document defines the minimum cross-system contract required to prove:

`GWD referral -> Novidades sales page -> ARO checkout/order -> GWD attributed sale`.

It is deliberately provider-agnostic.

## 1. Novidades -> ARO: checkout creation

Conceptual request:

```json
{
  "project": "novidades",
  "offer_id": "stable-offer-id",
  "seller_offer_id": "optional-gwd-seller-offer-id",
  "currency": "BRL",
  "attribution": {
    "referral_code": "AF123",
    "participant_id": "gwd-participant-id",
    "campaign_id": "campaign-id"
  },
  "customer_context": {
    "locale": "pt-BR"
  },
  "idempotency_key": "caller-generated-stable-key"
}
```

Rules:

- Novidades must not send an arbitrary browser-supplied final amount as authoritative.
- ARO resolves/validates the payable amount against an approved offer/commercial rule.
- Attribution identifiers are commercial metadata, not payment authorization.
- ARO returns stable checkout/session and order correlation identifiers.

## 2. ARO -> GWD: order approved event

Conceptual event:

```json
{
  "event_id": "aro-event-uuid",
  "event_type": "order.approved",
  "occurred_at": "ISO-8601",
  "order": {
    "id": "aro-order-id",
    "project": "novidades",
    "offer_id": "stable-offer-id",
    "seller_offer_id": "optional",
    "currency": "BRL",
    "gross_amount_minor": 9700,
    "status": "APPROVED"
  },
  "attribution": {
    "referral_code": "AF123",
    "participant_id": "gwd-participant-id",
    "campaign_id": "campaign-id"
  }
}
```

Required transport properties:

- signed message/webhook;
- timestamp or replay protection;
- event id;
- stable order id;
- retry support;
- documented signature verification.

GWD response behavior:

- verify signature first;
- deduplicate by `event_id`;
- upsert/project one attributed sale per valid order identity;
- create accrual exactly once;
- return a success response for safe duplicate delivery after the event is already committed.

## 3. Reversal/refund event

Conceptual event types may include:

- `order.refunded`
- `order.reversed`
- `order.chargeback`

The final ARO vocabulary must be fixed before implementation.

GWD must create a compensating accrual/points adjustment and keep a link to the original order.

## 4. Failure policy

- Browser redirect is never sufficient proof of approval.
- Signature failure: reject and record telemetry.
- Unknown referral: order remains valid in ARO; GWD records an attribution exception rather than changing payment truth.
- Duplicate event: no duplicate accrual.
- GWD outage: ARO retries or supports replay; order truth remains intact.
- ARO outage during checkout: Novidades fails safely; it must not fabricate an approved purchase.

## 5. Versioning

Before production implementation, the contract must define:

- endpoint paths;
- authentication/signature algorithm;
- canonical event names;
- error response model;
- idempotency TTL/semantics;
- event version field;
- schema evolution policy.

Those details become implementation evidence only after the actual ARO interface is inspected and aligned.
