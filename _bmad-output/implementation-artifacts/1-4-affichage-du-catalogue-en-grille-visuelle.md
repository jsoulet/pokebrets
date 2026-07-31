---
epic_num: 1
story_num: 4
story_key: 1-4-affichage-du-catalogue-en-grille-visuelle
baseline_commit: 71b835f16d64638547e9d066c8288e9de0aef284
inputDocuments:
  - '_bmad-output/planning-artifacts/epics.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/EXPERIENCE.md'
  - '_bmad-output/planning-artifacts/prds/prd-brets-chips-checker-2026-07-29/prd.md'
  - '_bmad-output/specs/spec-crounch/SPEC.md'
---

# Story 1.4: Affichage du Catalogue en grille visuelle

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a utilisateur (Johan),
I want voir toutes les Saveurs du Catalogue dans une grille visuelle façon bingo/pokédex, avec l'identité Crounch (couleurs, typographie, arrondis),
so that parcourir ma collection soit immédiat et amusant, y compris pendant le chargement.

## Acceptance Criteria

1. **Given** le Catalogue chargé (Story 1.3), **when** la page d'accueil s'affiche, **then** chaque Saveur apparaît comme une case (chip-tile) distincte de la grille, avec nom et visuel (FR2).
2. **Given** une Saveur au statut `archived`, **when** elle est affichée dans la grille, **then** elle reste visible mais visuellement distinguable (badge pilule beige-gris) sans être supprimée (FR2, UX-DR6).
3. **Given** le Catalogue en cours de premier chargement (aucun cache), **when** la page s'affiche, **then** un Skeleton (grille de tuiles grises animées) s'affiche jusqu'à réception des données (UX-DR8).
4. **And** les tokens de couleur (`#DDA138`, `#E8482C`, `#3FA34D`, `#C9C2B4`, `#FDF0DD`), la typographie (Inter/Post No Bills Jaffna ExtraBold/Recoleta ou Fraunces), et les arrondis généreux du `DESIGN.md` sont appliqués (UX-DR1, UX-DR2, UX-DR3).
5. **And** la grille est responsive : 2-3 colonnes mobile, 4-5 tablette, 6+ desktop avec largeur plafonnée (UX-DR13, NFR1).

## Tasks / Subtasks

- [x] Task 1: Créer la frontière client qui consomme `useCatalogue()` sans casser l'export statique (AC: #1, #3)
  - [x] Subtask 1.1: Garder `app/page.tsx` comme shell de route minimal et Server Component par défaut ; créer un composant feuille dédié (ex: `components/catalogue/catalogue-page-client.tsx`) portant `'use client'` et consommant `useCatalogue()` — ne pas convertir toute la route en Client Component si seule la grille en a besoin.
  - [x] Subtask 1.2: Brancher la UI uniquement sur l'API publique du hook livrée en Story 1.3 : `{ data, status, error, retry }`. Le composant ne doit jamais refetcher lui-même, lire `localStorage`, ni comparer `generatedAt` — `lib/catalogue/` reste l'unique propriétaire de la fraîcheur (AD-2).
  - [x] Subtask 1.3: Préserver le shell existant de la page d'accueil (`<main>`, titre “Crounch”, ton de microcopy) tout en remplaçant le placeholder “Le Catalogue des saveurs Brets arrive bientôt.” par la vraie surface Catalogue.

