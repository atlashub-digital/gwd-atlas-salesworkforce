# GWD Free V1 — relatório consolidado (23/10/2026 18:15 UTC)

Fonte única do estado da plataforma para a abertura Free. Evidências detalhadas: `E2E_EVIDENCE_LOG.md`.

## 1. Resultado exigido
| Item | Estado | Evidência |
|---|---|---|
| Autenticação e sessões | **PASS** | link (04:36) e código de 8 dígitos (A 07:04 e 18:07, B 18:07, com o limite de 50/h); cookies HttpOnly+Secure, ilegíveis por JS; sem tokens no URL; logout → 401 |
| Comunidade real A+B | **PASS** | produção 18:08, `tests/production/free-journey.cjs` (detalhe abaixo) |
| Worker e API estáveis | **PASS** | API `a0ee992` `/ready` 200, 0 erros em 6 h; worker `4c7c5a2` `idle`, `commerce OFF` |
| HLS no episódio técnico | **A AGUARDAR Helena** | cadeia S2S → token → HLS, adulteração 403, expiração 403 já PASS (fase 3–4). Falta: `2026-10-23-academy-preview.sql` rev. 2 e `pilot-p01-assets.sql` v4 aplicados (com backup) → playback no browser real |
| Telegram Native | **BLOQUEIO EXTERNO** | código pronto e testado (fase 5). Faltam os URLs `https://t.me/c/4305862304/<id>` de 2–3 mensagens: não aparecem em nenhuma fonte autorizada acessível (Drive, Gmail, Issue/PR). O canal é privado; sem conta membro não é possível obtê-los sem MTProto, o que fica excluído por política |
| App com UI Telegram | **A AGUARDAR autorização** | deployment `e67a978` (código da app = `a0ee992`) READY; a promoção para produção requer autorização explícita do fundador nesta sessão |

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
| 3 | Promover a app (`e67a978`) | Claude Code, com autorização | smoke `app.goworld.digital` |
| 4 | Telegram P02: 2–3 URLs de mensagens + direitos + quiz; uma conta de teste no canal | equipa do canal | handoff, membro/não membro, quiz conclui |
| 5 | Rotação da chave Resend (nova validada antes de revogar a antiga) | Helena | email de código entregue com a chave nova |
| 6 | Conteúdo real do GWD Start (substitui o catálogo demo) | conteúdo | `GWD_START_PRODUCTION_PLAN.md` fases 2–6 |
| 7 | Abertura Free | fundador | homologação |

Os passos 1–5 fecham a plataforma técnica; o passo 6 é a condição editorial para abrir ao público.
