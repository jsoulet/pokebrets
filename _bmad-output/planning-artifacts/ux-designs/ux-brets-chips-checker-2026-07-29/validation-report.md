# Validation Report — crounch

- **DESIGN.md:** `_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/DESIGN.md`
- **EXPERIENCE.md:** `_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/EXPERIENCE.md`
- **Run at:** 2026-08-15T13:15:00+02:00

## Overall verdict
Le pair DESIGN.md/EXPERIENCE.md reste lisible et bien structuré, mais il n'est plus assez fiable comme contrat canonique. Les plus gros écarts portent sur la complétude des tokens, la couverture des composants réellement livrés et plusieurs comportements/états devenus faux ou obsolètes après les derniers polishs UI (segmented control 3 états, dialog restylé, badge/bouton info, zigzag, footer).

Ce drift est attendu : beaucoup de polish visuel ad-hoc a été fait sans repasser par une Update des spines. Le contenu de fond (IA, ton, flows principaux, forme des documents) reste solide — c'est la synchronisation avec le code qui a besoin d'un rattrapage, pas une refonte.

## Category verdicts
- Flow coverage — thin
- Token completeness — broken
- Component coverage — broken
- State coverage — thin
- Visual reference coverage — adequate
- Bloat & overspecification — adequate
- Inheritance discipline — thin
- Shape fit — adequate

## Findings by severity

### Critical (1)
**Token completeness** — Tokens consommés mais jamais déclarés (DESIGN.md:8-16,85,90,112,145,151-152)
`{colors.foreground}` et `{colors.muted}` sont consommés par toolbar-sort-control, toolbar-filter-toggle et l'icône info, mais `colors` ne déclare que primary/accent/success/archived/background (+ paires foreground associées).
Fix: déclarer explicitement ces tokens dans DESIGN.md avec leurs valeurs réelles (ou paires light/dark) au lieu de déléguer à "l'héritage shadcn".

### High (7)
**Flow coverage** — UJ-3 / FR-5 sans Key Flow dédié (prd.md:30,96 · EXPERIENCE.md:119,123)
Ces sources restent référencées mais sont évacuées par une note "hors périmètre UX".
Fix: retirer cette source du pair UX, ou expliciter formellement l'exclusion.

**Token completeness** — Aucune cible de contraste pour les combinaisons porteuses (DESIGN.md:105-153 · EXPERIENCE.md:95)
Fix: documenter les couples de contraste attendus et la cible minimale (AA) pour chaque combinaison charge-bearing.

**Token completeness** — Valeurs visuelles non tokenisées dans le code (catalogue-page-client.tsx:173,218 · catalogue-tile.tsx:99 · flavor-detail-dialog.tsx:65-68 · app/layout.tsx:20-33)
Zigzag #ffc602 + trait noir, badge "Goûtée" #8fbf98, titre de dialog #b5652e, police font-tanker : valeurs divergentes du spine.
Fix: ramener l'implémentation sur les tokens documentés, ou promouvoir ces valeurs en tokens nommés.

**Component coverage** — Filtre documenté comme switch binaire, livré comme segmented control 3 états (DESIGN.md:87-90,152,166 · EXPERIENCE.md:55,148 · tasted-filter-control.tsx:18-51)
Fix: remplacer la spec du switch par une spec canonique de TastedFilterControl (3 options, règles de vide).

**Component coverage** — Dialog détail et Button primary désynchronisés du code (DESIGN.md:147 · EXPERIENCE.md:50,58 · flavor-detail-dialog.tsx:57-92)
Fix: réécrire la spec visuelle et comportementale du détail selon le composant réellement monté.

**State coverage** — Échec d'écriture locale : spec vs code divergent (EXPERIENCE.md:75 · lib/tasted/cache.ts:67-68 · lib/rating/cache.ts:62 · lib/sort-preference/cache.ts:47-48 · lib/tasted-filter/cache.ts:72)
Documenté avec rollback + Toast ; le code dégrade silencieusement sans toast.
Fix: implémenter réellement rollback + toast, ou corriger la spine.

