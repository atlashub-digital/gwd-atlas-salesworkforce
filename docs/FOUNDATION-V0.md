# GWD Foundation V0

Status: **Implementation started**

This branch starts the application runtime without implementing production persistence or commerce side effects.

## Implemented in V0
- Next.js 16 / React 19 application shell.
- participant/capability domain types.
- campaign domain type.
- referral type.
- attributed sale projection type.
- commission/margin accrual type.
- initial non-production dashboard surface.

## Next
1. create `gwd` schema in controlled Supabase environment;
2. auth/profile;
3. campaign eligibility;
4. referral generation;
5. seller offer price-floor validation;
6. synthetic ARO event ingestion;
7. idempotent attributed sale + accrual;
8. basic seller dashboard/gamification.

## Boundaries
- no direct provider integration;
- no payment secrets;
- no browser-declared payment success;
- no payout automation;
- no production DNS activation.
