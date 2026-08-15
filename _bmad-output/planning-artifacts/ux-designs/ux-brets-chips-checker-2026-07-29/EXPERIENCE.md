---
title: Crounch — Experience
status: final
sources:
  - ../../prds/prd-brets-chips-checker-2026-07-29/prd.md
  - ../../../implementation-artifacts/2-1-notation-des-saveurs-en-etoiles.md
  - ../../../implementation-artifacts/2-2-tri-du-catalogue-alphabetique-ou-par-note.md
  - ../../../implementation-artifacts/2-3-filtre-afficher-uniquement-les-saveurs-non-goutees.md
updated: 2026-08-15
---

# Crounch — Experience Spine

## Foundation

Surface unique responsive (mobile-first, adapté desktop). shadcn/ui sur Next.js + Tailwind — voir `DESIGN.md` pour l'identité visuelle. Pas de compte, pas d'authentification : un seul utilisateur implicite par appareil, son état "goûté" vit en local storage sur cet appareil (pas de synchronisation entre appareils, cf. PRD FR-4). `DESIGN.md` est la référence visuelle ; cette spine décrit le comportement.

`[Review 2026-08-15]` Périmètre formel de cette spine : `UJ-3` et `FR-5` du PRD (l'outil de scraping/mise à jour du catalogue, réservé au mainteneur) sont importés dans `sources:` pour le contexte glossaire/données uniquement — ils renvoient à un script CLI sans interface graphique, donc **hors validation de couverture de flows** pour cette spine d'expérience utilisateur final. Voir `Inspiration & Anti-patterns > Hors périmètre UX` et la note en tête de `Key Flows`.

## Information Architecture

| Surface | Atteinte depuis | Rôle |
|---|---|---|
| Catalogue (accueil) | Ouverture de l'app | Grille de toutes les saveurs, coche goûtée/pas goûtée, progression globale |
| Détail d'une saveur | Tap sur l'icône info d'un chip-tile | Visuel agrandi + nom + statut, pour confirmer visuellement une saveur avant de cocher |

Pas de navigation secondaire, pas de menu, pas de tabs — l'app tient sur un seul écran principal. Le Détail est une `Dialog` superposée au Catalogue, jamais une page séparée.

→ Référence de composition : `mockups/key-catalogue.html` (grille Catalogue, Epic 1), `mockups/key-detail-dialog.html` (Dialog de détail, Epic 1), `mockups/key-catalogue-epic2.html` (barre d'outils tri/filtre + badges notation + contrôle étoiles, Epic 2). La spine prévaut en cas de conflit avec ces mocks.

## Voice and Tone

Microcopy uniquement. Le ton et la posture de marque vivent dans `DESIGN.md.Brand & Style`.

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
| CatalogueTile | Catalogue | Un tap bascule l'état goûtée/pas goûtée avec retour immédiat (optimistic update, écriture en local storage dans la foulée). Une saveur archivée reste tapable pour cocher/décocher. |
| Info button (sur la tuile) | Catalogue | Tap ouvre la Dialog de détail sans changer l'état goûté/pas goûté — action distincte du tap principal sur la tuile. |
| Progress bar + compteur texte | Header du Catalogue | Affiche "X/N saveurs goûtées" en continu (compteur, source de vérité) ; les deux représentations de progression sont mises à jour immédiatement à chaque toggle. `[Review 2026-08-15] corrige l'assomption initiale "pas de barre graphique, texte seul"]`. |
| Dialog détail | Ouverte depuis l'Info button | Ouvre le détail d'une saveur avec son statut (active/archivée) et un `Toggle` pour basculer l'état goûté/pas goûté (redondant avec le tap sur la tuile, pour les cas où l'utilisateur veut confirmer qu'il s'agit bien de la bonne saveur avant de cocher). |
| Skeleton | Chargement initial du Catalogue | Grille de tuiles grises animées le temps du fetch JSON, résout dès réception des données. |
| Contrôle étoiles (5 étoiles) *(Epic 2)* | Dialog détail | Un tap sur une étoile attribue la note correspondante (1-5), optimistic update immédiat en local storage, indépendant du toggle goûté/pas goûté. Un tap sur l'étoile de la note déjà active retire la note. Jamais couplé au statut "goûté" (deux états indépendants). `[Review 2026-08-15] ajout d'un effet de survol (desktop)` : passer la souris sur une étoile prévisualise le remplissage jusqu'à celle-ci, sans modifier la note tant qu'il n'y a pas de clic — purement visuel, sans effet sur mobile (pas de hover tactile). |
| Badge notation *(Epic 2)* | CatalogueTile | Visible uniquement si la saveur est notée. N'intercepte jamais le tap principal (bascule goûté/pas goûté) ni le tap sur l'Info button. |
| SortControl *(Epic 2 — Story 2.2)* | Au-dessus de la grille, sous le zigzag, à gauche | Propose "Alphabétique" / "Par note" ; changer de mode réordonne la grille immédiatement sans rechargement. Défaut : Alphabétique. Saveurs non notées toujours en fin de classement en mode "Par note". Préférence mémorisée entre les sessions. |
| TastedFilterControl *(Epic 2 — Story 2.3, étendue)* | Au-dessus de la grille, sous le zigzag, à droite du `SortControl` | `[Review 2026-08-15] remplace l'interrupteur binaire initial par 3 options exclusives]` — propose "Toutes" / "Goûtées" / "Non goûtées". "Non goûtées" masque les saveurs déjà goûtées ; "Goûtées" n'affiche que les saveurs cochées ; le compteur de progression du header continue de compter sur l'ensemble du Catalogue, jamais sur le sous-ensemble filtré affiché. Défaut : "Toutes". Préférence mémorisée entre les sessions (migration automatique depuis l'ancien format booléen pour les utilisateurs déjà installés). |
| Badge goûtée | CatalogueTile | Purement informatif, ne réagit à aucune interaction propre ; apparaît/disparaît avec le toggle de la tuile (cf. état "Toggle réussi" ci-dessous). |
| Badge archivée | CatalogueTile | Purement informatif, permanent tant que la saveur est archivée ; n'intercepte aucun tap, la tuile reste cochable en-dessous. |
| Toggle "goûté" (Dialog) | Dialog détail | Bouton pilule de bascule goûté/pas goûté dans la Dialog ; comportement redondant avec le tap sur la tuile (cf. ligne `Dialog détail`). |
| Section divider | Entre le header et le corps de page | Purement décoratif, aucune interaction ; ne doit jamais chevaucher ou masquer un élément tapable. |
| SiteFooter | Bas de toutes les pages | Purement informatif (disclaimer légal), aucune interaction ; hors flux Catalogue/Dialog. |

