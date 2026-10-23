# STATUS LIVE — GWD delivery lane (atualizado 23/10/2026 07:40 UTC)

Branch `feat/gwd-e2e-production-delivery-v1` · PR #16 · Missão #15. PR #17 (visual) isolado até homologação da Diana.

## Serviços em produção
| Serviço | Versão ativa | Rollback |
|---|---|---|
| web `goworld.digital` (Vercel `gwd`) | `aa084be` (`dpl_58bswS2KHJ2t8JY1H1aNsuSW81ma`) | `dpl_ECtpAr9rAWUhVmZTzxESEGntzRse` |
| app `app.goworld.digital` (Vercel `gwd-app`) | **`dc12e69`** (`dpl_FknDNJQRtgBMST2Ria6ukyEskv37`) | `4595473` `dpl_9s5GrE4GVy37y7hUhjnmF7owu71P` → `f61d4ce` `dpl_AXsPAjNjdXyV7DkHX8E1nxtcG1fa` → `aa084be` `dpl_Gsg1YJ3tUE8XPyScfx81QNb4C1js` |
| API `api.goworld.digital` | **`4c7c5a2`** (contentor `gwd-api-4c7c5a2`, release imutável, env com `ATLAS_MEDIA_*`, catalog pela rede privada) | site Caddy anterior → `gwd-api-987851f` → `gwd-api-f61d4ce` (a correr, sem tráfego) |
| Worker | **`4c7c5a2`** (contentor `gwd-worker-4c7c5a2`, release por SHA, `commerce OFF`) | `docker start gwd-worker` (antigo, parado com `restart=no`) |
| DB GWD (Supabase dedicado) | schema até `2026-10-23-community-v1.sql` (H01). **Pendentes (Helena, com backup):** `2026-10-23-community-v1-fix-claim.sql` (defeito de produção) e `2026-10-23-academy-preview.sql` | ROLLBACK em cada ficheiro + backup |
| Atlas Media | gateway HTTPS `media.atlashub.si` (H01), tenant `gwd`, política FREE `gwd-start` | — |

## Gates
| Gate | Estado | Evidência / bloqueio |
|---|---|---|
| A — Auditoria | **PASS** | `AS_IS_VERIFIED.md`, ADR LearnHouse (KEEP Academy) |
| B — Runtime/Auth | **PASS** (com 1 residual) | Resend `goworld.digital` ativo; login real por link (04:36) e por código (07:04) PASS; HttpOnly+Secure, sem tokens no URL, logout invalida. Residual: limite de envio de emails do projeto (429 numa 2.ª conta) |
| C — Comunidade | **FAIL → correção pronta** | Em produção o feed falha (`42501`, função sem USAGE em `auth`). Correção testada em Postgres 17 real, a aplicar pela Helena. Depois: correr de novo `free-journey.cjs` com A e B |
| D — Media/Academy | **PARTIAL** | API → catalog privado PASS (401/S2S/token); HLS real, adulteração e expiração PASS. Falta: migração de pré-visualização + piloto v3 (GO Diana) → playback no browser real. Conteúdo do curso: BLOCKED (`CONTENT_CONTRACT_GWD_START.md`) |
| E — Novidades/ARO | NOT STARTED | ARO sem projeto `gwd` |
| F — Mentoria/equipas | NOT STARTED | espaços por capacidade já suportados |

## Pedidos atuais (só operações privilegiadas / decisões)
1. **Helena — migração de correção** `packages/db/migrations/2026-10-23-community-v1-fix-claim.sql` (com backup). Aditiva: `create or replace` da mesma função, com os mesmos grants. Teste: o feed abre para um membro com as regras aceites. Rollback: reaplicar o bloco da função de `2026-10-23-community-v1.sql`.
2. **Helena — migração** `2026-10-23-academy-preview.sql` (com backup): lista de participantes de teste e RLS de pré-visualização. Rollback no ficheiro.
3. **Diana — GO** do piloto P01 v3 (`docs/rebuild/sql/pilot-p01-assets.sql`): episódio de teste **não publicado** com o clip de 10–12 s; os episódios do curso não mudam. Depois: Helena aplica-o com backup, com os emails das contas de teste (fora do Git).
4. **Helena — Supabase Auth → Rate limits:** subir o limite de envio de emails (a 2.ª conta de teste recebeu 429).
5. **Helena — rotação da chave Resend** partilhada em chat (já registada por ela).
6. **Diana/Elisa — conteúdo do curso**, conforme `docs/execution/CONTENT_CONTRACT_GWD_START.md`.
7. Após 48 h estáveis: `docker stop gwd-api gwd-api-f61d4ce`; mais tarde, `gwd-api-987851f`.
