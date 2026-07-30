---
epic_num: 1
story_num: 2
story_key: 1-2-schema-partage-du-catalogue-et-de-l-etat-de-degustation
inputDocuments:
  - '_bmad-output/planning-artifacts/epics.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md'
  - '_bmad-output/planning-artifacts/prds/prd-brets-chips-checker-2026-07-29/prd.md'
  - '_bmad-output/specs/spec-crounch/SPEC.md'
baseline_commit: 6c4e501
---

# Story 1.2: Schéma partagé du Catalogue et de l'État de dégustation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a mainteneur (Johan),
I want un module `lib/schema/` définissant les types et la validation runtime d'une Saveur, du Catalogue et de l'État de dégustation,
so that l'app et l'outil de scraping ne puissent jamais diverger silencieusement sur la forme des données (AD-7).

## Acceptance Criteria

1. **Given** le module `lib/schema/`, **when** un objet JSON conforme (Saveur avec `id`/`name`/`image`/`status`) lui est soumis, **then** la validation réussit et retourne un objet typé.
2. **Given** le même module, **when** un objet JSON non conforme (champ manquant, `status` hors de `active`/`archived`, etc.) lui est soumis, **then** la validation échoue explicitement (erreur exploitable — liste des problèmes de validation — jamais un plantage silencieux ni une exception non gérée).
3. **And** le schéma définit l'identifiant de Saveur comme un slug stable (kebab-case), jamais dérivé automatiquement du nom d'affichage (AD-1) — le schéma valide le *format* du slug mais ne le génère jamais depuis `name`.
4. **And** le schéma du Catalogue porte un marqueur de révision monotone `generatedAt` (AD-2) que `lib/catalogue/` (story 1.3) utilisera pour rejeter les réponses obsolètes.
5. **And** le schéma de l'État de dégustation est une **map** (id de Saveur → booléen goûté/pas goûté), jamais un tableau — c'est la forme normative citée par AD-7 pour éviter toute divergence app/scraper.
6. **And** le scraper (story 1.9, hors scope ici) et l'app (stories 1.3/1.5, hors scope ici) devront tous deux passer par ce même module — aucun des deux ne doit redéfinir sa propre forme de données.

## Tasks / Subtasks

- [x] Task 1: Choisir et installer la librairie de validation runtime (AC: #1, #2)
  - [x] Subtask 1.1: Installer `zod` (v4, `npm install zod@latest`) — choix standard TypeScript-first pour la validation runtime + inférence de types, cohérent avec AD-4 (aucune dépendance serveur, fonctionne en Client Component et en script Node CLI)
  - [x] Subtask 1.2: Vérifier que `zod` n'introduit aucune dépendance incompatible avec `output: 'export'` (pas d'API Node-only utilisée côté app)
