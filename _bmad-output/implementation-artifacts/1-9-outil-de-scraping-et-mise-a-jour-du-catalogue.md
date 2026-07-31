---
epic_num: 1
story_num: 9
story_key: 1-9-outil-de-scraping-et-mise-a-jour-du-catalogue
baseline_commit: 0444272
inputDocuments:
  - '_bmad-output/planning-artifacts/epics.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md'
  - '_bmad-output/planning-artifacts/prds/prd-brets-chips-checker-2026-07-29/prd.md'
  - '_bmad-output/specs/spec-crounch/SPEC.md'
---

# Story 1.9: Outil de scraping et mise à jour du Catalogue

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

<!-- NOTE D'ORDONNANCEMENT : cette story est développée avant les stories 1.4 à 1.8 (hors ordre normal du sprint), à la demande explicite de l'utilisateur, afin de disposer d'un vrai `data/catalogue.json` avant de reprendre la story 1.3 (chargement du Catalogue). -->

## Story

As a mainteneur (Johan),
I want lancer un script CLI qui scrape les données de saveurs depuis brets.fr et Open Food Facts et régénère `data/catalogue.json`,
so that je puisse ajouter une nouvelle saveur au Catalogue sans jamais toucher au code de l'app ni la redéployer.

## Acceptance Criteria

1. **Given** le script CLI (Node.js/TypeScript, dans `scripts/`), **when** il est exécuté (`npm run scrape`), **then** il scrape brets.fr et Open Food Facts, priorise brets.fr en cas de divergence (nom, visuel, statut), et régénère `data/catalogue.json` (FR5, AD-5).
2. **Given** une Saveur présente sur les deux sources avec des données ambiguës (ex: variantes de nom), **when** le script tente de les rapprocher, **then** il applique une clé de matching canonique documentée (table de correspondance maintenue dans `scripts/off-matching-table.json`) — jamais une fusion automatique silencieuse par proximité de texte (AD-5).
3. **Given** une Saveur qui disparaît de brets.fr (discontinuée), **when** le script régénère le Catalogue, **then** cette Saveur reste dans `data/catalogue.json` avec le statut `archived` — elle n'est jamais supprimée (AD-1).
4. **Given** le JSON généré, **when** il est produit, **then** il est validé contre `lib/schema/` (Story 1.2) avant d'être committé — un JSON non conforme au schéma ne doit jamais être committé, le script s'arrête avec un message d'erreur exploitable et n'écrit rien sur un échec de validation (AD-7).
5. **And** le script est ré-exécutable pour intégrer de nouvelles saveurs sans intervention manuelle sur les entrées existantes, en exécution manuelle (pas de cron) (FR5).
6. **And** l'identifiant de chaque Saveur est minté une seule fois par un registre d'identité persisté (`scripts/identity-registry.json`, committé) — un renommage du produit chez brets.fr ne doit jamais changer l'identifiant déjà minté (AD-1, AD-5).

## Tasks / Subtasks

