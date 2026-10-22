# GWD — MATRIZ DE PROVAS REAIS E2E / GATES V1.0

**Data:** 22/10/2026  
**Estado:** protocolo de homologação. TODOS OS TESTES ABAIXO INICIAM EM NOT_RUN. Não se presume PASS a partir de testes mocked ou de documentação.  
**Ambiente:** staging isolado com utilizadores reais de teste, contas devidamente autorizadas e ativos próprios/licenciados; sem alterar produção ou cobrar terceiros.  
**Responsáveis:** Helena (ambiente/evidências), Claude Code (integrações e automação E2E), GWD (aceitação de produto), ARO owner (financeiro).

## 0. O que significa testar no real

- Usar instâncias efetivas de Supabase Auth, PostgreSQL, LearnHouse, Discord, WhatsApp, Telegram e Atlas Media onde autorizadas; endpoints e dados reais de staging, sem criar dashboard com resultados falsos.
- Perfis de QA criados legitimamente, com e-mails confirmados e consentimento. Tratar esses perfis como contas reais de teste; nunca misturá-los com métricas públicas ou vendas comerciais.
- Testes de permissão devem incluir ações negadas; uma demonstração que apenas funciona com conta admin não é prova.
- Testes financeiros live só com autorização explícita de E7/ARO, orçamento pré-aprovado, plano de reversão e reconciliação, e transação efetiva identificada. Até lá, provar contrato e estados não financeiros com ARO real, mas declarar pagamento REAL como BLOCKED.
- Não inventar preços, conversões, comissões, audiência, titulares de direitos ou URL de convite.
- Os termos Telegram API/Bot Developer/Content Licensing são gate antes de qualquer streaming externo de canal em WebPlayer; se não autorizado, executar Telegram Native/handoff e marcar MTProto externo como BLOCKED_POLICY, não como falha de engenharia.
- Cada evidência: scenario_id, UTC timestamp, branch/commit, ambiente, principal pseudónimo, recurso_id, request/response redigidos, screenshot/log sanitizado, responsável, GO/NO-GO.

## 1. Ficha de participantes de homologação

Pessoas/contas a provisionar mediante consentimento:
- U1_MEMBER_FREE — conta Atlas real, sem tier pago.
- U2_AFFILIATE_CANDIDATE — candidato à aprovação.
- U3_AFFILIATE_ACTIVE — parceiro aprovado, autorização versionada.
- U4_SELLER_APPROVED — vendedor aprovado, contexto de ofertas próprias.
- U5_STUDENT_A — aluno turma A.
- U6_STUDENT_B — aluno turma B.
- U7_MENTOR_A — mentor só da turma A.
- U8_TEAM_LEADER_A — líder de equipa A, não admin.
- U9_MODERATOR — moderador com poderes limitados.
- U10_ADMIN — administração GWD.
- U11_DIRECT_BUYER — comprador direto Novidades sem GWD.
- U12_REFERRAL_BUYER — comprador via link GWD, sem adesão à rede.

Usar contas de QA que sejam pessoas e sessões reais, separadas e revogáveis. Não dar a todas a mesma password, não reutilizar secrets de produção, não registar PII no GitHub.

## 2. Ativos mínimos de homologação

- GWD-COURSE-FREE: curso original/validado, 2+ aulas, reader, vídeo, quiz e regra de conclusão.
- GWD-COURSE-ADVANCED: curso original restrito a capacidade/turma, com controlo de revogação.
- GWD-COHORT-A e GWD-COHORT-B: turmas reais de teste com permissões distintas.
- NOV-OFFER-EDU-01: oferta Novidades com contrato ARO real, owner, política de preço e acesso, estado de vendas explicitamente controlado.
- MEDIA-VPS-01: vídeo licenciado no Atlas Media HLS, tokens e metrics.
- MEDIA-YOUTUBE-01: vídeo próprio ou licenciado incorporável, sem tratamento indevido como DRM.
- MEDIA-TG-NATIVE-01: mensagem/canal de conteúdo próprio acessível mediante convite nativo validado.
- MEDIA-TG-STREAM-01: somente depois de análise de termos permitir experimento técnico restrito (não produção).
- GWD-DISCORD: servidor existente auditado ou recém-criado, guild_id e convite real.
- GWD-WA e GWD-TELEGRAM: grupo/canal e admins reais confirmados, links apenas após validação.

