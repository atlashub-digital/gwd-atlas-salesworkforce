# KEEP / ADAPT / REPLACE — inventário por componente (23/10/2026)

| Componente | Decisão | Razão / próxima ação |
|---|---|---|
| `apps/web` (landing, SEO, mercados, Academy pública) | KEEP | em produção (PR #12); review visual Diana |
| `apps/app` shell, dashboard, jornada, pontos | KEEP | dados reais da API; estados vazios honestos |
| `apps/app` comunidade | **ADAPT** | placeholder substituído por feed nativo V1 (esta lane) |
| Academy GWD (catálogo, player HLS, reader, quiz, XP) | KEEP | ver `ADR_LEARNING_ENGINE.md` |
| LearnHouse | REPLACE rejeitado / ADAPT opcional | AGPL + SSO só Enterprise; duplicaria progresso e pagamentos |
| `apps/api` | KEEP + **ADAPT deploy** | corre de uma workspace com alterações por commitar → release imutável por SHA |
| Rate limit da API | **ADAPT** | corrigido (por token/forwarded IP) |
| `apps/worker` | KEEP | idle; sem transporte/outbox comercial até Gate E |
| Supabase Auth (email OTP / WhatsApp OTP / Google) | KEEP | email OTP não entrega em produção → SMTP (Helena) |
| `gwd.participant_capabilities` (COMMUNITY…TEAM_LEAD) | KEEP | base para papéis Gate C/F; concessão só por operador, nunca por XP |
| ARO adapter GWD | ADAPT (Gate E) | hoje mock; ARO real corre no mesmo host (`aro-aro-api-1`) |
| Atlas Media adapter | KEEP | fail-closed; aguarda rota pública + tenant `gwd` (Helena) |
| Telegram | KEEP Native handoff | MTProto WebPlayer = BLOCKED_POLICY até revisão de termos |
| Projeto Vercel `app` | REPLACE (desligar Git) | falha em cada push, sem domínio |
