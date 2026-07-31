import { fetchBretsProducts, type BretsProduct } from "./sources/brets";
import { fetchOffProducts, type OffProduct } from "./sources/off";
import { readIdentityRegistry, readOffMatchingTable, readPreviousCatalogue } from "./read-state";
import { mergeSources } from "./merge-catalogue";
import { buildAndValidateCatalogue } from "./build-catalogue";
import { writeCatalogueFiles } from "./write-catalogue";
import type { Catalogue } from "../lib/schema";

export interface RunScrapeDeps {
  fetchBretsProducts: () => Promise<BretsProduct[]>;
  fetchOffProducts: () => Promise<OffProduct[]>;
  readPreviousCatalogue: () => Catalogue | null;
  readIdentityRegistry: () => Record<string, string>;
  readOffMatchingTable: () => Record<string, string>;
  writeCatalogueFiles: (input: { catalogue: Catalogue; registry: Record<string, string> }) => void;
}

export type RunScrapeResult =
  | { success: true; activeCount: number; archivedCount: number; mintedCount: number }
  | { success: false; error: string[] };

const defaultDeps: RunScrapeDeps = {
  fetchBretsProducts,
  fetchOffProducts,
  readPreviousCatalogue,
  readIdentityRegistry,
  readOffMatchingTable,
  writeCatalogueFiles,
};

// Orchestre le pipeline complet du scraper (Task 6/7) : fetch des deux
// sources → fusion (AD-1/AD-5) → validation stricte (AD-7) → écriture
// atomique, uniquement en cas de succès. N'écrit jamais rien en cas
// d'échec réseau ou de validation — les dépendances injectables permettent
// de tester ce chemin sans I/O réel (Subtask 7.5).
export async function runScrape(deps: RunScrapeDeps = defaultDeps): Promise<RunScrapeResult> {
  const previousRegistry = deps.readIdentityRegistry();
  const offMatchingTable = deps.readOffMatchingTable();
  const previousCatalogue = deps.readPreviousCatalogue();

  let bretsProducts: BretsProduct[];

  try {
    bretsProducts = await deps.fetchBretsProducts();
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return { success: false, error: [`Échec de récupération de brets.fr : ${message}`] };
  }

  // Open Food Facts n'est jamais autoritaire (AD-5) : une indisponibilité
  // de cette source ne doit pas bloquer la mise à jour du Catalogue, elle
  // dégrade simplement le complément (aucun fallback nom/image utilisé).
  let offProducts: OffProduct[];

  try {
    offProducts = await deps.fetchOffProducts();
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    console.warn(`⚠️ Open Food Facts indisponible, poursuite sans complément : ${message}`);
    offProducts = [];
  }

  const { flavors, registry } = mergeSources({
    bretsProducts,
    offMatchingTable,
    offProducts,
    previousCatalogue,
    registry: previousRegistry,
  });

  const validation = buildAndValidateCatalogue(flavors);

  if (!validation.success) {
    return { success: false, error: validation.error };
  }

  deps.writeCatalogueFiles({ catalogue: validation.data, registry });

  const activeCount = flavors.filter((flavor) => flavor.status === "active").length;
  const archivedCount = flavors.filter((flavor) => flavor.status === "archived").length;
  const mintedCount = Object.keys(registry).length - Object.keys(previousRegistry).length;

  return { success: true, activeCount, archivedCount, mintedCount };
}

async function main(): Promise<void> {
  const result = await runScrape();

  if (!result.success) {
    for (const message of result.error) {
      console.error(`❌ ${message}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `✅ Catalogue mis à jour : ${result.activeCount} actives, ${result.archivedCount} archivées, ${result.mintedCount} nouvel(les) id(s) minté(s).`,
  );
}

const isMain = (() => {
  try {
    return import.meta.url === `file://${process.argv[1]}`;
  } catch {
    return false;
  }
})();

if (isMain) {
  main();
}
