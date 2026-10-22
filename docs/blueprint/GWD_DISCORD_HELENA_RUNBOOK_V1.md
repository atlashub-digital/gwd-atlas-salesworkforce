# GWD — DISCORD COMMUNITY RUNBOOK PARA HELENA V1.0

**Data:** 22/10/2026  
**Responsável:** Helena (AtlasHub Operations)  
**Estado:** proposta de configuração + checklist. **Nenhum servidor, role ou convite é declarado criado por este documento.**  
**Objetivo:** disponibilizar um servidor oficial GoWorld.Digital, simples de utilizar, com conteúdos gerais, aprendizagem, espaço de parceiros autorizados, mentoria e equipas privadas. Integrar o convite real na plataforma GWD depois de QA.

## 1. Regra de ouro antes de começar
1. Verificar inventário AtlasHub: o Discord GWD já existe? Quem é owner? Quais bots e grupos existem? Se existir, AUDITAR E REUTILIZAR, não criar servidor duplicado.
2. Confirmar owner humano e dois administradores de continuidade com MFA; nunca atribuir Administrator a bots de onboarding.
3. Usar servidor Community, configuração de Rules Screening, Community Onboarding, AutoMod e segurança anti-raid.
4. Não misturar este servidor com o Discord interno de operação AtlasHub/AMF nem com eventuais servidores Atlas Club. Integração futura possível sem juntar audiências e segredos.
5. Roles autoatribuídos indicam interesses ou temas; não dão acesso a Premium, dados comerciais ou equipas. Esses roles exigem verificação de entitlement/capacidade GWD, manual na V1 e via bot OAuth2 autorizado futuramente.
6. Não publicar no GitHub URLs de convite que concedam papéis privados, webhooks ou tokens.

## 2. Proposta de nome, descrição e regra de boas-vindas

**Nome:** GoWorld.Digital | Comunidade & Academy  
**Descrição:** Aprende. Partilha. Evolui. Uma comunidade para desenvolver competências digitais, colaborar em equipa e descobrir oportunidades comerciais autorizadas, com formação, apoio e respeito.
**Mensagem curta:** Bem-vindo ao GWD. Começa por ler as regras, apresenta-te e visita o Guia de Início. Para aulas, percurso, materiais e benefícios, utiliza a área do membro GoWorld.Digital; aqui conversamos, aprendemos e colaboramos.
**Regras principais:** respeito e inclusão; sem spam, promessas de rendimentos, pirataria, venda não autorizada, dados pessoais de terceiros ou abordagem comercial invasiva por DM. Remover mensagens comerciais não autorizadas. Denúncias via moderação. Publicações com IA devem respeitar as regras de conteúdo e privacidade.

## 3. Papéis (roles) — separar acesso operacional e interesse

**Sistema/gestão** (somente por owner/admin):
- GWD_OWNER — propriedade, governança e recuperação.
- GWD_ADMIN — configuração, auditoria e operação, limitado a pessoas de confiança.
- GWD_MOD — moderação e acolhimento, sem controlo financeiro e sem Administrator.
- GWD_STAFF — equipa operacional, anúncios e apoio, sem permissões de gestão irrestrita.
- GWD_BOT — integrations de menor privilégio, com papéis separados quando necessário.

**Percurso/autoridade GWD** (atribuídos após comprovação na plataforma):
- MEMBER_VERIFIED — membro registado e verificado GWD.
- AFFILIATE_ACTIVE — afiliado aprovado.
- SELLER_APPROVED — vendedor autorizado.
- MENTOR_APPROVED — mentor validado.
- TEAM_LEAD_APPROVED — líder de equipa aprovado.
- COHORT_<ID> — aluno de turma específica (p.ex. COHORT_GWD_START_A).
- TEAM_<ID> — membro de equipa específica, só se houver necessidade real de espaços privados.

**Interesses** (onboarding público, sem benefícios protegidos):
- INTEREST_LEARNING
- INTEREST_AFFILIATION
- INTEREST_SALES
- INTEREST_MENTORSHIP
- INTEREST_MARKETING
- INTEREST_CONTENT

Regras de segurança: @everyone vê apenas zonas públicas de boas-vindas e comunidade; admin/moderador/mentor têm vista mínima para a sua função; categorias privadas começam View Channel desativado para @everyone, sendo permitidas apenas aos roles verificados. A hierarquia de roles do bot deve ser inferior aos roles administradores, e o bot só pode gerir roles abaixo do próprio.

## 4. Árvore de canais sugerida

**00 | COMEÇA AQUI** — visível a recém-chegados:
- #boas-vindas — somente staff publica, mensagem fixa com percurso de entrada.
- #regras-e-seguranca — somente staff, política da comunidade e privacidade.
- #guia-de-inicio — passos: registo GWD, definir interesses, entrar na Academy, onde pedir ajuda.
- #anuncios-oficiais — anúncios moderados, sem auto-promoção.
- #ajuda-na-entrada — fórum ou texto moderado para problemas de login e integração, sem dados sensíveis.

