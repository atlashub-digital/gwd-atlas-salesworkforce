# Maia Golden Pilot — Helena Alignment Checkpoint

**Date:** 2026-10-16  
**Source:** status reported by Helena  
**Pilot:** GWD-PERSONA-GP-001  
**Important:** this document records Helena's runtime report. It is not an independent audit of the VPS/runtime.

## Current status

| Area | Reported state | Notes |
|---|---|---|
| SOUL | ALIGNED | Secure base retained; Golden Pilot layer added; smoke test positive |
| Playbooks | PARTIAL | Canon installed; editorial loop not yet integrated with scheduler |
| Principal Binding | LIVE / GP1 | Private SERGIO_PRIMARY mapping for Telegram + WhatsApp; Discord pending |
| Telegram | ~80% | Real Maia identity + bot + ops; public handle/inbound smoke still pending |
| WhatsApp | MISSING | Assigned number exists; Evolution/Chatwoot not connected |
| Discord | MISSING | Identity/bot not created |
| Timeline/Event Store | READY SCHEMA | EVENTS-SCHEMA + events.jsonl, empty |
| Approval Engine | SCHEMA READY | APPROVAL_REQUIRED + approvals.jsonl; automated runner missing |
| Research Loop | MISSING | Allowlist exists; scheduler/runner missing |
| Social Scheduler | MISSING | Dayparts defined; context loop not installed |
| Audit Log | PARTIAL | audit.jsonl exists; end-to-end trace envelope missing |

## Gate state

### GP1 — Authority Binding
**Reported: READY**

Remaining validation:
- formal prompt-injection suite;
- spoof/forward/look-alike tests;
- conflicting authority tests;
- privilege escalation rejection.

### GP2 — Channel Connectivity
**Reported: NOT READY**

Blocking items:
1. Telegram public identity + real inbound smoke test.
2. WhatsApp Business + Evolution + Atendimento.Center integration.
3. Discord identity/bot + scoped permissions.

## Scope discipline

Research Loop and Social Scheduler are **not GP2 blockers**.

They belong to GP3/GP4 after the communication layer is stable.

Do not delay channel homologation by implementing the full lifestyle/social runtime first.

## Required next execution order

1. Freeze GP1 with formal security tests.
2. Complete Telegram GP2 smoke.
3. Connect WhatsApp and validate identity/routing.
4. Connect Discord and validate identity/roles.
5. Homologate shared cross-channel audit envelope.
6. Declare GP2 READY.
7. Only then activate GP3 social accounts and GP4 simulated week.

## Approval mode

Social publishing remains:
`APPROVAL_REQUIRED`

No autonomous social publication during GP1/GP2.