## State Patterns

| État | Surface | Traitement |
|---|---|---|
| Chargement initial | Catalogue | `Skeleton` grille (forme des chip-tiles), résout dès réception du JSON. |
| Hors ligne avec cache | Catalogue | Bannière discrète en haut : "Hors ligne — dernière version connue affichée." Toggle goûté/pas goûté reste utilisable normalement. |
| Hors ligne sans cache (tout premier lancement) | Catalogue | État vide explicite : "Impossible de charger le catalogue pour l'instant. Réessaie avec une connexion." + bouton "Réessayer." |
| Saveur archivée | CatalogueTile | Badge pilule "archivée" visible en permanence sur la tuile, reste cochable. |
| Toggle réussi | CatalogueTile | Le badge coche "goûtée" apparaît/disparaît instantanément en coin de la tuile, le fond de la tuile ne change pas — pas de confirmation modale. |
| Note attribuée/retirée *(Epic 2)* | CatalogueTile + Dialog | Le badge "★ N" apparaît/disparaît instantanément en coin bas-droit de la tuile, sans confirmation modale — même philosophie optimistic update que le toggle goûté/pas goûté. |
| Filtre "Non goûtées" actif sans résultat *(Epic 2 — Story 2.3)* | Catalogue | Si toutes les saveurs sont déjà goûtées et le filtre "Non goûtées" actif, message dédié positif à la place de la grille vide : "Bravo, tu as tout goûté ! 🎉" — jamais un espace blanc silencieux. |
| Filtre "Goûtées" actif sans résultat *(Epic 2 — Story 2.3, étendue)* | Catalogue | Si aucune saveur n'est encore goûtée et le filtre "Goûtées" actif, message dédié à la place de la grille vide : "Tu n'as encore rien goûté." — distinct du message ci-dessus, ton neutre plutôt que célébratoire puisqu'il n'y a rien à féliciter ici. |
| Ouverture sans note | Dialog détail | Contrôle étoiles affiché à 0 étoile pleine (aucune sélection) ; aucun badge notation associé tant qu'aucune étoile n'est tapée. |
| Ouverture avec note existante | Dialog détail | Contrôle étoiles pré-rempli jusqu'à la note enregistrée ; cohérent avec le badge "★ N" déjà visible sur la tuile avant ouverture. |
| Saveur archivée (détail) | Dialog détail | Le bouton de bascule goûté/pas goûté reste actif (comportement identique au chip-tile archivé) ; le badge "archivée" est répété dans la Dialog pour rester visible sans avoir à la fermer. |
| Échec d'écriture locale (quota/stockage plein, navigation privée) | CatalogueTile + Dialog | `[Review 2026-08-15] corrige la description initiale — pas de rollback ni de Toast implémentés]` : tous les modules de cache (goûté/pas goûté, notation, tri, filtre) avalent silencieusement l'exception d'écriture. L'état visuel affiché reste celui de l'action tapée (pas de retour arrière visible), mais rien n'est réellement persisté — au prochain chargement, la préférence retombe à sa dernière valeur sauvegardée avec succès. `[NOTE FOR UX: dégradation silencieuse assumée pour l'instant plutôt qu'un rollback+Toast ; à revisiter si le taux d'échec de stockage s'avère significatif en usage réel]`. |

