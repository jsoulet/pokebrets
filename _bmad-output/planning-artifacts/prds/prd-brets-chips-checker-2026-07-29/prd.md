---
title: Crounch
created: 2026-07-29
updated: 2026-07-29
status: final
---

# PRD: Crounch
*Working title — confirm.*

## 0. Document Purpose
Ce PRD cadre un petit projet personnel/entre amis : une webapp permettant de suivre les saveurs de chips Brets déjà goûtées. Il s'appuie sur la session de brainstorming du 2026-07-29 (`brainstorm-intent.md`). Les FR sont numérotées globalement et regroupées par fonctionnalité ; toutes les hypothèses de départ ont été relues et confirmées (voir §9). Les détails techniques (stack, framework UI, mécanisme exact de scraping) vivent dans `addendum.md`, pas ici.

## 1. Vision
Crounch est une webapp minimaliste qui permet de savoir, en un coup d'œil, quelles saveurs de chips Brets on a déjà goûtées — et lesquelles il reste à découvrir. Pas de compte, pas de partage social, pas de base de données : chacun garde sa propre progression sur son appareil, comme un petit carnet de collection privé. L'app tient sur une page, se lance vite, et transforme une envie de chips en petit jeu de complétion sans jamais se prendre au sérieux.

## 2. Target User

### 2.1 Jobs To Be Done
- En tant qu'utilisateur (moi-même et mes potes), je veux retrouver facilement la liste de toutes les saveurs Brets existantes pour ne pas en oublier une en magasin.
- Je veux pouvoir cocher rapidement une saveur comme "goûtée" pour garder une trace de ma progression, sans créer de compte.
- Je veux visualiser ma collection de façon ludique (grille façon bingo/pokédex) pour que ça reste amusant plutôt qu'une simple checklist administrative.
- En tant que mainteneur du projet (moi), je veux pouvoir mettre à jour facilement le catalogue de saveurs sans re-déployer l'app à chaque changement.

### 2.2 Key User Journeys
*Projet hobby/solo à usage restreint (utilisateur unique par appareil, pas de rôles multiples) — forme allégée, une phrase par parcours.*

- **UJ-1.** Johan, en rayon supermarché, ouvre l'app sur son téléphone pour vérifier s'il a déjà goûté la saveur qu'il a en main, avant de l'acheter ou non.
- **UJ-2.** Johan, chez lui après avoir goûté un nouveau paquet, ouvre l'app et coche la saveur correspondante pour mettre à jour sa collection.
- **UJ-3.** Johan (mainteneur), après la sortie d'une nouvelle saveur Brets, lance l'outil de scraping pour mettre à jour le catalogue JSON hébergé sur GitHub, sans toucher au code de l'app.

## 3. Glossary
- **Saveur** — Une variante de goût de chips Brets (ex: "Barbecue", "Crème & Ciboulette"). Identifiée de façon unique dans le Catalogue.
- **Catalogue** — La liste complète des Saveurs existantes, avec leurs métadonnées (nom, visuel, statut). Stocké sous forme de fichier JSON hébergé sur GitHub, récupéré par l'app à chaque ouverture.
- **État de dégustation** — Pour une Saveur donnée et un Appareil donné, indicateur binaire "goûtée" / "pas goûtée". Stocké en Stockage local, propre à chaque Appareil (pas de synchronisation entre appareils).
- **Appareil** — Le terminal (téléphone, ordinateur) sur lequel l'app est utilisée. Chaque Appareil a son propre État de dégustation, indépendant des autres.
- **Stockage local** — Mécanisme de persistance navigateur (local storage) sur l'Appareil, sans backend ni base de données.
- **Saveur archivée** — Une Saveur qui n'est plus produite/disponible (édition limitée terminée, arrêt de production). Reste visible dans le Catalogue avec un statut visuel distinct.
- **Outil de mise à jour du Catalogue** — Script/outil (hors app utilisateur final) permettant de scraper les données de saveurs depuis le site Brets ou Open Food Facts et de régénérer le fichier JSON du Catalogue.

## 4. Features

### 4.1 Catalogue des saveurs
**Description:** Au chargement, l'app récupère le Catalogue à jour depuis un fichier JSON hébergé sur GitHub (URL publique, accès en lecture seule sans authentification) et affiche toutes les Saveurs sous forme de grille visuelle (façon bingo/pokédex). Réalise UJ-1.

**Functional Requirements:**

#### FR-1: Chargement du Catalogue à jour
Le système peut récupérer le Catalogue depuis son fichier JSON hébergé sur GitHub à chaque ouverture de l'app.

**Consequences (testable):**
- Une requête réseau vers l'URL du JSON est déclenchée à chaque chargement/ouverture de l'app.
- Si la requête échoue (pas de réseau), l'app affiche la dernière version du Catalogue connue localement (le Catalogue est mis en cache localement pour un usage hors-ligne dégradé), ou un état d'erreur clair si aucune version n'est encore disponible.

**Out of Scope:**
- L'app ne permet pas à l'utilisateur final d'éditer le Catalogue.

#### FR-2: Affichage du Catalogue en grille visuelle
L'utilisateur peut visualiser toutes les Saveurs du Catalogue dans une interface en grille (façon bingo/pokédex), chaque Saveur affichant son nom et un visuel associé.

**Consequences (testable):**
- Chaque Saveur du Catalogue apparaît comme une case distincte dans la grille.
- Une Saveur archivée est visuellement distinguable des Saveurs actives (ex: badge ou traitement visuel dédié) sans être supprimée de la grille.

