"use client";

// [Review] Défense en profondeur AD-4 : ce module touche `localStorage`
// directement. `index.ts` (qui l'importe) porte déjà `'use client'`, mais un
// import direct futur de ce fichier hors de `lib/catalogue/` doit lui aussi
// échouer explicitement à la compilation plutôt qu'à l'exécution.
import { parseCatalogue, type Catalogue } from "../schema";

// Namespace dédié pour éviter toute collision future avec la clé de
// l'État de dégustation (lib/tasted/, story 1.5, "crounch:tasted").
export const CATALOGUE_CACHE_KEY = "crounch:catalogue";

// Un cache absent, illisible, invalide contre le schéma, ou un accès
// `localStorage` qui échoue (Safari mode privé, etc.) sont tous traités
// comme "pas de cache" — jamais un throw (AD-3).
export function readCache(): Catalogue | null {
  let raw: string | null;

  try {
    raw = localStorage.getItem(CATALOGUE_CACHE_KEY);
  } catch {
    return null;
  }

  if (raw === null) {
    return null;
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return null;
  }

  const result = parseCatalogue(parsedJson);

  return result.success ? result.data : null;
}

// Appelée uniquement après validation réussie d'une réponse réseau — un
// échec d'écriture (quota dépassé, etc.) dégrade silencieusement vers
// "pas de persistance cette session", ne fait jamais planter le hook.
export function writeCache(catalogue: Catalogue): void {
  try {
    localStorage.setItem(CATALOGUE_CACHE_KEY, JSON.stringify(catalogue));
  } catch {
    // Dégradation silencieuse intentionnelle (Subtask 2.3).
  }
}
