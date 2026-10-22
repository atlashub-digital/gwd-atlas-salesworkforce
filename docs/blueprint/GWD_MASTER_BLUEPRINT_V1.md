# GWD — MASTER BLUEPRINT V1.0
## Comunidade, Academy, Sales Workforce, Novidades.Store e Atlas Media

**Data:** 22-10-2026  
**Estado:** BLUEPRINT PARA REVISÃO — execução real por gates, sem autorização de produção implícita  
**Direção:** um produto GWD integrado; LearnHouse como candidato de motor educativo, não como dono de toda a operação  
**Owner funcional:** direção GWD / AtlasHub. **Coordenação:** Helena. **Engenharia:** Claude Code, com um único writer por área.  
**Repositório canónico:** https://github.com/atlashub-digital/gwd-atlas-salesworkforce

> Missão: transformar interessados em membros ativos; capacitar participantes novos e já experientes; formar afiliados, vendedores, mentores e líderes de equipa; sustentar comunidades reais; distribuir ofertas Novidades.Store com atribuição comercial verificável; criar um produto operacional antes de o replicar no Atlas Club.

## 0. Situação real e regras de partida

1. O repositório GWD tem a main documental inicial e desenvolvimento extenso ainda fora da main: PR #7 (Soft Launch) e PR #12 (Academy Streaming sobre o #7). Nunca classificar trabalho em PR como produção.
2. A Academy GWD já dispõe, em branch, de modelo de séries/temporadas/episódios, progresso server-side, XP, quiz, WebReader, HLS/Atlas Media e handoff Telegram. Parte depende de dados, migrações e contratos por homologar.
3. O projeto Novidades.Store tem rebaseline digital-first no PR #1 de novidades-platform. Novidades.Store continua responsável pelo catálogo comercial e pela experiência de compra, não pelo ledger de comissões GWD.
4. ARO continua a ser a autoridade de pagamento, estado de encomenda, preço autorizado e entitlement. Não construir checkout paralelo no LearnHouse ou GWD.
5. A AtlasHub Master/Supabase Auth é a identidade canónica desejada. A sessão LearnHouse não é equivalente por defeito; SSO/bridge é gate obrigatório.
6. O produto terá testes com utilizadores e conteúdos reais, sem contagens, testemunhos, vendas ou certificados inventados. Testar sem produção aberta não significa usar dados falsos: significa um ambiente controlado e contas de teste legítimas.
7. Sem alterar produção, DNS, chaves, bots, permissões reais de pessoas, migrações ou checkout até aprovação explícita dos respetivos gates.

**Referências de implementação:** GWD PR #7 e #12, issues #9-11; Novidades PR #1; ARO contratos no atlashub-finance; Atlas ClubOS Blueprint V1.0 (22/10/2026).

## 1. Fronteiras dos produtos

| Contexto | Dono da verdade | Inclui | Não inclui |
|---|---|---|---|
| GWD | gwd-atlas-salesworkforce | pessoas, capacidades comerciais, equipas, jornadas, campanhas atribuídas, XP GWD, ledger de comissão derivado | checkout ou emissão de entitlement financeiro |
| Novidades.Store | novidades-platform | merchandising, catálogo e página de oferta, categorias, descoberta, SEO e conversão | remuneração GWD, LMS ou pagamentos diretos fora ARO |
| ARO | atlashub-finance | produto/oferta comercial canónica, preço autorizado, checkout, order/payment, entitlement e eventos | currículo, turma, progresso |
| Atlas Learning / LearnHouse | instalação educativa validada | cursos, aulas, grupos, progressos, exercícios, certificados | preço, pagamento, comissões |
| Atlas Media | gateway e catálogo técnico | media_asset_id, origem, formato, player, autenticação e métricas de entrega | identidade comercial, curso ou matrícula |
| Discord / WA / Telegram | canais externos | comunicação, diálogo e notificações consentidas | progresso académico, direito Premium ou prova de pagamento |
| Atlas Club | atlashub-club | comunidade tech, Genesis, Atlas Lab e produto Club | operação comercial GWD |

