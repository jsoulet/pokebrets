---
epic_num: 1
story_num: 3
story_key: 1-3-chargement-du-catalogue-avec-cache-local-et-degradation-reseau
inputDocuments:
  - '_bmad-output/planning-artifacts/epics.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md'
  - '_bmad-output/planning-artifacts/prds/prd-brets-chips-checker-2026-07-29/prd.md'
  - '_bmad-output/specs/spec-crounch/SPEC.md'
---

# Story 1.3: Chargement du Catalogue avec cache local et dégradation réseau

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a utilisateur (Johan),
I want que l'app récupère le Catalogue à jour depuis un JSON hébergé sur GitHub à chaque ouverture, avec repli sur le cache local si le réseau échoue,
so that je puisse toujours voir un catalogue (même périmé) plutôt qu'un écran cassé, y compris en rayon avec une connexion capricieuse.

## Acceptance Criteria

1. **Given** un cache local existant du Catalogue, **when** l'app s'ouvre, **then** le cache est affiché immédiatement (état `data` non vide dès le premier rendu), puis un fetch réseau se déclenche en arrière-plan et remplace les données dès réponse valide (stale-while-revalidate, AD-2).
2. **Given** aucun cache local et un fetch réseau qui échoue (réseau, non-2xx, ou JSON invalide contre `lib/schema`), **when** l'app s'ouvre, **then** un état d'erreur explicite est exposé ("Impossible de charger le catalogue, vérifie ta connexion") avec une action "Réessayer" — jamais un catalogue vide silencieux (AD-3, FR1).
3. **Given** un cache local existant, **when** le fetch de revalidation en arrière-plan échoue (réseau, non-2xx, ou JSON invalide), **then** le cache existant reste affiché intact — aucune erreur ne remplace des données déjà valides (AD-3, dernière phrase).
4. **Given** deux réponses réseau concurrentes, **when** une réponse plus ancienne arrive après une plus récente, **then** la réponse la plus ancienne est ignorée (comparaison par révision `generatedAt` monotone, AD-2) — la donnée affichée ne recule jamais en fraîcheur.
5. **And** `catalogue.json` est fetché à l'exécution depuis `data/catalogue.json` du repo via `raw.githubusercontent.com` — jamais importé/bundlé depuis `public/` ou via un `import` statique (AD-2).
6. **And** toute lecture/écriture du cache local passe exclusivement par `lib/catalogue/` — c'est le seul propriétaire de la fraîcheur du Catalogue dans l'app (AD-2).
7. **And** le module qui touche `localStorage`/`window` est un Client Component explicite (`'use client'`), jamais évalué pendant le prerender statique (AD-4).

## Tasks / Subtasks

- [ ] Task 1: Définir l'API publique de `lib/catalogue/` (AC: #1, #2, #6, #7)
  - [ ] Subtask 1.1: Remplacer le stub `lib/catalogue/index.ts` (story 1.1, `export {}`) par un module `'use client'` exposant un hook `useCatalogue()` — c'est la seule porte d'entrée pour l'app (AC #6), aucun autre module ne doit lire `localStorage` ou fetcher `catalogue.json` directement.
  - [ ] Subtask 1.2: Définir le type de retour du hook : `{ data: Catalogue | null; status: "loading" | "ready" | "error"; error: string | null; retry: () => void }`. `status` distingue explicitement "chargement initial sans aucune donnée" (`loading`) de "des données sont affichées, qu'elles soient fraîches ou en cours de revalidation" (`ready`) — le composant appelant (story 1.4) n'a jamais besoin d'inspecter `data` pour savoir quoi afficher.
  - [ ] Subtask 1.3: Documenter en commentaire que `lib/catalogue/` est le seul propriétaire de la fraîcheur (AD-2) — aucune autre partie de l'app ne doit dupliquer la logique de comparaison de révision ou l'accès au cache.
- [ ] Task 2: Implémenter le cache local (lecture/écriture) (AC: #1, #6, #7)
  - [ ] Subtask 2.1: Créer une fonction interne `readCache(): Catalogue | null` qui lit une clé `localStorage` dédiée (ex: `"crounch:catalogue"`), parse le JSON stocké via `parseCatalogue` (`lib/schema`), et retourne `null` si absent, illisible, ou invalide contre le schéma (jamais de throw — un cache corrompu est traité comme "pas de cache", pas comme un crash).
  - [ ] Subtask 2.2: Créer une fonction interne `writeCache(catalogue: Catalogue): void` qui sérialise et écrit dans la même clé — appelée uniquement après validation réussie d'une réponse réseau (jamais un payload non validé n'atteint le cache).
  - [ ] Subtask 2.3: Encapsuler tout accès `localStorage` dans un try/catch (Safari mode privé, quota dépassé, etc.) — un échec d'écriture cache ne doit jamais faire planter le hook, seulement dégrader silencieusement vers "pas de persistance cette session".
