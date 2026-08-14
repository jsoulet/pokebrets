// Style partagé "bouton pilule" repris du site brets.fr (fond jaune actif,
// contour + ombre portée dure noirs, police display Tanker) — utilisé par
// `SortControl` (tri) et `TastedFilterControl` (filtre) pour une DA
// cohérente entre les deux contrôles de la toolbar du Catalogue (Story
// 2.2/2.3). `aria-pressed:` (pas `data-[state=on]:`) car les primitives
// @base-ui/react `Toggle`/`ToggleGroupItem` exposent l'état pressé via
// l'attribut ARIA natif, jamais via un `data-state` façon Radix.
export const PILL_BUTTON_CLASSNAME =
  "border-foreground bg-background rounded-2xl border-2 px-4 py-2 font-tanker text-sm tracking-wide uppercase shadow-[3px_3px_0px_var(--foreground)] transition-transform hover:-translate-y-0.5 aria-pressed:bg-[#ffc602] active:translate-y-0.5 active:shadow-[1px_1px_0px_var(--foreground)]";

// Style "segmented control à l'ancienne" (radio cassette) : boutons soudés
// les uns aux autres (pas d'espace, séparateur = un simple `divide-x` porté
// par le conteneur), un seul contour + une seule ombre portée dure autour
// du groupe entier (pas par bouton), et seuls les boutons d'extrémité
// gardent un rayon — le/les bouton(s) du milieu restent bien carrés.
// Utilisé par `TastedFilterControl` (3 options) et `SortControl` (2
// options) pour une DA cohérente entre les deux `ToggleGroup` de la
// toolbar du Catalogue. `overflow-hidden` fait le travail de "clipper" les
// coins carrés des boutons d'extrémité à la forme arrondie du conteneur —
// on n'a donc pas besoin de gérer soi-même `first:`/`last:` sur les items.
export const SEGMENTED_GROUP_CLASSNAME =
  "border-foreground bg-background overflow-hidden rounded-2xl border-2 shadow-[3px_3px_0px_var(--foreground)]";

export const SEGMENTED_ITEM_CLASSNAME =
  "border-foreground first:border-l-0 rounded-none border-l-2 px-4 py-2 font-tanker text-sm tracking-wide uppercase transition-colors hover:bg-foreground/10 aria-pressed:bg-[#ffc602]";
