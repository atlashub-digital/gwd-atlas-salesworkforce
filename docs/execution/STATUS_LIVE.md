# STATUS LIVE — GWD delivery lane (atualizado 23/10/2026 18:15 UTC) · relatório consolidado: `FREE_V1_REPORT.md`

Branch `feat/gwd-e2e-production-delivery-v1` · PR #16 · Missão #15. PR #17 (visual) isolado até homologação da Diana.

## Serviços em produção
| Serviço | Versão ativa | Rollback |
|---|---|---|
| web `goworld.digital` (Vercel `gwd`) | `aa084be` (`dpl_58bswS2KHJ2t8JY1H1aNsuSW81ma`) | `dpl_ECtpAr9rAWUhVmZTzxESEGntzRse` |
| app `app.goworld.digital` (Vercel `gwd-app`) | **`dc12e69`** (`dpl_FknDNJQRtgBMST2Ria6ukyEskv37`); candidata `e67a978` (`dpl_2GKYZCPqZfkx7d2bn1eg9KbFq2ZT`, código da app = `a0ee992`, UI Telegram) READY; promoção a aguardar autorização explícita | `4595473` `dpl_9s5GrE4GVy37y7hUhjnmF7owu71P` → `f61d4ce` `dpl_AXsPAjNjdXyV7DkHX8E1nxtcG1fa` → `aa084be` `dpl_Gsg1YJ3tUE8XPyScfx81QNb4C1js` |
| API `api.goworld.digital` | **`a0ee992`** (contentor `gwd-api-a0ee992`; QUIZ_VERIFIED fail-closed, links Telegram validados, concessões de pré-visualização por episódio) | site Caddy anterior → `gwd-api-4c7c5a2` → `gwd-api-987851f` → `gwd-api-f61d4ce` |
| Worker | **`4c7c5a2`** (contentor `gwd-worker-4c7c5a2`, release por SHA, `commerce OFF`) | `docker start gwd-worker` (antigo, parado com `restart=no`) |
| DB GWD (Supabase dedicado) | schema até `2026-10-23-community-v1.sql` (H01). `2026-10-23-community-v1-fix-claim.sql` **aplicada** (Helena, 15:20). **Pendente (Helena, com backup):** `2026-10-23-academy-preview.sql` rev. 2 + `pilot-p01-assets.sql` v4 | ROLLBACK em cada ficheiro + backup |
| Atlas Media | gateway HTTPS `media.atlashub.si` (H01), tenant `gwd`, política FREE `gwd-start` | — |

## Gates
| Gate | Estado | Evidência / bloqueio |
|---|---|---|
| A — Auditoria | **PASS** | `AS_IS_VERIFIED.md`, ADR LearnHouse (KEEP Academy) |
| B — Runtime/Auth | **PASS** | Resend `goworld.digital` ativo; login real por link (04:36) e por código (07:04) PASS; HttpOnly+Secure, sem tokens no URL, logout invalida. Limite de emails subido para 50/h: A e B entraram por código às 18:07 sem 429 |
| C — Comunidade | **PASS** | produção 18:08, contas reais A+B: regras, publicação persistente, B vê e responde, B não remove A (403), auto-denúncia 400, denúncia B→A, espaço de capacidade 403 e não listado, A remove a própria, logout |
| D — Media/Academy | **PARTIAL** | API → catalog privado PASS (401/S2S/token); HLS real, adulteração e expiração PASS. Falta: preview rev. 2 + P01 v4 aplicados pela Helena (GO operacional já dado) → playback no browser real. Conteúdo do curso: BLOCKED (`CONTENT_CONTRACT_GWD_START.md`) |
| E — Novidades/ARO | NOT STARTED | ARO sem projeto `gwd` |
| F — Mentoria/equipas | NOT STARTED | espaços por capacidade já suportados |

## Pedidos atuais (só operações privilegiadas / decisões)
1. **Helena** — `2026-10-23-academy-preview.sql` rev. 2 + `pilot-p01-assets.sql` v4 (backup, COMMIT controlado, emails de teste fora do Git). Depois: HLS no browser real (Claude Code).
2. **Fundador** — autorizar a promoção da app `e67a978` para produção (rollback `dpl_FknDNJQRtgBMST2Ria6ukyEskv37`).
3. **Equipa do canal** — URLs de 2–3 mensagens de `t.me/c/4305862304`, direitos, quiz e uma conta de teste no canal (`TELEGRAM_NATIVE_PILOT.md`).
4. **Helena** — rotação da chave Resend (nova validada antes de revogar a antiga).
5. **Conteúdo** — GWD Start real (`GWD_START_PRODUCTION_PLAN.md`).
6. Após 48 h estáveis: `docker stop gwd-api gwd-api-f61d4ce`; mais tarde, `gwd-api-987851f`.
