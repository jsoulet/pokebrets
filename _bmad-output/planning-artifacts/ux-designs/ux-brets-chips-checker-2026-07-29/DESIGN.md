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
  # [Review 2026-08-15] Ajoutés suite à validation UX (review-rubric.md,
  # finding critique "Token completeness") : `foreground`/`muted` étaient
  # consommés par `toolbar-sort-control`/`toolbar-filter-toggle` sans être
  # déclarés. Valeurs = défauts shadcn neutre (pas de surcharge de marque,
  # cf. décision "pas de dark mode v1" ci-dessous), converties en hex depuis
  # `app/globals.css` (`oklch(0.145 0 0)`/`oklch(0.97 0 0)`) pour être
  # auto-suffisantes ici plutôt que déléguées à la config Tailwind.
  foreground: '#0A0A0A'
  muted: '#F5F5F5'
  muted-foreground: '#737373'
  # Nuance sourde du vert `success`, utilisée uniquement par le badge
  # "goûtée" (contrairement à `success` qui reste réservé à la barre de
  # progression) — cf. Colors, note sur l'effet de vibration optique.
  tasted-badge: '#8FBF98'
  # Terracotta du titre de la Dialog de détail (kicker "SAVEUR" + nom de la
  # saveur), repris du traitement typographique des sachets brets.fr.
  dialog-title: '#B5652E'
typography:
  # Polices réelles auto-hébergées dans `app/fonts/` (remplace l'assomption
  # initiale "Post No Bills Jaffna" — jamais utilisée en prod, imprécision
  # corrigée suite à validation UX du 2026-08-15) :
  # - display -> "Tanker" (titre "CROUNCH", kickers, boutons/pilules, badges)
  # - tagline -> "Recoleta" Semi-Bold (nom des saveurs en tuile + Dialog)
  # - body    -> "Inter" (police système du site, remplace l'assomption Geist Sans)
  body:
    fontFamily: 'Inter'
    fontWeight: '400'
  display:
    fontFamily: 'Tanker'
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.15'
    letterSpacing: '0.02em'
    # Le contour se fait désormais via une pile de `text-shadow` décalées à
    # 1px sur tout le pourtour (meilleur rendu que `-webkit-text-stroke`
    # avec cette police, support cross-navigateur) plutôt qu'un simple
    # `textStroke` — voir `catalogue-page-client.tsx` (`TITLE_TEXT_SHADOW`).
    textShadow: 'contour noir 1px tout autour + ombre portée dure décalée'
  display-sm:
    fontFamily: 'Tanker'
    fontSize: 22px
    fontWeight: '400'
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
    background: '{colors.tasted-badge}'
    foreground: '{colors.foreground}'
    border: '2px {colors.foreground}'
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
    fillColor: '{colors.primary}'
    strokeColor: '#000000'
    strokeWidth: '2.5px'
  badge-rating:
    background: '{colors.primary}'
    foreground: '{colors.primary-foreground}'
    radius: '{rounded.full}'
  # [Review 2026-08-15] `toolbar-sort-control`/`tasted-filter-control`
  # partagent désormais le même style "segmented-connected" (radio cassette
  # à l'ancienne) plutôt que des pilules individuelles espacées : un seul
  # contour + une seule ombre portée dure autour du groupe, boutons soudés
  # (séparateur = bordure interne), rayon uniquement aux extrémités.
  toolbar-sort-control:
    style: 'segmented-connected'
    active-background: '{colors.primary}'
    active-foreground: '{colors.foreground}'
    inactive-background: '{colors.background}'
    inactive-foreground: '{colors.foreground}'
    border: '2px {colors.foreground}'
    radius: '{rounded.lg}'
  tasted-filter-control:
    style: 'segmented-connected'
    options: ['Toutes', 'Goûtées', 'Non goûtées']
    active-background: '{colors.primary}'
    active-foreground: '{colors.foreground}'
    inactive-background: '{colors.background}'
    inactive-foreground: '{colors.foreground}'
    border: '2px {colors.foreground}'
    radius: '{rounded.lg}'
  info-button:
    background: '{colors.background}'
    border: '2px {colors.foreground}'
    radius: '{rounded.full}'
  progress-bar:
    track-background: '{colors.background}/40'
    fill-background: '{colors.success}'
    radius: '{rounded.full}'
    maxWidth: 'identique à la grille (voir Layout & Spacing)'
  site-footer:
    foreground: '{colors.muted-foreground}'
    background: '{colors.muted}'