- [x] Task 1: Scaffolding du script CLI (AC: #1, #5)
  - [x] Subtask 1.1: Ajouter `tsx` en devDependency (`npm install -D tsx`) — seul moyen léger de faire tourner un script TypeScript qui importe `lib/schema/` avec la résolution d'imports sans extension déjà utilisée dans le projet (confirmé : Node natif avec `--experimental-strip-types` échoue sur `Cannot find module` pour ces imports relatifs, `tsx` les résout correctement). **Approuvé par l'utilisateur** pendant la création de cette story — ne pas redemander confirmation.
  - [x] Subtask 1.2: Ajouter le script npm `"scrape": "tsx scripts/scrape-catalogue.ts"` dans `package.json`.
  - [x] Subtask 1.3: Créer `scripts/scrape-catalogue.ts` comme point d'entrée CLI orchestrant les étapes ci-dessous ; toute erreur non recouvrable (réseau, validation) doit produire un message clair sur stderr et un code de sortie non-zéro — jamais un stacktrace brut sans contexte.
- [x] Task 2: Client brets.fr (source d'autorité) (AC: #1)
  - [x] Subtask 2.1: Créer `scripts/sources/brets.ts` avec une fonction `fetchBretsProducts()` qui appelle l'API REST WordPress publique de brets.fr : `GET https://cms.brets.fr/wp-json/wp/v2/product?per_page=100&_fields=id,slug,title,link,acf` (confirmé fonctionnel : 60 produits, code 200, pas d'auth requise). Gérer la pagination via l'en-tête `X-WP-TotalPages` au cas où le catalogue dépasserait 100 produits à l'avenir (actuellement 1 seule page).
  - [x] Subtask 2.2: Pour chaque produit retourné, extraire : `id` (entier WP, **stable même si le produit est renommé** — c'est la clé technique utilisée par le registre d'identité, cf. Task 4), `title.rendered` (nom affiché, décoder les entités HTML — `&#038;` en particulier, apparaît dans au moins un produit réel : "Ail Confit &#038; Herbes de Provence"), `acf.packaging.url` (URL absolue de l'image d'emballage, hébergée sur `cms.brets.fr`).
  - [x] Subtask 2.3: Écrire une fonction pure `decodeHtmlEntities(input: string): string` (numériques `&#NNN;` + entités nommées courantes `&amp;`, `&eacute;`, `&egrave;`, etc. rencontrées dans les titres de produits) — pas de nouvelle dépendance pour ça, la liste d'entités nécessaires est petite et fermée (noms de recettes en français).
  - [x] Subtask 2.4: Ne PAS utiliser le `slug` WP comme identifiant final — l'utiliser uniquement comme donnée d'entrée du registre d'identité (Task 4) car il peut théoriquement changer si le titre change, contrairement à l'`id` numérique WP qui est stable.
- [x] Task 3: Client Open Food Facts (source complémentaire/fallback) (AC: #1, #2)
  - [x] Subtask 3.1: Créer `scripts/sources/off.ts` avec une fonction `fetchOffProducts()` qui appelle `GET https://world.openfoodfacts.org/api/v2/search?brands_tags=brets&fields=code,product_name,image_url,brands&page_size=100` (confirmé fonctionnel, pas d'auth requise ; paginer via `page`/`page_count` si besoin de couvrir les ~270 résultats, en filtrant ensuite ceux réellement liés à une Saveur brets.fr connue).
  - [x] Subtask 3.2: Ne consommer les données OFF QUE pour une Saveur explicitement listée dans `scripts/off-matching-table.json` (table de correspondance canonique maintenue manuellement — format : `{ "<id brets.fr numérique>": "<code-barres OFF>" }`) — jamais de rapprochement automatique par similarité de nom (AC #2, AD-5). Au démarrage de cette story, cette table est vide (`{}`) : OFF n'est utilisé pour aucune Saveur tant qu'aucune entrée n'y est ajoutée manuellement, brets.fr suffisant seul à couvrir nom/visuel/statut pour toutes les Saveurs actuelles.
  - [x] Subtask 3.3: Documenter dans un commentaire en tête de `scripts/off-matching-table.json` (ou un fichier `scripts/off-matching-table.README.md` adjacent) le format attendu et la procédure pour ajouter une correspondance ambiguë.
- [x] Task 4: Registre d'identité (mint stable, AD-1) (AC: #6)
  - [x] Subtask 4.1: Créer `scripts/identity-registry.json` (committé dans le repo, initialement `{}`) au format `{ "<id brets.fr numérique>": "<slug kebab-case minté>" }`.
  - [x] Subtask 4.2: Créer `scripts/identity-registry.ts` avec une fonction `resolveFlavorId(bretsProductId: number, currentSlug: string, registry: Record<string, string>): { id: string; registry: Record<string, string> }` : si `bretsProductId` existe déjà dans le registre, retourner l'`id` déjà minté (jamais re-dérivé du nom/slug courant, même si celui-ci a changé) ; sinon, minter un nouvel `id` à partir de `currentSlug` normalisé pour respecter le format `flavorIdSchema` (kebab-case, `lib/schema/flavor.ts`), l'ajouter au registre, et le retourner.
  - [x] Subtask 4.3: Après chaque exécution réussie du script, persister le registre mis à jour dans `scripts/identity-registry.json` (uniquement si la validation du Catalogue généré — Task 6 — réussit ; jamais d'écriture partielle si le script échoue en cours de route).
- [x] Task 5: Fusion des sources et gestion de l'archivage (AC: #1, #3)
  - [x] Subtask 5.1: Créer `scripts/merge-catalogue.ts` avec une fonction `mergeSources(bretsProducts, offMatches, previousCatalogue, registry)` qui construit la liste de Saveurs `active` : pour chaque produit brets.fr, résoudre l'`id` (Task 4), utiliser nom/visuel de brets.fr comme autorité, ne consulter OFF que pour compléter un champ explicitement absent de brets.fr (AD-5) — cas non observé aujourd'hui puisque brets.fr fournit nom + image pour tous les produits actuels, mais le code doit prévoir ce chemin.
  - [x] Subtask 5.2: Détecter les Saveurs `archived` : tout `id` présent dans `previousCatalogue.flavors` (lu depuis `data/catalogue.json` existant, s'il existe) mais absent de la liste de produits brets.fr actuellement scrapés est reporté dans le nouveau Catalogue avec `status: "archived"` et ses `name`/`image` inchangés (dernière valeur connue) — jamais supprimé (AD-1, AC #3).
  - [x] Subtask 5.3: Une Saveur qui réapparaît chez brets.fr après avoir été `archived` (cas limite) repasse à `status: "active"` avec les données fraîches de brets.fr — l'`id` reste inchangé (résolu via le registre, Task 4).
- [x] Task 6: Validation et écriture atomique (AC: #4)
  - [x] Subtask 6.1: Construire l'objet Catalogue final : `{ generatedAt: new Date().toISOString(), flavors: [...] }` (généré strictement au moment de l'exécution — jamais une valeur figée d'un run précédent).
  - [x] Subtask 6.2: Valider l'objet via `parseCatalogue` (`lib/schema/`, story 1.2) avant toute écriture disque. Si `success: false`, afficher les messages d'erreur exploitables (déjà préfixés par le path Zod, story 1.2) sur stderr, **ne rien écrire** (ni `data/catalogue.json`, ni `scripts/identity-registry.json`), et sortir avec un code non-zéro (AC #4, AD-7).
  - [x] Subtask 6.3: Si la validation réussit, écrire `data/catalogue.json` (créer le dossier `data/` à la racine s'il n'existe pas) puis `scripts/identity-registry.json` mis à jour, dans cet ordre.
  - [x] Subtask 6.4: Logger un résumé exploitable sur stdout en fin d'exécution : nombre de Saveurs `active`, nombre de Saveurs `archived`, nombre de nouvelles Saveurs mintées cette exécution.
- [x] Task 7: Tests unitaires exhaustifs (AC: #1, #2, #3, #4, #6)
  - [x] Subtask 7.1: Mocker `global.fetch` pour `fetchBretsProducts`/`fetchOffProducts` — aucun test n'effectue de vrai appel réseau vers brets.fr/OFF.
  - [x] Subtask 7.2: Tester `decodeHtmlEntities` sur les cas réels rencontrés (`&#038;`, entités accentuées).
  - [x] Subtask 7.3: Tester `resolveFlavorId` : première rencontre d'un `bretsProductId` mint un nouvel id ; rencontre d'un `bretsProductId` déjà connu retourne l'id existant même si `currentSlug` a changé (simuler un renommage de produit brets.fr) — non-régression de l'id (AC #6, AD-1).
  - [x] Subtask 7.4: Tester `mergeSources` : produits actifs correctement fusionnés (priorité brets.fr) ; une Saveur absente du nouveau scrape brets.fr mais présente dans `previousCatalogue` devient `archived` sans être supprimée (AC #3) ; une Saveur `archived` qui réapparaît repasse `active` avec le même id.
  - [x] Subtask 7.5: Tester le chemin de validation : un Catalogue construit délibérément invalide (ex: deux Saveurs avec le même id résultant d'un bug de fusion) fait échouer `parseCatalogue`, aucune écriture disque n'a lieu (mocker `fs.writeFileSync`/`fs.promises.writeFile` et vérifier qu'ils ne sont jamais appelés dans ce cas) (AC #4).
  - [x] Subtask 7.6: Exécuter `npm test` : tous les tests passent, aucune régression sur les suites existantes (`lib/schema/*`, `app/page.test.tsx`).
  - [x] Subtask 7.7: Exécuter `npm run build && npm run lint` : aucune erreur — vérifier que les fichiers de `scripts/` sont bien couverts par la config ESLint existante (ou explicitement exclus si le projet Next.js lint uniquement `app/`/`lib/`/`components/`, à vérifier dans `eslint.config.*`).
- [x] Task 8: Exécution réelle et premier commit du Catalogue (AC: #1, #5)
  - [x] Subtask 8.1: Exécuter `npm run scrape` réellement (vrai réseau, pas de mock) pour produire un premier `data/catalogue.json` réel à partir des ~60 produits actuels de brets.fr.
  - [x] Subtask 8.2: Vérifier manuellement le JSON produit (nombre de Saveurs, noms lisibles après décodage des entités, URLs d'image valides) avant de committer.
  - [x] Subtask 8.3: Committer `data/catalogue.json` et `scripts/identity-registry.json` — c'est ce fichier que la story 1.3 (chargement du Catalogue) consommera réellement via `raw.githubusercontent.com` une fois cette story terminée.

## Dev Notes

- **Portée stricte de cette story** : uniquement `scripts/` (outil CLI) + le premier `data/catalogue.json` qu'il génère. Aucune modification de `app/`, `lib/catalogue/`, ou `lib/tasted/` — ces modules consomment `data/catalogue.json` mais ne sont pas concernés par la génération elle-même.
- **⚠️ Ordonnancement hors séquence** : cette story est développée immédiatement après la story 1.2, avant les stories 1.3 à 1.8, à la demande explicite de l'utilisateur — objectif : disposer d'un vrai `data/catalogue.json` committé avant de reprendre l'implémentation de la story 1.3 (chargement du Catalogue), qui en dépend en production (cf. Dev Notes de la story 1.3).
- **Sources réelles confirmées pendant la préparation de cette story** (recherche effectuée en amont, pas une supposition) :
  - **brets.fr (autorité, AD-5)** : API REST WordPress publique et non authentifiée à `https://cms.brets.fr/wp-json/wp/v2/product?per_page=100&_fields=id,slug,title,link,acf` — retourne actuellement 60 produits (`X-WP-Total: 60`, une seule page). Champs utiles : `id` (entier WP, stable — **c'est la clé technique du registre d'identité**, pas `slug`), `slug` (kebab-case, ex: `ail-confit-herbes-de-provence` — utilisé uniquement pour minter le premier id), `title.rendered` (nom, HTML-encodé, ex: `"Ail Confit &#038; Herbes de Provence"`), `acf.packaging.url` (image, URL absolue `https://cms.brets.fr/app/uploads/...png`).
  - **Open Food Facts (complément/fallback, AD-5)** : API publique `https://world.openfoodfacts.org/api/v2/search?brands_tags=brets&fields=code,product_name,image_url,brands&page_size=100` — retourne ~270 résultats pour la marque Brets (inclut variantes de conditionnement, doublons probables). Ne pas essayer de tout rapprocher automatiquement : cette source n'est consultée que via `scripts/off-matching-table.json` (table maintenue manuellement, AC #2).
  - Ces deux endpoints ne nécessitent aucune authentification ni clé API. Aucun navigateur headless (Puppeteer/Playwright) n'est nécessaire : brets.fr expose ses données produit via une API JSON propre malgré un frontend React/Next.js — **ne pas ajouter Playwright/Puppeteer**, ce serait une dépendance disproportionnée pour ce besoin.
- **AD-1 (frontière Catalogue ⇄ État de dégustation)** : l'identifiant de Saveur est **minté une seule fois** par le scraper et jamais re-dérivé du nom d'affichage. Une Saveur qui disparaît transitionne `active` → `archived`, jamais supprimée. C'est pourquoi cette story introduit un **registre d'identité persisté** (`scripts/identity-registry.json`) keyé sur l'`id` numérique WordPress de brets.fr (stable même si le produit est renommé) plutôt que sur le `slug` ou le nom (qui peuvent changer). [Source: ARCHITECTURE-SPINE.md#AD-1]
- **AD-5 (source de vérité et identification pour le scraping)** : brets.fr fait autorité sur nom/visuel/statut ; OFF ne sert qu'en complément explicite via une table de correspondance documentée — jamais une fusion automatique par similarité de texte. [Source: ARCHITECTURE-SPINE.md#AD-5]
- **AD-6 (un seul repo, un seul écosystème)** : le scraper est en Node.js/TypeScript, dans le même repo que l'app, exécuté manuellement (pas de cron — explicitement Deferred). `tsx` est la seule dépendance ajoutée pour l'exécuter (léger, ne touche pas au build Next.js). [Source: ARCHITECTURE-SPINE.md#AD-6]
- **AD-7 (schéma partagé)** : le script DOIT valider sa sortie via `parseCatalogue` (`lib/schema/`, story 1.2, déjà livrée avec `.strict()`, rejet des doublons d'id, `.min(1)` sur `flavors`, validation `image`) avant tout commit — aucun bypass. [Source: ARCHITECTURE-SPINE.md#AD-7]
- **Pas de nouvelle dépendance de scraping HTML** (pas de `cheerio`, pas de `jsdom` côté scraper — `jsdom` existant est un devDependency de test uniquement) : les deux sources exposent du JSON directement, un simple `fetch` natif de Node 22 suffit.
- **Le fichier `data/catalogue.json` vit hors de `public/`** (déjà mentionné par AD-2/AC #5 de la story 1.3) — il est servi via `raw.githubusercontent.com` depuis la branche `main` du repo, pas bundlé par Next.js.

### Project Structure Notes

- Nouveau dossier à la racine : `scripts/` (`scripts/scrape-catalogue.ts`, `scripts/sources/brets.ts`, `scripts/sources/off.ts`, `scripts/identity-registry.ts`, `scripts/merge-catalogue.ts`, `scripts/off-matching-table.json`, `scripts/identity-registry.json`), plus leurs fichiers de test co-localisés (`*.test.ts`).
- Nouveau fichier à la racine : `data/catalogue.json` (premier Catalogue réel, committé à la fin de cette story).
- `package.json` : ajout de `tsx` en devDependency + script `"scrape": "tsx scripts/scrape-catalogue.ts"`.
- Réutilise `lib/schema/` (story 1.2, déjà livrée) — `parseCatalogue`, `flavorIdSchema` — sans le modifier.
- Vérifier la config ESLint (`eslint.config.*`) : si elle cible spécifiquement `app/`/`components/`/`lib/` avec des règles React/Next, `scripts/` peut nécessiter une entrée dédiée (règles Node CLI, pas de JSX) — ajuster si `npm run lint` échoue sur `scripts/`.

### Testing Requirements

- Framework : Vitest (déjà configuré) — `scripts/**/*.test.ts` suit le même pattern que `lib/schema/*.test.ts`.
- Mocker systématiquement `global.fetch` pour les deux sources — aucun test n'appelle le vrai réseau (Task 8, l'exécution réelle, est un pas manuel séparé, pas un test automatisé).
- Mocker les écritures disque (`fs`) dans le test du chemin d'échec de validation (Subtask 7.5) pour garantir qu'aucune écriture ne survient sur un Catalogue invalide.
- Validation finale avant de committer le code du script : `npm run build && npm test && npm run lint`.
- Validation finale avant de committer `data/catalogue.json` : exécution réelle de `npm run scrape` (Task 8) + relecture manuelle du JSON produit.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.9] — user story et acceptance criteria d'origine
- [Source: _bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-1] — frontière Catalogue ⇄ État de dégustation, id stable minté une fois
- [Source: _bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-5] — source de vérité et identification des Saveurs pour le scraping
- [Source: _bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-6] — un seul repo, un seul écosystème
- [Source: _bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-7] — schéma partagé et versionné
- [Source: _bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#Deferred] — automatisation planifiée du scraping (cron) explicitement hors scope MVP
- [Source: _bmad-output/specs/spec-crounch/SPEC.md] — FR5 (scraping du Catalogue depuis brets.fr et Open Food Facts, sans reconstruire ni redéployer l'app)
- API brets.fr (vérifiée en direct pendant la préparation de cette story) : `https://cms.brets.fr/wp-json/wp/v2/product?per_page=100&_fields=id,slug,title,link,acf`
- API Open Food Facts (vérifiée en direct) : `https://world.openfoodfacts.org/api/v2/search?brands_tags=brets&fields=code,product_name,image_url,brands&page_size=100`

## Previous Story Intelligence

- Story 1.2 a livré `lib/schema/` complet, y compris (suite à sa revue de code) : `catalogueSchema.flavors` avec `.min(1)` et rejet des `id` dupliqués (`.superRefine`), `.strict()` sur `flavorSchema`/`catalogueSchema`, `image` restreint à une URL `http(s)` ou un chemin `/...`, `flavorIdSchema` exporté. Cette story doit produire un JSON qui passe ces validations sans exception — en particulier vérifier que l'URL d'image brets.fr (`https://cms.brets.fr/app/uploads/...`) valide bien contre le nouveau schéma `image` (c'est une URL `https://`, donc conforme).
- Story 1.3 (chargement du Catalogue, en pause) attend le `data/catalogue.json` produit par cette story pour être testable en conditions réelles — voir sa note "Dépendance externe non encore livrée" dans son propre fichier de story.
- Aucun dossier `scripts/` n'existe encore dans le repo — première introduction dans cette story.
- Pattern de test établi : Vitest, fichiers `*.test.ts` co-localisés, TDD red-green (stories 1.1/1.2).

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (GitHub Copilot CLI)

### Debug Log References

- TDD strict, module par module (rouge confirmé pour chacun avant implémentation) : `html-entities`, `sources/brets`, `sources/off`, `identity-registry`, `merge-catalogue`, `build-catalogue`, `write-catalogue`, `read-state`, `scrape-catalogue` (orchestrateur).
- `npm test -- --run` : 78/78 tests passants, aucune régression sur `lib/schema/*` ni `app/page.test.tsx`.
- `npm run build` : succès (TypeScript inclut `scripts/` sans erreur).
- `npm run lint` : succès sans ajustement de la config ESLint — `scripts/` déjà couvert (Subtask 7.7 : aucune action nécessaire).
- Exécution réelle (`npm run scrape`, Task 8) : premier run a révélé qu'Open Food Facts renvoyait `HTTP 503` (indisponibilité momentanée du service tiers). Comme OFF n'est qu'un complément non autoritaire (AD-5), le `Promise.all` initial faisait échouer tout le scrape à tort. Corrigé : `fetchBretsProducts` reste bloquant (source d'autorité), `fetchOffProducts` est maintenant non bloquant (avertissement stderr + poursuite avec un tableau vide en cas d'échec) — comportement couvert par un nouveau test dédié avant la ré-exécution réelle.
- Deuxième exécution réelle : succès, 60 Saveurs actives, 0 archivée, 60 ids mintés. JSON relu manuellement (noms décodés correctement, ex: "Ail Confit & Herbes de Provence" ; URLs d'image valides `https://cms.brets.fr/app/uploads/...`).

### Completion Notes List

- Toutes les Tasks 1 à 8 complétées en TDD strict (rouge confirmé avant chaque implémentation), 78 tests au total dans la suite (dont 51 nouveaux pour cette story).
- Client brets.fr (source d'autorité, AD-5) : pagination via `X-WP-TotalPages`, décodage d'entités HTML propre, erreurs exploitables si image de packaging manquante.
- Client Open Food Facts (complément, AD-5) : pagination via `page_count`, matching strictement piloté par `scripts/off-matching-table.json` (aucun rapprochement automatique par similarité).
- Registre d'identité (AD-1) : `resolveFlavorId` garantit la stabilité de l'id même en cas de renommage côté brets.fr (testé explicitement).
- Fusion (`mergeSources`) : priorité brets.fr, archivage sans suppression (AD-1), réactivation naturelle d'une Saveur archivée qui réapparaît.
- Validation stricte avant écriture (`buildAndValidateCatalogue` + `writeCatalogueFiles`) : aucune écriture disque en cas d'échec de validation Zod (AD-7), testé avec `fs` mocké.
- Orchestrateur (`scrape-catalogue.ts`) : dépendances injectables pour testabilité complète sans I/O réel ; point d'entrée CLI avec message stderr clair et code de sortie non-zéro sur échec.
- **Amélioration de robustesse découverte en conditions réelles** : l'indisponibilité momentanée d'Open Food Facts (HTTP 503, service tiers) ne doit jamais bloquer une mise à jour du Catalogue puisque OFF n'est qu'un complément (AD-5) — corrigé et testé avant de considérer la story terminée.
- Premier `data/catalogue.json` réel généré et committé (60 Saveurs actives, `scripts/identity-registry.json` correspondant).
- `eslint.config.*` couvre déjà `scripts/` sans modification nécessaire.

### File List

- `package.json` (modifié — ajout devDependency `tsx`, script npm `scrape`)
- `package-lock.json` (modifié — installation de `tsx`)
- `scripts/scrape-catalogue.ts` (nouveau — orchestrateur CLI)
- `scripts/scrape-catalogue.test.ts` (nouveau)
- `scripts/html-entities.ts` (nouveau)
- `scripts/html-entities.test.ts` (nouveau)
- `scripts/sources/brets.ts` (nouveau)
- `scripts/sources/brets.test.ts` (nouveau)
- `scripts/sources/off.ts` (nouveau)
- `scripts/sources/off.test.ts` (nouveau)
- `scripts/off-matching-table.json` (nouveau — `{}`)
- `scripts/off-matching-table.README.md` (nouveau)
- `scripts/identity-registry.ts` (nouveau)
- `scripts/identity-registry.test.ts` (nouveau)
- `scripts/identity-registry.json` (nouveau — registre réel, 60 entrées après Task 8)
- `scripts/merge-catalogue.ts` (nouveau)
- `scripts/merge-catalogue.test.ts` (nouveau)
- `scripts/build-catalogue.ts` (nouveau)
- `scripts/build-catalogue.test.ts` (nouveau)
- `scripts/write-catalogue.ts` (nouveau)
- `scripts/write-catalogue.test.ts` (nouveau)
- `scripts/read-state.ts` (nouveau)
- `scripts/read-state.test.ts` (nouveau)
- `data/catalogue.json` (nouveau — premier Catalogue réel, 60 Saveurs actives)

## Change Log

- 2026-07-31 : Implémentation complète de la story 1.9 (scraper CLI brets.fr + Open Food Facts, registre d'identité, fusion/archivage, validation stricte, écriture atomique). 51 nouveaux tests, 78/78 passants au total, build et lint clean. Exécution réelle effectuée (Task 8) : premier `data/catalogue.json` généré et committé (60 Saveurs actives). Correction de robustesse découverte en conditions réelles : indisponibilité d'Open Food Facts (HTTP 503) rendue non bloquante (AD-5 : complément uniquement). Statut → `review`.
