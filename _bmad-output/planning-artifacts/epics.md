---
stepsCompleted: [step-01, step-02, step-03, step-04]
inputDocuments:
  - '_bmad-output/planning-artifacts/prds/prd-brets-chips-checker-2026-07-29/prd.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-crounch-2026-07-30/ARCHITECTURE-SPINE.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-brets-chips-checker-2026-07-29/EXPERIENCE.md'
  - '_bmad-output/specs/spec-crounch/SPEC.md'
  - '_bmad-output/specs/spec-crounch/glossary.md'
---

# Crounch - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Crounch, decomposing the requirements from the PRD, UX Design contract, Architecture spine, and the SPEC into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Le système peut récupérer le Catalogue depuis son fichier JSON hébergé sur GitHub à chaque ouverture de l'app ; en cas d'échec réseau, afficher la dernière version connue en cache local, ou un état d'erreur clair si aucune version n'est disponible.
FR2: L'utilisateur peut visualiser toutes les Saveurs du Catalogue dans une grille visuelle (façon bingo/pokédex), chaque Saveur affichant nom et visuel ; une Saveur archivée est visuellement distinguable sans être supprimée de la grille.
FR3: L'utilisateur peut marquer une Saveur comme "goûtée" ou revenir en arrière ("pas goûtée") ; le toggle est immédiat et écrit en Stockage local sans action de sauvegarde explicite.
FR4: Le système peut restaurer l'État de dégustation de l'utilisateur à chaque réouverture de l'app, sur le même Appareil ; l'État de dégustation n'est jamais transmis à un serveur ni partagé entre Appareils.
FR5: Le mainteneur peut lancer un outil (script/CLI) qui scrape les données de saveurs depuis brets.fr et/ou Open Food Facts, et régénère le fichier JSON du Catalogue, ré-exécutable pour intégrer de nouvelles saveurs sans intervention manuelle sur chaque entrée existante.

### NonFunctional Requirements

NFR1: L'affichage du Catalogue doit rester lisible et rapide sur mobile — usage principal en rayon de supermarché avec une connexion capricieuse.
NFR2: Ne jamais sacrifier la vitesse de chargement à l'exhaustivité des métadonnées (contre-métrique explicite, PRD SM-C1).
NFR3: Conformité WCAG 2.2 AA sur toute la surface responsive (EXPERIENCE.md > Accessibility Floor).
NFR4: Zone de tap des chip-tiles ≥ 44×44px, y compris sur mobile.
NFR5: Aucune donnée personnelle ni État de dégustation ne doit jamais transiter par un serveur (100% local storage, aucun backend/BDD).

### Additional Requirements

- Pas de starter template greenfield spécifique imposé par l'Architecture ; stack pinnée directement : Next.js 16.x (App Router, `output: 'export'`), React 19.x, shadcn/ui, Serwist (`@serwist/next`), Node.js/TypeScript pour l'app ET le scraper.
- Monorepo unique : l'app Next.js et l'outil de scraping (CLI Node/TS, mainteneur uniquement) vivent dans `scripts/` (ou `tools/`) du même repo (AD-6).
- Aucun code serveur applicatif : export statique Next.js, hébergement Netlify en site statique (AD-4).
- `catalogue.json` doit vivre HORS de `public/` (ex: `data/catalogue.json` à la racine du repo), committé/régénéré par le scraper, servi via `raw.githubusercontent.com` — pour permettre une mise à jour sans reconstruire/redéployer l'app (AD-2).
- Stratégie de chargement stale-while-revalidate : afficher le cache local immédiatement si présent, rafraîchir en fond ; `lib/catalogue/` est seul propriétaire de la fraîcheur, la révision du Catalogue (`generatedAt`) doit être monotone (AD-2).
- Serwist doit exclure l'URL distante du Catalogue de son precache/runtime-cache (ne cache que l'app shell) (AD-2). Point d'attention : piège connu de génération `sw.js` avec `output: 'export'` (issue vercel/next.js#73457) — tester le pipeline tôt.
- Module `lib/schema/` : schéma partagé et versionné (types + validation runtime) pour Catalogue/Saveur/État de dégustation, consommé par l'app ET le scraper ; le scraper valide sa sortie avant de committer (AD-7).
- Frontière de données stricte : jointure Catalogue ⇄ État de dégustation uniquement par ID de Saveur stable (jamais par index) ; une Saveur n'est jamais retirée du Catalogue, seulement archivée (AD-1).
- Mutation atomique de l'État de dégustation via une fonction canonique unique dans `lib/tasted/`, qui relit l'état le plus récent avant écriture (AD-8).
- Scraping : brets.fr fait autorité en cas de divergence avec Open Food Facts ; clé de matching canonique documentée + table de correspondance maintenue pour les cas ambigus (AD-5).
- Tout module touchant `localStorage`/`window` doit être un Client Component explicite (`'use client'`), jamais évalué au prerender statique (AD-4).

