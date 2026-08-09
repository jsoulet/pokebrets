---
title: 'Fix bug #001 — Catalogue header does not match DESIGN.md/EXPERIENCE.md visual spec'
type: 'bugfix'
created: '2026-08-07'
status: 'done'
review_loop_iteration: 0
context: []
baseline_commit: 'f99a306f80d5e5d11c3ffe9be0316b10c6179971'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Catalogue header is missing two requirements that are explicit in `DESIGN.md`/`EXPERIENCE.md` (not just illustrative in the mockup): a progress **bar** (EXPERIENCE.md: "Barre de progression / compteur", currently only text exists) and a light brand treatment on the title/header (DESIGN.md: `primary` moutarde accent on titles, `section-divider` zigzag). Bug #001 over-scoped this by treating every mockup pixel as a requirement; re-triaged against the actual specs, most other listed discrepancies (badge corner, real photos vs emoji, archived tile background) are intentional/already-correct and out of scope here.

**Approach:** Add a visual progress bar next to the existing counter text, apply `primary` accent color to the app title, and add a zigzag `section-divider` between header and grid. No new font dependency.

## Boundaries & Constraints

**Always:**
- Progress bar reflects `tastedInCatalogueCount / flavors.length`, in sync with the existing text counter (no separate computation).
- Existing "X/N saveurs goûtées" text unchanged (EXPERIENCE.md microcopy rule) — bar is additive.
- Reuse existing tokens in `app/globals.css` (`--primary`, etc.) — no new hex literals in components.
- Progress bar has `role="progressbar"` + `aria-valuenow`/`aria-valuemin`/`aria-valuemax`.
- Leave `catalogue-tile.tsx` badge positions, archived tile background, and real photos untouched.

**Never:**
- Do not add/self-host a new font family (DESIGN.md flags "Post No Bills Jaffna"/"Recoleta" as unresolved licensing assumptions).
- Do not change badge corner positions — deliberately fixed for a11y in Story 1.5/1.7 review.
- Do not touch `lib/catalogue/` or `lib/tasted/` logic — presentation-only fix.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Normal progress | `tastedInCatalogueCount=13`, `flavors.length=48` | Bar fill ≈27%, `aria-valuenow="13"` `aria-valuemax="48"` | N/A |
| Zero tasted | count=0 | Bar fill 0%, still rendered | N/A |
| All tasted | count=flavors.length | Bar fill 100% | N/A |
| Empty catalogue | `flavors.length=0` | Bar not rendered (avoids 0/0), matches existing deferred empty-state gap | N/A |

</frozen-after-approval>

## Code Map

- `app/page.tsx` -- app title `<h1>`, needs `primary` accent treatment
- `components/catalogue/catalogue-page-client.tsx` -- header block, add progress bar + zigzag divider around existing counter
- `components/catalogue/catalogue-page-client.test.tsx` -- extend with progress bar assertions
- `app/globals.css` -- brand tokens already defined; add small `.zigzag` utility (clip-path) if needed

## Tasks & Acceptance

**Execution:**
- [x] `components/catalogue/catalogue-page-client.tsx` -- add `role="progressbar"` bar (`aria-valuenow`/`aria-valuemin="0"`/`aria-valuemax`) next to the counter text, filled via inline `width` style with `bg-primary`/`bg-muted`; only rendered when `flavors.length > 0`
- [x] `components/catalogue/catalogue-page-client.tsx` -- add zigzag `section-divider` (CSS `clip-path`, `bg-primary`) between header and `<CatalogueGrid />`
- [x] `app/page.tsx` -- apply `text-primary` accent to `<h1>Crounch</h1>`
- [x] `components/catalogue/catalogue-page-client.test.tsx` -- add tests: progress bar renders with correct `aria-valuenow`/`aria-valuemax` when ready, absent when loading (empty-catalogue case left untested — architecturally unreachable, `catalogueSchema.flavors` enforces `.min(1)`)

**Acceptance Criteria:**
- Given catalogue `ready` with 13/48 tasted, when rendered, then a `role="progressbar"` exists with `aria-valuenow="13"`, `aria-valuemax="48"`, filled ~27%, alongside the unchanged text counter.
- Given `flavors.length === 0`, when rendered, then no progress bar is rendered.
- Given the header renders, when inspected, then a zigzag divider separates it from the grid, and the title carries the `primary` accent.
- Given all existing tests, when `npm test` runs, then all pass with no regressions to badges, offline banner, or counter text.

## Review Findings

Adversarial review (Blind Hunter + Edge Case Hunter) on the diff since `baseline_commit`. 14 raw findings, deduplicated to 13.

