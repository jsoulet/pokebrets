# Addendum — Crounch

*Contenu technique et détails qui n'ont pas leur place dans le corps du PRD (capacités, pas implémentation), mais utiles pour l'architecture et le développement.*

## Stack technique
- **Framework** : React / Next.js.
- **Framework UI** : pas de préférence forte exprimée — utiliser un framework UI simple et courant pour l'écosystème Next.js (ex: shadcn/ui, ou équivalent standard). À confirmer/choisir en phase d'architecture.
- **Hébergement** : Netlify (compte personnel de Johan).
- **Stockage** : local storage navigateur uniquement, pas de backend, pas de base de données.
- **PWA** : app installable, mobile-first (usage principal envisagé en rayon de supermarché).

## Catalogue de saveurs — mécanisme de données
- Le Catalogue est un fichier **JSON hébergé sur GitHub**, récupéré par l'app à chaque ouverture (pas un bundle statique figé au build).
- Un **outil de scraping** (script, exécution manuelle) doit permettre de récupérer/mettre à jour les données de saveurs depuis :
  - le site officiel Brets, et/ou
  - Open Food Facts.
- Cet outil régénère le fichier JSON du Catalogue ; pas d'automatisation planifiée (cron) prévue pour le MVP.
- Questions ouvertes sur ce mécanisme (voir aussi §8 du PRD) :
  - Source de vérité en cas de divergence entre Brets officiel et Open Food Facts.
  - Mode de service du JSON depuis GitHub (raw.githubusercontent.com, GitHub Pages, CDN type jsDelivr...).

## Décisions issues du brainstorming (contexte)
- Scan de code-barre écarté (jugé overkill pour le besoin).
- Ajout manuel de nouvelle saveur par l'utilisateur écarté — le Catalogue est entièrement piloté par l'Outil de mise à jour.
- Pas de synchronisation multi-appareils (chaque appareil garde son propre état "goûté" en local storage).
