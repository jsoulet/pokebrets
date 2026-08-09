# Bug #001 : le rendu final du Catalogue ne respecte pas le mockup DESIGN.md/EXPERIENCE.md

Statut : corrigé (voir `spec-bug-001-catalogue-visual-design.md`)
Créé le : 2026-08-07
Sévérité : moyenne (aucune régression fonctionnelle, écart d'identité visuelle)

## Description

Le rendu réel de la page Catalogue (`app/page.tsx` + `components/catalogue/`) diverge fortement de la maquette de référence produite lors du design UX (`_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/.working/key-catalogue.html`), alors que celle-ci illustre explicitement les specs `DESIGN.md`/`EXPERIENCE.md`.

Les tokens de couleur et certains patterns fonctionnels (badge texte + couleur, zone de tap 44px, coin de tuile) ont bien été repris dans les composants, mais la mise en page globale a été réinterprétée/simplifiée en cours de développement plutôt que fidèlement implémentée.

## Écarts constatés

| Élément | Mockup (`key-catalogue.html`) | Implémentation réelle |
|---|---|---|
| Header | Bandeau plein moutarde (`#DDA138`), titre en police display avec contour | `<h1 className="text-3xl font-bold">Crounch</h1>` simple, sans couleur ni bandeau |
| Progression | Compteur texte **+ barre de progression visuelle** (`.progress-bar`/`.progress-fill`) | Compteur texte seul (`{tastedInCatalogueCount}/{flavors.length} saveurs goûtées`), aucune barre |
| Séparateur | Zigzag "sachet déchiré" (`.zigzag`) entre header et grille | Absent |
| Icône tuile | Emoji 🍟 dans un carré coloré rouge-chips (`.bag`) | Vraie photo (`flavor.image`) |
| Badge "goûtée" | Pastille ronde verte ✓, coin **haut-gauche** | Pilule texte "Goûtée", coin **haut-droit** |
| Icône info | Coin haut-**droit** | Coin haut-**gauche** |
| Tuile archivée | Fond beige plein + badge texte en bas centré | Fond `--archived` + pilule texte dans le flux normal |
| Bannière hors-ligne | Bandeau visible "📡 Hors ligne — dernière version connue affichée" | À vérifier / non présent dans le composant catalogue |

## Fichiers concernés

- `app/page.tsx`
- `components/catalogue/catalogue-tile.tsx`
- `components/catalogue/catalogue-page-client.tsx`
- `components/catalogue/catalogue-grid.tsx`
- Référence : `_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/.working/key-catalogue.html`, `DESIGN.md`, `EXPERIENCE.md`

## Impact

Aucune régression fonctionnelle (badges, toggle, accessibilité restent corrects — validés en revue de code sur les stories 1.4 à 1.8), mais l'identité visuelle Crounch définie en amont (header moutarde, zigzag, barre de progression) n'est pas au rendez-vous côté utilisateur final.

## Action suggérée

Revoir l'implémentation du header et de la grille pour se rapprocher du mockup validé, ou acter formellement (via une décision produit) les écarts jugés volontaires/acceptables et mettre à jour DESIGN.md/EXPERIENCE.md en conséquence.