**Inheritance discipline** — Nommage divergent entre spine et code (DESIGN.md:147,151-152 · EXPERIENCE.md:54-58 · sort-control.tsx:15 · tasted-filter-control.tsx:18 · flavor-detail-dialog.tsx:82 · app/layout.tsx:20-33)
Fix: choisir des noms canoniques uniques et les propager partout.

### Medium (8)
**Flow coverage** — Cas d'échec applicables non couverts par un flow (EXPERIENCE.md:67,75,125-152). Fix: ajouter un flow d'échec réseau/cold start.

**Component coverage** — Progress bar et footer non couverts (DESIGN.md:146 · catalogue-page-client.tsx:183-207 · app/layout.tsx:5,66 · site-footer.tsx:6-20). Fix: ajouter une ligne de composant pour chacun.

**Component coverage** — Toast/Checkbox inventoriés mais non implémentés (DESIGN.md:137 · EXPERIENCE.md:41-59). Fix: implémenter ou retirer du pair.

**State coverage** — État vide "Goûtées" sans résultat non documenté (catalogue-page-client.tsx:269-279 · EXPERIENCE.md:71). Fix: ajouter un état vide explicite pour filterMode = tasted sans résultat.

**State coverage** — État "catalogue vide mais fetch réussi" absent (EXPERIENCE.md:65-75). Fix: ajouter ou exclure explicitement cet état.

**Inheritance discipline** — Flows sans identifiants sources verbatim (prd.md:28-30 · EXPERIENCE.md:125-152). Fix: préfixer les flows avec les IDs sources.

**Inheritance discipline** — Cross-refs de tokens non entièrement fiables (DESIGN.md:85,90,112 · EXPERIENCE.md:61-101). Fix: rendre DESIGN.md auto-suffisant sur tous les tokens exposés.

**Shape fit** — Responsive & Platform en retard sur l'implémentation (EXPERIENCE.md:107-109 · catalogue-grid.tsx:4,30 · catalogue-grid-skeleton.tsx:11). Fix: synchroniser les breakpoints avec le code actuel.

### Low (6)
**Visual reference coverage** — Références vagues aux imports brets.fr (DESIGN.md:103 · EXPERIENCE.md:115). Fix: liens fichier-par-fichier.

**Visual reference coverage** — Mockups cités en bloc, pas par section (EXPERIENCE.md:27). Fix: renvois ciblés depuis les sections concernées.

**Bloat & overspecification** — Contexte produit re-raconté au lieu de référencé (DESIGN.md:101-103 · EXPERIENCE.md:14-27,113-119). Fix: convertir en références courtes au PRD.

**Bloat & overspecification** — Section Components en forme narrative (DESIGN.md:137-152). Fix: structure tabulaire systématique.

**State coverage** — Focus/hover des nouveaux contrôles non couverts (star-rating.tsx:31-44 · pill-button-styles.ts:1-18 · catalogue-tile.tsx:78-85). Fix: documenter focus-visible, pressed, hover.

**Shape fit** — Structure macro correcte, fraîcheur responsive à revoir (DESIGN.md:101-154 · EXPERIENCE.md:14-121). Fix: remettre Responsive & Platform à jour.

## Mechanical notes
- Les `sources:` des deux spines pointent bien vers des fichiers existants.
- Référence non résoluble pour un outil mécanique : `imports/brets-fr-01..06` n'est pas un vrai chemin de fichier.
- Le littéral d'exemple "Noter {n} étoiles sur 5" dans EXPERIENCE.md ressemble à une référence de token et sera extrait à tort par un walker naïf ; à échapper ou reformuler.
- Pas de Mermaid détecté dans les deux spines.

## Reviewer files
- `review-rubric.md`
