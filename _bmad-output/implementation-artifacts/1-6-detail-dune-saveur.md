---
epic_num: 1
story_num: 6
story_key: 1-6-detail-dune-saveur
baseline_commit: 9dbb72c892ce8efaafea658dd3b256b57c035cdb
inputDocuments:
  - '_bmad-output/planning-artifacts/epics.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/EXPERIENCE.md'
  - '_bmad-output/planning-artifacts/prds/prd-brets-chips-checker-2026-07-29/prd.md'
  - '_bmad-output/specs/spec-crounch/SPEC.md'
  - '_bmad-output/implementation-artifacts/1-3-chargement-du-catalogue-avec-cache-local-et-degradation-reseau.md'
  - '_bmad-output/implementation-artifacts/1-4-affichage-du-catalogue-en-grille-visuelle.md'
  - '_bmad-output/implementation-artifacts/1-5-marquer-une-saveur-comme-goutee-et-persister-letat.md'
---

# Story 1.6: Détail d'une Saveur

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a utilisateur (Johan),
I want ouvrir un détail agrandi d'une Saveur (visuel, nom, statut) sans changer son état goûté/pas goûté,
so that je puisse vérifier visuellement que c'est bien la bonne saveur avant de cocher, en cas de doute en rayon.

## Acceptance Criteria

1. **Given** une chip-tile dans la grille, **When** l'utilisateur tape sur son icône info (pas sur la tuile elle-même), **Then** une Dialog s'ouvre avec le visuel agrandi, le nom, le statut (active/archivée), et un bouton pour basculer l'état goûté/pas goûté (FR2, FR3, UX-DR9).
2. **Given** la Dialog ouverte, **When** l'utilisateur tape en dehors ou appuie sur Échap, **Then** la Dialog se ferme sans changer l'état goûté/pas goûté (sauf action explicite sur le bouton toggle) (FR3, UX-DR9, UX-DR14).
3. **And** la Dialog est pilotable au clavier (Tab, Enter, Échap) pour l'usage desktop (NFR3, UX-DR14).

## Tasks / Subtasks

