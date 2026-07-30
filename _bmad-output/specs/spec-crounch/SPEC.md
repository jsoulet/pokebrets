---
id: SPEC-crounch
companions:
  - 'glossary.md'
  - '../../planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/DESIGN.md'
  - '../../planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/EXPERIENCE.md'
  - '../../planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md'
sources:
  - '../../planning-artifacts/prds/prd-brets-chips-checker-2026-07-29/prd.md'
  - '../../planning-artifacts/prds/prd-brets-chips-checker-2026-07-29/addendum.md'
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability only — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Crounch

## Why

Vision à réaliser : Johan (et ses potes) veulent savoir en un coup d'œil quelles saveurs de chips Brets ils ont déjà goûtées, sous la forme d'un petit carnet de collection ludique façon pokédex — sans jamais se prendre au sérieux. Projet hobby/entre amis, usage restreint, sans ambition de produit public ni monétisé.

## Capabilities

- **CAP-1**
  - **intent:** Le système peut charger le Catalogue à jour des saveurs Brets depuis un fichier JSON hébergé sur GitHub, à chaque ouverture de l'app.
  - **success:** Une requête réseau est déclenchée à chaque ouverture ; en cas d'échec, l'app affiche la dernière version connue en cache local, ou un état d'erreur explicite si aucun cache n'existe.

- **CAP-2**
  - **intent:** L'utilisateur peut visualiser tout le Catalogue sous forme de grille visuelle façon bingo/pokédex, chaque Saveur affichant nom et visuel, avec les saveurs archivées visuellement distinguables.
  - **success:** Chaque Saveur apparaît comme une case distincte de la grille ; une Saveur archivée reste visible mais visuellement différenciée, jamais supprimée de la grille.

- **CAP-3**
  - **intent:** L'utilisateur peut marquer une Saveur comme "goûtée" ou revenir en arrière ("pas goûtée").
  - **success:** Le clic bascule immédiatement l'État de dégustation et l'écrit en stockage local, sans action de sauvegarde explicite.

- **CAP-4**
  - **intent:** Le système peut restaurer l'État de dégustation de l'utilisateur à chaque réouverture de l'app, sur le même appareil.
  - **success:** Après fermeture puis réouverture sur le même appareil, toutes les Saveurs précédemment cochées restent cochées ; l'État de dégustation n'est jamais transmis à un serveur ni partagé entre appareils.

- **CAP-5**
  - **intent:** Le mainteneur peut lancer un outil qui scrape les données de saveurs (site officiel Brets, Open Food Facts) et régénère le fichier JSON du Catalogue, sans reconstruire ni redéployer l'app.
  - **success:** L'outil produit un JSON conforme au schéma du Catalogue, ré-exécutable pour intégrer de nouvelles saveurs sans intervention manuelle sur chaque entrée existante.

## Constraints

- Aucun compte, aucun backend, aucune base de données : tout est 100% côté client ; l'État de dégustation vit en local storage, propre à chaque appareil, jamais transmis.
- Le Catalogue doit rester actualisable par le mainteneur sans reconstruire ni redéployer l'app (le JSON vit hors du bundle Next.js, refetché à chaque ouverture).
- L'app doit rester rapide et légère en usage mobile (cas d'usage principal : en rayon de supermarché) — ne jamais sacrifier la vitesse de chargement à l'exhaustivité des métadonnées.

## Non-goals

- Pas de compte utilisateur ni d'authentification.
- Pas de partage social ou de comparaison entre utilisateurs.
- Pas de scan de code-barre.
- Pas d'ajout manuel d'une nouvelle Saveur par l'utilisateur final.
- Pas de synchronisation multi-appareils.
- Pas de vocation à devenir un produit public ou monétisé, ni d'ambition de scalabilité.
- Notation par saveur et commentaire par saveur : différés (potentiel v2), non couverts par ce SPEC v1.

## Success signal

Johan et ses potes utilisent réellement l'app en rayon de supermarché ou après avoir goûté une nouvelle chips, sans l'abandonner après quelques semaines d'usage.
