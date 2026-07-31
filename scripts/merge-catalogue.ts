import { resolveFlavorId } from "./identity-registry";
import type { BretsProduct } from "./sources/brets";
import type { Catalogue, Flavor } from "../lib/schema";

export interface MergeSourcesInput {
  bretsProducts: BretsProduct[];
  previousCatalogue: Catalogue | null;
  registry: Record<string, string>;
}

export interface MergeSourcesResult {
  flavors: Flavor[];
  registry: Record<string, string>;
}

// Fusionne les données brets.fr (seule source, AD-5 révisé — Open Food Facts
// retiré, cf. revue de code story 1.9 : brets.fr suffit et une image absente
// est remplacée par un placeholder local, cf. scripts/sources/brets.ts) et
// respecte AD-1 (id stable, jamais de suppression — une Saveur disparue
// transitionne vers `archived`).
export function mergeSources(input: MergeSourcesInput): MergeSourcesResult {
  const { bretsProducts, previousCatalogue, registry } = input;

  let currentRegistry = registry;
  const activeIds = new Set<string>();

  const activeFlavors: Flavor[] = bretsProducts.map((product) => {
    const { id, registry: nextRegistry } = resolveFlavorId(
      product.bretsId,
      product.slug,
      currentRegistry,
    );
    currentRegistry = nextRegistry;
    activeIds.add(id);

    return {
      id,
      name: product.name,
      image: product.image,
      status: "active",
    };
  });

  const previousFlavors = previousCatalogue?.flavors ?? [];
  const archivedFlavors: Flavor[] = previousFlavors
    .filter((flavor) => !activeIds.has(flavor.id))
    .map((flavor) => ({ ...flavor, status: "archived" }));

  return {
    flavors: [...activeFlavors, ...archivedFlavors],
    registry: currentRegistry,
  };
}