### UX Design Requirements

UX-DR1: Tokens de couleur — primary `#DDA138`, accent `#E8482C`, success `#3FA34D`, archived `#C9C2B4`, background `#FDF0DD` — en overrides du thème shadcn (le reste hérite des défauts shadcn, pas de dark mode v1).
UX-DR2: Tokens typographiques — `body` en Inter ; `display`/`display-sm` en Post No Bills Jaffna ExtraBold (auto-hébergée, avec contour `textStroke`) pour titre app + titres de section ; `tagline` en Recoleta (licence commerciale à vérifier — fallback Fraunces en attendant) pour une sous-accroche ponctuelle uniquement.
UX-DR3: Échelle d'arrondis généreuse — `rounded/sm` 8px, `rounded/md` 12px, `rounded/lg` 16px, `rounded/full` 9999px — appliquée aux chip-tiles, badges et boutons.
UX-DR4: Composant `section-divider` en zigzag (découpe façon bord de sachet ouvert), réservé aux transitions de section (ex: header/grille), jamais en bordure de carte.
UX-DR5: Composant Chip-tile — fond neutre constant (goûtée ou non), seule la variante archivée change de fond ; l'état "goûtée" se lit uniquement via un badge, jamais via un remplissage de couleur plein (anti-pattern "feu tricolore" explicitement rejeté).
UX-DR6: Composants Badge-tasted (vert `success`, rond, coin de tuile) et Badge-archivée (pilule beige-gris, permanent sur les Saveurs archivées).
UX-DR7: Composant Button-primary (`{colors.primary}` plein, `rounded/md`) ; autres variantes héritent des défauts shadcn.
UX-DR8: État Skeleton — grille de tuiles grises animées pendant le chargement initial du Catalogue, résout dès réception du JSON.
UX-DR9: Dialog de détail de Saveur — ouverte via l'icône info (jamais via le tap principal de la tuile) ; visuel agrandi, nom, statut, bouton de toggle redondant avec le tap sur la tuile.
UX-DR10: Compteur de progression en header du Catalogue ("X/N saveurs goûtées"), mis à jour instantanément à chaque toggle.
UX-DR11: Interaction de toggle optimiste — retour visuel immédiat + écriture local storage dans la foulée, sans confirmation modale (bannie explicitement pour ne pas casser la rapidité du geste en rayon).
UX-DR12: États hors-ligne différenciés — bannière discrète "Hors ligne — dernière version connue affichée" si cache présent ; état vide explicite + bouton "Réessayer" si aucun cache (premier lancement).
UX-DR13: Grille responsive — 2-3 colonnes mobile (`< sm`), 4-5 colonnes tablette (`md`), 6+ colonnes desktop (`≥ lg`) avec largeur de contenu plafonnée.
UX-DR14: Accessibilité comportementale — lecteur d'écran annonce le changement d'état au toggle ("{Nom}, goûtée"/"pas goûtée") ; badge "archivée" annoncé comme information (pas seulement visuel) ; Dialog pilotable au clavier (Tab/Enter/Échap).
UX-DR15: Règles de voix/ton microcopy — langage léger et première personne implicite (ex: "12/48 saveurs goûtées", "Hors ligne — dernière version connue affichée") plutôt qu'un vocabulaire administratif/corporate.

### FR Coverage Map

