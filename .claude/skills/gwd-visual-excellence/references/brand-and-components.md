# Brand and components (implementation map)

| Concern | Source of truth in code |
|---|---|
| Colour, radius, spacing, type tokens | `packages/ui/src/tokens.css` (mirrors Drive `BRAND_TOKENS_V1.md`) |
| Base primitives (button, card, status, field, nav icons) | `packages/ui/src/styles.css`, `packages/ui/src/index.tsx` |
| Fonts | `apps/web/app/layout.tsx`, `apps/app/app/layout.tsx` — self-hosted Plus Jakarta Sans (600–800) + Inter (400–600) |
| Public site styles | `apps/web/app/site.css` (sectioned blocks: hero, como funciona, entrar, markets) |
| Media manifest | `apps/web/lib/media.ts` (id, src, `source_master_id`, alt, width/height, focal point, status) |
| Global network motif | `apps/web/components/GlobalNetwork.tsx` (SVG) |
| Member app styles | `apps/app/app/member.css` (shell, dashboard, Academy `.ac-*`, community feed) |
| Gamification levels | `packages/config/src/index.ts` (`levels`, `levelFor`) — thresholds are product rules, not visual |

Colour roles: navy structure · electric blue action · cyan energy/accent · green success or Brazil · yellow warning · danger for errors only.
Radii: hero media 28–36 px · cards 16–22 px · buttons 12–16 px · inputs 10–14 px · pills full.
Spacing: 8 px rhythm (4, 8, 12, 16, 24, 32, 48, 64, 80, 96).
Type scale: display XL clamp(3rem, 6vw, 6.5rem) · H1 internal clamp(2.4rem, 4vw, 4.5rem) · H2 clamp(1.9rem, 3vw, 3rem) · body 0.95–1 rem.
Community/Academy/gamification UX: progress first, one primary action per card, rewards only after server confirmation, empty states say what will appear and when.
