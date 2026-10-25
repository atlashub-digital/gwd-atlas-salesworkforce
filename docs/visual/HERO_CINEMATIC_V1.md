# Hero Cinematográfico V1 — implementação (24/10/2026)

Direção C (experiência híbrida), decisões fechadas pela direção. Estado: **especificação artística aprovada pela direção; acabamento visual da implementação ainda não aprovado formalmente** (revisão V1.1 em preview). A versão V1 está publicada (`1cef61d`, `dpl_AuC4mrc5hx3n1ueuFpTFTmBTnqad`; rollback `dpl_HYrdnvfzA7KNqsPnd2UbiVKR8Fmh`).

## Composição
- 42 % mensagem — eyebrow "Pessoas · Conteúdo · Vendas", H1 "Comunidade Global GWD", assinatura "Aprende. Conecta. Cria. Cresce.", CTA "Entrar na Comunidade →" (`/entrar`), secundário "Já participo · Entrar" (app), nota de conformidade.
- 58 % visual — 5 camadas: atmosfera navy · globo (canvas) com ligações Europa ↔ Brasil ↔ mundo · 3 painéis de cidades · equipa digital (Diana · Tomás · Elisa · Maia, recorte do master oficial V02) · interface.
- Dock com 6 atalhos (Telegram · Discord · WhatsApp · Conteúdo · Vendas · IA).
- Mobile: composição própria (mensagem → CTA → globo + equipa → grelha 3 × 2). Tablet: 3 × 2 com a equipa limitada à coluna visual.
- Scroll B: a equipa escurece e recua, o globo desloca-se e cresce, as cidades recuam; uma linha de rede leva a "Escolhe o teu caminho" (agora a 2.ª secção). Sem scroll bloqueado.

## Atalhos — destinos reais
| Atalho | Destino | Estado |
|---|---|---|
| Telegram | `/canais#telegram` | Em preparação (sem canal oficial configurado) |
| Discord | `/canais#discord` | Em preparação |
| WhatsApp | `/canais#whatsapp` | Em preparação (nenhum `COMMUNITY_WHATSAPP_URL` configurado) |
| Conteúdo | `/academy` | Ativo (GWD Start publicado) |
| Vendas | `/oportunidades` | Ativo (percursos com regras; comércio OFF) |
| IA | `/canais#assistente` | Em preparação (assistente ainda não existe) |
`/canais` é uma página real com o estado honesto de cada canal. Quando houver URLs oficiais, troca-se o `href` do atalho, e não o layout.

## Motion
Entrada ≤ 0,9 s (acento do H1 0,2 s, equipa 0,4 s, ligações 0,7 s). O CTA nunca fica escondido. Globo: 1 loop rAF ≤ 30 fps, pausado fora do ecrã e em separadores em background (medido: 0 frames). Parallax só com ponteiro fino. `prefers-reduced-motion`: composição estática completa. Animações infinitas em CSS: 0 (antes: 3 sinais SVG em loop).

## Medições (build de produção local, Playwright/Chromium)
| Métrica | Resultado | Meta |
|---|---|---|
| LCP mobile (CPU 4×, 4G lento, cache de imagem aquecida) | 1,78 s (reduced: 1,66 s) | ≤ 2,5 s |
| LCP desktop | 0,53 s | — |
| CLS | 0 | ≤ 0,05 |
| INP (Event Timing, hover + cliques nos atalhos) | 144 ms | ≤ 200 ms |
| Overflow 390 / 768 / 1024 / 1440 | nenhum | 0 |
| Erros de consola / imagens partidas | 0 / 0 | 0 |
Os browsers do Playwright não têm H.264, mas isso é irrelevante aqui (não há vídeo no hero).

## Inventário de assets
| Asset | Origem | Uso |
|---|---|---|
| `gwd-hero-team-v01.webp` (1320 × 909, alfa) e `-760` | `GWD_TEAM_MASTER_Official_V02` (Drive `1ZlLsjRq…`), fundo removido (ISNet), identidades intactas, sinalética e texto manuscrito excluídos | só no hero |
| `gwd-hero-city-barcelona/rio/santorini-v01.webp` | painéis de mercado aprovados (sem pessoas nem texto) | camada de cidades |
| `lib/globe-land.ts` | world-atlas land-50m (Natural Earth, domínio público), grelha de 2°, 2,7 KB | globo |
| Logótipos Telegram / Discord / WhatsApp | simple-icons (CC0), cores oficiais como tokens | atalhos, `/canais` |
Não usados (texto embutido): `gwd-hero-comeca-no-digital-v01.webp` e `gwd-paths-v01.webp`. Assets históricos mantidos (`gwd-hero-trio-v01`, usado no plano anterior).

## Evidência (`docs/visual/evidence/`)
`hero-v1-before-after-1440.webp`, `hero-v1-before-after-390.webp`, `hero-v1-vs-target-1440.webp`, `hero-v1-vs-target-390.webp`, `hero-v1-1024.webp`, `hero-v1-1440-reduced.webp`, `hero-v1-390-reduced-fold.webp`, `hero-v1-hover.webp`, `hero-v1-scroll-250.webp`, `hero-v1-motion.webm` (entrada, hover dos 6 atalhos com resposta do globo, scroll até aos percursos).
