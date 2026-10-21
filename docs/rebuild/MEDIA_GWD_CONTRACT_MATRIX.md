# MEDIA ↔ GWD CONTRACT MATRIX (P01)

| Item | Contrato real (VPS media) | Implementação GWD | Verificado | Estado |
|---|---|---|---|---|
| Identificador | `asset_id` = diretório `hls/<tenant>/<id>` | `gwd.academy_episode_assets.asset_ref` (provider ATLAS_MEDIA) | sim (storage) | OK |
| EP01 | `01K5D8HGF18YCW2KO6VW` · 10 s · 360/540/720p | por ligar (proposta `sql/pilot-p01-assets.sql`, não aplicada) | servidor | CLIP DE TESTE |
| EP02 | `01K5DB09D1XJY0H2O3HU` · 12 s | idem | servidor | CLIP DE TESTE |
| EP03 | `01K5DB09D7WTZIGIIJX1G` · 12 s | idem | servidor | CLIP DE TESTE |
| EP04 | Telegram provider: `/binding/start` + `/binding/consume` + invite single-use via tg-ops | GWD regista `TELEGRAM_HANDOFF_OPENED`; não chama `/binding/start` (porta interna, sem rota) | servidor (3 bindings, 1 invite, replay 409) | BOUNDARY OK · NÃO LIGADO |
| `/token` | `POST {tenant, asset_id, entitlement_ref, aro:{project, identity:{email}}}` → 200/403/404/502 | `apps/api/src/media.ts` `requestPlayback` + rota `POST /v1/academy/episodes/:id/playback` | contract tests (mock explícito) | OK |
| `access_policy_ref` | o catalog usa `entitlement_ref` = chave de entitlement no ARO | `access_policy_ref` do asset, senão `entitlement_ref` do episódio/série | — | OK (dados por preencher) |
| ALLOW | ARO entitlement ACTIVE → token Ed25519, TTL 300 s | manifest URL com token → hls.js / HLS nativo | servidor 10/10 PASS | OK servidor |
| DENY | 403 sem token | `ENTITLEMENT_DENIED` → episódio bloqueado | servidor + contract test | OK |
| Expiry | TTL 300 s; child tokens nas playlists | erro fatal hls.js → "sessão de vídeo expirou, recarrega" | — | UI OK; renovação automática por fazer |
| Gateway público | **não existe** (portas 8120/8121 fechadas) | `ATLAS_MEDIA_GATEWAY_URL` | — | **BLOQUEIO (Helena)** |
| CORS | `gwd`: `*.gwd.atlashub.si`, `novidades.store` | precisa de `goworld.digital`, `app.goworld.digital`, previews | — | **BLOQUEIO (Helena)** |
| ARO project | só `atlas-club` configurado no catalog | `ATLAS_MEDIA_ARO_PROJECT` | — | **BLOQUEIO (Helena)**: criar projeto/chave `gwd` |
| FREE | o catalog exige sempre entitlement ARO | episódios FREE na GWD | — | **BLOQUEIO**: política FREE no catalog ou entitlement FREE automático no ARO |

**G4 REAL MEDIA: FAIL** — reprodução real só comprovada servidor→servidor; falta rota pública, CORS, ARO `gwd`, episódios reais e teste no browser em staging.
**EP04 TELEGRAM: FAIL** — boundary existe e funciona em teste, mas a GWD não o consegue chamar (sem rota/contrato exposto).
