# GWD Visual Recovery — WAVE 3 (markets) + WAVE 4 (member app) — Diana → Claude Code

## WAVE 3 — Europa e Brasil (apps/web, Sonnet-quality)
- /oportunidades/europa: identidade própria (cyan/blue, cidades, internacional). Copy: "Digital Team Europa" + "O teu país não limita as tuas oportunidades." Secções: formação, rede internacional, comunidade, oportunidades, social media, affiliate, seller. Media: gwd-market-europa-v01.webp. NUNCA afirmar emprego/rendimento.
- /oportunidades/brasil: "Digital Team Brasil" + "O digital pode ser o teu próximo passo." green APENAS como accent regional (badges/detalhes). Media: gwd-market-brasil-v01.webp. Brasil contemporâneo/premium, sem caricatura.
- Estas páginas são read-model de oportunidades reais via API (/v1/opportunities) se disponível; senão estados honestos "EM BREVE"/"EM PREPARAÇÃO".
- Mobile dedicado (não desktop encolhido).

## WAVE 4 — Member app (apps/app) — Opus
- App shell: sidebar compacta desktop (Início, Minha jornada, Academy, Comunidade, Oportunidades, Meus Pontos, Meu Perfil, Suporte) + topbar (notificações, avatar) + mobile: topbar e navegação inferior (Início/Academy/Comunidade/Oportunidades/Perfil). O teste E2E usa botão "Abrir navegação" + link "A minha jornada" — manter esses nomes.
- Dashboard (target 01/02): greeting card com avatar + "Olá, {nome}!" + "A tua jornada na comunidade GWD." + botão "Continuar →" (para jornada); card "A tua jornada" com "N de 4 etapas concluídas", barra de progresso, 4 steps (Concluído/Em curso/Pendente) com estados coloridos; card "Os teus pontos" (estrela, total REAL de /v1/gamification/summary, "Últimas atividades" dos events reais, "Ver todas →"); grelha "Explora a GWD": Academia / Comunidade / Oportunidades (3 cards com setas).
- Jornada (target 05): stepper visual central — numerado 1-4, estados complete/active/pending/locked, progresso textual, pontos por etapa reais. Textos E2E a manter: botão "Li e concluí esta etapa", mensagem "GWD Start concluído.".
- Academy (target 04): catálogo prático — 3 itens reais do @gwd/domain (digital-foundations, paths, ...), com duração/nível/categoria onde existirem dados reais; sem cursos falsos "LIVE"; restantes "EM PREPARAÇÃO".
- Comunidade (target 06): presença comunitária com Maia como guia (PersonaCard), regras/aceitação existentes (texto E2E "Registar adesão"/"A tua adesão às regras está registada." mantidos), estados honestos para grupos/eventos futuros.
- Oportunidades (target 07): lista com estados AVAILABLE/COMING SOON/TRAINING ONLY/NOT ELIGIBLE; dados só reais; "AINDA NÃO ATIVADO" mantido em vendas/ganhos (E2E).
- Pontos/Perfil/etc.: manter dados reais; visual calmo (menos glow), tokens partilhados; sucesso #22C55E etc.
- NÃO tocar: API/worker/db/contracts/domain. Mantém E2E: nomes de botões/labels/textos já citados + todos os que tests/browser/verify.cjs usa.
- Build final: npx pnpm@10.28.0 --filter @gwd/app build (e web build) a passar.

## ENTREGA (por wave)
Código no working tree (sem commit). Reporta: ficheiros, componentes, resultado do build.