- [x] Task 2: Définir le schéma Saveur (Flavor) (AC: #1, #2, #3)
  - [x] Subtask 2.1: Créer `lib/schema/flavor.ts` avec un schéma Zod `flavorSchema` : `id` (string, regex kebab-case `^[a-z0-9]+(-[a-z0-9]+)*$`), `name` (string non vide), `image` (string, URL ou chemin non vide), `status` (enum `"active" | "archived"`)
  - [x] Subtask 2.2: Exporter le type TypeScript inféré `Flavor` via `z.infer<typeof flavorSchema>` — ne jamais dupliquer la définition du type à la main
  - [x] Subtask 2.3: Ne fournir aucune fonction de génération de slug depuis `name` dans ce module (AD-1) — seulement la validation du format ; documenter ce choix dans un commentaire
- [x] Task 3: Définir le schéma Catalogue (AC: #1, #2, #4)
  - [x] Subtask 3.1: Créer `lib/schema/catalogue.ts` avec un schéma Zod `catalogueSchema` : `generatedAt` (string ISO 8601 datetime), `flavors` (array de `flavorSchema`)
  - [x] Subtask 3.2: Exporter le type `Catalogue` inféré
  - [x] Subtask 3.3: Ajouter un test unitaire vérifiant qu'un Catalogue avec deux `flavors` valides + `generatedAt` ISO valide passe la validation
- [x] Task 4: Définir le schéma État de dégustation (Tasted State) (AC: #1, #2, #5)
  - [x] Subtask 4.1: Créer `lib/schema/tasted.ts` avec un schéma Zod `tastedStateSchema` : `z.record(z.string(), z.boolean())` — map id de Saveur → booléen, jamais un tableau (AD-7)
  - [x] Subtask 4.2: Exporter le type `TastedState` inféré
- [x] Task 5: Exposer une API de validation exploitable (pas de plantage silencieux) (AC: #1, #2)
  - [x] Subtask 5.1: Créer `lib/schema/index.ts` (remplace le stub de la story 1.1) qui ré-exporte les schémas/types des 3 modules et expose des fonctions `parseFlavor`, `parseCatalogue`, `parseTastedState` basées sur `schema.safeParse(...)` — jamais `schema.parse(...)` qui lève une exception non gérée
  - [x] Subtask 5.2: Chaque fonction `parseX` retourne une union discriminée exploitable par l'appelant : `{ success: true; data: X } | { success: false; error: string[] }` (le tableau `error` contient les messages Zod formatés, pas l'objet `ZodError` brut) — cf. AD-3 qui consommera ce résultat en story 1.3 pour distinguer succès/échec sans exception
- [x] Task 6: Tests unitaires exhaustifs (AC: #1, #2, #3, #5)
  - [x] Subtask 6.1: Cas valides : Saveur conforme, Catalogue conforme (plusieurs saveurs, `active` et `archived`), État de dégustation conforme (map vide, map avec plusieurs entrées)
  - [x] Subtask 6.2: Cas invalides : champ manquant sur une Saveur, `status` hors énum, `id` qui ne respecte pas le format kebab-case (majuscules, espaces, underscore), `generatedAt` non-ISO, `flavors` non-array, État de dégustation avec une valeur non-booléenne — vérifier que `success: false` est retourné avec un message exploitable (jamais une exception qui remonte)
  - [x] Subtask 6.3: Exécuter `npm test` : tous les tests passent, aucune régression sur le smoke test existant (`app/page.test.tsx`)
  - [x] Subtask 6.4: Exécuter `npm run build && npm run lint` : aucune erreur (aucune route `app/api/` ni Server Action introduite — le module reste pur, sans `'use client'` nécessaire puisqu'il ne touche ni `localStorage` ni `window`, AD-4)

### Review Findings

Toutes les remarques ci-dessous ont été résolues et corrigées dans ce cycle de revue (voir Change Log ci-dessous pour le détail).

- [x] [Review][Decision] Un Catalogue avec `flavors: []` doit-il rester valide ? — **Résolu** : rejeté. `catalogueSchema.flavors` impose désormais `.min(1)` : un catalogue vide est indistinguable d'une panne de scraping, il ne doit donc jamais être considéré valide. [lib/schema/catalogue.ts]
- [x] [Review][Decision] Quel format exact accepter pour `image` ? — **Résolu** : `image` doit être une URL absolue `http(s)://` OU un chemin commençant par `/`, ce qui exclut de fait les schémas dangereux (`javascript:`, `data:`, etc.). [lib/schema/flavor.ts]
- [x] [Review][Patch] `catalogueSchema` n'empêche pas deux Saveurs de partager le même `id` — **Corrigé** via `.superRefine()` qui détecte et rejette les `id` dupliqués. [lib/schema/catalogue.ts]
- [x] [Review][Patch] `flavorSchema` et `catalogueSchema` utilisent `z.object(...)` simple, qui supprime silencieusement les champs inconnus — **Corrigé** : les deux schémas utilisent désormais `.strict()`. [lib/schema/flavor.ts, lib/schema/catalogue.ts]
- [x] [Review][Patch] `tastedStateSchema` valide les clés de la map avec `z.string()` au lieu du même format kebab-case que `Flavor.id` — **Corrigé** : les clés réutilisent désormais `flavorIdSchema` (exporté). Zod protège nativement contre la propagation d'une clé `__proto__` dans les données parsées (vérifié par test). [lib/schema/tasted.ts]
- [x] [Review][Patch] `flavorSchema.name` utilise `z.string().min(1)`, qui accepte une chaîne composée uniquement d'espaces — **Corrigé** : `z.string().trim().min(1)`. [lib/schema/flavor.ts]
- [x] [Review][Patch] Les fonctions `parseFlavor`/`parseCatalogue`/`parseTastedState` ne conservent que `issue.message` et perdent `issue.path` — **Corrigé** : chaque message est désormais préfixé par le chemin joint (`"flavors.0.id: ..."`). [lib/schema/index.ts]
- [x] [Review][Patch] `flavorIdSchema` (la regex kebab-case) reste privée dans `lib/schema/flavor.ts` — **Corrigé** : exportée pour réutilisation (déjà utilisée par `tastedStateSchema`). [lib/schema/flavor.ts]

Note (bruit, non retenu) : `generatedAt: z.iso.datetime()` n'accepte que le suffixe `Z`, pas les formats ISO 8601 avec offset — comportement voulu, le générateur (`new Date().toISOString()`) produit toujours ce suffixe.

## Dev Notes

- **Portée stricte de cette story** : uniquement `lib/schema/` (types + validation). Aucune UI, aucun fetch réseau, aucune lecture/écriture `localStorage` — ces responsabilités arrivent dans les stories 1.3 (Catalogue), 1.4 (grille), 1.5 (État de dégustation persistant) et 1.9 (scraper). Ne pas anticiper leur implémentation ici au-delà de la forme des données.
- **AD-7 (Schéma partagé et versionné)** est l'ancre de cette story : un unique module `lib/schema/` définit la forme de données pour tout le projet — l'app ET le futur scraper (story 1.9) devront importer ces mêmes types/schémas, jamais redéfinir leur propre forme. [Source: ARCHITECTURE-SPINE.md#AD-7]
- **AD-1 (Frontière Catalogue ⇄ État de dégustation)** impose que l'identifiant de Saveur soit un slug stable, minté une seule fois par le scraper, jamais re-dérivé du nom après un renommage — c'est pourquoi ce schéma valide uniquement le *format* du slug (regex kebab-case) et ne fournit aucune fonction de génération de slug depuis `name`. [Source: ARCHITECTURE-SPINE.md#AD-1]
- **AD-2 (stale-while-revalidate)** — le champ `generatedAt` du Catalogue est le marqueur de révision monotone que `lib/catalogue/` (story 1.3) comparera pour rejeter toute réponse réseau plus ancienne que le cache actuel. Cette story se contente de le typer/valider (string ISO 8601) — la logique de comparaison de fraîcheur n'est PAS dans le scope de 1.2. [Source: ARCHITECTURE-SPINE.md#AD-2]
- **AD-3 (dégradation au premier lancement)** — un fetch est considéré en échec dans 3 cas équivalents : erreur réseau, réponse non-2xx, OU JSON qui ne valide pas contre ce schéma. Cette story doit donc garantir que la validation échoue *explicitement* (résultat structuré, jamais une exception qui remonte non catchée) pour que `lib/catalogue/` puisse traiter les 3 cas de façon uniforme. [Source: ARCHITECTURE-SPINE.md#AD-3]
- **Forme normative de l'État de dégustation : map, pas tableau.** AD-7 cite explicitement "État de dégustation en tableau vs map" comme exemple de divergence silencieuse à éviter — le choix normatif pour ce projet est **map** (`Record<string, boolean>`), car la jointure se fait par identifiant de Saveur (AD-1), et une map permet un lookup O(1) par id sans scan linéaire lors du toggle (story 1.5). [Source: ARCHITECTURE-SPINE.md#AD-7]
- **Choix de librairie : Zod v4** (`zod@latest`, actuellement 4.4.x). Standard de facto en écosystème TypeScript/Next.js pour la validation runtime avec inférence de types (`z.infer`), évite toute duplication type/validation. Aucune dépendance Node-only : fonctionne aussi bien dans un Client Component (app) que dans un script CLI Node.js (scraper, story 1.9), ce qui satisfait AD-6 (un seul écosystème, mêmes outils app/scraper).
- **Pas de `'use client'` nécessaire.** Ce module ne touche ni `localStorage` ni `window` — il est pur (types + fonctions de validation). Reste évaluable pendant le prerender statique sans violer AD-4.
- **Continuité avec la story 1.1** : les dossiers `lib/schema/`, `lib/catalogue/`, `lib/tasted/` existent déjà (stubs `index.ts` avec `export {}`) — cette story remplace uniquement le stub de `lib/schema/index.ts`, ne touche pas aux deux autres modules (stubs de `lib/catalogue/` et `lib/tasted/` restent inchangés, implémentés dans leurs stories respectives 1.3 et 1.5).

### Project Structure Notes

- Fichiers à créer : `lib/schema/flavor.ts`, `lib/schema/catalogue.ts`, `lib/schema/tasted.ts`, et leurs fichiers de test co-localisés (`lib/schema/flavor.test.ts`, `lib/schema/catalogue.test.ts`, `lib/schema/tasted.test.ts`) suivant le pattern de test déjà établi en story 1.1 (Vitest + `vitest.config.ts` existant, pas de config supplémentaire nécessaire).
- Fichier à remplacer : `lib/schema/index.ts` (actuellement un stub `export {}` créé en story 1.1) — devient le point d'entrée public du module (ré-export des schémas/types + fonctions `parseX`).
- Aucun nouveau dossier à la racine : tout reste sous `lib/schema/`, conforme au Structural Seed de l'ARCHITECTURE-SPINE.
- Aucune modification de `app/`, `components/`, `netlify.toml`, ou de la config CI — cette story est un module pur sans impact sur le build/déploiement au-delà de l'ajout de la dépendance `zod`.

### Testing Requirements

- Framework : Vitest (déjà configuré en story 1.1, `vitest.config.ts` + `vitest.setup.ts` existants) — pas de nouvelle configuration nécessaire pour tester des modules purs sans DOM.
- Chaque schéma (`flavor`, `catalogue`, `tasted`) doit avoir au moins un test de cas valide ET un test par variante de cas invalide listée en Task 6.2.
- Les fonctions `parseX` doivent être testées directement (pas seulement les schémas Zod bruts) pour garantir que l'API exploitable (`{ success, data | error }`) fonctionne comme prévu par les stories consommatrices (1.3, 1.5, 1.9).
- Validation finale : `npm run build && npm test && npm run lint` doivent tous passer sans erreur avant de marquer la story `review`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2] — user story et acceptance criteria d'origine
- [Source: _bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-1] — frontière Catalogue ⇄ État de dégustation, slug stable
- [Source: _bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-2] — stale-while-revalidate, `generatedAt`
- [Source: _bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-3] — dégradation au premier lancement / réponse invalide
- [Source: _bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-4] — aucun code serveur, Client Component explicite
- [Source: _bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-7] — schéma partagé et versionné
- [Source: _bmad-output/specs/spec-crounch/SPEC.md] — vision produit et intents FR1-FR5

## Previous Story Intelligence

- Story 1.1 a établi le scaffold Next.js 16 (App Router, `output: 'export'`), shadcn/ui, et les dossiers stub `lib/schema/`, `lib/catalogue/`, `lib/tasted/` avec `export {}`.
- Pattern de test établi : Vitest + React Testing Library, fichiers `*.test.ts(x)` co-localisés avec le code testé, script `npm test` = `vitest run`.
- La revue de code de la story 1.1 (adversariale + edge-case + acceptance) a corrigé : script `start` incompatible avec l'export statique, variable CSS de police auto-référentielle, absence de `lint` en CI, version Node non épinglée sur Netlify. CI exécute désormais `npm ci && npm run lint && npm run build && npm test` — cette story doit rester compatible avec ce pipeline (le `lint` doit passer sur le nouveau code).
- Aucune route API ni Server Action n'existe (AD-4 vérifié) — cette story doit maintenir cet invariant.

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (GitHub Copilot CLI)

### Debug Log References

- `npx vitest run lib/schema/flavor.test.ts` → red (module inexistant) puis green (8/8) après implémentation de `flavor.ts`
- `npx vitest run lib/schema/catalogue.test.ts` → red puis green (6/6) après implémentation de `catalogue.ts`
- `npx vitest run lib/schema/tasted.test.ts` → red puis green (5/5) après implémentation de `tasted.ts`
- `npx vitest run lib/schema/index.test.ts` → red puis green (6/6) après implémentation de `index.ts`
- `npm test` (suite complète) → 26/26 tests passent (25 nouveaux + smoke test existant `app/page.test.tsx`)
- `npm run build` → succès, export statique généré sans erreur
- `npm run lint` → aucune erreur

### Completion Notes List

- Librairie choisie : Zod v4.4.3 (`z.iso.datetime()` pour la validation ISO 8601 côté `generatedAt`, API v4).
- `lib/schema/flavor.ts` : `flavorSchema` avec `id` validé par regex kebab-case, `status` en enum `active`/`archived`. Aucune fonction de génération de slug fournie (AD-1) — commentaire explicite dans le code.
- `lib/schema/catalogue.ts` : `catalogueSchema` avec `generatedAt` (ISO datetime) + `flavors` (array de `flavorSchema`).
- `lib/schema/tasted.ts` : `tastedStateSchema` = `z.record(z.string(), z.boolean())` — map, jamais un tableau (AD-7 respecté).
- `lib/schema/index.ts` : remplace le stub de la story 1.1. Ré-exporte les 3 schémas/types et expose `parseFlavor`/`parseCatalogue`/`parseTastedState`, toutes basées sur `safeParse` — retournent `{ success, data | error }`, jamais d'exception (AD-3 respecté : la même distinction succès/échec pourra être réutilisée par `lib/catalogue/` en story 1.3).
- 25 tests unitaires ajoutés (8 flavor + 6 catalogue + 5 tasted + 6 index/parseX), couvrant tous les cas valides et invalides listés en Task 6. Suite complète : 26/26 tests passent (aucune régression sur le smoke test de la story 1.1).
- Vérifié : aucun `app/api/`, aucune directive `'use client'`/`'use server'` nécessaire dans `lib/schema/` (module pur, AD-4 respecté).
- `npm audit` signale 12 vulnérabilités "high" pré-existantes (transitives via `eslint-config-next`/`postcss`, non liées à `zod` ni à cette story) — hors scope, non traité.

### File List

- `lib/schema/flavor.ts` (créé)
- `lib/schema/flavor.test.ts` (créé)
- `lib/schema/catalogue.ts` (créé)
- `lib/schema/catalogue.test.ts` (créé)
- `lib/schema/tasted.ts` (créé)
- `lib/schema/tasted.test.ts` (créé)
- `lib/schema/index.ts` (remplacé — stub de la story 1.1 supprimé)
- `lib/schema/index.test.ts` (créé)
- `package.json` (modifié — ajout de la dépendance `zod`)
- `package-lock.json` (modifié — lockfile mis à jour)

## Change Log

- 2026-07-30 : Implémentation complète de la story 1.2 — schéma partagé Zod (Flavor, Catalogue, État de dégustation) + API `parseX` exploitable. 25 tests unitaires ajoutés, 26/26 passent, build/lint OK. Status → review.
- 2026-07-30 : Revue de code (adversariale + edge-case + acceptance) — 2 décisions et 6 patchs résolus : `catalogueSchema.flavors` impose `.min(1)` (rejette les catalogues vides) ; `image` restreint à URL http(s) ou chemin `/...` ; rejet des `id` dupliqués (`.superRefine`) ; `.strict()` sur `flavorSchema`/`catalogueSchema` ; clés de `tastedStateSchema` alignées sur `flavorIdSchema` (désormais exporté) ; `name` utilise `.trim().min(1)` ; messages d'erreur `parseX` préfixés par le chemin Zod. 9 tests unitaires ajoutés (35/35 passent), build/lint OK. Status → done.