FR1: Epic 1 - Chargement du Catalogue depuis GitHub, avec cache local et dégradation réseau
FR2: Epic 1 - Affichage du Catalogue en grille visuelle, saveurs archivées distinguables
FR3: Epic 1 - Marquer une Saveur goûtée / pas goûtée
FR4: Epic 1 - Persistance de l'État de dégustation par Appareil
FR5: Epic 1 - Outil de scraping/mise à jour du Catalogue (mainteneur)

## Epic List

### Epic 1: Crounch — Suivi de dégustation des saveurs Brets

En tant qu'utilisateur (Johan et ses potes), je peux ouvrir l'app, voir toutes les saveurs Brets dans une grille façon pokédex, cocher celles déjà goûtées et retrouver ma progression à chaque réouverture — et en tant que mainteneur, je peux mettre à jour le Catalogue via un outil de scraping sans jamais redéployer l'app.

**FRs covered:** FR1, FR2, FR3, FR4, FR5

## Epic 1: Crounch — Suivi de dégustation des saveurs Brets

En tant qu'utilisateur (Johan et ses potes), je peux ouvrir l'app, voir toutes les saveurs Brets dans une grille façon pokédex, cocher celles déjà goûtées et retrouver ma progression à chaque réouverture — et en tant que mainteneur, je peux mettre à jour le Catalogue via un outil de scraping sans jamais redéployer l'app.

### Story 1.1: Initialisation du projet et squelette déployé

As a mainteneur (Johan),
I want un projet Next.js 16 (App Router, export statique) avec shadcn/ui installé, structuré selon le spine d'architecture (monorepo, dossiers `app/`, `components/`, `lib/`, `scripts/`),
So that j'ai un squelette d'app vide mais réellement déployé sur Netlify, visitable dans un navigateur, avant d'ajouter la moindre fonctionnalité.

**Acceptance Criteria:**

**Given** un repo vide
**When** le projet est initialisé (Next.js 16.x, App Router, `output: 'export'`, shadcn/ui, structure de dossiers `app/`, `components/`, `lib/`, `scripts/`)
**Then** `next build` produit un export statique dans `out/`

**Given** le projet buildé
**When** il est déployé sur Netlify
**Then** une page d'accueil (même minimale) est accessible via une URL publique Netlify

**And** aucune route API ni Server Action n'est présente dans le projet (AD-4)

---

### Story 1.2: Schéma partagé du Catalogue et de l'État de dégustation

As a mainteneur (Johan),
I want un module `lib/schema/` définissant les types et la validation runtime d'une Saveur, du Catalogue et de l'État de dégustation,
So that l'app et l'outil de scraping ne puissent jamais diverger silencieusement sur la forme des données (AD-7).

**Acceptance Criteria:**

**Given** le module `lib/schema/`
**When** un objet JSON conforme (Saveur avec id/name/image/status) lui est soumis
**Then** la validation réussit et retourne un objet typé

**Given** le même module
**When** un objet JSON non conforme (champ manquant, `status` hors de `active`/`archived`, etc.) lui est soumis
**Then** la validation échoue explicitement (erreur exploitable, pas un plantage silencieux)

**And** le schéma définit l'identifiant de Saveur comme un slug stable, jamais dérivé automatiquement du nom d'affichage (AD-1)

---

### Story 1.3: Chargement du Catalogue avec cache local et dégradation réseau

As a utilisateur (Johan),
I want que l'app récupère le Catalogue à jour depuis un JSON hébergé sur GitHub à chaque ouverture, avec repli sur le cache local si le réseau échoue,
So that je puisse toujours voir un catalogue (même périmé) plutôt qu'un écran cassé, y compris en rayon avec une connexion capricieuse.

**Acceptance Criteria:**

**Given** un cache local existant du Catalogue
**When** l'app s'ouvre
**Then** le cache est affiché immédiatement, puis un fetch réseau se déclenche en arrière-plan et remplace les données dès réponse valide (stale-while-revalidate, AD-2)

**Given** aucun cache local et un fetch réseau qui échoue (réseau, non-2xx, ou JSON invalide contre `lib/schema`)
**When** l'app s'ouvre
**Then** un état d'erreur explicite s'affiche ("Impossible de charger le catalogue, vérifie ta connexion") avec un bouton "Réessayer" — jamais un catalogue vide silencieux (AD-3, FR1)

