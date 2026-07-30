---
type: architecture-review
target: ARCHITECTURE-SPINE.md
reviewer: research-agent
reviewed: 2026-07-30
focus: version-currency-and-factual-accuracy
verdict: pass-with-notes
---

# Review — Version & Factual Accuracy
**Target:** `ARCHITECTURE-SPINE.md` (Crounch, 2026-07-30)

## 1. Next.js 16.x — ✅ CONFIRMED
Latest stable release as of July 25, 2026: Next.js 16.2.12 (LTS). `output: 'export'` with App Router fully supported: static routes, dynamic routes with pre-generated paths, client components, full CSS support, client-side data fetching. Unsupported (not used here): Server Actions, API routes, ISR, edge middleware.

## 2. React 19.x — ✅ CONFIRMED
Next.js 16 requires React 19.2.0 minimum. Correct pairing.

## 3. shadcn/ui — ✅ CONFIRMED (minor nuance)
Source-distributed (not a package) — no server-side dependency by design, fully compatible with `output: 'export'`. "Aucune config spéciale" holds for first-party components; third-party registries might need `transpilePackages`.

## 4. Serwist (`@serwist/next`) — ⚠️ PASS-WITH-NOTES
Actively maintained, recognized `next-pwa` successor, compatible with Next.js 14/15/16. Known issue: `sw.js` generation can fail silently with `output: 'export'` in some Next.js versions (vercel/next.js#73457) — budget debugging time, test the build pipeline early.

## 5. Netlify — ✅ CONFIRMED
Straightforward static hosting for `next build` → `out/` on Netlify; well documented, actively supported in 2026.

## 6. raw.githubusercontent.com — ⚠️ SIGNIFICANT FINDING
- Publicly accessible without auth — confirmed.
- GitHub tightened unauthenticated rate limits in May 2025 to ~60 req/hour/IP (no way to raise this on `raw.githubusercontent.com` itself; would need `api.github.com` + token instead). Low risk at this app's scale (personal/small group, one fetch per app open, mitigated by local cache/stale-while-revalidate).
- **Critical design conflict found:** the original Structural Seed placed `catalogue.json` under Next.js `public/`. Since the app builds as a static export, anything in `public/` is baked into the build output at build time — updating it would require rebuilding/redeploying the app, which contradicts the PRD's explicit requirement (FR-1, UJ-3) that the maintainer can update the catalogue via the scraper **without touching/redeploying the app**. Fixed: `catalogue.json` must live outside the Next.js build tree (e.g., `data/catalogue.json` at repo root), committed directly by the scraper, and fetched by the client at runtime via `raw.githubusercontent.com` — never bundled by the Next.js build.

## Overall Verdict: pass-with-notes
Two follow-ups incorporated into the spine: (1) catalogue.json relocated out of `public/` to preserve the "no redeploy to update data" requirement; (2) Serwist static-export caveat noted under Deferred/implementation notes.
