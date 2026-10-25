# GWD Free V1 — relatório final de homologação técnica (24/10/2026)

Estado único e atual da plataforma. O histórico detalhado, com hora e evidência de cada teste, está em `E2E_EVIDENCE_LOG.md`.
Referência de execução: [PR #16](https://github.com/atlashub-digital/gwd-atlas-salesworkforce/pull/16), branch `feat/gwd-e2e-production-delivery-v1`.

## 1. Versões em produção
| Serviço | Versão | Rollback |
|---|---|---|
| web `goworld.digital` (Vercel `gwd`) | `1f7a7c1` — canais oficiais ativos; Hero V1 publicado, acabamento visual em revisão (`dpl_A7heTSkwgoo2kAbh9VBt5pokm224`) | `dpl_AuC4mrc5hx3n1ueuFpTFTmBTnqad` |
| app `app.goworld.digital` (Vercel `gwd-app`) | `1f7a7c1` — hub de canais oficiais (`dpl_D9PhRN6Z4NsDnEQKHyWP2zMdSeea`) | `dpl_ELYtRQixoZxsf87AaGFPGH5K86qk` |
| API `api.goworld.digital` | `4c071b6` (contentor `gwd-api-4c071b6`, release por SHA) | site Caddy → `gwd-api-89bb8e2` → `gwd-api-16178c7` |
| Worker | `4c7c5a2` (`commerce OFF`) | `docker start gwd-worker` |
| DB (Supabase GWD) | schema + `community-v1` + `fix-claim` + `academy-preview` rev. 2 + `academy-preview-quiz` | bloco ROLLBACK em cada migração + backups da Helena |
| Pagamentos | **OFF** (`aroProduction=false`, `payouts=false`) | — |

## 2. Homologação funcional — PASS
| Área | Resultado | Prova essencial (produção, contas reais) |
|---|---|---|
| Autenticação e sessões | **PASS** | email por link e por código de 8 dígitos (Resend `noreply@goworld.digital`); cookies HttpOnly+Secure, ilegíveis por JS; sem tokens no URL; logout → 401 |
| SMTP | **PASS** | códigos entregues em todos os logins de teste (limite do projeto 50/h) |
| Onboarding, dashboard, Academy | **PASS** | contas A e B; premium → 403 `ENTITLEMENT_DENIED` |
| Comunidade A+B | **PASS** | regras; publicação persistente; resposta; remover a de outro → 403; auto-denúncia → 400; denúncia; espaço de capacidade 403 e não listado |
| HLS (Atlas Media) | **PASS** | episódio técnico privado reproduz no Chrome; CORS só a app; token adulterado 403, sem token 401, expirado 403; ausente do catálogo; anónimo 401 |
| Telegram Native (lado GWD) | **PASS** | 3 episódios privados (`/326`, `/334`, `/328`); abre noutra janela com a Academy mantida; conclusão só com handoff + quiz aprovado (A e B, 3/3) |
| API e worker | **PASS** | releases imutáveis por SHA, blue/green, health/ready 200 |

Testes automáticos no PR: unitários 15/15, integração (PGlite com RLS real e paridade de permissões de produção) 3/3, typecheck, E2E de browser local.

## 3. Defeitos reais encontrados e corrigidos durante a homologação
| Defeito | Correção |
|---|---|
| Rate limit da API partilhado por todos os membros (IP do proxy) | chave por bearer / 1.º hop de `X-Forwarded-For` |
| Feed da comunidade 503 em produção (`42501`: função SQL dependia de USAGE em `auth`) | `community-v1-fix-claim.sql` |
| Login por link sem sessão (fragmento do URL) | `/auth/confirm` |
| `QUIZ_VERIFIED` concluía só com o handoff Telegram num episódio sem quiz | fail closed |
| Pré-visualização abria todos os rascunhos | concessões por participante × episódio |
| Quizzes de episódios privados invisíveis à API | `academy-preview-quiz.sql` |
| Chaves de eventos sem participante: só a 1.ª pessoa de cada episódio Telegram conseguia concluir | `16178c7` (chave por participante) |

## 4. Controlos residuais (Helena, sem alterar a integração validada)
1. Teste manual dentro do Telegram: um membro do canal abre os 3 links (vê o vídeo) e um não membro abre 1 (vê "canal privado").
2. Proteger `POST https://media.atlashub.si/token` (rate limit ou allowlist de IP; a API usa a rota privada).
3. Rotação da chave Resend pelo cofre (validar a nova antes de revogar a antiga).

## 5. Fora deste âmbito
- **ARO / pagamentos:** OFF. Homologação comercial própria (o projeto `gwd` ainda não existe no `atlashub-finance`).
- **Conteúdo:** o catálogo do GWD Start ainda é de demonstração. Próxima entrega: conteúdos definitivos.

## 6. Próxima entrega — GWD Free V1 com conteúdos finais
Plano editorial em `GWD_START_PRODUCTION_PLAN.md`; proposta de abertura em `FREE_V1_OPENING_PROPOSAL.md`.
