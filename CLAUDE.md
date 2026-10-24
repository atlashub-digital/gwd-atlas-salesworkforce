# CLAUDE CODE — GWD EXECUTIVE DELIVERY CONTRACT (22/10/2026)

## Missão ativa
Transformar o código REAL deste repositório na plataforma operacional GoWorld.Digital, com comunidade, Academy, percurso de membros, afiliados, vendedores, mentores/equipas e integração Novidades.Store + ARO + Atlas Media.

**Executar a missão completa; não parar na auditoria, no frontend ou num relatório.** Trabalhar de forma incremental, com PRs pequenos, provas de funcionamento reais, deploys verificáveis, e regressão/rollback. O utilizador autorizou o avanço e a colocação em produção de funcionalidades homologadas; não interpretar isso como autorização para pagamentos de teste arbitrários, preços novos, mudança de segredos ou bypass de segurança.

## Ler nesta ordem antes de alterar código
1. `docs/execution/CLAUDE_CODE_FULL_DELIVERY_MISSION_V1.md` (instruções executivas desta branch).
2. [PR #12](https://github.com/atlashub-digital/gwd-atlas-salesworkforce/pull/12) e `docs/rebuild/STATUS_E_PROXIMAS_ETAPAS.md`, `docs/rebuild/MEDIA_GWD_CONTRACT_MATRIX.md`.
3. [PR #7](https://github.com/atlashub-digital/gwd-atlas-salesworkforce/pull/7), `docs/SOFT-LAUNCH-V1-ENGINEERING.md`, `docs/DIANA-GWD-PROJECT-OWNER-HANDOFF.md`.
4. [Blueprint Master #13](https://github.com/atlashub-digital/gwd-atlas-salesworkforce/pull/13): `docs/blueprint/GWD_MASTER_BLUEPRINT_V1.md`, `GWD_REAL_E2E_GATE_MATRIX_V1.md`, `GWD_DISCORD_HELENA_RUNBOOK_V1.md` na branch `docs/gwd-master-blueprint-v1-20261022`.
5. [Execução #15](https://github.com/atlashub-digital/gwd-atlas-salesworkforce/issues/15) e contratos da Novidades.Store/ARO.

## Código de referência e branch
- Base de código: `feat/gwd-platform-academy-rebuild` (inclui PR #7 empilhado).
- Branch de execução: `feat/gwd-e2e-production-delivery-v1`.
- Não começar do zero; preservar web, app, API, worker, identidade visual, contratos, base Academy/media e QA.
- Não fazer merge cego da branch de execução em `main`: ordenar PR #7 → PR #12 → delta de entrega, ou preparar plano equivalente verificável após proteção/CI.
- Não substituir a Academy por LearnHouse antes do diagnóstico KEEP/ADAPT/REPLACE e de prova de SSO/licença/custo. LearnHouse é candidato, não prerequisito para publicar GWD funcional.
- Discord está sob missão SEPARADA já entregue à Helena. Não recriar servidor nem pedir nova intervenção; consumir convite/IDs reais apenas quando devolvidos.

## Regras de engenharia
- Um writer principal, commits incrementais com testes, CI e evidência de cada gate.
- Inspecionar acesso real a GitHub, Vercel (projetos `gwd` e `gwd-app`), VPS, Caddy, Supabase e ARO. Executar pessoalmente tudo o que for possível. Enviar à Helena apenas ações realmente bloqueadas por permissões/segredos, com comando exato, recurso, impacto e rollback.
- Ambiente staging isolado para autenticação/DB/pagamentos; utilizar contas e conteúdos reais de teste, sem métricas, vendas, membros ou aprovações fictícias. Testes mocked podem continuar como testes unitários, nunca como única prova de integração.
- ARO é fonte única de verdade financeira/entitlement; GWD não fixa preço de checkout no browser nem gera receita fictícia.
- Streaming Telegram nativo é distinto de gateway externo MTProto; bloqueio de policy até revisão de condições de Telegram. Testar VPS HLS e YouTube autorizado já; sem evadir rate limits/flood waits.
- Nunca expor service_role, secrets, tokens ou IDs privados em issues, logs ou builds.
- Produção somente de componentes com QA E2E, autorização, backup, rollback e acesso correto. Pagamentos financeiros reais necessitam gate financeiro específico.
- Entregar URLs, SHA, capturas, testes reais (PASS/FAIL/BLOCKED), custos e pendências; não declarar produção completa sem endpoints funcionais.

## Direção de produto
GWD representa workforce/comunidade; Novidades é catálogo/loja; ARO cobra e autoriza; Atlas Media entrega media; LearnHouse pode gerir aprendizagem quando homologado; Discord/WhatsApp/Telegram complementam comunicação. Member Free, experiente, afiliado, vendedor autorizado, mentor e líder têm permissões distintas, não deduzidas apenas do XP.

## Critério final
Pessoa real: Landing → registo → dashboard/Academy → curso real vídeo+texto+quiz → progresso+XP → comunidade → candidatura/aprovação de capacidade → campanha/produto Novidades com link atribuído → ARO autorizado → direitos → formação/turma correta → mentor/equipa com isolamento. Falhas e permissões negativas testadas; rollout governado; sem duplicações de compra/comissão.

Ler e executar `docs/execution/CLAUDE_CODE_FULL_DELIVERY_MISSION_V1.md` integralmente.
