# STATUS LIVE — GWD delivery lane (atualizado 23/10/2026 05:30 UTC)

Branch `feat/gwd-e2e-production-delivery-v1` · PR #16 · Missão #15. PR #17 (visual) isolado até homologação da Diana.

## Serviços em produção
| Serviço | Versão ativa | Rollback |
|---|---|---|
| web `goworld.digital` (Vercel `gwd`) | `aa084be` (`dpl_58bswS2KHJ2t8JY1H1aNsuSW81ma`) | `dpl_ECtpAr9rAWUhVmZTzxESEGntzRse` |
| app `app.goworld.digital` (Vercel `gwd-app`) | **`dc12e69`** (`dpl_FknDNJQRtgBMST2Ria6ukyEskv37`) | `4595473` `dpl_9s5GrE4GVy37y7hUhjnmF7owu71P` → `f61d4ce` `dpl_AXsPAjNjdXyV7DkHX8E1nxtcG1fa` → `aa084be` `dpl_Gsg1YJ3tUE8XPyScfx81QNb4C1js` |
| API `api.goworld.digital` | **`987851f`** (contentor `gwd-api-987851f`, release imutável, env com `ATLAS_MEDIA_*`) | site Caddy anterior (backup no host) → `gwd-api-f61d4ce` (a correr, sem tráfego); depois `gwd-api` (workspace, sem tráfego) |
| Worker | workspace `6b0066a` (idle, `commerce OFF`) | release `f61d4ce` preparada e validada (`booted`) — troca sem efeito funcional |
| DB GWD (Supabase dedicado) | schema até `2026-10-23-community-v1.sql` (H01, com backup lógico) | bloco ROLLBACK da migração + backup |
| Atlas Media | gateway HTTPS `media.atlashub.si` (H01), tenant `gwd`, política FREE `gwd-start` | — |

## Gates
| Gate | Estado | Evidência / bloqueio |
|---|---|---|
| A — Auditoria | **PASS** | `AS_IS_VERIFIED.md`, ADR LearnHouse (KEEP Academy) |
| B — Runtime | **PARTIAL** | API e app por SHA com rollback. Primeiro login Free real **PASS** (email verdadeiro → link → sessão HttpOnly → dashboard → Academy). SMTP próprio em curso (Helena/Resend); o interno tem limite horário e não deve voltar a ser usado |
| C — Comunidade | **PARTIAL** | Migração e app em produção. RLS e negativas PASS em integração (PGlite). **Teste autenticado real BLOCKED**: sem nova sessão até o SMTP próprio |
| D — Media/Academy | **PARTIAL** | Validado no host de media: S2S → token → master/variante/init/segmento 200 + CORS; negativas (sem S2S 401, token adulterado 403, outro asset 403, sem token 401). **BLOCKED** API → catalog (UFW) e ligação episódio → asset (GO do SQL piloto v2). YouTube BLOCKED (conteúdo). Telegram nativo: handoff PASS; binding EP04 BLOCKED (rota). MTProto: BLOCKED_POLICY |
| E — Novidades/ARO | NOT STARTED | ARO não tem projeto `gwd` (o premium é negado com 502 `aro_unavailable` em vez de 403) |
| F — Mentoria/equipas | NOT STARTED | capacidades e espaços por capacidade já suportados no feed |

## Pedidos atuais à Helena (só operações privilegiadas)
1. **UFW na VPS de media** — permitir só a API GWD, pela rede privada, até ao catalog:
   `ufw allow from 10.200.200.12 to 10.200.200.11 port 8121 proto tcp comment 'gwd-api -> media catalog (private)'`
   - Sem exposição pública; o catalog continua a exigir `x-atlas-media-s2s`.
   - Teste: a partir do `gwd-api-987851f`, `POST http://10.200.200.11:8121/token` sem header → 401.
   - Rollback: `ufw delete allow from 10.200.200.12 to 10.200.200.11 port 8121 proto tcp`.
2. **SQL piloto v2** (`docs/rebuild/sql/pilot-p01-assets.sql`), após GO da Diana: com backup, trocar `rollback;` por `commit;`. É idempotente, só altera dados e tem rollback no fim do ficheiro.
3. **Resend** (em curso): nova API key (a anterior deve ser substituída), domínio `goworld.digital` verificado e templates Signup + Magic Link com `{{ .Token }}` (código) e, para o link, `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email` (a app já trata os dois).
4. Após 48 h estáveis: `docker stop gwd-api gwd-api-f61d4ce`.
