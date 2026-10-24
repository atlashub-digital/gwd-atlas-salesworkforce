# CLAUDE CODE — GWD FULL DELIVERY MISSION V1
## GO EXECUTIVO: REUTILIZAR → INTEGRAR → TESTAR → PUBLICAR

**Data:** 2026-10-22
**Branch:** feat/gwd-e2e-production-delivery-v1
**Base de código:** PR #12 (incorpora o código de PR #7, ambos draft)
**Produto:** GoWorld.Digital / GWD Academy + integração Novidades.Store + ARO + Atlas Media
**Status:** missão autorizada, execução e evidências pendentes

## 0. Diretiva

Executar a entrega integral do GWD real. Não parar na fase de análise ou produzir apenas relatórios. Fazer commits progressivos, executar testes reais E2E, deploys de funcionalidades homologadas e preparar passagem a main de acordo com a cadeia de PRs e CI. Reutilizar o código existente; NÃO começar do zero. Avançar autonomamente com todas as operações a que o Claude Code tenha acesso.

A Helena recebeu em separado instruções para preparar o Discord. Não duplicar essa missão. Envolvê-la APENAS para operações sem acesso técnico, credenciais/scope protegidos, autorizações de segurança, produção Cloudflare/Caddy/VPS/Supabase ou rollback em que o executor esteja impedido. Diana Matos mantém owner funcional/qualidade de produto, sem servir como bloqueio artificial de engenharia.

O fundador confirmou capacidade da VPS, mas executar sempre medições de memória, CPU, disco, processos, backups e rotas para assegurar ausência de conflito com outras stacks. Nenhum resultado deve ser reportado como PASS sem prova num runtime real.

## 1. Fontes a ler e base real

1. CLAUDE.md nesta branch e o presente documento.
2. PR #7: https://github.com/atlashub-digital/gwd-atlas-salesworkforce/pull/7
3. PR #12: https://github.com/atlashub-digital/gwd-atlas-salesworkforce/pull/12
4. Docs de reconstrução: docs/rebuild/STATUS_E_PROXIMAS_ETAPAS.md, END_TO_END_TOPOLOGY.md, MEDIA_GWD_CONTRACT_MATRIX.md, RELEASE_GATES.md
5. Blueprint PR #13: https://github.com/atlashub-digital/gwd-atlas-salesworkforce/pull/13 (Master, Discord Helena e matriz 30 testes E2E)
6. Novidades PR #1: https://github.com/atlashub-digital/novidades-platform/pull/1
7. ARO: https://github.com/atlashub-digital/atlashub-finance
8. Atlas ClubOS apenas como referência de futuro, não como mais uma migração agora.

Código já aproveitável: apps/web, apps/app, apps/api, apps/worker; packages/domain, contracts, db, ui, config; Dockerfile.api e Dockerfile.worker; roteiro de Lead/Onboarding/Journey; Academy Streaming HLS, WebReader, quiz e XP server-side. Preservar identidade visual, assets legítimos e princípios comerciais GWD.

Estado identificado em 22/10 (reconfirmar):
- Site e app Vercel com projetos gwd (goworld.digital) e gwd-app (app.goworld.digital), e previews READY do PR #12 no commit 6cc5ad0.
- Outros projetos ligados ao mesmo repo gwd-web e app; não apagar antes de inventariar owners/domínios.
- Branch exclusivamente documental do PR #13 gerou builds ERROR pelo motivo óbvio de não conter apps/web ou apps/app; isso não é regressão do PR #12.
- G4 Media real e Telegram EP04 ainda FAIL segundo docs do PR #12. Três clips de 10–12s são testes, não episódios finais.
- ARO no backend GWD tem adapter ainda mock/parcial; nenhuma compra ou comissão live deve ser afirmada.
- O uso TELEGRAM no código atual é handoff de canal, não MTProto external Range stream.
- Schema/migrations de DB e autenticação ainda requerem prova em ambiente real.

## 2. Regra sobre LearnHouse (KEEP / ADAPT / REPLACE)

Auditar LearnHouse OSS, funcionalidades, AGPL-3.0, capacidade de SSO/Bridge, API, curso, usergroup e comunidade, mas SEM BLOQUEAR a publicação do GWD Free + Academy já implementada.

Emite ADR KEEP/ADAPT/REPLACE: onde a Academy GWD atual funciona, mantém; onde LearnHouse reduz o custo e fornece funcionalidade superior, testar numa instalação isolada e integrar apenas após autenticação e permissões validadas. NÃO construir terceiro LMS, duplicar progresso/XP ou fazer refactor completo da Academy sem prova clara. Não fundir Buzz ou Discord no core.

Um único backend de aprendizagem por percurso publicado; contratos estáveis de aulas, matrícula, progressos e media. Um fornecedor pode ser substituído sem alterar catálogo Novidades, atribuição GWD ou direitos ARO.

## 3. Gate A — Auditoria e preparação operacional

