import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseCatalogue, type Catalogue } from "../lib/schema";

const PROJECT_ROOT = join(__dirname, "..");
const CATALOGUE_PATH = join(PROJECT_ROOT, "data", "catalogue.json");
const REGISTRY_PATH = join(PROJECT_ROOT, "scripts", "identity-registry.json");

function readJsonFile(path: string): unknown | null {
  if (!existsSync(path)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

// Un `data/catalogue.json` absent, illisible, ou invalide contre le schéma
// est traité comme "pas de Catalogue précédent" — jamais un crash. C'est le
// même principe de dégradation que côté app (AD-3), appliqué côté scraper.
export function readPreviousCatalogue(): Catalogue | null {
  const raw = readJsonFile(CATALOGUE_PATH);

  if (raw === null) {
    return null;
  }

  const result = parseCatalogue(raw);

  return result.success ? result.data : null;
}

export function readIdentityRegistry(): Record<string, string> {
  const raw = readJsonFile(REGISTRY_PATH);

  return (raw as Record<string, string> | null) ?? {};
}