**Given** deux réponses réseau concurrentes
**When** une réponse plus ancienne arrive après une plus récente
**Then** la réponse la plus ancienne est ignorée (comparaison par révision `generatedAt` monotone, AD-2)

**And** `catalogue.json` est fetché depuis `data/catalogue.json` du repo via `raw.githubusercontent.com` — jamais bundlé dans `public/` (AD-2)

---

### Story 1.4: Affichage du Catalogue en grille visuelle

As a utilisateur (Johan),
I want voir toutes les Saveurs du Catalogue dans une grille visuelle façon bingo/pokédex, avec l'identité Crounch (couleurs, typographie, arrondis),
So that parcourir ma collection soit immédiat et amusant, y compris pendant le chargement.

**Acceptance Criteria:**

**Given** le Catalogue chargé (Story 1.3)
**When** la page d'accueil s'affiche
**Then** chaque Saveur apparaît comme une case (chip-tile) distincte de la grille, avec nom et visuel (FR2)

**Given** une Saveur au statut `archived`
**When** elle est affichée dans la grille
**Then** elle reste visible mais visuellement distinguable (badge pilule beige-gris) sans être supprimée (FR2, UX-DR6)

**Given** le Catalogue en cours de premier chargement (aucun cache)
**When** la page s'affiche
**Then** un Skeleton (grille de tuiles grises animées) s'affiche jusqu'à réception des données (UX-DR8)

**And** les tokens de couleur (`#DDA138`, `#E8482C`, `#3FA34D`, `#C9C2B4`, `#FDF0DD`), la typographie (Inter/Post No Bills Jaffna ExtraBold/Recoleta ou Fraunces), et les arrondis généreux du DESIGN.md sont appliqués (UX-DR1, UX-DR2, UX-DR3)

**And** la grille est responsive : 2-3 colonnes mobile, 4-5 tablette, 6+ desktop avec largeur plafonnée (UX-DR13, NFR1)

---

### Story 1.5: Marquer une Saveur comme goûtée et persister l'état

As a utilisateur (Johan),
I want cocher/décocher une Saveur comme "goûtée" d'un tap, et retrouver cet état à chaque réouverture de l'app,
So that je puisse suivre ma progression sans jamais perdre mes coches, même après avoir fermé l'app.

**Acceptance Criteria:**

**Given** une Saveur non goûtée dans la grille
**When** l'utilisateur tape sur sa chip-tile
**Then** un badge "goûtée" apparaît instantanément en coin de la tuile (le fond de la tuile reste neutre, jamais de remplissage plein — anti-pattern "feu tricolore" rejeté) et l'écriture en local storage se fait dans la foulée, sans confirmation modale (FR3, UX-DR5, UX-DR11)

**Given** l'app fermée puis rouverte sur le même appareil
**When** le Catalogue se réaffiche
**Then** toutes les Saveurs précédemment cochées réapparaissent cochées (FR4) — l'État de dégustation n'est jamais transmis à un serveur ni partagé entre appareils

**Given** deux toggles rapprochés sur la même Saveur (ou deux onglets)
**When** les écritures se produisent
**Then** la mutation passe par une fonction canonique unique de `lib/tasted/` qui relit l'état le plus récent avant d'écrire, évitant qu'un read-modify-write périmé n'écrase l'autre (AD-8)

**And** le compteur de progression du header ("X/N saveurs goûtées") se met à jour instantanément à chaque toggle (UX-DR10)

**And** le lecteur d'écran annonce le changement d'état ("{Nom}, goûtée" / "pas goûtée") (NFR3, UX-DR14)

---

### Story 1.6: Détail d'une Saveur

As a utilisateur (Johan),
I want ouvrir un détail agrandi d'une Saveur (visuel, nom, statut) sans changer son état goûté/pas goûté,
So that je puisse vérifier visuellement que c'est bien la bonne saveur avant de cocher, en cas de doute en rayon.

**Acceptance Criteria:**

