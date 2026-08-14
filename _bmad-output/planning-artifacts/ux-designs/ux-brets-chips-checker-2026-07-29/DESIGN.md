---
name: Crounch
description: Petit tracker perso/entre potes des saveurs de chips Brets goûtées. shadcn/ui sur Next.js + Tailwind ; ce DESIGN.md s'inspire fortement de l'identité du site officiel brets.fr (fond crème, jaune moutarde, bordure zigzag façon sachet ouvert, duo typo display-contour + serif) sans la copier fidèlement. [ASSUMPTION: palette exacte et valeurs de police inférées par pipette sur captures d'écran brets.fr (voir imports/brets-fr-0*.png) — à valider visuellement]
colors:
  # Overrides de marque sur shadcn. Tokens non listés héritent des défauts
  # shadcn (foreground, muted, muted-foreground, popover, popover-foreground,
  # card, card-foreground, border, input, ring, destructive).
  primary: '#DDA138'
  primary-foreground: '#241A08'
  accent: '#E8482C'
  accent-foreground: '#FFFDF7'
  success: '#3FA34D'
  success-foreground: '#FFFDF7'
  archived: '#C9C2B4'
  archived-foreground: '#6B6456'
  background: '#FDF0DD'
typography:
  # Polices réelles inspectées sur brets.fr (CSS @font-face) :
  # - display -> "Post No Bills Jaffna" ExtraBold (gros titres blocs, ex: "NOS CHIPS")
  # - tagline -> "Recoleta" (serif arrondi des accroches, ex: "qui scrounch scrounch")
  # - body    -> "Inter" (police système du site, remplace l'assomption Geist Sans)
  # [ASSUMPTION: Recoleta est une police commerciale (Latinotype) — licence à vérifier avant usage en prod ;
  # un fallback serif libre équivalent (ex: Fraunces) est utilisé dans les mockups HTML en attendant]
  body:
    fontFamily: 'Inter'
    fontWeight: '400'
  display:
    fontFamily: 'Post No Bills Jaffna ExtraBold'
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.15'
    letterSpacing: '-0.01em'
    textStroke: '2px #241A08'
  display-sm:
    fontFamily: 'Post No Bills Jaffna ExtraBold'
    fontSize: 22px
    fontWeight: '800'
    lineHeight: '1.2'
  tagline:
    fontFamily: 'Recoleta'
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.3'
rounded:
  # Plus généreux que les défauts shadcn — lecture ludique/collector plutôt que "outil".
  sm: 8px
  md: 12px
  lg: 16px
  full: 9999px
spacing:
  # Échelle Tailwind/shadcn par défaut inchangée.
components:
  chip-tile:
    background: '{colors.background}'
    radius: '{rounded.lg}'
    border: 'none'
  chip-tile-archived:
    background: '{colors.archived}'
    foreground: '{colors.archived-foreground}'
    radius: '{rounded.lg}'
  badge-tasted:
    background: '{colors.success}'
    foreground: '{colors.success-foreground}'
    radius: '{rounded.full}'
  badge-archived:
    background: '{colors.archived}'
    foreground: '{colors.archived-foreground}'
    radius: '{rounded.full}'
  button-primary:
    background: '{colors.primary}'
    foreground: '{colors.primary-foreground}'
    radius: '{rounded.md}'
  section-divider:
    style: 'zigzag'
    strokeColor: '{colors.primary-foreground}'
  badge-rating:
    background: '{colors.primary}'
    foreground: '{colors.primary-foreground}'
    radius: '{rounded.full}'
  toolbar-sort-control:
    style: 'segmented-pill'
    active-background: '{colors.primary}'
    active-foreground: '{colors.primary-foreground}'
    inactive-background: '{colors.background}'
    inactive-foreground: '{colors.foreground}'
    radius: '{rounded.full}'
  toolbar-filter-toggle:
    style: 'switch'
    on-background: '{colors.primary}'
    off-background: '{colors.muted}'
sources:
  - ../../prds/prd-brets-chips-checker-2026-07-29/prd.md
  - ../../../implementation-artifacts/2-1-notation-des-saveurs-en-etoiles.md
  - ../../../implementation-artifacts/2-2-tri-du-catalogue-alphabetique-ou-par-note.md
  - ../../../implementation-artifacts/2-3-filtre-afficher-uniquement-les-saveurs-non-goutees.md
status: final
created: 2026-07-29
updated: 2026-08-14
---

## Brand & Style

Crounch est un petit carnet de collection, pas un produit sérieux : l'expérience doit donner envie de "cocher la case" comme on complète un pokédex, avec l'énergie d'un paquet de chips qu'on ouvre entre potes. Le ton visuel s'inspire fortement de l'identité du site officiel **brets.fr** (`imports/brets-fr-01..06`) — fond crème chaleureux, jaune moutarde en couleur de marque, gros titres display à contour noir, accroches en serif élégant, séparateurs de section en zigzag façon sachet de chips ouvert — sans en reprendre fidèlement chaque détail : la charte reste plus sobre et centrée sur la grille de collection plutôt que sur un site vitrine produit. Pas de prétention "produit d'entreprise" : shadcn/ui fournit le squelette sobre, la couche de marque ajoute la gourmandise.

## Colors

- **Primary Moutarde-Brets (`#DDA138`)** — couleur de marque directement reprise du jaune moutarde dominant sur brets.fr (bandeaux, boutons, barres du widget Nutri-score, cf. `imports/brets-fr-01-nos-chips-hero.png` et `imports/brets-fr-05-nutriscore-widget.png`). Utilisée sur les boutons primaires, les titres/accents et les éléments d'action.
- **Accent Rouge-Chips (`#E8482C`)** — clin d'œil au rouge des paquets de chips (cf. `imports/brets-fr-06-argument-bandeau.png`), réservé aux micro-interactions ponctuelles (ex: highlight au clic, élément à découvrir). Jamais utilisée pour le chrome ou les bordures neutres.
- **Success Vert (`#3FA34D`)** — utilisée uniquement pour le petit badge/coche "goûtée" sur une tuile. `[ASSUMPTION mise à jour: le remplissage plein de la tuile en vert a été jugé trop "feu tricolore" par l'utilisateur — la tuile reste en fond neutre, seul un badge discret porte la couleur]`.
- **Archived Beige-gris (`#C9C2B4`)** — état "saveur archivée / discontinuée". Neutre et sourd, signale visuellement "rien à faire ici" sans pour autant masquer la case.
- **Background Crème (`#FDF0DD`)** — fond principal de l'app, pipetté sur le fond crème/beige de brets.fr (constant sur `imports/brets-fr-01-nos-chips-hero.png`, `imports/brets-fr-02-catalogue-grille.png` et `imports/brets-fr-03-detail-produit.png`). Remplace le blanc pur par défaut shadcn pour un rendu plus chaleureux/snack.
- **Le reste** (`foreground`, `muted`, `border`, `card`, `popover`, `destructive`) hérite des défauts shadcn. `[ASSUMPTION: pas de dark mode en v1, cf. décision produit]` — un seul jeu de tokens, pas de variante `-dark`. `{colors.foreground}` et `{colors.muted}` référencés par les composants Epic 2 (`toolbar-sort-control`, `toolbar-filter-toggle`) suivent donc les valeurs par défaut du thème shadcn actif (pas de surcharge de marque) — se référer à la config shadcn du projet (`components.json`/thème Tailwind) pour la valeur hex effective, pas dupliquée ici pour éviter la dérive entre les deux sources.

## Typography

Polices identifiées directement dans le CSS de brets.fr (`@font-face`) plutôt qu'estimées visuellement :
- **`body`** en **Inter** — remplace l'assomption initiale (Geist Sans par défaut shadcn) par la police système réellement utilisée par brets.fr. Lisibilité avant tout, y compris en rayon avec une connexion mobile capricieuse.
- **`display`/`display-sm`** en **Post No Bills Jaffna ExtraBold**, la police des gros titres blocs de brets.fr (ex: "NOS CHIPS", "TOUT ÇA EN ÉTANT"), avec un léger contour foncé (`textStroke`) qui reprend son traitement "titre contouré". Utilisé pour le titre de l'app et les titres de section (ex: "X/48 saveurs goûtées"). Police libre (SIL) mais auto-hébergée par brets.fr, absente du catalogue Google Fonts — `[ASSUMPTION: à héberger soi-même (fichier .ttf/.woff) plutôt que de dépendre d'un CDN tiers en production ; mockups HTML utilisent CDNFonts en attendant]`.
- **`tagline`** en **Recoleta**, le serif arrondi des accroches brets.fr (ex: "qui scrounch scrounch"). `[ASSUMPTION: Recoleta est une police commerciale (Latinotype) — licence à acheter/vérifier avant usage en prod ; les mockups HTML utilisent un fallback serif libre visuellement proche (Fraunces) en attendant]`. Réservé à une éventuelle sous-accroche sous le titre principal — usage ponctuel, pas systématique.

Le reste du texte reste en `body` (Inter) — la typo `display`/`tagline` est une touche, pas la voix par défaut.

## Layout & Spacing

Échelle d'espacement Tailwind/shadcn par défaut, inchangée. Layout mobile-first en une colonne de grille (chip-tiles), qui s'étoffe en plusieurs colonnes sur des viewports plus larges (tablette/desktop) — voir `EXPERIENCE.md > Responsive & Platform` pour les breakpoints. Pas de sidebar, pas de navigation multi-niveaux : l'app est volontairement plate (un écran principal, une saveur en détail au clic).

## Elevation & Depth

Hérité de shadcn — ombre légère au survol/actif, pas d'élévation utilisée comme hiérarchie visuelle forte. Les chip-tiles restent plates par défaut ; un léger scale/ombre au clic donne le "feedback tactile" du check.

## Shapes

Plus arrondi que les défauts shadcn — `rounded/lg` (16px) pour les chip-tiles et cartes, `rounded/full` pour les badges (ex: badge "archivée"). L'arrondi généreux renforce le côté "objet de collection ludique" plutôt qu'outil. En clin d'œil à brets.fr, les séparateurs entre grandes sections (ex: header / grille catalogue) peuvent utiliser une découpe en **zigzag** façon bord de sachet ouvert (`components.section-divider`, cf. `imports/brets-fr-04-detail-nutriscore-browser.png` pour le bord dentelé du widget qui inspire ce motif) — un seul niveau d'emphase, réservé aux transitions de section, jamais utilisé comme simple bordure de carte.

## Components

Composants shadcn utilisés tels quels : `Button`, `Dialog` (détail d'une saveur), `Badge`, `Toast`, `Skeleton` (chargement du catalogue), `Checkbox` (peut servir de base au chip-tile).

Composants surchargés / spécifiques à la marque :
- **Chip-tile** — la case de la grille façon bingo/pokédex. Fond neutre (`{colors.background}`) que la saveur soit goûtée ou non ; seule la variante archivée change le fond (`{colors.archived}`). L'état "goûtée" se lit via le badge-tasted, pas via un remplissage de couleur. Comportement détaillé dans `EXPERIENCE.md > Component Patterns`.
- **Badge goûtée** — petit badge rond discret (`{rounded.full}`), coche ou icône, posé en coin de la tuile, ton vert `{colors.success}`.
- **Badge archivée** — petit badge pilule (`{rounded.full}`) apposé sur un chip-tile archivé, ton beige-gris neutre.
- **Button primary** — `{colors.primary}` plein, coins `{rounded.md}`. Les autres variantes (secondary, outline, ghost) héritent des défauts shadcn.
- **Section divider** — filet en zigzag inspiré de brets.fr, séparant le header du corps de page. `[ASSUMPTION: usage ponctuel, à valider visuellement — ne doit pas alourdir une interface qui reste avant tout une grille fonctionnelle]`.
- **Icône info** — petite icône shadcn (`info`/`circle-info`) neutre en coin haut-gauche du chip-tile, discrète (`{colors.foreground}` atténué), jamais un bouton plein ou coloré — ne doit pas rivaliser visuellement avec les badges des autres coins.
- **Barre de progression / compteur** — simple texte `display-sm` ("X/N saveurs goûtées") dans le header, pas de barre de progression graphique — la marque privilégie le chiffre direct à une visualisation supplémentaire.
- **Dialog détail** — `Dialog` shadcn standard (overlay + carte centrée, `{rounded.lg}`), visuel de la saveur en tête, nom en `display-sm`, bouton `button-primary` pour la bascule goûté/pas goûté en pied de Dialog.
- **Skeleton** — `Skeleton` shadcn par défaut (fond gris pulsé), aux dimensions du chip-tile (`{rounded.lg}`), pas de personnalisation de couleur de marque — reste neutre pour signaler clairement un état transitoire.
- **Badge notation** *(Epic 2 — notation en étoiles)* — petit badge pilule (`{rounded.full}`) affichant une icône étoile pleine + la valeur numérique (ex. "★ 4"), fond `{colors.primary}` (moutarde, cohérent avec le reste de la marque — pas de couleur dédiée). Posé en coin bas-droit du chip-tile, seul coin encore libre (info en haut-gauche, badge-tasted en haut-droit). N'apparaît que si la saveur est notée ; jamais de badge vide ou à "0".
- **Contrôle étoiles (5 étoiles)** *(Epic 2)* — dans la Dialog de détail uniquement. 5 icônes étoile individuellement tapables, pleines en `{colors.primary}` jusqu'à la note choisie, contour neutre au-delà. Retap sur l'étoile de la note actuelle = retire la note (revient à "non notée").
- **Toolbar sort control** *(Epic 2 — Story 2.2)* — segmented control deux pilules ("Alphabétique" / "Par note"), option active en fond `{colors.primary}` plein + texte `{colors.primary-foreground}`, option inactive en fond `{colors.background}` + texte `{colors.foreground}`, coins `{rounded.full}` comme les badges. Positionné sous le zigzag, aligné à gauche de la barre d'outils.
- **Toolbar filter toggle** *(Epic 2 — Story 2.3)* — interrupteur/switch classique (piste `{colors.muted}` au repos, `{colors.primary}` activé) avec un label texte à côté ("Non goûtées uniquement") — jamais une icône seule sans texte. Positionné sous le zigzag, aligné à droite de la barre d'outils, sur la même ligne que le sort control sur les viewports assez larges ; repli sur deux lignes empilées si l'espace mobile est insuffisant (à valider visuellement au mockup).

## Do's and Don'ts

| Do | Don't |
|---|---|
| Réserver le vert `success` exclusivement au badge "goûtée" | Remplir toute la tuile en vert/rouge (effet feu tricolore) |
| Réserver le rouge `accent` aux micro-interactions (highlight au clic) | L'utiliser comme couleur de fond ou de chrome |
| Arrondis généreux (`rounded/lg`, `rounded/full`) sur les tiles et badges | Copier les arrondis serrés shadcn par défaut (lecture trop "outil") |
| Une seule colonne de lecture en mobile, grille responsive au-delà | Ajouter une navigation ou un sidebar — l'app reste volontairement plate |
| Utiliser `display` (Post No Bills Jaffna) uniquement pour titre app + titres de section, `tagline` (Recoleta) pour une sous-accroche ponctuelle | Mettre tout le texte en `display` ou `tagline` |
| S'inspirer de brets.fr pour couleurs/zigzag/typo | Copier fidèlement la mise en page vitrine produit de brets.fr (hors sujet : ceci est une grille de collection, pas un site e-commerce) |
| Badge notation en `{colors.primary}` (cohérent avec la marque) | Introduire une nouvelle couleur dédiée à la notation, ou réutiliser `{colors.success}` (réservé au badge "goûtée") |
| Contrôle de tri en segmented-pill à deux options visibles | Cacher les options de tri dans un menu déroulant qui ajoute une étape de clic |
| Filtre "non goûtées" en interrupteur/switch avec label texte | Filtre en icône seule sans texte, ou bouton pilule à bascule qui prête à confusion avec le badge-tasted |