**Repositórios:** manter o monorepo GWD para web/app/api/worker. Não criar um repositório só para a webpage. Só extrair um repo atlas-learning-foundation quando houver dois consumidores reais e uma fronteira de reutilização provada. Evitar redeploy/rebuild paralelo de um segundo motor LMS GWD.

## 2. Objetivos e não objetivos

### Objetivos V1
- Landing real de convite, registo Free, onboarding, catálogo de percursos e comunidade operacionais.
- Participantes já capacitados entram diretamente num percurso ajustado, mediante validação; ninguém é forçado a repetir formação introdutória por defeito.
- Cursos vídeo, texto, PDF/WebReader, quizzes, tarefas, certificados condicionados a evidência; experiência mobile.
- Comunidades GWD com canais externos opcionais, fórum nativo e espaços reservados por turma/equipa.
- Estrutura de afiliados, vendedores autorizados, mentores e líderes com aprovação explícita, links atribuídos e dados comerciais reais.
- Prova de ligação GWD → Novidades.Store → ARO → entitlement → matrícula → XP/competência, sem duplicar ordens.
- Testes efetivos de três fornecedores de conteúdo: Telegram (handoff nativo e estudo MTProto), VPS/Atlas Media e YouTube autorizado.
- Observabilidade, audit trail, segurança e controlo de custos.

### Não objetivos V1
- Recriar Discord, WhatsApp, LearnHouse ou motor financeiro ARO.
- Automatizar aprovação de vendedores ou de mentores exclusivamente por XP.
- Criar remuneração multinível por recrutamento; esse modelo não está aprovado.
- Lançar marketplace de terceiros sem verificação de direitos e qualidade.
- Monetizar streaming externo Telegram sem revisão de termos e autorização.
- Abrir simultaneamente Atlas ClubOS e GWD Academy reconstruídos.

## 3. Modelo de participação e evolução

**Dimensões independentes** (não condensar num único role):
1. Identidade: master_user_id e perfil.
2. Membership: FREE, MEMBER, programas/turmas.
3. Entitlement: recurso/curso/tier/oferta, com origem ARO, convite ou grant administrativo auditado.
4. Papel operacional: participante, mentor, moderador, administrador.
5. Capacidade comercial: AFFILIATE_CANDIDATE, AFFILIATE_ACTIVE, SELLER_CANDIDATE, SELLER_APPROVED, TEAM_LEAD_APPROVED.
6. Certificações e competências: formação, experiência comprovada, avaliação e histórico.
7. Equipa: membership temporal com líder e âmbito; a mesma pessoa pode pertencer a comunidades e turmas distintas.

### Jornada A — entrada Free
Origem UTM/referral → landing GWD → registo Atlas Identity com consentimentos → Member Free → aceitação de regras → onboarding por objetivo (aprender, divulgar, vender, orientar, formar equipa) → aula/recurso Free → comunidade geral e canais externos opcionais → escolha de percurso. Nenhum acesso comercial concedido apenas pela resposta a um formulário.

### Jornada B — membro já formado
Registo + declaração de experiência → submissão voluntária de evidências/certificações ou avaliação de conhecimentos → verificação pelo responsável → equivalência de competências registada e auditável → módulos dispensados quando policy permitir → acesso ao percurso avançado apropriado. Recusa não elimina o acesso Free. Evidência não é exposição pública de dados pessoais.

### Jornada C — afiliado
Candidatura → regras e termos comerciais → formação/avaliação requerida OU equivalência aceite → aprovação server-side → catálogo de campanhas permitidas → geração de referral link/code → visualização de cliques e vendas atribuídas (dados mínimos, sem PII do comprador) → acompanhamento e formação contínua. AARO/ARO confirma ordens; GWD calcula projeções/ledger, não cria pagamento.

