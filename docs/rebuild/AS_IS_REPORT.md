# GWD — AS-IS REPORT (2026-10-21)

## Baseline
- Branch fonte `feat/gwd-soft-launch-v1`: HEAD remoto **29fea8437c0d1865c16ceaee00a9705ef470abc4** (o HEAD histórico 5458a77 é ancestral; +4 commits de 21/10: V1 entry/wordmark, a11y decorativa, V2 market, V3 member shell).
- Branch de trabalho `feat/gwd-platform-academy-rebuild` criada a partir de 29fea84.
- CI: workflow "GWD V1" (typecheck, unit, integration, build, browser E2E com Postgres isolado e Auth stub). Só corre em push para `main`/`feat/gwd-soft-launch-v1` e em `pull_request` → a branch nova terá CI via PR.

## Monorepo
| Peça | Estado |
|---|---|
| apps/web (Next) | `/`, `/entrar`, `/academy`, `/academy/series/[slug]`, `/academy/series/[slug]/episodes/[episode]`, catch-all `[...slug]` (Europa/Brasil/percursos/legais), `/api/leads` |
| apps/app (Next) | `/`, `/entrar`, `/(member)/[screen]` — **um único componente `MemberScreen`** para dashboard/jornada/academy/comunidade/oportunidades/pontos/perfil/onboarding/configurações; auth Supabase (Google + `/api/auth`), proxy `/api/gwd/*` |
| apps/api | Academy (catálogo, heartbeat de progresso, políticas de conclusão ANY/BOTH/QUIZ, XP idempotente em `points_events`), ARO adapter **mock** |
| packages | ui (tokens + componentes base), domain, config, contracts, db (migração academy-v1 com `access_policy_ref`) |
| Media | 11 imagens webp em `apps/web/public/media` (hero, Europa, Brasil, equipa, comunidade…) |

## Funcionalidade
| Área | Estado |
|---|---|
| Homepage/Entrar/Europa/Brasil | REAL, visual PARCIAL face às maquetes (estrutura antiga; maquete exige hero cinematográfico, painel de registo com interesses, faixas de benefícios) |
| Dashboard/Jornada/Comunidade/Oportunidades/Perfil | REAL (API), visual PLACEHOLDER (cards genéricos; maquete exige sidebar rica, cards com fotografia, stepper, nível/XP) |
| Academy app | PLACEHOLDER (lista de leituras) |
| Academy web (streaming) | PARCIAL: catálogo/série/episódio existem; player = shell sem HLS (`AtlasMediaProvider.getAssetUrl → null`, fail-closed) |
| Progresso/XP | REAL no backend (heartbeat, anti-salto, idempotência) |
| ARO | MOCK (env `ARO_MOCK_ACTIVE_REFS`) |
| Atlas Media | NÃO LIGADO (ver MEDIA_VPS_AS_IS.md) |
| Telegram | NÃO LIGADO ao GWD (boundary existe no media VPS) |
| Market (maquete 12/13) | NÃO IMPLEMENTADO (e não autorizado a vender: só UI "em preparação") |

## Maquetes canónicas (abertas e vistas)
00_MASTER_VISUAL_SYSTEM_BOARD_V1, 01_GWD_MARKET_MASTER_BOARD, 00_ACADEMY_AND_PLATFORM_DIRECTION_BOARD, 01_ACADEMY_STREAMING_MASTER_BOARD, 02_ACADEMY_COMPONENTS_MOBILE_BOARD, 01_APP_JOURNEY_GAMIFICATION_MASTER_V1 + targets 01–09 (dashboard, academy, jornada, comunidade, oportunidades).
Nota: os targets individuais são de baixa resolução (170–596 px); as referências de detalhe são os boards 1536×1024.

## Bloqueios de ambiente desta sessão
1. **Sem credenciais de escrita GitHub** neste host (sem `gh`, sem token, sem chave SSH) → sem push, PR, CI ou preview Vercel por git.
2. **Disco do host de desenvolvimento a 98%** (≈1 GB livre) → `pnpm install` + `next build` + Playwright não cabem. ≈14,8 GB de imagens Docker não usadas recuperáveis, mas o host é partilhado.
3. Media/ARO/Telegram: ver MEDIA_VPS_AS_IS.md (decisões Helena).

## Prioridades
F1 design foundation + homepage/entrar → F2 Europa/Brasil/Como funciona → F3 app shell + dashboard/jornada/comunidade/oportunidades/perfil → F4 Academy streaming → F5 integrações (quando Helena abrir os contratos) → F6/F7 qualidade e staging.
