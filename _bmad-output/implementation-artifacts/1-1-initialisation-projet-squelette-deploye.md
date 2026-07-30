---
epic_num: 1
story_num: 1
story_key: 1-1-initialisation-projet-squelette-deploye
inputDocuments:
  - '_bmad-output/planning-artifacts/epics.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md'
  - '_bmad-output/planning-artifacts/prds/prd-brets-chips-checker-2026-07-29/prd.md'
baseline_commit: NO_VCS
---

# Story 1.1: Initialisation du projet et squelette déployé

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a mainteneur (Johan),
I want un projet Next.js 16 (App Router, export statique) avec shadcn/ui installé, structuré selon le spine d'architecture (monorepo, dossiers `app/`, `components/`, `lib/`, `scripts/`),
so that j'ai un squelette d'app vide mais réellement déployé sur Netlify, visitable dans un navigateur, avant d'ajouter la moindre fonctionnalité.

## Acceptance Criteria

1. **Given** un repo vide, **when** le projet est initialisé (Next.js 16.x, App Router, `output: 'export'`, shadcn/ui, structure de dossiers `app/`, `components/`, `lib/`, `scripts/`), **then** `next build` produit un export statique dans `out/`. [Source: ARCHITECTURE-SPINE.md#Stack, #Structural Seed]
2. **Given** le projet buildé, **when** il est déployé sur Netlify, **then** une page d'accueil (même minimale) est accessible via une URL publique Netlify. [Source: ARCHITECTURE-SPINE.md#Stack]
3. **And** aucune route API ni Server Action n'est présente dans le projet (AD-4). [Source: ARCHITECTURE-SPINE.md#AD-4]

## Tasks / Subtasks

- [x] Task 1: Scaffolder le projet Next.js 16 en App Router (AC: #1)
  - [x] Subtask 1.1: `npx create-next-app@latest` avec TypeScript + App Router + Tailwind CSS activés, pas de dossier `src/` (structure plate à la racine, alignée sur le Structural Seed)
  - [x] Subtask 1.2: Renommer/vérifier le `name` du `package.json` en `crounch`
  - [x] Subtask 1.3: Configurer `next.config.ts` (ou `.js`) avec `output: 'export'` — ne PAS utiliser l'ancienne commande `next export` (dépréciée)
  - [x] Subtask 1.4: Vérifier `npm run build` : le dossier `out/` est produit sans erreur, contient au moins `index.html`
- [x] Task 2: Installer et initialiser shadcn/ui (AC: #1)
  - [x] Subtask 2.1: `npx shadcn@latest init` (Tailwind déjà présent depuis Task 1) ; choisir une couleur de base neutre par défaut — le thème sera surchargé plus tard par les tokens `DESIGN.md` dans une story UI ultérieure (hors scope de 1.1)
  - [x] Subtask 2.2: Ajouter un composant shadcn de test (ex: `npx shadcn@latest add button`) uniquement pour valider que la CLI shadcn fonctionne dans ce projet — pas d'usage fonctionnel encore
- [x] Task 3: Créer la structure de dossiers du spine d'architecture (AC: #1, #3)
  - [x] Subtask 3.1: Créer `lib/schema/`, `lib/catalogue/`, `lib/tasted/` (dossiers vides avec un `.gitkeep` ou un fichier `index.ts` stub — le contenu réel arrive dans les stories 1.2/1.3/1.5)
  - [x] Subtask 3.2: Créer `scripts/` (ou `tools/`) à la racine pour l'outil de scraping (contenu réel en story 1.9) — monorepo unique, même repo que l'app (AD-6)
  - [x] Subtask 3.3: Créer `data/` à la racine du repo (HORS de `public/` et HORS de l'arbre buildé par Next.js) — ce dossier accueillera `catalogue.json` en story 1.9 ; ne rien y mettre dans cette story, juste créer le dossier
  - [x] Subtask 3.4: Vérifier qu'aucun dossier `app/api/` n'existe et qu'aucune Server Action n'est présente (AC: #3, AD-4)
- [x] Task 4: Page d'accueil minimale (AC: #1, #2)
  - [x] Subtask 4.1: Remplacer le contenu par défaut de `app/page.tsx` par une page minimale affichant au moins le nom "Crounch" (pas de logique métier — le Catalogue arrive en story 1.3/1.4)
  - [x] Subtask 4.2: Adapter `app/layout.tsx` (titre `<title>` = "Crounch", `lang="fr"`)
- [x] Task 5: Déployer sur Netlify (AC: #2)
  - [x] Subtask 5.1: Créer/connecter un site Netlify au repo ; configurer la commande de build (`npm run build`) et le dossier de publication (`out/`)
  - [x] Subtask 5.2: Déclencher un déploiement et vérifier que l'URL Netlify publique affiche la page d'accueil minimale
  - [x] Subtask 5.3: Documenter l'URL Netlify obtenue dans le README ou dans Completion Notes (pas de secret/credential à committer)
- [x] Task 6: Tests et validations (AC: #1, #2, #3)
  - [x] Subtask 6.1: Ajouter un test (smoke test) qui vérifie que `app/page.tsx` rend sans erreur (ex: Vitest + React Testing Library, ou le framework de test que le projet choisit à l'initialisation — documenter le choix dans Dev Agent Record)
  - [x] Subtask 6.2: Ajouter un script CI minimal ou une commande documentée qui exécute `npm run build && npm test` pour valider le pipeline avant tout déploiement futur
  - [x] Subtask 6.3: Confirmer manuellement (ou via test statique) qu'aucun fichier sous `app/api/` n'existe et qu'aucun import serveur n'est présent

### Review Findings

- [x] [Review][Patch] `package.json` `start` script (`next start`) est incompatible avec `output: 'export'` — ne servira jamais le dossier `out/` [package.json:8]
- [x] [Review][Patch] `app/globals.css` : `--font-sans: var(--font-sans)` est auto-référentiel, la police Geist Sans chargée dans `layout.tsx` (`--font-geist-sans`) n'est jamais réellement branchée sur l'utilitaire Tailwind `font-sans` [app/globals.css:10]
- [x] [Review][Patch] Le workflow CI (`.github/workflows/ci.yml`) n'exécute jamais `npm run lint` alors que le script existe dans `package.json` — les erreurs de lint peuvent passer inaperçues [.github/workflows/ci.yml]
- [x] [Review][Patch] Version de Node non épinglée côté Netlify alors que la CI GitHub Actions pin Node 22 — risque de divergence de build entre CI et déploiement [netlify.toml, .github/workflows/ci.yml:10-15]
- [x] [Review][Defer] Dépendance réseau de `next/font/google` en environnement de build sans accès internet [app/layout.tsx:1-12] — deferred, pre-existing (comportement par défaut du scaffold `create-next-app`, acceptable tant que CI/Netlify ont un accès réseau fiable)
- [x] [Review][Defer] Variantes icône-seule de `components/ui/button.tsx` sans nom accessible (`aria-label`) [components/ui/button.tsx:24-35,45-56] — deferred, pre-existing (composant shadcn généré, non encore utilisé dans l'app)

## Dev Notes

- **Aucun starter template n'est imposé par l'architecture** — la stack est pinnée directement (Next.js 16.x, React 19.x, shadcn/ui, Node/TS), pas de template greenfield spécifique à cloner. [Source: _bmad-output/planning-artifacts/epics.md#Additional Requirements]
- **Paradigme** : app 100% côté client, aucune donnée ne transite par un serveur applicatif. Cette story pose uniquement le squelette — ni Catalogue, ni État de dégustation, ni scraper ne sont implémentés ici (arrivent en 1.2 à 1.9). [Source: ARCHITECTURE-SPINE.md#Design Paradigm]
- **AD-4 (bloquant dès cette story)** : Next.js est buildé en export statique (`output: 'export'`). Aucune route API, Server Action, ni logique dépendant d'un runtime serveur ne doit être ajoutée, même à titre d'exemple/boilerplate — supprimer tout `app/api/` généré par défaut par `create-next-app` s'il en génère un. [Source: ARCHITECTURE-SPINE.md#AD-4]
- **Piège connu (point d'attention, pas un blocage pour CETTE story)** : Serwist + `output: 'export'` a un piège de génération de `sw.js` documenté (issue vercel/next.js#73457). Cette story n'installe PAS encore Serwist (arrive en story 1.8) — mais le choix de build fait ici (`output: 'export'`) doit rester stable pour ne pas re-complexifier l'intégration PWA plus tard. [Source: ARCHITECTURE-SPINE.md#Deferred]
- **Ne PAS créer `catalogue.json`** dans cette story : le dossier `data/` est créé vide. Le remplir est le rôle de la story 1.9 (scraper). Ne jamais placer ce fichier dans `public/` — cela le baguerait dans le build statique et empêcherait une mise à jour du Catalogue sans redéploiement (violerait FR-1/UJ-3 du PRD). [Source: ARCHITECTURE-SPINE.md#Structural Seed]
- **Commandes de scaffolding vérifiées (recherche web 2026-07-30)** : `npx create-next-app@latest` (TypeScript + App Router + Tailwind, pas de `src/`), puis dans `next.config.ts` : `output: 'export'` (la commande `next export` est dépréciée, ne pas l'utiliser). shadcn/ui : `npx shadcn@latest init` puis `npx shadcn@latest add <component>`.
- **Structure attendue à la fin de cette story** (sous-ensemble du Structural Seed complet — le reste se remplit dans les stories suivantes) :
  ```text
  /
    app/
      layout.tsx
      page.tsx
    components/            # vide ou composants shadcn de base uniquement
    lib/
      schema/               # stub, contenu réel en story 1.2
      catalogue/            # stub, contenu réel en story 1.3
      tasted/               # stub, contenu réel en story 1.5
    data/                   # vide, contenu réel en story 1.9
    scripts/ (ou tools/)    # vide/stub, contenu réel en story 1.9
    public/
      # PAS de catalogue.json ici
  ```
  [Source: ARCHITECTURE-SPINE.md#Structural Seed]

### Project Structure Notes

- Monorepo unique : l'app Next.js et le futur outil de scraping vivent dans le même repo, pas de séparation en packages/workspaces distincts pour ce projet personnel (AD-6). [Source: ARCHITECTURE-SPINE.md#AD-6]
- Aucune convention de nommage préexistante à respecter (premier commit du projet) — cette story établit la convention : `flavor` en code pour "Saveur" (id/name/image/status), à respecter dès les schémas créés en story 1.2. [Source: ARCHITECTURE-SPINE.md#Consistency Conventions]
- Aucun conflit détecté avec un projet existant : ce dépôt (`pokebrets`) est actuellement vide de code applicatif — cette story est le premier commit de code.

### Testing Requirements

- Le projet ne définissait aucun framework de test avant cette story — le choisir maintenant (ex: Vitest, largement compatible Next.js 16/App Router) et documenter le choix dans Dev Agent Record pour que les stories suivantes (1.2+) l'utilisent sans redécider.
- Un smoke test minimal est suffisant pour cette story (rendu de `app/page.tsx` sans erreur) — pas de test end-to-end nécessaire ici, l'app n'a encore aucune fonctionnalité.
- Vérifier que `npm run build` (export statique) et la suite de tests peuvent tourner tous les deux sans conflit d'outillage.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1: Initialisation du projet et squelette déployé] — définition originale de la story et ses AC
- [Source: _bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#Stack] — versions Next.js 16.x / React 19.x / shadcn/ui / Node.js-TypeScript / Netlify
- [Source: _bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#Structural Seed] — arborescence cible complète
- [Source: _bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-4] — contrainte "aucun code serveur applicatif"
- [Source: _bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-6] — monorepo, Node/TS pour l'app et le scraper
- [Source: _bmad-output/planning-artifacts/prds/prd-brets-chips-checker-2026-07-29/prd.md] — FR-1/UJ-3 (raison pour laquelle `catalogue.json` ne doit jamais vivre dans `public/`)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (GitHub Copilot CLI)

### Debug Log References

- `npm run build` (x4, après chaque étape structurante) : succès, export statique dans `out/`, aucune erreur TypeScript.
- `npx vitest run` : 1/1 test passant (smoke test `app/page.test.tsx`).
- `npm run lint` : aucune erreur.
- Vérification manuelle : aucun dossier `app/api/`, aucun `"use server"` dans `app/`.
- Résolution d'un conflit de peer dependencies sur `@vitejs/plugin-react@6.x` (conflit avec `@rolldown/plugin-babel`) → pinné à la version stable `5.2.0`.

### Completion Notes List

- Projet scaffoldé via `create-next-app@latest` (TypeScript, App Router, Tailwind v4, pas de `src/`), puis fusionné à la racine du repo (le repo contenait déjà `_bmad/`, `_bmad-output/`, `.agents/`, `.github/` — pas de conflit de fichiers).
- `next.config.ts` : `output: 'export'` ajouté (AD-4). Build vérifié : `out/index.html` généré à chaque étape.
- shadcn/ui initialisé (`npx shadcn@latest init -d`, style `base-nova`, couleur de base neutre) ; composant `button` ajouté comme sanity-check de la CLI. Le thème de marque (`DESIGN.md` tokens) sera appliqué dans une story UI ultérieure — hors scope de 1.1.
- Structure du spine créée : `lib/schema/`, `lib/catalogue/`, `lib/tasted/` (stubs `index.ts` avec commentaire renvoyant vers la story qui les implémentera), `data/` (vide, `.gitkeep`), `scripts/` (vide, `.gitkeep`).
- `app/layout.tsx` : `lang="fr"`, titre "Crounch". `app/page.tsx` : page minimale affichant "Crounch" (pas de logique métier).
- Tests : Vitest + React Testing Library choisis (compatibles Next.js 16/App Router, rapides). Smoke test unique sur `app/page.tsx`. Script `npm test` (`vitest run`) et `npm run verify` (`build && test`) ajoutés.
- CI minimale ajoutée : `.github/workflows/ci.yml` (checkout, setup-node 22, `npm ci`, `npm run build`, `npm test`).
- Repo git initialisé localement (`git init` + commit initial) — le repo n'était pas encore sous contrôle de version.
- **Task 5 (déploiement Netlify) réalisée** : repo poussé sur `github.com/jsoulet/pokebrets` (branche `main`), site Netlify connecté par l'utilisateur, déployé à **https://crounch.johansoulet.fr/**. Vérifié via fetch HTTP : la page publique affiche bien le titre "Crounch" et le texte "Le Catalogue des saveurs Brets arrive bientôt." — AC #2 confirmée.

### File List

- `package.json` (modifié — nom `crounch`, scripts `test`/`verify`, dépendances Vitest/RTL)
- `package-lock.json` (généré)
- `next.config.ts` (modifié — `output: 'export'`)
- `app/layout.tsx` (modifié — lang `fr`, titre `Crounch`)
- `app/page.tsx` (modifié — page d'accueil minimale)
- `app/page.test.tsx` (créé — smoke test)
- `app/globals.css` (modifié par shadcn init)
- `components.json` (créé par shadcn init)
- `components/ui/button.tsx` (créé par shadcn init)
- `lib/utils.ts` (créé par shadcn init)
- `lib/schema/index.ts` (créé — stub, story 1.2)
- `lib/catalogue/index.ts` (créé — stub, story 1.3)
- `lib/tasted/index.ts` (créé — stub, story 1.5)
- `data/.gitkeep` (créé — dossier réservé à `catalogue.json`, story 1.9)
- `scripts/.gitkeep` (créé — dossier réservé à l'outil de scraping, story 1.9)
- `vitest.config.ts` (créé)
- `vitest.setup.ts` (créé)
- `netlify.toml` (créé — build/publish config, site déployé sur https://crounch.johansoulet.fr/)
- `.github/workflows/ci.yml` (créé — build + test en CI)
- `.gitignore`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `README.md`, `AGENTS.md`, `CLAUDE.md`, `public/*` (générés par `create-next-app`, non modifiés au-delà du défaut)

## Change Log

- 2026-07-30 : Implémentation initiale de la story 1.1 — scaffold Next.js 16 + shadcn/ui + structure du spine + tests, à l'exception de la connexion Netlify effective (bloquée sur action utilisateur).
- 2026-07-30 : Repo poussé sur GitHub (`jsoulet/pokebrets`), site Netlify connecté et déployé par l'utilisateur (https://crounch.johansoulet.fr/), déploiement vérifié. Toutes les tâches complètes.
- 2026-07-30 : Revue de code adversariale (Blind Hunter + Edge Case Hunter + Acceptance Auditor) — 4 findings patchés (script `start`/export statique, variable de police auto-référentielle, lint absent en CI, version Node non épinglée sur Netlify), 2 findings différés (dépendance réseau `next/font/google`, accessibilité des boutons icône-seule non encore utilisés), 7 rejetés comme faux positifs (périmètre du diff plus étroit que le repo réel). Build/test/lint revalidés. Status → done.
