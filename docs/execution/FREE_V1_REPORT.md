# GWD Free V1 — relatório consolidado (23/10/2026 18:15 UTC)

Fonte única do estado da plataforma para a abertura Free. Evidências detalhadas: `E2E_EVIDENCE_LOG.md`.

## 0. Relatório final de homologação funcional (24/10/2026 00:30 UTC)
| # | Item | Resultado | Evidência |
|---|---|---|---|
| 1 | HLS na Academy | **PASS** | produção, conta A real, Google Chrome 156: `teste-media-p01` reproduz (`currentTime` > 2 s); CORS só `app.goworld.digital`; adulterado 403, sem token 401, expirado (310 s) 403; rascunho Telegram sem token (409); premium 403; ausente do catálogo; anónimo 401 |
| 2 | Telegram Native (lado GWD) | **PASS** | contas A e B, 3 episódios (`/326`, `/334`, `/328`): link `t.me/c/…` em nova janela e Academy mantida; sem handoff, só handoff ou quiz falhado → 422; quiz aprovado sem handoff → 422; handoff + quiz aprovado → COMPLETED (A e B, 3/3) |
| 3 | SMTP | **PASS** | entrega real de códigos (19:54, 23:30, 00:02) e logins A/B PASS |

### Defeitos reais encontrados e corrigidos nesta fase
- **Quizzes de episódios privados invisíveis** (RLS só para publicados) → `2026-10-23-academy-preview-quiz.sql` (aplicada pela Helena).
- **Chaves de eventos de aprendizagem sem participante:** só o 1.º participante de cada episódio Telegram podia concluir (o handoff dos outros era descartado). Corrigido em `16178c7`, API publicada por blue/green (rollback `gwd-api-a0ee992`); verificado em produção com a conta B.
- **Concessões P01 nas contas erradas** (dados) → corrigidas pela Helena.

### Riscos e pendentes residuais
1. **Membro / não membro do canal (dentro do Telegram):** nenhuma conta E2E é membro. A confirmação "o membro vê o vídeo, o não membro vê canal privado" é manual: um membro do canal abre os 3 links e uma conta não membro abre 1. O lado GWD não depende disto.
2. **`POST https://media.atlashub.si/token` público sem limite de tentativas** (protegido por S2S; a API usa a rota privada). Recomendado: rate limit ou allowlist de IP no Caddy da media.
3. **Rotação da chave Resend exposta:** pendente (Helena, pelo cofre; validar antes de revogar).
4. **ARO `gwd`:** sem manifesto no `atlashub-finance`; adapter mock, pagamentos OFF.
5. **Testes de vídeo automáticos** exigem Chrome real (imagem local `gwd-pw-chrome:1`): os browsers do Playwright não têm H.264/AAC.
6. Âmbito da licença Telegram: só o piloto (episódios privados, contas de teste).

## 1. Resultado exigido (tranche anterior)
| Item | Estado | Evidência |
|---|---|---|
| Autenticação e sessões | **PASS** | link (04:36) e código de 8 dígitos (A 07:04 e 18:07, B 18:07, com o limite de 50/h); cookies HttpOnly+Secure, ilegíveis por JS; sem tokens no URL; logout → 401 |
| Comunidade real A+B | **PASS** | produção 18:08, `tests/production/free-journey.cjs` (detalhe abaixo) |
| Worker e API estáveis | **PASS** | API `a0ee992` `/ready` 200, 0 erros em 6 h; worker `4c7c5a2` `idle`, `commerce OFF` |
| HLS no episódio técnico | **A AGUARDAR Helena** | cadeia S2S → token → HLS, adulteração 403, expiração 403 já PASS (fase 3–4). Falta: `2026-10-23-academy-preview.sql` rev. 2 e `pilot-p01-assets.sql` v4 aplicados (com backup) → playback no browser real |
| Telegram Native | **BLOQUEIO EXTERNO** | código pronto e testado (fase 5). Faltam os URLs `https://t.me/c/4305862304/<id>` de 2–3 mensagens: não aparecem em nenhuma fonte autorizada acessível (Drive, Gmail, Issue/PR). O canal é privado; sem conta membro não é possível obtê-los sem MTProto, o que fica excluído por política |
| App com UI Telegram | **PASS** | `e67a978` (código da app = `a0ee992`) em produção às 18:18 (`dpl_EV3DtX6S5nCVSpqN46bRibjnr3Co`); smoke sem sessão: `/entrar` e `/auth/confirm` 200, rotas de membro → `/entrar`, proxy `me`/comunidade/Academy 401, caminho fora da allowlist 404. Rollback `dpl_FknDNJQRtgBMST2Ria6ukyEskv37` |

## 2. Comunidade A+B — passo a passo (produção, 18:07–18:09 UTC)
| Passo | Resultado |
|---|---|
| login A (código) / login B (código, conta nova) | PASS / PASS |
| onboarding A / B | PASS (já feito) / PASS |
| dashboard, Academy | PASS |
| premium | PASS — 403 `ENTITLEMENT_DENIED` |
| regras aceites A / B | PASS / PASS |
| A publica; a publicação persiste após reload | PASS |
| B vê a publicação de A e responde | PASS (201) |
| B tenta remover a publicação de A | PASS — 403 |
| A tenta denunciar a própria publicação | PASS — 400 |
| B denuncia a publicação de A | PASS |
| espaço de capacidade (B) | PASS — 403 e não listado (`geral, apresentacoes, academy`) |
| A remove a própria publicação | PASS |
| logout A | PASS — `/me` 401 |
| vídeo HLS | BLOCKED — episódio técnico ainda sem asset (preview + P01 por aplicar) |

Sessões de teste apagadas com `shred` depois do teste.

## 3. Plano objetivo de abertura Free
| # | Passo | Responsável | Critério de saída |
|---|---|---|---|
| 1 | Aplicar `academy-preview.sql` rev. 2 + `pilot-p01-assets.sql` v4 (backup, COMMIT controlado, emails das contas de teste fora do Git) | Helena | tabela e 2 políticas presentes; episódio `teste-media-p01` não publicado |
| 2 | HLS no browser real (A), token adulterado/expirado, negativas (outro rascunho, não-tester → 404) | Claude Code | PASS registado |
| 3 | ~~Promover a app (`e67a978`)~~ | Claude Code | **feito 18:18** |
| 4 | Telegram P02: 2–3 URLs de mensagens + direitos + quiz; uma conta de teste no canal | equipa do canal | handoff, membro/não membro, quiz conclui |
| 5 | Rotação da chave Resend (nova validada antes de revogar a antiga) | Helena | email de código entregue com a chave nova |
| 6 | Conteúdo real do GWD Start (substitui o catálogo demo) | conteúdo | `GWD_START_PRODUCTION_PLAN.md` fases 2–6 |
| 7 | Abertura Free | fundador | homologação |

Os passos 1–5 fecham a plataforma técnica; o passo 6 é a condição editorial para abrir ao público.
