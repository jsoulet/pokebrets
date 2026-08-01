---
epic_num: 1
story_num: 5
story_key: 1-5-marquer-une-saveur-comme-goutee-et-persister-letat
baseline_commit: 89e68119deafc7e1805e884183b356ab52965885
inputDocuments:
  - '_bmad-output/planning-artifacts/epics.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/EXPERIENCE.md'
  - '_bmad-output/planning-artifacts/prds/prd-brets-chips-checker-2026-07-29/prd.md'
  - '_bmad-output/specs/spec-crounch/SPEC.md'
  - '_bmad-output/implementation-artifacts/1-3-chargement-du-catalogue-avec-cache-local-et-degradation-reseau.md'
  - '_bmad-output/implementation-artifacts/1-4-affichage-du-catalogue-en-grille-visuelle.md'
---

# Story 1.5: Marquer une Saveur comme goûtée et persister l'état

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a utilisateur (Johan),
I want cocher/décocher une Saveur comme "goûtée" d'un tap, et retrouver cet état à chaque réouverture de l'app,
so that je puisse suivre ma progression sans jamais perdre mes coches, même après avoir fermé l'app.

## Acceptance Criteria

1. **Given** une Saveur non goûtée dans la grille, **When** l'utilisateur tape sur sa chip-tile, **Then** un badge "goûtée" apparaît instantanément en coin de la tuile (le fond de la tuile reste neutre, jamais de remplissage plein — anti-pattern "feu tricolore" rejeté) et l'écriture en local storage se fait dans la foulée, sans confirmation modale (FR3, UX-DR5, UX-DR11)
2. **Given** l'app fermée puis rouverte sur le même appareil, **When** le Catalogue se réaffiche, **Then** toutes les Saveurs précédemment cochées réapparaissent cochées (FR4) — l'État de dégustation n'est jamais transmis à un serveur ni partagé entre appareils
3. **Given** deux toggles rapprochés sur la même Saveur (ou deux onglets), **When** les écritures se produisent, **Then** la mutation passe par une fonction canonique unique de `lib/tasted/` qui relit l'état le plus récent avant d'écrire, évitant qu'un read-modify-write périmé n'écrase l'autre (AD-8)
4. **And** le compteur de progression du header ("X/N saveurs goûtées") se met à jour instantanément à chaque toggle (UX-DR10)
5. **And** le lecteur d'écran annonce le changement d'état ("{Nom}, goûtée" / "pas goûtée") (NFR3, UX-DR14)

## Tasks / Subtasks