- [x] Task 1: Confirmer la primitive Dialog réellement disponible et créer le wrapper UI canonique du projet (AC: #1, #2, #3)
  - [x] Subtask 1.1: Réutiliser l'implémentation installée `@base-ui/react@^1.6.0` : l'investigation locale a confirmé l'export `Dialog` via `node_modules/@base-ui/react/dialog/index.d.ts` et `index.parts.d.ts`, avec les parts `Root`, `Trigger`, `Portal`, `Backdrop`, `Viewport`, `Popup`, `Title`, `Description`, `Close`.
  - [x] Subtask 1.2: Créer `components/ui/dialog.tsx` dans le style déjà utilisé par `components/ui/button.tsx` (wrapper léger + `cn()` + `data-slot` stables), en composant `DialogPrimitive.Root`, `Portal`, `Backdrop`, `Viewport`, `Popup`, `Title`, `Description`, `Close` — ne pas ajouter Radix, Headless UI, Reach UI, ni une implémentation maison concurrente.
  - [x] Subtask 1.3: Implémenter `DialogContent` autour de `Portal + Backdrop + Viewport + Popup`, avec `modal` laissé à sa valeur par défaut (`true`) pour obtenir focus trap, verrouillage du scroll et dismissal standard ; prévoir une vraie action `DialogClose` dans le popup, recommandée par la doc Base UI quand `modal` est activé.
  - [x] Subtask 1.4: Exposer dans le wrapper les props utiles déjà vérifiées dans les types locaux (`open`, `onOpenChange`, `initialFocus`, `finalFocus`) afin de supporter le retour de focus au trigger info sans code de focus-trap manuel.

- [x] Task 2: Restructurer `catalogue-tile.tsx` pour accueillir deux actions sœurs valides en HTML, sans régression sur le toggle principal (AC: #1, #2)
  - [x] Subtask 2.1: Remplacer la structure actuelle “`<li>` + un seul `<button>` occupant toute la tuile” par une tuile contenant **deux éléments interactifs frères** : le bouton principal de toggle goûté/pas goûté et un petit bouton info dédié au détail. Aucun `button` ne doit être imbriqué dans un autre.
  - [x] Subtask 2.2: Positionner le bouton info dans un coin qui n'entre pas en conflit avec le badge `Goûtée` déjà absolu en `top-right` depuis Story 1.5. Recommandation explicite : bouton info en `top-left`, badge `Goûtée` conservé en `top-right`, badge `Archivée` restant textuel sous le nom (ou à une autre position non conflictuelle), pour éviter tout recouvrement visuel.
  - [x] Subtask 2.3: Préserver tous les acquis de Story 1.4/1.5 : fond neutre de la tuile (`bg-background` / `bg-archived`), image avec fallback `/placeholder-flavor.svg`, `aria-pressed` sur l'action principale, `line-clamp-2`, badge `Archivée` textuel, badge `Goûtée` en coin, aucune tuile pleine verte.
  - [x] Subtask 2.4: Garantir que le clic/tap sur l'icône info n'appelle jamais `onToggle` (pas de propagation involontaire). Le bouton principal reste l'unique surface qui bascule l'état au niveau de la tuile.
  - [x] Subtask 2.5: Conserver des zones de tap ≥ 44×44px pour les deux actions interactives (NFR4), y compris pour le bouton info compact.

- [x] Task 3: Construire le composant métier de détail de saveur en réutilisant l'état existant, sans créer de second store (AC: #1, #2, #3)
  - [x] Subtask 3.1: Créer `components/catalogue/flavor-detail-dialog.tsx` (nom recommandé) comme composant de domaine recevant au minimum `flavor`, `open`, `onOpenChange`, `isTasted`, `onToggle`, et la cible de `finalFocus` à restaurer au close.
  - [x] Subtask 3.2: Le contenu de la Dialog doit rendre : image agrandie, nom de la saveur, badge/statut textuel (`Active` ou `Archivée`), bouton de toggle goûté/pas goûté, et un contrôle de fermeture explicite (`DialogClose`). Le rôle accessible attendu est celui d'un vrai `dialog` modal, pas une simple carte flottante.
  - [x] Subtask 3.3: Le bouton de toggle de la Dialog doit appeler **la même chaîne de mutation** que la tuile (`toggleTasted()` déjà orchestré depuis `CataloguePageClient`) pour rester synchrone avec le badge, le compteur et la persistance Story 1.5/FR4. Aucune duplication d'état local “goûtée/non goûtée” dans la Dialog.
  - [x] Subtask 3.4: L'ouverture et la fermeture de la Dialog ne doivent jamais modifier l'état goûté/pas goûté ; seul le bouton explicite de toggle dans la Dialog déclenche la mutation.
  - [x] Subtask 3.5: Garder une microcopy simple et cohérente avec le ton existant (ex: bouton “Marquer comme goûtée” / “Marquer comme pas goûtée”), sans jargon ni vocabulaire corporate.

- [x] Task 4: Orchestrer l'ouverture, la fermeture et le retour de focus depuis la surface Catalogue existante (AC: #1, #2, #3)
  - [x] Subtask 4.1: Faire de `components/catalogue/catalogue-page-client.tsx` le coordinateur de l'ouverture de détail, car il possède déjà la source de vérité UI croisée (`useCatalogue()`, `toggleTasted()`, compteur, `aria-live`). Ajouter un état `selectedFlavorId` (ou `selectedFlavor`) et mémoriser l'élément trigger info qui a ouvert la Dialog.
  - [x] Subtask 4.2: Étendre `components/catalogue/catalogue-grid.tsx` pour relayer un callback pur de type `onOpenFlavorDetail(flavorId, triggerElement)` vers chaque tuile, sans lui faire posséder l'état d'ouverture.
  - [x] Subtask 4.3: Dans `CataloguePageClient`, rendre **une seule** `FlavorDetailDialog` contrôlée, alimentée par la saveur sélectionnée. Cette approche évite de disperser 60 états d'ouverture, garde le retour de focus centralisé, et laisse l'annonce `aria-live` unique au niveau déjà existant.
  - [x] Subtask 4.4: Utiliser `Dialog.Popup` avec `finalFocus={() => lastInfoTriggerElement}` (API confirmée dans `node_modules/@base-ui/react/dialog/popup/DialogPopup.d.ts`) pour renvoyer le focus sur le bouton info qui a ouvert la Dialog après fermeture via backdrop, Échap ou close explicite.
  - [x] Subtask 4.5: Préserver la logique d'annonce Story 1.5 : la Dialog ne crée **pas** sa propre région `aria-live`. Elle appelle le même `handleToggleFlavor()` que la grille afin que l'annonce “{Nom}, goûtée/pas goûtée” continue de provenir du coordinateur existant, sans double annonce.

- [x] Task 5: Couvrir le comportement en TDD et valider l'absence de régression sur la surface Catalogue (AC: #1, #2, #3)
  - [x] Subtask 5.1: Écrire d'abord des tests rouges pour la nouvelle structure de `CatalogueTile` : deux boutons distincts, clic sur info n'appelle pas `onToggle`, maintien de `aria-pressed` et des badges existants.
  - [x] Subtask 5.2: Ajouter une suite dédiée `components/catalogue/flavor-detail-dialog.test.tsx` (recommandé) ou étendre fortement `catalogue-page-client.test.tsx` pour vérifier : ouverture depuis le bouton info, rôle `dialog`, rendu du visuel agrandi, du nom, du statut, et du bouton de toggle.
  - [x] Subtask 5.3: Tester explicitement les fermetures sans mutation : clic backdrop/outside, touche `Escape`, et fermeture explicite. L'assertion clef est que `toggleTasted`/`onToggleFlavor` ne soit **pas** appelé tant que l'utilisateur n'active pas le bouton de toggle dans la Dialog.
  - [x] Subtask 5.4: Tester l'accessibilité clavier en restant dans la stack réellement installée (`@testing-library/react`, `fireEvent`, Vitest) : focus sur le bouton info, `Enter` ouvre, `Tab` parcourt les contrôles du dialog, `Escape` ferme, focus restitué au trigger info.
  - [x] Subtask 5.5: Vérifier les régressions Story 1.5 : le bouton principal de la tuile toggle toujours correctement, le compteur `X/N saveurs goûtées` continue de se mettre à jour, l'annonce `aria-live` reste unique, et les états `loading` / `error` de `CataloguePageClient` ne changent pas.
  - [x] Subtask 5.6: Exécuter au minimum les suites ciblées de `components/catalogue/` et `app/page.test.tsx`, puis `npm test`, `npm run build` et `npm run lint` avant de passer en review. Ne pas ajouter `@testing-library/user-event` : le repo ne l'a pas aujourd'hui.

## Dev Notes

- **Portée stricte de la story** : cette story ajoute le **détail de saveur en Dialog** et une **action info distincte**. Elle ne remplace pas la grille, ne touche pas à `lib/catalogue/`, ne redéfinit pas `lib/tasted/`, et ne crée pas de nouvelle navigation pleine page. Le détail reste une surcouche du Catalogue, jamais une route séparée. [Source: `_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/EXPERIENCE.md#Information Architecture`, `#Interaction Primitives`]
- **Décision architecturale actée pour la Dialog** : **utiliser `@base-ui/react` Dialog via un wrapper `components/ui/dialog.tsx`**, pas une modale maison. L'investigation locale confirme la disponibilité réelle de la primitive (`@base-ui/react/dialog/index.d.ts`, `index.parts.d.ts`) et de ses APIs de focus (`DialogPopup.d.ts` : `initialFocus`, `finalFocus`; `DialogRoot.d.ts` : `modal`, `onOpenChange`). Une implémentation custom focus-trap/backdrop/escape serait plus risquée, redondante, et non alignée avec la base UI déjà adoptée par `components/ui/button.tsx`. [Source: `package.json`, `components/ui/button.tsx`, `node_modules/@base-ui/react/dialog/index.d.ts`, `node_modules/@base-ui/react/dialog/popup/DialogPopup.d.ts`, `node_modules/@base-ui/react/dialog/root/DialogRoot.d.ts`]
- **Raison de la centralisation dans `CataloguePageClient`** : le composant coordonne déjà `useCatalogue()` + `useTasted()`, le compteur et l'annonce `aria-live`. Le détail doit réutiliser cette couche de coordination pour ne pas dupliquer la logique de toggle/annonce. Cela permet aussi de garder une seule Dialog contrôlée et un retour de focus maîtrisé vers le trigger info. [Source: `components/catalogue/catalogue-page-client.tsx`]
- **État actuel des fichiers UPDATE à connaître avant implémentation** :
  - `components/catalogue/catalogue-tile.tsx` rend aujourd'hui un `<li>` avec **un seul** bouton couvrant la tuile ; il porte l'image, le nom, le badge `Archivée` inline, et le badge `Goûtée` absolu en `top-right`. C'est précisément la contrainte HTML à faire évoluer pour Story 1.6.
  - `components/catalogue/catalogue-grid.tsx` est une projection pure de `flavors`, `tastedIds`, `onToggleFlavor`. Il ne connaît ni `localStorage`, ni détail de saveur, ni état d'ouverture.
  - `components/catalogue/catalogue-page-client.tsx` gère `loading` / `error` / `ready`, calcule `X/N`, et annonce les toggles via `aria-live`. Rien dans ce composant ne doit être perdu en ajoutant la Dialog.
  - `app/page.tsx` reste un shell serveur minimal qui monte `CataloguePageClient` ; la story ne doit pas faire remonter la logique client jusque-là.
- **Invariants d'architecture à préserver** :
  - **AD-1** : toute jointure Catalogue ⇄ état goûté continue de se faire par `flavor.id`, jamais par index.
  - **AD-4** : aucun code serveur, aucune route API, aucun accès `window`/`localStorage` en dehors des frontières client déjà établies.
  - **AD-7** : réutiliser le type `Flavor` existant (`id`, `name`, `image`, `status`) ; ne pas inventer une forme parallèle de “flavor detail”.
  - **AD-8** : toute mutation du goûté passe par la fonction canonique de `lib/tasted/`, via `toggleTasted()` déjà exposé par `useTasted()`.
- **Comportement d'ouverture/fermeture attendu** :
  - Le **clic sur info** ouvre la Dialog et **ne toggle pas**.
  - Le **clic sur la tuile** continue à toggle comme en Story 1.5 et **n'ouvre pas** la Dialog.
  - **Backdrop/outside click**, **Échap**, ou **close button** ferment la Dialog sans side effect métier.
  - **Enter** active le contrôle actuellement focusé (info trigger, bouton toggle, close).
  - **Tab** reste piégé dans le dialog tant qu'il est ouvert, conformément au mode modal de Base UI.
- **Détail visuel recommandé dans la Dialog** : grand visuel en haut, titre/nom visible, badge de statut textuel. La distinction `active` / `archived` doit être lisible sans dépendre de la seule couleur. Pour `archived`, réutiliser le vocabulaire déjà présent dans la grille (“Archivée”). Pour `active`, une pilule neutre “Active” suffit ; inutile d'inventer un nouveau code couleur fort.
- **Ne pas dupliquer les annonces d'accessibilité** : la Story 1.5 a déjà installé une région `aria-live="polite"` dans `CataloguePageClient`. Le bouton de toggle de la Dialog doit remonter dans la même fonction de coordination (`handleToggleFlavor`) afin que l'annonce parte une seule fois. Ajouter une seconde région `aria-live` dans `FlavorDetailDialog` créerait un doublon.
- **Point d'attention CSS/positionnement** : avec un bouton info absolu dans la tuile, il faut réserver suffisamment d'espace dans le layout interne du bouton principal pour éviter de masquer l'image ou de rendre un coin inatteignable. Préserver également l'absence de conflit avec le badge `Goûtée` absolu en coin opposé. [Source: `components/catalogue/catalogue-tile.tsx`, `_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/DESIGN.md#Components`]
- **Pas de nouvelle dépendance de test** : les tests actuels utilisent `render`, `screen`, `fireEvent`, `vi.mock`, sans `@testing-library/user-event`. Rester cohérent avec cette stack ; ne pas ajouter une dépendance juste pour Story 1.6. [Source: `package.json`, `components/catalogue/*.test.tsx`, `app/page.test.tsx`]

### Architecture Compliance

- **AD-1 — Frontière de données** : la Dialog reçoit une `Flavor` existante et l'état goûté dérivé du store existant ; elle ne stocke rien par index ni par copie locale.
- **AD-4 — Frontière client explicite** : `components/ui/dialog.tsx` et `FlavorDetailDialog` s'exécutent côté client parce qu'ils s'appuient sur Base UI / interactions DOM, mais `app/page.tsx` reste Server Component. Aucun accès direct à `localStorage` n'est ajouté hors `lib/tasted/`.
- **AD-7 — Schéma partagé** : le détail ne rajoute aucun champ ad hoc ; il consomme uniquement `Flavor` (`id`, `name`, `image`, `status`) depuis `lib/schema/`.
- **AD-8 — Mutation canonique** : le toggle depuis la Dialog appelle le même `toggleTasted()` que la tuile. Aucune écriture parallèle du stockage ni second hook spécialisé “detail tasted state”.
- **NFR3 / UX-DR14** : pilotage clavier complet, rôle dialog réel, focus trap, retour de focus au trigger, statut `Archivée` annoncé textuellement, pas seulement coloré.
- **NFR4** : les deux actions de la tuile (toggle principal, info) restent praticables sur mobile avec une cible de tap suffisante.

### Library / Framework Requirements

- **Primitive imposée** : `@base-ui/react/dialog` installé localement via `@base-ui/react@^1.6.0`.
- **API confirmée** :
  - `Dialog.Root` supporte `open`, `onOpenChange`, `modal` (`true` par défaut). [Source: `node_modules/@base-ui/react/dialog/root/DialogRoot.d.ts`]
  - `Dialog.Popup` supporte `initialFocus` et `finalFocus`. [Source: `node_modules/@base-ui/react/dialog/popup/DialogPopup.d.ts`]
  - `Dialog.Trigger` rend un vrai `<button>`. [Source: `node_modules/@base-ui/react/dialog/trigger/DialogTrigger.d.ts`]
  - `Dialog.Close` existe et rend un vrai `<button>`. [Source: `node_modules/@base-ui/react/dialog/close/DialogClose.d.ts`]
- **Convention de wrapper** : suivre le pattern de `components/ui/button.tsx` (wrapper fin autour de primitives Base UI, `cn()`, variants/classes Tailwind, `data-slot`). Pas de fichier `components/ui/dialog.tsx` généré ailleurs dans le repo aujourd'hui ; Story 1.6 devient le point de départ de cette convention pour les overlays.
- **Compatibilité Next.js 16 / export statique** : aucun besoin de `next/dynamic`, de Server Action, ni de route dédiée. La Dialog vit entièrement dans l'arbre client déjà monté par `CataloguePageClient`.
- **Icône info** : réutiliser `lucide-react` déjà installé pour l'icône (ex: `Info` ou équivalent), au lieu d'ajouter un autre pack d'icônes.

### File Structure Requirements

- **CREATE** `components/ui/dialog.tsx` — wrapper shadcn-like autour de `@base-ui/react/dialog`.
- **CREATE** `components/catalogue/flavor-detail-dialog.tsx` — composant métier de détail, branché sur le wrapper UI.
- **CREATE** `components/catalogue/flavor-detail-dialog.test.tsx` — couverture dédiée du dialog (recommandé pour éviter de surcharger un seul test file).
- **UPDATE** `components/catalogue/catalogue-tile.tsx` — nouvelle structure DOM à deux actions sœurs ; wiring du bouton info.
- **UPDATE** `components/catalogue/catalogue-tile.test.tsx` — assertions sur les deux boutons, absence de propagation, coexistence des badges.
- **UPDATE** `components/catalogue/catalogue-grid.tsx` — relayage du callback d'ouverture de détail.
- **UPDATE** `components/catalogue/catalogue-grid.test.tsx` — relayage du callback detail en plus du toggle si nécessaire.
- **UPDATE** `components/catalogue/catalogue-page-client.tsx` — état de dialog contrôlée, sélection de saveur, retour de focus, composition `FlavorDetailDialog`.
- **UPDATE** `components/catalogue/catalogue-page-client.test.tsx` — ouverture/fermeture/toggle via dialog, maintien compteur/annonce.
- **UPDATE potentielle** `app/page.test.tsx` — uniquement si le smoke test doit s'adapter à la nouvelle structure ou à de nouveaux mocks internes ; éviter tout élargissement inutile.
- **DO NOT TOUCH** `lib/tasted/index.ts`, `lib/tasted/cache.ts`, `lib/catalogue/*`, `lib/schema/*` pour changer leur contrat public. Story 1.6 consomme ces APIs ; elle ne les redéfinit pas.

### Testing Requirements

- Conserver Vitest + Testing Library déjà présents ; ne pas introduire `userEvent`.
- Favoriser des tests de comportement à trois niveaux :
  1. **Tile** : deux actions distinctes, pas de button-in-button, pas de propagation info → toggle.
  2. **Dialog métier** : rôle `dialog`, contenu (image, nom, statut, bouton toggle, close), dismissal sans mutation.
  3. **Page client** : intégration complète avec compteur + `aria-live` + retour de focus au trigger.
- Assertions clés à écrire :
  - `getByRole("button", { name: /info|détail/i })` ouvre le dialog.
  - `getByRole("dialog")` devient visible avec le bon nom de saveur.
  - bouton toggle de dialog appelle `toggleTasted`/`handleToggleFlavor` exactement une fois.
  - `fireEvent.keyDown(document, { key: "Escape" })` ferme sans mutation.
  - clic backdrop/outside ferme sans mutation.
  - `document.activeElement` revient sur le bouton info ayant ouvert la Dialog.
  - le compteur `X/N saveurs goûtées` et l'annonce `aria-live` restent exacts après toggle depuis la Dialog.
- Validation finale attendue : suites ciblées `components/catalogue/*`, puis `npm test`, `npm run build`, `npm run lint`.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.6`] — user story et acceptance criteria exacts.
- [Source: `_bmad-output/planning-artifacts/prds/prd-brets-chips-checker-2026-07-29/prd.md#4.1 Catalogue des saveurs`] — FR2 (visualisation des saveurs).
- [Source: `_bmad-output/planning-artifacts/prds/prd-brets-chips-checker-2026-07-29/prd.md#4.2 Suivi de dégustation`] — FR3 / FR4 (toggle et persistance à réutiliser depuis la Dialog).
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-1 — Frontière de données Catalogue ⇄ État de dégustation`] — jointure par `flavor.id`, jamais par index.
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-4 — Aucun code serveur applicatif, frontière Client Component explicite`] — frontière client minimale, pas de logique serveur.
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-7 — Schéma partagé et versionné (Catalogue, Saveur, État de dégustation)`] — réutilisation de `Flavor` / `lib/schema/`.
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md#AD-8 — Mutation atomique de l'État de dégustation`] — obligation de passer par la mutation canonique existante.
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/DESIGN.md#Components`] — chip-tile, badge goûtée, badge archivée, Dialog dans le design system visé.
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/DESIGN.md#Do's and Don'ts`] — vert réservé au badge, jamais au fond de la tuile.
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/EXPERIENCE.md#Information Architecture`] — le détail est une Dialog, jamais une page séparée.
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/EXPERIENCE.md#Component Patterns`] — icône info distincte, bouton de toggle redondant dans la Dialog.
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/EXPERIENCE.md#Interaction Primitives`] — outside click / Échap ferment le détail.
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/EXPERIENCE.md#Accessibility Floor`] — Tab / Enter / Échap, lecteur d'écran, cible de tap.
- [Source: `_bmad-output/specs/spec-crounch/SPEC.md#Capabilities`] — CAP-2, CAP-3, CAP-4.
- [Source: `_bmad-output/implementation-artifacts/1-4-affichage-du-catalogue-en-grille-visuelle.md`] — structure `CataloguePageClient` / `CatalogueGrid` / `CatalogueTile` et contraintes visuelles déjà fixées.
- [Source: `_bmad-output/implementation-artifacts/1-5-marquer-une-saveur-comme-goutee-et-persister-letat.md`] — `useTasted()`, compteur, annonce `aria-live`, badge `Goûtée`, commentaire anticipant Story 1.6.
- [Source: `package.json`] — dépendances réellement installées (`@base-ui/react`, `lucide-react`, Vitest, Testing Library).
- [Source: `components/ui/button.tsx`] — convention locale de wrapper Base UI.
- [Source: `node_modules/@base-ui/react/dialog/index.d.ts`, `index.parts.d.ts`, `root/DialogRoot.d.ts`, `popup/DialogPopup.d.ts`] — disponibilité et API réelle de la primitive Dialog.
- [External: Base UI Dialog docs, consultées le 2026-08-06] — `modal` par défaut, `onOpenChange`, `initialFocus` / `finalFocus`, recommandation d'un `Dialog.Close` dans le popup.