O conteúdo de teste é real, mas não significa dados financeiros, sociais ou de outros utilizadores copiados sem autorização.

## 3. Cenários e gates

| ID | Prova real | Critério para PASS | Gate | Estado inicial |
|---|---|---|---|---|
| E01 | Novo membro Free via landing | Atlas Auth completa registo/consentimento e cria membership correta | G1 | NOT_RUN |
| E02 | Retorno e logout | Login na mesma conta, sessão revogada também na ligação educativa | G2 | NOT_RUN |
| E03 | Onboarding Discord | U1 vê geral, não vê afiliados/vendedores/privados | G1 | NOT_RUN |
| E04 | Afiliado aprovado Discord | U3 vê categoria de afiliados; U2 candidato não vê | G1 | NOT_RUN |
| E05 | Revogação no Discord | Remoção de capacidade de U3 bloqueia acesso e role; SLA documentado | G1 | NOT_RUN |
| E06 | Turmas cruzadas | U5 não lê dados, aulas ou canais exclusivos U6; vice-versa | G2 | NOT_RUN |
| E07 | Mentor e líder | U7 vê turma A mas não B; U8 vê equipa A mas não tem poderes admin | G5 | NOT_RUN |
| E08 | Membro já formado | Evidência aprovada gera equivalência e módulo avançado, com audit | G2 | NOT_RUN |
| E09 | LearnHouse single identity | Um login Atlas, JIT idempotente, mudança de email sem duplicação | G2 | NOT_RUN |
| E10 | WebReader | Abrir PDF/Reader autorizado, guardar progresso e retomar noutro equipamento | G2 | NOT_RUN |
| E11 | Quiz, conclusão e XP | Completar uma vez gera evento persistido, refresh não duplica XP | G2 | NOT_RUN |
| E12 | Acesso restrito | U1 recebe DENY de aula Premium; U5 com grant/entitlement vê | G2 | NOT_RUN |
| E13 | HLS VPS | Vídeo real autoriza e reproduz, seek, 206, expiry/refresh, erros e logs | G3 | NOT_RUN |
| E14 | YouTube embed | Vídeo próprio reproduz e persiste progresso permitido; não fingir DRM | G3 | NOT_RUN |
| E15 | Telegram Native | Membro autorizado entra no canal/mensagem real e handoff não gera conclusão automática | G3 | NOT_RUN |
| E16 | Telegram MTProto WebPlayer | Apenas com permissibilidade documentada: range, browser, banda, FloodWait e token | G3 | BLOCKED_POLICY |
| E17 | Media sem direito | Usuário/cookie/url alterado não obtém manifest/asset privado VPS | G3 | NOT_RUN |
| E18 | Failover provider | Troca de origem técnica não perde episode_id ou progresso | G3 | NOT_RUN |
| E19 | Geração referral GWD | U3 cria link para oferta elegível; U2 é negado; preço não vem do browser | G4 | NOT_RUN |
| E20 | Cliente direto Novidades | U11 compra/recebe direito sem associação GWD obrigatória | G4 | NOT_RUN |
| E21 | Compra referida | U12 usa link atribuído; ARO APPROVED real após autorização E7, entitlement e ledger atribuídos | G4 | BLOCKED_FINANCIAL_GO |
| E22 | Duplicação/reversão | Evento ARO repetido não duplica matrícula/comissão; refund gera reversão | G4 | BLOCKED_FINANCIAL_GO |
| E23 | Latência e simultaneidade | 1/3/10 utilizadores autorizados, buffering e GB/h observados | G3 | NOT_RUN |
| E24 | Falhas de integração | Timeout ARO, Discord, LH ou media não libera direito indevido e é recuperável | G4 | NOT_RUN |
| E25 | Backoffice | Admin gere conteúdo/capacidades; mentor/moderador não lê dados financeiros | G5 | NOT_RUN |
| E26 | WhatsApp opcional | Convite real funciona; recusa do WA não impede acesso a formação comprada | G1 | NOT_RUN |
| E27 | Telegram grupo opcional | Link real confirmado; pertença Telegram não define entitlement LMS | G1 | NOT_RUN |
| E28 | Dados e direitos | Media com licença aprovada, retenção, consentimento, LGPD e moderação revistos | G6 | NOT_RUN |
| E29 | Restore e rollback | Restore em staging, eventos pendentes recuperáveis, nenhuma cobrança duplicada | G6 | NOT_RUN |
| E30 | Responsividade e acessibilidade | 390px desktop, teclado, contraste e mensagens de erro verificadas | G6 | NOT_RUN |

