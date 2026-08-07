# Deferred Work

## Deferred from: code review of story-1.1 (2026-07-30)

- Dépendance réseau de `next/font/google` en environnement de build sans accès internet (app/layout.tsx:1-12) — comportement par défaut du scaffold create-next-app, acceptable tant que CI/Netlify ont un accès réseau fiable.
- Variantes icône-seule de `components/ui/button.tsx` sans nom accessible / aria-label (components/ui/button.tsx:24-35,45-56) — composant shadcn généré, non encore utilisé dans l'app ; à traiter quand une story UI l'exploitera réellement.

## Deferred from: code review of story-1.9 (2026-07-31)

- Pas de verrouillage/CAS pour des exécutions concurrentes de `npm run scrape` (scripts/write-catalogue.ts) — deferred, pre-existing : outil manuel mono-utilisateur (pas de cron, cf. Dev Notes AD-6), risque de concurrence non pertinent pour ce contexte d'usage.

## Deferred from: code review of story-1-3 (2026-07-31)

- `useCatalogue()` déclenche un fetch réseau indépendant par instance montée, sans déduplication ni synchronisation inter-onglets (via un event `storage` ou un cache partagé). Pertinent seulement une fois le hook réellement consommé par un ou plusieurs composants (story 1.4+) — pas de consommateur n'existe encore à ce stade.

## Deferred from: code review of story-1-4 (2026-07-31)

- Le bouton "Réessayer" (`catalogue-page-client.tsx`) ne montre aucun état "en cours" pendant `retry()` : `useCatalogue()` (Story 1.3) n'expose que `loading`/`ready`/`error`, pas de statut intermédiaire type `retrying`. Nécessite une évolution du contrat du hook — hors scope pour un composant de présentation pur (Story 1.4).
- Pas d'état vide dédié si `data.flavors` est un tableau vide (catalogue scrappé sans résultat) : la grille afficherait un espace blanc sans message. Scénario peu probable (Story 1.9 garantit un catalogue non vide via `data/catalogue.json`) mais non couvert par un test ou un message dédié.

## Deferred from: code review of story-1-5 (2026-08-01)

- `useTasted()` (`lib/tasted/index.ts`) n'écoute pas l'évènement navigateur `storage` : un second onglet ouvert sur le même appareil ne reflète pas en direct un toggle effectué dans un autre onglet, tant qu'il n'est pas remonté/rechargé. La fonction canonique `setTasted()` protège déjà contre l'écrasement d'une écriture concurrente (relecture avant écriture, AD-8) mais ne synchronise pas la vue React d'un onglet resté ouvert. Pertinent seulement en usage multi-onglets simultané, hors scope de l'usage mono-utilisateur/mono-appareil au premier plan visé par cette story.

## Deferred from: code review of story-1-6 (2026-08-02)

- Aucun test n'atteste réellement du piège de focus (Tab) à l'intérieur de la Dialog (AC #3, `components/catalogue/flavor-detail-dialog.test.tsx`) — jsdom ne simule pas de façon fiable le déplacement de focus piloté par Tab comme un vrai navigateur (même limitation déjà acceptée pour le test "Enter réel" du bouton toggle de Story 1.5). Une vérification fiable du focus-trap de Base UI nécessiterait un outillage E2E navigateur réel (ex. Playwright), hors périmètre de cette suite Vitest+jsdom.

## Deferred from: code review of story-1-7 (2026-08-07)

- Absence de garde d'ordre des requêtes (`requestId`/`AbortController`) dans `revalidate()` (`lib/catalogue/index.ts`) : une revalidation plus ancienne qui échoue après qu'un retry plus récent a réussi peut faire repasser `isOffline`/`status`/`error` à un état incorrect (ex: réafficher la bannière "hors ligne" ou une erreur périmée). Gap architectural présent depuis Story 1.3 (le hook n'a jamais eu de séquencement des réponses asynchrones), amplifié en visibilité par l'ajout du signal `isOffline` en Story 1.7 mais non introduit par elle. Nécessiterait une refonte de `revalidate()` avec un identifiant de requête ou un `AbortController`, hors périmètre de cette story.