- [ ] Task 3: Implémenter le fetch réseau et la validation (AC: #2, #3, #5, #7)
  - [ ] Subtask 3.1: Définir la constante `CATALOGUE_URL` pointant vers `https://raw.githubusercontent.com/jsoulet/pokebrets/main/data/catalogue.json` (repo GitHub du projet, cf. Dev Notes) — jamais un chemin `public/` ni un `import` statique du JSON.
  - [ ] Subtask 3.2: Implémenter `fetchCatalogue(): Promise<ParseResult<Catalogue>>` qui fetch l'URL, traite une réponse non-2xx comme un échec (jamais de throw non catché), parse le corps JSON (un JSON malformé est aussi un échec, pas une exception qui remonte), puis valide via `parseCatalogue` (`lib/schema`) — les 3 causes d'échec (réseau, non-2xx, JSON hors schéma) sont unifiées dans le même résultat `{ success: false }` (AD-3).
  - [ ] Subtask 3.3: Ne jamais laisser une exception réseau (ex: `fetch` qui rejette) remonter non catchée — encapsuler dans un try/catch et convertir en `{ success: false, error: [...] }`.
- [ ] Task 4: Orchestrer stale-while-revalidate et la dégradation (AC: #1, #2, #3, #4)
  - [ ] Subtask 4.1: Au montage du hook : lire le cache (Task 2). S'il existe, définir immédiatement `status: "ready"` avec les données du cache, puis déclencher le fetch réseau (Task 3) en arrière-plan.
  - [ ] Subtask 4.2: Si aucun cache n'existe au montage : définir `status: "loading"`, attendre la réponse du fetch avant d'afficher quoi que ce soit.
  - [ ] Subtask 4.3: À la réception d'une réponse réseau réussie : comparer `response.generatedAt` à la révision actuellement détenue (celle du cache ou d'une réponse précédente déjà appliquée) — n'appliquer la nouvelle réponse (mise à jour de l'état + `writeCache`) QUE si sa révision est plus récente ou qu'aucune révision n'est encore détenue (AC #4). Une réponse plus ancienne est silencieusement ignorée (ni erreur, ni écrasement).
  - [ ] Subtask 4.4: À la réception d'un échec réseau (Task 3) : si un cache/donnée existait déjà (`status` était `ready`), ne rien changer — le cache reste affiché intact, l'échec de revalidation est silencieux pour l'utilisateur (AC #3). Si aucune donnée n'existait (`status` était `loading`), passer à `status: "error"` avec un message exploitable ("Impossible de charger le catalogue, vérifie ta connexion") (AC #2).
  - [ ] Subtask 4.5: Implémenter `retry()` : ré-invoque le fetch réseau (Task 3) en respectant la même logique de comparaison de révision (Subtask 4.3/4.4) — ne réinitialise jamais `status` à `loading` s'il y a déjà des données affichées (un retry en présence de cache reste une revalidation en arrière-plan, pas un nouvel écran de chargement).
- [ ] Task 5: Tests unitaires exhaustifs (AC: #1, #2, #3, #4, #5, #6, #7)
  - [ ] Subtask 5.1: Mocker `global.fetch` et `localStorage` (déjà disponible via l'environnement `jsdom` de Vitest) pour chaque scénario ci-dessous — aucun test ne doit effectuer de vrai appel réseau.
  - [ ] Subtask 5.2: Cache existant + fetch réussi avec révision plus récente → données affichées immédiatement depuis le cache (`status: "ready"` dès le premier rendu), puis remplacées par la réponse réseau, cache mis à jour.
  - [ ] Subtask 5.3: Aucun cache + fetch réussi → `status` passe de `"loading"` à `"ready"`, cache écrit.
  - [ ] Subtask 5.4: Aucun cache + fetch échoué (réseau, non-2xx, et JSON invalide — les 3 cas testés séparément) → `status: "error"` avec message exploitable, jamais de throw non catché.
  - [ ] Subtask 5.5: Cache existant + fetch de revalidation échoué (réseau, non-2xx, et JSON invalide) → cache existant conservé intact, `status` reste `"ready"`, aucune erreur exposée à l'utilisateur.
  - [ ] Subtask 5.6: Deux réponses réseau concurrentes, la plus ancienne arrivant après la plus récente (par `generatedAt`) → seule la plus récente est retenue dans l'état final et dans le cache.
  - [ ] Subtask 5.7: Cache local corrompu (JSON invalide ou ne validant pas contre `lib/schema` stocké dans `localStorage`) → traité comme "pas de cache" (`status: "loading"` puis dépend du fetch), jamais de crash au montage.
  - [ ] Subtask 5.8: `retry()` après un état d'erreur → relance le fetch et peut aboutir à `status: "ready"` si le réseau revient.
  - [ ] Subtask 5.9: Exécuter `npm test` : tous les tests passent, aucune régression sur les suites existantes (`lib/schema/*`, `app/page.test.tsx`).
  - [ ] Subtask 5.10: Exécuter `npm run build && npm run lint` : aucune erreur — vérifier que `lib/catalogue/index.ts` porte bien `'use client'` et n'est référencé par aucun Server Component (aucun composant ne le consomme encore, cette story reste dans `lib/catalogue/` — l'intégration dans `app/page.tsx` est la story 1.4).

## Dev Notes

- **Portée stricte de cette story** : uniquement `lib/catalogue/` (hook + logique de fetch/cache/fraîcheur). Aucune UI, aucun composant de grille, aucun câblage dans `app/page.tsx` — ces responsabilités arrivent en story 1.4 (Affichage du Catalogue en grille visuelle), qui consommera `useCatalogue()` tel quel. Ne pas anticiper l'implémentation de la grille ici.
- **AD-2 (stale-while-revalidate, fraîcheur à source unique)** est l'ancre de cette story : si un cache existe, l'afficher immédiatement puis revalider en arrière-plan ; sinon attendre la réponse réseau. `lib/catalogue/` est le **seul propriétaire** de la fraîcheur — le service worker (Serwist, pas encore configuré à ce stade du projet) devra explicitement exclure l'URL du Catalogue de son precache/runtime-cache quand il sera introduit, mais cette story ne dépend pas de Serwist. [Source: ARCHITECTURE-SPINE.md#AD-2]
- **AD-3 (dégradation au premier lancement et sur réponse invalide)** : un fetch est un échec dans 3 cas équivalents — erreur réseau, réponse non-2xx, JSON hors schéma (`lib/schema/`). Si cet échec survient sans cache local, état d'erreur explicite avec réessai, jamais un vide silencieux. Un échec de revalidation en arrière-plan (cache existant) laisse le cache intact. [Source: ARCHITECTURE-SPINE.md#AD-3]
- **AD-4 (aucun code serveur, frontière Client Component explicite)** : `lib/catalogue/index.ts` touche `localStorage` → doit porter `'use client'` explicitement, jamais évalué pendant le prerender statique (`output: 'export'`). [Source: ARCHITECTURE-SPINE.md#AD-4]
- **AD-7 (schéma partagé)** : toute réponse réseau et tout contenu de cache doivent être validés via `parseCatalogue` de `lib/schema/` (story 1.2, déjà livrée) — jamais une forme de données maison redéfinie ici. [Source: ARCHITECTURE-SPINE.md#AD-7]
- **⚠️ Dépendance externe non encore livrée — `data/catalogue.json` n'existe pas encore dans le repo.** Le scraper qui le génère est la story 1.9 (FR-5, hors scope de l'epic 1 dans cet ordre de sprint). Tant que ce fichier n'est pas committé sur la branche `main` de `jsoulet/pokebrets`, tout fetch réel vers `CATALOGUE_URL` renverra un 404 — ce qui est un cas déjà couvert par cette story (réponse non-2xx → `status: "error"` en l'absence de cache, AC #2). Ce n'est donc PAS un blocage pour terminer cette story : la logique doit être correcte et testée avec des mocks (Task 5), et le comportement réel en production (écran d'erreur explicite jusqu'à ce que 1.9 livre le JSON) est la dégradation *prévue* par AD-3, pas un bug. Voir question ouverte en fin de story pour la décision sur un éventuel fixture temporaire.
- **Pas de librairie de state management** : le projet n'a ni Zustand/Redux ni SWR/React Query installés (cf. `package.json`) — le hook `useCatalogue()` doit être implémenté avec les primitives React (`useState`/`useEffect`/`useRef` pour suivre la dernière révision connue), cohérent avec le choix architectural "aucune dépendance superflue" déjà appliqué en story 1.1/1.2. Ne pas introduire de nouvelle dépendance sans validation utilisateur.
- **Nom de la clé localStorage** : utiliser un préfixe de namespace (`"crounch:catalogue"`) pour éviter toute collision future avec la clé de l'État de dégustation (`lib/tasted/`, story 1.5, qui utilisera vraisemblablement `"crounch:tasted"`).

### Project Structure Notes

- Fichier à remplacer : `lib/catalogue/index.ts` (actuellement un stub `export {}` créé en story 1.1) — devient le point d'entrée public du module (`useCatalogue`), en Client Component.
- Fichier de test à créer : `lib/catalogue/index.test.ts`, co-localisé, suivant le pattern déjà établi par `lib/schema/*.test.ts` (story 1.2).
- Fonctions internes (`readCache`, `writeCache`, `fetchCatalogue`) peuvent rester non exportées dans le même fichier, ou être scindées en fichiers internes (`lib/catalogue/cache.ts`, `lib/catalogue/fetch.ts`) si la lisibilité le justifie — dans ce cas, `lib/catalogue/index.ts` reste le seul point d'entrée public (ré-export du hook uniquement), cohérent avec le pattern déjà utilisé par `lib/schema/index.ts`.
- Aucune modification de `app/`, `components/`, `netlify.toml`, ou de la config CI.
- Aucun nouveau dossier à la racine : tout reste sous `lib/catalogue/`, conforme au Structural Seed de l'ARCHITECTURE-SPINE (`FR-1 Chargement du Catalogue | lib/catalogue/, data/catalogue.json | AD-2, AD-3, AD-4, AD-7`).

### Testing Requirements

- Framework : Vitest + `@testing-library/react` (déjà configurés, environnement `jsdom` avec `localStorage` natif) — pas de nouvelle configuration nécessaire.
- Tester le hook via `@testing-library/react`'s `renderHook` (ou un composant de test minimal) — jamais uniquement les fonctions internes en isolation, pour garantir que le comportement observable (`status`, `data`, `error`) est correct de bout en bout.
- Mocker `global.fetch` (`vi.stubGlobal("fetch", ...)` ou équivalent) pour chaque scénario réseau — jamais de vrai appel réseau dans les tests.
- Couvrir tous les scénarios listés en Task 5.2 à 5.8 avant de considérer la story testée.
- Validation finale : `npm run build && npm test && npm run lint` doivent tous passer sans erreur avant de marquer la story `review`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3] — user story et acceptance criteria d'origine
- [Source: _bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-2] — stale-while-revalidate, fraîcheur à source unique
- [Source: _bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-3] — dégradation au premier lancement et sur réponse invalide
- [Source: _bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-4] — aucun code serveur, Client Component explicite
- [Source: _bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-7] — schéma partagé et versionné
- [Source: _bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#Deferred] — rate limit `raw.githubusercontent.com` (~60 req/h/IP non-authentifié), piège Serwist + `output: 'export'` : hors scope de cette story, notés pour mémoire future
- [Source: _bmad-output/specs/spec-crounch/SPEC.md] — vision produit, FR1 (chargement du Catalogue depuis JSON hébergé sur GitHub)

## Previous Story Intelligence

- Story 1.2 a livré `lib/schema/` complet : `flavorSchema`, `catalogueSchema` (avec `.min(1)` sur `flavors`, rejet des `id` dupliqués, `.strict()`), `tastedStateSchema`, et l'API `parseFlavor`/`parseCatalogue`/`parseTastedState` (jamais de throw, retour `{ success, data | error }` avec messages préfixés par le path Zod). Cette story consomme directement `parseCatalogue` — ne pas redéfinir de validation ad hoc.
- Pattern de test établi : Vitest, fichiers `*.test.ts(x)` co-localisés, TDD red-green (voir stories 1.1/1.2). `npm test` = `vitest run`.
- La revue de code de la story 1.2 a renforcé plusieurs invariants à respecter ici : jamais de validation "maison" en dehors de `lib/schema/`, toujours distinguer explicitement succès/échec sans exception qui remonte.
- Aucune route API ni Server Action n'existe (AD-4 vérifié) — cette story doit maintenir cet invariant : `lib/catalogue/index.ts` est un Client Component, pas un module serveur.
- `data/catalogue.json` n'existe pas encore dans le repo (la story 1.9/scraper n'a pas été implémentée) — voir Dev Notes ci-dessus pour la gestion de cette dépendance externe non bloquante.

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

## Change Log
