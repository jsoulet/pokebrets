# Story 2.1: Notation des saveurs en étoiles

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a utilisateur (Johan),
I want attribuer une note de 1 à 5 étoiles à chaque saveur, indépendamment du fait qu'elle soit marquée goûtée,
so that je puisse garder une trace de mon avis sur chaque saveur et m'en servir plus tard pour trier le catalogue (Story 2.2).

## Acceptance Criteria

1. **Given** la Dialog de détail d'une Saveur ouverte (`FlavorDetailDialog`, Story 1.6)
   **When** l'utilisateur tape sur une étoile parmi 5
   **Then** la note (1 à 5) est enregistrée immédiatement (optimistic update, pas de confirmation modale, même pattern que le toggle goûté/pas goûté de Story 1.5) et persistée en local storage.

2. **Given** une Saveur déjà notée
   **When** l'utilisateur tape à nouveau sur l'étoile correspondant à la note actuelle
   **Then** la note est retirée (revient à "non notée") — permet d'annuler une note sans avoir à choisir une autre valeur.

3. **Given** une Saveur notée
   **When** la grille du Catalogue est affichée
   **Then** un petit badge étoile (icône + valeur, ex. "★ 4") apparaît en coin de la chip-tile correspondante, positionné de façon à ne jamais chevaucher le bouton info (coin haut-gauche) ni le badge "Goûtée" (coin haut-droit) déjà existants — utiliser un troisième coin libre (bas-gauche ou bas-droit) ou une variante compacte qui cohabite visuellement.

4. **Given** une Saveur non notée
   **When** la grille ou la Dialog de détail est affichée
   **Then** aucun badge étoile n'apparaît sur la tuile, et le contrôle de notation dans la Dialog affiche 5 étoiles vides (aucune présélectionnée).

5. **Given** la note d'une Saveur
   **When** l'utilisateur bascule l'état goûté/pas goûté (tuile ou Dialog)
   **Then** la note n'est jamais modifiée ni réinitialisée par cette action — les deux états (goûté, note) sont indépendants et stockés séparément (AD-1 : jointure uniquement par `flavor.id`, jamais de couplage entre features).

6. **Given** le contrôle de notation (5 étoiles) dans la Dialog
   **When** utilisé au clavier (Tab pour atteindre les étoiles, flèches ou Entrée/Espace pour sélectionner)
   **Then** chaque étoile est un élément focusable individuellement avec un `aria-label` explicite (ex. "Noter 3 étoiles sur 5") et l'état actuel de la note est restitué aux technologies d'assistance (ex. `aria-pressed` ou équivalent), conformément au pattern d'accessibilité déjà appliqué au toggle goûté/pas goûté (UX-DR14).

## Tasks / Subtasks

