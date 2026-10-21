# GWD — Estado e próximas etapas (21/10/2026)

PR [#12](https://github.com/atlashub-digital/gwd-atlas-salesworkforce/pull/12) (draft, empilhado sobre #7) · HEAD `aa084be` · CI `verify` verde.
Produção: `goworld.digital` e `app.goworld.digital` promovidos para o commit `aa084be` com GO do responsável (21/10/2026).

## Feito
- **Auditoria**: repositório, PR #7, CI, Drive (5 docs + maquetes vistas) e VPS de media só de leitura (`docs/rebuild/`).
- **Site público**: homepage, `/entrar`, Europa e Brasil reconstruídos sobre as maquetes, com fotografia canónica.
- **App**: shell, dashboard (nível XP real), jornada, comunidade, oportunidades, pontos.
- **Academy Streaming na app**: catálogo, séries, episódios, player HLS, leitura, Telegram (não conclui), quiz, Premium bloqueado. Progresso e XP decididos no servidor.
- **Integração Atlas Media**: adapter server-side com o contrato real do `/token`, que falha fechado quando não está configurado.
- **Qualidade**: testes unitários, integração, E2E no browser e CI verdes; previews Vercel verificados.

## Falta — de quem
| # | Próxima etapa | Responsável |
|---|---|---|
| 1 | Rever visualmente o site e a app em produção (1440/390) e aprovar ou pedir ajustes | **Diana** |
| 2 | Decidir mapeamento editorial EP01–03 → episódios e publicar conteúdo real (as 3 séries atuais são catálogo demo) | **Diana / Elisa** |
| 3 | Criar rota HTTPS pública para o gateway de vídeo (ex.: `media.goworld.digital`) | **Helena** |
| 4 | CORS do tenant `gwd`: adicionar `goworld.digital` e `app.goworld.digital` | **Helena** |
| 5 | ARO: projeto/chave `gwd` no catálogo de media + regra para episódios FREE | **Helena** |
| 6 | Acesso servidor-a-servidor da API GWD ao `/token` + variáveis `ATLAS_MEDIA_*` na API | **Helena** |
| 7 | Ingerir os episódios reais (os 3 assets atuais são clips de teste de 10–12 s) | **Helena / conteúdo** |
| 8 | Expor o `telegram-provider` (`/binding/start`) à API GWD para o EP04 | **Helena** |
| 9 | Aplicar `sql/pilot-p01-assets.sql` após GO (está em rollback por omissão) | **Helena** (GO Diana) |
| 10 | Ligar a GWD ao ARO real (hoje mock) — sem ativar pagamentos | **Helena** |
| 11 | Corrigir ou remover o projeto Vercel `app` (erro de configuração, sem domínio) | **Helena** |
| 12 | Depois de 3–8: testar EP01–03 e EP04 no browser em produção e fechar G4 | **Claude Code** |
| 13 | Ajustes visuais pedidos pela Diana; páginas genéricas restantes (comunidade/percursos/privacidade públicas) | **Claude Code** |
| 14 | Merge #7 → main e rebase do #12 | **Diana** (com Claude Code) |

## Estados
VISUAL STRUCTURE: YES · VISUAL FIDELITY: review Diana · ACADEMY UI: YES · PROGRESS/XP REAL: YES · G4 REAL MEDIA: FAIL · EP04 TELEGRAM: FAIL · PAGAMENTOS: desligados.

## Rollback
Vercel → projeto `gwd`: rollback para `dpl_ECtpAr9rAWUhVmZTzxESEGntzRse`; projeto `gwd-app`: rollback para `dpl_HwvzubH12CshMkaHHoTesAS8kQaR` (versões anteriores do PR #7).
