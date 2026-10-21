# ADR-004 — Attribution and Accrual Ledger

Status: **Accepted baseline**  
Date: 2026-10-15

## Context

GWD needs a trustworthy way to connect referral activity to ARO-approved orders and calculate affiliate commission or seller margin without becoming a payment ledger.

## Decision

GWD maintains two distinct concepts:

1. **Attributed Sale** — commercial attribution projection of an ARO order.
2. **Accrual Ledger** — append-oriented economic record for commission/margin owed to a participant.

Neither replaces ARO order/payment truth.

## Attribution minimum

A referral context should resolve stable identifiers for:

- referral code;
- participant/seller;
- campaign;
- product/offer;
- seller offer when applicable;
- originating session/click identifier where useful;
- attribution timestamp.

Novidades preserves this context into ARO checkout creation.

## ARO event processing

An approved event must carry an immutable event identifier and stable ARO order identifier.

GWD event consumption must be:

- signature verified;
- idempotent;
- deduplicated;
- observable;
- replay-safe.

## Accrual states

Baseline states:

- `PENDING` — order approved but not yet eligible for payout.
- `AVAILABLE` — operational rules permit payout.
- `PAID` — settlement recorded.
- `REVERSED` — economic entitlement cancelled through compensating event.

Exact payout timing/rules are a later operational policy.

## Ledger behavior

- Do not erase historical rows to represent refund/chargeback.
- Create compensating entries linked to the original order/accrual.
- Store the compensation-rule version used.
- Monetary values are stored in integer minor units with currency.
- GWD does not store provider fees unless explicitly provided as an approved business input; provider ledger remains ARO-owned.

## Ranking and gamification

Points/ranking may react to approved orders, but reversal events must also reverse or adjust the corresponding game state according to a versioned rule. Gamification can never change economic truth.