**Feature-specific NFRs:**
- L'affichage doit rester lisible et rapide sur mobile (usage principal en rayon/magasin).

### 4.2 Suivi de dégustation
**Description:** L'utilisateur peut cocher/décocher chaque Saveur comme goûtée ou non. L'État de dégustation est privé, propre à l'Appareil, et persiste entre les sessions sans compte ni backend. Réalise UJ-1, UJ-2.

**Functional Requirements:**

#### FR-3: Marquer une Saveur comme goûtée
L'utilisateur peut cocher une Saveur du Catalogue comme "goûtée" ou revenir en arrière ("pas goûtée").

**Consequences (testable):**
- Le clic sur une Saveur bascule son État de dégustation entre "goûtée" et "pas goûtée".
- L'État de dégustation est écrit en Stockage local immédiatement après l'action, sans action de sauvegarde explicite.

#### FR-4: Persistance de l'État de dégustation
Le système peut restaurer l'État de dégustation de l'utilisateur à chaque réouverture de l'app, sur le même Appareil.

**Consequences (testable):**
- Après fermeture et réouverture de l'app sur le même Appareil, toutes les Saveurs précédemment cochées restent cochées.
- L'État de dégustation n'est jamais transmis à un serveur ni partagé entre Appareils.

**Out of Scope:**
- Pas de synchronisation multi-appareils (acceptable que l'état diffère entre le téléphone et l'ordinateur d'un même utilisateur).
- Pas de partage social des États de dégustation entre utilisateurs différents.

### 4.3 Outil de mise à jour du Catalogue
**Description:** Un outil (script, hors app utilisateur final) permet au mainteneur de scraper les données de saveurs Brets depuis le site officiel Brets ou Open Food Facts, et de régénérer le fichier JSON du Catalogue hébergé sur GitHub. Réalise UJ-3.

**Functional Requirements:**

#### FR-5: Scraping des données de saveurs
Le mainteneur peut lancer un outil qui récupère les informations de saveurs (nom, visuel, statut) depuis le site Brets ou Open Food Facts.

**Consequences (testable):**
- L'outil produit en sortie un fichier JSON conforme au schéma du Catalogue.
- L'outil peut être ré-exécuté pour intégrer de nouvelles saveurs sans intervention manuelle sur chaque entrée existante.

**Out of Scope:**
- Pas d'automatisation planifiée (cron) en v1 — exécution manuelle par le mainteneur suffit.
- Pas d'interface graphique pour cet outil — CLI/script suffit.

**Notes:** *(technique — mécanisme exact de scraping et choix de source détaillés dans `addendum.md`)*

## 5. Non-Goals (Explicit)
- Pas de compte utilisateur ni d'authentification.
- Pas de partage social ou de comparaison entre utilisateurs.
- Pas de scan de code-barre pour identifier une Saveur.
- Pas d'ajout manuel d'une nouvelle Saveur par l'utilisateur final (le Catalogue est entièrement géré via l'Outil de mise à jour).
- Pas de synchronisation multi-appareils.
- Pas de vocation à devenir un produit public ou monétisé.
- Pas d'ambition de scalabilité : le projet reste dimensionné pour un usage perso/entre amis, pas pour un grand nombre d'utilisateurs simultanés.

## 6. MVP Scope

### 6.1 In Scope
- Catalogue complet des Saveurs, récupéré depuis un JSON hébergé sur GitHub à chaque ouverture (FR-1).
- Affichage en grille visuelle façon bingo/pokédex, avec distinction des Saveurs archivées (FR-2).
- Coche "goûtée / pas goûtée" par Saveur, persistée en Stockage local (FR-3, FR-4).
- Outil de scraping/mise à jour du Catalogue (FR-5), même minimal.
- Webapp installable en PWA, mobile-first.

### 6.2 Out of Scope for MVP
- Notation par saveur — différé, potentiellement v2.
- Commentaire par saveur — différé, potentiellement v2.
- Scan de code-barre — jugé overkill (décision issue du brainstorming).
- Ajout manuel de nouvelle saveur par l'utilisateur — écarté (décision issue du brainstorming).

## 7. Success Metrics
*Projet hobby — mesure qualitative simple, pas d'instrumentation dédiée.*

**Primary**
- **SM-1**: Usage réel — Johan (et ses potes) utilisent l'app en rayon ou après avoir goûté une chips, sans l'abandonner après quelques semaines. Validates FR-1, FR-3, FR-4.

**Counter-metrics (do not optimize)**
- **SM-C1**: Ne pas complexifier l'app au point de ralentir son ouverture en rayon (le cas d'usage principal exige rapidité) — ne pas optimiser l'exhaustivité des métadonnées au détriment de la vitesse de chargement. Counterbalances SM-1.

## 8. Open Questions
1. Quelle est la source de vérité prioritaire pour le scraping — site Brets officiel ou Open Food Facts — en cas de divergence de données entre les deux ?
2. Le fichier JSON du Catalogue sur GitHub est-il servi via raw GitHub, GitHub Pages, ou un autre mécanisme (jsDelivr, etc.) ?
3. Faut-il un mode dégradé explicite si le fetch du Catalogue échoue et qu'aucune version locale n'est en cache (premier lancement hors-ligne) ?

## 9. Assumptions Index
*Toutes les hypothèses initiales ont été relues et confirmées avec l'utilisateur le 2026-07-29 (voir `.memlog.md`) — aucune assumption ouverte à ce stade.*
