# Spine Pair Review — Crounch

## Overall verdict
The pair is readable and mostly coherent for a human, but it is not yet a clean extraction-grade contract for downstream consumers. The main blockers are broken `sources` paths for the Epic 2 story refs, incomplete inline visual-reference wiring, and missing Key Flow narratives for the newly added Epic 2 capabilities. Once those are fixed, the pair should be solid.

## 1. Flow coverage — thin
Checked source-backed coverage for PRD UJ-1/UJ-2/UJ-3 plus Story 2.1 rating, Story 2.2 sort, and Story 2.3 filter against `Key Flows`.
### Findings
- **high** Epic 2 requirements are only covered in tables, not in `Key Flows`; there is no narrative flow for rating, sort, or untasted-only filtering, so downstream consumers cannot source-extract those additions as first-class journeys. (EXPERIENCE.md:41-79, 113-131). *Fix:* Add at least one Epic 2 flow (or extend Flow 1/2 explicitly) showing rating, re-sorting, and filter-empty-result behavior end to end.
- **low** UJ-3 / FR-5 is intentionally outside the UX spine, but that exclusion is declared late and outside `Key Flows`, so a consumer walking sources-to-flows has to infer why it is missing. (PRD:28-30, 91-105; EXPERIENCE.md:111, 113-131). *Fix:* Add a one-line note near `Key Flows` saying UJ-3 / FR-5 is excluded because it is CLI-only and outside this UX contract.

## 2. Token completeness — adequate
Checked YAML token definitions and every dotted `{path.to.token}` reference in prose/frontmatter components.
### Findings
- **medium** `{colors.foreground}` and `{colors.muted}` are referenced by Epic 2 component tokens but are not locally defined in frontmatter; they resolve only via implicit shadcn inheritance. Human-readable, but not self-contained for machine extraction. (DESIGN.md:5-7, 80-90, 112, 147-148). *Fix:* Either define inherited effective values explicitly, or add a machine-readable inheritance note naming the upstream token source as contract.

## 3. Component coverage — thin
Checked every named component used in either spine against `DESIGN.md > Components` and `EXPERIENCE.md > Component Patterns`.
### Findings
- **medium** Coverage is asymmetric: `Icône info`, `Barre de progression / compteur`, `Dialog détail`, and `Skeleton` have behavioral rows but no matching visual rows in `DESIGN.md.Components`; conversely `Badge goûtée`, `Badge archivée`, `Button primary`, and `Section divider` have visual rows but no matching behavioral rows in `EXPERIENCE.md.Component Patterns`. (DESIGN.md:137-148; EXPERIENCE.md:45-55). *Fix:* Add explicit cross-spine rows for each load-bearing component, even if the rule is short (“inherits shadcn visuals” / “decorative only, no interaction”).
- **medium** The new Epic 2 controls are covered, but not under identical names: frontmatter keys use `badge-rating`, `toolbar-sort-control`, `toolbar-filter-toggle`, while prose/behavior rows switch to `Badge notation`, `Toolbar sort control`, `Sort control`, `Toolbar filter toggle`, and `Filter toggle`. (DESIGN.md:76-90, 145-148; EXPERIENCE.md:52-55). *Fix:* Choose one canonical name per component and reuse it verbatim across frontmatter keys, prose bullets, and behavior tables.

## 4. State coverage — thin
Checked the two IA surfaces (`Catalogue`, `Détail d'une saveur`) for expected operational states, including Epic 2 additions.
### Findings
- **medium** `Catalogue` is reasonably covered, including cold-load, offline, archived, rating set/unset, and filter-active-empty-result, but `Détail d'une saveur` lacks explicit state rows of its own (open with unrated flavor, open with existing rating, archived detail, write-failure/retry behavior). Current detail behavior is scattered between component rules and a single edge-case note. (EXPERIENCE.md:22-23, 45-55, 57-67, 123-131). *Fix:* Add dedicated detail-surface state rows covering tasted/untasted, rated/unrated, archived, and persistence-failure handling.