- [x] Task 2: Construire la grille et les chip-tiles de catalogue en composants de présentation réutilisables (AC: #1, #2, #5)
  - [x] Subtask 2.1: Créer des composants dédiés sous `components/catalogue/` (ex: `catalogue-grid.tsx`, `catalogue-tile.tsx`, `catalogue-grid-skeleton.tsx`) plutôt que d'entasser toute la logique dans `app/page.tsx`. `components/ui/` reste réservé aux primitives génériques ; la grille Crounch est spécifique au domaine.
  - [x] Subtask 2.2: Chaque tuile affiche le visuel de la Saveur et son nom, avec une clé React basée sur `flavor.id` (jamais l'index du tableau, conformément à AD-1).
  - [x] Subtask 2.3: Une Saveur `archived` affiche un badge pilule dédié et un fond/contraste distincts, mais reste rendue dans la même grille — aucune filtration des éléments archivés.
  - [x] Subtask 2.4: Cette story reste strictement “affichage du Catalogue” : ne pas ajouter le toggle goûtée/pas goûtée (Story 1.5), le compteur `X/N` (Story 1.5) ni l'icône info/Dialog détail (Story 1.6). La tuile est pour l'instant purement présentationale.

- [x] Task 3: Appliquer l'identité visuelle Crounch avec la stack déjà en place, sans nouvelle dépendance (AC: #1, #2, #4, #5)
  - [x] Subtask 3.1: Réutiliser Tailwind CSS v4 + tokens CSS déjà centralisés dans `app/globals.css` ; injecter les couleurs de marque dans les variables existantes (`--background`, `--primary`, `--accent`) et ajouter les tokens manquants nécessaires à la grille (ex: `--success`, `--archived`) plutôt que disperser des hex codes arbitraires dans les composants.
  - [x] Subtask 3.2: Réutiliser `next/font` déjà présent dans `app/layout.tsx` pour brancher la typo du corps sur Inter. Ne pas charger de polices depuis un CDN tiers ni copier une fonte récupérée depuis brets.fr ; si la fonte display exacte n'est pas disponible dans le repo, encapsuler la variable/utility de typo pour permettre un remplacement ultérieur sans réécrire les composants.
  - [x] Subtask 3.3: Réutiliser le bouton primaire existant `components/ui/button.tsx` pour l'action “Réessayer”. Comme aucun composant `Badge` / `Skeleton` n'est installé aujourd'hui, implémenter le badge archivée et le skeleton avec du markup local et les utilitaires Tailwind existants — sans ajouter de package.
  - [x] Subtask 3.4: Afficher les visuels avec un élément `<img>` standard, pas `next/image` : `next.config.ts` n'expose aucun `images.remotePatterns`, le Catalogue réel pointe aujourd'hui vers des URLs `cms.brets.fr`, et l'app reste en `output: 'export'`. Introduire `next/image` ici ouvrirait un chantier de config hors scope.
  - [x] Subtask 3.5: Appliquer les contraintes responsive de `EXPERIENCE.md` : 2 à 3 colonnes en mobile, 4 à 5 en tablette, 6+ en desktop, avec une largeur max pour éviter une grille “infinie” sur grand écran.

- [x] Task 4: Câbler correctement les états visuels du hook sans masquer les cas limites livrés en Story 1.3 (AC: #1, #3)
  - [x] Subtask 4.1: `status === "loading"` (et donc `data === null` dans le contrat actuel) doit afficher le skeleton de grille, pas un spinner générique ni un écran vide.
  - [x] Subtask 4.2: `status === "ready"` doit afficher la grille immédiatement, qu'il s'agisse d'un cache local ou d'une réponse réseau fraîche — la UI n'a jamais à distinguer l'origine des données.
  - [x] Subtask 4.3: `status === "error"` doit afficher un état explicite avec le message du hook et un bouton “Réessayer” relié à `retry()`. Même si la Story 1.7 raffinera la microcopy hors-ligne, cette story est le premier consommateur de `useCatalogue()` et doit déjà garder l'app fonctionnelle de bout en bout.
  - [x] Subtask 4.4: Ne pas inventer de bannière hors-ligne “cache affiché” dans cette story : en cas d'échec de revalidation avec cache existant, le hook reste volontairement en `ready` silencieux (Story 1.3). La bannière de mode dégradé appartient à la Story 1.7.

- [x] Task 5: Couvrir l'intégration UI par des tests centrés sur le rendu et les états, sans redoubler les tests du hook (AC: #1, #2, #3, #5)
  - [x] Subtask 5.1: Étendre `app/page.test.tsx` et/ou ajouter des tests co-localisés sous `components/catalogue/` pour vérifier les 3 états visibles de la page : skeleton initial, grille prête, état d'erreur avec retry.
  - [x] Subtask 5.2: Mocker `useCatalogue()` dans les tests UI au lieu de rejouer la logique réseau/cache déjà couverte exhaustivement par `lib/catalogue/index.test.tsx`.
  - [x] Subtask 5.3: Prévoir une fixture de test contenant au moins une Saveur `archived`, car `data/catalogue.json` réel contient actuellement 60 Saveurs `active` et 0 `archived` — sinon l'AC #2 ne serait jamais vérifiée en test.
  - [x] Subtask 5.4: Vérifier l'accessibilité minimale : image avec `alt` pertinent, nom visible, badge `archived` lisible/annonçable, bouton “Réessayer” accessible au rôle `button`.
  - [x] Subtask 5.5: Ne jamais figer `60` dans la UI ni dans les assertions métier ; le scraper (Story 1.9) peut faire évoluer le nombre total de saveurs. Les tests doivent se baser sur la longueur de la fixture fournie.
  - [x] Subtask 5.6: Validation finale de l'implémentation : `npm test`, `npm run build` et `npm run lint` doivent passer sans erreur.

## Dev Notes

- **Point d'intégration critique avec la Story 1.3** : cette story est le **premier consommateur UI** de `lib/catalogue/useCatalogue()`. Le hook est déjà l'unique propriétaire du fetch GitHub, du cache local, de la comparaison de fraîcheur (`generatedAt`) et de la dégradation réseau. La grille ne doit être qu'une projection visuelle de `status` / `data` / `error` / `retry`, jamais une seconde implémentation de cette logique. [Source: `_bmad-output/implementation-artifacts/1-3-chargement-du-catalogue-avec-cache-local-et-degradation-reseau.md`]
- **État actuel des fichiers à modifier** : `app/page.tsx` est aujourd'hui un simple placeholder centré (titre + texte “arrive bientôt”), `app/page.test.tsx` ne vérifie que la présence du titre, `app/globals.css` porte encore des tokens neutres shadcn/Geist, et `app/layout.tsx` charge `Geist`/`Geist_Mono` via `next/font/google`. L'implémentation devra donc à la fois remplacer le placeholder, renforcer les tests, et brancher l'identité visuelle sans introduire de rupture de build.
- **Contrainte Next.js 16 / App Router** : `app/page.tsx` reste Server Component par défaut. La bonne pratique actuelle est de pousser `'use client'` au plus bas niveau possible ; ici, cela signifie un composant feuille pour la grille qui consomme `useCatalogue()`, plutôt qu'un basculement global de la route côté client. [Source: docs Next.js “Server and Client Components”, consultées via recherche web le 2026-07-31]
- **Ne pas utiliser `next/image` dans cette story** : le Catalogue réel pointe aujourd'hui vers des images distantes `https://cms.brets.fr/...`, et `next.config.ts` n'autorise aucun domaine distant. Un `<img>` standard est cohérent avec l'export statique et évite d'ouvrir un sujet de configuration non demandé.
- **Données réelles observées à date** : `data/catalogue.json` livré par la Story 1.9 contient actuellement `generatedAt: 2026-07-31T08:28:57.649Z`, **60 saveurs**, toutes au statut `active`. Cela confirme que la grille réelle aura un volume non trivial dès cette story, mais oblige aussi à injecter une fixture `archived` dédiée dans les tests pour couvrir l'AC #2.
- **Stack réellement disponible** : `package.json` expose déjà `next@16.2.12`, `react@19.2.4`, `tailwindcss@^4`, `@base-ui/react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `zod`, Vitest et Testing Library. Aucun composant `Badge`, `Skeleton`, `Dialog` ou `Checkbox` n'existe encore dans le repo ; seul `components/ui/button.tsx` est présent côté primitives UI. La story doit donc réutiliser cette base sans ajouter de dépendance ni présumer d'un catalogue shadcn déjà généré.
- **Frontière de scope à respecter** :
  - Story 1.4 = affichage de la grille, identité visuelle, skeleton, état d'erreur/réessai minimal.
  - Story 1.5 = toggle goûtée/pas goûtée + persistance `lib/tasted/` + compteur de progression.
  - Story 1.6 = détail d'une Saveur en `Dialog` + icône info.
  - Story 1.7 = bannière hors-ligne / microcopy détaillée.
  Cette séparation évite de coupler prématurément les composants de grille à des comportements non encore livrés.
- **Typographie / assets : question ouverte à cadrer proprement** : le repo ne contient actuellement aucun fichier de police `Post No Bills Jaffna` / `Recoleta` / `Fraunces`. `Recoleta` est en plus une police commerciale, et le `DESIGN.md` déconseille implicitement tout hotlinking opportuniste. Pour cette story, ne pas bloquer la grille sur l'absence d'assets ; privilégier une structure de tokens/utilitaires qui permet de brancher proprement la vraie fonte plus tard sans dépendance CDN. Cette question reste à valider avec Johan si une fidélité typographique stricte est exigée dès 1.4.
- **Images et accessibilité** : le schéma `Flavor` garantit `name`, `image` et `status`, mais pas de texte alternatif séparé. Utiliser `flavor.name` comme `alt` par défaut, conserver une surface de lecture lisible sur mobile, et veiller à ce que le badge `archived` soit porté par du texte, pas uniquement par la couleur. [Source: `lib/schema/flavor.ts`, `EXPERIENCE.md#Accessibility Floor`]

### Project Structure Notes

- **UPDATE** `app/page.tsx` — remplace le placeholder actuel par le shell réel du Catalogue, idéalement en important un composant client dédié plutôt qu'en portant toute la logique dans la page.
- **UPDATE** `app/page.test.tsx` — enrichir le smoke test actuel pour couvrir les états visibles de la page (titre, skeleton, grille, erreur/réessai) ou déléguer une partie des assertions à des tests co-localisés de `components/catalogue/`.
- **UPDATE** `app/globals.css` — centraliser les tokens de marque utiles à la grille (couleurs, éventuellement variables de police, arrondis/treatment complémentaires) au lieu de dupliquer des valeurs magiques dans les composants.
- **UPDATE potentielle** `app/layout.tsx` — seulement si nécessaire pour brancher Inter via `next/font` ou exposer des variables de police plus proches du `DESIGN.md`. Ne pas transformer le layout en composant client.
- **CREATE** `components/catalogue/` — dossier attendu pour les composants métier de la grille (`catalogue-page-client`, `catalogue-grid`, `catalogue-tile`, `catalogue-grid-skeleton`, voire `catalogue-error-state` si la séparation améliore la lisibilité).
- **DO NOT TOUCH** `lib/catalogue/` pour changer son contrat public ; cette story doit consommer le hook existant, pas le redéfinir.
- **DO NOT TOUCH** `next.config.ts` sauf si une nécessité absolue est démontrée ; l'approche recommandée ici est précisément d'éviter un chantier `next/image` / remote patterns.

### Testing Requirements

- UI tests ciblés : vérifier que la page rend le titre “Crounch”, la grille de tuiles en état `ready`, le skeleton en état `loading`, et l'état d'erreur avec bouton `Réessayer` en état `error`.
- Mock recommandé : `vi.mock("@/lib/catalogue", ...)` (ou le chemin réellement utilisé) pour injecter des retours contrôlés de `useCatalogue()` ; les tests de Story 1.4 ne doivent pas revalider le comportement interne du hook déjà couvert en Story 1.3.
- Couvrir explicitement le rendu d'une saveur archivée avec une fixture dédiée, car le dataset réel de 60 saveurs n'exerce pas cette branche aujourd'hui.
- Vérifier les classes/semantiques clés plutôt qu'un pixel-perfect fragile : présence du nombre correct de tuiles, du badge `archived`, du `alt` d'image, du bouton de retry, et des classes responsive principales.
- Validation finale attendue côté implémentation : `npm test`, `npm run build`, `npm run lint`.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.4`] — user story et acceptance criteria d'origine.
- [Source: `_bmad-output/planning-artifacts/prds/prd-brets-chips-checker-2026-07-29/prd.md#4.1 Catalogue des saveurs`] — FR-1 / FR-2, valeur produit de la grille visuelle.
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#Design Paradigm`] — découpage `app/`, `components/`, `lib/catalogue/`.
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-2 — Chargement du Catalogue : stale-while-revalidate, fraîcheur à source unique`] — `lib/catalogue/` seul propriétaire de la fraîcheur.
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-3 — Dégradation au premier lancement et sur réponse invalide`] — état d'erreur explicite et logique de retry, déjà livrés par Story 1.3.
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-4 — Aucun code serveur applicatif, frontière Client Component explicite`] — pas de logique serveur, frontière client claire.
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/DESIGN.md#Colors`] — palette Crounch.
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/DESIGN.md#Typography`] — Inter / Post No Bills / Recoleta/Fraunces, contraintes de chargement de fontes.
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/DESIGN.md#Components`] — chip-tile, badge archivée, skeleton, bouton primaire.
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/EXPERIENCE.md#Component Patterns`] — comportement attendu de la grille et des états.
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/EXPERIENCE.md#State Patterns`] — skeleton initial, hors-ligne sans cache, badge archivée.
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/EXPERIENCE.md#Responsive & Platform`] — breakpoints cibles 2-3 / 4-5 / 6+ colonnes.
- [Source: `_bmad-output/implementation-artifacts/1-3-chargement-du-catalogue-avec-cache-local-et-degradation-reseau.md`] — contrat réel de `useCatalogue()` et décisions de revue.
- [Source: `_bmad-output/specs/spec-crounch/SPEC.md#CAP-2`] — capacité produit “visualiser tout le Catalogue sous forme de grille visuelle”.
- [External: Next.js docs — Server and Client Components] — recommandation de pousser `'use client'` au plus bas niveau utile (consulté le 2026-07-31 via recherche web).

## Previous Story Intelligence

- Story 1.3 a livré `lib/catalogue/` complet : `useCatalogue()` retourne `{ data: Catalogue | null; status: "loading" | "ready" | "error"; error: string | null; retry: () => void }`. Cette story 1.4 ne doit pas changer ce contrat ; elle doit le **consommer tel quel**.
- `useCatalogue()` est déjà `'use client'`, lit le cache en initialiseur paresseux, déclenche sa revalidation réseau en `useEffect`, protège les mises à jour après unmount et compare la fraîcheur via `Date.parse(generatedAt)`. Toute logique UI qui tente de “compléter” ces règles dans `app/` ou `components/` créerait une seconde source de vérité.
- Story 1.2 a livré `lib/schema/` et garantit que chaque `Flavor` possède `id`, `name`, `image`, `status`. La grille peut donc se reposer sur ces champs sans validation supplémentaire côté présentation.
- Le commit principal de Story 1.3 (`021a36f`) a créé `lib/catalogue/cache.ts`, `fetch.ts`, `index.ts` et leurs tests ; le commit de correctifs (`71b835f`) a renforcé timeout réseau, garde anti-unmount et `'use client'` sur `cache.ts`. Ces patterns sont stables et doivent rester inchangés.
- Le dataset réel de Story 1.9 (`data/catalogue.json`) est maintenant disponible et contient 60 saveurs actives récupérées depuis `raw.githubusercontent.com/jsoulet/pokebrets/main/data/catalogue.json`. La grille de Story 1.4 est donc le premier rendu réel “taille production”, mais ne doit pas hardcoder ce volume.
- La page d'accueil actuelle ne consomme encore aucun composant métier ; Story 1.4 a donc la responsabilité de fixer le pattern structurel de la surface Catalogue pour les stories suivantes (1.5 toggle, 1.6 détail, 1.7 microcopy). Préserver une séparation claire entre shell de page, composant client, et sous-composants de grille limitera fortement le churn futur.

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (GitHub Copilot CLI)

### Debug Log References

- `npm test -- --run` → 110/110 tests passing (13 nouveaux : 3 `catalogue-tile`, 2 `catalogue-grid`, 1 `catalogue-grid-skeleton`, 3 `catalogue-page-client`, 2 `app/page.test.tsx` mis à jour), aucune régression.
- `npm run lint` → 0 erreur, 1 avertissement attendu (`@next/next/no-img-element` sur `catalogue-tile.tsx`) — intentionnel (voir Completion Notes).
- `npm run build` → succès, `/` toujours prérendu statiquement (`○ (Static)`). Vérifié que le HTML statique exporté (`out/index.html`) contient bien le skeleton (`role="status"`) au lieu de la grille : `localStorage` est indisponible côté Node pendant l'export, `readCache()` (Story 1.3) capture ce cas via son try/catch existant et retourne `null`, donc le hook démarre en `"loading"` — comportement correct pour du stale-while-revalidate en export statique.

### Completion Notes List

- Créé `components/catalogue/` avec 4 composants : `catalogue-tile.tsx` (présentation pure d'une Saveur), `catalogue-grid.tsx` (grille responsive, clé par `flavor.id`), `catalogue-grid-skeleton.tsx` (12 tuiles placeholder animées, `role="status"`), `catalogue-page-client.tsx` (`'use client'`, seul consommateur de `useCatalogue()`, projette `status`/`data`/`error`/`retry` sans jamais dupliquer la logique de fraîcheur).
- `app/page.tsx` reste un Server Component par défaut ; seul `CataloguePageClient` porte `'use client'` — la frontière client est poussée au plus bas niveau utile (Subtask 1.1, doc Next.js consultée pendant `create-story`).
- Décision technique : utilisation d'un `<img>` standard plutôt que `next/image`, car `next.config.ts` n'expose aucun `images.remotePatterns` (le Catalogue réel pointe vers `cms.brets.fr`) et l'app reste en `output: "export"`. ESLint signale l'avertissement attendu `@next/next/no-img-element`, laissé tel quel (0 erreur) — ouvrir la config `next/image` est explicitement hors scope de cette story (Subtask 3.4).
- Palette Crounch injectée directement dans les tokens shadcn existants (`app/globals.css`) : `--background` (crème `#FDF0DD`), `--primary` (moutarde `#DDA138`), `--accent` (rouge chips `#E8482C`), plus deux tokens ajoutés `--success`/`--archived` (`#3FA34D`/`#C9C2B4`) pour les badges (jamais de remplissage plein de tuile, anti-pattern "feu tricolore" explicitement rejeté par DESIGN.md).
- Typographie : `app/layout.tsx` charge désormais `Inter` via `next/font/google` (au lieu de `Geist`) pour le corps de texte, conformément à DESIGN.md. Les polices display (`Post No Bills Jaffna`/`Recoleta`) ne sont pas encore disponibles dans le repo (licence commerciale / absence d'assets auto-hébergés) — non bloquant pour cette story, `--font-heading` reste mappé sur `--font-sans` en attendant, sans hotlink CDN tiers. Point à revalider avec Johan si une fidélité typographique stricte est requise plus tard.
- Fixture de test dédiée avec une Saveur `archived` créée pour couvrir l'AC #2, car le dataset réel (`data/catalogue.json`, 60 saveurs) ne contient aujourd'hui que des Saveurs `active`.
- Les 3 états de `useCatalogue()` (`loading`/`ready`/`error`) sont testés en mockant le hook (`vi.mock("@/lib/catalogue", ...)`) — aucune re-validation de la logique interne du hook (déjà couverte par `lib/catalogue/index.test.tsx`, Story 1.3).
- Aucune nouvelle dépendance ajoutée — réutilisation de Tailwind v4, `components/ui/button.tsx` existant, et des primitives Testing Library déjà présentes.

### File List

- `app/page.tsx` — remplace le placeholder par la surface Catalogue réelle via `CataloguePageClient`.
- `app/page.test.tsx` — étendu : mock de `useCatalogue`, vérifie titre + skeleton.
- `app/layout.tsx` — `Geist` → `Inter` pour le corps de texte (police body de DESIGN.md).
- `app/globals.css` — tokens de marque Crounch (`--background`, `--primary`, `--accent`, `--success`, `--archived`) et mapping `@theme inline` associé.
- `components/catalogue/catalogue-tile.tsx` — nouveau, chip-tile de présentation.
- `components/catalogue/catalogue-tile.test.tsx` — nouveau, 3 tests.
- `components/catalogue/catalogue-grid.tsx` — nouveau, grille responsive.
- `components/catalogue/catalogue-grid.test.tsx` — nouveau, 2 tests.
- `components/catalogue/catalogue-grid-skeleton.tsx` — nouveau, skeleton de chargement.
- `components/catalogue/catalogue-grid-skeleton.test.tsx` — nouveau, 1 test.
- `components/catalogue/catalogue-page-client.tsx` — nouveau, frontière client consommant `useCatalogue()`.
- `components/catalogue/catalogue-page-client.test.tsx` — nouveau, 3 tests.

## Change Log

- 2026-07-31 : Story context créée pour la Story 1.4 (“Affichage du Catalogue en grille visuelle”). Analyse croisée epics / architecture / UX / PRD / code existant terminée ; guide développeur complet produit ; Status → `ready-for-dev`.
- 2026-07-31 : Implémentation de la grille Catalogue (`components/catalogue/`), branchement sur `useCatalogue()` (Story 1.3), identité visuelle Crounch (couleurs + police Inter). 13 nouveaux tests, 110/110 au total, `build`/`lint` propres. Status → `review`.