### Jornada D — vendedor autorizado
Candidatura específica → diligência e autorização conforme política → capacidades e ofertas autorizadas → formação obrigatória de regras, preço e atendimento → link de vendedor com atribuição e preço validado por ARO → report de atividade e reversões. Não permitir que o browser defina preço ou comissão final.

### Jornada E — mentor e líder de equipa
Membro → evidências de competência, contribuição útil, formação de mentoria e avaliação → candidatura ou convite → aprovação humana auditada → atribuição a uma turma e ferramentas de acompanhamento limitadas aos seus membros → elegibilidade para constituir uma equipa própria mediante aprovação adicional → espaço privado de equipa, onboarding dos convidados, calendário e objetivos reais. Não criar automaticamente equipa nem direito administrativo por pontos, recrutamento ou vendas.

### Jornada F — cliente direto Novidades.Store
Campanha/redes sociais → página temática/produto Novidades → oferta e checkout ARO quando aplicável → entitlement → acesso educativo/Reader/Media da oferta. Não criar conta de afiliado GWD involuntariamente. Se utilizar um link GWD válido, a atribuição da venda é guardada sem obrigar o comprador a aderir à rede.

## 4. Taxonomia da experiência

GWD:
- Portal público: proposta, equipa, oportunidades reais, FAQ, registo, privacidade.
- Área do membro: home personalizada, perfil, próximas ações, cursos, comunidades, mensagens de contexto, agenda.
- Academy: programas → percursos → cursos → módulos → aulas → atividades; turmas concretas com mentores e calendários.
- Comunidade: geral Free, comunidades temáticas, turmas privadas, equipas privadas, mentores e moderação.
- Business: catálogo elegível, campanhas, links, atribuições, report e ledger de comissão.
- Gamificação: XP auditado por atividade real, badges, competências, níveis não financeiros e rankings com opt-in.
- Backoffice: perfis, aprovações, conteúdos, turmas, campanhas, permissões, auditoria e operações.

As categorias comerciais da Novidades.Store (Vida Saudável, Pets, Cozinha, Desenvolvimento Pessoal, Marketing, Vendas e outras) não geram automaticamente comunidades ou Academias. Criar academia somente onde há um programa educativo real.

## 5. Discord, WhatsApp e Telegram

Comunicação multicanal desde V1, mas membership e autorização continuam GWD/LearnHouse/ARO.

**Discord:** preferir um servidor oficial GWD, com onboarding Community e roles. Ver o documento GWD_DISCORD_HELENA_RUNBOOK_V1.md; preparar convites de teste e depois convite público validado, nunca inventar link. Papéis autoescolhidos no Discord são interesses, não direitos Free/Premium/comerciais. Reservados são concedidos via aprovação no GWD e ligação consentida à conta Discord, manualmente na primeira fase e automatizáveis mais tarde.

**WhatsApp:** um grupo geral opcional por comunidade, grupos de turma/equipa apenas quando necessário; convite gerido por moderadores; não carregar dados pessoais ou financeiros para o grupo. Sem promessa de revogação instantânea via WhatsApp se não houver automação homologada.

**Telegram:** separar grupos de conversa/avisos de canais proprietários usados como origem de conteúdos. Os membros podem abrir uma aula no Telegram nativo, se tiverem acesso devido. Telegram handoff não comprova conclusão. Não reutilizar os mesmos bots/sessões de operação Hermes para sustentar múltiplas reproduções de media; segredos e sessões dedicados e auditados.

**Envolvimento:** publicação semanal de orientação, sessão de boas-vindas, desafio por percurso, dúvidas em fórum, encontros com mentores e reconhecimentos apenas por evidência real. Não inundar chats com campanhas e automações.

## 6. Base educativa — decisão condicionada

Hipótese prioritária: LearnHouse OSS numa instalação de staging, release fixa e auditada. Aproveitar cursos, capítulos, vídeo, recursos, usergroups, comunidade, tarefas, progressos e certificados onde suportados. O GWD fornece interface, IAM, domain, XP e integrações necessárias.

