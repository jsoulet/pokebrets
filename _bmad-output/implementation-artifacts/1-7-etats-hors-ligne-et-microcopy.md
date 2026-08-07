---
baseline_commit: d406e0309b8db2d13d6cade41a63de5e7ec4affd
---

# Story 1.7: États hors-ligne et microcopy

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a utilisateur (Johan),
I want des messages clairs et au ton léger dans les états hors-ligne ou de chargement,
so that je comprenne toujours ce qui se passe, sans jargon technique ni angoisse inutile.

## Acceptance Criteria

1. **Given** un Catalogue en cache et une perte de connexion **When** le rafraîchissement réseau échoue en arrière-plan **Then** une bannière discrète "Hors ligne — dernière version connue affichée" s'affiche, le toggle goûté/pas goûté restant utilisable normalement (UX-DR12)
2. **Given** un premier lancement sans cache et sans réseau **When** le fetch échoue **Then** l'état vide affiche "Impossible de charger le catalogue pour l'instant. Réessaie avec une connexion." avec un bouton "Réessayer" (UX-DR12, Story 1.3)
3. **And** l'ensemble des microcopies suit le ton léger défini (ex: "12/48 saveurs goûtées", jamais "Progression : 25% complétée") (UX-DR15)

## Tasks / Subtasks

