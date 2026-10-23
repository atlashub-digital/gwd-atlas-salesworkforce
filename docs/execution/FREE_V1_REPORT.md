# GWD Free V1 — relatório consolidado (23/10/2026 18:15 UTC)

Fonte única do estado da plataforma para a abertura Free. Evidências detalhadas: `E2E_EVIDENCE_LOG.md`.

## 0. Relatório final de homologação funcional (23/10/2026 20:40 UTC)
| # | Item | Resultado | Evidência / causa |
|---|---|---|---|
| 1 | HLS na Academy | **FAIL (dependência por aplicar)** | 19:55, conta A real: `teste-media-p01` → 404 (episódio e playback). P01 v4 ainda não aplicado (ou sem concessão para a conta A). A cadeia token → HLS, adulteração 403 e expiração 403 continua PASS (fase 3–4). Teste pronto: `free-journey.cjs hls` (playback, CORS, adulteração, sem token, expiração, outro rascunho 404, premium negado, ausência no catálogo, anónimo 401) |
| 2 | Telegram Native | **EM CURSO** | Direitos confirmados pela direção (licença dos criadores, só para o piloto). `pilot-p02-telegram.sql` v2 liga `/326`, `/334` e `/328` a 3 episódios privados. **Defeito encontrado e corrigido:** a RLS dos quizzes só lia episódios publicados, por isso nenhum episódio privado podia concluir → `2026-10-23-academy-preview-quiz.sql` (testado: 400 antes, conclusão só com handoff + quiz aprovado depois, respostas nunca expostas, não-tester sem acesso). Falta: o texto das aulas para escrever os quizzes, e a aplicação pela Helena |
| 3 | SMTP | **PASS** | entrega real do código por `noreply@goworld.digital` às 19:54 e login A PASS. A rotação da chave exposta é uma medida de segurança separada, pendente (Helena, pelo cofre, validar antes de revogar) |

### Riscos residuais concretos
1. **`POST https://media.atlashub.si/token` é agora público.** Protegido: 401 sem credencial e com credencial errada, sem CORS para browsers. **Sem limite de tentativas** (25 pedidos seguidos, todos 401, nenhum 429). Risco: força bruta do segredo S2S. Mitigação: rate limit no Caddy ou allowlist de IP (a API usa a rota privada e não precisa da pública).
2. **`/binding`** não responde em nenhum caminho HTTPS testado (404/405). Não há rota para validar.
3. **Âmbito da licença Telegram:** só o piloto (episódios privados, contas de teste). Publicar estas aulas exige um novo âmbito registado.
4. **ARO `gwd` não reconciliável.** Não existe `infra/projects/gwd/` no `atlashub-finance` (todas as branches e PRs). As chaves Atlas Media (`gwd.academy.series:gwd-start`) não seguem a convenção ARO (`<projeto>:<código>`). O adapter GWD continua mock com pagamentos OFF. Falta: manifesto `gwd` no repositório ARO + chave de servidor no env da API (Helena).
5. A chave Resend exposta continua válida até a rotação ser confirmada.
6. A leitura direta da DB e dos contentores de produção está bloqueada para o Claude Code. As confirmações de migrações dependem do registo da Helena na Issue.

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