- [ ] Task 1 : Schéma de données de la note (AC: #1, #2)
  - [ ] Subtask 1.1 : Créer `lib/schema/rating.ts` — `ratingStateSchema = z.record(flavorIdSchema, z.number().int().min(1).max(5))`, en miroir exact de `lib/schema/tasted.ts` (map sparse id → valeur, jamais un tableau). Exporter `RatingState`.
  - [ ] Subtask 1.2 : Ajouter `parseRatingState()` dans `lib/schema/index.ts` (même pattern que `parseTastedState()`), et ré-exporter `rating.ts` via `export * from "./rating"`.
  - [ ] Subtask 1.3 : Tests unitaires du schéma (`lib/schema/rating.test.ts`) : valeurs 1-5 acceptées, 0/6/négatif/flottant/chaîne rejetés, clé invalide (pas un slug) rejetée, objet vide accepté.

- [ ] Task 2 : Module `lib/rating/` — seul propriétaire de l'état de notation (AC: #1, #2, #5)
  - [ ] Subtask 2.1 : Créer `lib/rating/cache.ts` en miroir exact de `lib/tasted/cache.ts` : `RATING_STORAGE_KEY = "crounch:rating"` (nouveau namespace, distinct de `crounch:tasted` et `crounch:catalogue`), `readRatingState()` (dégradation silencieuse vers `{}` sur tout échec — absent, invalide, `localStorage` indisponible, cf. AD-3), `setRating(id, value: number | null)` qui relit l'état courant avant d'écrire (protection contre un read-modify-write périmé, même garantie que `setTasted()`, AD-8) et stocke en map sparse (une note à `null`/retirée supprime la clé plutôt que d'écrire une valeur sentinelle).
  - [ ] Subtask 2.2 : Créer `lib/rating/index.ts` en miroir de `lib/tasted/index.ts` : hook `useRating()` avec hydratation en initialiseur paresseux (`useState(() => readRatingState())`, jamais dans un `useEffect` — compatible `output: "export"`, AD-4), un `stateRef` pour la même raison que dans `useTasted()` (protéger contre deux mutations rapprochées avant re-render), et une API `{ getRating(id): number | undefined, setRating(id, value: number | null): void }`.
  - [ ] Subtask 2.3 : `'use client'` en tête des deux fichiers (même défense en profondeur que `lib/tasted/`).
  - [ ] Subtask 2.4 : Tests (`lib/rating/cache.test.ts`, `lib/rating/index.test.tsx`) — copier la structure des tests équivalents de `lib/tasted/` (lecture initiale, écriture, note retirée = clé supprimée, dégradation silencieuse sur JSON invalide, double appel rapproché n'écrase pas une mutation concurrente).

- [ ] Task 3 : Composant contrôle "5 étoiles" réutilisable (AC: #1, #2, #6)
  - [ ] Subtask 3.1 : Créer `components/catalogue/star-rating.tsx` — composant de présentation pur (ne lit/écrit jamais `localStorage` lui-même, reçoit `value: number | undefined` et `onChange: (value: number | null) => void` en props, même philosophie que `catalogue-tile.tsx`, Story 1.5/1.6).
  - [ ] Subtask 3.2 : 5 boutons individuels (pas un seul `<input type="range">` ni un groupe non focusable un par un) — chaque étoile est un `<button type="button">` avec `aria-label` explicite ("Noter {n} étoile(s) sur 5") pour respecter AC #6.
  - [ ] Subtask 3.3 : Logique de bascule : taper sur l'étoile correspondant à la valeur actuelle appelle `onChange(null)` (retire la note, AC #2) ; taper sur une autre étoile appelle `onChange(n)`.
  - [ ] Subtask 3.4 : Utiliser l'icône `Star`/`StarOff` (ou `Star` rempli conditionnellement) de `lucide-react`, déjà utilisé dans le projet (`InfoIcon` dans `catalogue-tile.tsx`) — pas de nouvelle dépendance d'icônes.
  - [ ] Subtask 3.5 : Couleur : réutiliser la palette existante plutôt qu'en introduire une nouvelle — DESIGN.md réserve `success` (vert) au badge "goûtée" ; proposer `primary` (moutarde) pour les étoiles pleines, cohérent avec le reste de l'identité de marque.

- [ ] Task 4 : Intégration dans la Dialog de détail (AC: #1, #2, #4, #6)
  - [ ] Subtask 4.1 : `catalogue-page-client.tsx` consomme `useRating()` en plus de `useTasted()` (même frontière Client Component, AD-4 — aucun autre composant ne doit importer `lib/rating/` directement).
  - [ ] Subtask 4.2 : Passer `rating`/`onRatingChange` en props à `FlavorDetailDialog` (mêmes conventions que `isTasted`/`onToggle`) ; la Dialog rend `<StarRating>` sous le bouton toggle goûté/pas goûté existant.
  - [ ] Subtask 4.3 : `handleRatingChange(id, value)` dans `catalogue-page-client.tsx` appelle `setRating(id, value)` — ne touche jamais `toggleTasted`/`setTasted` (AC #5).

- [ ] Task 5 : Badge étoile sur la chip-tile (AC: #3, #4)
  - [ ] Subtask 5.1 : `catalogue-tile.tsx` reçoit une nouvelle prop `rating: number | undefined` (fournie par `catalogue-grid.tsx` → `catalogue-page-client.tsx`, jointure par `flavor.id`, jamais par index, AD-1).
  - [ ] Subtask 5.2 : Badge compact (ex. `<span>★ {rating}</span>`) rendu uniquement si `rating` est défini (AC #4) — ne jamais afficher "★ 0" ou un badge vide.
  - [ ] Subtask 5.3 : Positionnement : la tuile porte déjà un bouton info en haut-gauche (`top-2 left-2`) et un badge "Goûtée" conditionnel en haut-droit (`top-2 right-2`). Placer le badge étoile en **bas-droit** (`bottom-2 right-2`) pour ne chevaucher aucun des deux existants sur une tuile carrée compacte (4 colonnes desktop max, cf. `af587d4`). `pointer-events-none`, décoratif (même traitement a11y que le badge "Goûtée" — porté par du texte, pas seulement une couleur/icône).
  - [ ] Subtask 5.4 : Mettre à jour `catalogue-grid.tsx` et son type de props pour relayer `rating` par saveur (dérivé de `useRating().getRating(flavor.id)` côté `catalogue-page-client.tsx`, jamais calculé dans le composant de grille lui-même qui reste une projection pure).

- [ ] Task 6 : Validation finale
  - [ ] Subtask 6.1 : `npm test` (toute la suite, pas seulement les nouveaux fichiers) — aucune régression sur les 182 tests existants.
  - [ ] Subtask 6.2 : `npm run lint` — clean (au-delà des 2 warnings `<img>` pré-existants et déjà connus).
  - [ ] Subtask 6.3 : `npx tsc --noEmit` — pas de nouvelle erreur (une erreur pré-existante et sans rapport existe déjà dans `lib/catalogue/index.test.tsx`, à ignorer).
  - [ ] Subtask 6.4 : `npm run build` — succès.

## Dev Notes

- **Pattern à reproduire à l'identique** : `lib/tasted/` (cache.ts + index.ts) est le modèle de référence exact pour `lib/rating/` — même structure, mêmes garanties (dégradation silencieuse AD-3, protection read-modify-write AD-8, hydratation en initialiseur paresseux AD-4, `'use client'` en défense en profondeur). Ne pas réinventer une approche différente.
- **Frontières de propriété (AD-2 étendu à cette story)** : `lib/rating/` est le SEUL module autorisé à lire/écrire la clé `localStorage` `"crounch:rating"`. Aucun composant (`catalogue-tile.tsx`, `flavor-detail-dialog.tsx`, `star-rating.tsx`) ne doit importer `lib/rating/cache.ts` directement ni dupliquer la logique de mutation — tout passe par `useRating()` consommé exclusivement dans `catalogue-page-client.tsx` (même frontière Client Component qu'`useCatalogue()`/`useTasted()`).
- **Indépendance stricte des deux états (AC #5)** : la note et le statut goûté/pas goûté vivent dans deux clés `localStorage` distinctes (`crounch:rating` vs `crounch:tasted`) et deux hooks distincts. Ne jamais coupler leurs mutations (ex: ne pas faire en sorte que noter une saveur la marque automatiquement goûtée — décision produit explicite de cette story).
- **Jointure uniquement par `flavor.id`** (AD-1) — jamais par index de tableau, exactement comme `tastedIds`/`isTasted()`.
- **Anti-pattern à éviter** : ne pas stocker la note à `0` ou `null` en JSON comme valeur explicite dans la map — suivre le pattern "map sparse" de `setTasted()` (absence de clé = pas de note), pour rester cohérent avec le schéma `z.record(...)` et garder le payload `localStorage` minimal.
- **Composant `StarRating` réutilisable** : conçu pour être utilisé uniquement dans `FlavorDetailDialog` pour cette story (cf. décision produit : pas de contrôle de notation directement sur la tuile, seulement un badge d'affichage) — mais gardé dans son propre fichier (`components/catalogue/star-rating.tsx`) pour rester testable isolément et réutilisable si une future story en a besoin ailleurs.
- **Accessibilité (UX-DR14)** : suivre le même souci déjà appliqué au bouton toggle goûté/pas goûté (`aria-pressed`, `aria-label` explicite) — chaque étoile est un bouton individuel focusable, pas un slider ni un groupe de radio caché visuellement.

### Project Structure Notes

- Nouveaux fichiers : `lib/schema/rating.ts` (+ `.test.ts`), `lib/rating/cache.ts` (+ `.test.ts`), `lib/rating/index.ts` (+ `.test.tsx`), `components/catalogue/star-rating.tsx` (+ test).
- Fichiers modifiés : `lib/schema/index.ts` (export + `parseRatingState`), `components/catalogue/catalogue-page-client.tsx` (consomme `useRating()`, passe les props), `components/catalogue/flavor-detail-dialog.tsx` (rend `<StarRating>`), `components/catalogue/catalogue-tile.tsx` (badge étoile), `components/catalogue/catalogue-grid.tsx` (relaie `rating` par saveur), `components/catalogue/catalogue-grid-skeleton.tsx` (si le skeleton affiche déjà une variante de badge, sinon aucun changement requis).
- Alignement complet avec la structure existante — aucune nouvelle convention introduite, seulement duplication du pattern `lib/tasted/`.

### References

- [Source: lib/tasted/index.ts] — pattern hook canonique à reproduire (hydratation paresseuse, `stateRef`, mutation unique).
- [Source: lib/tasted/cache.ts] — pattern de persistance canonique à reproduire (dégradation silencieuse, map sparse, read-modify-write protégé).
- [Source: lib/schema/tasted.ts] — pattern de schéma à reproduire pour `rating.ts`.
- [Source: components/catalogue/catalogue-tile.tsx] — emplacements déjà occupés par les badges/boutons existants (info en haut-gauche, "Goûtée" en haut-droit) à ne pas chevaucher.
- [Source: components/catalogue/flavor-detail-dialog.tsx] — structure de la Dialog où intégrer `<StarRating>`.
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/DESIGN.md] — palette de couleurs (`primary` moutarde, `success` vert réservé au badge "goûtée"), anti-pattern "feu tricolore" à ne pas reproduire pour les étoiles.
- Décisions produit actées via `ask_user` lors de la création de cette story (2026-08-10) : échelle 1-5 étoiles, note indépendante du statut goûté, non-goûtée = aucune étoile pré-remplie, badge visible sur la tuile en plus du contrôle dans la Dialog.

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