- [x] Task 1: Étendre le contrat de `useCatalogue()` avec un signal "hors ligne" (AC #1)
  - [x] Subtask 1.1: Dans `lib/catalogue/index.ts`, ajouter un champ `isOffline: boolean` à `UseCatalogueResult` — vrai uniquement quand une révision de Catalogue est déjà détenue (`currentRevisionRef.current !== null`) ET que le dernier `revalidate()` en arrière-plan a échoué (branche `!result.success` existante, Subtask 4.4 de Story 1.3) ; jamais vrai tant qu'aucun cache n'existe (dans ce cas c'est `status === "error"` qui s'applique, AC #2, pas la bannière).
  - [x] Subtask 1.2: Initialiser `isOffline` à `false` (aucun échec constaté au tout premier rendu, y compris cache-first).
  - [x] Subtask 1.3: Remettre `isOffline` à `false` dans la branche de succès existante de `revalidate()` (dès qu'un fetch réussit et est appliqué, ou dès qu'un fetch réussit mais est ignoré comme plus ancien/égal — dans les deux cas le réseau répond, ce n'est plus "hors ligne").
  - [x] Subtask 1.4: Ne dupliquer aucune logique de fraîcheur/comparaison de révision en dehors de `lib/catalogue/` (AD-2) — `isOffline` est un simple booléen dérivé, calculé uniquement à l'intérieur du hook.
  - [x] Subtask 1.5: Étendre `lib/catalogue/index.test.tsx` : `isOffline` reste `false` par défaut (cache-first, chargement initial réussi) ; passe à `true` après un échec de revalidation en arrière-plan avec cache existant (network failure, non-2xx, JSON invalide — les 3 cas déjà couverts par les tests Subtask 5.5 existants) ; repasse à `false` dès qu'un `retry()`/refetch ultérieur réussit.
- [x] Task 2: Bannière "hors ligne" discrète dans `CataloguePageClient` (AC #1)
  - [x] Subtask 2.1: Dans `components/catalogue/catalogue-page-client.tsx`, afficher la bannière "Hors ligne — dernière version connue affichée" quand `status === "ready" && isOffline` (jamais dans les branches `loading`/`error`, qui gèrent déjà leurs propres états).
  - [x] Subtask 2.2: Positionner la bannière au-dessus de la grille (avant le compteur ou juste après, cohérent avec "bannière discrète en haut" de l'EXPERIENCE.md), avec un traitement visuel discret (ex: `bg-muted text-muted-foreground`, `rounded-lg`, texte petit) — jamais une couleur d'alerte/erreur vive (ce n'est pas un état bloquant, cf. `role="status"`, pas `role="alert"`).
  - [x] Subtask 2.3: Ne rien changer au comportement du toggle goûté/pas goûté ni à la Dialog de détail pendant que la bannière est visible — `handleToggleFlavor`, `handleOpenFlavorDetail` etc. restent inchangés et pleinement fonctionnels (AC #1 : "le toggle ... restant utilisable normalement").
  - [x] Subtask 2.4: Étendre `components/catalogue/catalogue-page-client.test.tsx` : la bannière n'apparaît pas quand `isOffline` est `false` (cas nominal déjà couvert implicitement, à vérifier explicitement) ; apparaît quand `isOffline` est `true` et `status === "ready"` ; le toggle reste fonctionnel (appelle `toggleTasted`) pendant que la bannière est affichée.
- [x] Task 3: Aligner le message de l'état vide (sans cache, sans réseau) sur le wording exact des ACs (AC #2)
  - [x] Subtask 3.1: Dans `lib/catalogue/index.ts`, remplacer le texte actuel de `ERROR_MESSAGE` ("Impossible de charger le catalogue, vérifie ta connexion") par le wording exact de l'AC #2 et d'UX-DR12 : **"Impossible de charger le catalogue pour l'instant. Réessaie avec une connexion."**
  - [x] Subtask 3.2: Ne pas changer le comportement ni le libellé du bouton "Réessayer" (`components/catalogue/catalogue-page-client.tsx`, déjà conforme).
  - [x] Subtask 3.3: Les tests existants dans `lib/catalogue/index.test.tsx` utilisent déjà une regex souple (`/Impossible de charger le catalogue/`) — aucune modification requise, mais vérifier qu'ils passent toujours après le changement de texte. Les tests de `catalogue-page-client.test.tsx` mockent directement la valeur d'`error` renvoyée par le hook (ils ne dépendent pas du texte réel de la constante) — aucune modification requise non plus, mais vérifier qu'ils passent toujours.
- [x] Task 4: Audit de microcopy — ton léger, jamais administratif (AC #3, UX-DR15)
  - [x] Subtask 4.1: Relire tous les textes visibles/accessibles actuellement affichés par l'app (compteur "X/N saveurs goûtées", badge "Archivée", badge "Goûtée", statuts "Active"/"Archivée" dans la Dialog, libellés des boutons "Marquer comme goûtée"/"pas goûtée", "Voir le détail de {Saveur}", "Fermer", aria-label du Skeleton "Chargement du catalogue", nouveau message d'état vide et nouvelle bannière hors ligne) et vérifier chacun contre le tableau Do/Don't d'`EXPERIENCE.md` (UX-DR15) — aucun vocabulaire administratif/corporate, ton à la première personne implicite.
  - [x] Subtask 4.2: Documenter explicitement dans les Completion Notes le résultat de cet audit (quels textes ont été vérifiés conformes, lesquels ont été corrigés) — même si aucune correction supplémentaire n'est nécessaire au-delà de la Task 3, l'audit doit être tracé.
- [x] Task 5: Validation complète
  - [x] Subtask 5.1: `npx vitest run` → 100% des tests (existants + nouveaux) verts, aucune régression sur les Stories 1.1 à 1.6.
  - [x] Subtask 5.2: `npm run lint` → 0 erreur (les 2 warnings `@next/next/no-img-element` déjà connus/acceptés restent attendus, aucun nouveau warning).
  - [x] Subtask 5.3: `npm run build` → succès, export statique intact (`○ (Static)`).
  - [x] Subtask 5.4: Mettre à jour ce fichier story (Tasks/Subtasks cochés, Dev Agent Record complet, Status → `review`).

## Dev Notes

- **Root cause à combler : le hook `useCatalogue()` n'expose actuellement AUCUN signal d'échec de revalidation en arrière-plan.** Lire `lib/catalogue/index.ts` (Story 1.3) ligne 46-82 : quand `revalidate()` échoue alors qu'une révision est déjà détenue (`currentRevisionRef.current !== null`), la ligne `setStatus((prevStatus) => (prevStatus === "loading" ? "error" : prevStatus))` **ne change rien** si le statut était déjà `"ready"` — le cache reste affiché silencieusement, exactement comme prévu par AD-3 ("Un échec de rafraîchissement en arrière-plan (cache existant) laisse le cache existant intact"), mais cela signifie qu'aujourd'hui **rien** ne permet à `CataloguePageClient` de savoir qu'un tel échec a eu lieu pour afficher la bannière de l'AC #1. C'est le cœur technique de cette story : ajouter ce signal dans le hook (seul propriétaire de la fraîcheur, AD-2), jamais le recalculer ailleurs.
- **`isOffline` est un nom de commodité, pas un diagnostic réseau précis** : comme pour le message d'erreur existant (AD-3), le hook ne distingue pas "vraiment hors ligne" (`navigator.onLine === false`) d'un autre type d'échec (500, JSON invalide) — les trois causes sont déjà traitées de façon identique par le contrat existant (`fetchCatalogue()` retourne `{ success: false }` pour les trois). `isOffline` doit simplement refléter "le dernier rafraîchissement en arrière-plan a échoué, le Catalogue affiché peut être périmé" — ne pas essayer d'ajouter une détection `navigator.onLine`, hors scope et non demandé par l'AC.
- **Ne pas confondre avec le `status === "error"` existant** (Story 1.3/1.4) : ce statut ne s'applique que lorsqu'**aucun cache n'existe** (AC #2 de cette story, wording à aligner). La bannière de l'AC #1 est un état strictement différent — Catalogue affiché normalement (`status === "ready"`), juste avec un indicateur discret que la dernière tentative de synchronisation a échoué. Les deux états ne se chevauchent jamais (un seul peut être vrai à la fois selon si une révision existe ou non).
- **Wording exact à respecter à la lettre** (cité tel quel dans les ACs de l'epic, source de vérité en cas de divergence avec un autre document) :
  - Bannière hors ligne (cache existant) : `"Hors ligne — dernière version connue affichée"`
  - État vide (aucun cache) : `"Impossible de charger le catalogue pour l'instant. Réessaie avec une connexion."` — **différent du texte actuellement codé en dur** (`"Impossible de charger le catalogue, vérifie ta connexion"`, cf. `lib/catalogue/index.ts:24`) : ce texte doit être mis à jour pour Task 3.
- **`useTasted()` (Story 1.5) reste totalement indépendant et inchangé** — le toggle goûté/pas goûté ne lit ni n'écrit jamais le Catalogue réseau, la bannière hors ligne n'a donc structurellement aucun impact sur lui ; l'AC #1 ("le toggle... restant utilisable normalement") est déjà garanti par la séparation des deux stores (AD-1) et ne nécessite aucun code défensif supplémentaire — juste ne pas gater le rendu de `CatalogueGrid`/`FlavorDetailDialog` derrière `!isOffline`.
- **Pas de nouvelle dépendance nécessaire.** Aucune bibliothèque de détection réseau (`navigator.onLine`, event `online`/`offline`) n'est requise — le signal vient uniquement du succès/échec du fetch déjà en place.

### Architecture Compliance

- **AD-2** (fraîcheur du Catalogue à source unique) : `isOffline` doit être calculé et exposé **uniquement** par `lib/catalogue/index.ts` — `CataloguePageClient` ne fait que lire ce booléen et le projeter, jamais le recalculer ou dupliquer une comparaison de révision.
- **AD-3** (dégradation au premier lancement et sur réponse invalide) : cette story ne change pas la classification "échec" (network/non-2xx/JSON invalide → tous identiques), elle ajoute seulement un signal de lecture pour l'UI dans le cas "cache existant". Le comportement "cache existant intact sur échec de rafraîchissement" reste strictement identique.
- **AD-4** (frontière Client Component) : `lib/catalogue/index.ts` est déjà `'use client'` (Story 1.3) — aucun changement de frontière nécessaire, tout le travail de cette story reste côté client.
- **AD-1** (frontière Catalogue ⇄ État de dégustation) : aucune jointure supplémentaire nécessaire — la bannière hors ligne ne référence aucune Saveur individuelle, c'est un état global du Catalogue.

### Library / Framework Requirements

- Aucune nouvelle dépendance. Tailwind CSS (classes utilitaires existantes : `bg-muted`, `text-muted-foreground`, `rounded-lg`) pour le style discret de la bannière, cohérent avec les tokens déjà définis dans `app/globals.css` (pas de nouveau token de couleur "warning"/"offline" à introduire — DESIGN.md ne prévoit rien de tel, réutiliser `muted` volontairement pour rester "discret").
- `role="status"` (pas `role="alert"`) pour la bannière — cohérent avec le traitement non-bloquant/non-urgent demandé ("bannière discrète").

### File Structure Requirements

- `lib/catalogue/index.ts` — MODIFIER (ajout `isOffline` au retour du hook, mise à jour de `ERROR_MESSAGE`). Ne jamais introduire de route API ni de logique serveur (AD-4, export statique).
- `lib/catalogue/index.test.tsx` — MODIFIER (nouveaux cas de test `isOffline`).
- `components/catalogue/catalogue-page-client.tsx` — MODIFIER (rendu conditionnel de la bannière).
- `components/catalogue/catalogue-page-client.test.tsx` — MODIFIER (nouveaux tests bannière + non-régression toggle).
- Ne pas toucher `lib/tasted/`, `components/catalogue/catalogue-tile.tsx`, `components/catalogue/catalogue-grid.tsx`, `components/catalogue/flavor-detail-dialog.tsx`, `components/ui/dialog.tsx`, `components/ui/button.tsx` — hors scope de cette story (aucune AC ne les concerne), sauf si l'audit de microcopy (Task 4) révèle une correction de texte ponctuelle, auquel cas la documenter explicitement dans les Completion Notes et le File List.

### Testing Requirements

- Vitest + Testing Library (React), conventions déjà établies dans `lib/catalogue/index.test.tsx` (`renderHook`, `waitFor`, `act` pour laisser les micro-tâches de promesses se résoudre) et `catalogue-page-client.test.tsx` (mock de `useCatalogue`/`useTasted` via `vi.mock`, focus sur la projection du contrat public du hook, jamais sa logique interne).
- Pas de nouvelle dépendance de test (`@testing-library/user-event` reste volontairement écarté, comme pour les Stories précédentes).
- Couvrir explicitement les 3 causes d'échec de revalidation en arrière-plan (network failure, non-2xx, JSON invalide) pour `isOffline` passant à `true`, en réutilisant le pattern déjà présent dans les 3 tests "Subtask 5.5" existants plutôt que d'en écrire des nouveaux redondants — étendre ces mêmes tests avec une assertion supplémentaire sur `result.current.isOffline` plutôt que dupliquer des `it(...)` entiers.
- Dans `catalogue-page-client.test.tsx`, mocker `useCatalogue` pour retourner `isOffline: true` avec `status: "ready"` et `data` non-null, vérifier la présence de la bannière ET que le clic sur un chip-tile appelle toujours `toggleTasted` normalement (non-régression AC #1).

## Previous Story Intelligence

- **Story 1.6** ("Détail d'une Saveur", `992b05f` puis revue de code `d406e03`) a étendu `catalogue-page-client.tsx` avec plusieurs états locaux (`selectedFlavorId`, `displayedFlavorId`, `detailTriggerRef`) coordonnant l'ouverture/fermeture de la Dialog — cette story 1.7 ajoute un état supplémentaire indépendant (la bannière hors ligne) dans le même composant : bien vérifier qu'aucune des branches de rendu conditionnelles existantes (`status === "loading"`, `status === "error"`, puis le rendu `"ready"` avec grille + Dialog) n'est cassée par l'ajout d'une nouvelle branche de rendu conditionnel à l'intérieur du cas `"ready"`.
- La revue de code de Story 1.6 a introduit un helper partagé `components/catalogue/flavor-image-fallback.ts` et a établi la convention de réutiliser `components/ui/button.tsx` pour tout nouveau bouton — cette story 1.7 n'introduit aucun nouveau bouton (la bannière est un texte informatif, pas interactif), donc cette convention ne s'applique pas ici, mais rester cohérent avec le style général (`data-slot`, `cn()`) si un composant dédié est extrait pour la bannière plutôt que du JSX inline.
- Convention de test établie sur plusieurs stories consécutives (1.3 à 1.6) : toujours étendre les fichiers de test existants avec des cas supplémentaires plutôt que créer de nouveaux fichiers de test parallèles pour la même unité — suivre ce pattern ici (`lib/catalogue/index.test.tsx`, `components/catalogue/catalogue-page-client.test.tsx`), ne pas créer de nouveaux fichiers de test.
- Story 1.6 a par ailleurs mis en évidence (revue de code) l'importance de bien relire le fichier réellement modifié avant de coder de nouvelles branches d'état — appliquer la même rigueur ici en relisant `lib/catalogue/index.ts` en entier (déjà fait dans ces Dev Notes) avant de toucher au contrat du hook.

## Git Intelligence Summary

- Commits récents pertinents : `d406e03` (revue de code Story 1.6 — introduit le pattern `onOpenChangeComplete`/état dérivé dans `catalogue-page-client.tsx`, à titre d'exemple de state management supplémentaire dans ce même composant), `992b05f` (Story 1.6 initiale), `9dbb72c`/`e1f3aa9` (Story 1.5 — `lib/tasted/`, non concerné par cette story), `71b835f`/`021a36f` (Story 1.3 — `lib/catalogue/index.ts` original, le fichier central de cette story 1.7).
- Aucun changement de dépendances (`package.json`) dans les commits récents — cohérent avec le fait que cette story n'introduit aucune nouvelle librairie.
- Convention de message de commit observée : `feat(<scope>): story X.Y - <titre>` pour l'implémentation initiale, `fix(<scope>): story X.Y code review - <résumé>` pour les corrections de revue — à suivre pour cette story (`feat(catalogue): story 1.7 - états hors-ligne et microcopy`).

## Latest Technical Information

- Aucune recherche externe nécessaire pour cette story : elle ne touche à aucune nouvelle bibliothèque ni API externe. Tout le travail se fait avec les outils déjà en place (`fetch`, `localStorage` via `lib/catalogue/cache.ts`, React state/hooks, Tailwind).

## Project Context Reference

- Aucun `project-context.md` n'a été détecté dans le repo lors de l'activation de ce workflow (cohérent avec les stories précédentes). Toute la context intelligence exploitable pour Story 1.7 provient des artefacts BMad (`epics.md`, `ARCHITECTURE-SPINE.md`, `EXPERIENCE.md`, `DESIGN.md`), du code courant (`lib/catalogue/index.ts`, `components/catalogue/catalogue-page-client.tsx`) et de l'historique Git récent.

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (GitHub Copilot CLI)

### Debug Log References

### Completion Notes List

- **Task 1** (hook contract) : ajouté `isOffline: boolean` à `UseCatalogueResult` dans `lib/catalogue/index.ts` — dérivé exclusivement à l'intérieur du hook (AD-2), initialisé à `false`, mis à `true` uniquement dans la branche existante `!result.success` quand `currentRevisionRef.current !== null` (les 3 causes réseau/non-2xx/JSON-invalide sont déjà unifiées en amont par `fetchCatalogue()`), remis à `false` dans la branche succès (application ou ignorance d'une réponse plus ancienne — le réseau répond dans les deux cas). TDD strict : les 5 nouvelles assertions (`isOffline`) ont d'abord été ajoutées et vérifiées en échec (RED) avant l'implémentation (GREEN). Réutilisé les 3 tests Subtask 5.5 existants (network failure, non-2xx, JSON invalide) avec une assertion `isOffline` supplémentaire plutôt que de dupliquer des `it()`, plus 2 nouveaux tests (`isOffline` reste `false` sans cache ; repasse à `false` après un `retry()` réussi).
- **Task 2** (bannière) : ajouté un rendu conditionnel `status === "ready" && isOffline` dans `catalogue-page-client.tsx`, `role="status"` (jamais `role="alert"`), styles `bg-muted`/`text-muted-foreground` (aucun nouveau token couleur introduit, conforme DESIGN.md). 4 nouveaux tests dans `catalogue-page-client.test.tsx` : absence de bannière si `isOffline: false`, présence + non-alerte si `isOffline: true`, et non-régression explicite du toggle (`toggleTasted` toujours appelé) pendant que la bannière est affichée.
- **Task 3** (wording état vide) : `ERROR_MESSAGE` mis à jour dans `lib/catalogue/index.ts` avec le texte exact de l'AC #2/UX-DR12 ("Impossible de charger le catalogue pour l'instant. Réessaie avec une connexion."). Les tests de `lib/catalogue/index.test.tsx` utilisaient déjà une regex souple, aucune modification nécessaire. Les mocks de `catalogue-page-client.test.tsx` et `app/page.test.tsx` codaient en dur l'ancien texte comme valeur mockée d'`error` — mis à jour pour rester cohérents avec le nouveau texte réel, bien que ce ne soit pas strictement requis (le composant ne fait qu'afficher la prop mockée).
- **Task 4** (audit microcopy, AC #3/UX-DR15) : relecture de tous les textes visibles/accessibles de l'app face au tableau Do/Don't d'`EXPERIENCE.md`. Résultat de l'audit :
  - Conformes sans modification : compteur "X/N saveurs goûtées" (déjà l'exemple canonique du Do), bouton "Réessayer", boutons "Marquer comme goûtée"/"pas goûtée", `aria-label` "Voir le détail de {Saveur}", `aria-label` du Skeleton "Chargement du catalogue", nouvelle bannière hors ligne (texte identique à l'exemple Do d'EXPERIENCE.md), `aria-label` "Fermer" du bouton de fermeture de la Dialog, statut "Active" dans la Dialog.
  - **Écart trouvé et corrigé (validé avec l'utilisateur avant modification, hors scope initial de la story mais justifié par l'audit)** : le badge "Archivée" (`catalogue-tile.tsx` et `flavor-detail-dialog.tsx`) ne suivait pas le wording explicitement recommandé par le tableau Do/Don't d'EXPERIENCE.md ("Cette saveur n'est plus produite" vs le Don't "STATUT : DISCONTINUÉ"). Remplacé "Archivée" par "Cette saveur n'est plus produite" dans les deux composants. Les tests existants (`catalogue-tile.test.tsx`, `flavor-detail-dialog.test.tsx`) utilisaient une regex souple `/archiv/i` qui ne matche plus le nouveau texte — mis à jour vers `/n'est plus produite/i`, sans changer la structure des tests (toujours "texte porté, pas seulement couleur").
- **Task 5** (validation) : `npx vitest run` → 179/179 verts (aucune régression 1.1-1.6). `npm run lint` → 0 erreur, 2 warnings `@next/next/no-img-element` déjà connus/acceptés. `npm run build` → succès, export statique intact (`○ (Static)`).

### File List

- `lib/catalogue/index.ts` — MODIFIÉ (ajout `isOffline` au contrat et à la logique de `revalidate()`, mise à jour du texte `ERROR_MESSAGE`).
- `lib/catalogue/index.test.tsx` — MODIFIÉ (assertions `isOffline` ajoutées aux 3 tests Subtask 5.5 existants + 2 nouveaux tests).
- `components/catalogue/catalogue-page-client.tsx` — MODIFIÉ (rendu conditionnel de la bannière hors ligne).
- `components/catalogue/catalogue-page-client.test.tsx` — MODIFIÉ (mocks étendus avec `isOffline`, 4 nouveaux tests bannière, wording d'erreur aligné).
- `app/page.test.tsx` — MODIFIÉ (mock `useCatalogue` étendu avec `isOffline: false`, requis par le nouveau contrat de type).
- `components/catalogue/catalogue-tile.tsx` — MODIFIÉ (audit microcopy Task 4 : badge archivée reformulé).
- `components/catalogue/catalogue-tile.test.tsx` — MODIFIÉ (assertions ajustées au nouveau texte du badge archivée).
- `components/catalogue/flavor-detail-dialog.tsx` — MODIFIÉ (audit microcopy Task 4 : statut archivé reformulé).
- `components/catalogue/flavor-detail-dialog.test.tsx` — MODIFIÉ (assertion ajustée au nouveau texte du statut archivé).

## Change Log

- {date} — Implémentation initiale Story 1.7 : signal `isOffline` dans `useCatalogue()`, bannière hors ligne discrète dans `CataloguePageClient`, alignement du wording de l'état vide sur l'AC #2, audit microcopy complet (correction du badge "Archivée" → "Cette saveur n'est plus produite" suite à l'audit Task 4, validé avec l'utilisateur). 179/179 tests verts, lint et build OK.
