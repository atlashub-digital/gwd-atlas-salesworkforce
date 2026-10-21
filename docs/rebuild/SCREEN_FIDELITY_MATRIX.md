# SCREEN FIDELITY MATRIX — target ↔ implementação (1440 / 390)

Evidência: `test-results/*.png` gerados pelo E2E (`tests/browser/verify.cjs`). Avaliação interna — **não substitui a aprovação visual da Diana**.

| Target | Ecrã | Implementado | Diferenças restantes | Estado |
|---|---|---|---|---|
| Master 01/02 · web 01/02 | Homepage | hero people-first com globo, foto canónica, nota manuscrita, barra de 6 benefícios; mobile foto→título→CTAs empilhados→3 benefícios; Como funciona com 5 passos | a pessoa da maquete (óculos de sol) não existe na Media Canon → usada `Comunidade Global` canónica; sem "Ver o vídeo" (não há vídeo aprovado); secções abaixo do hero mantêm a estrutura anterior | PARCIAL→ALTA |
| Master 03/04 · web 03/04 | /entrar | título do master board, foto Maia à direita (desktop) / no topo (mobile), cartão central, benefícios | sem campo Cidade e sem chips multi-escolha (o contrato de lead não os guarda); testemunho fictício da maquete substituído por nota verdadeira | ALTA |
| Master 05–08 · web 05–08 | Europa / Brasil | hero de mercado, DIGITAL TEAM + nome em gradiente, lead com acento, 5 benefícios, secção "três passos" | as caras da maquete diferem da Media Canon; bandeiras/colagens de cidades só via foto canónica | ALTA |
| Master 09 · web 09 | Como funciona | 5 cartões numerados sobre cena de rede | sem rota dedicada `/como-funciona` (âncora na homepage) | ALTA |
| App master 10/11 · app 01/02 | Dashboard | saudação + banner, cartão de nível (XP real), jornada stepper, pontos + últimas atividades, 4 cartões com foto, bottom nav 5 itens | topbar sem pesquisa/notificações (sem backend); nome do participante em vez de avatar foto | ALTA |
| App 12 · app 05 | Jornada | stepper com concluído/atual/bloqueado, resumo de progresso | — | ALTA |
| App 06 | Comunidade | banner, regras, canais oficiais, feed "EM BREVE" | feed da maquete (posts, gostos) não existe → não simulado | PARCIAL (por verdade) |
| App 07/09 | Oportunidades | vazio honesto + 3 percursos com foto e estado | produtos/preços da maquete (Market) não autorizados | PARCIAL (por verdade) |
| Academy master 10 · app 04/08 | Academy home | hero com série em destaque, chips, pesquisa, Continue Watching (servidor), rails por categoria, XP/badges | catálogo tem 3 séries demo (não preenchemos a grelha com cursos fictícios) | ALTA |
| Academy master 11 | Episódio player+reader | player 16:9 HLS, tabs Vídeo/Ler/Recursos/Notas, lista "Nesta série", marcar concluído, próximo | sem vídeo real ligado (ver MEDIA_GWD_CONTRACT_MATRIX) → estado "Vídeo indisponível" | ESTRUTURA OK · MEDIA FAIL |
| Market master 12/13 | Market | não implementado (sem catálogo/checkout autorizados) | — | NÃO IMPLEMENTADO (por gate) |

Resultado: **GWD VISUAL STRUCTURE IMPLEMENTED: YES** · **GWD VISUAL FIDELITY: pendente de review Diana** (não declarar PASS sem homologação humana).
