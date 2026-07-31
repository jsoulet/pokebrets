import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Catalogue } from "../lib/schema";

const PROJECT_ROOT = join(__dirname, "..");
const CATALOGUE_PATH = join(PROJECT_ROOT, "data", "catalogue.json");
const REGISTRY_PATH = join(PROJECT_ROOT, "scripts", "identity-registry.json");

export interface WriteCatalogueInput {
  catalogue: Catalogue;
  registry: Record<string, string>;
}

// N'écrit sur disque QUE si l'appelant a déjà validé le Catalogue via
// `buildAndValidateCatalogue` (AD-7) — cette fonction ne revalide rien, elle
// se contente d'écrire, dans l'ordre requis par la story : catalogue.json
// d'abord, puis le registre d'identité.
export function writeCatalogueFiles({ catalogue, registry }: WriteCatalogueInput): void {
  mkdirSync(dirname(CATALOGUE_PATH), { recursive: true });
  writeFileSync(CATALOGUE_PATH, `${JSON.stringify(catalogue, null, 2)}\n`, "utf-8");
  writeFileSync(REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`, "utf-8");
}
