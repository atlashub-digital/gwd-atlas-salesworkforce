# Plano de produção — curso GWD Start (Diana · Elisa · Helena · Claude Code)

Princípio: os pilotos técnicos (P01 HLS, P02 Telegram) provam capacidades em episódios não publicados. **Não** transformam materiais de teste ou de terceiros em aulas finais.

| Fase | O quê | Responsável | Saída verificável |
|---|---|---|---|
| 0 | Correção da comunidade aplicada; E2E com contas A e B | Helena → Claude Code | relatório PASS passo a passo |
| 1 | Pilotos técnicos: P01 (clip HLS, 1 episódio de teste) e P02 (2–3 mensagens Telegram autorizadas) | Diana GO · Helena aplica · Claude Code testa | playback real, token expirado, negativas; Telegram membro/não membro, quiz conclui |
| 2 | Seleção editorial: que vídeos de formação podem ser usados em demonstração e com que direitos | Diana + Elisa | lista com titular e licença por vídeo |
| 3 | Guião do curso: série, temporadas e episódios conforme `CONTENT_CONTRACT_GWD_START.md` | Elisa (conteúdo) · Diana (aprovação) | tabela de episódios aprovada |
| 4 | Produção: masters de vídeo + legendas; textos do Reader; quizzes | Elisa | ficheiros na pasta do Drive combinada |
| 5 | Ingestão HLS (asset_id por episódio) | Helena | lista `episódio → asset_id` |
| 6 | Publicação pelo seed versionado + QA 1440/390 + E2E real | Claude Code | PR com evidências; catálogo sem marca "demo" |
| 7 | Homologação e abertura FREE | Diana | APPROVED |

Dependências técnicas já resolvidas: login real (link e código), rede privada de media, tokens S2S, progresso e XP no servidor, Reader e quiz, Telegram handoff com quiz.
Pendentes técnicos: correção da comunidade e migração de pré-visualização (Helena), limite de emails do Supabase (Helena).
