import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Catalogue } from "../lib/schema";

const PROJECT_ROOT = join(__dirname, "..");
const CATALOGUE_PATH = join(PROJECT_ROOT, "data", "catalogue.json");
const REGISTRY_PATH = join(PROJECT_ROOT, "scripts", "identity-registry.json");

export interface WriteCatalogueInput {
  catalogue: Catalogue;
  registry: Record<string, string>;
}

function tmpPathFor(finalPath: string): string {
  return `${finalPath}.tmp-${process.pid}-${Date.now()}`;
}

// N'écrit sur disque QUE si l'appelant a déjà validé le Catalogue via
// `buildAndValidateCatalogue` (AD-7) — cette fonction ne revalide rien.
// Écriture atomique (Subtask 4.3/6.3 : "jamais d'écriture partielle") :
// chaque fichier est d'abord écrit intégralement sur un chemin temporaire,
// puis seulement renommé (opération atomique sur un même système de
// fichiers) vers sa destination finale — jamais d'écriture directe du
// fichier final. Si l'écriture d'un des deux temporaires échoue, aucun
// fichier final n'est touché (cf. revue de code story 1.9).
export function writeCatalogueFiles({ catalogue, registry }: WriteCatalogueInput): void {
  mkdirSync(dirname(CATALOGUE_PATH), { recursive: true });

  const catalogueTmp = tmpPathFor(CATALOGUE_PATH);
  const registryTmp = tmpPathFor(REGISTRY_PATH);

  writeFileSync(catalogueTmp, `${JSON.stringify(catalogue, null, 2)}\n`, "utf-8");
  writeFileSync(registryTmp, `${JSON.stringify(registry, null, 2)}\n`, "utf-8");

  renameSync(catalogueTmp, CATALOGUE_PATH);
  renameSync(registryTmp, REGISTRY_PATH);
}
