// Registre d'identité (AD-1) : mint une seule fois l'id de Saveur (slug
// kebab-case), keyé sur l'id numérique WordPress de brets.fr (`bretsId`),
// qui reste stable même si le produit est renommé — contrairement au slug ou
// au nom, qui peuvent changer d'une exécution à l'autre du scraper.
function toKebabCase(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire les accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function resolveFlavorId(
  bretsId: number,
  currentSlug: string,
  registry: Record<string, string>,
): { id: string; registry: Record<string, string> } {
  const key = String(bretsId);
  const existing = registry[key];

  if (existing) {
    return { id: existing, registry };
  }

  const mintedId = toKebabCase(currentSlug);

  return { id: mintedId, registry: { ...registry, [key]: mintedId } };
}
