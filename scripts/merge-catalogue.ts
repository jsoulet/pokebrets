import { resolveFlavorId } from "./identity-registry";
import { resolveOffMatch } from "./sources/off";
import type { BretsProduct } from "./sources/brets";
import type { OffProduct } from "./sources/off";
import type { Catalogue, Flavor } from "../lib/schema";

export interface MergeSourcesInput {
  bretsProducts: BretsProduct[];
  offMatchingTable: Record<string, string>;
  offProducts: OffProduct[];
  previousCatalogue: Catalogue | null;
  registry: Record<string, string>;
}

export interface MergeSourcesResult {
  flavors: Flavor[];
  registry: Record<string, string>;
}

// Fusionne les sources en respectant AD-5 (brets.fr autoritaire, OFF en
// complément explicite uniquement) et AD-1 (id stable, jamais de suppression
// — une Saveur disparue transitionne vers `archived`).
export function mergeSources(input: MergeSourcesInput): MergeSourcesResult {
  const { bretsProducts, offMatchingTable, offProducts, previousCatalogue, registry } = input;

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

    // OFF ne comble QUE ce qui manquerait de brets.fr — aujourd'hui brets.fr
    // fournit toujours nom + image, donc ce chemin n'est jamais emprunté en
    // pratique, mais il est prévu pour les cas futurs.
    const offMatch = resolveOffMatch(product.bretsId, offMatchingTable, offProducts);

    return {
      id,
      name: product.name || offMatch?.name || "",
      image: product.image || offMatch?.image || "",
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