Não executar fork profundo imediatamente. Fazer P0 KEEP/ADAPT/REPLACE do código GWD PR #7/#12 contra LearnHouse, com contratos e testes. A instalação LearnHouse precisa de base PostgreSQL/Redis isoladas, migrações auditadas e backup/restore. Não correr Alembic na AtlasHub Master de produção.

SSO single identity: master_user_id é identificador canónico, mapeado para learnhouse_user_id numa identity_links. Validar sessão e emissão no servidor, provisionamento idempotente, logout, revogação e mudanças de email. Confirmar licenças (LearnHouse AGPL-3.0, capacidades Pro/Enterprise) antes de utilizar SSO/API headless. Se SSO viável não existir, declarar NO-GO para login único — não simular.

Só promover pacote partilhado Atlas Learning Foundation após um percurso GWD real homologado e outro consumidor identificado.

## 7. Plataforma comercial e integrações

**Novidades.Store** é catálogo e experiência editorial; produtos e ofertas possuem IDs canónicos, direitos, origem e estado. **ARO** valida checkout, preço, estado da encomenda e entitlement. **GWD** gere partner_id, campaign_id, referral_code, attribution_id, tipo de capacidade, comissão calculada segundo contrato e respetivas reversões.

Fluxo:
- Afiliado com capacidade ativa cria link com código opaco associado a produto/oferta.
- Visitante entra na página Novidades e a atribuição é registada server-side com prazo e consentimento adequados.
- ARO recebe oferta e metadados assinados/validados no servidor; comprador paga no fluxo oficial.
- ARO APPROVED + entitlement ACTIVE: evento assinado e idempotente; Novidades/Academy provisiona acesso.
- GWD recebe evento canónico e deduplica; cria entrada de ledger apropriada, com reversões para refund/chargeback.
- Falha de matrícula NÃO transforma compra em falhada; fila de reconciliação permite recuperar.
- Nem o navegador nem Discord nem Telegram confirmam pagamento ou outorgam entitlement.

Testar primeiro com produto elegível e preço real configurado, mas sem charge financeiro até autorização específica do gate E7/ARO. Os resultados de testes financeiros devem ser verdadeiros, controlados, conciliados e registados; não existem compradores ou vendas fictícias mostradas ao público.

## 8. Atlas Media — registry e providers

Cada aula aponta para media_asset_id e access_policy_ref, nunca diretamente para identificador secreto de canal, token ou caminho interno. Atlas Media tem adapter que devolve sessão temporária para player com tipo, URL autorizada e expiração. Progresso pertence ao domínio educativo, não ao media.

**Provider ATLAS_HLS (VPS):** conteúdo próprio H.264/AAC → HLS fMP4/MP4 no Atlas Media Gateway; proteger manifest, init e segmentos; Range/206 quando aplicável; CORS e emissão curta de token; renovação durante sessão longa; telemetria.

**Provider YOUTUBE_EMBED:** conteúdo próprio ou licenciado incorporável, respeitando regras YouTube e privacidade; vídeo público/unlisted não equivale a DRM nem protege Premium; apenas para recurso apropriado. Verificar bloqueios embed e reprodução em navegadores.

**Provider TELEGRAM_NATIVE:** handoff para mensagem/canal/grupo autorizado, com processo de convite e validade; nunca marcar aula como concluída só por abrir o Telegram. Permitido apenas sob regras dos canais e plataforma.

**Provider TELEGRAM_MTProto_STREAM (EXPERIMENTAL CONDICIONAL):** canais geridos pela AtlasHub, leitura MTProto de metadados/chunks com sessões separadas, bridge HTTP Range e cache limitada. Riscos: file_reference, codec, 206, latência, limites, largura de banda VPS, FloodWait, ausência de CDN próprio. **Bloqueador legal:** os termos Telegram API e Content Licensing restringem utilização de dados fora do uso pretendido, e os Bot Developer Terms restringem cloud storage sites/external services. Avaliar formalmente se o caso de streaming externo pode ser autorizado; até confirmação, NÃO disponibilizar streaming MTProto WebPlayer a clientes pagos ou produção. Um teste interno apenas poderá ocorrer se a revisão de termos o autorizar; caso contrário testar TELEGRAM_NATIVE + ATLAS_HLS + YOUTUBE_EMBED, que já dão três origens reais.