## Previous Story Intelligence

- Story 1.5 a déjà stabilisé le store goûté : `useTasted()` expose `tastedIds`, `tastedCount`, `isTasted`, `toggleTasted`, `setTasted`. **Point crucial à réutiliser ici** : `toggleTasted(id)` retourne **synchroniquement** le booléen résultant, précisément pour éviter de re-dériver l'état depuis un snapshot React potentiellement périmé. Le détail doit profiter de cette API, pas l'ignorer. [Source: `lib/tasted/index.ts`, `_bmad-output/implementation-artifacts/1-5-marquer-une-saveur-comme-goutee-et-persister-letat.md#Previous Story Intelligence`]
- Story 1.5 a introduit `stateRef` dans `useTasted()` pour corriger le bug des toggles rapprochés pairs. Toute nouvelle UI de toggle (dont la Dialog) doit continuer à appeler la même fonction de haut niveau ; réinventer un état local “isTasted” dans la Dialog ferait courir le même type de divergence.
- Story 1.5 a aussi posé l'annonce lecteur d'écran au niveau de `CataloguePageClient`. Le détail ne doit **pas** ouvrir une seconde voie d'annonce ; il doit réutiliser `handleToggleFlavor()` afin que la même phrase “{Nom}, goûtée/pas goûtée” soit annoncée quelle que soit la surface de toggle.
- Story 1.5 a fixé le badge `Goûtée` en coin `top-right`, hors du bouton principal, avec fond neutre conservé. Story 1.6 doit composer **autour** de cette convention, pas la déplacer ni la concurrencer.
- Story 1.4 a créé la structure durable `app/page.tsx` → `CataloguePageClient` → `CatalogueGrid` → `CatalogueTile`. Story 1.6 doit enrichir cette structure, pas créer un second arbre parallèle pour le détail.
- Story 1.4 a confirmé qu'aucun composant UI générique de type `Dialog` n'existe encore dans le repo ; Story 1.6 est le bon moment pour introduire un wrapper `components/ui/dialog.tsx`, parce que la dépendance Base UI est déjà là et cohérente avec `button.tsx`.
- Le commentaire existant dans `components/catalogue/catalogue-tile.tsx` est un signal direct : “Ne porte pas encore l'action détail (Story 1.6)”. Il faut le considérer comme une dette intentionnelle à résorber, pas comme un détail cosmétique.

