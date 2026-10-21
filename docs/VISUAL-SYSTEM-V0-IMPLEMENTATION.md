# Visual System V0 — implementation

Scope: presentation delta over the accepted functional V1, following [VISUAL-SYSTEM-V0](VISUAL-SYSTEM-V0.md). Architecture, data, Auth, API and commercial gates are unchanged.

## Shared system

`packages/ui/src/tokens.css` owns palette, semantic aliases, radii, content width, shadows and gradients. Components and pages consume these tokens. Shared primitives live in `packages/ui/src/index.tsx`; both Next applications import the same stylesheet.

Public web uses large type, canonical people imagery, decorative SVG network lines, blue actions and selective cyan accents. Member app uses flat navy surfaces, compact navigation and activity from the existing persisted endpoints. Green is restricted to success and the Brazil accent.

Primary text contrast is 18.01:1 on the page background; secondary text 10.43:1 on the surface; action text 5.02:1, including hover; cyan links 11.80:1. Form control boundaries use a stronger token (3.59:1 against the input background). Keyboard focus is explicit. Reduced-motion preferences disable transitions and smooth scrolling.

## Approved media

The typed manifest is `apps/web/lib/media.ts`. WebP derivatives are served locally by Next Image, with intrinsic dimensions, responsive sizes and hero preload. All three retain the approved master identities; group photos preserve all four canonical personas.

| Derivative | Approved Drive master ID | Dimensions |
|---|---|---|
| gwd-team-master-v02.webp | 1ZlLsjRqZwsMuoxhehuH9hY3zYOFSJ7dF | 1600 × 900 |
| gwd-team-collaboration-v02.webp | 1FRlTsUAxnrZPL5SrJltdUbfC6zEAnXGa | 1600 × 900 |
| maia-workspace-v02.webp | 1qwY76eq18OUcGmVCcaqmGBRseKaVhr92 | 800 × 1000 |

Concept boards inform art direction only. No rasterized interface, invented customer, campaign, financial figure or ranking is embedded.

## Review evidence

`tests/browser/verify.cjs` verifies the existing end-to-end journey with isolated Postgres and an Auth protocol stub, all 10 public and 13 member routes at 360/390/768/1024/1440/1920 px, horizontal overflow, image decoding/alt text, H1 structure, keyboard skip link, mobile member navigation and reduced-motion mode. It captures homepage, public registration, Europe, Brazil and authenticated dashboard at 1440 and 390 px. The dashboard's test participant earns 40 nonfinancial points by completing four actual test steps; those records exist only in the isolated test database.

CI retains screenshots and `visual-evidence.json` in its browser evidence artifact. Final post-visual SHA, CI URL and review declaration are maintained in PR #7. Human visual homologation and live staging Auth/RLS remain subsequent review gates. No merge or production cutover.