## 5. Visual reference coverage — broken
Checked all files in `imports/` and `.working/`, plus whether the spines link them inline with purpose statements and a single conflict rule.
### Findings
- **high** Visual-reference wiring is incomplete and partly broken: `EXPERIENCE.md` points to nonexistent `mockups/catalogue.html`, while the actual working mocks live under `.working/`; none of the three `.working/*.html` files are linked inline, and `key-catalogue-epic2.html` is completely orphaned from the spines. (EXPERIENCE.md:27; workspace `.working/`). *Fix:* Replace `mockups/catalogue.html` with the real `.working/key-catalogue.html`, add inline links for `.working/key-detail-dialog.html` and `.working/key-catalogue-epic2.html`, and say what each illustrates.
- **high** The six `imports/brets-fr-0*.png` screenshots are only referenced as broad ranges (`imports/brets-fr-01..06` / `imports/brets-fr-0*.png`), not individually at the sections they justify, so they are not source-extractable as evidence for specific palette/typography/shape decisions. (DESIGN.md:3, 103; EXPERIENCE.md:108). *Fix:* Inline-link each screenshot at the relevant section and annotate what it supports (hero palette, catalogue grid density, Nutri-score yellow, zigzag/torn-edge cue, etc.).

## 6. Bloat & overspecification — strong
Checked whether the pair over-prescribes implementation or repeats story-level detail unnecessarily.
### Findings
- No material bloat found; the pair stays focused on UX contract rather than implementation steps.

## 7. Inheritance discipline — broken
Checked source resolution, cross-file naming discipline, and whether inherited library/default behavior is stated cleanly.
### Findings
- **high** The three Epic 2 story paths in `sources` do not resolve from this workspace; only the PRD path does. As written, both spines point to `../../implementation-artifacts/...`, but the files actually live at `_bmad-output/implementation-artifacts/...`. (DESIGN.md:91-95; EXPERIENCE.md:4-8). *Fix:* Correct the relative paths (likely `../../../implementation-artifacts/...`) and re-verify all four sources resolve.
- **medium** Naming discipline is not strict enough for extraction: `badge-tasted` vs `Badge goûtée`, `badge-rating` vs `Badge notation`, `toolbar-sort-control` vs `Sort control`, and `toolbar-filter-toggle` vs `Filter toggle` require human interpretation. (DESIGN.md:61-90, 140-148; EXPERIENCE.md:47-55). *Fix:* Publish a canonical component glossary and use identical labels everywhere.

## 8. Shape fit — strong
Checked canonical section order against the shadcn example pair and required EXPERIENCE defaults.
### Findings
- No structural issues found. `DESIGN.md` follows the canonical order exactly, and `EXPERIENCE.md` includes all required defaults plus reasonable extras. (DESIGN.md:101-150; EXPERIENCE.md:14-113).

## Mechanical notes
- Broken cross-refs: `EXPERIENCE.md` references `mockups/catalogue.html`, but no `mockups/` directory exists in the workspace; actual HTML mocks are in `.working/`.
- Frontmatter completeness: PRD source resolves; the three Epic 2 story refs do not.
- Name inconsistencies to normalize: `badge-rating` / `Badge notation`; `toolbar-sort-control` / `Toolbar sort control` / `Sort control`; `toolbar-filter-toggle` / `Toolbar filter toggle` / `Filter toggle`; `badge-tasted` / `Badge goûtée`.
- Token extraction note: dotted token refs are mostly complete, but `foreground` and `muted` are inherited implicitly from shadcn rather than declared locally.
- Visual-reference inventory checked: `.working/key-catalogue.html`, `.working/key-detail-dialog.html`, `.working/key-catalogue-epic2.html`, and `imports/brets-fr-01-nos-chips-hero.png` through `imports/brets-fr-06-argument-bandeau.png`; no `wireframes/` or `mockups/` files were present in this workspace.
