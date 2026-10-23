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
| 23/10 03:20 | produção (Helena, H01) | migração Community V1 com backup; gateway HTTPS `media.atlashub.si`; HLS real com token (master/variante/segmento 200; sem token 401) | PASS | relatório na Issue #15 |
| 23/10 04:16 | preview `f61d4ce` (SSO share) | `/entrar` 200; `/api/gwd/me`, `community/spaces`, `community/spaces/geral/posts`, `academy/progress` → 401 sem sessão; ID inválido → 404 allowlist | PASS | antes da promoção |
| 23/10 04:17 | produção `app.goworld.digital` | promoção da app `f61d4ce` (redeploy com target production, `dpl_AXsPAjNjdXyV7DkHX8E1nxtcG1fa`); smoke `/entrar` 200, rotas protegidas → `/entrar`, proxy 401 | PASS | rollback `dpl_Gsg1YJ3tUE8XPyScfx81QNb4C1js` |
| 23/10 04:17 | produção → Supabase (SMTP interino) | pedido de código por email para a conta de teste `free-test-1` | **PARTIAL** | email entregue em 3 s, mas o template por defeito traz só um link (sem código) e a app não tratava o regresso do link → corrigido no código (`/auth/confirm`) |
| 23/10 04:40 | produção API → catalog Atlas Media | `POST https://media.atlashub.si/token` | **BLOCKED** | a rota pública expõe só o gateway (GET); o catalog `/token` não está publicado → a API não consegue pedir tokens |
| 23/10 | Academy → YouTube | embed de vídeo próprio/licenciado | **BLOCKED (conteúdo)** | não existe vídeo GWD autorizado no YouTube; o modelo atual não tem provider YOUTUBE (exigiria migração) |
| 23/10 04:30 | produção `app.goworld.digital` | promoções `4595473` (`dpl_9s5GrE4GVy37y7hUhjnmF7owu71P`) e `dc12e69` (`dpl_FknDNJQRtgBMST2Ria6ukyEskv37`); token forjado → rejeitado pelo Supabase real | PASS | rollback em cadeia até `dpl_Gsg1YJ3tUE8XPyScfx81QNb4C1js` |
| 23/10 04:36 | produção (browser 390, conta `free-test-1`, email real) | link do email → sessão HttpOnly → dashboard → Academy → episódio FREE; membro novo encaminhado para o onboarding | **PASS** | primeiro login Free real |
| 23/10 04:36 | produção → Supabase SMTP interino | novo pedido de código | **BLOCKED** | 429: limite horário do remetente interno → SMTP próprio obrigatório para abrir registos |
| 23/10 05:15 | host atlaslab | retry automático do pedido de código: 8 tentativas, todas 429; **parado por instrução** (não repetir pedidos ao SMTP interino) | — | nenhum email enviado |
| 23/10 05:18 | produção Vercel | SHA ativo `dc12e69` (`dpl_FknDNJQRtgBMST2Ria6ukyEskv37`) | PASS | sem nova promoção |
| 23/10 05:19 | rede atlaslab ↔ media | rede privada `10.200.200.0/23` (ping ~2 ms); `:8121` bloqueada pela UFW da VPS de media | **BLOCKED** | pedido UFW à Helena (só `10.200.200.12` → `8121`) |
| 23/10 05:20 | VPS de media (catalog local + gateway público) | S2S correto → token; sem S2S/errado → 401; master 200 + CORS `app.goworld.digital`; variante 200; init 200; segmento 200 (521 KB); segmento sem token 401; assinatura/payload adulterados 403; token de outro asset 403; premium sem ARO → 502 | PASS | cadeia S2S → token → HLS real |
| 23/10 05:26 | gateway público | o mesmo token depois do TTL (300 s) | PASS | 403 (expirado) |
| 23/10 05:23 | produção `api.goworld.digital` | API `987851f` (assets substituídos ocultos + S2S + env `ATLAS_MEDIA_*`) por blue/green; `/ready` 200; tráfego no contentor novo | PASS | rollback: site Caddy anterior → `gwd-api-f61d4ce` |
| 23/10 | integração (PGlite, RLS real, catalog mock) | SQL piloto v2 aplicado 2×: 1 vídeo ativo por episódio; playback envia tenant/asset/política/email + S2S; falha fechado (sem config, 401, 403, demo, sem email) | PASS | `tests/integration/academy-media.test.ts` |
| 23/10 | Drive / Academy | conteúdo autorizado do curso GWD Start (guiões, leitura, quiz) | **BLOCKED (conteúdo)** | só existem boards de design; o catálogo atual é demo |
| 23/10 06:58 | contentor `gwd-api-987851f` → `10.200.200.11:8121` (rede privada) | sem S2S → 401; S2S errado → 401; S2S correto → token (TTL 300 s); master pelo gateway 200 + CORS + 3 variantes; `/token` público inexistente (405); `:8121` fechada a partir da internet | **PASS** | missão B |
| 23/10 07:01–07:04 | produção, conta real A (email Resend `noreply@goworld.digital`, código de 8 dígitos) | `/entrar` UI → código → `/dashboard`; cookies `gwd-*` HttpOnly+Secure; ilegíveis por JS; sem tokens no URL final | **PASS** | login por código real |
| 23/10 07:05 | produção, conta B | pedido de código → 429 persistente (limite de envio de emails do projeto Supabase) | **BLOCKED** | ajuste de *Auth → Rate limits* (Helena) |
| 23/10 07:07 | produção, conta A, `tests/production/free-journey.cjs` | onboarding PASS · dashboard PASS · Academy PASS · premium negado 403 `ENTITLEMENT_DENIED` PASS · API de progresso responde (sem progresso ainda) · espaço de capacidade não listado PASS · logout invalida a sessão PASS | PASS | — |
| 23/10 07:07 | produção, comunidade com a conta A | regras/publicação: FAIL (script marcava a checkbox antes da hidratação → corrigido); **espaço de capacidade → 503** | **FAIL** | causa raiz abaixo |
| 23/10 07:20 | DB de produção (metadados e reprodução só de leitura como `gwd_api`, sem dados de utilizadores) | `gwd.community_can_access()` → `42501 permission denied for schema auth`: o corpo SQL é reinterpretado e o `gwd_api` de produção não tem USAGE em `auth` → **todas as leituras e publicações do feed falham em produção** | **FAIL (defeito)** | correção `2026-10-23-community-v1-fix-claim.sql`, reproduzida e validada em Postgres 17 real; os testes ganharam paridade (revoke USAGE) e falham sem a correção |
| 23/10 07:35 | produção API | `4c7c5a2` por blue/green (pré-visualização com guarda `to_regclass`); catálogo sem o episódio de teste; catalog privado 401 sem S2S | PASS | rollback → `gwd-api-987851f` |
| 23/10 07:36 | produção worker | `gwd-worker-4c7c5a2` (release por SHA) `booted`, `commerce OFF`; antigo parado (`restart=no`) | PASS | rollback: `docker start gwd-worker` |
| 23/10 07:36 | sessões de teste | ficheiros de sessão apagados (`shred`); sessão A já invalidada pelo logout | — | — |
| 23/10 08:05 | testes (unit + integração PGlite + browser) | QUIZ_VERIFIED concluía só com o handoff Telegram num episódio sem quiz → **corrigido** (fail closed); concessões por episódio: outro rascunho invisível ao mesmo tester (API e RLS direta); links Telegram: só `t.me` bem formados chegam ao browser | PASS | `a0ee992` |
| 23/10 08:10 | produção API | `a0ee992` por blue/green; `/ready` 200; catálogo sem episódios de teste | PASS | rollback `gwd-api-4c7c5a2` |
| 23/10 08:15 | produção app | promoção da UI Telegram `a0ee992` | **PENDENTE** | as chamadas ao Vercel falham nesta sessão (hook do cliente); a app atual é compatível com a API nova |
| 23/10 18:07 | produção, contas reais A e B (códigos de 8 dígitos via Resend; B conta nova) | login por código A e B; HttpOnly+Secure; sem 429 (limite 50/h) | **PASS** | — |
| 23/10 18:08 | produção, comunidade A+B (`free-journey.cjs journey`) | regras A/B; publicação de A persiste após reload; B vê e responde (201); B remove A → 403; A denuncia a própria → 400; B denuncia A → 200; espaço de capacidade → 403 e não listado; A remove a própria; logout → 401 | **PASS** | correção `fix-claim` aplicada pela Helena |
| 23/10 18:10 | produção API/worker | API `a0ee992` `/ready` 200, 0 erros em 6 h; worker `idle`, `commerce OFF` | PASS | — |
| 23/10 18:12 | sessões de teste | ficheiros de sessão A/B apagados (`shred`) | — | — |
| 23/10 18:18 | produção app (Vercel `gwd-app`) | `e67a978` (código `a0ee992`, UI Telegram) promovida por redeploy, autorizada pelo fundador; smoke sem sessão: `/entrar`, `/auth/confirm` 200; `/dashboard`, `/academy`, `/comunidade` → `/entrar`; proxy `me`, comunidade, série Academy 401; caminho fora da allowlist 404 | **PASS** | rollback `dpl_FknDNJQRtgBMST2Ria6ukyEskv37` |
| 23/10 19:50 | gateway público media | `POST /token` público novo: sem credencial 401, credencial errada 401, sem CORS; 25 tentativas seguidas sem 429; `/binding` 404/405 | **PASS c/ risco** | sem rate limit |
| 23/10 19:54 | produção, conta A | código entregue por Resend (`noreply@goworld.digital`), login PASS | PASS | rotação da chave não confirmada |
| 23/10 19:55 | produção, conta A, `free-journey.cjs hls` | `teste-media-p01` → 404 (episódio e playback) | **FAIL** | P01 v4 por aplicar |
| 23/10 19:58 | Telegram P02 | 3 mensagens propostas são de curso de terceiros (revendedor) → não associadas | **FAIL (direitos)** | conteúdo GWD próprio ou licença escrita + quiz |
| 23/10 19:58 | ARO | sem projeto `gwd` no `atlashub-finance`; adapter GWD mock, pagamentos OFF | BLOCKED | manifesto + chave de servidor |
| 23/10 20:35 | integração (PGlite, RLS real) | P02 v2 (`/326`, `/334`, `/328`): quiz de episódio privado invisível → submit 400 (**defeito**); com `academy-preview-quiz.sql`: quiz visível só ao tester, sem respostas; quiz falhado não conclui; quiz sem handoff não conclui; handoff + quiz aprovado conclui | PASS | migração por aplicar (Helena) |
