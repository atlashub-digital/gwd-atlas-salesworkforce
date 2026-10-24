---
name: gwd-visual-excellence
description: GoWorld.Digital (GWD) art direction, motion and visual QA for apps/web and apps/app. Use for any visual, layout, motion, animation, interaction, responsive or accessibility work on GWD screens (homepage, /entrar, Europa/Brasil, dashboard, jornada, Academy, comunidade, oportunidades), when comparing an implementation with the approved mockups, or when preparing a screen for Diana's visual approval.
---

# GWD Visual Excellence

GWD must read as **people-first, global, premium digital, learning and opportunity oriented** — a sales workforce
*without* get-rich-quick aesthetics, AI-augmented but never sci-fi/metaverse. Every visual decision serves that.

## Canon hierarchy (higher wins on conflict)
1. Product truth, legal and commercial gates (no fake metrics, members, sales, rankings, testimonials, income promises).
2. Canonical media and personas (`references/visual-sources.md`).
3. Brand tokens and component rules (`packages/ui/src/tokens.css`, `references/brand-and-components.md`).
4. Individual screen targets (Drive `01_MAQUETES_WEB`, `02_MAQUETES_APP`).
5. Full boards / moodboards.
6. Decorative details.
If a mockup shows copy, numbers or activity that is not real, **do not reproduce it literally** — keep the layout, use real data or an honest empty state.

## Before touching code (mandatory)
1. Open the real target images, not text descriptions: `references/visual-sources.md` lists Drive IDs; download with
   `curl -sL -o <file> "https://drive.google.com/uc?export=download&id=<id>"` into the session scratchpad and **look at them** (Read tool).
2. Screenshot the current screen at 1440 and 390 (`scripts/golden-shot.cjs`) and look at it next to the target.
3. Write a short art-direction note: what the target communicates, the 3–5 largest gaps, what stays, what changes.
4. Check `references/motion-system.md` before adding any motion.

## Hard rules
- Tokens only: colours, radii, spacing, durations and easings come from CSS custom properties; no loose HEX/ms values in components.
- Navy is structure, electric blue is action, cyan is brand energy, green = success/Brazil only, yellow = warning only. No dominant purple-AI gradients. Glow is rare.
- Type: Plus Jakarta Sans 700–800 display, Inter 400–600 UI/body (self-hosted `next/font/local`). Handwritten script only as editorial annotation on imagery.
- Public site is cinematic (large media, layered backgrounds, bold display); member app is calm (navy surfaces, less glow, density, progress first).
- Media: Drive is the master, never the CDN. Derive optimized WebP/AVIF into `public/media/`, register it in `apps/web/lib/media.ts` with `source_master_id`, alt text and focal point. Concept scenes are never evidence of travel, customers, revenue or member counts.
- Decorative images/SVG: `aria-hidden` on the wrapper; meaningful images: real `alt`.
- No new runtime dependency without a written benefit/cost/perf note in the PR. Motion for React (`motion`) only where CSS/View Transitions cannot do it (see motion system).
- Never change API contracts, DB, Auth/RLS, ARO or commercial gates from visual work.

## Quality loop (every screen)
Reference → art-direction note → implementation → real browser → screenshot → side-by-side comparison → self-critique
→ fix → tests → human approval. Details and commands: `references/qa-loop.md`. Acceptance criteria: `references/acceptance-diana.md`.

Minimum evidence per change: 1440 and 390 screenshots next to the target, no horizontal overflow, no console errors,
reduced-motion screenshot, keyboard path, contrast check, Lighthouse/Web Vitals budget (`references/qa-loop.md`), browser E2E green.

## Companion skills in this repo
- `vercel-react-best-practices` — performance rules for React/Next code you write.
- `vercel-react-view-transitions` — page/section transitions with the native View Transition API.
- `web-design-guidelines` — review pass (`guidelines.md`, pinned) before asking for approval.
- `frontend-design` (plugin `frontend-design@claude-plugins-official`) — distinctive aesthetic decisions; GWD canon above always wins over generic taste.