**Provider DOCUMENT:** PDF/WebReader, EPUB ou conteúdo estruturado com controlo de acesso e direitos editoriais, sem URL permanentemente pública para premium.

**Métricas de media:** startup latency, time-to-first-frame, buffering, seek, completion event, tráfego de saída por origem, rate limit, cache-hit e erro, 1/3/10 reproduções simultâneas com participantes autorizados. O gateway não elimina custo de banda de saída.

## 9. Dados e eventos mínimos (modelo conceptual, NÃO é DDL)

- identities: master_user_id, learnhouse_user_id, discord_user_id se consentido; nunca usar email como PK intersistemas.
- people: participant_id, public_profile, consent_history, locale, referral_source, lifecycle_status.
- memberships: principal_id, scope_type, scope_id, role, start/end, status, authorized_by.
- access: entitlement_key, issuer, resource_type/resource_id, status, ARO_order_id/grant_id, expiration, revocation.
- learning: academy/program/course/module/lesson, cohort, enrolment, lesson_progress, quiz_attempt, certification, assignment.
- capacities: capability_code, evidence_ref, issuer, validation_status, expiry; separadas de níveis XP.
- teams: team_id, leader_id, membership temporal, team_channel_refs, audit.
- commerce: campaign_id, partner_id, offer_id, referral_token, click attribution with retention limits, order_event_id, ledger_event_id, reversal_ref.
- community: external_platform, guild/group/channel_id, invite_type, moderation, membership_projection, last_sync_at.
- media: media_asset_id, provider, source_ref secure, source_health, rights_status, playback_mode, fallback_priority.
- gamification: xp_event_id, idempotency_key, source_event, rule_version, scope, points, reversed_at, badge/capability separate.
- integration: outbox/inbox, event_id, version, delivery state, retries/dead-letter, audit.

**Autoridades:** Auth identifica; ARO decide direito financeiro; Academy decide aprendizagem/progresso; GWD decide elegibilidade comercial e equipa; Atlas Media decide entrega técnica após entitlement; Discord/WA/Telegram são projeções voluntárias. Evitar escrita cross-database sem contrato e reconciliação.

## 10. Gamificação e motivação

- XP por lição e tarefa verificadas, avaliação aprovada, contribuição validada, presença confirmada e mentoria autorizada; cada evento idempotente e auditável.
- Nunca XP por pagamento ou contratação; impedir duplicação por recarregar vídeo, reenviar evento ou clique em convite.
- Percursos sugeridos: Explorador → Membro Ativo → Aprendiz/Profissional → Afiliado/Vendedor Autorizado (capacidades, não níveis) → Mentor → Líder de Equipa.
- Acesso comercial/mentoria é capacidade concedida, não consequência automática de pontos.
- Dashboards mostram próximo passo, desafios, progresso, apoio do mentor, calendário e conquistas reais; proibir rankings falsos, escassez fictícia e testemunhos inventados.
- Leaderboards de desempenho com opt-in, agregados e políticas de privacidade, especialmente para menores. Dados de comissões e vendas não surgem em chat público.

## 11. Painéis e UX

Portal público GWD: proposta, como funciona, percursos Free/Afiliado/Vendedor, benefícios honestos, condições, FAQ, registo, suporte.
App de membro: Início, Aprender, Comunidade, Turmas, Desafios, Eventos, Produtos permitidos, Conquistas, Perfil.
Parceiro ativo: Catálogo, Campanhas, Links, Vendas atribuídas, Comissões, Formação e Suporte.
Mentor: Turmas, Agenda, materiais, evidências, feedback, sinalizações e membros atribuídos.
Líder: Equipa autorizada, onboarding, objetivos e atividade agregada; sem acesso irrestrito a PII/finanças de outros membros.
Admin: Gestão de acessos, moderação, aprovação de capacidades, conteúdos, integrações, auditorias.
UI PT-BR primeiro, responsiva a 390/1440 px, acessível, sem números inventados e sem páginas que afirmem integrações não homologadas.

