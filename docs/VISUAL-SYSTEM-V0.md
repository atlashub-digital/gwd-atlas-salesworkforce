# GWD Visual System V0

Status: PROVISIONAL VISUAL BASELINE — IMPLEMENT NOW, TOKENS MAY BE REFINED
Date: 2026-10-18

## Purpose

This document prevents visual drift during GWD Soft Launch V1.

The current visual direction is approved as a **reference language**, not as a pixel-perfect web specification. Codex must translate it into a responsive design system; Helena must preserve and deploy the resulting assets/runtime exactly, without redefining the design.

## Canonical visual references

Drive:
https://drive.google.com/drive/folders/14CCP6AMIcsRSADGL93kBcoEnazoj777P

These references establish:
- dark navy / deep-blue foundation;
- electric blue + cyan as primary energy/accent;
- luminous/glow treatment used selectively;
- global network / connected-world visual language;
- premium digital / technology atmosphere;
- people-first photography;
- large bold typography;
- rounded cards and CTA surfaces;
- strong contrast;
- editorial mix of technology + people + opportunity.

They are **art direction references**.

Do not rasterize an entire webpage as one image.
Do not bake body copy, buttons or data into hero images when the same content can be native HTML.
Do not reproduce fake metrics, sales, revenue, affiliate counts or unsupported claims shown in concept art.

## Brand hierarchy

Primary identity:
- GoWorld.Digital / GWD
- tagline: Pessoas · Conteúdo · Vendas
- positioning: Community-Powered Sales Workforce

Primary emotional signals:
1. people;
2. opportunity;
3. global reach;
4. learning;
5. digital execution;
6. sales;
7. AI augmentation.

The site must not visually read as:
- crypto;
- betting/gambling;
- generic SaaS dashboard;
- futuristic metaverse;
- recruitment agency;
- get-rich-quick offer.

## Color system

Use semantic tokens from day one. Do not hard-code hex values throughout components.

### Provisional V0 palette

These values are implementation defaults derived from the approved references and remain adjustable without component rewrites.

```css
:root {
  --gwd-bg-950: #001020;
  --gwd-bg-900: #001830;
  --gwd-bg-850: #002040;

  --gwd-surface-800: #06264a;
  --gwd-surface-750: #0a315c;

  --gwd-blue-600: #0060f0;
  --gwd-blue-500: #0078f0;
  --gwd-cyan-500: #00c8f0;
  --gwd-cyan-400: #00e0f0;

  --gwd-text-primary: #f4f8ff;
  --gwd-text-secondary: #b8c7dc;
  --gwd-border: rgba(108, 188, 255, .24);

  --gwd-success: #19d978;
  --gwd-warning: #f4bf4f;
  --gwd-danger: #ff5d70;
}
```

Rules:
- navy is structural;
- blue/cyan are brand energy;
- green is semantic/success or Brazil campaign accent, not global primary brand;
- gradients are allowed but must be derived from tokens;
- neon glow is accent, not default decoration on every component.

## Typography

Until a final licensed typeface is chosen:
- use a modern variable sans from the standard web stack or a repo-controlled web font;
- no font files may be committed without proper licensing;
- hierarchy matters more than exact font in V0.

Style direction:
- Display/H1: heavy, compact, high-impact;
- H2/H3: bold, clean;
- body: highly readable, neutral;
- handwritten/script style from campaign concepts is **editorial accent only**, never UI/body copy.

## Layout principles

Public web:
- editorial / cinematic;
- generous image areas;
- strong section rhythm;
- fewer, larger messages;
- conversion-oriented CTA hierarchy.

Member app:
- calmer and more functional;
- same brand tokens;
- reduced glow;
- stronger information hierarchy;
- accessibility/readability over campaign drama.

Breakpoints must be designed intentionally:
- mobile first;
- tablet;
- desktop;
- wide desktop.

Do not simply shrink desktop composition.

## Core component system

Implement reusable primitives in `packages/ui`:

- Logo / BrandLockup
- Container
- Section
- Button
- Badge
- Card
- FeatureCard
- StatCard
- Hero
- MediaHero
- SplitSection
- OpportunityCard
- JourneyCard
- Progress
- EmptyState
- FeatureGateState
- Navbar
- Footer
- AppSidebar
- AppTopbar
- Avatar / TeamMember
- Toast / Alert

All components consume semantic tokens.