sources:
  - ../../prds/prd-brets-chips-checker-2026-07-29/prd.md
  - ../../../implementation-artifacts/2-1-notation-des-saveurs-en-etoiles.md
  - ../../../implementation-artifacts/2-2-tri-du-catalogue-alphabetique-ou-par-note.md
  - ../../../implementation-artifacts/2-3-filtre-afficher-uniquement-les-saveurs-non-goutees.md
status: final
created: 2026-07-29
updated: 2026-08-15
---

## Brand & Style

Crounch est un petit carnet de collection, pas un produit sérieux : l'expérience doit donner envie de "cocher la case" comme on complète un pokédex, avec l'énergie d'un paquet de chips qu'on ouvre entre potes. Le ton visuel s'inspire fortement de l'identité du site officiel **brets.fr** (`imports/brets-fr-01..06`) — fond crème chaleureux, jaune moutarde en couleur de marque, gros titres display à contour noir, accroches en serif élégant, séparateurs de section en zigzag façon sachet de chips ouvert — sans en reprendre fidèlement chaque détail : la charte reste plus sobre et centrée sur la grille de collection plutôt que sur un site vitrine produit. Pas de prétention "produit d'entreprise" : shadcn/ui fournit le squelette sobre, la couche de marque ajoute la gourmandise.

## Colors

- **Primary Moutarde-Brets (`#DDA138`)** — couleur de marque directement reprise du jaune moutarde dominant sur brets.fr (bandeaux, boutons, barres du widget Nutri-score, cf. `imports/brets-fr-01-nos-chips-hero.png` et `imports/brets-fr-05-nutriscore-widget.png`). Utilisée sur les boutons primaires, les titres/accents, les éléments d'action et l'état actif des contrôles segmentés (tri, filtre). **Contraste :** `{colors.primary}` + `{colors.foreground}` (texte noir dessus, cf. Do's and Don'ts) ≈ 8.9:1 — largement AA ; `{colors.primary}` + `{colors.primary-foreground}` (bouton primary plein) ≈ AA large text.
- **Accent Rouge-Chips (`#E8482C`)** — clin d'œil au rouge des paquets de chips (cf. `imports/brets-fr-06-argument-bandeau.png`), réservé aux micro-interactions ponctuelles (ex: highlight au clic, élément à découvrir). Jamais utilisée pour le chrome ou les bordures neutres.
- **Success Vert (`#3FA34D`)** — réservé au remplissage de la barre de progression (`components.progress-bar`), jamais au badge "goûtée" (cf. ci-dessous). `[ASSUMPTION mise à jour: le remplissage plein de la tuile en vert a été jugé trop "feu tricolore" par l'utilisateur — la tuile reste en fond neutre, seul un badge discret porte une couleur, désormais distincte de `success`]`.
- **Tasted Badge Vert sourd (`{colors.tasted-badge}`, `#8FBF98`)** — ton dédié au badge "goûtée" sur une tuile, distinct de `success` (utilisé lui pour la barre de progression). `[Review 2026-08-15] Une version plus saturée avait produit un effet de "vibration" optique du texte à la taille du badge (police display + contour noir à `text-xs`) — désaturer la couleur a résolu le problème sans changer la police ni la taille.` Texte du badge en `{colors.foreground}` (noir), jamais en blanc, pour rester lisible sur ce vert clair. **Contraste** texte/fond ≈ 4.7:1 (AA à cette taille de badge).
- **Dialog Title Terracotta (`{colors.dialog-title}`, `#B5652E`)** — couleur dédiée du titre (nom de la saveur) dans la Dialog de détail, reprise du traitement typographique des sachets brets.fr. Réservée à ce seul usage, jamais un texte de chrome général. **Contraste** sur `{colors.background}` ≈ 4.6:1 (AA texte large, cohérent avec sa taille `52px`).
- **Archived Beige-gris (`#C9C2B4`)** — état "saveur archivée / discontinuée". Neutre et sourd, signale visuellement "rien à faire ici" sans pour autant masquer la case.
- **Background Crème (`#FDF0DD`)** — fond principal de l'app, pipetté sur le fond crème/beige de brets.fr (constant sur `imports/brets-fr-01-nos-chips-hero.png`, `imports/brets-fr-02-catalogue-grille.png` et `imports/brets-fr-03-detail-produit.png`). Remplace le blanc pur par défaut de shadcn pour un rendu plus chaleureux/snack.
- **Foreground (`{colors.foreground}`, `#0A0A0A`)** et **Muted (`{colors.muted}`, `#F5F5F5`) / Muted Foreground (`{colors.muted-foreground}`, `#737373`)** — valeurs neutres par défaut de shadcn (gris quasi-noir / gris très clair), sans surcharge de marque. `[Review 2026-08-15] Déclarés explicitement ici (valeurs converties depuis `app/globals.css`) plutôt que délégués à la config Tailwind — consommés directement par `toolbar-sort-control`, `tasted-filter-control`, `info-button`, `site-footer` et les bordures/ombres portées "dures" partagées par tous les contrôles pilule/segmentés (`border-foreground`, `shadow-[…var(--foreground)]`).`
- **Le reste** (`border`, `card`, `popover`, `destructive`) hérite des défauts shadcn — n'est consommé par aucun composant de marque, donc aucune valeur n'est dupliquée ici. `[ASSUMPTION: pas de dark mode en v1, cf. décision produit]` — un seul jeu de tokens, pas de variante `-dark`.