## Interaction Primitives

**Tactile d'abord, un tap = une action.** L'usage principal se fait debout en rayon de supermarché — chaque interaction doit être immédiate, sans étape intermédiaire.

- **Tap sur un chip-tile** — bascule l'état goûté/pas goûté (action principale, la plus fréquente).
- **Tap sur l'icône info** — ouvre le détail visuel de la saveur, sans toggle.
- **Tap en dehors / Échap** — ferme la Dialog de détail.
- **Souris (desktop)** : mêmes actions au clic ; pas de raccourcis clavier dédiés — l'app est trop simple pour en justifier.
- **Tap sur une étoile (Dialog, Epic 2)** — attribue la note correspondante ; retap sur la même étoile la retire. N'ouvre ni ne ferme jamais la Dialog, ne touche jamais le statut goûté/pas goûté.
- **Tap sur le SortControl (Epic 2)** — change immédiatement l'ordre de la grille, sans étape de confirmation.
- **Tap sur une option du TastedFilterControl (Epic 2)** — bascule instantanément la grille vers "Toutes" / "Goûtées" / "Non goûtées", réactif à tout changement d'état goûté pendant qu'une option filtrée reste active.

**Banni :** confirmation modale avant de cocher/décocher (ça casse la rapidité du geste), swipe-to-delete ou tout geste caché non découvrable.

## Accessibility Floor

Comportemental. Le contraste visuel vit dans `DESIGN.md`.

- WCAG 2.2 AA sur toute la surface responsive.
- Zone de tap des chip-tiles ≥ 44×44px, y compris sur mobile.
- Le lecteur d'écran annonce le changement d'état au toggle : "{Nom de la saveur}, goûtée" / "{Nom de la saveur}, pas goûtée."
- La Dialog de détail est pilotable au clavier (`Tab`, `Enter`, `Échap`) pour l'usage desktop.
- Le badge "archivée" est annoncé par le lecteur d'écran comme information, pas seulement visuel (pas de sens porté uniquement par la couleur).
- **Contrôle étoiles (Epic 2)** : chaque étoile est un bouton focusable individuellement avec un `aria-label` explicite du type "Noter {n} étoile(s) sur 5" — jamais un slider ni un groupe non focusable un par un.
- **SortControl / TastedFilterControl (Epic 2)** : l'état actif est restitué explicitement aux technologies d'assistance via `aria-pressed` sur chaque bouton du groupe (`ToggleGroup`, `role="group"` + `aria-label` global décrivant le contrôle) — jamais une information portée uniquement par un changement de couleur. `[Review 2026-08-15] corrige l'assomption initiale "role=radiogroup" / "role=switch"` — l'implémentation partagée par les deux contrôles (y compris le `TastedFilterControl` désormais à 3 options) utilise `aria-pressed`, pas ces rôles ARIA dédiés.