- [x] Task 1: Définir le contrat public de `lib/tasted/` et son modèle de persistance locale (AC: #2, #3)
  - [x] Subtask 1.1: Écrire d'abord les tests rouges pour le contrat bas niveau (`readTastedState`, `setTasted`) en reprenant le pattern Story 1.3 (`cache.ts` + tests co-localisés) : stockage absent, payload valide, JSON corrompu, payload hors schéma, `localStorage` qui throw.
  - [x] Subtask 1.2: Créer `lib/tasted/cache.ts` comme module `'use client'` dédié, avec une clé `localStorage` namespacée (`"crounch:tasted"`), et interdire tout accès direct au stockage depuis `components/` ou `app/`.
  - [x] Subtask 1.3: Implémenter `readTastedState(): TastedState` via `parseTastedState` (`lib/schema/index.ts`), sans jamais throw ; tout stockage absent/illisible/invalide doit se dégrader en map vide.
  - [x] Subtask 1.4: Implémenter la fonction canonique `setTasted(id, next)` dans `lib/tasted/cache.ts`, qui relit l'état persistant le plus récent juste avant l'écriture (AD-8), écrit la nouvelle version, puis retourne le snapshot normalisé à utiliser par le hook.

- [x] Task 2: Implémenter `useTasted()` comme unique frontière client de l'état goûté/pas goûté (AC: #1, #2, #3, #4)
  - [x] Subtask 2.1: Écrire d'abord les tests rouges du hook (`lib/tasted/index.test.tsx`) pour l'hydratation initiale, le toggle on, le toggle off, la mise à jour instantanée du compteur, et les écritures rapprochées sur la même saveur.
  - [x] Subtask 2.2: Créer `lib/tasted/index.ts` avec `'use client'`, sur le modèle de `lib/catalogue/index.ts`, et exposer `useTasted()` comme seule API consommée par l'UI.
  - [x] Subtask 2.3: Initialiser l'état React en lazy initializer depuis `readTastedState()` pour rester compatible avec `output: "export"` et ne jamais toucher `window`/`localStorage` pendant le prerender statique.
  - [x] Subtask 2.4: Exposer depuis le hook un contrat explicite de type `{ tastedIds, tastedCount, isTasted, toggleTasted, setTasted }`, où `tastedIds` est un `Set` dérivé de l'état persisté et où `toggleTasted(id)` délègue toujours à la fonction canonique `setTasted(id, boolean)` plutôt qu'à un read-modify-write basé sur un snapshot React potentiellement périmé.
  - [x] Subtask 2.5: Résoudre pragmatiquement la persistance sous forme de map sparse : une saveur décochée doit être retirée de la map persistée plutôt que stockée à `false`, tout en gardant `tastedStateSchema` comme schéma d'autorité ; l'absence de clé signifie "pas goûtée".

- [x] Task 3: Câbler l'état goûté dans la surface Catalogue sans casser les frontières de composants établies en Story 1.4 (AC: #1, #2, #4)
  - [x] Subtask 3.1: Écrire d'abord les tests rouges UI (mock de `useCatalogue()` + `useTasted()`) pour le badge "goûtée", la disparition du badge au second tap, et le compteur `"X/N saveurs goûtées"` mis à jour sans délai.
  - [x] Subtask 3.2: Garder `app/page.tsx` comme Server Component et utiliser `components/catalogue/catalogue-page-client.tsx` (ou un petit wrapper client voisin) pour composer `useCatalogue()` + `useTasted()` ; aucune lecture/écriture `localStorage` ne remonte dans `app/`.
  - [x] Subtask 3.3: Étendre `components/catalogue/catalogue-grid.tsx` pour accepter des props pures de goût (`tastedIds` et `onToggleFlavor`, ou équivalent) tout en continuant à itérer par `flavor.id` ; la grille reste un composant de projection, pas un store.
  - [x] Subtask 3.4: Étendre `components/catalogue/catalogue-tile.tsx` sans le transformer en `'use client'` : lui passer `isTasted` et `onToggle`, rendre une action sémantique de type `button`, afficher le badge "goûtée" en coin quand `isTasted === true`, et conserver le fond neutre pour les saveurs `active` comme `archived`.
  - [x] Subtask 3.5: Ajouter dans la surface Catalogue un header de progression affichant exactement `"X/N saveurs goûtées"` ; calculer `X` en joignant `tastedIds` avec `data.flavors` par `flavor.id` (jamais par index, jamais via un compteur déconnecté du Catalogue courant).

- [x] Task 4: Préserver l'accessibilité, l'équivalence clavier/souris et la compatibilité avec les stories suivantes (AC: #1, #4, #5)
  - [x] Subtask 4.1: Garantir la sémantique interactive complète de la chip-tile (tap/clic + clavier) avec `button` et `aria-pressed`, en maintenant une surface de hit ≥ 44×44px et un retour immédiat cohérent avec UX-DR11.
  - [x] Subtask 4.2: Ajouter une annonce lecteur d'écran explicite du changement d'état (`"{Nom}, goûtée"` / `"{Nom}, pas goûtée"`) depuis le coordinateur client, afin que `catalogue-tile.tsx` reste purement présentational.
  - [x] Subtask 4.3: Préserver les acquis Story 1.4 : badge `archived` textuel et lisible, fond `bg-background`/`bg-archived` correct, aucun faux état busy sur “Réessayer”, aucun nouvel état vide inventé ; ne pas peindre la tuile en vert et ne pas introduire une structure qui empêcherait Story 1.6 d'ajouter plus tard une action “info” distincte.

- [x] Task 5: Couvrir exhaustivement les comportements et valider l'absence de régression (AC: #1, #2, #3, #4, #5)
  - [x] Subtask 5.1: Couvrir `lib/tasted/cache.test.ts` : lecture vide/valide/corrompue, suppression d'une saveur décochée, `getItem`/`setItem` qui throw, et preuve que `setTasted()` relit bien le stockage juste avant écriture.
  - [x] Subtask 5.2: Couvrir `lib/tasted/index.test.tsx` : hydratation depuis le stockage, toggle immédiat on/off, compteur instantané, robustesse des toggles rapprochés, absence de crash quand la persistance locale échoue.
  - [x] Subtask 5.3: Mettre à jour `components/catalogue/catalogue-tile.test.tsx`, `components/catalogue/catalogue-page-client.test.tsx` et, si utile, `app/page.test.tsx` pour vérifier badge goûtée, `aria-pressed`, microcopy du compteur, persistance reflétée au premier rendu, et préservation des états `loading`/`error` de Story 1.3.
  - [x] Subtask 5.4: Exécuter d'abord les suites ciblées sur `lib/tasted/` et `components/catalogue/`, puis `npm test`, `npm run build` et `npm run lint` ; aucune dépendance nouvelle, aucun test réseau réel.
  - [x] Subtask 5.5: Vérifier explicitement qu'aucune régression n'apparaît sur les points déjà différés en Story 1.4 (pas de busy-state “Réessayer”, pas d'état vide spéculatif) et que `lib/catalogue/` reste inchangé comme seul propriétaire de la fraîcheur.

## Dev Notes

- **Portée stricte de la story** : FR-3 / FR-4 uniquement. Cette story ajoute la persistance et le toggle du goûté, plus le compteur de progression dans la surface Catalogue. Elle ne doit ni modifier la logique de fraîcheur réseau de `lib/catalogue/`, ni anticiper la Dialog de détail (Story 1.6), ni inventer la bannière hors-ligne de Story 1.7. [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.5`]
- **Architecture recommandée pour `lib/tasted/`** :
  - `lib/tasted/cache.ts` — module `'use client'` propriétaire du stockage local, sur le pattern de `lib/catalogue/cache.ts`, avec `TASTED_STORAGE_KEY`, `readTastedState()` et la fonction canonique `setTasted(id, boolean)` exigée par AD-8.
  - `lib/tasted/index.ts` — module `'use client'` exposant `useTasted()`, sur le pattern de `lib/catalogue/index.ts`, avec état React hydraté en lazy initializer et API publique stable pour l'UI.
  - **Pas de `fetch.ts`** dans ce module : la story ne fait aucune I/O réseau ; ajouter un troisième fichier vide serait du cérémonial inutile. Le split minimal cache + hook suffit ici.
- **Contrat proposé pour `useTasted()`** : `tastedIds: ReadonlySet<Flavor["id"]>`, `tastedCount: number`, `isTasted(id)`, `toggleTasted(id)`, `setTasted(id, boolean)`. Le hook peut conserver l'état source en `TastedState` (`Record<string, boolean>`) et dériver `Set`/count via `useMemo`, mais **toute mutation doit passer par la fonction canonique persistante**, jamais par un simple `setState((prev) => ...)` déconnecté du stockage. [Source: `lib/catalogue/index.ts`, `ARCHITECTURE-SPINE.md#AD-8`]
- **Décision de persistance** : utiliser une map sparse persistée sous `"crounch:tasted"` ; une saveur décochée est supprimée de la map au lieu d'être enregistrée à `false`. Cela garde le payload petit, reste valide vis-à-vis de `tastedStateSchema`, et n'altère pas le contrat produit (clé absente = pas goûtée). Documenter cette convention dans les commentaires/tests pour éviter une implémentation hésitante.
- **Schéma déjà existant à réutiliser tel quel** : `lib/schema/tasted.ts` définit déjà `tastedStateSchema = z.record(flavorIdSchema, z.boolean())`, et `lib/schema/index.ts` expose déjà `parseTastedState()`. Ne surtout pas créer un second schéma, un type ad hoc, ou un tableau d'IDs parallèle ; AD-7 impose une forme partagée unique. [Source: `lib/schema/tasted.ts`, `lib/schema/index.ts`, `ARCHITECTURE-SPINE.md#AD-7`]
- **État actuel des fichiers de Catalogue à modifier** :
  - `components/catalogue/catalogue-page-client.tsx` est déjà la frontière client qui projette `useCatalogue()` vers `loading` / `error` / `ready`. Story 1.5 doit conserver ce rôle et y composer `useTasted()` plutôt que remonter le state dans `app/page.tsx`.
  - `components/catalogue/catalogue-grid.tsx` est aujourd'hui un simple `CatalogueGrid({ flavors })` ; il doit rester sans accès au stockage ni logique de persistance.
  - `components/catalogue/catalogue-tile.tsx` est aujourd'hui un composant de présentation pur (`<li>` + `<img>` + nom + badge archivée). Story 1.5 peut le rendre interactif via des props (`isTasted`, `onToggle`) **sans** lui ajouter `'use client'`, tant qu'il reste consommé depuis la frontière client existante.
  - `app/page.tsx` doit rester un shell Server Component minimal. [Source: `components/catalogue/catalogue-page-client.tsx`, `components/catalogue/catalogue-grid.tsx`, `components/catalogue/catalogue-tile.tsx`, `app/page.tsx`]
- **Contrainte de structure pour ne pas piéger Story 1.6** : ne pas transformer la totalité de la tuile en un bouton imbriqué impossible à faire cohabiter plus tard avec une action “info” distincte. Le plus sûr est de garder `CatalogueTile` comme composition présentationale d'une surface principale de toggle (`button`) pouvant coexister plus tard avec un second contrôle frère dédié au détail, sans button-in-button invalide. [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.6`, `EXPERIENCE.md#Component Patterns`]
- **Badge goûtée et fond de tuile** : la couleur verte `#3FA34D` appartient au badge `badge-tasted`, pas au fond de la tuile. Le correctif de revue Story 1.4 a déjà rétabli `bg-background` / `bg-archived` côté tile ; Story 1.5 doit préserver exactement cette règle et ajouter seulement un badge discret en coin. [Source: `DESIGN.md#Components`, `DESIGN.md#Do's and Don'ts`, `_bmad-output/implementation-artifacts/1-4-affichage-du-catalogue-en-grille-visuelle.md#Review Findings`]
- **Compteur de progression** : le texte attendu est `"X/N saveurs goûtées"`, jamais un pourcentage. `X` doit être dérivé par jointure sur les `flavor.id` du Catalogue courant ; cela protège contre les clés orphelines éventuelles sans jamais purger automatiquement l'état persistant, conformément à AD-1. Les saveurs `archived` comptent toujours dans `N` et peuvent rester cochées/décochées. [Source: `EXPERIENCE.md#Component Patterns`, `EXPERIENCE.md#Voice and Tone`, `ARCHITECTURE-SPINE.md#AD-1`]
- **Accessibilité comportementale** : l'annonce de changement d'état ne doit pas reposer seulement sur `aria-pressed`. Prévoir une annonce explicite depuis le composant client coordinateur (ex: région `aria-live="polite"` mise à jour après toggle) afin de satisfaire l'AC sans rendre `CatalogueTile` stateful. Clavier et souris doivent être équivalents. [Source: `EXPERIENCE.md#Accessibility Floor`]
- **Contrainte Next.js 16 / export statique** : tous les modules touchant `localStorage`/`window` doivent porter `'use client'` et rester sous une frontière client minimale. Les Server Components restent la valeur par défaut ; cette story doit donc étendre la frontière client existante, pas convertir la route entière. [Source: `ARCHITECTURE-SPINE.md#AD-4`, `next.config.ts`, External: Next.js docs — `use client` / Static Exports, consultées le 2026-08-01]
- **Aucune nouvelle librairie** : le repo a déjà React 19, Next 16.2.12, Vitest 4.1.10, Testing Library et Tailwind v4. Il n'y a ni Zustand, ni Redux, ni React Query, ni SWR. L'implémentation doit rester en hooks React + modules `lib/` dédiés, cohérente avec les stories 1.3 et 1.4. [Source: `package.json`]

### Project Structure Notes

- **CREATE** `lib/tasted/cache.ts` — accès `localStorage` + mutation canonique `setTasted`.
- **CREATE** `lib/tasted/index.ts` — hook `useTasted()` comme point d'entrée public unique du module.
- **CREATE** `lib/tasted/cache.test.ts` et `lib/tasted/index.test.tsx` — couverture TDD du stockage et du hook.
- **UPDATE** `components/catalogue/catalogue-page-client.tsx` — composer `useCatalogue()` et `useTasted()`, afficher le compteur, pousser les props pures vers la grille/tuile.
- **UPDATE** `components/catalogue/catalogue-grid.tsx` — accepter les props de goûté sans devenir source de vérité.
- **UPDATE** `components/catalogue/catalogue-tile.tsx` — rendre la tuile actionnable via props tout en restant un composant de présentation sans `'use client'`.
- **UPDATE** `components/catalogue/catalogue-page-client.test.tsx`, `components/catalogue/catalogue-tile.test.tsx`, éventuellement `components/catalogue/catalogue-grid.test.tsx` et `app/page.test.tsx` — assertions UI ciblées sans re-tester les détails internes de `useCatalogue()`.
- **DO NOT TOUCH** `lib/catalogue/index.ts` / `lib/catalogue/cache.ts` pour modifier leur contrat public ou leur logique de fraîcheur ; Story 1.5 s'appuie dessus, elle ne les redéfinit pas.
- **DO NOT TOUCH** `next.config.ts` et ne pas introduire de code serveur, route API, Server Action, ni stockage distant.

### Testing Requirements

- Réutiliser Vitest + Testing Library déjà configurés ; aucun test ne doit effectuer de vrai appel réseau.
- Garder la séparation de responsabilités de test :
  - `lib/tasted/*` teste la persistance locale et le hook goûté.
  - `components/catalogue/*` teste la projection UI du contrat `useCatalogue()` + `useTasted()`.
  - `app/page.test.tsx` reste un smoke test du shell.
- Pour les tests UI, mocker `useCatalogue()` et/ou `useTasted()` plutôt que de rejouer la logique interne de stockage/réseau déjà couverte au bon niveau.
- Couvrir explicitement :
  - badge goûtée affiché/retiré,
  - compteur `"X/N saveurs goûtées"` mis à jour immédiatement,
  - persistance reflétée au premier rendu,
  - annonce accessibilité,
  - robustesse des écritures rapprochées,
  - non-régression des états `loading` / `error` existants.
- Validation finale attendue : `npm test`, `npm run build`, `npm run lint`.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.5`] — user story et acceptance criteria exacts.
- [Source: `_bmad-output/planning-artifacts/prds/prd-brets-chips-checker-2026-07-29/prd.md#4.2 Suivi de dégustation`] — FR-3 / FR-4 exact wording.
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-1 — Frontière de données Catalogue ⇄ État de dégustation`] — jointure par `flavor.id`, jamais par index, état non purgé au refresh Catalogue.
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-4 — Aucun code serveur applicatif, frontière Client Component explicite`] — modules `localStorage` client-only, compatibilité `output: 'export'`.
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-7 — Schéma partagé et versionné (Catalogue, Saveur, État de dégustation)`] — réutilisation obligatoire de `lib/schema/`.
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-8 — Mutation atomique de l'État de dégustation`] — fonction canonique `setTasted(id, boolean)`.
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/DESIGN.md#Components`] — `chip-tile`, `badge-tasted`, `badge-archived`, fond neutre et badge vert.
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/DESIGN.md#Do's and Don'ts`] — vert réservé au badge, jamais au remplissage plein de tuile.
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/EXPERIENCE.md#Component Patterns`] — tap-to-toggle, compteur de progression, saveur archivée toujours tappable.
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/EXPERIENCE.md#Accessibility Floor`] — annonce lecteur d'écran, équivalence clavier/souris, tap target.
- [Source: `_bmad-output/specs/spec-crounch/SPEC.md#CAP-3`] — capacité produit “marquer une Saveur comme goûtée”.
- [Source: `_bmad-output/specs/spec-crounch/SPEC.md#CAP-4`] — capacité produit “restaurer l'État de dégustation”.
- [Source: `_bmad-output/implementation-artifacts/1-3-chargement-du-catalogue-avec-cache-local-et-degradation-reseau.md`] — pattern `lib/catalogue/` (hook public + cache interne + no-throw browser storage).
- [Source: `_bmad-output/implementation-artifacts/1-4-affichage-du-catalogue-en-grille-visuelle.md`] — structure `components/catalogue/`, corrections de revue, items différés à ne pas réintroduire.
- [External: Next.js docs — `use client` / Static Exports] — recommandation de garder les Server Components par défaut et de pousser la frontière client au plus bas niveau utile (consulté le 2026-08-01).

## Previous Story Intelligence

- Story 1.3 a établi le pattern de module à répliquer : un **point d'entrée public unique** (`useCatalogue()`), des helpers internes co-localisés, lazy initialization pour le stockage navigateur, et des fonctions `read*`/`write*` qui ne throw jamais. `lib/tasted/` doit adopter la même discipline, mais sans couche réseau. [Source: `_bmad-output/implementation-artifacts/1-3-chargement-du-catalogue-avec-cache-local-et-degradation-reseau.md`]
- Story 1.3 a aussi figé la frontière d'ownership : `lib/catalogue/` reste seul propriétaire de la fraîcheur des données catalogue. Story 1.5 ne doit pas glisser de logique de fetch, retry, ou comparaison de révision dans la couche goûtée.
- Story 1.4 a créé la structure durable de la surface Catalogue : `CataloguePageClient` comme frontière client, `CatalogueGrid` et `CatalogueTile` comme composants métier réutilisables, `app/page.tsx` comme shell serveur minimal. Story 1.5 doit brancher le goûté **dans cette structure**, pas en ouvrir une seconde.
- La revue Story 1.4 a corrigé un point directement pertinent ici : le fond d'une tuile goûtée doit rester neutre (`bg-background` / `bg-archived`) ; seule l'information de badge porte la couleur `success`. Toute proposition de “tuile verte” serait une régression explicite.
- Deux items ont été différés en Story 1.4 et doivent le rester ici : **pas de busy-state inventé sur “Réessayer”**, **pas d'état vide spéculatif**. Story 1.5 n'est pas le bon endroit pour élargir le contrat `useCatalogue()`.
- Les commits récents (`0c0d7d7` puis `89e6811`) montrent le niveau d'exigence attendu : composants ciblés sous `components/catalogue/`, tests co-localisés, corrections de review appliquées sans élargir le scope. Utiliser ce même niveau de précision pour `lib/tasted/`.

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (GitHub Copilot CLI)

### Debug Log References

- `npx vitest run lib/tasted/` → rouge confirmé (modules inexistants), puis 19/19 verts après implémentation de `lib/tasted/cache.ts` et `lib/tasted/index.ts`.
- `npx vitest run components/catalogue/` → rouge confirmé sur les tests étendus (tuile/grille/page-client), puis verts après câblage de `useTasted()` dans les composants.
- `npm test -- --run` → 141/141 tests passing (21 nouveaux : 11 `lib/tasted/cache`, 8 `lib/tasted/index`, +6 `catalogue-tile`, +2 `catalogue-grid`, +4 `catalogue-page-client`), aucune régression.
- `npm run lint` → 0 erreur, 1 avertissement inchangé (`@next/next/no-img-element` sur `catalogue-tile.tsx`, déjà accepté en Story 1.4).
- `npm run build` → succès, `/` toujours prérendu statiquement (`○ (Static)`). `useTasted()` suit le même lazy-initializer + try/catch défensif que `useCatalogue()` : `localStorage` indisponible pendant l'export Node se dégrade silencieusement en map vide, sans crash de build.

### Completion Notes List

- Créé `lib/tasted/cache.ts` (remplace le stub Story 1.1) : `TASTED_STORAGE_KEY = "crounch:tasted"`, `readTastedState()` (dégradation silencieuse vers `{}` sur tout échec, comme `readCache()` Story 1.3), et la fonction canonique `setTasted(id, next)` (AC #3, AD-8) qui relit systématiquement le stockage juste avant d'écrire — jamais un read-modify-write basé sur un paramètre d'état passé par l'appelant. Persistance en map sparse : une Saveur décochée est supprimée de la map plutôt que stockée à `false`.
- Créé `lib/tasted/index.ts` (remplace le stub Story 1.1) : `useTasted()` expose `{ tastedIds: ReadonlySet<string>, tastedCount, isTasted, toggleTasted, setTasted }`. Hydratation en lazy initializer (compatible `output: "export"`), toute mutation délègue à la fonction canonique de `cache.ts`.
- `components/catalogue/catalogue-tile.tsx` : transformé en composant présentational interactif — la tuile entière est un `<button aria-pressed>` (pas de bouton imbriqué), affiche le badge "Goûtée" (`bg-success`/`text-success-foreground`) en plus du badge "Archivée" existant sans conflit visuel, fond de tuile toujours neutre (jamais de remplissage plein vert). N'importe jamais `lib/tasted/` directement (reçoit `isTasted`/`onToggle` en props).
- `components/catalogue/catalogue-grid.tsx` : étendu avec `tastedIds`/`onToggleFlavor`, relayés tels quels vers chaque tuile ; reste un composant de projection pure, sans accès au stockage.
- `components/catalogue/catalogue-page-client.tsx` : compose désormais `useCatalogue()` (Story 1.3) et `useTasted()` (Story 1.5). Ajoute le header de progression `"X/N saveurs goûtées"` (jointure par `flavor.id`, jamais un compteur déconnecté du Catalogue courant) et une région `aria-live="polite"` (visuellement masquée via `sr-only`) annonçant `"{Nom}, goûtée"` / `"{Nom}, pas goûtée"` après chaque toggle.
- `app/globals.css` : ajout du token `--success-foreground` (et son mapping `--color-success-foreground`) manquant depuis Story 1.4, nécessaire pour un contraste correct du texte du badge "Goûtée" sur fond `--success`.
- Aucune nouvelle dépendance ajoutée — réutilisation de React state/hooks, Tailwind v4, et des primitives Testing Library déjà présentes.
- Aucune régression introduite sur les points différés en Story 1.4 (pas de busy-state "Réessayer", pas d'état vide spéculatif) ; `lib/catalogue/` reste inchangé.

### File List

- `lib/tasted/cache.ts` — nouveau (remplace le stub), lecture/écriture canonique de l'État de dégustation.
- `lib/tasted/cache.test.ts` — nouveau, 11 tests.
- `lib/tasted/index.ts` — nouveau (remplace le stub), `useTasted()`.
- `lib/tasted/index.test.tsx` — nouveau, 8 tests.
- `components/catalogue/catalogue-tile.tsx` — étendu : toggle interactif (`isTasted`/`onToggle`), badge "Goûtée".
- `components/catalogue/catalogue-tile.test.tsx` — étendu, 6 nouveaux tests.
- `components/catalogue/catalogue-grid.tsx` — étendu : props `tastedIds`/`onToggleFlavor`.
- `components/catalogue/catalogue-grid.test.tsx` — étendu, 2 nouveaux tests.
- `components/catalogue/catalogue-page-client.tsx` — étendu : composition `useTasted()`, compteur de progression, annonce lecteur d'écran.
- `components/catalogue/catalogue-page-client.test.tsx` — étendu, 4 nouveaux tests.
- `app/page.test.tsx` — mis à jour : mock de `useTasted` ajouté (le composant sous test en dépend désormais).
- `app/globals.css` — ajout du token `--success-foreground`.

## Change Log

- 2026-08-01 : Story context créée pour la Story 1.5 (“Marquer une Saveur comme goûtée et persister l'état”). Analyse croisée epics / architecture / UX / PRD / SPEC / stories 1.3-1.4 / code actuel terminée ; guide développeur complet produit ; Status → `ready-for-dev`.
- 2026-08-01 : Implémentation de `lib/tasted/` (persistance canonique + `useTasted()`), câblage du toggle goûtée/pas goûtée et du compteur de progression dans `components/catalogue/`. 21 nouveaux tests, 141/141 au total, `build`/`lint` propres. Status → `review`.
