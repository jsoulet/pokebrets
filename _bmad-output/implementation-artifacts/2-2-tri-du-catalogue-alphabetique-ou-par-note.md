# Story 2.2: Tri du catalogue (alphabétique ou par note)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a utilisateur (Johan),
I want trier la grille du Catalogue par ordre alphabétique ou par note décroissante,
so that je puisse retrouver rapidement une saveur par son nom ou repérer mes préférées en un coup d'œil.

## Depends On

- Story 2.1 (Notation des saveurs en étoiles) doit être implémentée avant celle-ci : le tri "par note" a besoin de `lib/rating/` (`useRating()`) pour lire la note de chaque saveur. Si 2.1 n'est pas encore fait, développer le tri alphabétique seul reste possible mais le tri par note sera bloqué.

## Acceptance Criteria

1. **Given** la grille du Catalogue affichée
   **When** l'utilisateur choisit le mode de tri "Alphabétique" (contrôle exposé au-dessus de la grille, sous le bandeau/zigzag existant)
   **Then** les saveurs sont réordonnées par `name` (ordre alphabétique croissant, insensible à la casse et aux accents — utiliser `localeCompare("fr", { sensitivity: "base" })`), sans jamais modifier `data/catalogue.json` ni l'ordre source du Catalogue en mémoire (le tri est un dérivé d'affichage, jamais une mutation des données, AD-1).

2. **Given** la grille du Catalogue affichée
   **When** l'utilisateur choisit le mode de tri "Par note"
   **Then** les saveurs sont réordonnées par note décroissante (5 étoiles en premier), les saveurs non notées étant placées **après** toutes les saveurs notées, dans cet ordre-là (jamais mélangées, jamais en tête) ; à note égale, l'ordre alphabétique sert de critère secondaire pour un résultat stable et prévisible.