## Git Intelligence Summary

- `9dbb72c fix(tasted): code review fixes for story 1.5` — pattern récent : les stories Catalogue reçoivent un commit feat puis un commit fix de revue. Prévoir des tests de régression très ciblés dès la première implémentation (focus return, outside click, non-propagation du bouton info) pour réduire ce second cycle.
- `e1f3aa9 feat(tasted): story 1.5 - marquer une saveur comme goûtée et persister l'état` — montre que les évolutions de surface se font par petites extensions de `components/catalogue/*` + tests co-localisés + mise à jour du story file ; Story 1.6 doit suivre exactement cette granularité.
- `89e6811 fix(catalogue): code review fixes for story 1.4` — rappelle que les détails visuels/structurels (breakpoints, fonds, fallback image, `role="alert"`) sont réellement revus. Pour Story 1.6, les détails a11y du dialog seront donc observés avec le même niveau d'exigence.
- `0c0d7d7 feat(catalogue): story 1.4 - affichage du catalogue en grille visuelle` — a introduit le dossier `components/catalogue/` et le pattern “shell serveur minimal + frontière client + composants métier”. C'est la base à ne pas casser.
- `71b835f fix(catalogue): code review fixes for story 1.3` — montre la préférence projet pour des corrections défensives ciblées plutôt qu'une refonte globale. Ici aussi, mieux vaut un wrapper Dialog précis et quelques props bien choisies qu'un gros composant fourre-tout.

