# Golden Screen — Homepage desktop/mobile · plano de execução

Branch `feat/gwd-visual-excellence-v1` (a partir do PR #12). Não toca em API, DB, Auth nem no rollout do PR #16.
Processo: `.claude/skills/gwd-visual-excellence/references/qa-loop.md`.

## 1. Diagnóstico com evidência (23/10, `golden-shot.cjs` em build de produção local)
Relatório: sem overflow, 0 imagens partidas, 0 erros de consola, 0 imagens sem alt, 0 controlos sem nome. LCP = imagem do hero (0,2 s a 390 e 0,5 s a 1440 em local).

| # | Gap face ao alvo do Drive | Prioridade |
|---|---|---|
| G1 | O hero do alvo mostra o **trio da equipa canónica** à frente do globo, com a **colagem de cidades** à direita. A implementação tem um retrato único e uma segunda figura esbatida à esquerda, que parece um artefacto | P0 |
| G2 | 25 animações a correr ao fim de 3 s, das quais **16 infinitas** (`gwd-pulse` nos nós da rede; pausa fora do ecrã por verificar) (orçamento proposto: ≤ 3 loops, pausados fora do ecrã) | P0 (performance/bateria) |
| G3 | Com reduced motion o LCP passa para 2,6 s (o conteúdo depende de uma animação de entrada) | P0 (acessibilidade) |
| G4 | Faixa de valor: no alvo os ícones são maiores e estão sem caixa; na implementação estão compactos e dentro de um contentor | P1 |
| G5 | "Entrar" é um botão com contorno no alvo e texto simples na implementação | P1 |
| G6 | "Ver o vídeo" existe no alvo e falta na implementação. **Só entra com um vídeo real aprovado** (verdade do produto) | P2, bloqueado por conteúdo |
| G7 | Nota de conformidade sob os CTAs ("Participar não constitui vínculo…") não está no alvo | manter (gate legal), torná-la mais discreta |
| G8 | Mobile: no alvo as pessoas dominam o primeiro ecrã; na implementação o retrato fica cortado e o globo domina | P0 (mesmo asset do G1) |

## 2. Direção artística (síntese)
"Pessoas reais ligadas ao mundo". O hero tem três planos com profundidade real:
1. Fundo: globo e rede luminosa (SVG animado).
2. Plano médio: o trio canónico.
3. Plano frontal: a colagem de cidades e a nota manuscrita.

O movimento reforça a ideia de ligação: um sinal viaja entre os nós e "chega" às pessoas. Não usamos partículas soltas nem brilho generalizado.

## 3. Técnicas propostas (benefício · custo · performance)
| Técnica | Benefício | Custo técnico | Impacto em performance | Decisão |
|---|---|---|---|---|
| Rede SVG com pulsos (`stroke-dashoffset`/`offset-path`), 6–10 nós | assinatura GWD própria e leve | baixo (refazer `GlobalNetwork.tsx`) | ~0 KB, só compositor; pausada fora do ecrã | **SIM** |
| Parallax por ponteiro/scroll em 3 camadas (≤ 12 px) | profundidade cinematográfica | baixo (1 listener rAF) | < 1 KB; desligado com reduced motion e em touch | **SIM** |
| Revelação por scroll com CSS scroll-driven animations | ritmo editorial nas secções | baixo | 0 KB; o fallback é o conteúdo visível | **SIM** |
| View Transitions (home → mercados → entrar) | continuidade entre páginas, "app-like" | médio (Next 16 + skill Vercel) | 0 KB; progressivo | **SIM** (fase 2, depois da home) |
| Motion for React | coreografia de listas/gestos na app | médio | +15–20 KB gz | **só na app**, se CSS não chegar |
| Canvas 2D para o globo | mais nós e brilho | médio | CPU constante | NÃO: o SVG chega |
| WebGL / 3D (three.js) | globo 3D interativo | alto | +150 KB, GPU/bateria | NÃO na V1 |

## 4. Asset necessário (bloqueio do G1/G8)
A homepage precisa de um derivado aprovado **sem texto embutido** com o trio + cidades. Opções:
- (a) A Diana entrega o master em alta resolução usado no alvo 01/02.
- (b) Composição a partir de `01_GWD_Team_Master_Canonical_V02` (trio) com recorte, mais as cidades da referência de campanha `c04_Comeca_No_Digital`, ficando como derivado novo para aprovação.

Recomendação: (a). Se não chegar em 48 h, avançar com (b), marcado "PENDING APPROVAL" no manifesto.

## 5. Passos
1. Tokens de motion em `packages/ui/src/tokens.css` e utilitários `prefers-reduced-motion` (G3).
2. Reduzir as animações para ≤ 3 loops, com `IntersectionObserver` e `visibilitychange` (G2).
3. Novo hero com 3 camadas: asset (G1/G8), rede SVG v2 e parallax.
4. Faixa de valor e header (G4/G5); nota legal discreta (G7).
5. Revelações por scroll nas secções seguintes.
6. Loop de QA: `golden-shot.cjs` → lado a lado → autocrítica → correção (mínimo 2 iterações), `web-design-guidelines`, Lighthouse no preview Vercel, `tests/browser/verify.cjs`.
7. PR com evidências para a Diana (`acceptance-diana.md`). Sem merge nem promoção antes de APPROVED.

## 6. Critério de saída
P0 fechados; orçamentos cumpridos (LCP ≤ 2,5 s mobile, CLS ≤ 0,05, INP ≤ 200 ms, motion ≤ 20 KB); reduced motion completo; Diana APPROVED.
