import type { Flavor, SortMode } from "../schema";

// Fonction pure : ne touche jamais `localStorage`, ne mute jamais le
// tableau d'entrée (celui-ci vient de `data/catalogue.json` via
// `useCatalogue()`, propriété de `lib/catalogue/`, AD-2). Le tri est un
// dérivé d'affichage, jamais une mutation des données (AD-1) — retourne
// toujours un nouveau tableau (Story 2.2, Dev Notes).
export function sortFlavors(
  flavors: Flavor[],
  mode: SortMode,
  getRating: (id: string) => number | undefined,
): Flavor[] {
  const compareAlphabetically = (a: Flavor, b: Flavor) =>
    a.name.localeCompare(b.name, "fr", { sensitivity: "base" });

  if (mode === "alphabetical") {
    return [...flavors].sort(compareAlphabetically);
  }

  // Mode "rating" : décroissant, saveurs non notées toujours après les
  // notées (repli à -1, jamais 0, pour qu'une note 1 étoile reste toujours
  // strictement avant une saveur non notée). À note égale, l'ordre
  // alphabétique sert de critère secondaire pour un résultat stable.
  return [...flavors].sort((a, b) => {
    const ratingA = getRating(a.id) ?? -1;
    const ratingB = getRating(b.id) ?? -1;

    if (ratingA !== ratingB) {
      return ratingB - ratingA;
    }

    return compareAlphabetically(a, b);
  });
}
