# Visual QA loop

```
Reference (Drive target, real image) → art-direction note → implementation → real browser → screenshot (1440, 390, reduced-motion)
→ side-by-side with target → self-critique (list gaps, rank by impact) → fix → tests → PR with evidence → Diana approval
```

## Commands (host has no Node: everything runs in Docker)
Build + start web locally and capture the golden screen next to its target:
```bash
docker run --rm -v "$PWD":/w -v gwd-pw:/pw -w /w mcr.microsoft.com/playwright:v1.55.1-noble bash -c '
  corepack enable >/dev/null 2>&1; pnpm install --frozen-lockfile >/dev/null && pnpm --filter @gwd/web build >/tmp/b.log 2>&1 || { tail -30 /tmp/b.log; exit 1; }
  [ -d /pw/node_modules/playwright ] || npm install --prefix /pw --no-audit --no-fund playwright@1.55.1 >/dev/null
  (pnpm --filter @gwd/web start >/tmp/web.log 2>&1 &) ; for i in $(seq 60); do curl -sf -o /dev/null localhost:3000 && break; sleep 1; done
  PLAYWRIGHT_MODULE=/pw/node_modules/playwright node .claude/skills/gwd-visual-excellence/scripts/golden-shot.cjs http://localhost:3000/ /w/.visual/home <target-desktop.png> <target-mobile.png>'
```
Outputs in `.visual/` (git-ignored): `home-1440.png`, `home-390.png`, `home-390-reduced.png`, `home-compare-1440.png`, `home-compare-390.png`, `home-report.json`
(overflow, console errors, image failures, a11y basics, LCP element).
Then **look at the compare images** (Read tool) and write the self-critique before changing code.

Deployed previews are behind Vercel SSO: use the Vercel MCP `get_access_to_vercel_url` share link with the same script.

## Checks
| Check | Tool | Gate |
|---|---|---|
| Layout at 1440/390, no horizontal scroll | golden-shot report | must pass |
| Console errors / broken images | golden-shot report | 0 |
| Reduced motion | `home-390-reduced.png` | content complete, no mid-animation states |
| Accessibility | report basics + `web-design-guidelines` review + keyboard walk | no criticals |
| Performance | Lighthouse (Docker `node:22-slim` + chromium) on the Vercel preview | budgets in `motion-system.md` |
| Regression | `tests/browser/verify.cjs` (CI) | green |
| Fidelity | side-by-side vs target, self-critique list | all P0 gaps closed |
| Human | Diana | `acceptance-diana.md` |
