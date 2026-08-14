// Style partagé "bouton pilule" repris du site brets.fr (fond jaune actif,
// contour + ombre portée dure noirs, police display Tanker) — utilisé par
// `SortControl` (tri) et `UntastedFilterToggle` (filtre) pour une DA
// cohérente entre les deux contrôles de la toolbar du Catalogue (Story
// 2.2/2.3). `aria-pressed:` (pas `data-[state=on]:`) car les primitives
// @base-ui/react `Toggle`/`ToggleGroupItem` exposent l'état pressé via
// l'attribut ARIA natif, jamais via un `data-state` façon Radix.
export const PILL_BUTTON_CLASSNAME =
  "border-foreground bg-background rounded-2xl border-2 px-4 py-2 font-tanker text-sm tracking-wide uppercase shadow-[3px_3px_0px_var(--foreground)] transition-transform hover:-translate-y-0.5 aria-pressed:bg-[#ffc602] active:translate-y-0.5 active:shadow-[1px_1px_0px_var(--foreground)]";
