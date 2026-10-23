# E2E EVIDENCE LOG

Formato: data UTC · ambiente · teste · resultado · evidência. IDs de contas pseudonimizados. **Mock/PGlite = teste de integração, não prova de produção.**

| Data (UTC) | Ambiente | Teste | Resultado | Evidência |
|---|---|---|---|---|
| 23/10 00:04 | produção `api.goworld.digital` | `/health`, `/ready`, `/v1/feature-flags` | PASS | 200; `commerce:"OFF"`; flags comerciais todas `false` |
| 23/10 00:05 | produção `app.goworld.digital` | proxy `/api/gwd/me` sem sessão | PASS | 401 "Inicia sessão para continuar." |
| 23/10 00:06 | produção API | `/v1/academy/series` | PASS | catálogo da DB (`source:"db"`), 3 séries demo |
| 23/10 00:06 | produção API | `POST /v1/academy/episodes/:id/playback`, `GET /v1/academy/progress?series=` | **FAIL** | rotas ausentes na API publicada (workspace `6b0066a`); a app `aa084be` já as chama |
| 23/10 00:10 | produção app → Supabase GWD | registo Free por email OTP (conta de teste `free-test-1`) | **BLOCKED** | `{"sent":true}` mas nenhum email recebido em >15 min (inbox/spam/trash) → SMTP Supabase (Helena) |
| 23/10 00:10 | produção | registo por WhatsApp OTP | NOT RUN | sem número de teste autorizado |
| 23/10 00:30 | integração PGlite (RLS real, auth stub) | Community V1: regras, espaços por capacidade, post/resposta, remover, 3 denúncias ocultam, limite 10/h, negativas RLS, sem XP | PASS | `tests/integration/community.test.ts` |
| 23/10 00:30 | integração PGlite | feed antes da migração → `COMMUNITY_FEED_PENDING` | PASS | `tests/integration/flow.test.ts` |
| 23/10 00:40 | browser local (Playwright 1.55.1, build Next de produção, PGlite) | 10 rotas públicas 1440/390, Academy, Lead→OTP stub→Onboarding→40 pts, 13 rotas membro, comunidade regras + publicar + reload + espaços, logout | PASS | `tests/browser/verify.cjs` (commit `f61d4ce`) |
| 23/10 00:45 | VPS atlaslab | release imutável API `f61d4ce` + env file 600 | PREPARED | arranque do contentor bloqueado pelo classificador (`Production Deploy`) → GO humano |