## 12. Operação de conteúdos e QA

AMF/Laura-Rui podem produzir assets e manuscritos, não alterar diretamente entitlements. Cada conteúdo publicado necessita de owner, licença/autorização, revisão, versão, capa, título, objetivos, transcrição quando viável, metadados, formato/codec, classificação Free/Premium, política de conclusão, fonte primária/fallback e data de revisão. Conteúdo adquirido/licenciado/PLR não é automaticamente aprovado para revenda.

Publicação segue DRAFT → REVIEW → RIGHTS_CHECK → APPROVED → PUBLISHED → RETIRED, com QA em mobile/desktop, WebReader/PDF, acessibilidade e ligação de media. Reutilizar o mesmo asset noutros cursos apenas com autorização, preservando progresso por contexto quando necessário.

## 13. Segurança, conformidade e privacidade

- Roles/entitlements avaliados no servidor em cada recurso; RLS onde aplicável; checks entre Turma A e Turma B, FREE vs PREMIUM e parceiro ativo vs candidato.
- Discord e Telegram IDs associados só após consentimento e verificação; revogação/remoção manual operacional quando API não existir.
- Segredos no cofre, nada em PR, logs ou frontend; bots com menor privilégio; rate limit, proteção contra spam/raid, revisão de dependências.
- Segurança dos convites: URLs não são fonte de direito; expiração/uso limitado quando adequado; convites privados separados do público.
- Privacidade de compradores, menores, empregados e equipas; moderação, denúncia, política de retenção LGPD.
- Contas de teste reais e autorizadas, com dados mínimos, sem usar compras de terceiros nem divulgar informações comerciais privadas.
- Revisão AGPL e licenças LearnHouse antes de release de fork modificado; revisão específica dos termos Telegram antes do gateway MTProto.
- Não publicar diretamente a saída IA como orientação comercial ou jurídica; tutor IA usa somente contexto autorizado.

## 14. Plano de execução por gates — sequência única

**G0: Governança, branch e auditoria (sem produção).**
- Aprovar este Blueprint, reconciliar issues GWD #6/#9/#10/#11 e PR #7/#12.
- Confirmar estado real de Novidades PR #1, ARO, Atlas Media e Auth.
- Criar matriz KEEP/ADAPT/REPLACE, inventário de VPS, licenças, contratos, permissões e riscos.
- Entrega: ADRs aprovadas, testes e donos designados.

**G1: Canais reais + autenticação Free.**
- Helena verificar se servidor GWD Discord já existe, configurar sem duplicar; preparar onboarding, regras, moderação, convites reais.
- Confirmar grupos WhatsApp e Telegram oficiais ou criar após autorização, registar IDs/links no cofre operacional.
- Testar signup Atlas, adesão à comunidade e ligação opcional Discord. Dois utilizadores reais e isolamento de papéis.
- Entrega: membro Free navega realmente, entra no servidor de acordo com papel e tem suporte, sem conteúdo inacessível.

**G2: Learning Foundation em staging.**
- Instalar LearnHouse fixado num release homologado em DB isolada, testar API/SSO/autorização/licenças, comparar com código GWD Academy.
- Publicar uma trilha Free de integração GWD e uma trilha avançada/mentoria com direitos validados.
- Testar utilizador novo, utilizador já formado, duas turmas, quiz, reader, progresso e certificado.
- Entrega: jornada pedagógica real E2E sem login duplicado ou blocker documentado.

