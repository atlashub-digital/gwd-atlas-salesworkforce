# GWD Motion System V1

Motion explains, guides and rewards. It never decorates for its own sake, never delays content and never runs when the
user asked for reduced motion.

## Principles
1. **Network, not noise** — the brand motif is a global network of people: lines that connect, nodes that light up, signals that travel. Use it for meaning (connection, progress, arrival), not as wallpaper.
2. **Content first** — text and CTAs are visible and interactive on first paint; motion only enhances (no hidden-until-JS content, no animated LCP element).
3. **Earned celebration** — big moments (level up, badge, episode complete) only when the server confirms them.
4. **Calm app, cinematic site** — public site may layer and parallax; member app uses short, functional transitions.
5. **Respect the user** — `prefers-reduced-motion: reduce` gets instant state changes (opacity only, ≤ 120 ms) and no autoplay loops.

## Tokens (add to `packages/ui/src/tokens.css`)
```css
--gwd-dur-instant:90ms; --gwd-dur-fast:160ms; --gwd-dur-base:240ms; --gwd-dur-slow:420ms; --gwd-dur-scene:900ms;
--gwd-ease-out:cubic-bezier(.22,1,.36,1);      /* entrances, reveals */
--gwd-ease-in-out:cubic-bezier(.65,0,.35,1);   /* state changes, page transitions */
--gwd-ease-spring:cubic-bezier(.34,1.56,.64,1);/* small rewards only (badge pop) */
--gwd-stagger:60ms; --gwd-distance-sm:8px; --gwd-distance-md:24px;
```

## Pattern catalogue (technique → cost)
| Pattern | Where | Technique | Bundle / runtime cost |
|---|---|---|---|
| Hero network | homepage hero | inline SVG paths + CSS `stroke-dashoffset` / `offset-path` pulses on 6–10 nodes; paused off-screen (`IntersectionObserver`) | 0 KB lib; compositor-only |
| Hero depth | homepage hero | 2–3 layers (globe, people, cities) with pointer/scroll parallax ≤ 12 px, CSS `transform` via one rAF listener | < 1 KB |
| Section reveal | public sections | CSS scroll-driven animations (`animation-timeline: view()`), `@supports` fallback = visible | 0 KB |
| Page transitions | site ↔ entrar/markets, app routes | View Transition API (`vercel-react-view-transitions` skill); shared element for hero image → market page | 0 KB, progressive |
| Card response | path/market/opportunity cards | CSS `:hover/:focus-visible` lift 4 px + border glow; pointer-position light (CSS vars) | 0 KB |
| Journey progress | app jornada/dashboard | SVG path draw to the real % from API; node fill on completed steps | 0 KB |
| XP / level / badge | app | number tween (rAF, ≤ 600 ms), badge pop with `--gwd-ease-spring`, only on server-confirmed events | < 1 KB |
| Academy continue | Academy home, player | poster hover preview (static frame swap, no video autoplay), progress bar ease | 0 KB |
| Layout/list choreography, gestures, exit animations | only if CSS/VT cannot | **Motion for React** (`motion`, LazyMotion + `m` + `domAnimation` ≈ 15–20 KB gz, client components only) | needs PR note |
| 3D globe | rejected for V1 | WebGL/three.js ≈ 150 KB+, GPU/battery on mobile; the SVG/raster globe already carries the idea | — |

## Budgets (homepage, mobile, Lighthouse "Moto G Power" profile)
LCP ≤ 2.5 s · CLS ≤ 0.05 · INP ≤ 200 ms · TBT ≤ 200 ms · JS added by motion ≤ 20 KB gz · no animation on the LCP element · ≤ 3 concurrent infinite animations, all paused off-screen and in background tabs.

## Implementation rules
- Animate only `transform`, `opacity`, `filter: drop-shadow` sparingly, `stroke-dashoffset`; never layout properties.
- Every animated component has a reduced-motion path tested by screenshot.
- Durations/easings only from tokens.
- Server-confirmed rewards: the UI animates the API response, never optimistic XP.
- Keyboard focus must be as rich as hover (`:focus-visible` mirrors hover states).