## Typography

Polices auto-hébergées dans `app/fonts/` (fichiers `.otf` fournis, jamais chargées depuis un CDN tiers) :
- **`body`** en **Inter** — remplace l'assomption initiale (Geist Sans par défaut shadcn) par la police système réellement utilisée par brets.fr. Lisibilité avant tout, y compris en rayon avec une connexion mobile capricieuse.
- **`display`/`display-sm`** en **Tanker** — `[Review 2026-08-15] corrige l'assomption initiale "Post No Bills Jaffna", jamais utilisée en prod]`. Utilisée pour le titre "CROUNCH", le kicker "SAVEUR" de la Dialog, et — usage étendu suite au polish visuel — le texte de tous les contrôles pilule/segmentés (`toolbar-sort-control`, `tasted-filter-control`, badge "Goûtée") en majuscules, pas seulement les gros titres de section. Le contour se fait via une pile de `text-shadow` décalées à 1px sur tout le pourtour (meilleur rendu qu'un `text-stroke` avec cette police) plus une ombre portée dure diagonale façon sticker.
- **`tagline`** en **Recoleta** Semi-Bold — `[Review 2026-08-15] usage étendu au-delà de l'accroche ponctuelle initialement prévue]` : c'est désormais la police du **nom de chaque saveur sur la tuile du Catalogue** — pas seulement une sous-accroche occasionnelle sous le titre principal.

Le reste du texte reste en `body` (Inter) — la typo `display`/`tagline` est une touche de marque, pas la voix par défaut.

## Layout & Spacing

Échelle d'espacement Tailwind/shadcn par défaut, inchangée. Layout mobile-first en une colonne de grille (chip-tiles), qui s'étoffe en plusieurs colonnes sur des viewports plus larges (tablette/desktop) — voir `EXPERIENCE.md > Responsive & Platform` pour les breakpoints. Pas de sidebar, pas de navigation multi-niveaux : l'app est volontairement plate (un écran principal, une saveur en détail au clic).

## Elevation & Depth

Hérité de shadcn — ombre légère au survol/actif, pas d'élévation utilisée comme hiérarchie visuelle forte. Les chip-tiles restent plates par défaut ; un léger scale/ombre au clic donne le "feedback tactile" du check.

## Shapes

Plus arrondi que les défauts shadcn — `rounded/lg` (16px) pour les chip-tiles et cartes, `rounded/full` pour les badges (ex: badge "archivée"). L'arrondi généreux renforce le côté "objet de collection ludique" plutôt qu'outil. En clin d'œil à brets.fr, les séparateurs entre grandes sections (ex: header / grille catalogue) peuvent utiliser une découpe en **zigzag** façon bord de sachet ouvert (`components.section-divider`, cf. `imports/brets-fr-04-detail-nutriscore-browser.png` pour le bord dentelé du widget qui inspire ce motif) — un seul niveau d'emphase, réservé aux transitions de section, jamais utilisé comme simple bordure de carte.

## Components

Composants shadcn utilisés tels quels : `Button` (état d'erreur "Réessayer"), `Dialog` (détail d'une saveur, restylé — voir tableau ci-dessous), `Toggle`/`ToggleGroup` (pilule "goûté", contrôles segmentés tri/filtre), `Skeleton` (chargement du catalogue). `[Review 2026-08-15] Retirés de cette liste : `Toast` et `Checkbox`, jamais implémentés en pratique (aucun `useToast`/`Checkbox` dans le code) — à réintroduire ici seulement s'ils sont un jour réellement utilisés (cf. EXPERIENCE.md > État "Échec d'écriture locale", actuellement une dégradation silencieuse sans Toast).`

Composants surchargés / spécifiques à la marque — nom canonique (identique au nom du composant React), rôle, tokens, notes :

| Composant | Rôle | Tokens | Notes |
|---|---|---|---|
| **CatalogueTile** (`catalogue-tile.tsx`) | Case de la grille façon bingo/pokédex | `components.chip-tile` | Fond neutre (`{colors.background}`) que la saveur soit goûtée ou non ; seule la variante archivée change le fond (`{colors.archived}`). L'état "goûtée" se lit via `badge-tasted`, jamais un remplissage de couleur. |
| **Badge goûtée** | Coin de la `CatalogueTile` | `components.badge-tasted` | Pilule (`{rounded.full}`) fond `{colors.tasted-badge}` (vert sourd), contour noir 2px + ombre portée dure, texte `{colors.foreground}` (noir) en `display` majuscule — voir Colors pour la note sur l'effet de vibration optique évité. |
| **Badge archivée** | `CatalogueTile` archivée | `components.badge-archived` | Pilule (`{rounded.full}`), ton beige-gris neutre. |
| **Info button** (bouton "i") | Coin haut-gauche de la `CatalogueTile` | `components.info-button` | `[Review 2026-08-15] remplace l'icône neutre initialement prévue]` — bouton pilule rond assumé, même DA que les contrôles segmentés : fond `{colors.background}` (beige, pas blanc plein), contour noir 2px, ombre portée dure, effet pressed au tap. Trois itérations avant validation utilisateur (trop discret → trop présent → beige = validé). |
| **Button primary** | Bouton "Réessayer" (état d'erreur du Catalogue) | `components.button-primary` | `{colors.primary}` plein, coins `{rounded.md}`. |
| **Section divider** | Entre header et grille | `components.section-divider` | Filet zigzag (dents 14px), fond `{colors.primary}` **et** trait noir 2.5px tracé sur l'arête (SVG `background-image`, pas un `mask` — un masque ne peut pas porter de contour). Usage ponctuel réservé à cette transition, jamais une bordure de carte. |
| **Progress bar** | Header du Catalogue, sous le compteur texte | `components.progress-bar` | `[Review 2026-08-15] ajoutée en plus du compteur texte, contrairement à l'assomption initiale "pas de barre graphique"]` — piste translucide (`{colors.background}/40`) + remplissage `{colors.success}`, largeur alignée sur celle de la grille (pas pleine largeur du bandeau). |
| **Dialog détail** | Ouverte depuis l'Info button | — | `[Review 2026-08-15] réécrite en profondeur : ce n'est plus un Dialog shadcn "standard"]` — mise en page centrée : kicker "SAVEUR" (`display`, `text-sm`, uppercase) → titre = nom de la saveur (`display` **Tanker**, `52px`, couleur `{colors.dialog-title}`, centré, jusqu'à 3 lignes) → visuel → statut → `Toggle` pilule partagé → contrôle étoiles. |
| **Skeleton** | Chargement initial du Catalogue | — | `Skeleton` shadcn par défaut (fond gris pulsé), aux dimensions de la `CatalogueTile` (`{rounded.lg}`), pas de personnalisation de couleur de marque. |
| **Badge notation** *(Epic 2)* | Coin bas-droit de la `CatalogueTile` | `components.badge-rating` | Pilule (`{rounded.full}`) "★ N", fond `{colors.primary}` — pas de couleur dédiée. |
| **Contrôle étoiles (5 étoiles)** *(Epic 2)* | Dialog détail | — | 5 icônes étoile individuellement tapables, pleines en `{colors.primary}` jusqu'à la note choisie, contour neutre au-delà. `[Review 2026-08-15] Effet de survol ajouté]` : `hover:scale-125` par étoile, prévisualisation du remplissage jusqu'à l'étoile survolée sans modifier la note réelle tant qu'il n'y a pas de clic. |
| **SortControl** *(Epic 2 — Story 2.2)* | Toolbar, sous le zigzag, à gauche | `components.toolbar-sort-control` | `[Review 2026-08-15] style "segmented-connected", remplace le "segmented-pill" à pilules espacées initial]` : 2 options ("Alphabétique" / "Par note") soudées dans un même contour, actif en fond `{colors.primary}` + texte `{colors.foreground}`, coins `{rounded.lg}` arrondis uniquement aux extrémités. |
| **TastedFilterControl** *(Epic 2 — Story 2.3, étendue)* | Toolbar, sous le zigzag, à droite du `SortControl` | `components.tasted-filter-control` | `[Review 2026-08-15] remplace l'interrupteur binaire initial]` — segmented control 3 options exclusives ("Toutes" / "Goûtées" / "Non goûtées"), même style `segmented-connected` que `SortControl` pour une DA cohérente entre les deux contrôles de la toolbar. |
| **SiteFooter** | Bas de toutes les pages | `components.site-footer` | Disclaimer légal, fond `{colors.muted}`, texte `{colors.muted-foreground}`. |