**Given** une chip-tile dans la grille
**When** l'utilisateur tape sur son icône info (pas sur la tuile elle-même)
**Then** une Dialog s'ouvre avec le visuel agrandi, le nom, le statut (active/archivée), et un bouton pour basculer l'état goûté/pas goûté (UX-DR9)

**Given** la Dialog ouverte
**When** l'utilisateur tape en dehors ou appuie sur Échap
**Then** la Dialog se ferme sans changer l'état goûté/pas goûté (sauf action explicite sur le bouton toggle)

**And** la Dialog est pilotable au clavier (Tab, Enter, Échap) pour l'usage desktop (NFR3, UX-DR14)

---

### Story 1.7: États hors-ligne et microcopy

As a utilisateur (Johan),
I want des messages clairs et au ton léger dans les états hors-ligne ou de chargement,
So that je comprenne toujours ce qui se passe, sans jargon technique ni angoisse inutile.

**Acceptance Criteria:**

**Given** un Catalogue en cache et une perte de connexion
**When** le rafraîchissement réseau échoue en arrière-plan
**Then** une bannière discrète "Hors ligne — dernière version connue affichée" s'affiche, le toggle goûté/pas goûté restant utilisable normalement (UX-DR12)

**Given** un premier lancement sans cache et sans réseau
**When** le fetch échoue
**Then** l'état vide affiche "Impossible de charger le catalogue pour l'instant. Réessaie avec une connexion." avec un bouton "Réessayer" (UX-DR12, Story 1.3)

**And** l'ensemble des microcopies suit le ton léger défini (ex: "12/48 saveurs goûtées", jamais "Progression : 25% complétée") (UX-DR15)

---

### Story 1.8: PWA installable

As a utilisateur (Johan),
I want pouvoir installer Crounch comme une app sur mon téléphone, avec l'app shell qui se charge instantanément même hors-ligne,
So that l'ouvrir en rayon soit aussi rapide qu'une app native, sans dépendre d'un chargement réseau de l'interface elle-même.

**Acceptance Criteria:**

**Given** le projet buildé avec Serwist (`@serwist/next`)
**When** l'app est visitée sur mobile
**Then** un manifest PWA permet l'installation ("Ajouter à l'écran d'accueil")

**Given** le service worker Serwist actif
**When** l'app est rouverte hors-ligne
**Then** l'app shell (HTML/CSS/JS) se charge depuis le precache — sans dépendre du réseau

**And** l'URL distante du Catalogue (`data/catalogue.json` via `raw.githubusercontent.com`) est explicitement exclue du precache/runtime-cache de Serwist, pour que `lib/catalogue/` reste seul propriétaire de la fraîcheur des données (AD-2)

---

### Story 1.9: Outil de scraping et mise à jour du Catalogue

As a mainteneur (Johan),
I want lancer un script CLI qui scrape les données de saveurs depuis brets.fr et Open Food Facts et régénère `data/catalogue.json`,
So that je puisse ajouter une nouvelle saveur au Catalogue sans jamais toucher au code de l'app ni la redéployer.

**Acceptance Criteria:**

**Given** le script CLI (Node.js/TypeScript, dans `scripts/`)
**When** il est exécuté
**Then** il scrape brets.fr et Open Food Facts, priorise brets.fr en cas de divergence (nom, visuel, statut), et régénère `data/catalogue.json` (FR5, AD-5)

**Given** une Saveur présente sur les deux sources avec des données ambiguës (ex: variantes de nom)
**When** le script tente de les rapprocher
**Then** il applique une clé de matching canonique documentée, avec une table de correspondance maintenue pour les cas ambigus — jamais une fusion automatique silencieuse (AD-5)

**Given** une Saveur qui disparaît de brets.fr (discontinuée)
**When** le script régénère le Catalogue
**Then** cette Saveur reste dans `data/catalogue.json` avec le statut `archived` — elle n'est jamais supprimée (AD-1)

**Given** le JSON généré
**When** il est produit
**Then** il est validé contre `lib/schema/` (Story 1.2) avant d'être committé — un JSON non conforme au schéma ne doit jamais être committé (AD-7)

**And** le script est ré-exécutable pour intégrer de nouvelles saveurs sans intervention manuelle sur les entrées existantes, en exécution manuelle (pas de cron) (FR5)
