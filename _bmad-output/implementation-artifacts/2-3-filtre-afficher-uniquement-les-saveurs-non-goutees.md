# Story 2.3: Filtre "Afficher uniquement les saveurs non goûtées"

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a utilisateur (Johan),
I want un interrupteur pour n'afficher que les saveurs que je n'ai pas encore goûtées,
so that je puisse me concentrer, en rayon, sur ce qu'il me reste à découvrir sans être distrait par les saveurs déjà cochées.

## Acceptance Criteria

1. **Given** la grille du Catalogue affichée avec le filtre désactivé (par défaut)
   **When** l'utilisateur active l'interrupteur "Non goûtées uniquement" (situé au-dessus de la grille, à côté ou près du contrôle de tri de Story 2.2 si celle-ci est déjà livrée)
   **Then** seules les saveurs dont l'état goûté est `false`/absent sont affichées ; les saveurs déjà marquées goûtées disparaissent de la grille sans rechargement de page.

2. **Given** le filtre activé
   **When** l'utilisateur marque une saveur visible comme "goûtée" (tuile ou Dialog de détail)
   **Then** cette saveur disparaît immédiatement de la grille filtrée (le filtre reste réactif à l'état courant, pas figé au moment de son activation) — sans exiger de fermeture/réouverture de la Dialog ni de rechargement.

3. **Given** le filtre activé et une saveur marquée goûtée par erreur puis démarquée (pas goûtée)
   **When** l'utilisateur annule son geste (tuile ou Dialog)
   **Then** la saveur réapparaît immédiatement dans la grille filtrée, cohérent avec le comportement réactif de l'AC #2.

4. **Given** toutes les saveurs du Catalogue déjà marquées goûtées et le filtre activé
   **When** la grille se retrouve sans aucune saveur à afficher
   **Then** un message dédié et positif s'affiche à la place d'un espace vide (ex. "Bravo, tu as tout goûté ! 🎉" — ton léger conforme à UX-DR15, jamais un espace blanc silencieux) plutôt que de laisser la grille vide sans explication.

5. **Given** l'état du filtre (activé/désactivé)
   **When** l'utilisateur ferme et rouvre l'app
   **Then** l'état du filtre est mémorisé et réappliqué automatiquement (persistant en local storage, cohérent avec la décision de persistance actée pour le tri, Story 2.2).

6. **Given** le filtre désactivé par défaut lors de la toute première visite
   **When** le Catalogue s'affiche pour la première fois
   **Then** toutes les saveurs (goûtées et non goûtées) sont visibles — le filtre n'est jamais activé par défaut, pour ne pas surprendre un nouvel utilisateur en lui masquant des saveurs sans action explicite de sa part.

7. **Given** l'interrupteur de filtre
   **When** utilisé au clavier ou avec un lecteur d'écran
   **Then** son état actuel (activé/désactivé) est restitué explicitement (ex. `role="switch"` + `aria-checked`), suivant le même souci d'accessibilité que les autres contrôles de l'app (UX-DR14).

8. **Given** le compteur de progression du bandeau ("X/Y saveurs goûtées", Story 1.7)
   **When** le filtre "Non goûtées uniquement" est activé
   **Then** le compteur continue de refléter la progression sur l'ensemble du Catalogue (X/Y total), jamais recalculé sur le sous-ensemble filtré affiché — le filtre ne change que ce qui est visible dans la grille, jamais la signification du compteur global.

## Tasks / Subtasks

- [ ] Task 1 : Persistance de la préférence de filtre (AC: #5, #6)
  - [ ] Subtask 1.1 : Ajouter le stockage de la préférence dans un module dédié `lib/untasted-filter/` (cache.ts + index.ts) suivant exactement le même pattern allégé que `lib/sort-preference/` (Story 2.2) — scalaire booléen, pas de map, pas de `stateRef` nécessaire. `UNTASTED_FILTER_STORAGE_KEY = "crounch:untasted-filter"` (nouveau namespace, distinct des trois existants).
  - [ ] Subtask 1.2 : Schéma : un simple `z.boolean()` suffit (pas besoin d'un fichier `lib/schema/` dédié aussi lourd que `tasted.ts`/`rating.ts` — documenter ce choix dans le code, cf. Dev Notes) ; ajouter tout de même une fonction `parseUntastedFilterPreference()` dans `lib/schema/index.ts` pour rester cohérent avec le pattern "jamais de `JSON.parse` non validé" déjà appliqué partout ailleurs (AD-3/AD-7).
  - [ ] Subtask 1.3 : `readUntastedFilterPreference()` retourne `false` par défaut sur tout échec/absence (AC #6), jamais une exception.
  - [ ] Subtask 1.4 : Hook `useUntastedFilter()` — API `{ showOnlyUntasted: boolean, setShowOnlyUntasted: (value: boolean) => void }`.
  - [ ] Subtask 1.5 : Tests (`lib/schema/untasted-filter.test.ts` si un schéma dédié est créé, `lib/untasted-filter/cache.test.ts`, `lib/untasted-filter/index.test.tsx`).

- [ ] Task 2 : Contrôle UI (interrupteur) (AC: #1, #7)
  - [ ] Subtask 2.1 : Créer `components/catalogue/untasted-filter-toggle.tsx` — composant de présentation pur, reçoit `checked: boolean` et `onCheckedChange: (value: boolean) => void`. Vérifier si `@base-ui/react` expose un composant `Switch` prêt à l'emploi (le projet utilise déjà `@base-ui/react/button` et un Dialog Base UI) avant d'écrire un interrupteur ad hoc — privilégier `npx shadcn add switch` si disponible pour la cohérence visuelle avec `button.tsx`.
  - [ ] Subtask 2.2 : `role="switch"` + `aria-checked` (natif si un composant `<Switch>` shadcn/Base UI est utilisé) + label visible et explicite ("Non goûtées uniquement") — jamais une icône seule sans texte (UX-DR14).
  - [ ] Subtask 2.3 : Placer le contrôle dans `catalogue-page-client.tsx`, dans la même zone que `<SortControl>` (Story 2.2) si déjà livrée — juste après le zigzag, avant la bannière hors-ligne — visible uniquement quand `status === "ready"`.

- [ ] Task 3 : Filtrage réactif dans `catalogue-page-client.tsx` (AC: #1, #2, #3, #8)
  - [ ] Subtask 3.1 : Consommer `useUntastedFilter()` en plus de `useCatalogue()`/`useTasted()` (et `useSortPreference()`/`useRating()` si Story 2.2/2.1 déjà livrées).
  - [ ] Subtask 3.2 : Calculer `visibleFlavors = showOnlyUntasted ? sortedFlavors.filter((f) => !tastedIds.has(f.id)) : sortedFlavors` — **après** le tri (Story 2.2) s'il existe déjà, jamais avant (le filtre agit sur l'ensemble déjà ordonné, pas l'inverse — ordre des opérations : Catalogue brut → tri → filtre → grille).
  - [ ] Subtask 3.3 : `tastedInCatalogueCount`/le calcul du compteur de progression du bandeau (Story 1.7) continue d'utiliser `flavors` (l'ensemble complet, non filtré) — ne jamais substituer `visibleFlavors` à `flavors` dans ce calcul (AC #8). Vérifier explicitement ce point en revue : c'est le piège principal de cette story (confondre "ce qui est affiché dans la grille" et "ce qui alimente le compteur global").
  - [ ] Subtask 3.4 : Passer `visibleFlavors` (pas `flavors` ni `sortedFlavors` brut) à `<CatalogueGrid>`.
  - [ ] Subtask 3.5 : `handleShowOnlyUntastedChange(value)` appelle `setShowOnlyUntasted(value)` — aucune autre mutation associée.

- [ ] Task 4 : État vide dédié quand le filtre ne laisse rien à afficher (AC: #4)
  - [ ] Subtask 4.1 : Dans `catalogue-page-client.tsx`, si `status === "ready" && showOnlyUntasted && visibleFlavors.length === 0 && flavors.length > 0` (distinction importante : ce n'est PAS le cas "Catalogue vide" déjà géré par `deferred-work.md` pour un scrape sans résultat — ici le Catalogue a des saveurs, mais toutes sont goûtées), afficher un message dédié positif (ex. "Bravo, tu as tout goûté ! 🎉") à la place de `<CatalogueGrid>`, avec le même ton léger que le reste des microcopies (UX-DR15, Story 1.7 : jamais de jargon technique ni de message anxiogène).
  - [ ] Subtask 4.2 : Ce message n'est PAS un `role="alert"` (ce n'est pas une erreur) — utiliser un simple texte ou `role="status"` comme la bannière hors-ligne existante (Story 1.7).

- [ ] Task 5 : Validation finale
  - [ ] Subtask 5.1 : `npm test` — aucune régression sur la suite existante, en particulier les tests de `catalogue-page-client.tsx` qui vérifient déjà le calcul du compteur de progression (bien confirmer qu'aucun test existant ne suppose implicitement `flavors === visibleFlavors`).
  - [ ] Subtask 5.2 : `npm run lint` — clean (warnings `<img>` pré-existants exceptés).
  - [ ] Subtask 5.3 : `npx tsc --noEmit` — pas de nouvelle erreur.
  - [ ] Subtask 5.4 : `npm run build` — succès.

## Dev Notes

- **Piège principal identifié à l'avance (AC #8)** : ne jamais confondre l'ensemble utilisé pour le rendu de la grille (`visibleFlavors`, filtré) et l'ensemble utilisé pour le compteur de progression du bandeau (`flavors`, complet). Le compteur "X/Y saveurs goûtées" doit toujours refléter la progression réelle sur tout le Catalogue, même quand la grille n'affiche qu'un sous-ensemble. C'est la source d'erreur la plus probable pour cette story — la vérifier explicitement en test et en revue de code.
- **Ordre des transformations** : Catalogue brut (`useCatalogue()`) → tri (`sortFlavors()`, Story 2.2, si livrée) → filtre goûté/non-goûté (cette story) → `<CatalogueGrid>`. Ne pas inverser tri et filtre : filtrer d'abord puis trier donnerait le même résultat visuel dans ce cas précis (le filtre ne fait que retirer des éléments, il ne réordonne rien), mais respecter cet ordre documenté évite toute ambiguïté future si une prochaine story introduit un filtre qui dépend lui-même du tri.
- **Réactivité obligatoire (AC #2, #3)** : `visibleFlavors` doit être un dérivé recalculé à chaque rendu à partir de `tastedIds` (état déjà réactif via `useTasted()`, Story 1.5) — jamais un instantané figé au moment de l'activation du filtre. Aucune nouvelle logique de synchronisation n'est nécessaire : c'est une conséquence naturelle du fait que React re-render déjà `catalogue-page-client.tsx` à chaque changement de `tastedIds`.
- **Pattern de persistance allégé, comme Story 2.2** : préférence scalaire booléenne, pas de map par id — pas de `stateRef` nécessaire, à l'inverse de `useTasted()`/`useRating()`. Documenter ce choix explicitement dans le code (commentaire) pour qu'un futur lecteur ne s'étonne pas de l'absence de ce pattern ici.
- **État vide vs Catalogue réellement vide** : bien distinguer ce cas ("toutes les saveurs sont goûtées, filtre actif") du cas déjà documenté dans `deferred-work.md` (code review Story 1.4 : "pas d'état vide dédié si `data.flavors` est un tableau vide") — ce sont deux scénarios différents avec deux messages différents ; ne pas les fusionner par erreur.
- **Cohérence de ton (UX-DR15)** : le message d'état vide doit rester dans le registre "carnet de collection ludique" déjà établi (cf. `DESIGN.md` : ton pokédex/collection, jamais corporate) — s'inspirer du ton déjà choisi pour les autres microcopies de l'app plutôt que d'inventer un registre différent.

### Project Structure Notes

- Nouveaux fichiers : `lib/untasted-filter/cache.ts` (+ test), `lib/untasted-filter/index.ts` (+ test), `components/catalogue/untasted-filter-toggle.tsx` (+ test), éventuellement `lib/schema/untasted-filter.ts` si un schéma dédié est jugé utile (sinon `z.boolean()` validé inline dans `cache.ts` suffit — à trancher en dev selon la cohérence avec le reste du codebase qui a systématiquement un fichier de schéma dédié par état persistant).
- Fichiers modifiés : `components/catalogue/catalogue-page-client.tsx` (calcul `visibleFlavors`, intégration du toggle, état vide dédié), potentiellement `lib/schema/index.ts`.
- Cette story est indépendante de Story 2.1 (notation) mais bénéficie de Story 2.2 (tri) si celle-ci est déjà en place pour partager la même zone UI de contrôles au-dessus de la grille — peut néanmoins être développée seule, sans dépendance bloquante.

### References

- [Source: lib/tasted/index.ts] — `tastedIds` déjà réactif, réutilisé tel quel pour dériver `visibleFlavors` (aucune nouvelle logique de synchronisation d'état goûté nécessaire).
- [Source: components/catalogue/catalogue-page-client.tsx] — emplacement du calcul du compteur de progression (`tastedInCatalogueCount`) à ne jamais faire dépendre de `visibleFlavors` (AC #8).
- [Source: _bmad-output/implementation-artifacts/deferred-work.md, "Deferred from: code review of story-1-4"] — distinction à faire avec le cas déjà documenté de Catalogue vide (scrape sans résultat), différent du cas traité par cette story (toutes les saveurs goûtées).
- [Source: _bmad-output/planning-artifacts/epics.md, Story 1.7 (États hors-ligne et microcopy)] — ton des microcopies (UX-DR15) à respecter pour le message d'état vide de cette story.
- Décisions produit actées via `ask_user` lors de la création de cette story (2026-08-10) : filtre persistant en local storage, désactivé par défaut à la première visite.

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