**01 | PRAÇA GWD** — Member Verified; alguns canais podem ser visíveis aos recém-chegados com permissões limitadas:
- #apresenta-te — template opcional com objetivos, sem exigir dados pessoais.
- #geral — diálogo da comunidade, slowmode inicial.
- #perguntas-e-respostas — preferir Forum Channel com tags para pesquisas futuras.
- #partilhas-e-conquistas — resultados de aprendizagem reais, sem prova fictícia de rendimento.
- #sugestoes-e-feedback — fórum com triagem de funcionalidades e reclamações.
- #calendario-e-eventos — orientação para agenda oficial, sem duplicar autoridade da inscrição.

**02 | GWD ACADEMY** — Member Verified e grupos específicos quando relevante:
- #orientacao-de-percurso — por onde começar, certificações, equivalência para já formados.
- #duvidas-das-aulas — fórum com categorias de temas.
- #recursos-autorizados — links para conteúdos no Campus, não cópias de media protegido.
- #desafios-e-projetos — colaboração e entrega via Academy, não atribuição de XP por mensagens.
- #workshops-e-lives — agendas e links autorizados publicados perto da sessão.
- Voz: SALA-DE-ESTUDO — opcional, moderada.

**03 | AFILIADOS GWD** — apenas AFFILIATE_ACTIVE + STAFF:
- #campanhas-aprovadas — campanhas autorizadas, ligação ao catálogo GWD, sem inventar ofertas.
- #duvidas-de-afiliacao — perguntas e apoio.
- #boas-praticas-de-divulgacao — regras, linguagem e canais aprovados.
- #treino-comercial — recursos do percurso de afiliados.
- Evitar comissão individual, dados de clientes ou screenshots de pagamentos nestes canais.

**04 | VENDEDORES AUTORIZADOS** — apenas SELLER_APPROVED + STAFF:
- #operacao-de-vendas — políticas de atuação, sem dados pessoais.
- #ofertas-autorizadas — apontar para dashboard que determina preços e elegibilidade.
- #ajuda-a-vendedores — fórum de apoio e encaminhamento privado para casos sensíveis.
- #formacao-especializada — sessões e documentação restrita.
- Voz: ENCONTRO-COMERCIAL — eventos agendados, moderados.

**05 | MENTORIA E EQUIPAS** — criar SOMENTE depois de haver turma/equipa real e responsável:
- Categoria COHORT_<ID> para turma: #avisos-da-turma, #conversa-da-turma, #duvidas-da-turma, voz SALA-DA-TURMA.
- Categoria TEAM_<ID> para equipa: #inicio-equipa, #plano-semanal, #duvidas-equipa, voz SALA-DA-EQUIPA.
- Mentores devem ter acesso apenas aos seus grupos. Mentoria e liderança são roles distintos.
- Limitar número de canais: não criar automaticamente dezenas de canais vazios ou públicos.

**06 | MENTORES E LIDERANÇA** — apenas MENTOR_APPROVED/TEAM_LEAD_APPROVED, conforme segmento:
- #orientacoes-aos-mentores — diretrizes e supervisão.
- #troca-entre-mentores — partilha de boas práticas pedagógicas.
- #coordenacao-de-equipas — visão agregada sem dados privados financeiros.
- #alertas-de-apoio — sinalizações não sensíveis; casos individuais vão para suporte seguro GWD.

**90 | STAFF E SEGURANÇA** — invisível a não-staff:
- #mod-queue — denúncias e intervenções.
- #incidentes-e-escalacao — eventos de segurança (sem segredos/PII exposta).
- #integracoes-status — alertas sanitizados de bot de roles, nunca tokens ou logs detalhados.
- #operacao — checklist de eventos e responsáveis.
- Voz: STAFF — coordenação.

## 5. Onboarding Discord (Community Onboarding)

Configurador no desktop: Server Settings → Enable Community → Onboarding.
- Default Channels: #boas-vindas, #regras-e-seguranca, #guia-de-inicio, #anuncios-oficiais e #ajuda-na-entrada.
- Pergunta 1 obrigatória: "O que te interessa?" (Aprender / Afiliados / Vendas / Mentoria). Atribuir exclusivamente roles INTEREST_* e mostrar os canais públicos relacionados.
- Pergunta 2 opcional: "Que temas queres explorar?" (Marketing, Conteúdo, Produtos, Formação). Atribuir interesses sem permissões comerciais.
- Rules Screening obrigatório antes de enviar mensagens; guia de início curto.
- Após registo GWD e consentimento para associar Discord, reconciliar MEMBER_VERIFIED e capacidades privadas através de operação administrativa comprovada ou bot com OAuth2/bot permissions.
- Não permitir self-role de AFFILIATE_ACTIVE, SELLER_APPROVED, MENTOR_APPROVED ou TEAM_LEAD_APPROVED.

## 6. Convites e ligação com GWD