3. **Given** un mode de tri sélectionné
   **When** l'utilisateur ferme et rouvre l'app (ou recharge la page)
   **Then** le mode de tri choisi est mémorisé et réappliqué automatiquement (persistant en local storage, même garantie de continuité que l'état goûté/pas goûté).

4. **Given** aucun mode de tri encore choisi par l'utilisateur (première visite)
   **When** le Catalogue s'affiche pour la première fois
   **Then** l'ordre par défaut est l'ordre alphabétique (pas l'ordre brut du JSON scrapé, qui n'a pas de sens pour l'utilisateur final).

5. **Given** le contrôle de sélection du mode de tri
   **When** utilisé au clavier ou avec un lecteur d'écran
   **Then** le mode actuellement actif est restitué explicitement (ex. `aria-pressed`/`role="radiogroup"` selon le composant choisi), suivant le même souci d'accessibilité que les autres contrôles de l'app (UX-DR14).

6. **Given** le Catalogue trié (quel que soit le mode)
   **When** une saveur est marquée goûtée/pas goûtée ou notée pendant que la grille est affichée
   **Then** l'ordre de tri se recalcule automatiquement pour refléter la nouvelle note (si mode "Par note") sans qu'un rechargement de page soit nécessaire — le tri est un dérivé réactif de l'état courant, pas figé au chargement initial.

## Tasks / Subtasks

- [ ] Task 1 : Schéma et persistance de la préférence de tri (AC: #3, #4)
  - [ ] Subtask 1.1 : Créer `lib/schema/sort-preference.ts` — `sortModeSchema = z.enum(["alphabetical", "rating"])`. Ne pas réutiliser un `z.string()` libre : un enum fermé protège contre une valeur corrompue en `localStorage` (cohérent avec `flavorStatusSchema`, `lib/schema/flavor.ts`).
  - [ ] Subtask 1.2 : Ajouter `parseSortMode()` dans `lib/schema/index.ts`, ré-exporter via `export * from "./sort-preference"`.
  - [ ] Subtask 1.3 : Créer `lib/sort-preference/cache.ts` — `SORT_PREFERENCE_STORAGE_KEY = "crounch:sort-preference"` (nouveau namespace, distinct de `crounch:tasted`/`crounch:rating`/`crounch:catalogue`), `readSortMode()` (retourne `"alphabetical"` par défaut sur tout échec/absence — jamais une exception, AD-3, AC #4), `writeSortMode(mode)`.
  - [ ] Subtask 1.4 : Créer `lib/sort-preference/index.ts` — hook `useSortPreference()` en miroir allégé de `useTasted()`/`useRating()` (pas besoin de `stateRef` ici : une seule valeur scalaire, pas de map, donc pas de risque de read-modify-write concurrent entre deux mutations rapprochées). API `{ sortMode: SortMode, setSortMode: (mode: SortMode) => void }`.
  - [ ] Subtask 1.5 : Tests (`lib/schema/sort-preference.test.ts`, `lib/sort-preference/cache.test.ts`, `lib/sort-preference/index.test.tsx`) suivant la structure des tests équivalents de `lib/tasted/`.

- [ ] Task 2 : Fonction de tri pure (AC: #1, #2)
  - [ ] Subtask 2.1 : Créer `lib/catalogue/sort.ts` (à côté de `lib/catalogue/cache.ts`, mais fonction pure sans effet de bord — ne touche jamais `localStorage`) exportant `sortFlavors(flavors: Flavor[], mode: SortMode, getRating: (id: string) => number | undefined): Flavor[]`.
  - [ ] Subtask 2.2 : Mode `"alphabetical"` : `[...flavors].sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }))` — copie du tableau (`[...flavors]`), ne jamais muter `flavors` en place (le tableau vient de `data/catalogue.json` via `useCatalogue()`, propriété de `lib/catalogue/`, AD-2).
  - [ ] Subtask 2.3 : Mode `"rating"` : comparer `getRating(a.id) ?? -1` vs `getRating(b.id) ?? -1` (décroissant), avec `a.name.localeCompare(b.name, "fr", { sensitivity: "base" })` comme critère secondaire en cas d'égalité (AC #2). Utiliser `-1` (jamais `0`) comme valeur de repli pour une saveur non notée, afin qu'elle se retrouve toujours strictement après une saveur notée 1 étoile.
  - [ ] Subtask 2.4 : Tests unitaires exhaustifs (`lib/catalogue/sort.test.ts`) : tri alpha avec accents/casse mixte, tri par note avec égalités, saveurs non notées reléguées en fin, tableau vide, tableau à un seul élément (ne doit jamais planter), immutabilité du tableau d'entrée (vérifier que la référence/le contenu original n'est pas modifié).

- [ ] Task 3 : Contrôle UI de sélection du mode de tri (AC: #1, #2, #5)
  - [ ] Subtask 3.1 : Ajouter un composant `components/catalogue/sort-control.tsx` — deux boutons ("Alphabétique" / "Par note") formant un groupe, `role="radiogroup"` avec `aria-checked`/`aria-pressed` sur chaque option (suivre AC #5). Vérifier si `@base-ui/react` expose déjà un composant `ToggleGroup`/`RadioGroup` réutilisable (le projet utilise déjà `@base-ui/react/button` et un `Dialog` Base UI, cf. `components/ui/dialog.tsx`) — privilégier `shadcn add` pour scaffolder un composant `ui/` cohérent avec `button.tsx` plutôt que d'écrire un groupe de boutons ad hoc sans les variantes `cva` existantes.
  - [ ] Subtask 3.2 : Composant de présentation pur, ne lit/écrit jamais `localStorage` — reçoit `value: SortMode` et `onChange: (mode: SortMode) => void` en props (même philosophie que `star-rating.tsx`, Story 2.1).
  - [ ] Subtask 3.3 : Placer `<SortControl>` dans `catalogue-page-client.tsx`, juste après le zigzag (`ZIGZAG_MASK_STYLE`) et avant la bannière hors-ligne, uniquement visible quand `status === "ready"` (pas de sens pendant le chargement/l'erreur — pas de saveurs à trier).

- [ ] Task 4 : Intégration dans `catalogue-page-client.tsx` (AC: #1, #2, #3, #4, #6)
  - [ ] Subtask 4.1 : Consommer `useSortPreference()` et (si Story 2.1 livrée) `useRating()` dans `catalogue-page-client.tsx`.
  - [ ] Subtask 4.2 : Dériver `sortedFlavors = sortFlavors(flavors, sortMode, getRating)` — recalculé à chaque rendu (pas de `useMemo` prématuré à moins qu'un profilage ne montre un besoin réel ; la taille du Catalogue reste petite, cf. NFR2 "ne jamais sacrifier la vitesse au profit de l'exhaustivité" n'impose pas de mémoisation ici), garantissant AC #6 (réactif à tout changement de note/goûté sans reload).
  - [ ] Subtask 4.3 : Passer `sortedFlavors` (pas `flavors` brut) à `<CatalogueGrid>`.
  - [ ] Subtask 4.4 : `handleSortModeChange(mode)` appelle `setSortMode(mode)` — aucune autre mutation d'état associée.

- [ ] Task 5 : Validation finale
  - [ ] Subtask 5.1 : `npm test` — aucune régression sur la suite existante.
  - [ ] Subtask 5.2 : `npm run lint` — clean (warnings `<img>` pré-existants exceptés).
  - [ ] Subtask 5.3 : `npx tsc --noEmit` — pas de nouvelle erreur.
  - [ ] Subtask 5.4 : `npm run build` — succès.
  - [ ] Subtask 5.5 : Vérification manuelle/visuelle (Playwright si disponible en scratch, cf. pattern déjà établi dans ce projet pour les vérifications visuelles) que le contrôle de tri ne casse pas la mise en page du bandeau/zigzag sur mobile (390px) et desktop (1440px).

## Dev Notes

- **Le tri est un dérivé d'affichage, jamais une mutation de données (AD-1/AD-2)** : `data/catalogue.json` et l'ordre retourné par `useCatalogue()` ne changent jamais. `sortFlavors()` retourne toujours un **nouveau tableau** ; ne jamais faire `.sort()` in-place sur le tableau `flavors` existant (celui-ci pourrait être partagé/mémoïsé ailleurs par `lib/catalogue/`).
- **Nouveau namespace `localStorage`** : `crounch:sort-preference`, distinct de `crounch:tasted` (Story 1.5), `crounch:rating` (Story 2.1), `crounch:catalogue` (Story 1.3) — chaque feature garde son propre namespace, jamais de clé partagée entre modules (pattern déjà établi trois fois dans ce projet).
- **`useSortPreference()` plus simple que `useTasted()`/`useRating()`** : la préférence de tri est un scalaire (pas une map par id de saveur), donc pas besoin du `stateRef` de protection contre les doubles-mutations rapprochées — un seul utilisateur ne choisit qu'un mode à la fois, contrairement au toggle par-saveur qui peut recevoir deux appels rapides sur des ids différents. Ne pas sur-engineerer cette partie.
- **Dépendance sur Story 2.1** : si le tri par note doit être livré avant que la notation existe, prévoir un état intermédiaire où le mode "Par note" trie simplement toutes les saveurs comme non notées (ordre alphabétique de repli) plutôt que de crasher — mais l'ordre recommandé de développement est 2.1 puis 2.2.
- **Composant UI à choisir avec `shadcn`** : le projet a déjà `shadcn` en dépendance et une convention de composants dans `components/ui/` scaffoldés via sa CLI (`button.tsx`, `dialog.tsx`) — vérifier `npx shadcn add toggle-group` (ou équivalent Base UI) avant d'écrire un composant de zéro, pour rester cohérent avec le style/variantes `cva` déjà en place plutôt que dupliquer des classes Tailwind ad hoc.
- **Tri alphabétique français** : utiliser `localeCompare("fr", { sensitivity: "base" })` plutôt qu'un tri naïf par code point (`<`/`>`), pour classer correctement les accents (`À l'Ancienne` doit apparaître à sa place logique parmi les noms commençant par "A", pas isolé en fin de liste).

### Project Structure Notes

- Nouveaux fichiers : `lib/schema/sort-preference.ts` (+ test), `lib/sort-preference/cache.ts` (+ test), `lib/sort-preference/index.ts` (+ test), `lib/catalogue/sort.ts` (+ test), `components/catalogue/sort-control.tsx` (+ test), potentiellement un nouveau composant `components/ui/*` si scaffoldé via `shadcn add`.
- Fichiers modifiés : `lib/schema/index.ts`, `components/catalogue/catalogue-page-client.tsx`.
- `lib/catalogue/sort.ts` est délibérément situé dans `lib/catalogue/` (et non `lib/sort-preference/`) car c'est une fonction pure qui opère sur `Flavor[]` — la préférence persistée (mode choisi) et la fonction de tri elle-même restent deux responsabilités distinctes (AD-2 : chaque module a un propriétaire unique et clair).

### References

- [Source: lib/tasted/index.ts, lib/tasted/cache.ts] — pattern hook + cache à adapter (version simplifiée, scalaire) pour `lib/sort-preference/`.
- [Source: lib/schema/flavor.ts (flavorStatusSchema)] — pattern d'enum Zod fermé à reproduire pour `sortModeSchema`.
- [Source: components/catalogue/catalogue-page-client.tsx] — emplacement d'intégration du contrôle de tri (juste après le zigzag) et du calcul dérivé `sortedFlavors`.
- [Source: components/catalogue/catalogue-grid.tsx] — reçoit déjà `flavors` en prop ; aucun changement de contrat nécessaire, seule la valeur passée par l'appelant change (`sortedFlavors` au lieu de `flavors` brut).
- Décisions produit actées via `ask_user` lors de la création de cette story (2026-08-10) : tri persistant en local storage, défaut alphabétique, saveurs non notées en fin de classement pour le tri par note.

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
