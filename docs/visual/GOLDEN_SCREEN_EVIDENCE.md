# Golden Screen — Homepage · evidência (23/10/2026)

Estado: **PRONTO PARA REVIEW DA DIANA** · asset do hero **PENDING APPROVAL** · não publicado em produção.

## Composição (PENDING APPROVAL)
| Camada | Derivado | Origem |
|---|---|---|
| Pessoas | `gwd-hero-trio-v01.webp` (950×860, 82 KB) | recorte das 3 pessoas à direita de `01_GWD_Team_Master_Canonical_V02`. A sinalética da parede e a nota manuscrita do original ficam de fora |
| Cidades | `gwd-hero-city-barcelona/rio/santorini-v01.webp` (10–19 KB cada) | regiões sem pessoas nem texto dos painéis aprovados Europa/Brasil |
| Globo/rede | `GlobalNetwork` v2 (SVG) | vetorial, sem raster |
Todas as entradas estão registadas em `apps/web/lib/media.ts` com `status:"PENDING_APPROVAL"`, `canonicality:"derived"` e `source_master_id`.

## Iterações (golden-shot → autocrítica → correção)
| Iteração | Achados | Correção |
|---|---|---|
| 0 (antes) | retrato único com figura duplicada esbatida; 16 animações infinitas; faixa de valor numa caixa; "Entrar" como texto | — |
| 1 | trio e cidades no lugar, 3 loops. Mas o fundo de escritório lê-se como "foto de escritório" e o globo quase não se vê | grading navy (multiply) na camada de pessoas; globo acima do gradiente de legibilidade |
| 2 | desktop alinhado com o alvo; no mobile as linhas da rede passam sobre as caras | globo no mobile atrás das pessoas |
| 3 | ok a 1440/390/reduced motion | — |

## Métricas objetivas (build de produção local, `golden-shot.cjs`)
| | Antes | Depois |
|---|---|---|
| Animações infinitas | 16 | **3**, pausadas fora do ecrã (`MotionController`) |
| Com reduced motion | — | 0 animações; parallax e sinais desligados |
| LCP (imagem do hero, medido antes do scroll) | 0,2–0,3 s (390) / 0,5–0,7 s (1440) | 0,19–0,26 s / 0,50–0,58 s |
| Overflow horizontal · erros de consola · imagens partidas · imagens sem alt | 0 | 0 |
| Peso novo de media no hero | — | ≈ 125 KB WebP no total, antes do otimizador do Next |
| JS de motion acrescentado | — | 1 componente cliente pequeno, sem bibliotecas |

Nota: o "LCP de 2,6 s com reduced motion" do plano inicial era um artefacto da medição (LCP lido depois do scroll). O script foi corrigido.

## Diferenças que ficam face ao alvo (para decisão da Diana)
1. **Globo:** no alvo é fotográfico e luminoso; aqui é vetorial (SVG). Decisão do Motion System: leve, animável e sem raster extra. Se a Diana quiser o fotográfico, é preciso um master sem texto.
2. **Fundo das pessoas:** é o escritório do Team Master, integrado por grading. Um master com fundo neutro ou recortado melhoraria a profundidade.
3. **Trio:** homem + 2 mulheres, a partir do canon. O alvo mostra mulher + homem + mulher (imagem gerada, não canónica).
4. **"Ver o vídeo":** fica fora até existir um vídeo real aprovado.
5. **Paris:** o alvo tem a Torre Eiffel; não existe imagem aprovada de Paris sem texto. Uso Barcelona, Santorini e Rio.
6. **Nota legal** sob os CTAs: mantida (gate legal), agora mais discreta.

## Evidência
Capturas em `docs/visual/evidence/`: lado a lado com o alvo a 1440 e 390, e a captura com reduced motion a 390.