**Convite público geral:** um convite para entrar na zona de boas-vindas, criado pela Helena após configurar onboarding; destino preferencial #boas-vindas; com expiração e controlo de usos segundo política. A sua posse não concede acesso pago.
**Convite interno/teste:** prazo/uso reduzidos, fornecido somente aos participantes de QA.
**Convite por turma/equipa:** quando necessário, limitado e associado a aprovação GWD; mesmo que Discord permita role-based invite, o principal da plataforma GWD deve validar membership.

Campos operacionais (não expor segredos):
- discord_guild_id
- discord_invite_public_url (após aprovação)
- discord_invite_test_url (privado)
- discord_role_ids (mapa)
- discord_channel_ids (mapa)
- discord_bot_client_id / scope de OAuth
- created_by, created_at, reviewed_at, review_evidence
- contact_moderator e procedimento de revogação.

Integração com site: CTA "Participar no Discord GWD" na área Member; link real de convite público após aprovação. Para privado, botão "Associar Discord" com consentimento e fluxo OAuth, nunca URL Premium exposta num JSON público.

## 7. Integrações WA e Telegram complementares

**WhatsApp**: confirmar grupo GWD existente ou criar um de boas-vindas; turmas e equipas ganham grupos privados somente com moderador responsável. Convite gerido separadamente, sem supor que a entrada no WA prova matrícula.

**Telegram Conversa/Comunicados**: confirmar grupo ou canal GWD específico, distinto dos canais proprietários de vídeos. Publicar apenas convites autorizados. O Telegram Native pode ser meio de entrega de vídeos acessíveis aos membros corretamente autorizados.

**Bots Hermes**: não usar uma sessão/bot central de agentes simultaneamente para chat público, emissão de papéis, entregas e streaming sem isolamento. Bots de comunidade com permissões mínimas e revisão. Uma resposta de IA nunca deve conceder role protegido.

## 8. Moderação, métricas e rotina

- Ativar AutoMod para spam, menções em massa, links maliciosos e linguagem abusiva; proteger contra raids; definir escalonamento humano.
- Estabelecer horários/canais de moderação, pessoa de backup, resposta para denúncias e mecanismo de remoção de membros.
- Medir apenas eventos agregados e consentidos: novas entradas, apresentações, perguntas respondidas, participação útil, incidentes e satisfação.
- Não premiar quantidade de mensagens nem exigir presença diária.
- Calendário editorial piloto: segunda-feira orientação e objetivos; meio da semana dúvidas ou encontro; fim de semana síntese e reconhecimento de aprendizagens reais. Ajustar à atividade e moderação disponível.

## 9. Checklist obrigatório de Helena

- [ ] Inspecionei se existe servidor Discord GWD e identifiquei owner/backup.
- [ ] Configurei/validei Community, Onboarding, regras, moderação, MFA e permissões.
- [ ] Criei apenas canais iniciais com owner e moderação definidos.
- [ ] Configurei papéis sem permitir autoatribuir poderes comerciais, Premium ou staff.
- [ ] Testei entrada com pessoa não registada e membro Free (sem acesso privado).
- [ ] Testei membro AFFILIATE_ACTIVE aprovado, com ALLOW somente na categoria correta.
- [ ] Testei MEMBER que perde capacidade e remoção efetiva de role (manual/automática).
- [ ] Confirmei que MENTOR não vê turma alheia e que TEAM_LEAD não vê equipa alheia.
- [ ] Confirmei se existem grupo WA e canal/grupo Telegram oficiais separados por finalidade.
- [ ] Testei o convite público real em browser não autenticado e em Android.
- [ ] Registei guild_id, channel_ids, role_ids, convites, owner e backup em cofre operacional.
- [ ] Envie para integração GWD somente o convite público aprovado e identificadores necessários.
- [ ] Produzi evidências de QA e relatório GO/NO-GO; nada afirma criado sem prova.

## 10. Entregável que Helena deve devolver

**GWD DISCORD READY FOR INTEGRATION: YES/NO.**
- Estado inicial: existente/adaptado/criado.
- Nome do servidor e guild_id (não secreto).
- Convite público real aprovado (se existir), link de teste privado não divulgado publicamente.
- Lista efetiva de categorias/canais e roles.
- Contacto responsável e política de moderação.
- Resultado dos testes Free, Affiliate, Seller, Cohort, Mentor, Leader e revogação.
- Situação WhatsApp e Telegram: grupo/canal confirmado ou pendente, sem links inventados.
- Itens pendentes e riscos antes da abertura aos membros.

## 11. Referências oficiais

- Community Onboarding: https://support.discord.com/hc/en-us/articles/11074987197975-Community-Onboarding-FAQ
- Rules Screening: https://support.discord.com/hc/en-us/articles/1500000466882-Rules-Screening-FAQ
- Discord roles: https://discord.com/blog/how-to-set-up-your-servers-roles-for-members-mods-admins
- Discord safety: https://discord.com/safety/auto-moderation-in-discord

**Nenhum convite é gerado por esta documentação. Helena deve configurar no Discord e devolver os URLs verdadeiros após validar permissões.**
