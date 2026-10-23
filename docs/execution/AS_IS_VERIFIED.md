# AS-IS VERIFICADO — Gate A (23/10/2026, Claude Code)

Medições feitas nesta sessão em runtime real. Nenhum valor de segredo foi lido ou impresso (só nomes de variáveis).

## Código e PRs
| Item | Estado verificado |
|---|---|
| Branch de execução | `feat/gwd-e2e-production-delivery-v1` = `feat/gwd-platform-academy-rebuild` (PR #12, código `aa084be`) + docs (`575f68a`, `f4d8efb`) |
| CI `verify` | verde no PR #12 (`6cc5ad0`); nesta lane: ver PR #16 |
| PR #7 → #12 → #16 | empilhados, todos draft; nenhum merge em `main` |

## Runtime em produção
| Componente | Onde corre | Evidência |
|---|---|---|
| Web `goworld.digital` | Vercel projeto `gwd`, deployment `dpl_58bswS2KHJ2t8JY1H1aNsuSW81ma` (commit `aa084be`) | 200 em todas as rotas, 1440/390 (21/10) |
| App `app.goworld.digital` | Vercel projeto `gwd-app`, `dpl_Gsg1YJ3tUE8XPyScfx81QNb4C1js` (`aa084be`) | `/entrar` 200; `/api/gwd/me` → 401 sem sessão (proxy + `GWD_API_URL` configurados) |
| API `api.goworld.digital` | **VPS atlaslab**, contentor `gwd-api` (node:22-slim, `tsx src/server.ts`) atrás de `platform-caddy` (`/opt/platform/caddy/sites/api-goworld.caddy`) | `/health` 200 `{"commerce":"OFF"}`; `/ready` 200 (DB acessível) |
| Worker | contentor `gwd-worker` (mesmo host) | idle, `commerce:OFF`, sem jobs ativos |
| SMS/WhatsApp OTP hook | contentor `gwd-sms-bridge` (`/sms-hook*` no mesmo Caddy site) | ativo; não testado E2E (sem número de teste) |
| DB | Supabase dedicado GWD (pooler, role de runtime → `SET LOCAL ROLE gwd_api`) | `/ready` lê `gwd.journeys`; o projeto **não** está na organização Supabase acessível ao Claude Code |
| ARO | contentor `aro-aro-api-1` (healthy) no mesmo host, site `aro.caddy` | não ligado à GWD (adapter GWD = mock, flags `aroProduction:false`) |
| Atlas Media | VPS de media (só leitura) | gateway/token/telegram-provider internos, sem rota pública (ver `docs/rebuild/MEDIA_VPS_AS_IS.md`) |

### Achado crítico 1 — a API em produção não corre de uma release
`gwd-api` e `gwd-worker` montam a área de trabalho do agente Diana no host em `feat/gwd-soft-launch-v1@6b0066a` **com alterações por commitar**. A app em produção (`aa084be`) já chama `POST /v1/academy/episodes/:id/playback` e `GET /v1/academy/progress?series=`, que **não existem** nessa API (respondem 404; a UI degrada para "vídeo indisponível"/sem progresso). Correção: release imutável por SHA (`RELEASE_DEPLOY_RUNBOOK.md`).

### Achado crítico 2 — rate limit partilhado por todos os membros
`apps/api/src/server.ts` limitava por `req.socket.remoteAddress`; atrás do Caddy é sempre o IP do Caddy → 120 pedidos/min (60/min nos heartbeats) para **toda a plataforma**. Corrigido nesta lane (chave = hash do bearer, ou 1.º hop `X-Forwarded-For`).

### Achado 3 — email OTP não entrega
`POST /api/auth {action:"request"}` em produção devolve `{"sent":true}` para uma conta Gmail de teste do fundador (23/10 ~00:10 UTC), mas nenhum email chegou (caixa, spam e lixo verificados durante >15 min). SMTP/template do projeto Supabase GWD por confirmar → **Helena** (acesso ao projeto Supabase GWD).

## Capacidade do host atlaslab (23/10 00:04 UTC)
2 vCPU · RAM 7.8 GiB (5.4 GiB disponível) · swap 2 GiB (0.9 usado) · disco `/` 48 GB, **81 % usado (9.1 GB livres)** · load 0.20. Coabitam: ARO, EspelhoMeu (+Postgres), 8 runtimes Hermes, Caddy. Conclusão: cabe a API/worker GWD; **não** cabe uma stack LearnHouse completa (Postgres+Redis+FastAPI+Next) sem libertar disco.

## Vercel
`gwd` (goworld.digital) e `gwd-app` (app.goworld.digital) canónicos. `gwd-web` (sem domínio) e `app` (sem domínio, falha `STATIC_BUILD_NO_OUT_DIR` em cada push, incluindo esta lane) — não apagar sem owner; recomendação: desligar o Git do projeto `app` (Helena).

## Bloqueios do classificador desta sessão
Leitura direta da DB de produção a partir do contentor (`Production Reads`) foi recusada pelo classificador de segurança. Não contornado: verificações de schema feitas por comparação de código (as migrações em produção e nesta lane são idênticas até `2026-10-20-academy-v1*.sql`).
