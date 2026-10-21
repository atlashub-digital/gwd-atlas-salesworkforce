# Helena — GWD Soft Launch V1 Handoff

## Role
You are Release & Infrastructure Operator. Codex owns code. Do not rewrite product architecture locally.

## Prepare now
- Vercel project `gwd-web` for `apps/web` (preview first);
- Vercel project `gwd-app` for `apps/app` (preview first);
- VPS staging service/container for `apps/api`;
- VPS staging worker for `apps/worker`;
- Redis connectivity scoped to GWD;
- Supabase target/project confirmation for logical `gwd` schema;
- environment-variable inventory without exposing secret values;
- routing plan for `api.goworld.digital`;
- rollback/deploy evidence template.

## Do not do yet
- do not switch production DNS;
- do not run destructive migrations;
- do not activate payments;
- do not provision provider payment secrets to GWD;
- do not enable ARO commercial event processing;
- do not publish fake business metrics.

## Deployment sequence
1. wait for Codex monorepo build green;
2. create web/app previews;
3. deploy API/worker staging;
4. validate /health;
5. review migration;
6. execute approved migration;
7. validate auth/RLS;
8. run Lead -> Participant -> Journey E2E;
9. produce evidence;
10. request explicit GO for domain cutover.

## Evidence required
- commit SHA;
- CI run;
- Vercel preview URLs;
- API staging health URL/status;
- worker boot/log evidence;
- migration checksum;
- RLS/auth validation;
- E2E result;
- blockers.
