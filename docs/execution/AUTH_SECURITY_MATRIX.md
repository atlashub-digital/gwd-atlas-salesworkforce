# Matriz de autenticação, permissões e segurança (23/10/2026)

Estado: **para homologação** (Diana: produto · Helena: operações). Evidências em `E2E_EVIDENCE_LOG.md`.

## 1. Autenticação
| Canal | Estado | Evidência |
|---|---|---|
| Email — link | **PASS** | produção 04:36 (conta de teste) e fundador |
| Email — código | **PASS** | produção 07:04 (conta A, código de 8 dígitos) e fundador |
| WhatsApp — código + senha | NOT TESTED | sem número de teste autorizado |
| Google OAuth (PKCE) | NOT TESTED | requer conta Google de teste |
| Logout | **PASS** | `/api/gwd/me` → 401 depois de terminar sessão |

**Comprimento do código:** o Supabase permite 6–10 dígitos (configuração do projeto; em produção estão 8). O frontend aceita `[0-9]{6,10}` e o servidor valida `^\d{6,10}$`: não há nenhum pressuposto de 6 dígitos no código, por isso mudar a configuração não parte o login.

**Sessão:** cookies `gwd-access`/`gwd-refresh` com HttpOnly, Secure (produção) e SameSite=Lax, ilegíveis por JavaScript. Os tokens recebidos pelo link são validados no Supabase (`GET /user` ou `verify`) antes de se criar a sessão, e o URL é limpo (`replaceState`). As ações de auth exigem um `Origin` igual ao do site.

**Limite de envio (residual):** depois de 2 emails para a conta A, a conta B recebeu 429 em pedidos espaçados mais de 60 s. A causa provável é o limite horário de envio de emails do projeto (*Supabase → Auth → Rate limits → email sent*), que costuma vir baixo até ser ajustado depois de configurar SMTP próprio. Ação: a Helena confirma e regista o valor, e sobe-o para um nível de produção. Por instrução, não houve retries.

## 2. Identidade na base de dados (origem da claim)
1. O browser nunca fala com a DB. O proxy da app (`/api/gwd/*`, com allowlist) envia apenas o Bearer da sessão HttpOnly.
2. A API valida o Bearer **no Supabase** (`verifyToken` → `GET /auth/v1/user`); um token inválido dá 401.
3. Só então a transação faz `SET LOCAL ROLE gwd_api` e `set_config('request.jwt.claim.sub', <id verificado>)`. O email só entra se o Supabase o der como confirmado.
4. Nenhum parâmetro do cliente define a claim. `community_can_access()` e as políticas de pré-visualização leem exclusivamente essa claim (`current_setting('request.jwt.claim.sub')`), que é o mesmo valor que `auth.uid()` devolve.

## 3. Permissões por recurso
| Recurso | Sem sessão | Free (onboarding feito) | Capacidade (ex.: MENTOR) | Operador |
|---|---|---|---|---|
| Catálogo Academy publicado | ler | ler | ler | — |
| Episódio FREE / MEMBER | — | abrir; progresso próprio | idem | — |
| Episódio PREMIUM | — | **403** (`ENTITLEMENT_DENIED`, verificado em produção) | idem até ao ARO | — |
| Rascunho (não publicado) | — | **404**, salvo concessão **para esse episódio** | idem | cria concessões |
| Vídeo Atlas Media | — | token curto via S2S (TTL 300 s); adulterado/expirado/outro asset → 403 | idem | — |
| Comunidade: espaços públicos | — | depois de aceitar as regras | idem | — |
| Comunidade: espaço de capacidade | — | não listado; 403 | lê e publica | concede capacidade |
| Publicação de outro membro | — | ler; denunciar (não a própria); **não remover (403)** | idem | oculta/revê |
| XP | — | só eventos verificados no servidor (episódio, quiz, série); nunca por publicar | idem | — |
| Pagamentos/payouts | flags OFF | OFF | OFF | gate financeiro |

## 4. Segurança operacional
- Os segredos (S2S, DB, SMTP) só existem em env files 600 no host. Nada vai para Git, logs, browser ou issues.
- O catálogo de tokens de media só é alcançável pela rede privada (UFW: apenas o host da API) e exige S2S.
- Releases imutáveis por SHA (API, worker), corte blue/green no Caddy e rollback por uma linha.
- Defeito encontrado e corrigido (pendente de aplicação): função da comunidade dependente de USAGE em `auth` (42501). Os testes têm agora paridade com produção.
- Defeito encontrado e corrigido no código: uma política `QUIZ_VERIFIED` sem quiz concluía só com o handoff Telegram. Agora falha fechado.
