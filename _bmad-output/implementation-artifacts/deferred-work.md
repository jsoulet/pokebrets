# Deferred Work

## Deferred from: code review of story-1.1 (2026-07-30)

- Dépendance réseau de `next/font/google` en environnement de build sans accès internet (app/layout.tsx:1-12) — comportement par défaut du scaffold create-next-app, acceptable tant que CI/Netlify ont un accès réseau fiable.
- Variantes icône-seule de `components/ui/button.tsx` sans nom accessible / aria-label (components/ui/button.tsx:24-35,45-56) — composant shadcn généré, non encore utilisé dans l'app ; à traiter quand une story UI l'exploitera réellement.

## Deferred from: code review of story-1.9 (2026-07-31)

- Pas de verrouillage/CAS pour des exécutions concurrentes de `npm run scrape` (scripts/write-catalogue.ts) — deferred, pre-existing : outil manuel mono-utilisateur (pas de cron, cf. Dev Notes AD-6), risque de concurrence non pertinent pour ce contexte d'usage.

## Deferred from: code review of story-1-3 (2026-07-31)

- `useCatalogue()` déclenche un fetch réseau indépendant par instance montée, sans déduplication ni synchronisation inter-onglets (via un event `storage` ou un cache partagé). Pertinent seulement une fois le hook réellement consommé par un ou plusieurs composants (story 1.4+) — pas de consommateur n'existe encore à ce stade.
