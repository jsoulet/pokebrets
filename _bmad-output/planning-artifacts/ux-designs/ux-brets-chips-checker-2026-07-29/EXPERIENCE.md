---
title: Crounch — Experience
status: final
sources:
  - ../../prds/prd-brets-chips-checker-2026-07-29/prd.md
  - ../../../implementation-artifacts/2-1-notation-des-saveurs-en-etoiles.md
  - ../../../implementation-artifacts/2-2-tri-du-catalogue-alphabetique-ou-par-note.md
  - ../../../implementation-artifacts/2-3-filtre-afficher-uniquement-les-saveurs-non-goutees.md
updated: 2026-08-14
---

# Crounch — Experience Spine

## Foundation

Surface unique responsive (mobile-first, adapté desktop). shadcn/ui sur Next.js + Tailwind — voir `DESIGN.md` pour l'identité visuelle. Pas de compte, pas d'authentification : un seul utilisateur implicite par appareil, son état "goûté" vit en local storage sur cet appareil (pas de synchronisation entre appareils, cf. PRD FR-4). `DESIGN.md` est la référence visuelle ; cette spine décrit le comportement.

## Information Architecture

| Surface | Atteinte depuis | Rôle |
|---|---|---|
| Catalogue (accueil) | Ouverture de l'app | Grille de toutes les saveurs, coche goûtée/pas goûtée, progression globale |
| Détail d'une saveur | Tap sur l'icône info d'un chip-tile | Visuel agrandi + nom + statut, pour confirmer visuellement une saveur avant de cocher |

Pas de navigation secondaire, pas de menu, pas de tabs — l'app tient sur un seul écran principal. Le Détail est une `Dialog` superposée au Catalogue, jamais une page séparée.