## Media rules

### Source of truth
- Drive = visual/media master and approval layer.
- Web runtime = optimized derivatives only.
- Never use public Google Drive URLs as the final production CDN strategy.

### Web delivery
Approved assets should be:
1. selected from Drive;
2. exported/optimized for web;
3. placed in application public assets or approved object storage/CDN;
4. referenced through a typed media manifest.

Recommended manifest fields:
- id;
- source_master_id;
- role;
- alt;
- width;
- height;
- focal_point;
- status;
- canonicality;
- usage_scope.

### Concept images
The uploaded concept boards contain text, UI, fake metrics and composited scenes.

Use them for:
- art direction;
- composition inspiration;
- color;
- section hierarchy;
- campaign/page mood.

Do not use them verbatim as live page UI if they contain:
- fabricated numbers;
- non-canonical copy;
- non-responsive UI;
- uncertain persona fidelity;
- claims not yet approved.

## Team/persona imagery

Canonical GWD team:
- Diana Matos
- Tomás Rocha
- Elisa Duarte
- Maia Valente

Use only canonical/approved variants from the Drive persona/team library for persistent site identity.

Generated concept images that alter face/body identity are not automatically canonical.

Visual priority:
- homepage/team: canonical team master;
- community/onboarding: Maia may be primary face;
- Academy: Elisa;
- opportunities/research: Tomás;
- operations/growth: Diana.

## Truth layer

Never convert concept art into business evidence.

Do not show:
- fake sales totals;
- fake revenue;
- fake ticket values;
- fake affiliate counts;
- fake rankings;
- fake customer logos;
- fake testimonials;
- unsupported country/member counts.

Use:
- real data;
- neutral labels;
- “EM PREPARAÇÃO”;
- “EM BREVE”;
- “AINDA NÃO ATIVADO”.

## Public-web visual structure

Recommended homepage visual rhythm:

1. Header
2. Hero — people + global network + GWD positioning
3. What GWD is — Community / Learn / Opportunities / Sales
4. Choose your path
5. Europe + Brazil opportunity panels
6. How it works
7. Community / people
8. Academy / enablement
9. Opportunity marketplace
10. Team
11. Final CTA
12. Footer

## App visual structure

The app is not a marketing poster.

Use:
- same dark-navy identity;
- reduced glow;
- cards with subtle borders;
- clear progress/journey visuals;
- empty states;
- feature-state labels;
- accessible contrast.

The app should feel like the operational continuation of the public site.

## Motion

Allowed:
- subtle parallax/hero depth;
- gradient movement;
- hover elevation;
- progress transitions;
- small reveal animations.

Avoid:
- constant particle overload;
- excessive 3D;
- animation that harms reading or mobile performance.

Respect `prefers-reduced-motion`.

## Accessibility

Minimum:
- WCAG AA contrast for body/UI text;
- keyboard navigation;
- visible focus;
- semantic headings;
- alt text;
- no information conveyed only by color;
- motion reduction.

## Codex responsibilities

Codex must:
1. create tokens before page-level styling;
2. centralize styles in `packages/ui`;
3. avoid one-off colors unless documented;
4. build responsive components, not screenshot replicas;
5. use concept art as reference, not as HTML substitute;
6. keep all content/data truthful;
7. produce desktop + mobile preview evidence;
8. document any new visual token.

## Helena responsibilities

Helena must not reinterpret or redesign the visual system.

Helena owns:
- asset/runtime delivery;
- Vercel image/config behavior;
- environment wiring;
- caching/CDN/storage configuration;
- domain deployment;
- performance evidence.

If an asset is too large or unsuitable for production, Helena should report the blocker; replacement/optimization should preserve the approved visual intent.

## Visual gate

Before production cutover:
- desktop homepage reviewed;
- mobile homepage reviewed;
- member app dashboard reviewed;
- Europe/Brazil acquisition pages reviewed;
- no fake metrics/claims;
- canonical team imagery check;
- typography/spacing consistency;
- Lighthouse/performance sanity;
- accessibility sanity;
- final palette token adjustments can be made centrally.

## Important status

The **visual direction is approved enough to implement**.
The **exact color values are not yet final brand canon**.

Therefore:
- do not block engineering waiting for final color micro-adjustments;
- do not scatter hard-coded values;
- implement tokenized V0 now;
- promote final values later through one controlled token update.