## Do's and Don'ts

| Do | Don't |
|---|---|
| Réserver `success` exclusivement au remplissage de la barre de progression | Remplir toute la tuile en vert/rouge (effet feu tricolore), ou l'utiliser pour le badge "goûtée" (`{colors.tasted-badge}` distinct) |
| Réserver le rouge `accent` aux micro-interactions (highlight au clic) | L'utiliser comme couleur de fond ou de chrome |
| Arrondis généreux (`rounded/lg`, `rounded/full`) sur les tiles et badges | Copier les arrondis serrés shadcn par défaut (lecture trop "outil") |
| Une seule colonne de lecture en mobile (2 colonnes dès `sm`), grille responsive au-delà | Ajouter une navigation ou un sidebar — l'app reste volontairement plate |
| Utiliser `display` (**Tanker**) pour le titre app, les kickers et le texte des contrôles pilule/segmentés ; `tagline` (**Recoleta**) pour le nom de chaque saveur | Mettre tout le texte en `display` ou `tagline` |
| S'inspirer de brets.fr pour couleurs/zigzag/typo | Copier fidèlement la mise en page vitrine produit de brets.fr (hors sujet : ceci est une grille de collection, pas un site e-commerce) |
| Badge notation en `{colors.primary}` (cohérent avec la marque) | Introduire une nouvelle couleur dédiée à la notation, ou réutiliser `{colors.success}`/`{colors.tasted-badge}` (déjà réservés ailleurs) |
| Contrôles de tri et de filtre en **segmented-connected** (boutons soudés, un seul contour/ombre autour du groupe) | Retraiter chaque option comme une pilule séparée (espacement individuel), ou cacher les options dans un menu déroulant qui ajoute une étape de clic |
| Filtre goûté/non-goûté en segmented control 3 options ("Toutes" / "Goûtées" / "Non goûtées") avec label texte visible ("Filtrer :") | Filtre en icône seule sans texte, en interrupteur/switch binaire (ne couvre plus le besoin "Goûtées uniquement"), ou bouton pilule à bascule qui prête à confusion avec le badge-tasted |
| Réserver `{colors.dialog-title}` (terracotta) au seul titre de la Dialog de détail | Réutiliser cette couleur ailleurs dans le chrome général |