**G3: Atlas Media multi-source.**
- Reutilizar Atlas Media VPS; testar HLS real e YouTube autorizado; verificar Telegram Native; protocolo MTProto apenas após análise dos termos.
- Verificar browser/Android, Range, tokens, expiração, métricas, consumo de banda e autorização cruzada.
- Entrega: 3 origens reais verificadas no seu contexto permitido; sem bypass do entitlement.

**G4: Business real integrado.**
- Atribuir capacidade a 1 parceiro autorizado, ligar 1 oferta real da Novidades, gerar referência, testar atribuição e consulta de direitos.
- ARO simula? NÃO. Usar fluxo não financeiro real até gate de cobrança; qualquer compra real E7 tem autorização expressa, orçamento e conciliação.
- Entrega: evento real com trilho auditável; zero comissão duplicada e zero confirmação por browser.

**G5: Mentoria e equipas.**
- Aprovar primeiro mentor e líder, criar turma privada e equipa com quotas e âmbito, verificar isolamento e relatórios.
- Testar recusa e revogação de papéis, entrada de membro já capacitado e gamificação verificada.

**G6: Homologação, consentimento e lançamento controlado.**
- Backups/restauro, regressão E2E, segurança, acessibilidade, mobile, observabilidade, licenças, rollbacks.
- Rollout a um pequeno grupo real consentido; só escalar após GO separado para cada componente, sem fazer merge cego na main.

## 15. Critérios E2E de aceitação

Consultar documento GWD_REAL_E2E_GATE_MATRIX_V1.md. Todos os testes requerem evidência verificável (timestamp, user_id pseudonimizado, ID de evento, logs sanitizados, screenshots e resultado). Não escrever PASS sem execução observada.

Critérios estruturais essenciais:
- Visitante novo regista-se e acede a Free; candidato não vê canais internos.
- Formado verificado pode entrar no módulo avançado sem completar novamente tudo.
- FREE tenta aula/Discord de turma Premium → DENY; membro autorizado → ALLOW.
- Episódio vídeo real e reader persistem progresso e conclusão; refresh não gera XP repetido.
- Um afiliado ativo recebe link e attribution real; candidato não.
- ARO APPROVED gera uma única matrícula; repetição/reordenação webhook não duplica direito ou comissão.
- Mentor vê somente os seus participantes; líder gere somente a sua equipa.
- Acesso pago revogado bloqueia recursos e agenda remoção de papel externo, com audit.
- Vimeo/YouTube/VPS/TG providers não dão acesso só por URL ou ID de asset; YouTube público é caso explicitamente não protegido.
- Falha de media, ARO, gateway ou Discord não destrói registos canónicos.

## 16. Responsabilidades

**Direção AtlasHub/GWD:** aprovar produto, políticas comerciais, papéis, comunidade e gates financeiros.
**Helena:** único coordenador operacional, Discord/Telegram/WA, VPS, segurança, custos, backups, CI, gates, logs e convites reais.
**Claude Code:** único owner de implementação do GWD; auditoria dos PRs, base LearnHouse, integrações, testes, PRs pequenos, documentação, evidências. Sem múltiplos agentes a escrever o mesmo módulo/branch.
**AMF/Laura/Rui:** revisão e produção de cursos/media, direitos, QA e peças de captação.
**Moderadores e mentores:** gestão de canais, suporte a novos membros, validação de evidências e escalonamento humano.
**ARO/Novidades owner:** catálogo, ofertas e contrato de atribuição; sem alterar preços ou pagamentos fora do circuito homologado.

Helena e Claude Code podem trabalhar em paralelo no mesmo piloto GWD, mas em responsabilidades distintas. Atlas Club continua com manutenção crítica e decisões próprias; não arrancar um segundo fork LMS em simultâneo.

## 17. Indicadores de sucesso