### Patch (applied)
- [x] Progress bar missing `aria-valuetext` linking to the visible "X/N saveurs goûtées" text — screen readers would announce a generic percentage instead of the domain-specific status. **Fixed**: `aria-valuetext` added, mirrors the text counter exactly.
- [x] Progress bar test only asserted ARIA attributes, never the actual computed fill width — a width-calculation bug would have passed silently. **Fixed**: test now asserts `fill.style.width === "50%"` in addition to ARIA attributes and accessible name.
- [x] Zigzag divider used a large inline `clipPath` polygon literal directly in JSX — brittle to maintain/review. **Fixed**: extracted to a named `ZIGZAG_CLIP_PATH` module constant.

### Reject (noise, dismissed)
- Progress width/`aria-valuenow` "could exceed 100%/go out of range" — mathematically impossible: `tastedInCatalogueCount` is derived via `flavors.filter(...).length`, a subset of the same `flavors` array, so `0 <= count <= flavors.length` always holds by construction.
- "0/0 saveurs goûtées" text remains when `flavors.length === 0` — pre-existing (not introduced by this diff) and architecturally unreachable: `catalogueSchema.flavors` enforces `.min(1)`, so a `ready` catalogue can never have zero flavors.
- No test for the `flavors.length === 0` branch — same reason, this state cannot occur given the schema guarantee; no other test in the suite exercises it either.
- No regression test for "out-of-range tasted counts" — same mathematical-impossibility reasoning as above.
- "Stale flavours during non-ready status" (Edge Case Hunter) — false positive from diff-only scope: the component already `return`s early for `loading`/`error` status before reaching this code, so it's unreachable outside `ready`.
- Divider hardcodes `bg-primary`/`h-3` with no contrast safeguard — subjective styling judgment, consistent with DESIGN.md's explicit choice of `primary` for accents.
- Long inline comments in the render tree add noise — matches this codebase's established convention (every component in `components/catalogue/` carries similarly extensive inline rationale comments).
- No test coverage for the title color change (`text-primary`) — no other story in this project unit-tests a CSS color class in isolation; consistent with existing convention.
- Same `primary` accent reused across title/bar/divider "risks flattening visual hierarchy" — deliberate token reuse per this spec's Design Notes, a design opinion not a code defect.
- Progress bar accessible name untested — addressed by the same patched test above (now asserts `name: /progression des saveurs goûtées/i`).

## Change Log

- 2026-08-07 : Ajout d'une barre de progression visuelle (EXPERIENCE.md) synchronisée sur le compteur texte existant, d'un accent `primary` sur le titre et d'un séparateur zigzag (DESIGN.md `components.section-divider`) entre le header et la grille. 182/182 tests verts, lint clean, build validé. Revue adversariale : 3 patches appliqués (aria-valuetext, test de largeur réelle, extraction du clip-path), 10 findings écartés (bruit/faux positifs/déjà tranchés). Statut → `done`.

## Design Notes

Reuse the mockup's `.progress-bar`/`.progress-fill` div-pair pattern (not native `<progress>`, hard to restyle cross-browser): outer rounded track (`bg-muted`, `rounded-full`, ~8px height) + inner filled div (`style={{width: pct+"%"}}`, `bg-primary`). ARIA attributes go on the outer track div. For the zigzag, reuse `.working/key-catalogue.html`'s `clip-path: polygon(...)` value, scaled to a thin (`h-3`/`h-4`) `bg-primary` div.

## Verification

**Commands:**
- `npm test` -- expected: all pass (180 existing + new progress bar tests)
- `npm run lint` -- expected: clean (pre-existing warnings only)
- `npm run build` -- expected: succeeds, static export unaffected

## Suggested Review Order

**Progress bar (EXPERIENCE.md requirement)**

- Entry point: the new bar rendered next to the existing text counter, gated on `flavors.length > 0`.
  [`catalogue-page-client.tsx:127`](../../components/catalogue/catalogue-page-client.tsx#L127)

- ARIA wiring: `aria-valuetext` mirrors the visible text counter so screen readers announce the same domain-specific status, not a generic percentage.
  [`catalogue-page-client.tsx:135`](../../components/catalogue/catalogue-page-client.tsx#L135)

**Section divider & title accent (DESIGN.md components.section-divider)**

- Zigzag clip-path extracted to a named constant for maintainability.
  [`catalogue-page-client.tsx:14`](../../components/catalogue/catalogue-page-client.tsx#L14)

- Divider rendered between the header block and the grid.
  [`catalogue-page-client.tsx:157`](../../components/catalogue/catalogue-page-client.tsx#L157)

- App title now carries the `primary` moutarde accent per DESIGN.md's "titres/accents" rule.
  [`page.tsx:6`](../../app/page.tsx#L6)

**Tests**

- Progress bar test asserts real computed fill width, not just ARIA attributes.
  [`catalogue-page-client.test.tsx:149`](../../components/catalogue/catalogue-page-client.test.tsx#L149)
