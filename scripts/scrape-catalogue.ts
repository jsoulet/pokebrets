import { fetchBretsProducts, type BretsProduct } from "./sources/brets";
import { readIdentityRegistry, readPreviousCatalogue } from "./read-state";
import { mergeSources } from "./merge-catalogue";
import { buildAndValidateCatalogue } from "./build-catalogue";
import { writeCatalogueFiles } from "./write-catalogue";
import type { Catalogue } from "../lib/schema";

export interface RunScrapeDeps {
  fetchBretsProducts: () => Promise<BretsProduct[]>;
  readPreviousCatalogue: () => Catalogue | null;
  readIdentityRegistry: () => Record<string, string>;
  writeCatalogueFiles: (input: { catalogue: Catalogue; registry: Record<string, string> }) => void;
}

export type RunScrapeResult =
  | { success: true; activeCount: number; archivedCount: number; mintedCount: number }
  | { success: false; error: string[] };

const defaultDeps: RunScrapeDeps = {
  fetchBretsProducts,
  readPreviousCatalogue,
  readIdentityRegistry,
  writeCatalogueFiles,
};

function toMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

// Orchestre le pipeline complet du scraper (Task 6/7) : fetch brets.fr →
// fusion (AD-1) → validation stricte (AD-7) → écriture atomique, uniquement
// en cas de succès. N'écrit jamais rien en cas d'échec réseau, de lecture
// d'état existant, ou de validation — les dépendances injectables permettent
// de tester ce chemin sans I/O réel (Subtask 7.5). Toute erreur, y compris
// I/O disque, est convertie en résultat exploitable (jamais un throw brut) —
// requis par la Subtask 1.3 (cf. revue de code story 1.9).
export async function runScrape(deps: RunScrapeDeps = defaultDeps): Promise<RunScrapeResult> {
  let previousRegistry: Record<string, string>;
  let previousCatalogue: Catalogue | null;

  try {
    previousRegistry = deps.readIdentityRegistry();
    previousCatalogue = deps.readPreviousCatalogue();
  } catch (cause) {
    return { success: false, error: [`Échec de lecture de l'état existant : ${toMessage(cause)}`] };
  }

  let bretsProducts: BretsProduct[];

  try {
    bretsProducts = await deps.fetchBretsProducts();
  } catch (cause) {
    return { success: false, error: [`Échec de récupération de brets.fr : ${toMessage(cause)}`] };
  }

  const { flavors, registry } = mergeSources({
    bretsProducts,
    previousCatalogue,
    registry: previousRegistry,
  });

  const validation = buildAndValidateCatalogue(flavors);

  if (!validation.success) {
    return { success: false, error: validation.error };
  }

  try {
    deps.writeCatalogueFiles({ catalogue: validation.data, registry });
  } catch (cause) {
    return { success: false, error: [`Échec d'écriture sur disque : ${toMessage(cause)}`] };
  }

  const activeCount = flavors.filter((flavor) => flavor.status === "active").length;
  const archivedCount = flavors.filter((flavor) => flavor.status === "archived").length;
  const mintedCount = Object.keys(registry).length - Object.keys(previousRegistry).length;

  return { success: true, activeCount, archivedCount, mintedCount };
}

async function main(): Promise<void> {
  try {
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
  } catch (cause) {
    // Filet de sécurité : ne devrait jamais être atteint (runScrape ne doit
    // jamais rejeter), mais garantit qu'aucune erreur inattendue ne ressort
    // jamais en stacktrace brut sur ce point d'entrée CLI (Subtask 1.3).
    console.error(`❌ Erreur inattendue : ${toMessage(cause)}`);
    process.exitCode = 1;
  }
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