- Validar CI, branches, PRs e SHA, sem merge cego.
- Mapear configs e branches de todos os projetos Vercel; conservar domínios nos projetos gwd e gwd-app.
- Confirmar acesso VPS, serviços Docker, Caddy, healthchecks, backups, logs, capacidade, ingress e domínio API.
- Confirmar Supabase Auth atual, RLS/migrations e conexão DB; não executar DDL diretamente na Master de produção sem backup e revisão.
- Inspecionar ARO e Atlas Media reais, rate limits, tenants, política FREE, token serviço-a-serviço e lista de conteúdos com direitos.
- Produzir docs/execution/AS_IS_VERIFIED.md e ADR LearnHouse com evidência, sem expor valores de secrets.

PASS: CI verde, compatibilidade de runtime e inventário real; cada blocker tem uma ação concreta atribuída ao executor ou Helena.

## 4. Gate B — Runtime completo Web/App/API/Worker

- Manter apps/web como landing/SEO, apps/app como produto autenticado; não criar novo repositório para website.
- Deploy dos frontends nos projetos Vercel gwd e gwd-app; configurar monorepo root directory, build, branch de release e previews protegidos. Não promover branch docs-only.
- Deploy apps/api e apps/worker na VPS com Docker/Caddy existente, rede e portas internas restritas, logs sanitizados, restart, backups, /health e /readyz.
- Criar ambiente DB controlado, aplicar migrations pequenas e RLS testadas; autenticar com Atlas/Supabase reais.
- Validar OTP/email, consentimento, sessão HttpOnly, logout, conta existente, lead original com attribution/source e retoma mobile.
- Fazer releases funcionais progressivas com feature flags; o público não deve ver recursos não homologados como disponíveis.

PASS: visitante real -> signup/OTP -> perfil -> dashboard real, persistido em DB; testes de negação entre contas; web/app/API/worker com health e URLs comprovados.

## 5. Gate C — Comunidade e percurso do membro

- Substituir CommunityScreen placeholder por discussão e moderação reais, recorrendo ao LearnHouse validado ou solução mínima nativa; manter opção Discord/Telegram/WhatsApp.
- Integrar somente convites e IDs verificados que Helena devolver, nunca criar novos links fictícios.
- Separar roles: MEMBER_FREE, AFFILIATE_CANDIDATE/ACTIVE, SELLER_CANDIDATE/APPROVED, MENTOR_APPROVED, TEAM_LEAD_APPROVED, COHORT e TEAM memberships.
- Criar percurso membro Free, formado com equivalência verificada, participante avançado, afiliado, vendedor, mentor e líder com equipa. Papéis não resultam automaticamente de XP.
- Turma A e B, recursos privados, validação no servidor, possibilidade de revoke e gestão limitada do mentor à turma e do líder à sua equipa.
- Integrar canais Discord via link e gestão manual verificada primeiro; OAuth2/role bot apenas quando autorizado/testado.

PASS: Free vê Free, candidato não vê partner, Turma A não lê B, mentor não lê turmas alheias, links de canais reais funcionam e revogação é demonstrada.

## 6. Gate D — Academy, Atlas Media e 3 origens

- Publicar cursos originais com direitos claros: um Free e um avançado, vídeos verdadeiros, Reader/PDF, quizzes, tarefas e progresso server-side; não declarar EP01-03 clips como cursos finais.
- Ligação Atlas Media catalog/token/gateway; Caddy HTTPS público apenas onde autorizado, JWT/TTL, fallback, CORS restrito, tenants ARO gwd e FREE policy correta.
- Player HLS VPS real com seek, buffering, refresh de token e 1/3/10 sessões autorizadas; custos e telemetria.
- YouTube embed de vídeo próprio/licenciado. Conteúdo public/unlisted não garante Premium/DRM; não o usar para proteger vídeos exclusivos.
- Telegram Native: bot/canal próprio e handoff seguro, abrir link não completa a aula.
- Telegram MTProto WebPlayer: REVISAO DE TERMOS E DIREITOS OBRIGATÓRIA antes de expor serviço externo; se autorizado, testar HTTP Range 206, chunks e cache limitada; sem contornar limites ou instalar gateway comercial sem GO de conformidade. Se não permitido, BLOCKED_POLICY e manter Telegram Native como terceira origem efetiva.
- PDF/WebReader com controle de acesso, conteúdo versionado e rights.
- Não misturar segredos de sessões Telegram dos Hermes com runtime de streaming.

PASS: VPS/HLS, YouTube e Telegram Native reproduzem/abrem conteúdos válidos no contexto permitido; Reader, quizzes e XP reais. Gate MTProto explícito.

## 7. Gate E — Sales Workforce + Novidades.Store + ARO

