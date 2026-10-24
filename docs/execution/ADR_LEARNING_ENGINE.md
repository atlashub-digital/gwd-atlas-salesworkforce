# ADR — Motor de aprendizagem (Academy GWD vs LearnHouse) · 23/10/2026

**Estado:** ACEITE (KEEP Academy GWD; LearnHouse adiado para piloto isolado opcional)

## Contexto
A missão pede um único backend de aprendizagem por percurso, com contratos estáveis de aulas, matrícula, progresso e media, e proíbe um terceiro LMS ou duplicar progresso/XP. Já existe e está em produção na app: catálogo séries/temporadas/episódios, player HLS (Atlas Media), WebReader, quiz, Telegram handoff, progresso por segundos vistos e XP idempotente decididos no servidor, tiers FREE/MEMBER/PREMIUM/CERTIFIED com entitlement via ARO, RLS por participante.

## LearnHouse (verificado em learnhouse.app, docs e GitHub, 23/10)
- Core **AGPL-3.0** (obrigação de publicar código modificado servido em rede). **SSO/OIDC, RBAC fino, audit logs e white-label completo** estão na **Enterprise License** (paga, preço sob consulta).
- Stack: Next.js + **FastAPI/Python + Postgres + Redis + Tinybird**, instalação via CLI/Docker Compose.
- Funcionalidades fortes: editor de blocos, comunidades com fórum/upvotes, vídeo adaptativo, API REST, webhooks, pagamentos Stripe.

## Avaliação
| Critério | Academy GWD | LearnHouse |
|---|---|---|
| Identidade única (Supabase GWD) | nativa | só com OIDC = Enterprise, ou bridge própria |
| Entitlement ARO / sem preços no browser | nativo (adapter) | pagamentos Stripe próprios → conflito com ARO como autoridade |
| Media Atlas Media (token curto, tenant `gwd`) | adapter implementado | exigiria plugin/embedding próprio |
| Progresso/XP server-side idempotente | implementado + testes | duplicaria ledger |
| Turmas/equipas com isolamento | RLS GWD (a estender) | RBAC fino = Enterprise |
| Capacidade do host | cabe | Postgres+Redis+Python extra num host com 9 GB livres |
| Licença | própria | AGPL + EE |

## Decisão
- **KEEP** Academy GWD como backend único do percurso Free e avançado.
- **KEEP** Comunidade nativa V1 (espaços, publicações, respostas, denúncias, RLS) — mínimo moderado, sem dependência externa; Discord/WhatsApp/Telegram ficam como canais complementares com convites reais da Helena.
- **ADAPT (opcional, futuro):** se a Diana quiser o editor de blocos do LearnHouse para autoria, testar numa instância isolada (sem dados de membros) e exportar para o modelo `gwd.academy_*`; só avançar com orçamento EE (OIDC) aprovado e host com disco.
- **REPLACE: rejeitado** nesta fase (custo de licença/SSO, duplicação de progresso, conflito com ARO).

## Consequências
Nenhuma reconstrução da Academy. O contrato `gwd.academy_*` + `/v1/academy/*` mantém-se como interface estável; um fornecedor futuro teria de implementar esse contrato.
