# Inventário de ferramentas — frente visual GWD (verificado em 23/10/2026)

## Ambiente
| Item | Valor verificado |
|---|---|
| Claude Code | 2.1.304, via Claude Desktop 3.1623.0 (Agent SDK 0.3.304) |
| Modelo ativo | Claude Opus 5.5 (`claude-opus-5-5`) |
| Node no host | não existe → build, testes e browser correm em Docker (`node:22-slim`, `mcr.microsoft.com/playwright:v1.55.1-noble`) |

## SKILLS (instruções carregadas pelo modelo)
| Skill | Origem | Estado | Verificação |
|---|---|---|---|
| `gwd-visual-excellence` | este repositório (`.claude/skills/`) | **criada** | script `golden-shot.cjs` testado na homepage (1440/390/reduced): OK |
| `vercel-react-best-practices` | `vercel-labs/agent-skills` @ `063bee9`, MIT | **incluída e fixada** no repositório | lida; 70 regras React/Next |
| `vercel-react-view-transitions` | idem | **incluída e fixada** | base para as transições entre páginas |
| `web-design-guidelines` | idem; regras de `vercel-labs/web-interface-guidelines` @ `434b7f9`, MIT | **incluída**, alterada para ler a cópia fixada `guidelines.md` em vez de um URL `main` | evita instruções remotas que mudam sem revisão |
| `frontend-design` | plugin oficial Anthropic | **instalada** (ver plugins) | ativa a partir da próxima sessão; nesta sessão o `SKILL.md` foi lido diretamente |
| `design:accessibility-review`, `design:design-critique`, `code-review`, `engineering:testing-strategy` | plugins já sincronizados da conta claude.ai | disponíveis | usados na revisão e no QA |

## PLUGINS (pacotes instalados no Claude Code)
| Plugin | Origem verificada | Ação |
|---|---|---|
| `frontend-design@claude-plugins-official` | `anthropics/claude-plugins-official` (organização Anthropic, Apache-2.0) | **instalado** (escopo user, versão `465f093`), contém apenas 1 skill, sem hooks nem MCP |
| `playwright` (diretório oficial, autor Microsoft) | `external_plugins/playwright` → `npx @playwright/mcp@latest` | **não instalado**: versão não fixada e o host não tem Node. O Playwright 1.55.1 fixo, em Docker, já cobre os testes (`tests/browser/verify.cjs` + `golden-shot.cjs`) |
| `code-review`, `pr-review-toolkit` | oficiais | não instalados: já existem `code-review` e `design:*` na sessão; evitar duplicação |

## MCP
| Servidor | Estado | Uso visual |
|---|---|---|
| Claude in Chrome | disponível na sessão | inspeção manual no Chrome real do fundador, quando útil |
| Vercel MCP | ativo | links de acesso aos previews protegidos por SSO, para as capturas |
| Google Drive MCP | ativo | acesso verificado às maquetes e à media canónica (`visual-sources.md`) |
| Chrome DevTools MCP | **não instalado** | precisa de Node/Chrome no host; Lighthouse e trace de performance correm em Docker. Reavaliar se for preciso fazer profiling interativo |

## Dependências de código (não são ferramentas do Claude)
| Biblioteca | Decisão |
|---|---|
| `motion` (Motion for React) | **não adicionada agora**. Só entra quando um padrão do Motion System não for possível com CSS ou View Transitions, e com nota de custo no PR (LazyMotion ≈ 15–20 KB gz) |
| `hls.js` 1.5.17 | já existe na app (player Academy) |
| WebGL / three.js | rejeitado para a V1 (≈ 150 KB+, custo em GPU e bateria no mobile) |