- Novidades.Store continua como catálogo; ARO é origem canónica do preço, checkout, order e entitlements; GWD tem partner attribution e comissão projetada.
- Implementar candidatura e aprovação verificável de afiliado, vendedor autorizado, mentor e líder; servidor e auditoria.
- Integrar oferta real Novidades (repo novidades-platform; usar branch/PR próprio a partir da PR #1), referência e links atribuídos server-side.
- Criar jornadas cliente direto e cliente referido; nenhum cliente é obrigado a aderir à GWD para comprar.
- ARO real por integração assinada, eventos idempotentes, retries/outbox e conciliação; order APPROVED + entitlement ACTIVE concede matrícula; refund/chargeback revoga direito conforme contrato.
- Sem inventar percentagem de comissão, preço ou ranking. Comissões por políticas comerciais aprovadas, reversal auditável e acesso privado.
- Não disparar PIX reais, reembolsos ou payouts sem gate financeiro explícito e reconciliação; fazer já todas as operações não financeiras REALMENTE possíveis no ambiente autorizado.

PASS: link afiliado autorizado e oferta verdadeira, purchase attribution provada, integração ARO e entitlement sem duplicação; financeiro live apenas com GO financeiro.

## 8. Gate F — Mentoria, gamificação, administração e QA

- Ledger XP verificado e idempotente (quiz, conclusão, tarefas, presença e ajuda útil aprovada), sem pontos por compra, recarregar página ou spam.
- Administrador concede capacidades de vendedor/afiliado/mentor/líder; critérios e evidências auditados; revoga roles e conteúdo imediatamente dentro do SLA documentado.
- Mentor atribuído gere a turma correta; Team Lead aprovada gere uma equipa própria com convites e integração de comunidade privada.
- Painéis dados reais, sem receitas ou testemunhos fabricados, com estados vazios honestos.
- Testar mobile 390/desktop 1440, acessibilidade, auth/RLS, antifraude, rate limiting, comportamento offline, backups/restore, logs e rollback.
- Atualizar os 30 cenários do Master Blueprint PR #13 com PASS/FAIL/BLOCKED real, timestamps e IDs pseudonimizados.

PASS: demos completas Free, Affiliation e Mentorship com testes de acesso negativo e retenção dos dados certos.

## 9. Política de execução até produção

O GO do fundador autoriza avançar de imediato e publicar componentes **após gates técnicos verificáveis**; não autoriza suprimir proteções, executar pagamentos reais de prova sem controlo nem usar Telegram fora dos termos.

Ordem de deploy:
1. Preview/staging real em Vercel + VPS API/worker + DB isolada.
2. Testes E2E de signup/comunidade/Academy.
3. Promover web/app e backend **das funcionalidades comprovadas**, mantendo flags OFF para serviços em falta.
4. Ativar media e grupos após entitlement/QA.
5. Ativar Business e compra apenas após transação real autorizada e reconciliação.
6. Ligar mentoria/equipa com acesso restrito e processo de suporte.
7. Só depois completar cadeia de merge para main: PR #7 → #12 → release changes, com CI verde, prova de rollback e proteção do histórico. Não forçar branch.

Proibir: chaves em Git, SQL destrutivo na Master, duplicação de apps Vercel, segredos no frontend, manipulação de preços pelo browser, role Discord Premium autoescolhido e números financeiros fictícios.

## 10. Handoff mínimo a Helena

Enviar apenas operação de que Claude Code não tem permissão: serviço/recurso preciso, comando/passo, motivo do bloqueio, pré-condições, impacto, como testar e rollback. Exemplos: Cloudflare DNS, secrets, Caddy privilégio, мигração Master prod, alteração de protected-domain Vercel, conta Telegram admin, autorização financeira ou incidente. Discord já foi delegado separadamente.

## 11. Entregáveis que têm de ser versionados

- docs/execution/AS_IS_VERIFIED.md
- docs/execution/KEEP_ADAPT_REPLACE.md
- docs/execution/ADR_LEARNING_ENGINE.md
- docs/execution/RELEASE_DEPLOY_RUNBOOK.md
- docs/execution/E2E_EVIDENCE_LOG.md
- docs/execution/STATUS_LIVE.md
- PRs de implementação de pequena dimensão, CI, screenshots, URLs de preview e produção, SHA de cada serviço.

O status por etapa deve conter PASS/FAIL/BLOCKED e evidências objetivas. Nunca declarar deploy completo apenas por Vercel READY.

## 12. Definition of Done final

Pessoa chega a goworld.digital, cria uma conta verdadeira, entra em app.goworld.digital, tem perfil, percurso Free/avançado, vê Academy com Reader, vídeo real VPS/YouTube e Telegram nativo, completa quiz e progresso+XP, junta-se a comunidade autorizada, pede/recebe aprovação comercial, gera link para oferta Novidades.Store, vê atribuição validada por ARO, adquire direitos de acesso quando há pagamento autorizado, e pode evoluir a mentor/líder de equipa com scope correto.

A plataforma real estará documentada, monitorizada, segura, com rollback pronto, evidências E2E e plano de ampliação. Qualquer integração impedida por policy/termos/licença fica claramente BLOCKED com alternativa funcional, nunca simulada.
