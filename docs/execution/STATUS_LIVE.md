# STATUS LIVE — GWD delivery lane (atualizado 23/10/2026 18:15 UTC) · relatório consolidado: `FREE_V1_REPORT.md`

Branch `feat/gwd-e2e-production-delivery-v1` · PR #16 · Missão #15. PR #17 (visual) isolado até homologação da Diana.

## Serviços em produção
| Serviço | Versão ativa | Rollback |
|---|---|---|
| web `goworld.digital` (Vercel `gwd`) | **`1f7a7c1`** — canais oficiais (WhatsApp, Discord, Telegram, Maia, email) sobre o Hero V1 publicado; acabamento visual do hero em revisão — V1.1 só em preview (`dpl_A7heTSkwgoo2kAbh9VBt5pokm224`) | `1cef61d` `dpl_AuC4mrc5hx3n1ueuFpTFTmBTnqad` → `c73502e` `dpl_HYrdnvfzA7KNqsPnd2UbiVKR8Fmh` |
| app `app.goworld.digital` (Vercel `gwd-app`) | **`1f7a7c1`** — hub de canais oficiais na Comunidade (`dpl_D9PhRN6Z4NsDnEQKHyWP2zMdSeea`) | `4c071b6` `dpl_ELYtRQixoZxsf87AaGFPGH5K86qk` → `dpl_8jZthMSez7mtiQs9FhVZkHdtGzn1` |
| API `api.goworld.digital` | **`16178c7`** (contentor `gwd-api-16178c7`; chaves de eventos por participante) | site Caddy anterior → `gwd-api-a0ee992` → `gwd-api-4c7c5a2` |
| Worker | **`4c7c5a2`** (contentor `gwd-worker-4c7c5a2`, release por SHA, `commerce OFF`) | `docker start gwd-worker` (antigo, parado com `restart=no`) |
| DB GWD (Supabase dedicado) | schema até `2026-10-23-community-v1.sql` (H01). `2026-10-23-community-v1-fix-claim.sql` **aplicada** (Helena, 15:20). **Pendente (Helena, com backup):** `2026-10-23-academy-preview.sql` rev. 2 + `pilot-p01-assets.sql` v4 | ROLLBACK em cada ficheiro + backup |
| Atlas Media | gateway HTTPS `media.atlashub.si` (H01), tenant `gwd`, política FREE `gwd-start` | — |

## Gates
| Gate | Estado | Evidência / bloqueio |
|---|---|---|
| A — Auditoria | **PASS** | `AS_IS_VERIFIED.md`, ADR LearnHouse (KEEP Academy) |
| B — Runtime/Auth | **PASS** | Resend `goworld.digital` ativo; login real por link (04:36) e por código (07:04) PASS; HttpOnly+Secure, sem tokens no URL, logout invalida. Limite de emails subido para 50/h: A e B entraram por código às 18:07 sem 429 |
| C — Comunidade | **PASS** | produção 18:08, contas reais A+B: regras, publicação persistente, B vê e responde, B não remove A (403), auto-denúncia 400, denúncia B→A, espaço de capacidade 403 e não listado, A remove a própria, logout |
| D — Media/Academy | **PASS** (técnico) | HLS real PASS (P01, Chrome real); Telegram Native P02 PASS (A e B). Conteúdo definitivo do curso: próxima fase |
| E — Novidades/ARO | NOT STARTED | ARO sem projeto `gwd` |
| F — Mentoria/equipas | NOT STARTED | espaços por capacidade já suportados |

## Pedidos atuais (só operações privilegiadas / decisões)
1. **Helena** — `2026-10-23-academy-preview.sql` rev. 2 + `pilot-p01-assets.sql` v4 (backup, COMMIT controlado, emails de teste fora do Git). Depois: HLS no browser real (Claude Code).
3. **Equipa do canal** — URLs de 2–3 mensagens de `t.me/c/4305862304`, direitos, quiz e uma conta de teste no canal (`TELEGRAM_NATIVE_PILOT.md`).
4. **Helena** — rotação da chave Resend (nova validada antes de revogar a antiga).
5. **Conteúdo** — GWD Start real (`GWD_START_PRODUCTION_PLAN.md`).
6. Após 48 h estáveis: `docker stop gwd-api gwd-api-f61d4ce`; mais tarde, `gwd-api-987851f`.