→ Référence de composition : `mockups/key-catalogue.html` (grille Catalogue, Epic 1), `mockups/key-detail-dialog.html` (Dialog de détail, Epic 1), `mockups/key-catalogue-epic2.html` (barre d'outils tri/filtre + badges notation + contrôle étoiles, Epic 2). La spine gagne en cas de conflit avec ces mocks.

## Voice and Tone

Microcopy. Le ton et la posture de marque vivent dans `DESIGN.md.Brand & Style`.

| Do | Don't |
|---|---|
| "12/48 saveurs goûtées" | "Progression : 25% complétée." |
| "Chargement du catalogue..." | "Veuillez patienter pendant le chargement des données." |
| "Hors ligne — dernière version connue affichée" | "Erreur réseau : impossible de récupérer les données." |
| "Cette saveur n'est plus produite" (badge archivée) | "STATUT : DISCONTINUÉ" |
| Ton léger, à la première personne implicite ("goûtée", pas "consommée") | Vocabulaire administratif ou corporate |

## Component Patterns

Comportemental. Les specs visuelles vivent dans `DESIGN.md.Components`.

| Composant | Usage | Règles comportementales |
|---|---|---|
| Chip-tile | Catalogue | Un tap bascule l'état goûtée/pas goûtée avec retour visuel immédiat (optimistic update, écriture en local storage dans la foulée). Le fond de la tuile reste neutre dans les deux états ; un petit badge coche apparaît/disparaît en coin pour marquer "goûtée" — pas de remplissage plein de couleur (jugé trop "feu tricolore"). Une saveur archivée reste tapable pour cocher/décocher mais affiche le badge "archivée" en permanence, fond légèrement grisé. |
| Icône info (sur chip-tile) | Catalogue | Tap ouvre la Dialog de détail sans changer l'état goûté/pas goûté — action distincte du tap principal sur la tuile. |
| Barre de progression / compteur | Header du Catalogue | Affiche "X/N saveurs goûtées" en continu, mis à jour immédiatement à chaque toggle. |
| Dialog détail | Ouverte depuis l'icône info | Visuel agrandi de la saveur, nom, statut (active/archivée), et un bouton pour basculer l'état goûté/pas goûté (redondant avec le tap sur la tuile, pour les cas où l'utilisateur veut confirmer visuellement avant de cocher). |
| Skeleton | Chargement initial du Catalogue | Grille de tuiles grises animées le temps du fetch JSON, résout dès réception des données. |
| Contrôle étoiles (5 étoiles) *(Epic 2)* | Dialog détail | Un tap sur une étoile attribue la note correspondante (1-5), optimistic update immédiat en local storage, indépendant du toggle goûté/pas goûté. Un tap sur l'étoile de la note déjà active retire la note. Jamais couplé au statut "goûté" (deux états indépendants). |
| Badge notation *(Epic 2)* | Chip-tile | Petit badge "★ N" en coin bas-droit de la tuile, visible uniquement si la saveur est notée. N'intercepte jamais le tap principal (bascule goûté/pas goûté) ni le tap sur l'icône info. |
| Toolbar sort control *(Epic 2 — Story 2.2)* | Au-dessus de la grille, sous le zigzag | Segmented control "Alphabétique" / "Par note" ; changer de mode réordonne la grille immédiatement sans rechargement. Défaut : Alphabétique. Saveurs non notées toujours en fin de classement en mode "Par note". Préférence mémorisée entre les sessions. |
| Toolbar filter toggle *(Epic 2 — Story 2.3)* | Au-dessus de la grille, sous le zigzag, à droite du toolbar sort control | Interrupteur "Non goûtées uniquement" ; activé, ne masque de la grille que les saveurs déjà goûtées — le compteur de progression du header continue de compter sur l'ensemble du Catalogue, jamais sur le sous-ensemble filtré. Désactivé par défaut. Préférence mémorisée entre les sessions. |
| Badge goûtée | Chip-tile | Purement informatif, ne réagit à aucune interaction propre ; apparaît/disparaît avec le toggle de la tuile (cf. état "Toggle réussi" ci-dessous). |
| Badge archivée | Chip-tile | Purement informatif, permanent tant que la saveur est archivée ; n'intercepte aucun tap, la tuile reste cochable en-dessous. |
| Button primary | Dialog détail | Bouton de bascule goûté/pas goûté dans la Dialog ; comportement redondant avec le tap sur la tuile (cf. ligne `Dialog détail`). |
| Section divider | Entre le header et le corps de page | Purement décoratif, aucune interaction ; ne doit jamais chevaucher ou masquer un élément tapable. |

## State Patterns

| État | Surface | Traitement |
|---|---|---|
| Chargement initial | Catalogue | `Skeleton` grille (forme des chip-tiles), résout dès réception du JSON. |
| Hors ligne avec cache | Catalogue | Bannière discrète en haut : "Hors ligne — dernière version connue affichée." Toggle goûté/pas goûté reste utilisable normalement. |
| Hors ligne sans cache (tout premier lancement) | Catalogue | État vide explicite : "Impossible de charger le catalogue pour l'instant. Réessaie avec une connexion." + bouton "Réessayer." |
| Saveur archivée | Chip-tile | Badge pilule "archivée" visible en permanence sur la tuile, reste cochable. |
| Toggle réussi | Chip-tile | Le badge coche "goûtée" apparaît/disparaît instantanément en coin de la tuile (`{colors.success}`), le fond de la tuile ne change pas — pas de confirmation modale. |
| Note attribuée/retirée *(Epic 2)* | Chip-tile + Dialog | Le badge "★ N" apparaît/disparaît instantanément en coin bas-droit de la tuile, sans confirmation modale — même philosophie optimistic update que le toggle goûté/pas goûté. |
| Filtre actif sans résultat *(Epic 2 — Story 2.3)* | Catalogue | Si toutes les saveurs sont déjà goûtées et le filtre "non goûtées" actif, message dédié positif à la place de la grille vide (ex. "Bravo, tu as tout goûté ! 🎉") — jamais un espace blanc silencieux. |
| Ouverture sans note | Dialog détail | Contrôle étoiles affiché à 0 étoile pleine (aucune sélection) ; aucun badge notation associé tant qu'aucune étoile n'est tapée. |
| Ouverture avec note existante | Dialog détail | Contrôle étoiles pré-rempli jusqu'à la note enregistrée ; cohérent avec le badge "★ N" déjà visible sur la tuile avant ouverture. |
| Saveur archivée (détail) | Dialog détail | Le bouton de bascule goûté/pas goûté reste actif (comportement identique au chip-tile archivé) ; le badge "archivée" est répété dans la Dialog pour rester visible sans avoir à la fermer. |
| Échec d'écriture locale (quota/stockage plein) | Chip-tile + Dialog | Le toggle/la note revient visuellement à son état précédent (rollback de l'optimistic update) et un `Toast` signale l'échec ("Impossible d'enregistrer, réessaie") — jamais un état incohérent silencieux entre la tuile et la Dialog. |

## Interaction Primitives

**Tactile d'abord, un tap = une action.** L'usage principal se fait debout en rayon de supermarché — chaque interaction doit être immédiate, sans étape intermédiaire.

- **Tap sur un chip-tile** — bascule l'état goûté/pas goûté (action principale, la plus fréquente).
- **Tap sur l'icône info** — ouvre le détail visuel de la saveur, sans toggle.
- **Tap en dehors / Échap** — ferme la Dialog de détail.
- **Souris (desktop)** : mêmes actions au clic ; pas de raccourcis clavier dédiés — l'app est trop simple pour en justifier.
- **Tap sur une étoile (Dialog, Epic 2)** — attribue la note correspondante ; retap sur la même étoile la retire. N'ouvre ni ne ferme jamais la Dialog, ne touche jamais le statut goûté/pas goûté.
- **Tap sur le toolbar sort control (Epic 2)** — change immédiatement l'ordre de la grille, sans étape de confirmation.
- **Tap sur le toolbar filter toggle (Epic 2)** — bascule instantanément la grille filtrée/complète, réactif à tout changement d'état goûté pendant qu'il reste actif.

**Banni :** confirmation modale avant de cocher/décocher (ça casse la rapidité du geste), swipe-to-delete ou tout geste caché non découvrable.

## Accessibility Floor

Comportemental. Le contraste visuel vit dans `DESIGN.md`.

- WCAG 2.2 AA sur toute la surface responsive.
- Zone de tap des chip-tiles ≥ 44×44px, y compris sur mobile.
- Le lecteur d'écran annonce le changement d'état au toggle : "{Nom de la saveur}, goûtée" / "{Nom de la saveur}, pas goûtée."
- La Dialog de détail est pilotable au clavier (`Tab`, `Enter`, `Échap`) pour l'usage desktop.
- Le badge "archivée" est annoncé par le lecteur d'écran comme information, pas seulement visuel (pas de sens porté uniquement par la couleur).
- **Contrôle étoiles (Epic 2)** : chaque étoile est un bouton focusable individuellement avec un `aria-label` explicite ("Noter {n} étoiles sur 5") — jamais un slider ni un groupe non focusable un par un.
- **Toolbar sort control / toolbar filter toggle (Epic 2)** : l'état actif est restitué explicitement aux technologies d'assistance (`aria-pressed`/`role="radiogroup"` pour le tri, `role="switch"` + `aria-checked` pour le filtre) — jamais une information portée uniquement par un changement de couleur.

## Responsive & Platform

| Breakpoint | Comportement |
|---|---|
| `< sm` (mobile portrait, usage principal) | Grille 2-3 colonnes de chip-tiles, header compact avec compteur de progression. |
| `md` (tablette) | Grille 4-5 colonnes. |
| `≥ lg` (desktop) | Grille 6+ colonnes, largeur de contenu plafonnée pour rester lisible (pas de grille qui s'étire à l'infini). |

L'app reste utilisable confortablement sur desktop (JTBD "après avoir goûté un nouveau paquet, chez soi") mais le design mobile-first prime sur les choix de densité et de taille de tap target.

## Inspiration & Anti-patterns

- **Inspiré des pokédex / apps de collection** — grille de tuiles, état visuel binaire clair (goûté/pas goûté), badge pour les éléments indisponibles plutôt que suppression.
- **Inspiré de l'identité brets.fr** (`DESIGN.md > Colors/Typography/Shapes`, imports `imports/brets-fr-01..06`) — fond crème, jaune moutarde, séparateurs zigzag, duo display-contour/serif. Repris pour la palette et le ton visuel uniquement ; la mise en page vitrine e-commerce (hero pleine page, grille produits cliquables vers fiche détaillée, bandeaux argumentaires) n'est pas transposée telle quelle — l'app reste une grille de collection dense, pas un site produit.
- **Rejeté — comptes utilisateurs et classements sociaux** — l'app reste privée par appareil ; pas de comparaison entre utilisateurs (décision produit explicite).
- **Rejeté — confirmation avant chaque toggle** — casserait la rapidité d'usage en rayon, le cas d'usage central.
- **Hors périmètre UX** — l'outil de scraping/mise à jour du catalogue (FR-5 du PRD) est un script/CLI sans interface graphique ; il ne fait pas partie de cette spine d'expérience utilisateur.

## Key Flows

*(FR-5 du PRD — l'outil de scraping/mise à jour du catalogue — est un script/CLI sans interface graphique, hors périmètre de cette spine UX ; cf. `Inspiration & Anti-patterns > Hors périmètre UX`.)*

### Flow 1 — Vérification en rayon (Johan, devant le rayon chips)

1. Johan a un paquet de chips Brets "Crème & Ciboulette" en main, hésite à l'acheter.
2. Il ouvre l'app sur son téléphone. Le Catalogue affiche directement la grille, chargée depuis le cache local (rapide, pas d'attente réseau perceptible).
3. Il repère visuellement la tuile "Crème & Ciboulette" dans la grille.
4. **Climax :** le badge coché est déjà visible en coin de la tuile ("goûtée") — il sait immédiatement qu'il l'a déjà essayée, sans avoir à se souvenir. Il repose le paquet et cherche une tuile sans badge dans la grille.
5. Résolution : il en repère une non goûtée, la prend, et se dirige vers la caisse.

### Flow 2 — Marquer une nouvelle saveur (Johan, chez lui après avoir goûté un paquet)

1. Johan vient de terminer un paquet "Barbecue Fumé" qu'il n'avait jamais goûté avant.
2. Il ouvre l'app, repère la tuile grise correspondante dans le Catalogue.
3. Il tape sur la tuile.
4. **Climax :** le badge coché apparaît instantanément en coin de la tuile, le compteur d'en-tête passe de "12/48" à "13/48" — retour immédiat, sans écran de confirmation.
5. Résolution : il ferme l'app, sa collection est à jour pour la prochaine fois.

**Cas limite :** s'il n'est pas sûr d'avoir bien identifié la bonne saveur (visuel ambigu), il tape sur l'icône info de la tuile pour ouvrir le Détail et comparer le visuel agrandi au paquet réel avant de valider le toggle.

### Flow 3 — Noter, trier et retrouver ses saveurs restantes *(Epic 2, Johan quelques semaines après avoir commencé sa collection)*

1. Johan a maintenant coché une trentaine de saveurs. Il vient de goûter "Barbecue Fumé" et l'a trouvé excellent.
2. Il tape sur l'icône info de la tuile pour ouvrir le Détail, puis tape sur la 5ᵉ étoile du contrôle : la note s'enregistre instantanément, le badge "★ 5" apparaît en coin bas-droit de la tuile dès la fermeture de la Dialog.
3. Curieux de revoir ses coups de cœur, il tape sur le toolbar sort control et passe de "Alphabétique" à "Par note" : la grille se réordonne immédiatement, ses saveurs les mieux notées remontent en tête, les non-notées finissent en fin de liste.
4. Il repasse en rayon plus tard et active le toolbar filter toggle "Non goûtées uniquement" pour se concentrer sur ce qu'il lui reste à découvrir : la grille ne montre plus que les tuiles sans badge "goûtée", le compteur d'en-tête continue d'afficher "31/48" (le total réel, pas le sous-ensemble filtré).
5. **Climax :** il repère une nouvelle saveur jamais goûtée grâce à cette vue épurée, la prend en rayon avec confiance.
6. Résolution : de retour chez lui, il désactive le filtre — sa vue complète et sa préférence de tri sont restées mémorisées d'une session à l'autre, rien à reconfigurer.

**Cas limite :** s'il a déjà tout goûté et que le filtre "non goûtées" reste actif, la grille vide affiche "Bravo, tu as tout goûté ! 🎉" au lieu d'un espace blanc (cf. `State Patterns > Filtre actif sans résultat`).