## Latest Technical Information

- La doc Base UI consultée le 2026-08-06 confirme que `Dialog` est **non contrôlée par défaut**, mais supporte un mode **contrôlé** via `open` et `onOpenChange`. Pour cette story, le mode contrôlé côté `CataloguePageClient` est préférable parce qu'il faut connaître la saveur active et le trigger à restaurer.
- La même doc confirme que le mode `modal=true` piège le focus, bloque le scroll document et désactive les interactions externes ; cela couvre directement l'AC clavier/sortie.
- Base UI expose `initialFocus` et `finalFocus` sur `Dialog.Popup`. `finalFocus` est le bon outil pour renvoyer le focus au bouton info ayant ouvert la Dialog ; pas besoin de bricoler un focus-trap maison.
- Base UI recommande de rendre un `Dialog.Close` dans le popup lorsque `modal` est actif, afin que les lecteurs d'écran tactiles aient une sortie explicite. Même si l'AC ne l'impose pas verbalement, c'est une garde d'accessibilité utile à intégrer à l'implémentation.

## Project Context Reference

- Aucun `project-context.md` n'a été détecté dans le repo lors de l'activation de ce workflow. Toute la context intelligence exploitable pour Story 1.6 provient donc des artefacts BMad, du code courant, de l'historique Git récent et de l'investigation de dépendances locale.

