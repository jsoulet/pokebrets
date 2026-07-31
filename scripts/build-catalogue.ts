import { parseCatalogue, type Catalogue, type Flavor, type ParseResult } from "../lib/schema";

// Construit l'objet Catalogue final (timestamp de génération strictement au
// moment de l'exécution) et le valide via `parseCatalogue` (lib/schema,
// story 1.2) avant toute écriture disque — AD-7 : aucun bypass possible.
export function buildAndValidateCatalogue(flavors: Flavor[]): ParseResult<Catalogue> {
  return parseCatalogue({
    generatedAt: new Date().toISOString(),
    flavors,
  });
}
