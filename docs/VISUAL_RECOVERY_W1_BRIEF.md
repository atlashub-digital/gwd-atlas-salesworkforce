# GWD Visual Recovery — WAVE 1 Implementation Brief (Diana → Claude Code)

Missão: redesign visual da homepage (golden page) + foundation. Backend/Auth/API/E2E: NÃO TOCAR.
Repo: monorepo pnpm. Web app: apps/web (Next.js 16). Só apps/web + packages/ui.

## 1. P0 — já feito por Diana
localhost:3001 removido (SiteFrame.tsx, entrar/page.tsx → https://app.goworld.digital). Não reintroduzir. Zero "localhost" no output.

## 2. TOKENS (04_BRAND_TOKENS) — centralizar em packages/ui (ou apps/web globals.css existente)
```css
--gwd-navy-950:#001020; --gwd-navy-900:#001830; --gwd-surface-800:#06264A; --gwd-surface-750:#0A315C;
--gwd-blue-600:#0060F0; --gwd-blue-500:#0A84FF; --gwd-cyan-500:#00C8F0; --gwd-cyan-400:#00E5FF;
--gwd-success:#22C55E; --gwd-warning:#FFC107; --gwd-danger:#FF5D70;
--gwd-white:#F8FAFC; --gwd-text-primary:#F4F8FF; --gwd-text-secondary:#B8C7DC; --gwd-border:rgba(108,188,255,.24);
```
- Radius: hero/feature 28-36px; cards 16-22; buttons 12-16; inputs 10-14; badges pill.
- Spacing 8px rhythm (4..96). Glow selectivo (acento, nunca geral). Zero HEX espalhado.
- Tipografia via next/font/google: Plus Jakarta Sans (display, 700-800) + Inter (UI/body 400-600).
- Scale: Display XL clamp(3rem,6vw,6.5rem); H2 clamp(1.9rem,3vw,3rem); H3 1.25-1.5rem; body .95-1rem; eyebrow .7-.8rem uppercase tracking.
- prefers-reduced-motion respeitado.

## 3. MEDIA (apps/web/public/media — já optimizado; atualizar lib/media.ts)
NOVOS derivados (todos APPROVED, canonical, source_master_id do Drive):
- gwd-team-group-v01.webp (1600x900) ← 01_GWD_Team_Master_Canonical_V02 — HERO principal + secção equipa
- gwd-team-collaboration-v02.webp (existe) — comunidade/learning
- gwd-maia-workspace-v02.webp (existe, 800x1000) — /entrar (mantém)
- gwd-market-europa-v01.webp ← 02_Digital_Team_Europa — painel Europa
- gwd-market-brasil-v01.webp ← 03_Digital_Team_Brasil — painel Brasil
- gwd-community-global-v01.webp ← 01_Community_Global — secção comunidade
- gwd-community-banner-v01.webp ← 10_Community_Banner — CTA final / banner
- gwd-how-it-works-v01.webp ← 06_Como_Funciona_GWD — secção como funciona
Mantém o padrão ApprovedMedia (id, src, source_master_id, role, alt, width, height, focal_point, status, canonicality, usage_scope). Alts descritivos PT. NOTA: gwd-hero-comeca-no-digital-v01.webp e gwd-paths-v01.webp existem mas NÃO usar (texto baked).

## 4. ESTRUTURA DA HOMEPAGE (golden page — desktop + mobile)
Nav: logo lockup | Pessoas · Conteúdo · Vendas · Europa · Brasil · Como Funciona | Entrar (ghost) | "Quero fazer parte →" (primary). Mobile: hamburger ou versão compacta.
1. HERO (cinematic): eyebrow "COMUNIDADE GLOBAL · FORMAÇÃO · OPORTUNIDADES"; H1 display "Começa no digital." (com "digital." em gradiente blue→cyan); subcopy "Pessoas. Conteúdo. Vendas. Uma comunidade global onde pessoas aprendem, encontram oportunidades, divulgam, vendem e crescem no mercado digital."; CTAs "Quero fazer parte →" (primary, para /entrar) + "Já participo" (secondary, para GWD_APP_URL+/entrar); média à direita (team-group, rounded 28-36px, glow azul subtil por trás, gradiente navy à esquerda para o texto); fundo com rede global subtil (SVG/glow, não foto rasterizada). Anotação manuscrita opcional como SVG text curva "O teu talento pode chegar a qualquer lugar do mundo." — apenas decorativo.
2. VALUE STRIP: 6 itens com ícones: Formação prática · Comunidade global · Oportunidades reais · Ferramentas e suporte · Europa e Brasil · Resultados com propósito.
3. O QUE É A GWD: 4 FeatureCards (Community, Learning, Opportunities, Sales) — copy truthful, sem números.
4. ESCOLHE O TEU CAMINHO: 3 cards (Social Media / Affiliate / Authorized Seller) — cada um com nota "ativado separadamente, com regras claras" (estado honesto).
5. EUROPA + BRASIL: dois grandes painéis lado a lado (mobile: stack) com media própria (europa/brasil webp), copy: Europa "Digital Team Europa — O teu país não limita as tuas oportunidades." / Brasil "Digital Team Brasil — O digital pode ser o teu próximo passo." (green só como accent Brasil). Links para /oportunidades/europa e /oportunidades/brasil.
6. COMO FUNCIONA: 5-6 passos numerados (Interest → Community → Learning → Path → Execution → Growth) com stepper/linha.
7. COMUNIDADE: painel com media community-global/banner + copy comunidade, sem métricas falsas.
8. ACADEMY: preview de aprendizagem (3 itens reais do domínio: digital-foundations, paths, +1) — títulos reais, sem "LIVE" falso.
9. OPORTUNIDADES: preview com estados verdadeiros (AVAILABLE/COMING SOON) — usar dados reais da API se disponíveis, senão estado "EM BREVE" honesto.
10. EQUIPA: foto de grupo (team-group/collaboration) + os 4 nomes/cargos: Diana Matos — Product, Operations & Growth; Tomás Rocha — Research & Content Intelligence; Elisa Duarte — Learning Product & Media; Maia Valente — Community, Seller Success & Gamification. Sem avatares individuais inventados.
11. CTA FINAL: banner (community-banner) + "Quero fazer parte" primary + "Já participo" secondary.
12. FOOTER: manter legal truth ("Participar não constitui vínculo de emprego nem garantia de rendimento"), Privacidade, brand lockup.

## 5. COMPONENTES (packages/ui ou apps/web/components)
Criar/reforçar: BrandLockup (SVG próprio: "GWD" bold com gradiente blue→cyan + globe glyph — nunca "g↗ GoWorld.Digital" tipográfico), Navbar, MobileNav, Container, Section, Button (primary/secondary/ghost), Badge, Card, FeatureCard, MarketPanel, PathCard, StepList, SectionHeading (eyebrow+title+lead), MediaPanel, TeamStrip, Footer. Todos consomem tokens. Sem aleatoriedade.

## 6. REGRAS
- PROIBIDO: números fake, testimonials, logos clientes, claims de rendimento/emprego.
- Preserve: rotas, contratos, E2E, LeadForm funcional, skip-link/accessibility, aria.
- Motion: reveal suave por secção (CSS/IntersectionObserver ok), hover lift 2-4px, reduced-motion.
- Imagens: next/image, sizes correctos, priority só no hero, alt PT.
- Não usar scripts/handwritten em UI/funcional.
- Manter o site compilável: `pnpm --filter @gwd/web build` (a partir da raiz) tem de passar.

## 7. ENTREGA
Código no working tree (sem commit — Diana faz commit). Lista final: ficheiros alterados, componentes novos, tokens alterados, media usado.