**FAIL** só após execução real falhar. **BLOCKED** identifica dependência externa/documental. **PASS** requer anexos e sign-off.

## 4. Critérios claros GO / NO-GO

**GO G1:** servidor Discord real e verificado, papel público/candidato/afiliado segmentado corretamente, convite público entregue pela Helena, grupos WA/TG mapeados e registo Free funcional.
**GO G2:** login único viável e lícito, curso Free + avançado + turmas separadas, reader/vídeo/quiz/progresso real, XP idempotente, formada(o) reconhecida(o).
**GO G3:** HLS VPS e YouTube efetivos, Telegram Native efetivo, MTProto somente quando policy autoriza; player seguro; testes de utilização e orçamento.
**GO G4:** oferta e referral com dados comerciais reais, contrato ARO verificável, eventos assinados e reconciliação; pagamentos live nunca sem autorização E7.
**GO G5:** mentor e líder aprovados, equipas e turmas reais de teste, acesso minimizado e revogação.
**GO G6:** licença e direitos, RLS, restore, load/erro, logs e rollback demonstrados, humanos aprovaram experiência.

Não declarar "plataforma GWD em produção" porque os componentes de staging passaram; a publicação requer gate de lançamento e DNS/deploy próprio.

## 5. Artefactos de evidência por gate

Em docs/evidence ou sistema privado de operação (nunca PII/tokens no GitHub):
- test-run-manifest com data/commit/ambiente, casos e status.
- map de IDs pseudonimizados de contas e recursos.
- screenshots reais desktop/mobile e vídeo curto da jornada, com dados ocultados.
- logs sanitizados de ARO, GWD e Atlas Media com correlation_id.
- teste de restore e medição de recursos VPS.
- orçamento/termos e autorização formal de streaming externo Telegram, se aplicável.
- aprovação Helena + dono de produto e bloqueios remanescentes.

## 6. Roteiro de demonstração executiva V1

1. Entrar na landing GoWorld.Digital como visitante real.
2. Registar conta Free, confirmar e-mail e entrar na App.
3. Associar Discord de modo voluntário e validar canais visíveis.
4. Entrar na Academy, ler guia, assistir vídeo HLS VPS, completar quiz e ver progresso real.
5. Abrir recurso YouTube e verificar acompanhamento.
6. Abrir aula Telegram Native autorizada; confirmar que não concluiu automaticamente.
7. Ver como um membro formado tem equivalência e acesso a conteúdo avançado.
8. Ver parceiro autorizado com campanha e link; candidato bloqueado.
9. Abrir oferta real Novidades via link, sem cobrar até autorização E7.
10. Ver mentor na Turma A e líder numa equipa; negar Turma B.
11. Mostrar logs, convites reais, licenças, resultado de testes e custos.
12. Mostrar plano de rollback e lista de NO-GO antes da publicação.

## 7. Referências

- GWD Master Blueprint: GWD_MASTER_BLUEPRINT_V1.md
- Discord Helena Runbook: GWD_DISCORD_HELENA_RUNBOOK_V1.md
- ARO: https://github.com/atlashub-digital/atlashub-finance
- Telegram content terms: https://telegram.org/tos/content-licensing
- Telegram API terms: https://core.telegram.org/api/terms
- Telegram bot developer terms: https://telegram.org/tos/bot-developers

**Regra final:** um cenário só é entregue quando um utilizador real com permissão correta o pode concluir; a infraestrutura não deve marcar PASS por haver código compilado ou teste com mock.