Ativação: leads qualificados, registos concluídos, primeira aula concluída, adesão voluntária a comunidade.  
Aprendizagem: aulas concluídas, percentagem de percurso, competências validadas, retenção 7/30 dias.  
Operação: tempo para aprovar parceiro/mentor, pedidos de suporte, incidentes de moderação, tempo de provisionamento.  
Comércio: links ativos, atribuição reconciliada, pedidos aprovados ARO, reversões, comissão auditável (sem fabricar vendas).  
Media: sucesso de reprodução, startup, buffering, GB de saída, taxa de erro por provider, custo estimado.  
Segurança: violações de acesso nos testes = 0, fugas de dados = 0, revogação funcional, backup recuperável.

## 18. Riscos e gates bloqueantes

| Risco | Gate |
|---|---|
| LearnHouse OSS não suporta SSO/API requeridos | Bloquear integração SSO; avaliar Enterprise/adapter autorizado, sem contorno de licença |
| Dados GWD/Club/Academy cruzados | Isolamento por instalação/schema/role e testes negativos obrigatórios |
| VPS sem capacidade | Benchmark de RAM/CPU/disco/banda e budget antes de instalar |
| Telegram externo incompatível com termos | Bloquear stream MTProto e usar entrega Telegram nativa ou VPS/fornecedor autorizado |
| Vídeo YouTube Premium não protegido | Não tratar embed público como entitlement ou DRM |
| ARO indisponível ou webhook falho | Event outbox/retry/reconciliação, nenhuma venda falsa ou direito antecipado |
| Discord permissões e links replicados sem controle | Papéis server-side, onboarding limitado a interesses, teste com conta sem acesso |
| Construção de segundo LMS sobre código atual | KEEP/ADAPT/REPLACE obrigatório, decisão de fork antes de desenvolver |

## 19. Fontes canónicas e leituras

- GWD: https://github.com/atlashub-digital/gwd-atlas-salesworkforce
- GWD PR #7: https://github.com/atlashub-digital/gwd-atlas-salesworkforce/pull/7
- GWD PR #12: https://github.com/atlashub-digital/gwd-atlas-salesworkforce/pull/12
- Novidades PR #1: https://github.com/atlashub-digital/novidades-platform/pull/1
- ARO: https://github.com/atlashub-digital/atlashub-finance
- LearnHouse: https://github.com/learnhouse/learnhouse
- Discord onboarding: https://support.discord.com/hc/en-us/articles/11074987197975-Community-Onboarding-FAQ
- Discord rules: https://support.discord.com/hc/en-us/articles/1500000466882-Rules-Screening-FAQ
- Telegram API: https://core.telegram.org/api/terms
- Telegram content licensing: https://telegram.org/tos/content-licensing
- Telegram bot developer: https://telegram.org/tos/bot-developers
- Telegram chunk download: https://core.telegram.org/method/upload.getFile
- Atlas ClubOS Blueprint de 22-10-2026 — documento de referência do fundador, não autoriza acoplamento Club/GWD.

## 20. Próxima ordem de execução

1. Helena: verificar canais externos GWD existentes; preparar Discord segundo runbook e devolver IDs/convites válidos e relatório de permissões; não publicar links na documentação pública antes de aprovar.
2. Claude Code: auditar PRs #7/#12 e LearnHouse; entregar KEEP/ADAPT/REPLACE, ADRs SSO/DB/Media e CI de testes reais.
3. GWD Owner: selecionar um curso Free, um curso restrito e uma oferta Novidades com direitos de publicação verificados.
4. ARO Owner: certificar ambiente e condição explícita de ensaio financeiro real, separado do gate técnico.
5. Direção: homologar resultados G0/G1 antes de seguir para implementação ampla.

**Definition of Done V1:** uma pessoa real entra por uma campanha GWD, regista-se uma só vez, tem comunidade opcional corretamente segmentada, completa aula/quiz/reader com progresso persistido, avança para a capacidade aprovada (ou recebe recusa clara), acede a oferta Novidades com link atribuível, e a transação ARO controlada — quando expressamente autorizada — provisiona entitlement sem duplicação. Um mentor aprovado gere a sua turma/equipa sem ver dados de outros. Os media reais funcionam em providers autorizados. Todos os resultados com prova E2E e rollback definido.
