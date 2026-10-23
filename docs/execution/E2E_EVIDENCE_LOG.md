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
| 23/10 00:45 | VPS atlaslab | release imutável API `f61d4ce` + env file 600 | PREPARED | arranque bloqueado pelo classificador; GO do fundador recebido 23/10 |
| 23/10 00:58 | produção (contentor novo, antes do corte) | `/ready` contra a DB real, `/health`, flags, `/v1/academy/series` (3 séries, `db`), rotas protegidas (comunidade, playback) → 401 sem sessão válida | PASS | blue/green: contentor antigo intocado |
| 23/10 01:00 | produção `api.goworld.digital` | corte Caddy para `f61d4ce` + `caddy validate`/`reload`; `/health` `/ready` flags 200 via HTTPS; `POST …/playback` deixa de ser 404 | PASS | ligações TCP ativas só no contentor novo; backup do site Caddy guardado para rollback |
| 23/10 01:02 | produção app `aa084be` → API `f61d4ce` | `/api/gwd/me` 401 sem sessão; `/entrar` 200; web `/` 200 | PASS | sem regressão visível sem sessão; teste com sessão real BLOCKED pelo email OTP |