## Responsive & Platform

| Breakpoint | Comportement |
|---|---|
| `< sm` (mobile portrait, usage principal) | Grille **2 colonnes** de chip-tiles (`grid-cols-2`), gaps/padding resserrés, header compact avec compteur de progression + barre graphique. |
| `sm` (mobile large / petite tablette) | Grille **3 colonnes** (`sm:grid-cols-3`), gaps/padding élargis. |
| `≥ lg` (tablette large / desktop) | Grille **4 colonnes** (`lg:grid-cols-4`), gaps/padding encore élargis ; largeur de contenu plafonnée à `max-w-6xl` pour rester lisible (pas de grille qui s'étire à l'infini). `[Review 2026-08-15] corrige l'assomption initiale "md: 4-5 colonnes / lg: 6+ colonnes" — l'implémentation retenue plafonne à 4 colonnes même en très large, pour garder des tuiles assez grandes]`. |

`[NOTE FOR UX]` : le saut `sm→lg` (3 puis 4 colonnes) est ressenti par l'utilisateur comme rapide sur certaines largeurs intermédiaires — pas de palier dédié entre les deux pour l'instant ; à surveiller si un besoin de densité intermédiaire émerge.

L'app reste utilisable confortablement sur desktop (JTBD "après avoir goûté un nouveau paquet, chez soi") mais le design mobile-first prime sur les choix de densité et de taille de tap target.

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
3. Curieux de revoir ses coups de cœur, il tape sur le `SortControl` et passe de "Alphabétique" à "Par note" : la grille se réordonne immédiatement, ses saveurs les mieux notées remontent en tête, les non-notées finissent en fin de liste.
4. Il repasse en rayon plus tard et tape l'option "Non goûtées" du `TastedFilterControl` pour se concentrer sur ce qu'il lui reste à découvrir : la grille ne montre plus que les tuiles sans badge "goûtée", le compteur d'en-tête continue d'afficher "31/48" (le total réel, pas le sous-ensemble filtré).
5. **Climax :** il repère une nouvelle saveur jamais goûtée grâce à cette vue épurée, la prend en rayon avec confiance.
6. Résolution : de retour chez lui, il repasse sur "Toutes" — sa vue complète et sa préférence de tri sont restées mémorisées d'une session à l'autre, rien à reconfigurer.

**Cas limite :** s'il a déjà tout goûté et que le filtre "Non goûtées" reste actif, la grille vide affiche "Bravo, tu as tout goûté ! 🎉" au lieu d'un espace blanc (cf. `State Patterns > Filtre "Non goûtées" actif sans résultat`). Symétriquement, s'il n'a encore rien goûté et bascule sur "Goûtées", la grille vide affiche "Tu n'as encore rien goûté." (cf. `State Patterns > Filtre "Goûtées" actif sans résultat`).

## Inspiration & Anti-patterns

- **Inspiré des pokédex / apps de collection** — grille de tuiles, état visuel binaire clair (goûté/pas goûté), badge pour les éléments indisponibles plutôt que suppression.
- **Inspiré de l'identité brets.fr** (`DESIGN.md > Colors/Typography/Shapes`, imports `imports/brets-fr-01..06`) — fond crème, jaune moutarde, séparateurs zigzag, duo display-contour/serif. Repris pour la palette et le ton visuel uniquement ; la mise en page vitrine e-commerce (hero pleine page, grille produits cliquables vers fiche détaillée, bandeaux argumentaires) n'est pas transposée telle quelle — l'app reste une grille de collection dense, pas un site produit.
- **Rejeté — comptes utilisateurs et classements sociaux** — l'app reste privée par appareil ; pas de comparaison entre utilisateurs (décision produit explicite).
- **Rejeté — confirmation avant chaque toggle** — casserait la rapidité d'usage en rayon, le cas d'usage central.
- **Hors périmètre UX** — l'outil de scraping/mise à jour du catalogue (FR-5 du PRD) est un script/CLI sans interface graphique ; il ne fait pas partie de cette spine d'expérience utilisateur.
