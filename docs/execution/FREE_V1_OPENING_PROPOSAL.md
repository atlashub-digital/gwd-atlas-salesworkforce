# GWD Free V1 — proposta objetiva de abertura (24/10/2026)

## O que um utilizador real encontra no dia da abertura
1. `goworld.digital`: posicionamento claro (comunidade de aprendizagem e participação; sem emprego nem rendimento garantido) e a Academy pública com o GWD Start.
2. Registo por email (link ou código) em `app.goworld.digital`, onboarding e dashboard.
3. **GWD Start** (definitivo, gratuito, em leitura): 6 episódios em 2 temporadas, 2 verificações (5 + 4 perguntas), progresso e XP no servidor (+10 episódio, +10 quiz, +50 série).
4. Comunidade nativa (Geral, Apresentações, Dúvidas da Academy) com regras, denúncia e moderação.
5. Estados honestos em tudo o que ainda não está ativo (oportunidades, campanhas, vendas, ganhos).

Pagamentos: **OFF**. Nenhuma série paga visível. As séries demo ficam em rascunho (só existem como fixtures de teste).

## Passos para abrir (por ordem)
| # | Passo | Quem | Critério |
|---|---|---|---|
| 1 | Publicar o catálogo definitivo: `packages/db/seed-academy.ts` (backup antes; publica o GWD Start, põe as séries demo em DRAFT; o progresso dos membros não é tocado) | Helena | `/v1/academy/series` devolve só `gwd-start` com 6 episódios e 2 quizzes |
| 2 | Promover app e web desta branch (Reader com parágrafos, catálogo sem rótulos demo) | Claude Code, com autorização | smoke 390/1440 em produção |
| 3 | Percurso real com 1 conta nova: registo → GWD Start completo (leitura + 2 quizzes) → XP de série → publicação na comunidade | Claude Code | PASS registado |
| 4 | Controlos residuais (Telegram manual, `/token` público, rotação Resend) | Helena | registados na Issue #15 |
| 5 | Moderação: quem revê denúncias e responde em "Dúvidas da Academy" nas primeiras semanas | equipa | responsável nomeado |
| 6 | **GO de abertura** (convites controlados → abertura pública) | fundador | — |

## Recomendação
Abrir em **dois tempos**: primeiro por convite (até ~50 pessoas, uma semana) para observar o percurso completo e a moderação, depois abertura pública. O limite de emails do projeto (50/h) chega para a fase por convite; para a abertura pública convém subi-lo.

## A seguir à abertura (fora do Free V1)
- Vídeo próprio para o GWD Start (masters autorizados → Atlas Media; os episódios passam a HYBRID sem mudar os slugs).
- Séries por caminho (Social Media, afiliação, revenda autorizada), com conteúdo autorizado.
- Homologação comercial ARO (projeto `gwd`, entitlements, pagamentos) com gate próprio.
- Excelência visual (PR #17) quando homologada.