## Review Findings

- [x] [Review][Patch] Bouton info sous la zone de tap minimale de 44×44px (NFR4, Subtask 2.5) [components/catalogue/catalogue-tile.tsx:62] — `size-8` (32px) est en dessous du minimum explicitement requis pour les deux actions interactives de la tuile. **Corrigé** : passage à `size="icon"` de `components/ui/button.tsx` (32px→32px non suffisant) puis ajustement en `size-11` (44px) via `className`.
- [x] [Review][Patch] `finalFocusRef` pourrait pointer vers un nœud DOM détaché si jamais la tuile déclenchante disparaissait pendant que la Dialog est ouverte [components/catalogue/catalogue-page-client.tsx:37,73-76,108] — risque résiduel très faible aujourd'hui (React réconcilie par `flavor.id`, le nœud reste monté), mais un garde défensif `?.isConnected` est trivial et sans effet de bord. **Corrigé** : `finalFocus` passé comme fonction (`() => ref.current?.isConnected ? ref.current : undefined`) dans `flavor-detail-dialog.tsx`, testé par un cas dédié (trigger démonté avant fermeture).
- [x] [Review][Patch] Les classes de transition de sortie de la Dialog (`duration-150`, `data-[ending-style]`, `data-[starting-style]`) ne se jouent jamais : `CataloguePageClient` démonte tout l'arbre `FlavorDetailDialog` de façon synchrone via le rendu conditionnel sur `selectedFlavorId`, sans passer par `onOpenChangeComplete`/`keepMounted` de Base UI [components/ui/dialog.tsx, components/catalogue/catalogue-page-client.tsx] — code mort/trompeur (aucune régression fonctionnelle, la fermeture reste correcte, juste instantanée plutôt qu'animée). **Corrigé** : ajout d'un état `displayedFlavorId` distinct de `selectedFlavorId`, démonté seulement via le nouveau callback `onOpenChangeComplete` forwardé depuis `Dialog.Root`, pour laisser la transition de sortie de Base UI se jouer réellement.
- [x] [Review][Patch] Chaque bouton info de la grille partage exactement le même nom accessible générique `"Voir le détail"`, sans distinction par Saveur [components/catalogue/catalogue-tile.tsx:60-66] — un utilisateur de lecteur d'écran naviguant par la liste des boutons ne peut pas les différencier, contrairement au bouton toggle principal dont le nom accessible inclut déjà le nom de la Saveur. **Corrigé** : `aria-label={`Voir le détail de ${flavor.name}`}`.
- [x] [Review][Patch] Logique de repli d'image dupliquée à l'identique entre `catalogue-tile.tsx` et `flavor-detail-dialog.tsx` [components/catalogue/catalogue-tile.tsx, components/catalogue/flavor-detail-dialog.tsx] — extraire un petit helper partagé. **Corrigé** : extrait dans `components/catalogue/flavor-image-fallback.ts` (`handleFlavorImageError`), réutilisé par les deux composants.
- [x] [Review][Patch] Le bouton info et le bouton toggle de la Dialog sont des `<button>` faits main plutôt que de réutiliser `components/ui/button.tsx` déjà existant, ce qui contredit le commentaire de `dialog.tsx` affirmant suivre "le même style que `components/ui/button.tsx`" [components/catalogue/catalogue-tile.tsx, components/catalogue/flavor-detail-dialog.tsx]. **Corrigé** : les deux boutons ainsi que `DialogClose` (composé via `render`) réutilisent désormais `Button`.
- [x] [Review][Patch] Aucun test n'exerce l'activation clavier réelle (Enter) du nouveau bouton info, contrairement au bouton toggle principal qui a déjà un test dédié en ce sens [components/catalogue/catalogue-tile.test.tsx] — ajouter le test miroir pour garder la parité de couverture entre les deux actions interactives. **Corrigé** : test ajouté (focus + vérification `<button>` natif non `tabindex="-1"`).
- [x] [Review][Patch] `finalFocusRef` n'est jamais exercé dans `flavor-detail-dialog.test.tsx` — le contrat de retour de focus du composant n'est vérifié qu'indirectement via le test d'intégration de `catalogue-page-client.test.tsx` [components/catalogue/flavor-detail-dialog.test.tsx] — ajouter un test unitaire dédié avec un élément trigger factice. **Corrigé** : 2 tests unitaires ajoutés (retour de focus nominal + garde défensive sur nœud détaché).
- [x] [Review][Patch] Le commentaire "titre accessible obligatoire" de `DialogContentProps` est positionné juste au-dessus du champ `showCloseButton`, ce qui laisse penser à tort qu'il documente ce flag plutôt que l'exigence de titre elle-même [components/ui/dialog.tsx] — déplacer le commentaire pour qu'il porte clairement sur l'exigence de titre. **Corrigé** : commentaire déplacé au-dessus de la déclaration de `DialogContent`.
- [x] [Review][Defer] Aucun test n'atteste réellement du piège de focus (Tab) à l'intérieur de la Dialog (AC #3) [components/catalogue/flavor-detail-dialog.test.tsx] — deferred, jsdom ne simule pas de façon fiable le déplacement de focus piloté par Tab comme un vrai navigateur (même limitation déjà acceptée pour le test "Enter réel" du bouton toggle de Story 1.5) ; une vérification fiable du focus-trap de Base UI nécessiterait un outillage E2E navigateur réel (ex. Playwright), hors périmètre de cette suite Vitest+jsdom.

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (GitHub Copilot CLI)

### Debug Log References

- `npx vitest run components/catalogue/catalogue-tile.test.tsx` → rouge confirmé sur les 4 nouveaux tests (bouton info absent), puis 16/16 verts après ajout du bouton info sœur.
- `npx vitest run components/catalogue/catalogue-grid.test.tsx` → 5/5 verts après relayage de `onOpenFlavorDetail`.
- `npx vitest run components/catalogue/flavor-detail-dialog.test.tsx` → rouge confirmé (fichier/composant inexistant), 6/9 verts dès la première implémentation, 2 échecs sur les assertions `onOpenChange` (l'appel réel de Base UI passe un deuxième argument `eventDetails` en plus du booléen) — corrigé en enveloppant l'`onOpenChange` transmis à `Dialog.Root` pour ne relayer que le booléen ; 9/9 verts ensuite.
- `npx vitest run components/catalogue/catalogue-page-client.test.tsx` → rouge confirmé (4 tests, `onOpenDetail is not a function`), 14/16 verts après le câblage initial ; 2 échecs restants : (1) `within(dialog)` nécessaire car "Curry Doux" apparaît à la fois dans la tuile et dans le titre de la Dialog ; (2) le retour de focus vers le bouton info nécessite `await waitFor(...)` car Base UI restaure le focus après la passe de rendu qui suit la fermeture, pas de manière strictement synchrone dans le même tick que l'événement `keydown`. 16/16 verts après ces deux corrections de test (aucun changement de comportement applicatif nécessaire).
- `npm test -- --run` → 170/170 tests passing (25 nouveaux : 4 `catalogue-tile`, 1 `catalogue-grid`, 9 `flavor-detail-dialog`, 4 `catalogue-page-client` + réutilisation de tests existants adaptés à la nouvelle signature de props), aucune régression sur les 145 tests préexistants (Story 1.1 à 1.5).
- `npm run lint` → 0 erreur, 2 avertissements `@next/next/no-img-element` (le préexistant sur `catalogue-tile.tsx` + un nouveau sur `flavor-detail-dialog.tsx`, cohérent avec la décision déjà actée en Story 1.4 de ne pas migrer vers `next/image` pour des images distantes non maîtrisées).
- `npm run build` → succès, `/` toujours prérendu statiquement (`○ (Static)`), TypeScript strict sans erreur (types Base UI `Dialog.Popup.Props`, `Dialog.Title.Props`, etc. résolus correctement via les `.d.ts` locaux).

### Completion Notes List

- Créé `components/ui/dialog.tsx` : wrapper fin autour de `@base-ui/react/dialog` (`Dialog.Root`, `Trigger`, `Portal`, `Backdrop`, `Viewport`, `Popup`, `Title`, `Description`, `Close`), dans le même style que `components/ui/button.tsx` (`cn()`, `data-slot`). `DialogContent` compose `Portal + Backdrop + Viewport + Popup`, garde `modal` à sa valeur par défaut (`true` → focus trap, scroll lock, dismissal standard) et rend systématiquement un `DialogClose` visible (icône `XIcon` de `lucide-react`) en plus de l'Échap/clic extérieur, conformément à la recommandation Base UI. Introduit comme le point de départ de la convention locale pour tout futur overlay du projet.
- Créé `components/catalogue/flavor-detail-dialog.tsx` : composant de domaine `FlavorDetailDialog` recevant `flavor`, `open`, `onOpenChange`, `isTasted`, `onToggle`, `finalFocusRef`. Rend le visuel agrandi (avec le même fallback `/placeholder-flavor.svg` que la tuile), le nom (`DialogTitle`), le statut textuel `Active`/`Archivée` (`DialogDescription`, jamais seulement coloré) et un bouton de toggle (`Marquer comme goûtée` / `Marquer comme pas goûtée`) qui délègue intégralement à `onToggle` — aucune duplication d'état local "goûté/pas goûté". L'`onOpenChange` transmis à `Dialog.Root` est enveloppé pour ne remonter que le booléen `open`, en ignorant le second argument `eventDetails` fourni par Base UI (non pertinent pour ce composant).
- Restructuré `components/catalogue/catalogue-tile.tsx` : la tuile porte désormais **deux boutons sœurs** (jamais un bouton imbriqué dans un autre, invalide en HTML) — le bouton principal de toggle (inchangé fonctionnellement) et un nouveau bouton info (`aria-label="Voir le détail"`, icône `InfoIcon` de `lucide-react`), positionné en `absolute top-2 left-2` pour ne jamais chevaucher le badge "Goûtée" (`top-2 right-2`, inchangé). Le clic sur le bouton info appelle `onOpenDetail(flavor.id, event.currentTarget)` et ne déclenche jamais `onToggle` (pas de propagation), et réciproquement.
- Étendu `components/catalogue/catalogue-grid.tsx` : nouvelle prop `onOpenFlavorDetail(id, triggerElement)` relayée telle quelle à chaque `CatalogueTile`, sans que la grille ne possède d'état d'ouverture (reste un composant de projection pure).
- Étendu `components/catalogue/catalogue-page-client.tsx` : nouveau state `selectedFlavorId` (source de vérité unique pour une **seule** `FlavorDetailDialog` contrôlée, jointure par `flavor.id`, AD-1) et une `ref` (`detailTriggerRef`) mémorisant le bouton info ayant ouvert la Dialog, transmise en `finalFocusRef` pour que Base UI y restaure le focus à la fermeture (quelle que soit la cause : Échap, clic extérieur, ou bouton de fermeture). Le bouton de toggle de la Dialog appelle **exactement** `handleToggleFlavor` (déjà utilisé par la grille depuis Story 1.5) — aucune deuxième région `aria-live`, aucune deuxième fonction de mutation : l'annonce lecteur d'écran et le compteur `X/N` restent cohérents quelle que soit la surface de toggle utilisée (tuile ou Dialog).
- Aucune nouvelle dépendance ajoutée — `@base-ui/react` et `lucide-react` étaient déjà installés ; aucune dépendance de test ajoutée (`@testing-library/user-event` volontairement écarté, conformément aux Dev Notes de la story).
- Aucune régression sur les acquis Story 1.3/1.4/1.5 : fond neutre de la tuile, badge "Archivée" textuel, badge "Goûtée" en coin, compteur de progression anti-IDs-orphelins, annonce `aria-live` unique, `useTasted()` inchangé.

### File List

- `components/ui/dialog.tsx` — nouveau, wrapper `@base-ui/react/dialog` (`Dialog`, `DialogTrigger`, `DialogPortal`, `DialogClose`, `DialogBackdrop`, `DialogContent`, `DialogTitle`, `DialogDescription`).
- `components/catalogue/flavor-detail-dialog.tsx` — nouveau, composant `FlavorDetailDialog`.
- `components/catalogue/flavor-detail-dialog.test.tsx` — nouveau, 9 tests.
- `components/catalogue/catalogue-tile.tsx` — étendu : bouton info sœur (`onOpenDetail`), positionné en coin opposé au badge "Goûtée".
- `components/catalogue/catalogue-tile.test.tsx` — étendu, 4 nouveaux tests (bouton info distinct, appel `onOpenDetail`, non-propagation vers `onToggle` et inversement, positionnement en coin).
- `components/catalogue/catalogue-grid.tsx` — étendu : prop `onOpenFlavorDetail`, relayée telle quelle.
- `components/catalogue/catalogue-grid.test.tsx` — étendu, 1 nouveau test de relayage.
- `components/catalogue/catalogue-page-client.tsx` — étendu : coordination de l'ouverture/fermeture de la Dialog (`selectedFlavorId`, `detailTriggerRef`), composition de `FlavorDetailDialog`.
- `components/catalogue/catalogue-page-client.test.tsx` — étendu, 4 nouveaux tests (ouverture depuis le bouton info, toggle depuis la Dialog via la même fonction de coordination, fermeture sans mutation via Échap, retour de focus au trigger).
- `components/catalogue/flavor-image-fallback.ts` — nouveau (revue de code) : helper `handleFlavorImageError` partagé entre `catalogue-tile.tsx` et `flavor-detail-dialog.tsx`.

## Change Log

- 2026-08-06 : Story context créée pour la Story 1.6 ("Détail d'une Saveur"). Investigation locale de `@base-ui/react/dialog` confirmée (Dialog contrôlée disponible, `finalFocus`/`initialFocus` sur `Dialog.Popup`), décision architecturale actée (wrapper `components/ui/dialog.tsx` + Dialog unique contrôlée depuis `CataloguePageClient`). Status → `ready-for-dev`.
- 2026-08-06 : Implémentation complète — wrapper `components/ui/dialog.tsx`, composant `FlavorDetailDialog`, restructuration de `catalogue-tile.tsx` en deux boutons sœurs (toggle + info), câblage de l'ouverture/fermeture/retour de focus dans `catalogue-page-client.tsx` en réutilisant `handleToggleFlavor` (aucune duplication d'état ni d'annonce). 25 nouveaux tests, 170/170 au total, `build`/`lint` propres. Status → `review`.
- 2026-08-06 : Revue de code (3 reviewers, 11 findings dédupliqués : 9 patch, 1 defer, 1 dismiss). Tous les patches appliqués : bouton info agrandi à 44px et réutilisant `Button`, aria-label différencié par Saveur, garde `isConnected` défensive sur `finalFocusRef`, transition de sortie de la Dialog réellement jouée (`onOpenChangeComplete` + état `displayedFlavorId`), helper `handleFlavorImageError` partagé, `DialogClose` recomposé via `Button`, commentaire de `dialog.tsx` repositionné, 3 tests ajoutés (Enter clavier bouton info, retour de focus + garde défensive `finalFocusRef`). Dismiss confirmé infondé (AD-1 : une Saveur n'est jamais supprimée, seulement archivée, cf. `scripts/merge-catalogue.ts`). Defer consigné dans `deferred-work.md` (focus-trap Tab, limitation jsdom). 174/174 tests, `lint`/`build` propres. Status → `done`.
