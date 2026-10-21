# INTEGRATION CONTRACTS

## Auth
Supabase Auth (email OTP, Google) via `apps/app/app/api/auth*`; cookies `gwd-access`/`gwd-refresh` HttpOnly; API recebe Bearer e define `request.jwt.claim.sub` e `request.jwt.claim.email` (só email confirmado). Sem alterações nesta branch.

## Academy API (GWD)
`GET /v1/academy/series[/:slug]` (público) · `GET /v1/academy/episodes/:id` · `POST /v1/academy/episodes/:id/playback` (**novo**) · `GET /v1/academy/progress?series=` (**novo**) · `POST /v1/academy/progress/heartbeat|complete` · `GET /v1/academy/progress/summary` · `POST /v1/academy/telegram-handoff-opened` · `POST /v1/academy/quiz/:id/submit`.
Conclusão e XP são sempre server-side (políticas versionadas, idempotência por `event_key`, rejeição de saltos impossíveis).

## ARO
`apps/api/src/aro.ts` — **mock** (FREE/MEMBER ativos; PREMIUM só via `ARO_MOCK_ACTIVE_REFS`). Troca para `aro-http` exige contrato e chave server-side da Helena. Checkout desativado (CTA "EM PREPARAÇÃO").

## Atlas Media
Ver `MEDIA_VPS_AS_IS.md` e `MEDIA_GWD_CONTRACT_MATRIX.md`. Env server-side da API: `ATLAS_MEDIA_TOKEN_URL`, `ATLAS_MEDIA_GATEWAY_URL`, `ATLAS_MEDIA_ARO_PROJECT`, `ATLAS_MEDIA_TENANT` (default `gwd`). Sem env → `MEDIA_UNAVAILABLE`.

## Telegram
GWD: `TELEGRAM_HANDOFF_OPENED` sem XP nem conclusão. Provider (VPS media): `/binding/start {entitlement_ref, participant_ref, tenant}` → deep link `t.me/<bot>?start=<token>`; `/binding/consume`. Para ligar: rota/autenticação server-to-server definida pela Helena.

## DB
Nenhuma migração aplicada. Proposta `sql/pilot-p01-assets.sql` (rollback por omissão).
