# STATUS LIVE — GWD delivery lane (atualizado 23/10/2026)

Branch `feat/gwd-e2e-production-delivery-v1` · PR #16 · Missão #15 · HEAD de código `f61d4ce`.

## Gates
| Gate | Estado | Nota |
|---|---|---|
| A — Auditoria/CI | **PASS** (com achados) | `AS_IS_VERIFIED.md`; ADR LearnHouse = KEEP Academy |
| B — Runtime | **PARTIAL** | API em produção = release imutável `f61d4ce` (blue/green, 23/10 01:00 UTC); worker ainda na workspace (idle, sem impacto); email OTP BLOCKED (SMTP) |
| C — Comunidade | **PARTIAL** | feed nativo V1 implementado e testado (integração + browser); falta aplicar migração em produção; convites Discord pendentes da missão Helena |
| D — Academy/media | **PARTIAL** | Academy real em produção; G4 media real FAIL (rota pública/tenant `gwd`); YouTube autorizado por fazer; Telegram Native handoff OK; MTProto BLOCKED_POLICY |
| E — Novidades/ARO | NOT STARTED | ARO real no mesmo host; adapter GWD mock; sem financeiro live |
| F — Mentoria/equipas | NOT STARTED | capacidades MENTOR/TEAM_LEAD existem no schema; espaços por capacidade já suportados no feed |

## Serviços
| Serviço | Versão viva | Candidata | Rollback |
|---|---|---|---|
| web `gwd` | `aa084be` (`dpl_58bswS2KHJ2t8JY1H1aNsuSW81ma`) | — | `dpl_ECtpAr9rAWUhVmZTzxESEGntzRse` |
| app `gwd-app` | `aa084be` (`dpl_Gsg1YJ3tUE8XPyScfx81QNb4C1js`) | `f61d4ce` (após API) | `dpl_HwvzubH12CshMkaHHoTesAS8kQaR` |
| API | **`f61d4ce`** (contentor `gwd-api-f61d4ce`, desde 23/10 01:00 UTC) | — | repor o backup do site Caddy (guardado no host) + `caddy reload` → contentor antigo `gwd-api` (workspace `6b0066a`) continua a correr sem tráfego |
| DB GWD | schema até `2026-10-20-academy-v1*` | `2026-10-23-community-v1.sql` | bloco ROLLBACK no ficheiro |

## Pedidos à Helena (ações sem acesso do executor)
1. ~~Deploy da API `f61d4ce`~~ — FEITO pelo Claude Code com GO do fundador (23/10). Pedido residual: após 48 h estáveis, `docker stop gwd-api` (contentor antigo) e decidir se o `gwd-worker` também passa a release por SHA.
2. **Backup + migração `2026-10-23-community-v1.sql`** no projeto Supabase GWD (sem acesso do executor). Teste: `/v1/community/spaces` deixa de responder `COMMUNITY_FEED_PENDING`.
3. **SMTP/template OTP** do mesmo projeto (Signup + Magic Link com `{{ .Token }}`); teste: pedido de código para um Gmail de teste chega em <1 min.
4. Media: rota HTTPS do gateway, CORS, tenant ARO `gwd` + política FREE (inalterado de `docs/rebuild/STATUS_E_PROXIMAS_ETAPAS.md`).
5. Desligar o Git do projeto Vercel `app` (falha em cada push).
